// 数据库查询优化工具类
import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../utils/logger';

interface QueryOptions {
  timeout?: number;
  cacheKey?: string;
  useCache?: boolean;
}

interface OptimizedQueryConfig {
  pool: Pool;
  slowQueryThreshold?: number; // 慢查询阈?毫秒)
  enableQueryLogging?: boolean;
}

export class DatabaseQueryOptimizer {
  private pool: Pool;
  private slowQueryThreshold: number;
  private enableQueryLogging: boolean;
  private activeConnections: Set<PoolClient> = new Set();

  constructor(config: OptimizedQueryConfig) {
    this.pool = config.pool;
    this.slowQueryThreshold = config.slowQueryThreshold || 1000; // 默认1�?    this.enableQueryLogging = config.enableQueryLogging ?? true;
  }

  /**
   * 执行优化的数据库查询
   */
  async query<T = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      // 从连接池获取客户?      client = await this.pool.connect();
      this.activeConnections.add(client);

      // 设置查询超时
      if (options.timeout) {
        client.query(`SET statement_timeout = ${options.timeout}`);
      }

      // 执行查询
      const result = await client.query<T>(sql, params);

      // 记录查询性能
      const duration = Date.now() - startTime;
      this.logQueryPerformance(sql, duration, result.rowCount || 0);

      // 慢查询警?      if (duration > this.slowQueryThreshold) {
        logger.warn(
          `Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`
        );
      }

      return result;
    } catch (error) {
      logger.error(`Database query failed: ${sql}`, error);
      throw error;
    } finally {
      // 释放连接
      if (client) {
        this.activeConnections.delete(client);
        client.release();
      }
    }
  }

  /**
   * 批量执行查询（事务）
   */
  async batchQuery<T = any>(
    queries: Array<{ sql: string; params?: any[] }>
  ): Promise<QueryResult<T>[]> {
    const client = await this.pool.connect();
    const results: QueryResult<T>[] = [];

    try {
      await client.query('BEGIN');

      for (const { sql, params = [] } of queries) {
        const result = await client.query<T>(sql, params);
        results.push(result);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Batch query transaction failed', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 分页查询优化
   */
  async paginatedQuery<T = any>(
    baseSql: string,
    params: any[],
    page: number,
    pageSize: number,
    orderBy: string = 'id'
  ): Promise<{
    data: T[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;

    // 构造分页查询SQL
    const paginatedSql = `
      ${baseSql}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countSql = `SELECT COUNT(*) as count FROM (${baseSql}) as count_query`;

    // 并行执行分页查询和总数查询
    const [paginatedResult, countResult] = await Promise.all([
      this.query<T>(paginatedSql, [...params, pageSize, offset]),
      this.query<{ count: string }>(countSql, params),
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: paginatedResult.rows,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }

  /**
   * 连接池状态监?   */
  getPoolStatus(): {
    total: number;
    idle: number;
    waiting: number;
    activeConnections: number;
  } {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      activeConnections: this.activeConnections.size,
    };
  }

  /**
   * 查询性能统计
   */
  private logQueryPerformance(
    sql: string,
    duration: number,
    rowCount: number
  ): void {
    if (!this.enableQueryLogging) return;

    logger.databaseQuery(
      sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      duration,
      rowCount
    );

    // 性能指标收集（可以扩展到监控系统?    this.collectPerformanceMetrics(sql, duration, rowCount);
  }

  /**
   * 收集性能指标（用于监控）
   */
  private collectPerformanceMetrics(
    sql: string,
    duration: number,
    rowCount: number
  ): void {
    // 这里可以集成到具体的监控系统
    // 例如：Prometheus、DataDog�?    /*
    metrics.histogram('db_query_duration_ms', duration, {
      query_type: this.getQueryType(sql),
      table_name: this.extractTableName(sql)
    });
    */
  }

  /**
   * 获取查询类型（用于指标分类）
   */
  private getQueryType(sql: string): string {
    const upperSql = sql.trim().toUpperCase();
    if (upperSql.startsWith('SELECT')) return 'select';
    if (upperSql.startsWith('INSERT')) return 'insert';
    if (upperSql.startsWith('UPDATE')) return 'update';
    if (upperSql.startsWith('DELETE')) return 'delete';
    return 'other';
  }

  /**
   * 提取表名（简单实现）
   */
  private extractTableName(sql: string): string {
    const match = sql.match(/FROM\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }

  /**
   * 关闭连接?   */
  async close(): Promise<void> {
    // 等待所有活跃连接完?    while (this.activeConnections.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await this.pool.end();
    logger.info('Database connection pool closed');
  }
}

// 创建默认的数据库查询优化器实?let defaultOptimizer: DatabaseQueryOptimizer | null = null;

export function getDefaultDatabaseOptimizer(
  pool: Pool
): DatabaseQueryOptimizer {
  if (!defaultOptimizer) {
    defaultOptimizer = new DatabaseQueryOptimizer({
      pool,
      slowQueryThreshold: 1000,
      enableQueryLogging: true,
    });
  }
  return defaultOptimizer;
}

export default DatabaseQueryOptimizer;
