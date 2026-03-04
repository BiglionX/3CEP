/**
 * 库存映射服务
 * 负责将WMS系统数据映射到本地数据库
 */

import { createClient } from '@supabase/supabase-js';
import { WMSInventoryItem } from './wms-client.interface';

// 初始化Supabase客户?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface InventoryMapping {
  id: string;
  connectionId: string;
  wmsSku: string;
  localProductId?: string;
  productName: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  lastUpdated: Date;
}

export interface SyncRecord {
  id: string;
  connectionId: string;
  syncType: 'full' | 'incremental' | 'manual';
  status: 'started' | 'completed' | 'failed';
  itemsCount: number;
  successCount: number;
  errorCount: number;
  startTime: Date;
  endTime?: Date;
  errorDetails?: any;
}

export class InventoryMapper {
  /**
   * 更新或创建库存映射记?   */
  async upsertInventoryMapping(
    connectionId: string,
    wmsItem: WMSInventoryItem,
    localProductId?: string
  ): Promise<{ success: boolean; mappingId?: string; error?: string }> {
    try {
      // 检查是否已存在映射
      const { data: existingMapping, error: selectError } = await supabase
        .from('wms_inventory_mapping')
        .select('id')
        .eq('connection_id', connectionId)
        .eq('wms_sku', wmsItem.sku)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        return {
          success: false,
          error: `查询现有映射失败: ${selectError.message}`,
        };
      }

      const mappingData = {
        connection_id: connectionId,
        wms_sku: wmsItem.sku,
        local_product_id: localProductId,
        product_name: wmsItem.productName,
        quantity: wmsItem.quantity,
        available_quantity: wmsItem.availableQuantity,
        reserved_quantity: wmsItem.reservedQuantity,
        location: wmsItem.location,
        batch_number: wmsItem.batchNumber,
        expiry_date: wmsItem.expiryDate,
        last_updated: wmsItem.lastUpdated,
      };

      let result;
      if (existingMapping) {
        // 更新现有记录
        const { data, error } = await supabase
          .from('wms_inventory_mapping')
          .update(mappingData)
          .eq('id', existingMapping.id)
          .select('id')
          .single();

        if (error) {
          return {
            success: false,
            error: `更新库存映射失败: ${error.message}`,
          };
        }
        result = data;
      } else {
        // 创建新记?        const { data, error } = await supabase
          .from('wms_inventory_mapping')
          .insert(mappingData)
          .select('id')
          .single();

        if (error) {
          return {
            success: false,
            error: `创建库存映射失败: ${error.message}`,
          };
        }
        result = data;
      }

      return {
        success: true,
        mappingId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: `处理库存映射时发生错? ${(error as Error).message}`,
      };
    }
  }

  /**
   * 批量更新库存映射
   */
  async bulkUpsertInventoryMappings(
    connectionId: string,
    wmsItems: WMSInventoryItem[],
    localProductMap?: Map<string, string> // WMS SKU -> Local Product ID 映射
  ): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    // 按批次处理，避免一次性处理过多数?    const batchSize = 50;
    for (let i = 0; i < wmsItems.length; i += batchSize) {
      const batch = wmsItems.slice(i, i + batchSize);

      try {
        const batchResults = await Promise.all(
          batch.map(async item => {
            const localProductId = localProductMap?.get(item.sku);
            const result = await this.upsertInventoryMapping(
              connectionId,
              item,
              localProductId
            );

            if (!result.success) {
              errors.push(`SKU ${item.sku}: ${result.error}`);
            } else {
              processed++;
            }

            return result;
          })
        );

        // 添加小延迟避免数据库压力过大
        if (i + batchSize < wmsItems.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        errors.push(`批次处理失败: ${(error as Error).message}`);
      }
    }

    return {
      success: errors.length === 0,
      processed,
      errors,
    };
  }

  /**
   * 记录库存变动历史
   */
  async recordInventoryChange(
    mappingId: string,
    before: {
      quantity: number;
      availableQuantity: number;
      reservedQuantity: number;
    },
    after: {
      quantity: number;
      availableQuantity: number;
      reservedQuantity: number;
    },
    reason: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('wms_inventory_history').insert({
        mapping_id: mappingId,
        quantity_before: before.quantity,
        quantity_after: after.quantity,
        available_before: before.availableQuantity,
        available_after: after.availableQuantity,
        reserved_before: before.reservedQuantity,
        reserved_after: after.reservedQuantity,
        change_reason: reason,
      } as any);

      return !error;
    } catch (error) {
      console.error('记录库存变动历史失败:', error);
      return false;
    }
  }

  /**
   * 创建同步记录
   */
  async createSyncRecord(
    record: Omit<SyncRecord, 'id' | 'startTime'>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('wms_sync_records')
        .insert({
          connection_id: record.connectionId,
          sync_type: record.syncType,
          status: record.status,
          items_count: record.itemsCount,
          success_count: record.successCount,
          error_count: record.errorCount,
          error_details: record.errorDetails,
          start_time: new Date().toISOString(),
        } as any)
        .select('id')
        .single();

      if (error) {
        console.error('创建同步记录失败:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('创建同步记录异常:', error);
      return null;
    }
  }

  /**
   * 更新同步记录
   */
  async updateSyncRecord(
    recordId: string,
    updates: Partial<
      Omit<SyncRecord, 'id' | 'connectionId' | 'syncType' | 'startTime'>
    >
  ): Promise<boolean> {
    try {
      const updateData: any = {
        ...updates,
      };

      if (updates.endTime) {
        updateData.end_time = updates.endTime.toISOString();
      }

      const { error } = await supabase
        .from('wms_sync_records')
        .update(updateData)
        .eq('id', recordId);

      return !error;
    } catch (error) {
      console.error('更新同步记录失败:', error);
      return false;
    }
  }

  /**
   * 获取连接的库存映?   */
  async getConnectionInventory(
    connectionId: string
  ): Promise<InventoryMapping[]> {
    try {
      const { data, error } = await supabase
        .from('wms_inventory_mapping')
        .select('*')
        .eq('connection_id', connectionId);

      if (error) {
        throw new Error(`查询库存映射失败: ${error.message}`);
      }

      return data.map(
        item =>
          ({
            id: item.id,
            connectionId: item.connection_id,
            wmsSku: item.wms_sku,
            localProductId: item.local_product_id,
            productName: item.product_name,
            quantity: item.quantity,
            availableQuantity: item.available_quantity,
            reservedQuantity: item.reserved_quantity,
            location: item.location,
            batchNumber: item.batch_number,
            expiryDate: item.expiry_date
              ? new Date(item.expiry_date)
              : undefined,
            lastUpdated: new Date(item.last_updated),
          }) as any
      );
    } catch (error) {
      console.error('获取连接库存失败:', error);
      return [];
    }
  }

  /**
   * 获取库存统计信息
   */
  async getInventoryStatistics(connectionId?: string): Promise<{
    totalItems: number;
    totalQuantity: number;
    totalAvailable: number;
    totalReserved: number;
    lastUpdated?: Date;
  }> {
    try {
      let query = supabase
        .from('wms_inventory_mapping')
        .select(
          'quantity, available_quantity, reserved_quantity, last_updated'
        );

      if (connectionId) {
        query = query.eq('connection_id', connectionId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询库存统计失败: ${error.message}`);
      }

      const stats = data.reduce(
        (acc, item) => {
          acc.totalItems++;
          acc.totalQuantity += item.quantity;
          acc.totalAvailable += item.available_quantity;
          acc.totalReserved += item.reserved_quantity;

          const itemUpdated = new Date(item.last_updated);
          if (!acc.lastUpdated || itemUpdated > acc.lastUpdated) {
            acc.lastUpdated = itemUpdated;
          }

          return acc;
        },
        {
          totalItems: 0,
          totalQuantity: 0,
          totalAvailable: 0,
          totalReserved: 0,
          lastUpdated: undefined as Date | undefined,
        }
      );

      return stats;
    } catch (error) {
      console.error('获取库存统计失败:', error);
      return {
        totalItems: 0,
        totalQuantity: 0,
        totalAvailable: 0,
        totalReserved: 0,
      };
    }
  }

  /**
   * 获取低库存预?   */
  async getLowInventoryAlerts(threshold: number = 10): Promise<
    Array<{
      connectionId: string;
      warehouseName: string;
      sku: string;
      productName: string;
      currentQuantity: number;
      availableQuantity: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('wms_current_inventory')
        .select('*')
        .lt('available_quantity', threshold);

      if (error) {
        throw new Error(`查询低库存预警失? ${error.message}`);
      }

      return data.map(item => ({
        connectionId: item.connection_id,
        warehouseName: item.warehouse_name,
        sku: item.wms_sku,
        productName: item.product_name,
        currentQuantity: item.quantity,
        availableQuantity: item.available_quantity,
      }));
    } catch (error) {
      console.error('获取低库存预警失?', error);
      return [];
    }
  }

  /**
   * 获取库存准确性报?   */
  async getInventoryAccuracyReport(connectionId?: string): Promise<{
    accuracyRate: number;
    totalItems: number;
    accurateItems: number;
    discrepancyItems: number;
    averageDiscrepancy: number;
  }> {
    try {
      // 这里可以根据业务需求实现更复杂的准确性计算逻辑
      // 比如对比WMS数据和实际盘点数?
      const stats = await this.getInventoryStatistics(connectionId);

      // 简化的准确性计算（假设所有数据都是准确的?      const accuracyRate = stats.totalItems > 0 ? 100 : 0;

      return {
        accuracyRate,
        totalItems: stats.totalItems,
        accurateItems: stats.totalItems,
        discrepancyItems: 0,
        averageDiscrepancy: 0,
      };
    } catch (error) {
      console.error('获取库存准确性报告失?', error);
      return {
        accuracyRate: 0,
        totalItems: 0,
        accurateItems: 0,
        discrepancyItems: 0,
        averageDiscrepancy: 0,
      };
    }
  }

  /**
   * 清理过期的历史记?   */
  async cleanupHistoryRecords(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('wms_inventory_history')
        .delete()
        .lt('changed_at', cutoffDate.toISOString())
        .select('count');

      if (error) {
        throw new Error(`清理历史记录失败: ${error.message}`);
      }

      return (data as any)?.(data as any)?.length || 0;
    } catch (error) {
      console.error('清理历史记录异常:', error);
      return 0;
    }
  }
}
