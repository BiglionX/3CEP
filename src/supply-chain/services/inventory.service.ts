/**
 * 库存管理服务实现
 * 处理库存查询、调整、预警等核心功能
 */

import {
  InventoryRecord,
  InventoryMovement,
  AdjustInventoryDTO,
  InventoryQueryParams,
  InventoryStatus,
} from '../models/inventory.model';
import { IInventoryService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/fcx-system/utils/helpers';

export class InventoryService implements IInventoryService {
  /**
   * 获取库存记录
   */
  async getInventory(
    productId: string,
    warehouseId: string
  ): Promise<InventoryRecord | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_records')
        .select('*')
        .eq('product_id', productId)
        .eq('warehouse_id', warehouseId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 库存记录不存?        }
        throw new Error(`查询库存记录失败: ${error.message}`);
      }

      return this.mapToInventoryRecord(data);
    } catch (error) {
      console.error('获取库存记录错误:', error);
      throw error;
    }
  }

  /**
   * 查询库存列表
   */
  async listInventory(
    params: InventoryQueryParams
  ): Promise<InventoryRecord[]> {
    try {
      let query = supabase.from('inventory_records').select(`
          *,
          products(name, sku),
          warehouses(name, code)
        `);

      // 添加查询条件
      if (params.productId) {
        query = query.eq('product_id', params.productId);
      }

      if (params.warehouseId) {
        query = query.eq('warehouse_id', params.warehouseId);
      }

      if (params.category) {
        query = query.eq('products.category', params.category);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.minQuantity !== undefined) {
        query = query.gte('quantity', params.minQuantity);
      }

      if (params.maxQuantity !== undefined) {
        query = query.lte('quantity', params.maxQuantity);
      }

      // 排序和分?      query = query
        .order('updated_at', { ascending: false })
        .range(
          params.offset || 0,
          (params.offset || 0) + (params.limit || 50) - 1
        );

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询库存列表失败: ${error.message}`);
      }

      return data.map(this.mapToInventoryRecord);
    } catch (error) {
      console.error('查询库存列表错误:', error);
      throw error;
    }
  }

  /**
   * 调整库存
   */
  async adjustInventory(dto: AdjustInventoryDTO): Promise<InventoryMovement> {
    try {
      // 1. 验证参数
      if (dto.quantityChange === 0) {
        throw new Error('库存调整数量不能?');
      }

      // 2. 获取或创建库存记?      let inventory = await this.getInventory(dto.productId, dto.warehouseId);

      if (!inventory) {
        // 创建新的库存记录
        const newInventoryId = generateUUID();
        const { error: createError } = await supabase
          .from('inventory_records')
          .insert({
            id: newInventoryId,
            product_id: dto.productId,
            warehouse_id: dto.warehouseId,
            quantity: 0,
            reserved_quantity: 0,
            available_quantity: 0,
            safety_stock: 10, // 默认安全库存
            reorder_point: 5, // 默认重新订购?            last_restocked_at: new Date(),
            status: InventoryStatus.OUT_OF_STOCK,
            created_at: new Date(),
            updated_at: new Date(),
          } as any);

        if (createError) {
          throw new Error(`创建库存记录失败: ${createError.message}`);
        }

        inventory = await this.getInventory(dto.productId, dto.warehouseId);
        if (!inventory) {
          throw new Error('创建库存记录后查询失?);
        }
      }

      // 3. 计算新的库存数量
      const newQuantity = inventory.quantity + dto.quantityChange;
      if (newQuantity < 0) {
        throw new Error('库存不足，无法完成调?);
      }

      // 4. 更新库存记录
      const newStatus = this.determineInventoryStatus(
        newQuantity,
        inventory.safetyStock
      );
      const newAvailableQuantity = Math.max(
        0,
        newQuantity - inventory.reservedQuantity
      );

      const { error: updateError } = await supabase
        .from('inventory_records')
        .update({
          quantity: newQuantity,
          available_quantity: newAvailableQuantity,
          status: newStatus,
          updated_at: new Date(),
        } as any)
        .eq('id', inventory.id);

      if (updateError) {
        throw new Error(`更新库存记录失败: ${updateError.message}`);
      }

      // 5. 创建库存变动记录
      const movementId = generateUUID();
      const movementType = dto.quantityChange > 0 ? 'in' : 'out';

      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          id: movementId,
          product_id: dto.productId,
          warehouse_id: dto.warehouseId,
          movement_type: movementType,
          quantity: Math.abs(dto.quantityChange),
          reason: dto.reason,
          reference_number: dto.referenceNumber,
          created_by: 'system', // 实际应用中应该是当前用户ID
          created_at: new Date(),
        } as any);

      if (movementError) {
        throw new Error(`创建库存变动记录失败: ${movementError.message}`);
      }

      // 6. 返回变动记录
      return {
        id: movementId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        movementType: movementType as 'in' | 'out' | 'adjustment' | 'transfer',
        quantity: Math.abs(dto.quantityChange),
        reason: dto.reason,
        referenceNumber: dto.referenceNumber,
        createdBy: 'system',
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('调整库存错误:', error);
      throw error;
    }
  }

  /**
   * 检查库存是否充?   */
  async checkAvailability(
    productId: string,
    warehouseId: string,
    requiredQuantity: number
  ): Promise<boolean> {
    try {
      const inventory = await this.getInventory(productId, warehouseId);
      if (!inventory) {
        return false;
      }

      return inventory.availableQuantity >= requiredQuantity;
    } catch (error) {
      console.error('检查库存可用性错?', error);
      return false;
    }
  }

  /**
   * 获取商品总库?   */
  async getTotalInventory(productId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('inventory_records')
        .select('quantity')
        .eq('product_id', productId);

      if (error) {
        throw new Error(`查询商品总库存失? ${error.message}`);
      }

      return data.reduce((sum, record) => sum + record.quantity, 0);
    } catch (error) {
      console.error('获取商品总库存错?', error);
      throw error;
    }
  }

  /**
   * 生成库存预警
   */
  async generateLowStockAlerts(): Promise<
    Array<{
      productId: string;
      productName: string;
      warehouseId: string;
      currentQuantity: number;
      safetyStock: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('inventory_records')
        .select(
          `
          *,
          products(name),
          warehouses(name)
        `
        )
        .or('status.eq.low_stock,status.eq.out_of_stock');

      if (error) {
        throw new Error(`查询低库存预警失? ${error.message}`);
      }

      return data.map(
        record =>
          ({
            productId: record.product_id,
            productName: record?.name || '未知商品',
            warehouseId: record.warehouse_id,
            currentQuantity: record.quantity,
            safetyStock: record.safety_stock,
          }) as any
      );
    } catch (error) {
      console.error('生成库存预警错误:', error);
      throw error;
    }
  }

  /**
   * 智能补货建议
   */
  async getReplenishmentSuggestions(): Promise<
    Array<{
      productId: string;
      productName: string;
      suggestedQuantity: number;
      reason: string;
    }>
  > {
    try {
      // 查询需要补货的商品
      const { data, error } = await supabase
        .from('inventory_records')
        .select(
          `
          *,
          products(name, sku)
        `
        )
        .lt('quantity', 'reorder_point');

      if (error) {
        throw new Error(`查询补货建议失败: ${error.message}`);
      }

      return data.map(record => {
        const suggestedQuantity = Math.max(
          record.reorder_point * 2 - record.quantity, // 建议补货?倍重新订购点
          record.safety_stock * 3 - record.quantity // 至少保证3倍安全库?        );

        return {
          productId: record.product_id,
          productName: record?.name || '未知商品',
          suggestedQuantity: Math.max(suggestedQuantity, 0),
          reason: `当前库存${record.quantity}低于重新订购?{record.reorder_point}`,
        };
      });
    } catch (error) {
      console.error('获取补货建议错误:', error);
      throw error;
    }
  }

  /**
   * 根据库存数量和安全库存确定库存状?   */
  private determineInventoryStatus(
    quantity: number,
    safetyStock: number
  ): InventoryStatus {
    if (quantity <= 0) {
      return InventoryStatus.OUT_OF_STOCK;
    } else if (quantity <= safetyStock) {
      return InventoryStatus.LOW_STOCK;
    } else {
      return InventoryStatus.IN_STOCK;
    }
  }

  /**
   * 映射数据库记录到库存记录对象
   */
  private mapToInventoryRecord(data: any): InventoryRecord {
    return {
      id: data.id,
      productId: data.product_id,
      warehouseId: data.warehouse_id,
      quantity: data.quantity,
      reservedQuantity: data.reserved_quantity,
      availableQuantity: data.available_quantity,
      safetyStock: data.safety_stock,
      reorderPoint: data.reorder_point,
      lastRestockedAt: new Date(data.last_restocked_at),
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
