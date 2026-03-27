/**
 * 外部数据同步服务
 *
 * 负责从第三方数据库同步数据到本地临时表（staging）
 * 支持：零配件数据库、ERP 系统、CRM 系统等
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 第三方数据库客户端接口
interface ThirdPartyClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  fetchData(params?: Record<string, any>): Promise<any[]>;
  testConnection(): Promise<boolean>;
}

// 同步结果
export interface SyncResult {
  success: boolean;
  total: number;
  inserted: number;
  updated: number;
  deleted: number;
  failed: number;
  skipped: number;
  error?: string;
  duration: number;
}

// 数据源配置
export interface DataSourceConfig {
  id: string;
  name: string;
  type: string;
  connection_config: any;
  sync_frequency: number;
  sync_enabled: boolean;
}

/**
 * 外部数据同步服务类
 */
export class ExternalDataSyncService {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 从第三方数据库同步数据
   */
  async syncFromThirdParty(sourceId: string): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // 1. 获取数据源配置
      const source = await this.getDataSource(sourceId);
      if (!source) {
        throw new Error(`数据源 ${sourceId} 不存在`);
      }

      if (!source.sync_enabled) {
        throw new Error(`数据源 ${source.name} 未启用自动同步`);
      }

      // 2. 创建第三方客户端并连接
      const client = this.createThirdPartyClient(source);
      await client.connect();

