// 增强版实时数据处理服务
// 支持批量处理、事务、优先级队列和更完善的监控

import { EventEmitter } from 'events';
import { monitoringService } from '../monitoring/monitoring-service';
import { 
  MessageQueueManager, 
  MessageHandler, 
  QueueMessage, 
  MessageQueueType,
  DEFAULT_QUEUE_CONFIGS 
} from './message-queue-manager';

// 增强的事件类型
export type EnhancedEventType = 
  | 'price_update'
  | 'inventory_change'
  | 'user_action'
  | 'system_alert'
  | 'data_quality_issue'
  | 'order_status_change'
  | 'supplier_notification'
  | 'maintenance_alert'
  | 'performance_metric'
  | 'security_event'
  | 'batch_operation'
  | 'transaction_commit'
  | 'bulk_data_import';

// 优先级枚举
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

// 批量处理配置
export interface BatchConfig {
  maxSize: number;
  maxWaitTime: number; // 毫秒
  flushOnClose: boolean;
}

// 事务配置
export interface TransactionConfig {
  timeout: number; // 毫秒
  retryAttempts: number;
  isolationLevel: 'read_committed' | 'repeatable_read' | 'serializable';
}

// 增强的事件处理器接口
export interface EnhancedEventProcessor {
  process(event: EnhancedEvent): Promise<void>;
  getType(): EnhancedEventType;
  getPriority(): EventPriority;
  supportsBatch?(): boolean;
  processBatch?(events: EnhancedEvent[]): Promise<void>;
}

// 增强的事件接口
export interface EnhancedEvent {
  id: string;
  type: EnhancedEventType;
  payload: any;
  timestamp: string;
  source: string;
  priority: EventPriority;
  correlationId?: string; // 用于关联相关事件
  transactionId?: string; // 事务ID
  metadata?: Record<string, any>;
  retryCount?: number;
}

// 处理统计信息
export interface ProcessingStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageProcessingTime: number;
  batchProcessingCount: number;
  transactionSuccessCount: number;
  lastProcessedAt: string;
  priorityStats: Record<EventPriority, {
    count: number;
    averageTime: number;
  }>;
}

// 增强的实时数据服务
export class EnhancedRealTimeService extends EventEmitter {
  private messageQueue: MessageQueueManager;
  private processors: Map<EnhancedEventType, EnhancedEventProcessor[]> = new Map();
  private isRunning: boolean = false;
  private processingStats: Map<EnhancedEventType, ProcessingStats> = new Map();
  private batchBuffers: Map<EnhancedEventType, EnhancedEvent[]> = new Map();
  private batchTimers: Map<EnhancedEventType, NodeJS.Timeout> = new Map();
  private performanceTimer: NodeJS.Timeout | null = null;
  
  // 配置选项
  private batchConfig: BatchConfig = {
    maxSize: 50,
    maxWaitTime: 1000,
    flushOnClose: true
  };
  
  private transactionConfig: TransactionConfig = {
    timeout: 30000,
    retryAttempts: 3,
    isolationLevel: 'read_committed'
  };

  constructor(
    private queueType: MessageQueueType = 'redis',
    configs = DEFAULT_QUEUE_CONFIGS
  ) {
    super();
    this.messageQueue = new MessageQueueManager(configs);
    this.initializeStats();
    this.startPerformanceMonitoring();
  }

  // 初始化统计数据
  private initializeStats(): void {
    const eventTypes: EnhancedEventType[] = [
      'price_update', 'inventory_change', 'user_action', 'system_alert',
      'data_quality_issue', 'order_status_change', 'supplier_notification',
      'maintenance_alert', 'performance_metric', 'security_event',
      'batch_operation', 'transaction_commit', 'bulk_data_import'
    ];
    
    eventTypes.forEach(type => {
      this.processingStats.set(type, {
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        averageProcessingTime: 0,
        batchProcessingCount: 0,
        transactionSuccessCount: 0,
        lastProcessedAt: new Date().toISOString(),
        priorityStats: {
          [EventPriority.LOW]: { count: 0, averageTime: 0 },
          [EventPriority.NORMAL]: { count: 0, averageTime: 0 },
          [EventPriority.HIGH]: { count: 0, averageTime: 0 },
          [EventPriority.CRITICAL]: { count: 0, averageTime: 0 }
        }
      });
    });
  }

