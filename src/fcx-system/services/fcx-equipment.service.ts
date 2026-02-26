/**
 * FCX兑换配件服务
 * 处理维修店使用FCX积分兑换配件的业务逻辑
 */

import { 
  WarehouseRecommendation,
  ProductCategory
} from '../../supply-chain/models/inventory.model';
import { RecommendationService } from '../../supply-chain/services/recommendation.service';
import { WarehouseService } from '../../supply-chain/services/warehouse.service';
import { InventoryService } from '../../supply-chain/services/inventory.service';
import { WMSManager } from '@/lib/warehouse/wms-manager';
import { supabase } from '@/lib/supabase';

interface FcxExchangeRequest {
  repairShopId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    fcxPrice: number;  // FCX单价
  }>;
  userLocation?: {
    lat: number;
    lng: number;
  };
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

interface FcxExchangeResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  totalFcxCost: number;
  warehouseId: string;
  estimatedDeliveryTime: number; // 小时
  message: string;
  transactionId?: string;
}

interface ReservationResult {
  success: boolean;
  reservationIds: string[];
  failedItems: string[];
}

interface DeductionResult {
  success: boolean;
  transactionId?: string;
}

interface OrderCreationResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

interface WmsNotificationResult {
  success: boolean;
  wmsOrderId?: string;
  error?: string;
}

export class FcxEquipmentService {
  private recommendationService: RecommendationService;
  private warehouseService: WarehouseService;
  private wmsManager: WMSManager;
  private inventoryService: InventoryService;

  constructor() {
    this.recommendationService = new RecommendationService();
    this.warehouseService = new WarehouseService();
    this.wmsManager = new WMSManager();
    this.inventoryService = new InventoryService();
  }

  /**
   * FCX兑换配件主流程
   */
  async exchangeEquipment(request: FcxExchangeRequest): Promise<FcxExchangeResult> {
    try {
      // 1. 验证用户FCX余额
      const userFcxBalance = await this.getUserFcxBalance(request.userId);
      const totalFcxCost = request.items.reduce((sum, item) => sum + (item.fcxPrice * item.quantity), 0);

      if (userFcxBalance < totalFcxCost) {
        return {
          success: false,
          totalFcxCost,
          warehouseId: '',
          estimatedDeliveryTime: 0,
          message: `FCX余额不足，当前余额: ${userFcxBalance}, 所需: ${totalFcxCost}`
        };
      }

      // 2. 智能推荐最优仓库
      const productIds = request.items.map(item => item.productId);
      let warehouseId: string;
      let deliveryTime: number;

      if (request.userLocation) {
        // 基于位置推荐
        const recommendations = await this.recommendationService.recommendWarehouses({
          userLocation: {
            coordinates: {
              lat: request.userLocation.lat,
              lng: request.userLocation.lng
            },
            address: ''
          },
          productIds: productIds
        });
        
        if (recommendations.length === 0) {
          return {
            success: false,
            totalFcxCost,
            warehouseId: '',
            estimatedDeliveryTime: 0,
            message: '附近仓库暂无库存'
          };
        }

        const bestWarehouse = recommendations[0]; // 选择得分最高的仓库
        warehouseId = bestWarehouse.warehouseId;
        deliveryTime = (bestWarehouse as any).delivery_time || 24;
      } else {
        // 默认选择主仓库
        const defaultWarehouse = await this.getDefaultWarehouse();
        if (!defaultWarehouse) {
          return {
            success: false,
            totalFcxCost,
            warehouseId: '',
            estimatedDeliveryTime: 0,
            message: '未找到可用仓库'
          };
        }
        warehouseId = defaultWarehouse.id;
        deliveryTime = 24; // 默认24小时
      }

      // 3. 预留库存
      const reservationResult = await this.reserveInventory(
        request.items,
        warehouseId
      );

      if (!reservationResult.success) {
        return {
          success: false,
          totalFcxCost,
          warehouseId,
          estimatedDeliveryTime: deliveryTime,
          message: `库存预留失败: ${reservationResult.failedItems.join(', ')}`
        };
      }

      // 4. 扣除FCX积分
      const deductionResult = await this.deductFcxPoints(
        request.userId,
        totalFcxCost,
        `兑换配件: ${request.items.map(i => i.productId).join(', ')}`
      );

      if (!deductionResult.success) {
        // 扣除失败，释放预留库存
        await this.releaseInventoryReservation(reservationResult.reservationIds);
        return {
          success: false,
          totalFcxCost,
          warehouseId,
          estimatedDeliveryTime: deliveryTime,
          message: 'FCX扣除失败，请稍后重试',
          transactionId: deductionResult.transactionId
        };
      }

      // 5. 创建兑换订单
      const orderResult = await this.createExchangeOrder(
        request,
        warehouseId,
        totalFcxCost,
        deliveryTime,
        deductionResult.transactionId!
      );

      if (!orderResult.success) {
        // 订单创建失败，回滚操作
        await this.releaseInventoryReservation(reservationResult.reservationIds);
        await this.refundFcxPoints(request.userId, totalFcxCost, deductionResult.transactionId!);
        return {
          success: false,
          totalFcxCost,
          warehouseId,
          estimatedDeliveryTime: deliveryTime,
          message: '订单创建失败: ' + orderResult.error
        };
      }

      // 6. 通知WMS系统创建发货单
      const wmsResult = await this.notifyWmsForShipment(
        orderResult.orderId!,
        request.items,
        warehouseId,
        request.shippingAddress
      );

      // 7. 更新订单状态
      if (wmsResult.success) {
        await this.updateOrderStatus(orderResult.orderId!, 'processing', {
          wmsOrderId: wmsResult.wmsOrderId
        });
      }

      return {
        success: true,
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        totalFcxCost,
        warehouseId,
        estimatedDeliveryTime: deliveryTime,
        message: '兑换成功，订单已创建并通知仓库处理',
        transactionId: deductionResult.transactionId
      };

    } catch (error) {
      console.error('FCX兑换配件错误:', error);
      return {
        success: false,
        totalFcxCost: 0,
        warehouseId: '',
        estimatedDeliveryTime: 0,
        message: '兑换过程出现错误: ' + (error as Error).message
      };
    }
  }

