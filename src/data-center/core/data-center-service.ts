import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import Redis from 'ioredis';

// 数据中心配置
const DATA_CENTER_CONFIG = {
  trino: {
    host: process.env.TRINO_HOST || 'localhost',
    port: process.env.TRINO_PORT || '8080',
    coordinatorUrl: process.env.TRINO_COORDINATOR_URL || 'http://localhost:8080'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  databases: {
    lionfix: {
      host: process.env.LIONFIX_DB_HOST || 'localhost',
      port: process.env.LIONFIX_DB_PORT || 5432,
      database: process.env.LIONFIX_DB_NAME || 'lionfix_db',
      user: process.env.LIONFIX_DB_USER || 'lionfix_reader',
      password: process.env.LIONFIX_DB_PASSWORD
    },
    fixcycle: {
      host: process.env.SUPABASE_DB_HOST || 'localhost',
      port: process.env.SUPABASE_DB_PORT || 5432,
      database: process.env.SUPABASE_DB_NAME || 'fixcycle_db',
      user: process.env.SUPABASE_DB_USER || 'supabase_user',
      password: process.env.SUPABASE_DB_PASSWORD
    }
  }
};

// Redis连接池配置
const REDIS_OPTIONS = {
  host: DATA_CENTER_CONFIG.redis.host,
  port: DATA_CENTER_CONFIG.redis.port,
  password: DATA_CENTER_CONFIG.redis.password,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`🔄 Redis重试连接 (${times}次), ${delay}ms后重试`);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // 重新连接
    }
    return false;
  },
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  showFriendlyErrorStack: true
};

// 主Redis客户端
export const redisClient = new Redis(REDIS_OPTIONS);

// Redis连接池管理
export class RedisConnectionPool {
  private static instance: RedisConnectionPool;
  private clients: Redis[] = [];
  private currentIndex: number = 0;
  
  private constructor() {
    // 创建多个连接实例
    for (let i = 0; i < 3; i++) {
      const client = new Redis({
        ...REDIS_OPTIONS,
        connectionName: `data-center-worker-${i}`
      });
      
      client.on('connect', () => {
        console.log(`✅ Redis连接池客户端 ${i} 连接成功`);
      });
      
      client.on('error', (err: Error) => {
        console.error(`❌ Redis连接池客户端 ${i} 错误:`, err.message);
      });
      
      client.on('close', () => {
        console.log(`🔌 Redis连接池客户端 ${i} 连接关闭`);
      });
      
      this.clients.push(client);
    }
  }
  
  public static getInstance(): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool();
    }
    return RedisConnectionPool.instance;
  }
  
  // 获取下一个可用客户端
  public getNextClient(): Redis {
    const client = this.clients[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.clients.length;
    return client;
  }
  
  // 执行命令
  public async execute<T>(command: string, ...args: any[]): Promise<T> {
    const client = this.getNextClient();
    try {
      return await (client as any)[command](...args);
    } catch (error) {
      console.error(`Redis命令执行失败 ${command}:`, error);
      throw error;
    }
  }
  
  // 批量执行
  public async pipeline(commands: [string, ...any[]][]): Promise<any[]> {
    const client = this.getNextClient();
    const pipeline = client.pipeline();
    
    for (const [command, ...args] of commands) {
      (pipeline as any)[command](...args);
    }
    
    try {
      const results = await pipeline.exec();
      return results?.map(([err, result]: [Error | null, any]) => {
        if (err) throw err;
        return result;
      }) || [];
    } catch (error) {
      console.error('Redis pipeline执行失败:', error);
      throw error;
    }
  }
  
  // 关闭所有连接
  public async close(): Promise<void> {
    const closePromises = this.clients.map(client => client.quit());
    await Promise.all(closePromises);
    console.log('🔒 Redis连接池已关闭');
  }
}

// 导出连接池实例
export const redisPool = RedisConnectionPool.getInstance();

// Trino查询引擎客户端
export class TrinoClient {
  public baseUrl: string;

