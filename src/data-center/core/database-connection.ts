// @ts-ignore
import { Pool } from 'pg';

// 数据库连接配?interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
}

// 连接池配?const CONNECTION_POOL_CONFIG = {
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 数据库连接池管理?export class DatabaseConnectionManager {
  private pools: Map<string, Pool> = new Map();
  private configs: Map<string, DatabaseConfig> = new Map();

  // 注册数据库连?  registerDatabase(name: string, config: DatabaseConfig): void {
    this.configs.set(name, config);

    const pool = new Pool({
      ...config,
      ...CONNECTION_POOL_CONFIG,
    });

    // 监听连接池事?    pool.on('connect', () => {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?数据?${name} 连接成功`)});

    pool.on('error', (err: any) => {
      console.error(`�?数据?${name} 连接错误:`, err);
    });

    this.pools.set(name, pool);
  }

  // 获取连接?  getPool(name: string): Pool | undefined {
    return this.pools.get(name);
  }

  // 测试数据库连?  async testConnection(name: string): Promise<boolean> {
    const pool = this.pools.get(name);
    if (!pool) {
      console.error(`未找到数据库连接? ${name}`);
      return false;
    }

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 as test');
      client.release();
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?${name} 数据库连接测试通过`)return true;
    } catch (error) {
      console.error(`�?${name} 数据库连接测试失?`, error);
      return false;
    }
  }

  // 执行查询
  async query(databaseName: string, sql: string, params?: any[]): Promise<any> {
    const pool = this.pools.get(databaseName);
    if (!pool) {
      throw new Error(`未找到数据库连接? ${databaseName}`);
    }

    try {
      const result = await pool.query(sql, params);
      return result;
    } catch (error) {
      console.error(`数据库查询错?(${databaseName}):`, error);
      throw error;
    }
  }

  // 关闭所有连接池
  async closeAll(): Promise<void> {
    for (const [name, pool] of this.pools.entries()) {
      try {
        await pool.end();
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?${name} 数据库连接池已关闭`)} catch (error) {
        console.error(`�?关闭 ${name} 连接池时出错:`, error);
      }
    }
    this.pools.clear();
    this.configs.clear();
  }

  // 获取连接池状?  getPoolStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    for (const [name, pool] of this.pools.entries()) {
      status[name] = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };
    }
    return status;
  }
}

// 创建全局连接管理器实?export const dbConnectionManager = new DatabaseConnectionManager();

// 初始化数据库连接
export async function initializeDatabaseConnections(): Promise<boolean> {
  try {
    // 注册lionfix数据库连?    dbConnectionManager.registerDatabase('lionfix', {
      host: process.env.LIONFIX_DB_HOST || 'localhost',
      port: parseInt(process.env.LIONFIX_DB_PORT || '5432'),
      database: process.env.LIONFIX_DB_NAME || 'lionfix_db',
      user: process.env.LIONFIX_DB_USER || 'lionfix_reader',
      password: process.env.LIONFIX_DB_PASSWORD || '',
      maxConnections: 10,
    });

    // 注册fixcycle数据库连?    dbConnectionManager.registerDatabase('fixcycle', {
      host: process.env.SUPABASE_DB_HOST || 'localhost',
      port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
      database: process.env.SUPABASE_DB_NAME || 'fixcycle_db',
      user: process.env.SUPABASE_DB_USER || 'supabase_user',
      password: process.env.SUPABASE_DB_PASSWORD || '',
      maxConnections: 15,
    });

    // 测试所有连?    const lionfixConnected =
      await dbConnectionManager.testConnection('lionfix');
    const fixcycleConnected =
      await dbConnectionManager.testConnection('fixcycle');

    if (lionfixConnected && fixcycleConnected) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?所有数据库连接初始化成?)return true;
    } else {
      console.error('�?部分数据库连接失?);
      return false;
    }
  } catch (error) {
    console.error('�?数据库连接初始化失败:', error);
    return false;
  }
}

// 数据库健康检?export async function checkDatabaseHealth(): Promise<Record<string, boolean>> {
  const healthStatus: Record<string, boolean> = {};

  try {
    healthStatus.lionfix = await dbConnectionManager.testConnection('lionfix');
  } catch {
    healthStatus.lionfix = false;
  }

  try {
    healthStatus.fixcycle =
      await dbConnectionManager.testConnection('fixcycle');
  } catch {
    healthStatus.fixcycle = false;
  }

  return healthStatus;
}
