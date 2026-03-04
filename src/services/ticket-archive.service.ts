/**
 * FCX-405 工单完成自动记录维修事件服务
 * 实现工单完成后自动调用LIFE-201记录设备档案
 */

import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceEventType } from '@/lib/constants/lifecycle';

export interface TicketCompletionData {
  ticketId: string;
  qrcodeId: string;
  deviceId?: string;
  faultType: string;
  repairParts: string[];
  technician: string;
  completionTime: Date;
  repairCost?: number;
  notes?: string;
}

export class TicketArchiveService {
  private lifecycleService: DeviceLifecycleService;

  constructor() {
    this.lifecycleService = new DeviceLifecycleService();
  }

  /**
   * 工单完成时自动记录维修事件到设备档案
   * @param completionData 工单完成数据
   */
  async recordTicketCompletion(
    completionData: TicketCompletionData
  ): Promise<boolean> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        '🔧 开始记录工单完成事件到设备档案:',
        completionData.ticketId
      )// 构造生命周期事件数?      const eventParams = {
        qrcodeId: completionData.qrcodeId,
        eventType: DeviceEventType.REPAIRED,
        eventSubtype: completionData.faultType,
        location: '维修中心',
        technician: completionData.technician,
        cost: completionData.repairCost,
        notes: `工单 ${completionData.ticketId} 完成维修 - ${completionData.notes || ''}`,
        attachments: [],
        metadata: {
          ticketId: completionData.ticketId,
          deviceId: completionData.deviceId,
          partsReplaced: completionData.repairParts,
          completionTime: completionData.completionTime.toISOString(),
          faultType: completionData.faultType,
        },
      };

      // 调用LIFE-201记录事件
      const event = await this.lifecycleService.recordEvent(eventParams);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?工单事件记录成功:', event.id)// 如果有更换配件，额外记录配件更换事件
      if (completionData.repairParts && completionData.repairParts.length > 0) {
        await this.recordPartReplacement(completionData);
      }

      return true;
    } catch (error) {
      console.error('�?记录工单完成事件失败:', error);
      throw new Error(`记录工单事件失败: ${(error as Error).message}`);
    }
  }

  /**
   * 记录配件更换事件
   * @param completionData 工单完成数据
   */
  private async recordPartReplacement(
    completionData: TicketCompletionData
  ): Promise<void> {
    try {
      const partEventParams = {
        qrcodeId: completionData.qrcodeId,
        eventType: DeviceEventType.PART_REPLACED,
        eventSubtype: completionData.faultType,
        location: '维修中心',
        technician: completionData.technician,
        cost: completionData.repairCost,
        notes: `工单 ${completionData.ticketId} 更换配件: ${completionData.repairParts.join(', ')}`,
        attachments: [],
        metadata: {
          ticketId: completionData.ticketId,
          partsReplaced: completionData.repairParts,
          completionTime: completionData.completionTime.toISOString(),
        },
      };

      await this.lifecycleService.recordEvent(partEventParams);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?配件更换事件记录成功')} catch (error) {
      console.error('⚠️ 记录配件更换事件失败:', error);
      // 配件记录失败不影响主流程
    }
  }

  /**
   * 批量处理工单完成事件
   * @param completions 工单完成数据数组
   */
  async batchRecordCompletions(completions: TicketCompletionData[]): Promise<{
    successCount: number;
    failureCount: number;
    failures: { ticketId: string; error: string }[];
  }> {
    let successCount = 0;
    let failureCount = 0;
    const failures: { ticketId: string; error: string }[] = [];

    for (const completion of completions) {
      try {
        await this.recordTicketCompletion(completion);
        successCount++;
      } catch (error) {
        failureCount++;
        failures.push({
          ticketId: completion.ticketId,
          error: (error as Error).message,
        });
        console.error(`�?工单 ${completion.ticketId} 处理失败:`, error);
      }
    }

    return { successCount, failureCount, failures };
  }

  /**
   * 验证工单数据完整?   * @param completionData 工单完成数据
   */
  validateCompletionData(completionData: TicketCompletionData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!completionData.ticketId) {
      errors.push('缺少工单ID');
    }

    if (!completionData.qrcodeId) {
      errors.push('缺少设备二维码ID');
    }

    if (!completionData.faultType) {
      errors.push('缺少故障类型');
    }

    if (!completionData.technician) {
      errors.push('缺少维修技师信?);
    }

    if (!completionData.completionTime) {
      errors.push('缺少完成时间');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取设备最近的维修历史
   * @param qrcodeId 设备二维码ID
   * @param limit 限制条数
   */
  async getDeviceRepairHistory(
    qrcodeId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const events = await this.lifecycleService.getDeviceLifecycleHistory(
        qrcodeId,
        {
          limit,
          orderBy: 'timestamp',
          sortOrder: 'desc',
        }
      );

      // 过滤出维修相关的事件
      return events.filter(
        event =>
          event.eventType === DeviceEventType.REPAIRED ||
          event.eventType === DeviceEventType.PART_REPLACED
      );
    } catch (error) {
      console.error('获取设备维修历史失败:', error);
      return [];
    }
  }

  /**
   * 生成维修报告摘要
   * @param qrcodeId 设备二维码ID
   */
  async generateRepairSummary(qrcodeId: string): Promise<{
    totalRepairs: number;
    totalCost: number;
    lastRepairDate?: Date;
    commonIssues: string[];
  }> {
    try {
      const repairEvents = await this.getDeviceRepairHistory(qrcodeId, 100);

      const totalRepairs = repairEvents.length;
      const totalCost = repairEvents.reduce(
        (sum, event) => sum + (event?.cost || 0),
        0
      );

      const lastRepairDate =
        repairEvents.length > 0
          ? new Date(repairEvents[0].eventTimestamp)
          : undefined;

      // 统计常见问题
      const issueCounts: Record<string, number> = {};
      repairEvents.forEach(event => {
        const issue = event.eventSubtype || '未知问题';
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });

      const commonIssues = Object.entries(issueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([issue]) => issue);

      return {
        totalRepairs,
        totalCost,
        lastRepairDate,
        commonIssues,
      };
    } catch (error) {
      console.error('生成维修报告失败:', error);
      return {
        totalRepairs: 0,
        totalCost: 0,
        commonIssues: [],
      };
    }
  }
}

// 导出单例实例
export const ticketArchiveService = new TicketArchiveService();
