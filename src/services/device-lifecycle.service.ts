import { supabaseAdmin as supabase } from '@/lib/supabase';
import { 
  DeviceEventType, 
  DeviceStatus, 
  LifecycleEventData, 
  LifecycleEvent,
  RecordLifecycleEventParams,
  LifecycleQueryParams
} from '@/lib/constants/lifecycle';

export class DeviceLifecycleService {
  private supabase = supabase;

  /**
   * 记录生命周期事件
   * @param params 事件记录参数
   * @param userId 用户ID（可选）
   * @returns 创建的事件记?
   */
  async recordEvent(
    params: RecordLifecycleEventParams,
    userId?: string
  ): Promise<LifecycleEvent> {
    try {
      const { data, error } = await this.supabase
        .from('device_lifecycle_events')
        .insert({
          device_qrcode_id: params.qrcodeId,
          event_type: params.eventType,
          event_subtype: params.eventSubtype,
          event_data: {
            technician: params.technician,
            cost: params.cost,
            attachments: params.attachments,
            ...params.metadata
          } as any,
          event_timestamp: new Date().toISOString(),
          created_by: userId,
          location: params.location,
          notes: params.notes,
          metadata: params.metadata
        }) as any
        .select()
        .single();

      if (error) throw new Error(`记录事件失败: ${error.message}`);
      
      // 更新设备档案
      await this.updateDeviceProfile(params.qrcodeId, params.eventType);
      
      return this.mapToLifecycleEvent(data);
    } catch (error) {
      console.error('记录生命周期事件错误:', error);
      throw error;
    }
  }

