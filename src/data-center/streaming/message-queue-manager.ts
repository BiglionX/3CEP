// 消息队列管理器
// 支持多种消息队列后端：Redis Streams、Kafka、RabbitMQ

// @ts-ignore
import Redis from 'ioredis';
// @ts-ignore
import { Kafka, Producer, Consumer, KafkaConfig, ProducerConfig, ConsumerConfig } from 'kafkajs';
// @ts-ignore
import amqp from 'amqplib';

export type MessageQueueType = 'redis' | 'kafka' | 'rabbitmq';

export interface MessageQueueConfig {
  type: MessageQueueType;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  kafka?: {
    brokers: string[];
    clientId: string;
    groupId?: string;
  };
  rabbitmq?: {
    url: string;
    exchange?: string;
    exchangeType?: string;
  };
}

export interface QueueMessage {
  id: string;
  topic: string;
  payload: any;
  timestamp: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface MessageHandler {
  (message: QueueMessage): Promise<void>;
}

// 消息队列抽象接口
export interface MessageQueueAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(topic: string, message: QueueMessage): Promise<string>;
  subscribe(topic: string, handler: MessageHandler): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  getQueueStats(topic: string): Promise<any>;
  isConnected(): boolean;
}

// Redis Streams适配器
export class RedisStreamsAdapter implements MessageQueueAdapter {
  private client: Redis;
  private handlers: Map<string, MessageHandler> = new Map();
  private consumers: Map<string, { groupName: string; consumerName: string }> = new Map();
  private isRunning: boolean = false;

