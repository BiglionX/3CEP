import { createClient } from '@supabase/supabase-js';
import { ReportTemplate, ReportType } from '../analytics/bi-engine';

// 调度配置接口
export interface ScheduleConfig {
  frequency: 'minute' | 'hour' | 'day' | 'week' | 'month';
  interval?: number; // 间隔倍数，默认为1
  startTime?: string; // 开始时?(HH:mm)
  endTime?: string; // 结束时间 (HH:mm)
  daysOfWeek?: number[]; // 星期?(0-6, 0表示周日)
  daysOfMonth?: number[]; // 月中第几?(1-31)
}

// 初始化Supabase客户?
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  schedule: ScheduleConfig;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  reportId: string;
  email: string;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ReportScheduler {
  private static instance: ReportScheduler;
  private schedules: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): ReportScheduler {
    if (!ReportScheduler.instance) {
      ReportScheduler.instance = new ReportScheduler();
    }
    return ReportScheduler.instance;
  }

  /**
   * 初始化调度器
   */
  async initialize(): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚀 初始化报表调度器...')// 加载启用的调度任?
    const enabledSchedules = await this.getEnabledSchedules();

    // 启动所有调度任?
    for (const schedule of enabledSchedules) {
      await this.startSchedule(schedule);
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `�?调度器初始化完成，已启动 ${enabledSchedules.length} 个调度任务`
    )}

  /**
   * 创建新的调度任务
   */
  async createSchedule(
    scheduledReport: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledReport> {
    const newSchedule: ScheduledReport = {
      ...scheduledReport,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 保存到数据库
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert(newSchedule)
      .select()
      .single();

    if (error) throw new Error(`创建调度任务失败: ${error.message}`);

    // 如果启用，则启动调度
    if (newSchedule.enabled) {
      await this.startSchedule(data);
    }

    return data;
  }

  /**
   * 更新调度任务
   */
  async updateSchedule(
    id: string,
    updates: Partial<ScheduledReport>
  ): Promise<ScheduledReport> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // 停止现有的调?
    await this.stopSchedule(id);

    // 更新数据?
    const { data, error } = await supabase
      .from('scheduled_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`更新调度任务失败: ${error.message}`);

    // 如果启用且有调度配置，则重新启动
    if (data.enabled && data.schedule) {
      await this.startSchedule(data);
    }

    return data;
  }

  /**
   * 删除调度任务
   */
  async deleteSchedule(id: string): Promise<void> {
    // 停止调度
    await this.stopSchedule(id);

    // 从数据库删除
    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`删除调度任务失败: ${error.message}`);
  }

  /**
   * 启动调度任务
   */
  private async startSchedule(schedule: ScheduledReport): Promise<void> {
    if (!schedule.enabled || !schedule.schedule) return;

    const interval = this.calculateInterval(schedule.schedule);
    if (interval <= 0) return;

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?启动调度任务: ${schedule.name} (间隔: ${interval}ms)`);

    const timeoutId = setInterval(async () => {
      try {
        await this.executeScheduledReport(schedule);
      } catch (error) {
        console.error(`�?调度任务执行失败 ${schedule.name}:`, error);
      }
    }, interval);

    this.schedules.set(schedule.id, timeoutId);
  }

  /**
   * 停止调度任务
   */
  private async stopSchedule(id: string): Promise<void> {
    const timeoutId = this.schedules.get(id);
    if (timeoutId) {
      clearInterval(timeoutId);
      this.schedules.delete(id);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`⏹️ 停止调度任务: ${id}`)}
  }

  /**
   * 执行调度报表
   */
  private async executeScheduledReport(
    schedule: ScheduledReport
  ): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📊 执行调度报表: ${schedule.name}`)try {
      // 获取报表模板
      const template = await this.getReportTemplate(schedule.templateId);
      if (!template) {
        throw new Error(`报表模板不存? ${schedule.templateId}`);
      }

      // 生成报表数据
      const reportData = await this.generateReportData(template);

      // 格式化报?
      const formattedReport = await this.formatReport(
        reportData,
        schedule.format
      );

      // 发送报表给订阅?
      await this.distributeReport(schedule, formattedReport);

      // 更新最后执行时?
      await this.updateLastRun(schedule.id);
    } catch (error) {
      console.error(`�?报表执行失败 ${schedule.name}:`, error);
      throw error;
    }
  }

  /**
   * 获取报表模板
   */
  private async getReportTemplate(
    templateId: string
  ): Promise<ReportTemplate | null> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('获取报表模板失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 生成报表数据
   */
  private async generateReportData(template: ReportTemplate): Promise<any> {
    // 这里应该调用实际的报表引擎来生成数据
    // 暂时返回模拟数据
    return {
      templateId: template.id,
      templateName: template.name,
      generatedAt: new Date().toISOString(),
      data: {
        summary: {
          totalRecords: 1000,
          processedRecords: 950,
          errorRecords: 50,
        },
        details: [
          { date: '2026-03-01', value: 120 },
          { date: '2026-03-02', value: 135 },
          { date: '2026-03-03', value: 128 },
        ],
      },
    };
  }

  /**
   * 格式化报?
   */
  private async formatReport(data: any, format: string): Promise<Buffer> {
    // 这里应该根据格式调用相应的格式化函数
    // 暂时返回模拟的缓冲区
    return Buffer.from(JSON.stringify(data));
  }

  /**
   * 分发报表
   */
  private async distributeReport(
    schedule: ScheduledReport,
    reportBuffer: Buffer
  ): Promise<void> {
    // 获取订阅?
    const subscribers = await this.getSubscribers(schedule.id);

    // 发送给每个订阅?
    for (const subscriber of subscribers) {
      await this.sendReportToSubscriber(subscriber, schedule, reportBuffer);
    }
  }

  /**
   * 获取订阅?
   */
  private async getSubscribers(reportId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('reportId', reportId)
      .eq('enabled', true);

    if (error) {
      console.error('获取订阅者失?', error);
      return [];
    }

    return data || [];
  }

  /**
   * 发送报表给订阅?
   */
  private async sendReportToSubscriber(
    subscription: Subscription,
    schedule: ScheduledReport,
    reportBuffer: Buffer
  ): Promise<void> {
    // 这里应该集成实际的邮件发送服?
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送报表给: ${subscription.email}`, {
      reportName: schedule.name,
      format: schedule.format,
      size: reportBuffer.length,
    })// 模拟发送延?
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 更新最后执行时?
   */
  private async updateLastRun(scheduleId: string): Promise<void> {
    const now = new Date().toISOString();

    await supabase
      .from('scheduled_reports')
      .update({
        lastRun: now,
        updatedAt: now,
      }) as any
      .eq('id', scheduleId);
  }

  /**
   * 获取启用的调度任?
   */
  private async getEnabledSchedules(): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error('获取启用的调度任务失?', error);
      return [];
    }

    return data || [];
  }

  /**
   * 计算调度间隔（毫秒）
   */
  private calculateInterval(schedule: ScheduleConfig): number {
    const { frequency, interval = 1 } = schedule;

    switch (frequency) {
      case 'minute':
        return interval * 60 * 1000;
      case 'hour':
        return interval * 60 * 60 * 1000;
      case 'day':
        return interval * 24 * 60 * 60 * 1000;
      case 'week':
        return interval * 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return interval * 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return (
      'sched_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * 手动触发报表生成
   */
  async triggerReport(scheduleId: string): Promise<void> {
    const { data: schedule, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (error) throw new Error(`获取调度任务失败: ${error.message}`);
    if (!schedule) throw new Error(`调度任务不存? ${scheduleId}`);

    await this.executeScheduledReport(schedule);
  }

  /**
   * 获取调度任务状?
   */
  getScheduleStatus(): {
    total: number;
    active: number;
    schedules: { id: string; name: string; active: boolean }[];
  } {
    const schedules = Array.from(this.schedules.entries()).map(
      ([id, timeout]) => ({
        id,
        name: `Schedule_${id}`,
        active: !!timeout,
      })
    );

    return {
      total: schedules.length,
      active: schedules.filter(s => s.active).length,
      schedules,
    };
  }
}

// 导出单例实例
export const reportScheduler = ReportScheduler.getInstance();