  /**
   * 获取设备完整生命周期历史
   * @param qrcodeId 二维码ID
   * @param queryParams 查询参数
   * @returns 生命周期事件列表
   */
  async getDeviceLifecycleHistory(
    qrcodeId: string,
    queryParams?: LifecycleQueryParams
  ): Promise<LifecycleEvent[]> {
    try {
      let query = this.supabase
        .from('device_lifecycle_events')
        .select('*')
        .eq('device_qrcode_id', qrcodeId);

      // 应用查询参数
      if (queryParams?.eventType) {
        query = query.eq('event_type', queryParams.eventType);
      }

      if (queryParams?.fromDate) {
        query = query.gte('event_timestamp', queryParams.fromDate.toISOString());
      }

      if (queryParams?.toDate) {
        query = query.lte('event_timestamp', queryParams.toDate.toISOString());
      }

      // 排序
      const orderBy = queryParams?.orderBy || 'event_timestamp';
      const sortOrder = queryParams?.sortOrder || 'desc';
      query = query.order(orderBy, { ascending: sortOrder === 'asc' });

      // 分页
      if (queryParams?.limit) {
        query = query.limit(queryParams.limit);
      }

      if (queryParams?.offset) {
        query = query.range(queryParams.offset, queryParams.offset + (queryParams.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw new Error(`获取生命周期历史失败: ${error.message}`);
      
      return data.map(this.mapToLifecycleEvent);
    } catch (error) {
      console.error('获取设备生命周期历史错误:', error);
      throw error;
    }
  }

  /**
   * 根据事件类型获取设备历史
   * @param qrcodeId 二维码ID
   * @param eventType 事件类型
   * @returns 特定类型的事件列?
   */
  async getEventsByType(
    qrcodeId: string,
    eventType: DeviceEventType
  ): Promise<LifecycleEvent[]> {
    return this.getDeviceLifecycleHistory(qrcodeId, { eventType });
  }

  /**
   * 获取设备最新事?
   * @param qrcodeId 二维码ID
   * @returns 最新事?
   */
  async getLatestEvent(qrcodeId: string): Promise<LifecycleEvent | null> {
    const events = await this.getDeviceLifecycleHistory(qrcodeId, {
      limit: 1
    });
    return events[0] || null;
  }

  /**
   * 批量记录事件
   * @param events 事件列表
   * @param userId 用户ID
   * @returns 成功记录的事件数?
   */
  async recordMultipleEvents(
    events: RecordLifecycleEventParams[],
    userId?: string
  ): Promise<number> {
    let successCount = 0;
    
    for (const event of events) {
      try {
        await this.recordEvent(event, userId);
        successCount++;
      } catch (error) {
        console.error(`记录事件失败 (${event.qrcodeId}):`, error);
        // 继续处理下一个事?
      }
    }
    
    return successCount;
  }

  /**
   * 验证事件记录
   * @param eventId 事件ID
   * @param userId 验证用户ID
   */
  async verifyEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('device_lifecycle_events')
      .update({
        is_verified: true,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', eventId);

    if (error) throw new Error(`验证事件失败: ${error.message}`);
  }

  /**
   * 更新设备档案
   * @param qrcodeId 二维码ID
   * @param eventType 事件类型
   */
  private async updateDeviceProfile(qrcodeId: string, eventType: DeviceEventType): Promise<void> {
    try {
      // 获取最新的事件信息
      const latestEvents = await this.getDeviceLifecycleHistory(qrcodeId);
      const latestEvent = latestEvents[0];

      // 计算统计数据
      const stats = this.calculateDeviceStats(latestEvents);

      // 确定新的设备状?
      const newStatus = this.determineDeviceStatus(eventType, latestEvents);

      // 更新设备档案
      const { error } = await this.supabase
        .from('device_profiles')
        .update({
          last_event_at: latestEvent?.eventTimestamp,
          last_event_type: eventType,
          current_status: newStatus,
          total_repair_count: stats.repairCount,
          total_part_replacement_count: stats.partReplacementCount,
          total_transfer_count: stats.transferCount,
          updated_at: new Date().toISOString()
        } as any)
        .eq('qrcode_id', qrcodeId);

      if (error) {
        // 如果设备档案不存在，尝试创建
        if (error.code === '23503') { // 外键约束错误
          await this.createInitialDeviceProfile(qrcodeId, eventType);
        } else {
          throw new Error(`更新设备档案失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('更新设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 创建初始设备档案
   * @param qrcodeId 二维码ID
   * @param initialEventType 初始事件类型
   */
  private async createInitialDeviceProfile(
    qrcodeId: string,
    initialEventType: DeviceEventType
  ): Promise<void> {
    try {
      // 获取产品信息
      const { data: qrData, error: qrError } = await this.supabase
        .from('product_qrcodes')
        .select(`
          product_id,
          products (
            name,
            model,
            brands (
              name
            )
          )
        `)
        .eq('qr_code_id', qrcodeId)
        .single();

      if (qrError) throw new Error(`获取产品信息失败: ${qrError.message}`);

      const product = qrData.products as any;
      const brand = product.brands as any;

      // 设置初始状?
      let initialStatus = DeviceStatus.MANUFACTURED;
      let firstActivatedAt: string | null = null;

      if (initialEventType === DeviceEventType.ACTIVATED) {
        initialStatus = DeviceStatus.ACTIVATED;
        firstActivatedAt = new Date().toISOString();
      }

      const { error: insertError } = await this.supabase
        .from('device_profiles')
        .insert({
          qrcode_id: qrcodeId,
          product_model: product.model || product.name,
          product_category: '未分?,
          brand_name: brand?.name,
          manufacturing_date: new Date().toISOString().split('T')[0],
          first_activated_at: firstActivatedAt,
          warranty_period: 12, // 默认12个月保修?
          current_status: initialStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);

      if (insertError) throw new Error(`创建设备档案失败: ${insertError.message}`);
    } catch (error) {
      console.error('创建初始设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 计算设备统计数据
   * @param events 事件列表
   * @returns 统计结果
   */
  private calculateDeviceStats(events: LifecycleEvent[]) {
    return {
      repairCount: events.filter(e => e.eventType === DeviceEventType.REPAIRED).length,
      partReplacementCount: events.filter(e => e.eventType === DeviceEventType.PART_REPLACED).length,
      transferCount: events.filter(e => e.eventType === DeviceEventType.TRANSFERRED).length
    };
  }

  /**
   * 确定设备状?
   * @param eventType 事件类型
   * @param events 事件列表
   * @returns 设备状?
   */
  private determineDeviceStatus(eventType: DeviceEventType, events: LifecycleEvent[]): DeviceStatus {
    switch (eventType) {
      case DeviceEventType.MANUFACTURED:
        return DeviceStatus.MANUFACTURED;
      case DeviceEventType.ACTIVATED:
        return DeviceStatus.ACTIVATED;
      case DeviceEventType.REPAIRED:
        // 检查是否有未验证的维修事件
        return events.some(e => 
          e.eventType === DeviceEventType.REPAIRED && !e.isVerified
        ) ? DeviceStatus.IN_REPAIR : DeviceStatus.ACTIVE;
      case DeviceEventType.RECYCLED:
        return DeviceStatus.RECYCLED;
      case DeviceEventType.TRANSFERRED:
        return DeviceStatus.TRANSFERRED;
      default:
        return DeviceStatus.ACTIVE;
    }
  }

  /**
   * 将数据库记录映射到LifecycleEvent对象
   * @param record 数据库记?
   * @returns LifecycleEvent对象
   */
  private mapToLifecycleEvent(record: any): LifecycleEvent {
    return {
      id: record.id,
      deviceQrcodeId: record.device_qrcode_id,
      eventType: record.event_type as DeviceEventType,
      eventSubtype: record.event_subtype,
      eventData: record.event_data,
      eventTimestamp: new Date(record.event_timestamp),
      createdBy: record.created_by,
      location: record.location,
      notes: record.notes,
      metadata: record.metadata,
      isVerified: record.is_verified,
      verifiedBy: record.verified_by,
      verifiedAt: record.verified_at ? new Date(record.verified_at) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }
}