// Redis健康检查和监控服务
import { redisClient, redisPool } from './data-center-service';
import { monitoringService } from '../monitoring/monitoring-service';

export interface RedisHealthStatus {
  isConnected: boolean;
  pingLatency: number;
  memoryUsage: {
    usedMemory: number;
    usedMemoryHuman: string;
    usedMemoryPeak: number;
  };
  clients: {
    connectedClients: number;
    blockedClients: number;
  };
  stats: {
    totalCommandsProcessed: number;
    instantaneousOpsPerSec: number;
    keyspaceHits: number;
    keyspaceMisses: number;
  };
  replication: {
    role: string;
    connectedSlaves: number;
  };
  timestamp: string;
}

export class RedisHealthMonitor {
  private static instance: RedisHealthMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private checkInterval: number = 30000; // 30秒检查一?
  private constructor() {}

  public static getInstance(): RedisHealthMonitor {
    if (!RedisHealthMonitor.instance) {
      RedisHealthMonitor.instance = new RedisHealthMonitor();
    }
    return RedisHealthMonitor.instance;
  }

  // 执行健康检?  public async checkHealth(): Promise<RedisHealthStatus> {
    try {
      const startTime = Date.now();

      // 基本连接检?      await redisClient.ping();
      const pingLatency = Date.now() - startTime;

      // 获取详细信息
      const info = await redisClient.info();
      const parsedInfo = this.parseRedisInfo(info);

      const healthStatus: RedisHealthStatus = {
        isConnected: true,
        pingLatency,
        memoryUsage: {
          usedMemory: parsedInfo.used_memory || 0,
          usedMemoryHuman: parsedInfo.used_memory_human || '0B',
          usedMemoryPeak: parsedInfo.used_memory_peak || 0,
        },
        clients: {
          connectedClients: parsedInfo.connected_clients || 0,
          blockedClients: parsedInfo.blocked_clients || 0,
        },
        stats: {
          totalCommandsProcessed: parsedInfo.total_commands_processed || 0,
          instantaneousOpsPerSec: parsedInfo.instantaneous_ops_per_sec || 0,
          keyspaceHits: parsedInfo.keyspace_hits || 0,
          keyspaceMisses: parsedInfo.keyspace_misses || 0,
        },
        replication: {
          role: parsedInfo.role || 'unknown',
          connectedSlaves: parsedInfo.connected_slaves || 0,
        },
        timestamp: new Date().toISOString(),
      };

      // 记录监控指标
      this.recordMetrics(healthStatus);

      return healthStatus;
    } catch (error) {
      console.error('�?Redis健康检查失?', error);

      return {
        isConnected: false,
        pingLatency: -1,
        memoryUsage: {
          usedMemory: 0,
          usedMemoryHuman: '0B',
          usedMemoryPeak: 0,
        },
        clients: {
          connectedClients: 0,
          blockedClients: 0,
        },
        stats: {
          totalCommandsProcessed: 0,
          instantaneousOpsPerSec: 0,
          keyspaceHits: 0,
          keyspaceMisses: 0,
        },
        replication: {
          role: 'unknown',
          connectedSlaves: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 解析Redis INFO命令返回的信?  private parseRedisInfo(info: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2);
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();

        // 尝试转换为数?        if (/^\d+$/.test(trimmedValue)) {
          result[trimmedKey] = parseInt(trimmedValue, 10);
        } else if (/^\d+\.\d+$/.test(trimmedValue)) {
          result[trimmedKey] = parseFloat(trimmedValue);
        } else {
          result[trimmedKey] = trimmedValue;
        }
      }
    }

    return result;
  }

  // 记录监控指标
  private recordMetrics(status: RedisHealthStatus): void {
    if (status.isConnected) {
      monitoringService.recordMetric('redis_ping_latency', status.pingLatency, {
        instance: 'primary',
      });

      monitoringService.recordMetric(
        'redis_connected_clients',
        status.clients.connectedClients
      );
      monitoringService.recordMetric(
        'redis_commands_per_second',
        status.stats.instantaneousOpsPerSec
      );

      // 计算缓存命中?      const totalAccesses =
        status.stats.keyspaceHits + status.stats.keyspaceMisses;
      if (totalAccesses > 0) {
        const hitRate = (status.stats.keyspaceHits / totalAccesses) * 100;
        monitoringService.recordMetric('redis_cache_hit_rate', hitRate);
      }
    }
  }

  // 启动定期监控
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.checkInterval = intervalMs;

    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        if (!health.isConnected) {
          console.warn('⚠️ Redis连接异常，触发告?);
          // 可以在这里触发更严重的告?        }
      } catch (error) {
        console.error('监控检查执行失?', error);
      }
    }, this.checkInterval);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📊 Redis健康监控已启动，检查间? ${intervalMs}ms`)}

  // 停止监控
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 Redis健康监控已停?)}
  }

  // 获取连接池状?  public async getConnectionPoolStatus(): Promise<any> {
    try {
      // 这里可以扩展为检查连接池中每个连接的状?      const poolInfo = {
        poolSize: 3,
        activeConnections: 3, // 简化实?        queueLength: 0,
        timestamp: new Date().toISOString(),
      };

      return poolInfo;
    } catch (error) {
      console.error('获取连接池状态失?', error);
      return null;
    }
  }

  // 执行内存优化
  public async optimizeMemory(): Promise<void> {
    try {
      // 执行内存回收
      await redisClient.bgrewriteaof();
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🧹 Redis内存优化已触?)} catch (error) {
      console.error('内存优化失败:', error);
    }
  }

  // 获取慢查询日?  public async getSlowLog(count: number = 10): Promise<any[]> {
    try {
      const slowlog = await redisClient.slowlog('get', count);
      return slowlog.map((entry: any) => ({
        id: entry[0],
        timestamp: new Date(entry[1] * 1000).toISOString(),
        duration: entry[2], // 微秒
        command: entry[3],
      }));
    } catch (error) {
      console.error('获取慢查询日志失?', error);
      return [];
    }
  }
}

// 导出实例
export const redisHealthMonitor = RedisHealthMonitor.getInstance();