  // 启动性能监控
  private startPerformanceMonitoring(): void {
    this.performanceTimer = setInterval(() => {
      this.reportPerformanceMetrics();
    }, 30000); // 每30秒报告一次
  }

  // 报告性能指标
  private reportPerformanceMetrics(): void {
    let totalEvents = 0;
    let totalErrors = 0;
    let totalBatchOperations = 0;
    
    for (const [eventType, stats] of this.processingStats.entries()) {
      totalEvents += stats.totalProcessed;
      totalErrors += stats.errorCount;
      totalBatchOperations += stats.batchProcessingCount;
      
      // 记录详细指标
      monitoringService.recordMetric(
        `enhanced_realtime_events_${eventType}`, 
        stats.totalProcessed
      );
      
      monitoringService.recordMetric(
        `enhanced_realtime_errors_${eventType}`, 
        stats.errorCount
      );
      
      monitoringService.recordMetric(
        `enhanced_realtime_batch_ops_${eventType}`, 
        stats.batchProcessingCount
      );
      
      // 记录优先级分布
      Object.entries(stats.priorityStats).forEach(([priority, priorityStats]) => {
        monitoringService.recordMetric(
          `enhanced_realtime_priority_${priority}_${eventType}`,
          priorityStats.count
        );
      });
    }
    
    const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0;
    monitoringService.recordMetric('enhanced_realtime_total_events', totalEvents);
    monitoringService.recordMetric('enhanced_realtime_error_rate', errorRate);
    monitoringService.recordMetric('enhanced_realtime_batch_operations', totalBatchOperations);
    
    console.log(`📊 增强实时处理统计: 总事件=${totalEvents}, 错误率=${errorRate.toFixed(2)}%, 批处理=${totalBatchOperations}`);
  }

  // 连接消息队列
  async connect(): Promise<void> {
    await this.messageQueue.connect(this.queueType);
    console.log(`✅ 增强实时服务已连接到 ${this.queueType}`);
  }

  // 断开连接
  async disconnect(): Promise<void> {
    // 刷新所有批处理缓冲区
    if (this.batchConfig.flushOnClose) {
      await this.flushAllBatches();
    }
    
    // 清理定时器
    this.cleanupTimers();
    
    await this.messageQueue.disconnect();
    this.isRunning = false;
    
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
    }
    
