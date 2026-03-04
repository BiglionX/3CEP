import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceEventType, RepairType } from '@/lib/constants/lifecycle';

/**
 * 工单系统集成服务
 * 负责将工单系统的操作同步到设备生命周期管理中
 */
export class WorkOrderIntegration {
  private lifecycleService = new DeviceLifecycleService();

  /**
   * 工单完成后自动记录维修事?   * @param workOrder 工单信息
   * @param userId 操作用户ID
   */
  async recordRepairFromWorkOrder(
    workOrder: any,
    userId: string
  ): Promise<void> {
    try {
      // 构建维修事件数据
      const repairData = {
        qrcodeId: workOrder.device_qrcode_id,
        eventType: DeviceEventType.REPAIRED,
        eventSubtype: workOrder.repair_type || RepairType.OTHER,
        location: workOrder.service_location,
        technician: workOrder.technician_name,
        cost: workOrder.total_cost,
        notes: workOrder.description || workOrder.problem_description,
        metadata: {
          workOrderId: workOrder.id,
          workOrderNumber: workOrder.work_order_number,
          customerId: workOrder.customer_id,
          serviceType: workOrder.service_type,
          priority: workOrder.priority,
          status: workOrder.status,
          completedAt: workOrder.completed_at,
        },
      };

      // 记录维修事件
      await this.lifecycleService.recordEvent(repairData, userId);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `工单 ${workOrder.work_order_number} 的维修事件已记录到设备生命周期`
      )} catch (error) {
      console.error('记录工单维修事件失败:', error);
      throw error;
    }
  }

  /**
   * 工单中记录配件更换事?   * @param workOrder 工单信息
   * @param partInfo 配件信息
   * @param userId 操作用户ID
   */
  async recordPartReplacement(
    workOrder: any,
    partInfo: any,
    userId: string
  ): Promise<void> {
    try {
      const partData = {
        qrcodeId: workOrder.device_qrcode_id,
        eventType: DeviceEventType.PART_REPLACED,
        eventSubtype: partInfo.part_type || 'other',
        location: workOrder.service_location,
        technician: workOrder.technician_name,
        cost: partInfo.cost,
        notes: `更换${partInfo.part_name || partInfo.part_type}`,
        metadata: {
          workOrderId: workOrder.id,
          workOrderNumber: workOrder.work_order_number,
          partId: partInfo.id,
          partName: partInfo.part_name,
          partSerial: partInfo.serial_number,
          partBrand: partInfo.brand,
          warrantyInfo: partInfo.warranty_info,
        },
      };

      await this.lifecycleService.recordEvent(partData, userId);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`配件更换事件已记? ${partInfo.part_name}`)} catch (error) {
      console.error('记录配件更换事件失败:', error);
      throw error;
    }
  }

  /**
   * 批量处理工单完成事件
   * @param workOrders 工单列表
   * @param userId 操作用户ID
   */
  async batchProcessCompletedWorkOrders(
    workOrders: any[],
    userId: string
  ): Promise<{
    successCount: number;
    failureCount: number;
    errors: string[];
  }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const workOrder of workOrders) {
      try {
        await this.recordRepairFromWorkOrder(workOrder, userId);
        successCount++;
      } catch (error) {
        failureCount++;
        const errorMsg = `工单 ${workOrder.work_order_number}: ${error instanceof Error ? error.message : '未知错误'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return {
      successCount,
      failureCount,
      errors,
    };
  }

  /**
   * 从工单创建设备初始档?   * @param workOrder 工单信息
   * @param userId 操作用户ID
   */
  async createDeviceProfileFromWorkOrder(
    workOrder: any,
    userId: string
  ): Promise<void> {
    try {
      // 这里可以根据工单信息创建设备档案
      // 实际实现需要根据具体的工单数据结构调整

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`从工?${workOrder.work_order_number} 创建设备档案`)} catch (error) {
      console.error('从工单创建设备档案失?', error);
      throw error;
    }
  }

  /**
   * 同步工单状态变更到设备生命周期
   * @param workOrder 工单信息
   * @param newStatus 新状?   * @param userId 操作用户ID
   */
  async syncWorkOrderStatusChange(
    workOrder: any,
    newStatus: string,
    userId: string
  ): Promise<void> {
    try {
      // 根据工单状态变化记录相应的生命周期事件
      let eventType: DeviceEventType | null = null;
      let notes = '';

      switch (newStatus.toLowerCase()) {
        case 'in_progress':
          eventType = DeviceEventType.MAINTAINED;
          notes = '工单处理?;
          break;
        case 'completed':
          eventType = DeviceEventType.REPAIRED;
          notes = '工单已完?;
          break;
        case 'cancelled':
          eventType = DeviceEventType.INSPECTED;
          notes = '工单已取?;
          break;
      }

      if (eventType) {
        await this.lifecycleService.recordEvent(
          {
            qrcodeId: workOrder.device_qrcode_id,
            eventType,
            notes: `${notes} - 工单编号: ${workOrder.work_order_number}`,
            metadata: {
              workOrderId: workOrder.id,
              workOrderNumber: workOrder.work_order_number,
              statusChange: newStatus,
            },
          },
          userId
        );
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `工单状态变更已同步: ${workOrder.work_order_number} -> ${newStatus}`
      )} catch (error) {
      console.error('同步工单状态变更失?', error);
      throw error;
    }
  }

  /**
   * 获取设备相关的工单历?   * @param qrcodeId 二维码ID
   */
  async getDeviceWorkOrderHistory(qrcodeId: string): Promise<any[]> {
    try {
      // 查询与该设备相关的生命周期事件中的工单信?      const events =
        await this.lifecycleService.getDeviceLifecycleHistory(qrcodeId);

      // 过滤出包含工单信息的事件
      const workOrderEvents = events.filter(
        event => event?.workOrderId || event?.workOrderNumber
      );

      return workOrderEvents.map(event => ({
        eventId: event.id,
        workOrderId: event?.workOrderId,
        workOrderNumber: event?.workOrderNumber,
        eventType: event.eventType,
        eventSubtype: event.eventSubtype,
        timestamp: event.eventTimestamp,
        technician: event?.technician,
        cost: event?.cost,
        notes: event.notes,
      }));
    } catch (error) {
      console.error('获取设备工单历史失败:', error);
      throw error;
    }
  }
}