  constructor(private config: MessageQueueConfig) {
    this.client = new Redis({
      host: config.redis?.host || 'localhost',
      port: config.redis?.port || 6379,
      password: config.redis?.password,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('✅ Redis Streams连接成功');
        resolve();
      });
      
      this.client.on('error', (error: any) => {
        console.error('❌ Redis Streams连接错误:', error);
        reject(error);
      });
    });
  }

  async disconnect(): Promise<void> {
    this.isRunning = false;
    await this.client.quit();
    console.log('🔒 Redis Streams连接已断开');
  }

  async publish(topic: string, message: QueueMessage): Promise<string> {
    const streamKey = `stream:${topic}`;
    const messageId = await this.client.xadd(
      streamKey,
      '*',
      'id', message.id,
      'payload', JSON.stringify(message.payload),
      'timestamp', message.timestamp,
      'priority', message.priority?.toString() || '0',
      'metadata', JSON.stringify(message.metadata || {})
    );
    
    console.log(`📤 Redis发布消息: ${topic} (${messageId})`);
    return messageId!;
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    const streamKey = `stream:${topic}`;
    const groupName = `group_${topic}`;
    const consumerName = `consumer_${process.pid}_${Date.now()}`;

    // 创建消费者组
    try {
      await this.client.xadd(streamKey, '*', 'init', 'true');
      await this.client.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
    } catch (error) {
      if (!(error as Error).message.includes('BUSYGROUP')) {
        throw error;
      }
    }

    this.handlers.set(topic, handler);
    this.consumers.set(topic, { groupName, consumerName });
    
    if (!this.isRunning) {
      this.startConsuming();
    }
    
    console.log(`✅ Redis订阅主题: ${topic}`);
  }

  private async startConsuming(): Promise<void> {
    this.isRunning = true;
    
    while (this.isRunning) {
      for (const [topic, handler] of this.handlers.entries()) {
        const consumerInfo = this.consumers.get(topic);
        if (!consumerInfo) continue;

        try {
          const messages = await this.client.xreadgroup(
            'GROUP',
            consumerInfo.groupName,
            consumerInfo.consumerName,
            'BLOCK',
            1000,
            'COUNT',
            10,
            'STREAMS',
            `stream:${topic}`,
            '>'
          );

          if (messages && messages.length > 0) {
            const [, streamMessages] = messages[0];
            
            for (const [messageId, messageData] of streamMessages) {
              await this.processMessage(topic, messageId, messageData, handler, consumerInfo);
            }
          }
        } catch (error) {
          console.error(`❌ Redis消费错误 ${topic}:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  private async processMessage(
    topic: string,
    messageId: string,
    messageData: string[],
    handler: MessageHandler,
    consumerInfo: { groupName: string; consumerName: string }
  ): Promise<void> {
    try {
      const message = this.parseMessageData(messageData);
      await handler(message);
      
      // 确认消息处理完成
      await this.client.xack(`stream:${topic}`, consumerInfo.groupName, messageId);
      console.log(`✅ Redis消息处理完成: ${topic} (${messageId})`);
      
    } catch (error) {
      console.error(`❌ Redis消息处理失败 ${topic} ${messageId}:`, error);
      // 可以实现死信队列逻辑
    }
  }

  private parseMessageData(messageData: string[]): QueueMessage {
    const dataMap: Record<string, string> = {};
    
    for (let i = 0; i < messageData.length; i += 2) {
      dataMap[messageData[i]] = messageData[i + 1];
    }

    return {
      id: dataMap.id,
      topic: '', // 将在subscribe方法中设置
      payload: JSON.parse(dataMap.payload),
      timestamp: dataMap.timestamp,
      priority: parseInt(dataMap.priority || '0'),
      metadata: JSON.parse(dataMap.metadata || '{}')
    };
  }

  async unsubscribe(topic: string): Promise<void> {
    this.handlers.delete(topic);
    this.consumers.delete(topic);
    console.log(`🚫 Redis取消订阅: ${topic}`);
  }

  async getQueueStats(topic: string): Promise<any> {
    try {
      const streamKey = `stream:${topic}`;
      const info = await this.client.xinfo('STREAM', streamKey);
      return {
        length: info[1],
        groups: info[7],
        firstEntry: info[9],
        lastEntry: info[11]
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  isConnected(): boolean {
    return this.client.status === 'ready';
  }
}

// Kafka适配器
export class KafkaAdapter implements MessageQueueAdapter {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(private config: MessageQueueConfig) {
    const kafkaConfig: KafkaConfig = {
      clientId: config.kafka?.clientId || 'data-center-client',
      brokers: config.kafka?.brokers || ['localhost:9092']
    };
    
    this.kafka = new Kafka(kafkaConfig);
  }

  async connect(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('✅ Kafka生产者连接成功');
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    
    console.log('🔒 Kafka连接已断开');
  }

  async publish(topic: string, message: QueueMessage): Promise<string> {
    if (!this.producer) {
      throw new Error('Kafka生产者未连接');
    }

    const result = await this.producer.send({
      topic,
      messages: [{
        key: message.id,
        value: JSON.stringify({
          ...message,
          topic // Kafka中topic是分离的，需要在消息中包含
        }),
        timestamp: Date.now().toString()
      }]
    });

    console.log(`📤 Kafka发布消息: ${topic} (${message.id})`);
    return message.id;
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    const groupId = this.config.kafka?.groupId || `data-center-group-${topic}`;
    const consumer = this.kafka.consumer({ groupId });
    
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic: msgTopic, partition, message }: { topic: string; partition: number; message: any }) => {
        try {
          const msgData = JSON.parse(message.value!.toString());
          await handler(msgData);
          console.log(`✅ Kafka消息处理完成: ${msgTopic} (${msgData.id})`);
        } catch (error) {
          console.error(`❌ Kafka消息处理失败:`, error);
        }
      }
    });

    this.consumers.set(topic, consumer);
    this.handlers.set(topic, handler);
    console.log(`✅ Kafka订阅主题: ${topic}`);
  }

  async unsubscribe(topic: string): Promise<void> {
    const consumer = this.consumers.get(topic);
    if (consumer) {
      await consumer.disconnect();
      this.consumers.delete(topic);
    }
    this.handlers.delete(topic);
    console.log(`🚫 Kafka取消订阅: ${topic}`);
  }

  async getQueueStats(topic: string): Promise<any> {
    // Kafka统计信息需要通过Admin客户端获取
    return { message: 'Kafka统计信息需要Admin权限' };
  }

  isConnected(): boolean {
    return this.producer !== null;
  }
}

// RabbitMQ适配器
export class RabbitMQAdapter implements MessageQueueAdapter {
  private connection: any = null;
  private channel: any = null;
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(private config: MessageQueueConfig) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.rabbitmq?.url || 'amqp://localhost');
    this.channel = await this.connection.createChannel();
    
    const exchange = this.config.rabbitmq?.exchange || 'data_center_exchange';
    const exchangeType = this.config.rabbitmq?.exchangeType || 'topic';
    
    await this.channel.assertExchange(exchange, exchangeType, { durable: true });
    console.log('✅ RabbitMQ连接成功');
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log('🔒 RabbitMQ连接已断开');
  }

  async publish(topic: string, message: QueueMessage): Promise<string> {
    if (!this.channel) {
      throw new Error('RabbitMQ通道未建立');
    }

    const exchange = this.config.rabbitmq?.exchange || 'data_center_exchange';
    const routingKey = topic;

    const result = await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: message.id
      }
    );

    console.log(`📤 RabbitMQ发布消息: ${topic} (${message.id})`);
    return message.id;
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ通道未建立');
    }

    const exchange = this.config.rabbitmq?.exchange || 'data_center_exchange';
    const queueName = `data_center_${topic}_${process.pid}`;
    
    // 创建队列
    await this.channel.assertQueue(queueName, { durable: true });
    
    // 绑定队列到交换机
    await this.channel.bindQueue(queueName, exchange, topic);
    
    // 消费消息
    await this.channel.consume(queueName, async (msg: any) => {
      if (msg !== null) {
        try {
          const messageData = JSON.parse(msg.content.toString());
          await handler(messageData);
          
          // 确认消息处理完成
          this.channel.ack(msg);
          console.log(`✅ RabbitMQ消息处理完成: ${topic} (${messageData.id})`);
          
        } catch (error) {
          console.error(`❌ RabbitMQ消息处理失败:`, error);
          this.channel.nack(msg, false, false); // 不重新入队
        }
      }
    });

    this.handlers.set(topic, handler);
    console.log(`✅ RabbitMQ订阅主题: ${topic}`);
  }

  async unsubscribe(topic: string): Promise<void> {
    this.handlers.delete(topic);
    console.log(`🚫 RabbitMQ取消订阅: ${topic}`);
  }

  async getQueueStats(topic: string): Promise<any> {
    if (!this.channel) return { error: '通道未建立' };
    
    const queueName = `data_center_${topic}_${process.pid}`;
    try {
      const stats = await this.channel.checkQueue(queueName);
      return {
        messageCount: stats.messageCount,
        consumerCount: stats.consumerCount
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// 消息队列管理器主类
export class MessageQueueManager {
  private adapters: Map<MessageQueueType, MessageQueueAdapter> = new Map();
  private activeAdapter: MessageQueueAdapter | null = null;
  private activeType: MessageQueueType | null = null;

  constructor(private configs: MessageQueueConfig[]) {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    for (const config of this.configs) {
      let adapter: MessageQueueAdapter;
      
      switch (config.type) {
        case 'redis':
          adapter = new RedisStreamsAdapter(config);
          break;
        case 'kafka':
          adapter = new KafkaAdapter(config);
          break;
        case 'rabbitmq':
          adapter = new RabbitMQAdapter(config);
          break;
        default:
          throw new Error(`不支持的消息队列类型: ${config.type}`);
      }
      
      this.adapters.set(config.type, adapter);
    }
  }

  async connect(type: MessageQueueType): Promise<void> {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`未找到消息队列适配器: ${type}`);
    }

    await adapter.connect();
    this.activeAdapter = adapter;
    this.activeType = type;
    
    console.log(`✅ 消息队列管理器已连接到: ${type}`);
  }

  async disconnect(): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
      this.activeAdapter = null;
      this.activeType = null;
    }
  }

  async publish(topic: string, message: Omit<QueueMessage, 'topic'>): Promise<string> {
    if (!this.activeAdapter) {
      throw new Error('消息队列未连接');
    }

    const fullMessage: QueueMessage = {
      ...message,
      topic
    };

    return await this.activeAdapter.publish(topic, fullMessage);
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    if (!this.activeAdapter) {
      throw new Error('消息队列未连接');
    }

    await this.activeAdapter.subscribe(topic, handler);
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.activeAdapter) {
      throw new Error('消息队列未连接');
    }

    await this.activeAdapter.unsubscribe(topic);
  }

  async getQueueStats(topic: string): Promise<any> {
    if (!this.activeAdapter) {
      throw new Error('消息队列未连接');
    }

    return await this.activeAdapter.getQueueStats(topic);
  }

  isConnected(): boolean {
    return this.activeAdapter?.isConnected() || false;
  }

  getActiveType(): MessageQueueType | null {
    return this.activeType;
  }

  // 切换消息队列类型
  async switchAdapter(newType: MessageQueueType): Promise<void> {
    if (this.activeType === newType) {
      return;
    }

    // 断开当前连接
    if (this.activeAdapter) {
      await this.disconnect();
    }

    // 连接到新的队列类型
    await this.connect(newType);
  }

  // 获取所有可用的队列类型
  getAvailableTypes(): MessageQueueType[] {
    return Array.from(this.adapters.keys());
  }
}

// 默认配置
export const DEFAULT_QUEUE_CONFIGS: MessageQueueConfig[] = [
  {
    type: 'redis',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  },
  {
    type: 'kafka',
    kafka: {
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: process.env.KAFKA_CLIENT_ID || 'data-center-client'
    }
  },
  {
    type: 'rabbitmq',
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      exchange: process.env.RABBITMQ_EXCHANGE || 'data_center_exchange',
      exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic'
    }
  }
];

// 导出默认实例
export const messageQueueManager = new MessageQueueManager(DEFAULT_QUEUE_CONFIGS);