      try {
        // 3. 获取第三方数据
        const externalData = await client.fetchData();
        console.log(`✅ 从 ${source.name} 获取 ${externalData.length} 条记录`);

        // 4. 转换并检测变更
        const transformedData = await this.transformAndDetectChanges(
          sourceId,
          externalData,
          source.type
        );

        // 5. 批量插入临时表
        const insertResult = await this.batchInsertToStaging(transformedData);

        // 6. 更新最后同步时间
        await this.updateLastSyncTime(sourceId);

        const duration = (Date.now() - startTime) / 1000;

        return {
          success: true,
          total: externalData.length,
          inserted: insertResult.inserted,
          updated: insertResult.updated,
          deleted: insertResult.deleted,
          failed: insertResult.failed,
          skipped: insertResult.skipped,
          duration,
        };
      } finally {
        // 7. 断开连接
        await client.disconnect();
      }
    } catch (error: any) {
      console.error('❌ 同步失败:', error);

      // 记录错误日志
      await this.recordSyncError(sourceId, error);

      return {
        success: false,
        total: 0,
        inserted: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        skipped: 0,
        error: error.message,
        duration: (Date.now() - startTime) / 1000,
      };
    }
  }

  /**
   * 手动触发同步（管理员操作）
   */
  async manualSync(sourceId: string): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // 1. 获取数据源配置
      const source = await this.getDataSource(sourceId);
      if (!source) {
        throw new Error(`数据源 ${sourceId} 不存在`);
      }

      // 2. 创建第三方客户端并连接
      const client = this.createThirdPartyClient(source);
      await client.connect();

      try {
        // 3. 获取第三方数据
        const externalData = await client.fetchData();
        console.log(`✅ 从 ${source.name} 获取 ${externalData.length} 条记录`);

        // 4. 转换并检测变更
        const transformedData = await this.transformAndDetectChanges(
          sourceId,
          externalData,
          source.type
        );

        // 5. 批量插入临时表
        const insertResult = await this.batchInsertToStaging(transformedData);

        // 6. 更新最后同步时间
        await this.updateLastSyncTime(sourceId);

        const duration = (Date.now() - startTime) / 1000;

        return {
          success: true,
          total: externalData.length,
          inserted: insertResult.inserted,
          updated: insertResult.updated,
          deleted: insertResult.deleted,
          failed: insertResult.failed,
          skipped: insertResult.skipped,
          duration,
        };
      } finally {
        await client.disconnect();
      }
    } catch (error: any) {
      console.error('❌ 手动同步失败:', error);
      await this.recordSyncError(sourceId, error);

      return {
        success: false,
        total: 0,
        inserted: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        skipped: 0,
        error: error.message,
        duration: (Date.now() - startTime) / 1000,
      };
    }
  }

  /**
   * 测试第三方数据库连接
   */
  async testConnection(sourceConfig: DataSourceConfig): Promise<boolean> {
    try {
      const client = this.createThirdPartyClient(sourceConfig);
      await client.connect();
      const result = await client.testConnection();
      await client.disconnect();
      return result;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }

  /**
   * 创建第三方数据库客户端
   */
  private createThirdPartyClient(source: DataSourceConfig): ThirdPartyClient {
    switch (source.type) {
      case 'parts':
        return new PartsDatabaseClient(source.connection_config);
      case 'erp':
        return new ERPSystemClient(source.connection_config);
      case 'crm':
        return new CRMSystemClient(source.connection_config);
      default:
        throw new Error(`不支持的数据源类型：${source.type}`);
    }
  }

  /**
   * 转换数据并检测变更
   */
  private async transformAndDetectChanges(
    sourceId: string,
    externalData: any[],
    sourceType: string
  ): Promise<any[]> {
    const transformed = externalData.map(item => {
      // 转换为本地格式
      const localFormat = this.transformToLocalFormat(item, sourceType);

      // 计算数据哈希值
      const dataHash = this.calculateDataHash(localFormat);

      return {
        ...localFormat,
        source_id: sourceId,
        data_hash: dataHash,
        sync_status: 'pending',
        synced_at: new Date().toISOString(),
      };
    });

    // 检测每条记录的变更类型
    const withChangeMode = await Promise.all(
      transformed.map(async item => {
        const mode = await this.detectChangeMode(
          sourceId,
          item.part_number,
          item.data_hash
        );
        return {
          ...item,
          sync_mode: mode,
        };
      })
    );

    return withChangeMode;
  }

  /**
   * 转换为本地格式
   */
  private transformToLocalFormat(data: any, sourceType: string): any {
    // 根据数据源类型进行转换
    if (sourceType === 'parts') {
      return {
        part_number: data.partNumber || data.code,
        part_name: data.partName || data.name,
        category: data.category || data.classification,
        brand: data.brand || data.manufacturer,
        model: data.model || data.specification,
        specifications: JSON.stringify(data.specifications || {}),
        price: parseFloat(data.price || 0),
        currency: data.currency || 'CNY',
        stock_quantity: parseInt(data.stockQuantity || data.quantity || 0),
        min_order_qty: parseInt(data.minOrderQty || 1),
        supplier_info: JSON.stringify(data.supplierInfo || {}),
        images: JSON.stringify(data.images || []),
        documents: JSON.stringify(data.documents || []),
      };
    }

    // 其他类型的默认转换
    return {
      part_number: data.id || data.code,
      part_name: data.name || data.title,
      category: data.category,
      specifications: JSON.stringify(data),
    };
  }

  /**
   * 检测变更类型（insert/update/delete）
   */
  private async detectChangeMode(
    sourceId: string,
    partNumber: string,
    newHash: string
  ): Promise<'insert' | 'update' | 'delete'> {
    // 查询临时表中是否已存在
    const { data: existing } = await this.supabase
      .from('parts_staging')
      .select('data_hash')
      .eq('source_id', sourceId)
      .eq('part_number', partNumber)
      .eq('sync_status', 'pending')
      .single();

    if (!existing) {
      // 检查正式表中是否存在
      const { data: inProduction } = await this.supabase
        .from('parts')
        .select('part_number')
        .eq('part_number', partNumber)
        .single();

      if (!inProduction) {
        return 'insert'; // 全新数据
      } else {
        return 'update'; // 正式表有，临时表没有，可能是更新
      }
    }

    // 比较哈希值
    if (existing.data_hash !== newHash) {
      return 'update'; // 数据有变化
    }

    return 'delete'; // 数据无变化，标记为删除（从临时表清理）
  }

  /**
   * 计算数据哈希值
   */
  private calculateDataHash(data: any): string {
    const hashString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  /**
   * 批量插入临时表
   */
  private async batchInsertToStaging(records: any[]): Promise<{
    inserted: number;
    updated: number;
    deleted: number;
    failed: number;
    skipped: number;
  }> {
    let inserted = 0;
    let updated = 0;
    const deleted = 0;
    let failed = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        if (record.sync_mode === 'insert') {
          // 插入新记录
          const { error } = await this.supabase
            .from('parts_staging')
            .insert(record);

          if (error) {
            failed++;
            console.error('插入失败:', error);
          } else {
            inserted++;
          }
        } else if (record.sync_mode === 'update') {
          // 更新现有记录
          const { error } = await this.supabase
            .from('parts_staging')
            .update(record)
            .eq('source_id', record.source_id)
            .eq('part_number', record.part_number);

          if (error) {
            failed++;
            console.error('更新失败:', error);
          } else {
            updated++;
          }
        } else if (record.sync_mode === 'delete') {
          // 标记为删除（实际是跳过）
          skipped++;
        }
      } catch (error: any) {
        failed++;
        console.error('处理记录失败:', error);
      }
    }

    return { inserted, updated, deleted, failed, skipped };
  }

  /**
   * 更新最后同步时间
   */
  private async updateLastSyncTime(sourceId: string): Promise<void> {
    await this.supabase
      .from('external_data_sources')
      .update({
        last_sync_at: new Date().toISOString(),
        health_status: 'healthy',
      })
      .eq('id', sourceId);
  }

  /**
   * 记录同步错误
   */
  private async recordSyncError(sourceId: string, error: any): Promise<void> {
    await this.supabase
      .from('external_data_sources')
      .update({
        health_status: 'unhealthy',
      })
      .eq('id', sourceId);

    await this.supabase.from('sync_history').insert({
      source_id: sourceId,
      status: 'failed',
      error_message: error.message,
      error_details: JSON.stringify({
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * 获取数据源配置
   */
  private async getDataSource(
    sourceId: string
  ): Promise<DataSourceConfig | null> {
    const { data, error } = await this.supabase
      .from('external_data_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as DataSourceConfig;
  }
}

/**
 * 零配件数据库客户端（示例实现）
 */
class PartsDatabaseClient implements ThirdPartyClient {
  private config: any;
  private connected: boolean = false;

  constructor(config: any) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // TODO: 实现真实的数据库连接逻辑
    // 这里可以使用 mysql2, pg 等库连接第三方数据库
    console.log('连接到零配件数据库:', this.config.host);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    console.log('断开零配件数据库连接');
    this.connected = false;
  }

  async fetchData(params?: Record<string, any>): Promise<any[]> {
    if (!this.connected) {
      throw new Error('未连接到数据库');
    }

    // TODO: 实现真实的数据查询逻辑
    // 返回示例数据
    return [
      {
        partNumber: 'P001',
        partName: 'iPhone 12 屏幕总成',
        category: '手机配件',
        brand: 'Apple',
        model: 'A2404',
        price: 899,
        stockQuantity: 100,
      },
      {
        partNumber: 'P002',
        partName: 'MacBook Pro 电池',
        category: '电脑配件',
        brand: 'Apple',
        model: 'A2141',
        price: 1299,
        stockQuantity: 50,
      },
    ];
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * ERP 系统客户端（占位实现）
 */
class ERPSystemClient implements ThirdPartyClient {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async connect(): Promise<void> {
    console.log('连接到 ERP 系统');
  }

  async disconnect(): Promise<void> {
    console.log('断开 ERP 系统连接');
  }

  async fetchData(params?: Record<string, any>): Promise<any[]> {
    // TODO: 实现 ERP 系统数据获取逻辑
    return [];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * CRM 系统客户端（占位实现）
 */
class CRMSystemClient implements ThirdPartyClient {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async connect(): Promise<void> {
    console.log('连接到 CRM 系统');
  }

  async disconnect(): Promise<void> {
    console.log('断开 CRM 系统连接');
  }

  async fetchData(params?: Record<string, any>): Promise<any[]> {
    // TODO: 实现 CRM 系统数据获取逻辑
    return [];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}
