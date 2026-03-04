/**
 * 入库预报服务
 * WMS-203 入库预报管理核心服务
 */

import { createClient } from '@supabase/supabase-js';
import {
  CreateInboundForecastDTO,
  InboundForecast,
  InboundForecastListItem,
  InboundForecastQueryParams,
  InboundForecastStatus,
  InboundForecastStatusHistory,
  UpdateInboundForecastStatusDTO,
} from '../models/inbound-forecast.model';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class InboundForecastService {
  /**
   * 创建入库预报?   */
  async createForecast(
    dto: CreateInboundForecastDTO,
    userId: string
  ): Promise<InboundForecast> {
    try {
      // 生成预报单号
      const forecastNumber = this.generateForecastNumber();

      // 开始事?      const { data: forecastData, error: forecastError } = await supabase
        .from('wms_inbound_notices')
        .insert({
          forecast_number: forecastNumber,
          connection_id: dto.warehouseId,
          expected_arrival: dto.expectedArrival.toISOString(),
          supplier_name: dto.supplierName,
          supplier_contact: dto.supplierContact,
          supplier_address: dto.supplierAddress,
          status: 'forecast',
          created_by: userId,
          brand_id: dto.brandId,
          remarks: dto.remarks,
          attachments: dto.attachments || null,
        } as any)
        .select()
        .single();

      if (forecastError)
        throw new Error(`创建预报单失? ${forecastError.message}`);

      // 创建预报单项
      const itemsData = dto.items.map(
        item =>
          ({
            notice_id: forecastData.id,
            wms_sku: item.sku,
            quantity: item.forecastedQuantity,
            unit_weight: item.unitWeight,
            dimensions: item.dimensions,
            remarks: item.remarks,
          }) as any
      );

      const { error: itemsError } = await supabase
        .from('wms_inbound_items')
        .insert(itemsData);

      if (itemsError)
        throw new Error(`创建预报明细失败: ${itemsError.message}`);

      // 记录状态变更历?      await this.createStatusHistory(
        forecastData.id,
        null,
        InboundForecastStatus.FORECAST,
        userId,
        '创建预报?
      );

      // 发送创建通知
      await this.sendNotification(
        forecastData.id,
        'created',
        forecastData.supplier_contact
      );

      return await this.getForecastById(forecastData.id);
    } catch (error) {
      console.error('创建入库预报失败:', error);
      throw error;
    }
  }

  /**
   * 更新预报单状?   */
  async updateForecastStatus(
    forecastId: string,
    dto: UpdateInboundForecastStatusDTO,
    userId: string
  ): Promise<void> {
    try {
      const forecast = await this.getForecastById(forecastId);
      const oldStatus = forecast.status;

      // 验证状态转换合法?      if (!this.isValidStatusTransition(oldStatus, dto.status)) {
        throw new Error(`无效的状态转? ${oldStatus} -> ${dto.status}`);
      }

      // 更新状?      const updateData: any = {
        status: dto.status,
        updated_at: new Date().toISOString(),
      };

      // 如果是收货状态，设置实际到货时间
      if (dto.status === InboundForecastStatus.RECEIVED) {
        updateData.actual_arrival = new Date().toISOString();
      }

      const { error } = await supabase
        .from('wms_inbound_notices')
        .update(updateData)
        .eq('id', forecastId);

      if (error) throw new Error(`更新状态失? ${error.message}`);

      // 记录状态变更历?      await this.createStatusHistory(
        forecastId,
        oldStatus,
        dto.status,
        userId,
        dto.reason
      );

      // 发送状态变更通知
      await this.sendNotification(
        forecastId,
        'status_changed',
        forecast.supplierContact
      );
    } catch (error) {
      console.error('更新预报单状态失?', error);
      throw error;
    }
  }

  /**
   * 根据ID获取预报单详?   */
  async getForecastById(id: string): Promise<InboundForecast> {
    try {
      const { data, error } = await supabase
        .from('wms_inbound_forecast_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(`查询预报单失? ${error.message}`);
      if (!data) throw new Error('预报单不存在');

      return this.mapToInboundForecast(data);
    } catch (error) {
      console.error('获取预报单详情失?', error);
      throw error;
    }
  }

  /**
   * 查询预报单列?   */
  async listForecasts(
    params: InboundForecastQueryParams
  ): Promise<InboundForecastListItem[]> {
    try {
      let query = supabase.from('wms_inbound_forecast_view').select(`
          id,
          forecast_number,
          connection_id,
          warehouse_name,
          supplier_name,
          expected_arrival,
          actual_arrival,
          status,
          item_count,
          total_forecasted_quantity,
          total_received_quantity,
          created_by,
          created_at,
          updated_at
        `);

      // 应用查询条件
      if (params.warehouseId) {
        query = query.eq('connection_id', params.warehouseId);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.supplierName) {
        query = query.ilike('supplier_name', `%${params.supplierName}%`);
      }

      if (params.startDate) {
        query = query.gte('expected_arrival', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('expected_arrival', params.endDate.toISOString());
      }

      if (params.brandId) {
        query = query.eq('brand_id', params.brandId);
      }

      if (params.createdBy) {
        query = query.eq('created_by', params.createdBy);
      }

      // 排序
      query = query.order('created_at', { ascending: false });

      // 分页
      if (params.limit) {
        const offset = params.offset || 0;
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw new Error(`查询预报单列表失? ${error.message}`);

      return data.map(this.mapToInboundForecastListItem);
    } catch (error) {
      console.error('查询预报单列表失?', error);
      throw error;
    }
  }

  /**
   * 获取状态变更历?   */
  async getStatusHistory(
    noticeId: string
  ): Promise<InboundForecastStatusHistory[]> {
    try {
      const { data, error } = await supabase
        .from('wms_inbound_status_history')
        .select(
          `
          id,
          notice_id,
          from_status,
          to_status,
          changed_by,
          change_reason,
          created_at
        `
        )
        .eq('notice_id', noticeId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(`查询状态历史失? ${error.message}`);

      return data.map(history => ({
        id: history.id,
        noticeId: history.notice_id,
        fromStatus: history.from_status as InboundForecastStatus | null,
        toStatus: history.to_status as InboundForecastStatus,
        changedBy: history.changed_by,
        changeReason: history.change_reason || undefined,
        createdAt: new Date(history.created_at),
      }));
    } catch (error) {
      console.error('获取状态历史失?', error);
      throw error;
    }
  }

  /**
   * 处理WMS回调
   */
  async handleWMSCallback(callbackData: any): Promise<void> {
    try {
      const { noticeId, status, actualArrival, receivedItems, timestamp } =
        callbackData;

      // 验证预报单是否存?      const forecast = await this.getForecastById(noticeId);

      // 更新预报单状?      const statusMap: Record<string, InboundForecastStatus> = {
        confirmed: InboundForecastStatus.IN_TRANSIT,
        in_transit: InboundForecastStatus.IN_TRANSIT,
        received: InboundForecastStatus.RECEIVED,
        cancelled: InboundForecastStatus.CANCELLED,
      };

      const newStatus = statusMap[status];
      if (!newStatus) {
        throw new Error(`不支持的状? ${status}`);
      }

      // 更新预报单状?      const updateData: any = { status: newStatus };
      if (actualArrival) {
        updateData.actual_arrival = new Date(actualArrival).toISOString();
      }

      const { error } = await supabase
        .from('wms_inbound_notices')
        .update(updateData)
        .eq('id', noticeId);

      if (error) throw new Error(`更新预报单状态失? ${error.message}`);

      // 更新收货数量
      if (receivedItems && receivedItems.length > 0) {
        for (const item of receivedItems) {
          await supabase
            .from('wms_inbound_items')
            .update({ received_quantity: item.receivedQuantity } as any)
            .match({ notice_id: noticeId, wms_sku: item.sku });
        }
      }

      // 记录状态变更历?      await this.createStatusHistory(
        noticeId,
        forecast.status,
        newStatus,
        'system',
        `WMS回调更新状? ${status}`
      );
    } catch (error) {
      console.error('处理WMS回调失败:', error);
      throw error;
    }
  }

  /**
   * 生成预报单号
   */
  private generateForecastNumber(): string {
    const prefix = 'INF';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${date}${random}`;
  }

  /**
   * 创建状态变更历史记?   */
  private async createStatusHistory(
    noticeId: string,
    fromStatus: InboundForecastStatus | null,
    toStatus: InboundForecastStatus,
    changedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      await supabase.from('wms_inbound_status_history').insert({
        notice_id: noticeId,
        from_status: fromStatus,
        to_status: toStatus,
        changed_by: changedBy,
        change_reason: reason,
      } as any);
    } catch (error) {
      console.error('创建状态历史记录失?', error);
      // 不抛出异常，避免影响主流?    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(
    noticeId: string,
    type: 'created' | 'status_changed' | 'reminder',
    recipientEmail: string
  ): Promise<void> {
    try {
      const subject = this.getNotificationSubject(type);
      const content = this.getNotificationContent(type, noticeId);

      await supabase.from('wms_inbound_notifications').insert({
        notice_id: noticeId,
        notification_type: type,
        recipient_email: recipientEmail,
        subject,
        content,
      } as any);
    } catch (error) {
      console.error('发送通知失败:', error);
      // 不抛出异常，避免影响主流?    }
  }

  /**
   * 验证状态转换合法?   */
  private isValidStatusTransition(
    fromStatus: InboundForecastStatus,
    toStatus: InboundForecastStatus
  ): boolean {
    const validTransitions: Record<
      InboundForecastStatus,
      InboundForecastStatus[]
    > = {
      [InboundForecastStatus.FORECAST]: [
        InboundForecastStatus.IN_TRANSIT,
        InboundForecastStatus.CANCELLED,
      ],
      [InboundForecastStatus.IN_TRANSIT]: [
        InboundForecastStatus.RECEIVED,
        InboundForecastStatus.CANCELLED,
      ],
      [InboundForecastStatus.RECEIVED]: [], // 已收货状态不能变?      [InboundForecastStatus.CANCELLED]: [], // 已取消状态不能变?    };

    return validTransitions[fromStatus].includes(toStatus);
  }

  /**
   * 映射数据库数据到InboundForecast对象
   */
  private mapToInboundForecast(data: any): InboundForecast {
    return {
      id: data.id,
      forecastNumber: data.forecast_number,
      warehouseId: data.connection_id,
      warehouseName: data.warehouse_name || '',
      supplierName: data.supplier_name,
      supplierContact: data.supplier_contact,
      supplierAddress: data.supplier_address,
      expectedArrival: new Date(data.expected_arrival),
      actualArrival: data.actual_arrival
        ? new Date(data.actual_arrival)
        : undefined,
      status: data.status as InboundForecastStatus,
      items: [], // 项数据需要单独查?      createdBy: data.created_by,
      brandId: data.brand_id,
      remarks: data.remarks,
      attachments: data.attachments,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * 映射数据库数据到InboundForecastListItem对象
   */
  private mapToInboundForecastListItem(data: any): InboundForecastListItem {
    return {
      id: data.id,
      forecastNumber: data.forecast_number,
      warehouseId: data.connection_id,
      warehouseName: data.warehouse_name || '',
      supplierName: data.supplier_name,
      expectedArrival: new Date(data.expected_arrival),
      status: data.status as InboundForecastStatus,
      itemCount: data.item_count || 0,
      totalForecastedQuantity: data.total_forecasted_quantity || 0,
      totalReceivedQuantity: data.total_received_quantity || 0,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * 获取通知主题
   */
  private getNotificationSubject(type: string): string {
    const subjects: Record<string, string> = {
      created: '入库预报单已创建',
      status_changed: '入库预报单状态变?,
      reminder: '入库预报单提?,
    };
    return subjects[type] || '入库预报通知';
  }

  /**
   * 获取通知内容
   */
  private getNotificationContent(type: string, noticeId: string): string {
    return `您的入库预报?${noticeId}) as any有新?{type}通知`;
  }
}
