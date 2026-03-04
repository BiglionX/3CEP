/**
 * WMS发货通知服务
 * 负责通知仓库管理系统创建发货单并跟踪物流状? */
import { supabase } from '@/lib/supabase';
import { WMSManager } from '@/lib/warehouse/wms-manager';

interface ShipmentRequest {
  orderId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    sku?: string;
  }>;
  warehouseId: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  logisticsProvider?: string;
  priority?: 'normal' | 'urgent' | 'express';
  estimatedDeliveryDate?: Date;
}

interface ShipmentResult {
  success: boolean;
  wmsOrderId?: string;
  trackingNumber?: string;
  errorMessage?: string;
  shipmentDetails?: any;
}

interface ShipmentTracking {
  wmsOrderId: string;
  status: 'created' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  lastUpdated: Date;
}

export class WmsShipmentService {
  private wmsManager: WMSManager;

  constructor() {
    this.wmsManager = new WMSManager();
  }

  /**
   * 创建发货单并通知WMS系统
   */
  async createShipment(request: ShipmentRequest): Promise<ShipmentResult> {
    try {
      // 1. 获取仓库WMS连接信息
      const warehouseConnection = await this.getWarehouseWmsConnection(
        request.warehouseId
      );
      if (!warehouseConnection) {
        return {
          success: false,
          errorMessage: '未找到仓库的WMS连接配置',
        };
      }

      // 2. 构造WMS发货单数?      const wmsShipmentData = this.buildWmsShipmentData(request);

      // 3. 调用WMS系统API创建发货?      const wmsResult = await this.callWmsApi(
        warehouseConnection,
        '/api/orders/create-outbound',
        wmsShipmentData
      );

      if (!wmsResult.success) {
        return {
          success: false,
          errorMessage: wmsResult.errorMessage || 'WMS系统创建发货单失?,
        };
      }

      // 4. 更新本地订单状?      const updateResult = await this.updateLocalOrderStatus(
        request.orderId,
        'processing',
        {
          wmsOrderId: wmsResult.wmsOrderId,
          trackingNumber: wmsResult.trackingNumber,
        }
      );

      if (!updateResult.success) {
        console.warn('更新本地订单状态失?', updateResult.errorMessage);
      }

      // 5. 记录发货通知日志
      await this.recordShipmentNotification({
        orderId: request.orderId,
        wmsOrderId: wmsResult.wmsOrderId!,
        warehouseId: request.warehouseId,
        items: request.items,
        shippingAddress: request.shippingAddress,
        status: 'notified',
      });

