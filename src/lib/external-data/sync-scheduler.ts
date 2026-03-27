/**
 * 数据同步调度器
 *
 * 负责定时执行数据同步任务，支持配置化管理、自动重试、错误处理
 */

import cron from 'node-cron';
import { ExternalDataSyncService, SyncResult } from './sync-service';

// 同步任务配置
interface SyncTaskConfig {
  sourceId: string;
  cronExpression: string; // Cron 表达式
  enabled: boolean;
  retryCount: number; // 重试次数
  retryDelay: number; // 重试延迟（毫秒）
}

// 任务执行记录
interface TaskExecution {
  taskId: string;
  sourceId: string;
  startedAt: Date;
  completedAt?: Date;
  result?: SyncResult;
  error?: string;
  retryAttempt: number;
}

/**
 * 数据同步调度器类
 */
export class DataSyncScheduler {
  private syncService: ExternalDataSyncService;
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private taskConfigs: Map<string, SyncTaskConfig> = new Map();
  private runningTasks: Map<string, TaskExecution> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.syncService = new ExternalDataSyncService(supabaseUrl, supabaseKey);
  }

  /**
   * 启动所有启用的同步任务
   */
  async startAllTasks(): Promise<void> {
    console.log('🚀 启动数据同步调度器...');

    try {
      // 从数据库加载所有启用的数据源配置
      const dataSources = await this.getActiveDataSources();

      for (const source of dataSources) {
        await this.registerTask({
          sourceId: source.id,
          cronExpression: this.frequencyToCron(source.sync_frequency),
          enabled: source.sync_enabled,
          retryCount: 3,
          retryDelay: 5000,
        });
      }

      console.log(`✅ 已加载 ${dataSources.length} 个同步任务`);
    } catch (error) {
      console.error('❌ 启动同步任务失败:', error);
      throw error;
    }
  }

  /**
   * 注册单个同步任务
   */
  async registerTask(config: SyncTaskConfig): Promise<void> {
    // 如果任务已存在，先取消
    if (this.tasks.has(config.sourceId)) {
      await this.unregisterTask(config.sourceId);
    }

    // 创建定时任务
    const task = cron.schedule(
      config.cronExpression,
      async () => {
        await this.executeTask(config.sourceId);
      },
      {
        scheduled: config.enabled,
        timezone: 'Asia/Shanghai',
      }
    );

    this.taskConfigs.set(config.sourceId, config);
    this.tasks.set(config.sourceId, task);

    console.log(
      `📅 注册同步任务：${config.sourceId}, cron: ${config.cronExpression}`
    );
  }

  /**
   * 取消单个任务
   */
  async unregisterTask(sourceId: string): Promise<void> {
    const task = this.tasks.get(sourceId);
    if (task) {
      task.stop();
      this.tasks.delete(sourceId);
      this.taskConfigs.delete(sourceId);
      console.log(`🗑️  取消同步任务：${sourceId}`);
    }
  }

  /**
   * 执行单个同步任务
   */
  private async executeTask(
    sourceId: string,
    retryAttempt: number = 0
  ): Promise<void> {
    const config = this.taskConfigs.get(sourceId);
    if (!config || !config.enabled) {
      return;
    }

    // 检查是否有相同任务正在运行
    if (this.runningTasks.has(sourceId)) {
      console.warn(`⚠️  任务 ${sourceId} 正在运行，跳过本次执行`);
      return;
    }

    const execution: TaskExecution = {
      taskId: `${sourceId}-${Date.now()}`,
      sourceId,
      startedAt: new Date(),
      retryAttempt,
    };

    this.runningTasks.set(sourceId, execution);

    try {
      console.log(
        `▶️  开始执行同步任务：${sourceId} (尝试 ${retryAttempt + 1}/${config.retryCount + 1})`
      );

      const result = await this.syncService.manualSync(sourceId);

      execution.completedAt = new Date();
      execution.result = result;

      if (result.success) {
        console.log(
          `✅ 同步任务成功：${sourceId}, 总计：${result.total}, 新增：${result.inserted}, 更新：${result.updated}`
        );
      } else {
        console.error(`❌ 同步任务失败：${sourceId}, 错误：${result.error}`);

        // 失败时尝试重试
        if (retryAttempt < config.retryCount) {
          console.log(`🔄 ${config.retryDelay / 1000}秒后重试...`);
          setTimeout(() => {
            this.executeTask(sourceId, retryAttempt + 1);
          }, config.retryDelay);
        }
      }

      // 记录同步历史
      await this.recordSyncHistory(sourceId, execution);
    } catch (error: any) {
      console.error(`❌ 同步任务异常：${sourceId}`, error);

      execution.completedAt = new Date();
      execution.error = error.message;

      // 异常时尝试重试
      if (retryAttempt < config.retryCount) {
        console.log(`🔄 ${config.retryDelay / 1000}秒后重试...`);
        setTimeout(() => {
          this.executeTask(sourceId, retryAttempt + 1);
        }, config.retryDelay);
      } else {
        // 记录错误历史
        await this.recordSyncError(sourceId, error, execution);
      }
    } finally {
      this.runningTasks.delete(sourceId);
    }
  }

  /**
   * 手动触发同步
   */
  async triggerManualSync(sourceId: string): Promise<SyncResult> {
    console.log(`🎯 手动触发同步：${sourceId}`);

    try {
      const result = await this.syncService.manualSync(sourceId);

      if (result.success) {
        console.log(`✅ 手动同步成功：${sourceId}`);
      } else {
        console.error(`❌ 手动同步失败：${sourceId}`);
      }

      return result;
    } catch (error: any) {
      console.error(`❌ 手动同步异常：${sourceId}`, error);
      throw error;
    }
  }

  /**
   * 获取活跃的数据源列表
   */
  private async getActiveDataSources(): Promise<any[]> {
    // 这里应该调用 Supabase 获取数据
    // 为简化代码，返回示例数据
    return [
      {
        id: 'sample-source-1',
        name: '零配件数据库',
        type: 'parts',
        sync_frequency: 300, // 5 分钟
        sync_enabled: true,
      },
    ];
  }

  /**
   * 将同步频率转换为 Cron 表达式
   */
  private frequencyToCron(frequencySeconds: number): string {
    if (frequencySeconds <= 60) {
      return '* * * * *'; // 每分钟
    } else if (frequencySeconds <= 300) {
      return '*/5 * * * *'; // 每 5 分钟
    } else if (frequencySeconds <= 900) {
      return '*/15 * * * *'; // 每 15 分钟
    } else if (frequencySeconds <= 1800) {
      return '*/30 * * * *'; // 每 30 分钟
    } else if (frequencySeconds <= 3600) {
      return '0 * * * *'; // 每小时
    } else if (frequencySeconds <= 21600) {
      return '0 */6 * * *'; // 每 6 小时
    } else if (frequencySeconds <= 43200) {
      return '0 */12 * * *'; // 每 12 小时
    } else {
      return '0 0 * * *'; // 每天
    }
  }

  /**
   * 记录同步历史
   */
  private async recordSyncHistory(
    sourceId: string,
    execution: TaskExecution
  ): Promise<void> {
    if (!execution.result) {
      return;
    }

    const duration = execution.completedAt
      ? (execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000
      : 0;

    // TODO: 使用 Supabase 插入 sync_history 表
    console.log('📊 记录同步历史:', {
      source_id: sourceId,
      records_synced: execution.result.total,
      records_inserted: execution.result.inserted,
      records_updated: execution.result.updated,
      records_deleted: execution.result.deleted,
      records_failed: execution.result.failed,
      status: execution.result.success ? 'success' : 'failed',
      duration_seconds: duration.toFixed(2),
    });
  }

  /**
   * 记录同步错误
   */
  private async recordSyncError(
    sourceId: string,
    error: any,
    execution: TaskExecution
  ): Promise<void> {
    const duration = execution.completedAt
      ? (execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000
      : 0;

    // TODO: 使用 Supabase 插入 sync_history 表
    console.log('❌ 记录同步错误:', {
      source_id: sourceId,
      status: 'failed',
      error_message: error.message,
      error_details: JSON.stringify({
        stack: error.stack,
        retry_attempt: execution.retryAttempt,
        timestamp: execution.startedAt.toISOString(),
      }),
      duration_seconds: duration.toFixed(2),
    });
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(sourceId: string): {
    registered: boolean;
    enabled: boolean;
    running: boolean;
  } {
    const registered = this.tasks.has(sourceId);
    const config = this.taskConfigs.get(sourceId);
    const enabled = config?.enabled || false;
    const running = this.runningTasks.has(sourceId);

    return { registered, enabled, running };
  }

  /**
   * 停止所有任务
   */
  stopAllTasks(): void {
    console.log('🛑 停止所有同步任务...');

    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
    this.taskConfigs.clear();

    console.log('✅ 所有同步任务已停止');
  }
}

// 导出单例
let schedulerInstance: DataSyncScheduler | null = null;

export function getDataSyncScheduler(
  supabaseUrl: string,
  supabaseKey: string
): DataSyncScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new DataSyncScheduler(supabaseUrl, supabaseKey);
  }
  return schedulerInstance;
}
