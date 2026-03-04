/**
 * @file data-source-manager.ts
 * @description 数据源管理器
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import { BaseService } from './base-service';

// 数据源配?
export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'trino' | 'api';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectionString?: string;
  poolSize?: number;
  timeout?: number;
}

// 查询结果
export interface QueryResult {
  rows: any[];
  rowCount: number;
  columns: ColumnInfo[];
  executionTime: number;
}

// 列信?
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
}

/**
 * 数据源管理器
 */
export class DataSourceManager extends BaseService {
  private dataSources: Map<string, DataSourceConfig> = new Map();
  private connectionPools: Map<string, any> = new Map();
  private queryCache: Map<string, { result: QueryResult; timestamp: number }> = new Map();

  constructor() {
    super('DataSourceManager');
    this.initializeDefaultDataSources();
  }

  /**
   * 初始化默认数据源
   */
  private initializeDefaultDataSources(): void {
    const defaultSources: DataSourceConfig[] = [
      {
        id: 'analytics_db',
        name: '分析数据?,
        type: 'postgresql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'analytics',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        poolSize: 10,
        timeout: 30000
      },
      {
        id: 'trino_engine',
        name: 'Trino查询引擎',
        type: 'trino',
        host: process.env.TRINO_HOST || 'localhost',
        port: parseInt(process.env.TRINO_PORT || '8080'),
        database: 'fixcycle',
        username: 'data_analyst',
        password: '',
        timeout: 60000
      }
    ];

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  /**
   * 添加数据?
   */
  async addDataSource(config: DataSourceConfig): Promise<void> {
    this.validateDataSourceConfig(config);
    this.dataSources.set(config.id, config);
    await this.initializeConnectionPool(config.id);
    this.logOperation('添加数据?, { dataSourceId: config.id });
  }

  /**
   * 删除数据?
   */
  async removeDataSource(dataSourceId: string): Promise<boolean> {
    const exists = this.dataSources.has(dataSourceId);
    if (exists) {
      await this.closeConnectionPool(dataSourceId);
      this.dataSources.delete(dataSourceId);
      this.connectionPools.delete(dataSourceId);
      this.logOperation('删除数据?, { dataSourceId });
    }
    return exists;
  }

  /**
   * 获取数据源列?
   */
  getDataSources(): DataSourceConfig[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * 获取数据源配?
   */
  getDataSource(dataSourceId: string): DataSourceConfig | undefined {
    return this.dataSources.get(dataSourceId);
  }

  /**
   * 测试数据源连?
   */
  async testConnection(dataSourceId: string): Promise<boolean> {
    try {
      const connection = await this.getConnection(dataSourceId);
      // 执行简单的测试查询
      await this.executeSimpleQuery(connection, 'SELECT 1');
      return true;
    } catch (error) {
      this.logError(error as Error, `测试数据源连接失? ${dataSourceId}`);
      return false;
    }
  }

  /**
   * 执行查询
   */
  async executeQuery(
    query: string, 
    params: Record<string, any> = {},
    dataSourceId: string = 'analytics_db'
  ): Promise<QueryResult> {
    // 生成缓存?
    const cacheKey = this.generateCacheKey(query, params, dataSourceId);
    
    // 检查缓?
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
      return cached.result;
    }

    const startTime = Date.now();
    
    try {
      const connection = await this.getConnection(dataSourceId);
      const processedQuery = this.processQueryParameters(query, params);
      const result = await this.executeDatabaseQuery(connection, processedQuery);
      
      const queryResult: QueryResult = {
        rows: result.rows,
        rowCount: result.rowCount,
        columns: result.columns,
        executionTime: Date.now() - startTime
      };

      // 缓存结果
      this.queryCache.set(cacheKey, {
        result: queryResult,
        timestamp: Date.now()
      });

      this.logOperation('执行查询', {
        dataSourceId,
        queryLength: query.length,
        rowCount: result.rowCount,
        executionTime: queryResult.executionTime
      });

      return queryResult;
    } catch (error) {
      this.logError(error as Error, `查询执行失败: ${dataSourceId}`);
      throw error;
    }
  }

  /**
   * 获取表结构信?
   */
  async getTableSchema(
    tableName: string,
    dataSourceId: string = 'analytics_db'
  ): Promise<ColumnInfo[]> {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `;
    
    const result = await this.executeQuery(query, { tableName }, dataSourceId);
    return result.rows.map(row => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES'
    }));
  }

  /**
   * 获取数据库中的所有表
   */
  async getTables(dataSourceId: string = 'analytics_db'): Promise<string[]> {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const result = await this.executeQuery(query, {}, dataSourceId);
    return result.rows.map(row => row.table_name);
  }

  // 私有方法
  private validateDataSourceConfig(config: DataSourceConfig): void {
    if (!config.id || !config.name) {
      throw new Error('数据源ID和名称不能为?);
    }
    
    if (!['postgresql', 'mysql', 'sqlite', 'trino', 'api'].includes(config.type)) {
      throw new Error('不支持的数据源类?);
    }
  }

  private async initializeConnectionPool(dataSourceId: string): Promise<void> {
    // 简化实?
    this.connectionPools.set(dataSourceId, {
      query: async (query: string) => ({ rows: [], rowCount: 0, columns: [] })
    });
  }

  private async getConnection(dataSourceId: string): Promise<any> {
    return this.connectionPools.get(dataSourceId) || {};
  }

  private async closeConnectionPool(dataSourceId: string): Promise<void> {
    this.connectionPools.delete(dataSourceId);
  }

  private async executeSimpleQuery(connection: any, query: string): Promise<void> {
    if (connection.query) {
      await connection.query(query);
    }
  }

  private async executeDatabaseQuery(connection: any, query: string): Promise<any> {
    if (connection.query) {
      return await connection.query(query);
    }
    return { rows: [], rowCount: 0, columns: [] };
  }

  private processQueryParameters(query: string, params: Record<string, any>): string {
    let processedQuery = query;
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `:${key}`;
      processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return processedQuery;
  }

  private generateCacheKey(query: string, params: Record<string, any>, dataSourceId: string): string {
    return `query:${dataSourceId}:${this.hashString(query + JSON.stringify(params))}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}