/**
 * 采购订单服务实现
 * 处理采购订单的创建、管理、状态跟踪等功能
 */

import { 
  PurchaseOrder, 
  PurchaseOrderItem,
  CreateWarehouseDTO
} from '../models/inventory.model';
import { IPurchaseOrderService } from './interfaces';
import { supabase } from '@/lib/supabase';
// UUID生成函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class PurchaseOrderService implements IPurchaseOrderService {
  
  /**
   * 创建采购订单
   */
  async createPurchaseOrder(
    items: Array<{
      productId: string;
      quantity: number;
      supplierId: string;
      unitPrice: number;
    }>,
    warehouseId: string
  ): Promise<PurchaseOrder> {
    try {
      // 计算总金?
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      // 生成订单?
      const orderNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // 创建采购订单
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
          id: generateUUID(),
          order_number: orderNumber,
          supplier_id: items[0].supplierId, // 暂时取第一个供应商
          warehouse_id: warehouseId,
          items: items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice
          } as any)),
          total_amount: totalAmount,
          currency: 'CNY',
          status: 'pending',
          expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认7天后
          created_by: 'system', // TODO: 从认证上下文获取用户ID
          created_at: new Date(),
          updated_at: new Date()
        }) as any
        .select()
        .single();

      if (error) {
        throw new Error(`创建采购订单失败: ${error.message}`);
      }

      return this.mapToPurchaseOrder(data);

    } catch (error) {
      console.error('创建采购订单错误:', error);
      throw error;
    }
  }

  /**
   * 获取采购订单
   */
  async getPurchaseOrder(orderId: string): Promise<PurchaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name, contact_person, phone),
          warehouse:warehouses(name, address)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`查询采购订单失败: ${error.message}`);
      }

      return this.mapToPurchaseOrder(data);

    } catch (error) {
      console.error('获取采购订单错误:', error);
      throw error;
    }
  }

  /**
   * 查询采购订单列表
   */
  async listPurchaseOrders(filters?: {
    supplierId?: string;
    warehouseId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<PurchaseOrder[]> {
    try {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name, contact_person),
          warehouse:warehouses(name)
        `);

      // 添加过滤条件
      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }

      if (filters?.warehouseId) {
        query = query.eq('warehouse_id', filters.warehouseId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      // 排序
      query = query.order('created_at', { ascending: false });

      // 分页
      if (filters?.limit) {
        const offset = filters.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询采购订单列表失败: ${error.message}`);
      }

      return data.map(this.mapToPurchaseOrder);

    } catch (error) {
      console.error('查询采购订单列表错误:', error);
      throw error;
    }
  }

  /**
   * 确认采购订单
   */
  async confirmOrder(orderId: string): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date()
        } as any)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`确认采购订单失败: ${error.message}`);
      }

      return this.mapToPurchaseOrder(data);

    } catch (error) {
      console.error('确认采购订单错误:', error);
      throw error;
    }
  }

  /**
   * 更新订单状?
   */
  async updateOrderStatus(orderId: string, status: string, remarks?: string): Promise<PurchaseOrder> {
    try {
      const updates: any = {
        status: status,
        updated_at: new Date()
      };

      // 如果是收货状态，记录实际收货时间
      if (status === 'received') {
        updates.actual_delivery_date = new Date();
      }

      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`更新订单状态失? ${error.message}`);
      }

      // 记录状态变更历?
      await supabase
        .from('purchase_order_status_history')
        .insert({
          id: generateUUID(),
          order_id: orderId,
          status_from: '', // 需要先查询当前状?
          status_to: status,
          remarks: remarks || '',
          created_at: new Date()
        } as any);

      return this.mapToPurchaseOrder(data);

    } catch (error) {
      console.error('更新订单状态错?', error);
      throw error;
    }
  }

  /**
   * 取消采购订单
   */
  async cancelOrder(orderId: string, reason: string): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date()
        } as any)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`取消采购订单失败: ${error.message}`);
      }

      return this.mapToPurchaseOrder(data);

    } catch (error) {
      console.error('取消采购订单错误:', error);
      throw error;
    }
  }

  /**
   * 获取待处理订单统?
   */
  async getOrderStatistics(): Promise<{
    pending: number;
    confirmed: number;
    shipping: number;
    received: number;
    cancelled: number;
    totalAmount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('status, total_amount');

      if (error) {
        throw new Error(`获取订单统计失败: ${error.message}`);
      }

      const stats = {
        pending: 0,
        confirmed: 0,
        shipping: 0,
        received: 0,
        cancelled: 0,
        totalAmount: 0
      };

      data.forEach(order => {
        stats[order.status as keyof typeof stats] = (stats[order.status as keyof typeof stats] || 0) + 1;
        if (order.status !== 'cancelled') {
          stats.totalAmount += order.total_amount;
        }
      }) as any;

      return stats;

    } catch (error) {
      console.error('获取订单统计错误:', error);
      throw error;
    }
  }

  /**
   * 将数据库数据映射为PurchaseOrder对象
   */
  private mapToPurchaseOrder(data: any): PurchaseOrder {
    return {
      id: data.id,
      orderNumber: data.order_number,
      supplierId: data.supplier_id,
      warehouseId: data.warehouse_id,
      items: data.items.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      totalAmount: data.total_amount,
      currency: data.currency,
      status: data.status,
      expectedDeliveryDate: new Date(data.expected_delivery_date),
      actualDeliveryDate: data.actual_delivery_date ? new Date(data.actual_delivery_date) : null,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}