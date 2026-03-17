// Redis缓存管理器
import Redis from 'ioredis';

// 简单的日志函数
const logger = {
  debug: (msg: string) => console.debug(`[DEBUG] ${msg}`),
  info: (msg: string) => console.info(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error),
};

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
}

interface CacheOptions {
  ttl?: number; // 过期时间(秒)
  tags?: string[]; // 缓存标签，用于批量删除
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  avgLatency: number;
}

export class RedisCacheManager {
  private redis: Redis;
  private stats: CacheStats;
  private keyPrefix: string;
  private connected: boolean = false;

  constructor(config: RedisConfig) {
    this.keyPrefix = config.keyPrefix || 'fixcycle:';
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      avgLatency: 0,
    };

    // 创建Redis连接
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: true,
    });

    // 连接事件处理
    this.setupConnectionHandlers();
  }

  /**
   * 设置连接事件处理器
   */
  private setupConnectionHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Redis连接已建立');
      this.connected = true;
    });

    this.redis.on('ready', () => {
      logger.info('Redis准备就绪');
    });

    this.redis.on('error', error => {
      logger.error('Redis连接错误', error);
      this.connected = false;
    });

    this.redis.on('close', () => {
      logger.warn('Redis连接关闭');
      this.connected = false;
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis正在重连');
    });
  }

  /**
   * 确保连接
   */
  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      try {
        await this.redis.connect();
        this.connected = true;
      } catch (error) {
        logger.error('Redis连接失败', error as Error);
        throw new Error('无法连接到Redis服务器');
      }
    }
  }

  /**
   * 生成带前缀的缓存键
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * 生成标签键
   */
  private generateTagKey(tag: string): string {
    return `${this.keyPrefix}tag:${tag}`;
  }

  /**
   * 获取缓存值
   */
  async get<T = any>(key: string): Promise<T | null> {
    await this.ensureConnection();

    const startTime = Date.now();
    const fullKey = this.generateKey(key);

    try {
      const value = await this.redis.get(fullKey);

      const latency = Date.now() - startTime;
      this.updateStats(value ? 'hits' : 'misses', latency);

      if (value === null) {
        return null;
      }

      // 尝试解析JSON
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`Redis GET操作失败: ${key}`, error as Error);
      return null;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    await this.ensureConnection();

    const startTime = Date.now();
    const fullKey = this.generateKey(key);
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    try {
      let result: 'OK' | null;

      if (options?.ttl) {
        result = await this.redis.setex(fullKey, options.ttl, stringValue);
      } else {
        result = await this.redis.set(fullKey, stringValue);
      }

      // 处理标签
      if (options?.tags && options.tags.length > 0) {
        await this.addTags(key, options.tags);
      }

      const latency = Date.now() - startTime;
      this.updateStats('sets', latency);

      return result === 'OK';
    } catch (error) {
      logger.error(`Redis SET操作失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    await this.ensureConnection();

    const startTime = Date.now();
    const fullKey = this.generateKey(key);

    try {
      // 删除相关的标签
      await this.removeTags(key);

      const result = await this.redis.del(fullKey);

      const latency = Date.now() - startTime;
      this.updateStats('deletes', latency);

      return result > 0;
    } catch (error) {
      logger.error(`Redis DELETE操作失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 批量删除缓存（按标签）
   */
  async deleteByTag(tag: string): Promise<number> {
    await this.ensureConnection();

    try {
      const tagKey = this.generateTagKey(tag);
      const keys = (await this.redis.smembers(tagKey)) as string[];

      if (keys.length === 0) {
        return 0;
      }

      // 删除所有相关键
      const pipeline = this.redis.pipeline();
      keys.forEach(key => {
        pipeline.del(this.generateKey(key));
        pipeline.srem(tagKey, key);
      });

      const results = (await pipeline.exec()) as
        | [Error | null, number][]
        | null;
      const deletedCount = results
        ? results.filter(r => r[1] > 0).length / 2
        : 0;

      return Math.floor(deletedCount);
    } catch (error) {
      logger.error(`Redis按标签删除失败: ${tag}`, error as Error);
      return 0;
    }
  }

  /**
   * 添加标签
   */
  private async addTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();

    tags.forEach(tag => {
      const tagKey = this.generateTagKey(tag);
      pipeline.sadd(tagKey, key);
    });

    await pipeline.exec();
  }

  /**
   * 移除标签
   */
  private async removeTags(_key: string): Promise<void> {
    // 这里简化处理，实际项目中可能需要更复杂的标签管理
    // 可以考虑存储键到标签的反向映射
  }

  /**
   * 增量操作
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    await this.ensureConnection();

    const fullKey = this.generateKey(key);

    try {
      return await this.redis.incrby(fullKey, amount);
    } catch (error) {
      logger.error(`Redis INCRBY操作失败: ${key}`, error as Error);
      return 0;
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    await this.ensureConnection();

    const fullKey = this.generateKey(key);

    try {
      const result = await this.redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE操作失败: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats & { uptime: number } {
    return {
      ...this.stats,
      uptime: process.uptime(),
    };
  }

  /**
   * 更新统计信息
   */
  private updateStats(operation: keyof CacheStats, latency: number): void {
    if (operation !== 'avgLatency') {
      this.stats[operation]++;
    }

    // 计算平均延迟
    const totalOps =
      this.stats.hits +
      this.stats.misses +
      this.stats.sets +
      this.stats.deletes;
    this.stats.avgLatency =
      (this.stats.avgLatency * (totalOps - 1) + latency) / totalOps;
  }

  /**
   * 清空所有缓存
   */
  async flushAll(): Promise<boolean> {
    await this.ensureConnection();

    try {
      await this.redis.flushall();
      // 重置统计信息
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        avgLatency: 0,
      };
      return true;
    } catch (error) {
      logger.error('Redis清空所有缓存失败', error as Error);
      return false;
    }
  }

  /**
   * 获取Redis信息
   */
  async getInfo(): Promise<any> {
    await this.ensureConnection();

    try {
      const info = await this.redis.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      logger.error('获取Redis信息失败', error as Error);
      return null;
    }
  }

  /**
   * 解析Redis信息字符串
   */
  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\n');

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key.trim()] = value.trim();
      }
    });

    return result;
  }

  /**
   * 关闭连接
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      this.connected = false;
      logger.info('Redis连接已关闭');
    } catch (error) {
      logger.error('关闭Redis连接失败', error as Error);
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// 创建默认的Redis缓存管理器实例
let defaultRedisManager: RedisCacheManager | null = null;

export function getDefaultRedisManager(): RedisCacheManager {
  if (!defaultRedisManager) {
    defaultRedisManager = new RedisCacheManager({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'fixcycle:',
    });
  }
  return defaultRedisManager;
}

export default RedisCacheManager;