  /**
   * 获取用户FCX余额
   */
  private async getUserFcxBalance(userId: string): Promise<number> {
    try {
      // 这里应该调用FCX账户服务
      // 暂时返回模拟数据
      const { data, error } = await supabase
        .from('profiles')
        .select('fcx_balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('获取FCX余额失败，使用默认值');
        return 1000; // 默认1000 FCX
      }

      return data?.fcx_balance || 0;
    } catch (error) {
      console.error('获取用户FCX余额错误:', error);
      return 0;
    }
  }

  /**
   * 扣除FCX积分
   */
  private async deductFcxPoints(
    userId: string,
    amount: number,
    description: string
  ): Promise<DeductionResult> {
    try {
      // 记录FCX交易
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error: transactionError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: transactionId,
          user_id: userId,
          amount: -amount, // 负数表示扣除
          type: 'exchange_equipment',
          description: description,
          created_at: new Date()
        } as any);

      if (transactionError) {
        console.error('记录FCX交易失败:', transactionError);
        return { success: false };
      }

      // 更新用户余额
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          fcx_balance: (await this.getUserFcxBalance(userId)) - amount
        } as any)
        .eq('id', userId);

      if (updateError) {
        return { success: false };
      }

      return { success: true, transactionId };

    } catch (error) {
      console.error('扣除FCX积分错误:', error);
      return { success: false };
    }
  }

  /**
   * 预留库存
   */
  private async reserveInventory(
    items: Array<{ productId: string; quantity: number }> ,
    warehouseId: string
  ): Promise<ReservationResult> {
    try {
      const reservationIds: string[] = [];
      const failedItems: string[] = [];
  
      for (const item of items) {
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory_records')
          .select('available_quantity, reserved_quantity')
          .eq('product_id', item.productId)
          .eq('warehouse_id', warehouseId)
          .single();
  
        if (inventoryError || !inventory || inventory.available_quantity < item.quantity) {
          failedItems.push(item.productId);
          continue;
        }
  
        // 创建库存预留记录
        const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { error: reservationError } = await supabase
          .from('inventory_reservations')
          .insert({
            id: reservationId,
            part_id: item.productId,
            warehouse_id: warehouseId,
            quantity: item.quantity,
            reservation_type: 'fcx_exchange',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
            status: 'active'
          } as any);
  
        if (reservationError) {
          failedItems.push(item.productId);
        } else {
          reservationIds.push(reservationId);
            
          // 更新库存记录中的预留数量
          await supabase
            .from('inventory_records')
            .update({
              reserved_quantity: inventory.reserved_quantity + item.quantity,
              available_quantity: inventory.available_quantity - item.quantity
            } as any)
            .eq('product_id', item.productId)
            .eq('warehouse_id', warehouseId);
        }
      }
  
      return {
        success: failedItems.length === 0,
        reservationIds,
        failedItems
      };
  
    } catch (error) {
      console.error('预留库存错误:', error);
      return {
        success: false,
        reservationIds: [],
        failedItems: items.map(item => item.productId)
      };
    }
  }

  /**
   * 释放库存预留
   */
  private async releaseInventoryReservation(reservationIds: string[]): Promise<void> {
    try {
      for (const reservationId of reservationIds) {
        // 更新预留状态为已取消
        await supabase
          .from('inventory_reservations')
          .update({ status: 'cancelled' } as any)
          .eq('id', reservationId);
  
        // 恢复库存数量
        const { data: reservation } = await supabase
          .from('inventory_reservations')
          .select('part_id, warehouse_id, quantity')
          .eq('id', reservationId)
          .single();
  
        if (reservation) {
          const { data: inventory } = await supabase
            .from('inventory_records')
            .select('reserved_quantity, available_quantity')
            .eq('product_id', reservation.part_id)
            .eq('warehouse_id', reservation.warehouse_id)
            .single();
  
          if (inventory) {
            await supabase
              .from('inventory_records')
              .update({
                reserved_quantity: inventory.reserved_quantity - reservation.quantity,
                available_quantity: inventory.available_quantity + reservation.quantity
              } as any)
              .eq('product_id', reservation.part_id)
              .eq('warehouse_id', reservation.warehouse_id);
          }
        }
      }
    } catch (error) {
      console.error('释放库存预留错误:', error);
    }
  }
  
  /**
   * 退款FCX积分
   */
  private async refundFcxPoints(
    userId: string,
    amount: number,
    originalTransactionId: string
  ): Promise<boolean> {
    try {
      // 记录退款交易
      const refundTransactionId = `rf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error: transactionError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: refundTransactionId,
          user_id: userId,
          amount: amount, // 正数表示退回
          type: 'refund',
          description: `FCX兑换退款: ${originalTransactionId} as any`,
          reference_id: originalTransactionId,
          created_at: new Date()
        });
  
      if (transactionError) {
        console.error('记录FCX退款交易失败:', transactionError);
        return false;
      }
  
      // 更新用户余额
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          fcx_balance: (await this.getUserFcxBalance(userId)) + amount
        } as any)
        .eq('id', userId);
  
      return !updateError;
  
    } catch (error) {
      console.error('退款FCX积分错误:', error);
      return false;
    }
  }
  
  /**
   * 创建兑换订单
   */
  private async createExchangeOrder(
    request: FcxExchangeRequest,
    warehouseId: string,
    totalFcxCost: number,
    estimatedDeliveryTime: number,
    transactionId: string
  ): Promise<OrderCreationResult> {
    try {
      // 生成订单编号
      const orderNumber = `FXE${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
      // 创建主订单
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error: orderError } = await supabase
        .from('fcx_exchange_orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          repair_shop_id: request.repairShopId,
          user_id: request.userId,
          total_fcx_cost: totalFcxCost,
          total_items: request.items.reduce((sum, item) => sum + item.quantity, 0),
          warehouse_id: warehouseId,
          status: 'pending',
          estimated_delivery_time: estimatedDeliveryTime,
          shipping_address: request.shippingAddress ? JSON.stringify(request.shippingAddress) : null
        } as any);
  
      if (orderError) {
        return { success: false, error: `创建订单失败: ${orderError.message}` };
      }
  
      // 创建订单详情
      for (const item of request.items) {
        const orderItemId = `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { error: itemError } = await supabase
          .from('fcx_exchange_order_items')
          .insert({
            id: orderItemId,
            order_id: orderId,
            part_id: item.productId,
            quantity: item.quantity,
            fcx_unit_price: item.fcxPrice,
            subtotal_fcx: item.quantity * item.fcxPrice,
            status: 'pending'
          } as any);
  
        if (itemError) {
          return { success: false, error: `创建订单详情失败: ${itemError.message}` };
        }
      }
  
      // 关联FCX交易记录
      const { error: exchangeTxError } = await supabase
        .from('fcx_exchange_transactions')
        .insert({
          transaction_id: transactionId,
          order_id: orderId,
          exchange_type: 'equipment'
        } as any);
  
      if (exchangeTxError) {
        console.warn('关联FCX交易记录失败:', exchangeTxError);
      }
  
      return { success: true, orderId, orderNumber };
  
    } catch (error) {
      console.error('创建兑换订单错误:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 通知WMS系统创建发货单
   */
  private async notifyWmsForShipment(
    orderId: string,
    items: Array<{ productId: string; quantity: number; fcxPrice: number }> ,
    warehouseId: string,
    shippingAddress?: any
  ): Promise<WmsNotificationResult> {
    try {
      // 获取仓库信息
      const { data: warehouse } = await supabase
        .from('warehouses')
        .select('name, integration_info')
        .eq('id', warehouseId)
        .single();
  
      if (!warehouse) {
        return { success: false, error: '仓库信息不存在' };
      }
  
      // 模拟WMS系统调用
      // 在实际项目中这里会调用具体的WMS API
      const wmsOrderId = `WMS-${orderId}`;
        
      // 记录WMS通知日志
      console.log(`通知WMS系统创建发货单: 订单ID=${orderId}, WMS订单ID=${wmsOrderId}`);
      console.log(`发货商品:`, items);
      console.log(`收货地址:`, shippingAddress);
  
      // 模拟成功响应
      return { success: true, wmsOrderId };
  
    } catch (error) {
      console.error('通知WMS系统错误:', error);
      return { success: false, error: (error as Error).message };
    }
  }
  
  /**
   * 更新订单状态
   */
  private async updateOrderStatus(
    orderId: string,
    status: string,
    extraData?: any
  ): Promise<void> {
    try {
      const updateData: any = { status, updated_at: new Date() };
        
      if (extraData?.wmsOrderId) {
        updateData.wms_order_id = extraData.wmsOrderId;
      }
  
      await supabase
        .from('fcx_exchange_orders')
        .update(updateData)
        .eq('id', orderId);
    } catch (error) {
      console.error('更新订单状态错误:', error);
    }
  }

  /**
   * 获取当前可用库存
   */
  private async getCurrentInventory(productId: string, warehouseId: string): Promise<number> {
    const { data } = await supabase
      .from('inventory_records')
      .select('available_quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .single();
    
    return data?.available_quantity || 0;
  }

  /**
   * 获取已预订库存
   */
  private async getReservedInventory(productId: string, warehouseId: string): Promise<number> {
    const { data } = await supabase
      .from('inventory_records')
      .select('reserved_quantity')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .single();
    
    return data?.reserved_quantity || 0;
  }

  /**
   * 获取默认仓库
   */
  private async getDefaultWarehouse(): Promise<any> {
    const { data } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    return data;
  }

  /**
   * 获取FCX兑换历史
   */
  async getExchangeHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('fcx_transactions')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('type', 'exchange_equipment')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取兑换历史失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取FCX兑换历史错误:', error);
      return [];
    }
  }

  /**
   * 获取可兑换配件列表
   */
  async getAvailableEquipment(category?: ProductCategory): Promise<any[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          inventory:inventory_records(
            warehouse_id,
            available_quantity,
            fcx_price
          )
        `)
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('获取可兑换配件失败:', error);
        return [];
      }

      // 过滤有库存且有FCX价格的商品
      return (data || []).filter(product => 
        product.inventory?.some((inv: any) => inv.available_quantity > 0 && inv.fcx_price > 0)
      );
    } catch (error) {
      console.error('获取可兑换配件错误:', error);
      return [];
    }
  }
}