      return {
        success: true,
        wmsOrderId: wmsResult.wmsOrderId,
        trackingNumber: wmsResult.trackingNumber,
        shipmentDetails: wmsResult.details,
      };
    } catch (error) {
      console.error('创建发货单错?', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 查询发货状?   */
  async getShipmentStatus(
    wmsOrderId: string
  ): Promise<ShipmentTracking | null> {
    try {
      // 1. 从本地数据库查询
      const { data: localTracking, error: localError } = await supabase
        .from('shipment_tracking')
        .select('*')
        .eq('wms_order_id', wmsOrderId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (localError) {
        console.error('查询本地发货跟踪失败:', localError.message);
      }

      if (localTracking) {
        return {
          wmsOrderId: localTracking.wms_order_id,
          status: localTracking.status,
          trackingNumber: localTracking.tracking_number,
          carrier: localTracking.carrier,
          estimatedDelivery: localTracking.estimated_delivery
            ? new Date(localTracking.estimated_delivery)
            : undefined,
          actualDelivery: localTracking.actual_delivery
            ? new Date(localTracking.actual_delivery)
            : undefined,
          lastUpdated: new Date(localTracking.updated_at),
        };
      }

      // 2. 如果本地没有，尝试从WMS系统查询
      const wmsTracking = await this.queryWmsShipmentStatus(wmsOrderId);
      if (wmsTracking) {
        // 同步到本地数据库
        await this.syncWmsTrackingToLocal(wmsTracking);
        return wmsTracking;
      }

      return null;
    } catch (error) {
      console.error('查询发货状态错?', error);
      return null;
    }
  }

  /**
   * 批量查询发货状?   */
  async getBatchShipmentStatus(
    wmsOrderIds: string[]
  ): Promise<Record<string, ShipmentTracking>> {
    const results: Record<string, ShipmentTracking> = {};

    for (const wmsOrderId of wmsOrderIds) {
      const tracking = await this.getShipmentStatus(wmsOrderId);
      if (tracking) {
        results[wmsOrderId] = tracking;
      }
    }

    return results;
  }

  /**
   * 更新物流跟踪信息
   */
  async updateShipmentTracking(trackingData: {
    wmsOrderId: string;
    status: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    locationUpdates?: Array<{
      timestamp: Date;
      location: string;
      status: string;
      remark?: string;
    }>;
  }): Promise<boolean> {
    try {
      // 1. 更新本地跟踪记录
      const { error: updateError } = await supabase
        .from('shipment_tracking')
        .insert({
          wms_order_id: trackingData.wmsOrderId,
          status: trackingData.status,
          tracking_number: trackingData.trackingNumber,
          carrier: trackingData.carrier,
          estimated_delivery: trackingData.estimatedDelivery,
          actual_delivery: trackingData.actualDelivery,
          location_updates: trackingData.locationUpdates || [],
          updated_at: new Date(),
        } as any);

      if (updateError) {
        console.error('更新发货跟踪失败:', updateError.message);
        return false;
      }

      // 2. 更新关联的兑换订单状?      await this.updateRelatedExchangeOrderStatus(
        trackingData.wmsOrderId,
        trackingData.status
      );

      // 3. 发送通知给用户（如果需要）
      if (['shipped', 'delivered'].includes(trackingData.status)) {
        await this.sendShipmentNotification(trackingData);
      }

      return true;
    } catch (error) {
      console.error('更新物流跟踪错误:', error);
      return false;
    }
  }

  /**
   * 处理WMS系统回调
   */
  async handleWmsCallback(callbackData: any): Promise<boolean> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('收到WMS回调:', callbackData)// 验证回调签名（如果WMS提供了签名机制）
      if (!(await this.verifyWmsCallbackSignature(callbackData))) {
        console.error('WMS回调签名验证失败');
        return false;
      }

      // 处理不同的回调事件类?      switch (callbackData.eventType) {
        case 'ORDER_CREATED':
          return await this.handleOrderCreatedCallback(callbackData);
        case 'ORDER_SHIPPED':
          return await this.handleOrderShippedCallback(callbackData);
        case 'ORDER_DELIVERED':
          return await this.handleOrderDeliveredCallback(callbackData);
        case 'ORDER_CANCELLED':
          return await this.handleOrderCancelledCallback(callbackData);
        default:
          console.warn('未知的WMS回调事件类型:', callbackData.eventType);
          return true;
      }
    } catch (error) {
      console.error('处理WMS回调错误:', error);
      return false;
    }
  }

  /**
   * 获取仓库的WMS连接配置
   */
  private async getWarehouseWmsConnection(warehouseId: string) {
    const { data, error } = await supabase
      .from('warehouses')
      .select('id, integration_info')
      .eq('id', warehouseId)
      .single();

    if (error) {
      console.error('获取仓库WMS连接失败:', error.message);
      return null;
    }

    const integrationInfo = data.integration_info as any;
    if (!integrationInfo?.wmsProvider || !integrationInfo?.apiKey) {
      return null;
    }

    // 查找对应的WMS连接
    const { data: connection, error: connError } = await supabase
      .from('wms_connections')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .eq('is_active', true)
      .single();

    if (connError) {
      console.error('获取WMS连接失败:', connError.message);
      return null;
    }

    return connection;
  }

  /**
   * 构造发送给WMS系统的发货单数据
   */
  private buildWmsShipmentData(request: ShipmentRequest): any {
    return {
      orderReference: request.orderId,
      customerInfo: {
        name: request.shippingAddress.name,
        phone: request.shippingAddress.phone,
        email: '', // 如果有用户邮箱的?      },
      shippingAddress: {
        street: request.shippingAddress.address,
        city: request.shippingAddress.city,
        state: request.shippingAddress.province,
        postalCode: request.shippingAddress.postalCode,
        country: request.shippingAddress.country,
      },
      items: request.items.map(
        item =>
          ({
            sku: item.sku || item.productId,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: 0, // FCX兑换不需要价?          }) as any
      ),
      logistics: {
        provider: request.logisticsProvider || 'default',
        serviceLevel: request.priority || 'normal',
        deliveryDate: request.estimatedDeliveryDate,
      },
      orderType: 'FCX_EXCHANGE', // 标识为FCX兑换订单
      notes: 'FCX积分兑换配件订单',
    };
  }

  /**
   * 更新本地订单状?   */
  private async updateLocalOrderStatus(
    orderId: string,
    status: string,
    extraData?: any
  ): Promise<{ success: boolean; errorMessage?: string }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      if (extraData?.wmsOrderId) {
        updateData.wms_order_id = extraData.wmsOrderId;
      }

      if (extraData?.trackingNumber) {
        updateData.tracking_number = extraData.trackingNumber;
      }

      const { error } = await supabase
        .from('fcx_exchange_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        return {
          success: false,
          errorMessage: `更新订单状态失? ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 记录发货通知日志
   */
  private async recordShipmentNotification(notification: any): Promise<void> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await supabase.from('shipment_notifications').insert({
        id: notificationId,
        order_id: notification.orderId,
        wms_order_id: notification.wmsOrderId,
        warehouse_id: notification.warehouseId,
        items: notification.items,
        shipping_address: notification.shippingAddress,
        status: notification.status,
        created_at: new Date(),
      } as any);
    } catch (error) {
      console.error('记录发货通知日志错误:', error);
    }
  }

  /**
   * 查询WMS系统发货状?   */
  private async queryWmsShipmentStatus(
    wmsOrderId: string
  ): Promise<ShipmentTracking | null> {
    try {
      // 这里应该调用具体的WMS API
      // 暂时返回模拟数据
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`查询WMS发货状? ${wmsOrderId}`)// 模拟WMS查询结果
      return {
        wmsOrderId,
        status: 'processing',
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('查询WMS发货状态错?', error);
      return null;
    }
  }

  /**
   * 同步WMS跟踪信息到本?   */
  private async syncWmsTrackingToLocal(
    tracking: ShipmentTracking
  ): Promise<void> {
    try {
      await supabase.from('shipment_tracking').insert({
        wms_order_id: tracking.wmsOrderId,
        status: tracking.status,
        tracking_number: tracking.trackingNumber,
        carrier: tracking.carrier,
        estimated_delivery: tracking.estimatedDelivery,
        actual_delivery: tracking.actualDelivery,
        updated_at: tracking.lastUpdated,
      } as any);
    } catch (error) {
      console.error('同步WMS跟踪信息错误:', error);
    }
  }

  /**
   * 更新关联的兑换订单状?   */
  private async updateRelatedExchangeOrderStatus(
    wmsOrderId: string,
    wmsStatus: string
  ): Promise<void> {
    try {
      // 映射WMS状态到本地订单状?      const statusMap: Record<string, string> = {
        created: 'processing',
        processing: 'processing',
        shipped: 'shipped',
        delivered: 'delivered',
        cancelled: 'cancelled',
      };

      const localStatus = statusMap[wmsStatus] || 'processing';

      await supabase
        .from('fcx_exchange_orders')
        .update({
          status: localStatus,
          updated_at: new Date(),
        } as any)
        .eq('wms_order_id', wmsOrderId);
    } catch (error) {
      console.error('更新关联订单状态错?', error);
    }
  }

  /**
   * 发送发货通知给用?   */
  private async sendShipmentNotification(trackingData: any): Promise<void> {
    try {
      // 获取订单信息
      const { data: order } = await supabase
        .from('fcx_exchange_orders')
        .select('user_id, order_number')
        .eq('wms_order_id', trackingData.wmsOrderId)
        .single();

      if (!order) return;

      // 这里应该集成消息推送服?      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `发送发货通知给用?${order.user_id}: 订单 ${order.order_number} 状态更新为 ${trackingData.status}`
      )// 记录通知发?      (await supabase.from('notifications').insert({
        user_id: order.user_id,
        type: 'shipment_update',
        title: '订单发货状态更?,
        content: `您的订单 ${order.order_number} as any 状态已更新? ${trackingData.status}`,
        related_id: trackingData.wmsOrderId,
        created_at: new Date(),
      })) as any;
    } catch (error) {
      console.error('发送发货通知错误:', error);
    }
  }

  /**
   * 调用WMS API
   */
  private async callWmsApi(
    connection: any,
    endpoint: string,
    data: any
  ): Promise<{
    success: boolean;
    wmsOrderId?: string;
    trackingNumber?: string;
    errorMessage?: string;
    details?: any;
  }> {
    try {
      // 构造API请求
      const apiUrl = `${connection.base_url}${endpoint}`;

      // 这里应该根据具体的WMS提供商构造请?      // 暂时返回模拟成功响应
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`调用WMS API: ${apiUrl}`, data)// 模拟API响应
      return {
        success: true,
        wmsOrderId: `WMS-${Date.now()}`,
        trackingNumber: `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        details: {
          message: '发货单创建成?,
          warehouse: connection.warehouse_id,
        },
      };
    } catch (error) {
      console.error('调用WMS API错误:', error);
      return {
        success: false,
        errorMessage: `WMS API调用失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 验证WMS回调签名
   */
  private async verifyWmsCallbackSignature(
    callbackData: any
  ): Promise<boolean> {
    // 实际项目中应该实现具体的签名验证逻辑
    // 这里简单返回true作为示例
    return true;
  }

  // 各种回调处理方法
  private async handleOrderCreatedCallback(
    callbackData: any
  ): Promise<boolean> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('处理订单创建回调:', callbackData)// 实现具体逻辑
    return true;
  }

  private async handleOrderShippedCallback(
    callbackData: any
  ): Promise<boolean> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('处理订单发货回调:', callbackData)// 更新发货状态和物流信息
    await this.updateShipmentTracking({
      wmsOrderId: callbackData.wmsOrderId,
      status: 'shipped',
      trackingNumber: callbackData.trackingNumber,
      carrier: callbackData.carrier,
    });
    return true;
  }

  private async handleOrderDeliveredCallback(
    callbackData: any
  ): Promise<boolean> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('处理订单送达回调:', callbackData)// 更新为已送达状?    await this.updateShipmentTracking({
      wmsOrderId: callbackData.wmsOrderId,
      status: 'delivered',
      actualDelivery: new Date(),
    });
    return true;
  }

  private async handleOrderCancelledCallback(
    callbackData: any
  ): Promise<boolean> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('处理订单取消回调:', callbackData)// 更新为已取消状?    await this.updateShipmentTracking({
      wmsOrderId: callbackData.wmsOrderId,
      status: 'cancelled',
    });
    return true;
  }
}
