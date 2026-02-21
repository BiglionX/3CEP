/**
 * 多仓管理服务实现
 * 处理仓库管理、库存同步、跨仓调拨等核心功能
 */

import { 
  Warehouse,
  WarehouseType,
  WarehouseStatus,
  SyncStatus,
  InterWarehouseTransfer,
  WarehouseCapacityPlan,
  WarehousePerformanceReport,
  CreateWarehouseDTO,
  SyncInventoryDTO,
  CreateTransferDTO,
  WarehouseQueryParams
} from '../models/warehouse.model';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/fcx-system/utils/helpers';

export class WarehouseService {
  
  /**
   * 创建仓库
   */
  async createWarehouse(dto: CreateWarehouseDTO): Promise<{
    success: boolean;
    warehouseId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 参数验证
      const validation = this.validateWarehouseData(dto);
      if (!validation.isValid) {
        return {
          success: false,
          errorMessage: validation.errors.join('; ')
        };
      }

      // 2. 生成仓库编码
      const warehouseId = generateUUID();
      const warehouseCode = this.generateWarehouseCode(dto.type, dto.location.countryCode, dto.location.city);

      // 3. 创建仓库记录
      const warehouseData = {
        id: warehouseId,
        code: warehouseCode,
        name: dto.name,
        type: dto.type,
        status: WarehouseStatus.ACTIVE,
        location: dto.location,
        contact_info: dto.contactInfo,
        operational_info: dto.operationalInfo,
        logistics_info: dto.logisticsInfo,
        integration_info: {
          ...dto.integrationInfo,
          sync_status: SyncStatus.PENDING,
          last_synced_at: null
        },
        cost_structure: dto.costStructure,
        performance_metrics: {
          accuracy_rate: 0,
          on_time_rate: 0,
          damage_rate: 0,
          last_updated: new Date()
        },
        created_at: new Date(),
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('warehouses')
        .insert(warehouseData);

      if (error) {
        return {
          success: false,
          errorMessage: `创建仓库失败: ${error.message}`
        };
      }

      return {
        success: true,
        warehouseId
      };

    } catch (error) {
      console.error('创建仓库错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 获取仓库信息
   */
  async getWarehouse(warehouseId: string): Promise<Warehouse | null> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', warehouseId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`查询仓库失败: ${error.message}`);
      }

      return this.mapToWarehouse(data);

    } catch (error) {
      console.error('获取仓库信息错误:', error);
      throw error;
    }
  }