  constructor() {
    this.baseUrl = DATA_CENTER_CONFIG.trino.coordinatorUrl;
  }

  async executeQuery(query: string, catalog?: string, schema?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Trino-Catalog': catalog || 'fixcycle',
          'X-Trino-Schema': schema || 'public'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Trino query failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.processQueryResult(result);
    } catch (error) {
      console.error('Trino query execution error:', error);
      throw error;
    }
  }

  private async processQueryResult(result: any): Promise<any> {
    // 处理Trino查询结果
    if (result.error) {
      throw new Error(result.error.message);
    }

    // 如果查询还在执行中，等待完成
    if (result.nextUri) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const nextResponse = await fetch(result.nextUri);
      const nextResult = await nextResponse.json();
      return this.processQueryResult(nextResult);
    }

    return {
      columns: result.columns?.map((col: any) => col.name) || [],
      data: result.data || [],
      stats: result.stats || {}
    };
  }
}

// 数据虚拟化服务
export class DataVirtualizationService {
  private trinoClient: TrinoClient;

  constructor() {
    this.trinoClient = new TrinoClient();
  }

  // 获取统一设备信息视图
  async getUnifiedDeviceInfo(deviceId?: string) {
    const cacheKey = deviceId ? `device_info:${deviceId}` : 'device_info:all';
    
    // 尝试从缓存获取
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 构建跨数据源查询
    let query = `
      SELECT 
        lf_d.id as device_id,
        lf_d.brand,
        lf_d.model,
        lf_d.category,
        fc_d.status as local_status,
        fc_d.created_at as local_created_at
      FROM lionfix.devices lf_d
      LEFT JOIN fixcycle.devices fc_d ON lf_d.id = fc_d.lionfix_device_id
    `;

    if (deviceId) {
      query += ` WHERE lf_d.id = '${deviceId}'`;
    }

    query += ' ORDER BY lf_d.brand, lf_d.model';

    try {
      const result = await this.trinoClient.executeQuery(query);
      
      // 缓存结果（5分钟）
      await redisClient.setex(cacheKey, 300, JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('Failed to get unified device info:', error);
      throw error;
    }
  }

  // 获取配件价格聚合视图
  async getPartsPriceAggregation(partIds?: string[]) {
    const cacheKey = partIds ? `parts_price:${partIds.join(',')}` : 'parts_price:all';
    
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let query = `
      SELECT 
        lf_p.id as part_id,
        lf_p.name,
        lf_p.device_id,
        AVG(lf_ph.price) as avg_price,
        MIN(lf_ph.price) as min_price,
        MAX(lf_ph.price) as max_price,
        COUNT(lf_ph.id) as price_records,
        MAX(lf_ph.recorded_at) as last_updated
      FROM lionfix.parts lf_p
      LEFT JOIN lionfix.price_history lf_ph ON lf_p.id = lf_ph.part_id
    `;

    if (partIds && partIds.length > 0) {
      const idsList = partIds.map(id => `'${id}'`).join(',');
      query += ` WHERE lf_p.id IN (${idsList})`;
    }

    query += `
      GROUP BY lf_p.id, lf_p.name, lf_p.device_id
      ORDER BY avg_price DESC
    `;

    try {
      const result = await this.trinoClient.executeQuery(query);
      await redisClient.setex(cacheKey, 600, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Failed to get parts price aggregation:', error);
      throw error;
    }
  }
}

// 导出实例
export const trinoClient = new TrinoClient();
export const dataVirtualizationService = new DataVirtualizationService();
export const trinoClientInstance = new TrinoClient();

// 初始化连接测试
export async function initializeDataCenter() {
  try {
    // 测试Redis连接
    await redisClient.ping();
    console.log('✅ Redis连接成功');

    // 测试Trino连接
    const testResult = await trinoClient.executeQuery('SELECT 1 as test');
    console.log('✅ Trino连接成功');

    console.log('📊 数据中心初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 数据中心初始化失败:', error);
    return false;
  }
}