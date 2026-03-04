/**
 * 异步任务处理? * 处理耗时操作，避免阻塞主线程
 */

// 类型定义
interface AsyncTaskConfig {
  maxConcurrency: number;
  queueSize: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface TaskQueueItem<T = any> {
  id: string;
  task: () => Promise<T>;
  priority: number;
  createdAt: number;
  retries: number;
  timeout?: number;
}

export interface TaskResult<T = any> {
  taskId: string;
  success: boolean;
  result?: T;
  error?: string;
  duration: number;
  completedAt: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
}

export class AsyncTaskProcessor {
  private config: AsyncTaskConfig;
  private taskQueue: TaskQueueItem[] = [];
  private processingTasks: Map<
    string,
    { startTime: number; timeoutId?: NodeJS.Timeout }
  > = new Map();
  private completedTasks: TaskResult[] = [];
  private workerPool: Promise<any>[] = [];
  private isRunning: boolean = false;
  private stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    averageProcessingTime: 0,
  };

  constructor(config: Partial<AsyncTaskConfig> = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency || 5,
      queueSize: config.queueSize || 100,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  /**
   * 添加异步任务到队?   */
  async addTask<T>(
    task: () => Promise<T>,
    priority: number = 0,
    timeout?: number
  ): Promise<string> {
    // 检查队列大小限?    if (this.taskQueue.length >= this.config.queueSize) {
      throw new Error('Task queue is full');
    }

    const taskId = this.generateTaskId();
    const queueItem: TaskQueueItem<T> = {
      id: taskId,
      task,
      priority,
      createdAt: Date.now(),
      retries: 0,
      timeout: timeout || this.config.timeout,
    };

    // 按优先级插入队列
    this.insertTaskByPriority(queueItem);
    this.updateStats();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Task queued: ${taskId} (priority: ${priority})`);

    // 如果处理器未运行，启动它
    if (!this.isRunning) {
      this.startProcessing();
    }

    return taskId;
  }

  /**
   * 按优先级插入任务
   */
  private insertTaskByPriority<T>(task: TaskQueueItem<T>): void {
    let insertIndex = 0;
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (this.taskQueue[i].priority < task.priority) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }
    this.taskQueue.splice(insertIndex, 0, task);
  }

  /**
   * 启动任务处理
   */
  private async startProcessing(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Async task processor started')while (this.isRunning && this.taskQueue.length > 0) {
      // 控制并发数量
      while (
        this.processingTasks.size < this.config.maxConcurrency &&
        this.taskQueue.length > 0
      ) {
        const task = this.taskQueue.shift();
        if (task) {
          this.processTask(task);
        }
      }

      // 等待一段时间再检?      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isRunning = false;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Async task processor stopped')}

  /**
   * 处理单个任务
   */
  private async processTask<T>(taskItem: TaskQueueItem<T>): Promise<void> {
    const startTime = Date.now();

    // 记录正在处理的任?    this.processingTasks.set(taskItem.id, { startTime });
    this.updateStats();

    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Task timeout after ${taskItem.timeout}ms`));
        }, taskItem.timeout);

        // 保存timeoutId以便清理
        const taskInfo = this.processingTasks.get(taskItem.id);
        if (taskInfo) {
          taskInfo.timeoutId = timeoutId;
        }
      });

      // 执行任务
      const taskPromise = taskItem.task();
      const result = await Promise.race([taskPromise, timeoutPromise]);

      // 任务成功完成
      const duration = Date.now() - startTime;
      const taskResult: TaskResult<T> = {
        taskId: taskItem.id,
        success: true,
        result,
        duration,
        completedAt: Date.now(),
      };

      this.completedTasks.push(taskResult);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Task completed: ${taskItem.id} (${duration}ms)`);
    } catch (error) {
      // 任务失败，考虑重试
      if (taskItem.retries < this.config.retryAttempts) {
        taskItem.retries++;
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `Task failed, retrying (${taskItem.retries}/${this.config.retryAttempts}): ${taskItem.id}`
        );

        // 延迟后重新加入队?        setTimeout(() => {
          this.taskQueue.unshift(taskItem);
          if (!this.isRunning) {
            this.startProcessing();
          }
        }, this.config.retryDelay);
      } else {
        // 达到最大重试次数，标记为失?        const duration = Date.now() - startTime;
        const taskResult: TaskResult = {
          taskId: taskItem.id,
          success: false,
          error: (error as Error).message,
          duration,
          completedAt: Date.now(),
        };

        this.completedTasks.push(taskResult);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `Task failed permanently: ${taskItem.id} - ${(error as Error).message}`
        );
      }
    } finally {
      // 清理资源
      const taskInfo = this.processingTasks.get(taskItem.id);
      if (taskInfo?.timeoutId) {
        clearTimeout(taskInfo.timeoutId);
      }
      this.processingTasks.delete(taskItem.id);
      this.updateStats();
    }
  }

  /**
   * 获取任务结果
   */
  async getTaskResult(taskId: string): Promise<TaskResult | null> {
    const result = this.completedTasks.find(task => task.taskId === taskId);
    if (result) {
      return result;
    }

    // 如果任务还在处理中，返回处理状?    if (this.processingTasks.has(taskId)) {
      const taskInfo = this.processingTasks.get(taskId)!;
      return {
        taskId,
        success: false,
        error: 'Task is still processing',
        duration: Date.now() - taskInfo.startTime,
        completedAt: 0,
      };
    }

    return null;
  }

  /**
   * 等待任务完成
   */
  async waitForTask(
    taskId: string,
    timeout: number = 30000
  ): Promise<TaskResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await this.getTaskResult(taskId);
      if (
        result &&
        (result.success || result.error !== 'Task is still processing')
      ) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Task ${taskId} did not complete within ${timeout}ms`);
  }

  /**
   * 批量添加任务
   */
  async addBatchTasks<T>(
    tasks: Array<() => Promise<T>>,
    priorities?: number[]
  ): Promise<string[]> {
    const taskIds: string[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const priority = priorities?.[i] || 0;
      const taskId = await this.addTask(tasks[i], priority);
      taskIds.push(taskId);
    }

    return taskIds;
  }

  /**
   * 获取队列统计信息
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const totalCompleted = this.completedTasks.length;
    const totalDuration = this.completedTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );

    this.stats = {
      pending: this.taskQueue.length,
      processing: this.processingTasks.size,
      completed: this.completedTasks.filter(t => t.success).length,
      failed: this.completedTasks.filter(t => !t.success).length,
      averageProcessingTime:
        totalCompleted > 0 ? totalDuration / totalCompleted : 0,
    };
  }

  /**
   * 清空队列
   */
  async clear(): Promise<void> {
    // 清理正在进行的任?    for (const [taskId, taskInfo] of this.processingTasks.entries()) {
      if (taskInfo.timeoutId) {
        clearTimeout(taskInfo.timeoutId);
      }
    }

    this.taskQueue = [];
    this.processingTasks.clear();
    this.completedTasks = [];
    this.updateStats();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Async task queue cleared')}

  /**
   * 停止处理?   */
  async stop(): Promise<void> {
    this.isRunning = false;
    await this.clear();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Async task processor stopped')}

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const asyncTaskProcessor = new AsyncTaskProcessor({
  maxConcurrency: 5,
  queueSize: 100,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
});
