// 实时数据处理核心服务
// 基于Redis Streams实现消息队列处理

// @ts-ignore
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { monitoringService } from '../monitoring/monitoring-service';

// 实时数据事件类型
export type RealTimeEventType = 
  | 'price_update'
  | 'inventory_change'
  | 'user_action'
  | 'system_alert'
  | 'data_quality_issue'
  | 'order_status_change'
  | 'supplier_notification'
  | 'maintenance_alert'
  | 'performance_metric'
  | 'security_event';

// 实时数据事件接口
export interface RealTimeEvent {
  id: string;
  type: RealTimeEventType;
  payload: any;
  timestamp: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
}

// 消费者组配置
export interface ConsumerGroupConfig {
  groupName: string;
  consumerName: string;
  streamKey: string;
  batchSize: number;
  blockTime: number; // 毫秒
}

// 实时处理器接口
export interface RealTimeProcessor {
  process(event: RealTimeEvent): Promise<void>;
  getType(): RealTimeEventType;
}

// Redis Stream配置
const REDIS_STREAM_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3
};

// 事件处理统计
interface EventProcessingStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageProcessingTime: number;
  lastProcessedAt: string;
}

// 实时数据处理服务
export class RealTimeDataService extends EventEmitter {
  private redisClient: Redis;
  private processors: Map<RealTimeEventType, RealTimeProcessor[]> = new Map();
  public consumerGroups: Map<string, ConsumerGroupConfig> = new Map();
  private isRunning: boolean = false;
  private processingStats: Map<RealTimeEventType, EventProcessingStats> = new Map();
  private performanceTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.redisClient = new Redis(REDIS_STREAM_CONFIG);
    this.setupRedisEvents();
    this.initializeStats();
    this.startPerformanceMonitoring();
  }

  // 初始化统计数据
  private initializeStats(): void {
    // 为所有事件类型初始化统计
    const eventTypes: RealTimeEventType[] = [
      'price_update', 'inventory_change', 'user_action', 'system_alert',
      'data_quality_issue', 'order_status_change', 'supplier_notification',
      'maintenance_alert', 'performance_metric', 'security_event'
    ];
    
    eventTypes.forEach(type => {
      this.processingStats.set(type, {
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        averageProcessingTime: 0,
        lastProcessedAt: new Date().toISOString()
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
    
    for (const [eventType, stats] of this.processingStats.entries()) {
      totalEvents += stats.totalProcessed;
      totalErrors += stats.errorCount;
      
      // 记录每个事件类型的处理速率
      monitoringService.recordMetric(
        `realtime_events_processed_${eventType}`, 
        stats.totalProcessed
      );
      
      monitoringService.recordMetric(
        `realtime_processing_errors_${eventType}`, 
        stats.errorCount
      );
    }
    
    // 记录总体指标
    monitoringService.recordMetric('realtime_total_events_processed', totalEvents);
    monitoringService.recordMetric('realtime_total_errors', totalErrors);
    
    const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0;
    monitoringService.recordMetric('realtime_error_rate', errorRate);
    
    console.log(`📊 实时处理统计: 总事件=${totalEvents}, 错误=${totalErrors}, 错误率=${errorRate.toFixed(2)}%`);
  }

  // 设置Redis事件监听
  private setupRedisEvents(): void {
    this.redisClient.on('connect', () => {
      console.log('✅ Redis Stream连接成功');
    });

    this.redisClient.on('error', (error: any) => {
      console.error('❌ Redis Stream连接错误:', error);
      this.emit('error', error);
    });

    this.redisClient.on('ready', () => {
      console.log('✅ Redis Stream准备就绪');
    });
  }

  // 注册实时处理器
  registerProcessor(processor: RealTimeProcessor): void {
    const eventType = processor.getType();
    if (!this.processors.has(eventType)) {
      this.processors.set(eventType, []);
    }
    this.processors.get(eventType)?.push(processor);
    console.log(`✅ 注册处理器: ${eventType}`);
  }

  // 创建消费者组
  async createConsumerGroup(config: ConsumerGroupConfig): Promise<void> {
    try {
      // 创建Stream（如果不存在）
      await this.redisClient.xadd(config.streamKey, '*', 'init', 'true');
      
      // 创建消费者组
      await this.redisClient.xgroup(
        'CREATE',
        config.streamKey,
        config.groupName,
        '$',
        'MKSTREAM'
      );
      
      this.consumerGroups.set(config.groupName, config);
      console.log(`✅ 创建消费者组: ${config.groupName}`);
      
    } catch (error) {
      if (!(error as Error).message.includes('BUSYGROUP')) {
        throw error;
      }
      // 消费者组已存在，继续使用
      this.consumerGroups.set(config.groupName, config);
      console.log(`✅ 使用现有消费者组: ${config.groupName}`);
    }
  }

  // 发布实时事件
  async publishEvent(event: RealTimeEvent): Promise<string> {
    try {
      const streamKey = `stream:${event.type}`;
      const eventId = await this.redisClient.xadd(
        streamKey,
        '*',
        'type', event.type,
        'payload', JSON.stringify(event.payload),
        'timestamp', event.timestamp,
        'source', event.source,
        'priority', event.priority
      );
      
      console.log(`📤 发布事件: ${event.type} (${eventId})`);
      this.emit('event_published', { event, eventId });
      return eventId!;
    } catch (error) {
      console.error('❌ 发布事件失败:', error);
      throw error;
    }
  }

  // 启动消费者
  async startConsumers(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ 消费者已在运行');
      return;
    }

    this.isRunning = true;
    console.log('🚀 启动实时数据消费者...');

    for (const [groupName, config] of this.consumerGroups.entries()) {
      this.startConsumerLoop(config);
    }
  }

  // 消费者循环
  private async startConsumerLoop(config: ConsumerGroupConfig): Promise<void> {
    while (this.isRunning) {
      try {
        // 读取消息
        const messages = await this.redisClient.xreadgroup(
          'GROUP',
          config.groupName,
          config.consumerName,
          'BLOCK',
          config.blockTime,
          'COUNT',
          config.batchSize,
          'STREAMS',
          config.streamKey,
          '>'
        );

        if (messages && messages.length > 0) {
          const [, streamMessages] = messages[0];
          
          // 处理每条消息
          for (const [messageId, messageData] of streamMessages) {
            await this.processMessage(messageId, messageData, config);
          }
        }

      } catch (error) {
        console.error(`❌ 消费者 ${config.consumerName} 处理错误:`, error);
        await this.sleep(1000); // 错误后短暂休眠
      }
    }
  }

  // 处理单条消息
  private async processMessage(
    messageId: string,
    messageData: string[],
    config: ConsumerGroupConfig
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 解析消息数据
      const eventData = this.parseEventData(messageData);
      
      // 更新统计信息
      this.updateStats(eventData.type, true, 0);
      
      // 获取对应的处理器
      const processors = this.processors.get(eventData.type) || [];
      
      if (processors.length === 0) {
        console.warn(`⚠️ 无处理器注册: ${eventData.type}`);
        // 确认消息处理完成（即使没有处理器也要确认）
        await this.redisClient.xack(config.streamKey, config.groupName, messageId);
        return;
      }
      
      // 并行处理
      const processingPromises = processors.map(processor => 
        this.executeProcessorWithTimeout(processor, eventData, 5000) // 5秒超时
      );

      await Promise.all(processingPromises);
      
      // 确认消息处理完成
      await this.redisClient.xack(config.streamKey, config.groupName, messageId);
      
      const processingTime = Date.now() - startTime;
      this.updateStats(eventData.type, true, processingTime);
      
      console.log(`✅ 处理完成: ${eventData.type} (${messageId}) 耗时: ${processingTime}ms`);
      this.emit('event_processed', { eventId: messageId, eventType: eventData.type, processingTime });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats((this.parseEventData(messageData)).type, false, processingTime);
      
      console.error(`❌ 消息处理失败 ${messageId}:`, error);
      
      // 实现死信队列机制
      await this.handleDeadLetterMessage(messageId, messageData, config, error);
      
      // 记录到监控系统
      monitoringService.recordMetric('realtime_processing_failures', 1, {
        messageType: (this.parseEventData(messageData)).type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 带超时的处理器执行
  private async executeProcessorWithTimeout(
    processor: RealTimeProcessor, 
    event: RealTimeEvent, 
    timeoutMs: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`处理器执行超时: ${timeoutMs}ms`));
      }, timeoutMs);
      
      processor.process(event)
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  // 更新处理统计
  private updateStats(eventType: RealTimeEventType, success: boolean, processingTime: number): void {
    const stats = this.processingStats.get(eventType);
    if (!stats) return;
    
    stats.totalProcessed++;
    stats.lastProcessedAt = new Date().toISOString();
    
    if (success) {
      stats.successCount++;
      // 更新平均处理时间
      const currentAvg = stats.averageProcessingTime;
      const newAvg = ((currentAvg * (stats.successCount - 1)) + processingTime) / stats.successCount;
      stats.averageProcessingTime = Math.round(newAvg);
    } else {
      stats.errorCount++;
    }
  }

  // 处理死信消息
  private async handleDeadLetterMessage(
    messageId: string,
    messageData: string[],
    config: ConsumerGroupConfig,
    error: any
  ): Promise<void> {
    try {
      const deadLetterKey = `dead_letter:${config.streamKey}`;
      const eventData = this.parseEventData(messageData);
      
      // 将消息移动到死信队列
      await this.redisClient.hset(deadLetterKey, messageId, JSON.stringify({
        originalMessage: messageData,
        error: error.message,
        timestamp: new Date().toISOString(),
        eventType: eventData.type
      }));
      
      // 设置过期时间（7天）
      await this.redisClient.expire(deadLetterKey, 7 * 24 * 60 * 60);
      
      console.log(`💀 消息已移至死信队列: ${messageId} (${eventData.type})`);
      
    } catch (dlqError) {
      console.error(`❌ 死信队列处理失败:`, dlqError);
    }
  }

  // 解析事件数据
  private parseEventData(messageData: string[]): RealTimeEvent {
    const dataMap: Record<string, string> = {};
    
    for (let i = 0; i < messageData.length; i += 2) {
      dataMap[messageData[i]] = messageData[i + 1];
    }

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: dataMap.type as RealTimeEventType,
      payload: JSON.parse(dataMap.payload),
      timestamp: dataMap.timestamp,
      source: dataMap.source,
      priority: dataMap.priority as any
    };
  }

  // 获取Stream信息
  async getStreamInfo(streamKey: string): Promise<any> {
    try {
      const info = await this.redisClient.xinfo('STREAM', streamKey);
      return info;
    } catch (error) {
      console.error('❌ 获取Stream信息失败:', error);
      throw error;
    }
  }

  // 获取消费者组信息
  async getConsumerGroupInfo(streamKey: string, groupName: string): Promise<any> {
    try {
      const info = await this.redisClient.xinfo('GROUPS', streamKey);
      return info.find((group: any) => group[1] === groupName);
    } catch (error) {
      console.error('❌ 获取消费者组信息失败:', error);
      throw error;
    }
  }

  // 获取处理统计信息
  getProcessingStats(): Map<RealTimeEventType, EventProcessingStats> {
    return new Map(this.processingStats);
  }

  // 获取特定事件类型的统计
  getEventTypeStats(eventType: RealTimeEventType): EventProcessingStats | undefined {
    return this.processingStats.get(eventType);
  }

  // 重置统计信息
  resetStats(eventType?: RealTimeEventType): void {
    if (eventType) {
      const stats = this.processingStats.get(eventType);
      if (stats) {
        stats.totalProcessed = 0;
        stats.successCount = 0;
        stats.errorCount = 0;
        stats.averageProcessingTime = 0;
        stats.lastProcessedAt = new Date().toISOString();
      }
    } else {
      // 重置所有统计
      this.initializeStats();
    }
    console.log(`📊 统计信息已${eventType ? eventType + ' ' : ''}重置`);
  }

  // 停止服务
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // 停止性能监控
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
    }
    
    // 报告最终统计
    this.reportPerformanceMetrics();
    
    await this.redisClient.quit();
    console.log('🛑 实时数据服务已停止');
  }

  // 工具方法
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 价格更新处理器
export class PriceUpdateProcessor implements RealTimeProcessor {
  getType(): RealTimeEventType {
    return 'price_update';
  }