  /**
   * 查询仓库列表
   */
  async listWarehouses(params: WarehouseQueryParams): Promise<Warehouse[]> {
    try {
      let query = supabase
        .from('warehouses')
        .select('*');

      // 添加查询条件
      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.country) {
        query = query.contains('location', { country: params.country });
      }

      if (params.hasTemperatureControl !== undefined) {
        query = query.eq('operational_info.temperature_controlled', params.hasTemperatureControl);
      }

      if (params.keyword) {
        query = query.or(`name.ilike.%${params.keyword}%,code.ilike.%${params.keyword}%`);
      }

      // 排序
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // 分页
      query = query.range(
        params.offset || 0,
        (params.offset || 0) + (params.limit || 50) - 1
      );

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询仓库列表失败: ${error.message}`);
      }

      return data.map(this.mapToWarehouse);

    } catch (error) {
      console.error('查询仓库列表错误:', error);
      throw error;
    }
  }

  /**
   * 库存同步
   */
  async syncInventory(dto: SyncInventoryDTO): Promise<{
    success: boolean;
    syncRecordId?: string;
    errorMessage?: string;
  }> {
    try {
      const warehouse = await this.getWarehouse(dto.warehouseId);
      if (!warehouse) {
        return {
          success: false,
          errorMessage: '仓库不存在'
        };
      }

      // 1. 创建同步记录
      const syncRecordId = generateUUID();
      const syncRecord = {
        id: syncRecordId,
        warehouse_id: dto.warehouseId,
        sync_type: dto.syncType,
        sync_status: SyncStatus.SYNCING,
        sync_started_at: new Date(),
        retry_count: 0,
        created_at: new Date()
      };

      const { error: recordError } = await supabase
        .from('inventory_sync_records')
        .insert(syncRecord);

      if (recordError) {
        return {
          success: false,
          errorMessage: `创建同步记录失败: ${recordError.message}`
        };
      }

      // 2. 调用WMS系统API进行同步（模拟）
      try {
        const syncResult = await this.callWMSSyncAPI(warehouse, dto);
        
        // 3. 更新同步状态
        const { error: updateError } = await supabase
          .from('inventory_sync_records')
          .update({
            sync_status: syncResult.success ? SyncStatus.SYNCED : SyncStatus.FAILED,
            quantity_before: syncResult.quantityBefore,
            quantity_after: syncResult.quantityAfter,
            discrepancy: syncResult.discrepancy,
            sync_completed_at: new Date(),
            error_message: syncResult.errorMessage
          })
          .eq('id', syncRecordId);

        if (updateError) {
          console.error('更新同步记录失败:', updateError);
        }

        // 4. 更新仓库最后同步时间
        if (syncResult.success) {
          await supabase
            .from('warehouses')
            .update({
              'integration_info.last_synced_at': new Date(),
              'integration_info.sync_status': SyncStatus.SYNCED,
              updated_at: new Date()
            })
            .eq('id', dto.warehouseId);
        }

        return {
          success: syncResult.success,
          syncRecordId: syncResult.success ? syncRecordId : undefined,
          errorMessage: syncResult.errorMessage
        };

      } catch (syncError) {
        // 更新同步状态为失败
        await supabase
          .from('inventory_sync_records')
          .update({
            sync_status: SyncStatus.FAILED,
            sync_completed_at: new Date(),
            error_message: (syncError as Error).message,
            retry_count: 1
          })
          .eq('id', syncRecordId);

        return {
          success: false,
          errorMessage: `同步失败: ${(syncError as Error).message}`
        };
      }

    } catch (error) {
      console.error('库存同步错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 创建跨仓调拨
   */
  async createInterWarehouseTransfer(dto: CreateTransferDTO): Promise<{
    success: boolean;
    transferId?: string;
    transferNumber?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 验证仓库存在性
      const fromWarehouse = await this.getWarehouse(dto.fromWarehouseId);
      const toWarehouse = await this.getWarehouse(dto.toWarehouseId);

      if (!fromWarehouse || !toWarehouse) {
        return {
          success: false,
          errorMessage: '调出或调入仓库不存在'
        };
      }

      // 2. 验证库存可用性（简化验证）
      for (const item of dto.items) {
        const inventoryCheck = await this.checkInventoryAvailability(
          dto.fromWarehouseId, 
          item.productId, 
          item.quantity
        );
        
        if (!inventoryCheck.available) {
          return {
            success: false,
            errorMessage: `产品 ${item.productId} 库存不足`
          };
        }
      }

      // 3. 生成调拨单号
      const transferId = generateUUID();
      const transferNumber = this.generateTransferNumber();

      // 4. 计算总价值
      const totalValue = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitValue), 0);

      // 5. 创建调拨记录
      const transferData = {
        id: transferId,
        transfer_number: transferNumber,
        from_warehouse_id: dto.fromWarehouseId,
        to_warehouse_id: dto.toWarehouseId,
        items: dto.items.map(item => ({
          product_id: item.productId,
          product_name: 'Unknown',
          quantity: item.quantity,
          unit_value: item.unitValue,
          total_price: item.quantity * item.unitValue
        })),
        total_value: totalValue,
        status: 'pending',
        priority: dto.priority,
        estimated_departure: dto.estimatedDeparture,
        estimated_arrival: dto.estimatedDeparture, // 简化处理
        logistics_info: {
          provider: dto.logisticsProvider,
          shipping_cost: 0 // 需要计算
        },
        created_by: 'system', // 实际应为用户ID
        created_at: new Date(),
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('inter_warehouse_transfers')
        .insert(transferData);

      if (error) {
        return {
          success: false,
          errorMessage: `创建调拨记录失败: ${error.message}`
        };
      }

      return {
        success: true,
        transferId,
        transferNumber
      };

    } catch (error) {
      console.error('创建跨仓调拨错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 获取仓库容量规划
   */
  async getWarehouseCapacityPlan(warehouseId: string): Promise<WarehouseCapacityPlan | null> {
    try {
      const warehouse = await this.getWarehouse(warehouseId);
      if (!warehouse) {
        return null;
      }

      // 生成容量规划（模拟数据）
      const planId = generateUUID();
      const totalCapacity = warehouse.operationalInfo.capacity;
      const currentOccupancy = warehouse.operationalInfo.currentOccupancy;
      const availableCapacity = totalCapacity - currentOccupancy;

      const capacityPlan: WarehouseCapacityPlan = {
        id: planId,
        warehouseId: warehouseId,
        planningPeriod: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        },
        capacityAllocation: {
          totalCapacity,
          allocatedCapacity: currentOccupancy,
          reservedCapacity: totalCapacity * 0.1, // 预留10%
          availableCapacity
        },
        productCategories: [
          {
            category: '手机配件',
            allocatedSpace: currentOccupancy * 0.6,
            plannedInventory: 10000
          },
          {
            category: '笔记本配件',
            allocatedSpace: currentOccupancy * 0.3,
            plannedInventory: 5000
          },
          {
            category: '其他',
            allocatedSpace: currentOccupancy * 0.1,
            plannedInventory: 2000
          }
        ],
        utilizationRate: (currentOccupancy / totalCapacity) * 100,
        recommendations: [
          '建议增加存储设备以提高容量利用率',
          '考虑优化拣货路径提升作业效率',
          '定期清理呆滞库存释放存储空间'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return capacityPlan;

    } catch (error) {
      console.error('获取仓库容量规划错误:', error);
      throw error;
    }
  }

  /**
   * 生成仓库绩效报告
   */
  async generatePerformanceReport(warehouseId: string, startDate: Date, endDate: Date): Promise<WarehousePerformanceReport> {
    try {
      const warehouse = await this.getWarehouse(warehouseId);
      if (!warehouse) {
        throw new Error('仓库不存在');
      }

      // 模拟生成绩效数据
      const report: WarehousePerformanceReport = {
        warehouseId,
        warehouseName: warehouse.name,
        reportPeriod: {
          startDate,
          endDate
        },
        metrics: {
          inbound: {
            totalShipments: Math.floor(Math.random() * 1000) + 500,
            totalItems: Math.floor(Math.random() * 50000) + 20000,
            accuracyRate: 98.5 + Math.random() * 1.5,
            avgProcessingTime: 30 + Math.random() * 20
          },
          outbound: {
            totalOrders: Math.floor(Math.random() * 2000) + 1000,
            totalItems: Math.floor(Math.random() * 80000) + 40000,
            onTimeRate: 95 + Math.random() * 5,
            avgPickTime: 15 + Math.random() * 10,
            avgPackTime: 8 + Math.random() * 5
          },
          inventory: {
            accuracyRate: 99 + Math.random(),
            turnoverRate: 8 + Math.random() * 4,
            obsolescenceRate: 2 + Math.random() * 3
          },
          costs: {
            totalCost: 50000 + Math.random() * 30000,
            storageCost: 20000 + Math.random() * 10000,
            laborCost: 25000 + Math.random() * 15000,
            equipmentCost: 5000 + Math.random() * 3000
          }
        },
        kpiScores: {
          operationalEfficiency: 85 + Math.random() * 15,
          serviceQuality: 90 + Math.random() * 10,
          costControl: 80 + Math.random() * 20,
          overallScore: 85 + Math.random() * 15
        },
        createdAt: new Date()
      };

      return report;

    } catch (error) {
      console.error('生成绩效报告错误:', error);
      throw error;
    }
  }

  // 私有辅助方法

  private validateWarehouseData(data: CreateWarehouseDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('仓库名称不能为空');
    }

    if (!data.location.country) {
      errors.push('国家不能为空');
    }

    if (!data.location.city) {
      errors.push('城市不能为空');
    }

    if (!data.contactInfo.manager) {
      errors.push('负责人不能为空');
    }

    if (data.operationalInfo.capacity <= 0) {
      errors.push('仓库容量必须大于0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateWarehouseCode(type: WarehouseType, countryCode: string, city: string): string {
    const typePrefix = type.substring(0, 2).toUpperCase();
    const country = countryCode.toUpperCase();
    const cityCode = city.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${typePrefix}-${country}-${cityCode}-${timestamp}`;
  }

