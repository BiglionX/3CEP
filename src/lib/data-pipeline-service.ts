// 模拟Prisma客户端类?interface PrismaClient {
  $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  $disconnect(): Promise<void>;
  $queryRawUnsafe<T = any>(query: string, ...values: any[]): Promise<T>;
  metricData: {
    create(data: any): Promise<any>;
    deleteMany(where: any): Promise<{ count: number }>;
    findMany(options: any): Promise<any[]>;
  };
}

// 模拟logger
const logger = {
  info: (msg: string) => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`INFO: ${msg}`),
  error: (msg: string, error?: any) => console.error(`ERROR: ${msg}`, error),
};

interface DataPoint {
  timestamp: Date;
  metricName: string;
  value: number;
  dimensions: Record<string, string>;
  source: string;
}

interface PipelineConfig {
  batchSize: number;
  flushInterval: number;
  retentionDays: number;
}

export class DataPipelineService {
  private prisma: PrismaClient;
  private buffer: DataPoint[] = [];
  private config: PipelineConfig;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PipelineConfig> = {}) {
    // 模拟Prisma客户端实?    this.prisma = {
      $transaction: async (fn: (tx: any) => Promise<any>) => fn({}),
      $disconnect: async () => {},
      $queryRawUnsafe: async () => [],
      metricData: {
        create: async () => ({}),
        deleteMany: async () => ({ count: 0 }),
        findMany: async () => [],
      },
    } as unknown as PrismaClient;

    this.config = {
      batchSize: config.batchSize || 1000,
      flushInterval: config.flushInterval || 30000, // 30�?      retentionDays: config.retentionDays || 90,
    };
    this.startFlushTimer();
  }

  /**
   * 收集数据?   */
  collect(
    metricName: string,
    value: number,
    dimensions: Record<string, string> = {},
    source: string = 'system'
  ): void {
    const dataPoint: DataPoint = {
      timestamp: new Date(),
      metricName,
      value,
      dimensions,
      source,
    };

    this.buffer.push(dataPoint);

    // 如果缓冲区满了，立即刷新
    if (this.buffer.length >= this.config.batchSize) {
      this.flushBufferPrivate();
    }
  }

  /**
   * 批量收集数据
   */
  collectBatch(dataPoints: Omit<DataPoint, 'timestamp'>[]): void {
    const timestamp = new Date();
    const batch = dataPoints.map(point => ({
      ...point,
      timestamp,
    }));

    this.buffer.push(...batch);

    if (this.buffer.length >= this.config.batchSize) {
      this.flushBufferPrivate();
    }
  }

  /**
   * 公共方法：手动刷新缓冲区
   */
  async flushBuffer(): Promise<void> {
    return this.flushBufferPrivate();
  }

  /**
   * 私有方法：刷新缓冲区到数据库
   */
  private async flushBufferPrivate(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await this.prisma.$transaction(async (tx: any) => {
        for (const point of batch) {
          await tx.metricData.create({
            data: {
              metricName: point.metricName,
              value: point.value,
              timestamp: point.timestamp,
              dimensions: point.dimensions,
              source: point.source,
            },
          });
        }
      });

      logger.info(`Flushed ${batch.length} data points to database`);
    } catch (error) {
      logger.error('Failed to flush data buffer:', error);
      // 失败时重新加入缓冲区
      this.buffer.unshift(...batch);
    }
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flushBufferPrivate();
      }
    }, this.config.flushInterval);
  }

  /**
   * 停止数据管道
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // 刷新剩余数据
    if (this.buffer.length > 0) {
      await this.flushBuffer();
    }

    await this.prisma.$disconnect();
  }

  /**
   * 清理过期数据
   */
  async cleanupOldData(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    try {
      const deletedCount = await this.prisma.metricData.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${deletedCount.count} old data points`);
      return deletedCount.count;
    } catch (error) {
      logger.error('Failed to cleanup old data:', error);
      throw error;
    }
  }

  /**
   * 获取指标聚合数据
   */
  async getAggregatedMetrics(
    metricNames: string[],
    startTime: Date,
    endTime: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<any[]> {
    try {
      const groupBy =
        granularity === 'hour'
          ? "DATE_TRUNC('hour', timestamp)"
          : granularity === 'day'
            ? "DATE_TRUNC('day', timestamp)"
            : "DATE_TRUNC('week', timestamp)";

      const result = await this.prisma.$queryRawUnsafe(
        `
        SELECT
          ${groupBy} as time_bucket,
          metric_name,
          AVG(value) as avg_value,
          MAX(value) as max_value,
          MIN(value) as min_value,
          COUNT(*) as count
        FROM metric_data
        WHERE metric_name = ANY($1::text[])
          AND timestamp >= $2
          AND timestamp <= $3
        GROUP BY time_bucket, metric_name
        ORDER BY time_bucket, metric_name
      `,
        metricNames,
        startTime,
        endTime
      );

      return result;
    } catch (error) {
      logger.error('Failed to get aggregated metrics:', error);
      throw error;
    }
  }

  /**
   * 导出数据到文?   */
  async exportData(
    startTime: Date,
    endTime: Date,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const data = await this.prisma.metricData.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      if (format === 'csv') {
        const csvHeaders = [
          'timestamp',
          'metric_name',
          'value',
          'dimensions',
          'source',
        ];
        const csvRows = data.map((item: any) => [
          item.timestamp.toISOString(),
          item.metricName,
          item.value.toString(),
          JSON.stringify(item.dimensions),
          item.source,
        ]);

        return [
          csvHeaders.join(','),
          ...csvRows.map((row: any) => row.join(',')),
        ].join('\n');
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      logger.error('Failed to export data:', error);
      throw error;
    }
  }
}

// 全局数据管道实例
export const dataPipeline = new DataPipelineService();

// 应用关闭时清理资?process.on('SIGTERM', async () => {
  await dataPipeline.shutdown();
});

process.on('SIGINT', async () => {
  await dataPipeline.shutdown();
});