  async process(event: RealTimeEvent): Promise<void> {
    const priceData = event.payload;
    console.log(`💰 处理价格更新: ${priceData.partId} -> ${priceData.newPrice}`);
    
    // 这里可以实现具体的业务逻辑：
    // 1. 更新缓存
    // 2. 触发通知
    // 3. 记录价格历史
    // 4. 检查价格异常
    
    // 示例：简单的阈值检查
    if (priceData.changePercent && Math.abs(priceData.changePercent) > 10) {
      console.warn(`⚠️ 价格大幅波动警告: ${priceData.partId} 变化 ${priceData.changePercent}%`);
    }
  }
}

// 库存变更处理器
export class InventoryChangeProcessor implements RealTimeProcessor {
  getType(): RealTimeEventType {
    return 'inventory_change';
  }

  async process(event: RealTimeEvent): Promise<void> {
    const inventoryData = event.payload;
    console.log(`📦 处理库存变更: ${inventoryData.partId} 数量 ${inventoryData.newQuantity}`);
    
    // 库存预警逻辑
    if (inventoryData.newQuantity <= inventoryData.minStock) {
      console.warn(`🚨 库存预警: ${inventoryData.partId} 库存不足`);
      // 可以触发补货流程或通知相关人员
    }
  }
}

// 用户行为处理器
export class UserActionProcessor implements RealTimeProcessor {
  getType(): RealTimeEventType {
    return 'user_action';
  }

  async process(event: RealTimeEvent): Promise<void> {
    const actionData = event.payload;
    console.log(`👤 处理用户行为: ${actionData.userId} -> ${actionData.actionType}`);
    
    // 可以实现实时推荐、行为分析等逻辑
  }
}

// 导出实例
export const realTimeDataService = new RealTimeDataService();

// 注册默认处理器
realTimeDataService.registerProcessor(new PriceUpdateProcessor());
realTimeDataService.registerProcessor(new InventoryChangeProcessor());
realTimeDataService.registerProcessor(new UserActionProcessor());