  private generateTransferNumber(): string {
    const prefix = 'TRF';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${date}${random}`;
  }

  private async callWMSSyncAPI(warehouse: Warehouse, dto: SyncInventoryDTO): Promise<{
    success: boolean;
    quantityBefore?: number;
    quantityAfter?: number;
    discrepancy?: number;
    errorMessage?: string;
  }> {
    // 模拟WMS系统API调用
    await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟网络延迟
    
    // 95%成功率
    if (Math.random() > 0.05) {
      return {
        success: true,
        quantityBefore: 1000,
        quantityAfter: 1005,
        discrepancy: 5
      };
    } else {
      return {
        success: false,
        errorMessage: 'WMS系统连接超时'
      };
    }
  }

  private async checkInventoryAvailability(warehouseId: string, productId: string, requiredQuantity: number): Promise<{
    available: boolean;
    availableQuantity: number;
  }> {
    // 模拟库存检查
    const availableQuantity = Math.floor(Math.random() * 2000) + 1000;
    return {
      available: availableQuantity >= requiredQuantity,
      availableQuantity
    };
  }

  private mapToWarehouse(data: any): Warehouse {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      status: data.status,
      location: data.location,
      contactInfo: data.contact_info,
      operationalInfo: data.operational_info,
      logisticsInfo: data.logistics_info,
      integrationInfo: data.integration_info,
      costStructure: data.cost_structure,
      performanceMetrics: data.performance_metrics,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}