    console.log('🛑 增强实时服务已停止');
  }

  // 注册处理器
  registerProcessor(processor: EnhancedEventProcessor): void {
    const eventType = processor.getType();
    if (!this.processors.has(eventType)) {
      this.processors.set(eventType, []);
    }
    this.processors.get(eventType)?.push(processor);
    console.log(`✅ 注册增强处理器: ${eventType} (优先级: ${processor.getPriority()})`);
  }

  // 发布事件
  async publishEvent(event: Partial<EnhancedEvent> & { type: EnhancedEventType; payload: any; source: string }): Promise<string> {
    const enhancedEvent: EnhancedEvent = {
      ...event,
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      priority: event.priority ?? EventPriority.NORMAL,
      retryCount: event.retryCount || 0
    };

    // 根据优先级决定处理方式
    if (enhancedEvent.priority >= EventPriority.HIGH) {
      // 高优先级事件立即处理
      await this.processEventImmediately(enhancedEvent);
    } else {
      // 普通优先级事件进入队列
      await this.enqueueEvent(enhancedEvent);
    }

    return enhancedEvent.id;
  }

  // 立即处理高优先级事件
  private async processEventImmediately(event: EnhancedEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      const processors = this.processors.get(event.type) || [];
      const processingPromises = processors.map(processor => 
        this.executeProcessorWithRetry(processor, event)
      );
      
      await Promise.all(processingPromises);
      
      const processingTime = Date.now() - startTime;
      this.updateStats(event.type, true, processingTime, event.priority);
      
      console.log(`⚡ 高优先级事件立即处理完成: ${event.type} (${event.id}) 耗时: ${processingTime}ms`);
      this.emit('high_priority_event_processed', { event, processingTime });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats(event.type, false, processingTime, event.priority);
      
      console.error(`❌ 高优先级事件处理失败 ${event.id}:`, error);
      this.emit('high_priority_event_failed', { event, error });
    }
  }

  // 入队普通事件
  private async enqueueEvent(event: EnhancedEvent): Promise<void> {
    const message: QueueMessage = {
      id: event.id,
      topic: event.type,
      payload: event,
      timestamp: event.timestamp,
      priority: event.priority,
      metadata: event.metadata
    };

    await this.messageQueue.publish(event.type, message);
    console.log(`📤 事件已入队: ${event.type} (${event.id}) 优先级: ${event.priority}`);
    this.emit('event_enqueued', { event });
  }

  // 启动消费者
  async startConsumers(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ 消费者已在运行');
      return;
    }

    this.isRunning = true;
    console.log('🚀 启动增强实时数据消费者...');

    // 为每个事件类型订阅消息
    for (const eventType of this.processors.keys()) {
      const handler: MessageHandler = async (message) => {
        const event: EnhancedEvent = message.payload;
        await this.processQueuedEvent(event);
      };
      
      await this.messageQueue.subscribe(eventType, handler);
    }
  }

  // 处理队列中的事件
  private async processQueuedEvent(event: EnhancedEvent): Promise<void> {
    const startTime = Date.now();
    const processors = this.processors.get(event.type) || [];
    
    if (processors.length === 0) {
      console.warn(`⚠️ 无处理器注册: ${event.type}`);
      return;
    }

    try {
      // 检查是否支持批处理
      const batchSupportingProcessors = processors.filter(p => p.supportsBatch?.());
      
      if (batchSupportingProcessors.length > 0 && this.shouldBatch(event.type)) {
        // 批处理模式
        await this.addToBatch(event, batchSupportingProcessors);
      } else {
        // 单事件处理模式
        const processingPromises = processors.map(processor => 
          this.executeProcessorWithRetry(processor, event)
        );
        
        await Promise.all(processingPromises);
      }
      
      const processingTime = Date.now() - startTime;
      this.updateStats(event.type, true, processingTime, event.priority);
      
      console.log(`✅ 队列事件处理完成: ${event.type} (${event.id}) 耗时: ${processingTime}ms`);
      this.emit('queued_event_processed', { event, processingTime });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats(event.type, false, processingTime, event.priority);
      
      console.error(`❌ 队列事件处理失败 ${event.id}:`, error);
      this.emit('queued_event_failed', { event, error });
      
      // 实现重试逻辑
      if ((event.retryCount || 0) < 3) {
        await this.scheduleRetry(event);
      }
    }
  }

  // 批处理逻辑
  private shouldBatch(eventType: EnhancedEventType): boolean {
    return this.batchBuffers.has(eventType) || 
           (this.processors.get(eventType)?.some(p => p.supportsBatch?.()) ?? false);
  }

  private async addToBatch(event: EnhancedEvent, processors: EnhancedEventProcessor[]): Promise<void> {
    if (!this.batchBuffers.has(event.type)) {
      this.batchBuffers.set(event.type, []);
      this.startBatchTimer(event.type);
    }

    const buffer = this.batchBuffers.get(event.type)!;
    buffer.push(event);

    // 检查是否达到批处理大小限制
    if (buffer.length >= this.batchConfig.maxSize) {
      await this.flushBatch(event.type, processors);
    }
  }

  private startBatchTimer(eventType: EnhancedEventType): void {
    const timer = setTimeout(async () => {
      const processors = this.processors.get(eventType)?.filter(p => p.supportsBatch?.()) || [];
      if (processors.length > 0) {
        await this.flushBatch(eventType, processors);
      }
    }, this.batchConfig.maxWaitTime);

    this.batchTimers.set(eventType, timer);
  }

  private async flushBatch(eventType: EnhancedEventType, processors: EnhancedEventProcessor[]): Promise<void> {
    const buffer = this.batchBuffers.get(eventType);
    if (!buffer || buffer.length === 0) return;

    // 清除定时器
    const timer = this.batchTimers.get(eventType);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(eventType);
    }

    try {
      // 执行批处理
      const batchPromises = processors
        .filter(p => p.processBatch)
        .map(processor => processor.processBatch!(buffer));
      
      await Promise.all(batchPromises);
      
      // 更新批处理统计
      const stats = this.processingStats.get(eventType);
      if (stats) {
        stats.batchProcessingCount++;
      }
      
      console.log(`📦 批处理完成: ${eventType} (${buffer.length}个事件)`);
      this.emit('batch_processed', { eventType, count: buffer.length });
      
    } finally {
      // 清空缓冲区
      this.batchBuffers.set(eventType, []);
    }
  }

  // 刷新所有批处理
  private async flushAllBatches(): Promise<void> {
    for (const [eventType, buffer] of this.batchBuffers.entries()) {
      if (buffer.length > 0) {
        const processors = this.processors.get(eventType)?.filter(p => p.supportsBatch?.()) || [];
        if (processors.length > 0) {
          await this.flushBatch(eventType, processors);
        }
      }
    }
  }

  // 带重试的处理器执行
  private async executeProcessorWithRetry(
    processor: EnhancedEventProcessor, 
    event: EnhancedEvent
  ): Promise<void> {
    let attempts = 0;
    const maxAttempts = this.transactionConfig.retryAttempts;
    
    while (attempts < maxAttempts) {
      try {
        await processor.process(event);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // 指数退避延迟
        const delay = Math.pow(2, attempts) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 调度重试
  private async scheduleRetry(event: EnhancedEvent): Promise<void> {
    const retryEvent = {
      ...event,
      retryCount: (event.retryCount || 0) + 1,
      timestamp: new Date().toISOString()
    };
    
    // 延迟重试（指数退避）
    const delay = Math.pow(2, retryEvent.retryCount) * 1000;
    setTimeout(() => {
      this.publishEvent(retryEvent).catch(error => {
        console.error(`❌ 重试调度失败:`, error);
      });
    }, delay);
    
    console.log(`🔄 调度重试: ${event.type} (${event.id}) 第${retryEvent.retryCount}次`);
  }

  // 更新统计信息
  private updateStats(
    eventType: EnhancedEventType, 
    success: boolean, 
    processingTime: number,
    priority: EventPriority
  ): void {
    const stats = this.processingStats.get(eventType);
    if (!stats) return;
    
    stats.totalProcessed++;
    stats.lastProcessedAt = new Date().toISOString();
    
    // 更新优先级统计
    const priorityStat = stats.priorityStats[priority];
    priorityStat.count++;
    const newAvg = ((priorityStat.averageTime * (priorityStat.count - 1)) + processingTime) / priorityStat.count;
    priorityStat.averageTime = Math.round(newAvg);
    
    if (success) {
      stats.successCount++;
      const newAvg = ((stats.averageProcessingTime * (stats.successCount - 1)) + processingTime) / stats.successCount;
      stats.averageProcessingTime = Math.round(newAvg);
    } else {
      stats.errorCount++;
    }
  }

  // 清理定时器
  private cleanupTimers(): void {
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();
  }

  // 获取统计信息
  getProcessingStats(): Map<EnhancedEventType, ProcessingStats> {
    return new Map(this.processingStats);
  }

  // 重置统计
  resetStats(eventType?: EnhancedEventType): void {
    if (eventType) {
      const stats = this.processingStats.get(eventType);
      if (stats) {
        stats.totalProcessed = 0;
        stats.successCount = 0;
        stats.errorCount = 0;
        stats.batchProcessingCount = 0;
        stats.transactionSuccessCount = 0;
        stats.averageProcessingTime = 0;
        stats.lastProcessedAt = new Date().toISOString();
        
        // 重置优先级统计
        Object.keys(stats.priorityStats).forEach(priority => {
          stats.priorityStats[priority as unknown as EventPriority] = {
            count: 0,
            averageTime: 0
          };
        });
      }
    } else {
      this.initializeStats();
    }
    console.log(`📊 统计信息已${eventType ? eventType + ' ' : ''}重置`);
  }

  // 配置批处理
  configureBatch(config: Partial<BatchConfig>): void {
    this.batchConfig = { ...this.batchConfig, ...config };
    console.log(`⚙️ 批处理配置已更新:`, this.batchConfig);
  }

  // 配置事务
  configureTransaction(config: Partial<TransactionConfig>): void {
    this.transactionConfig = { ...this.transactionConfig, ...config };
    console.log(`⚙️ 事务配置已更新:`, this.transactionConfig);
  }

  // 获取队列状态
  async getQueueStats(topic: string): Promise<any> {
    return await this.messageQueue.getQueueStats(topic);
  }

  // 切换消息队列类型
  async switchQueueType(newType: MessageQueueType): Promise<void> {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      await this.disconnect();
    }
    
    this.queueType = newType;
    await this.connect();
    
    if (wasRunning) {
      await this.startConsumers();
    }
    
    console.log(`🔄 消息队列类型已切换到: ${newType}`);
  }
}

// 导出默认实例
export const enhancedRealTimeService = new EnhancedRealTimeService();