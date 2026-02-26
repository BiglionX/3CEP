/**
 * 库存预留和扣减服务
 * 处理FCX兑换过程中的库存管理逻辑
 */
import { supabase } from '@/lib/supabase';

interface InventoryReservation {
  id: string;
  partId: string;
  warehouseId: string;
  quantity: number;
  reservationType: 'fcx_exchange' | 'purchase_order' | 'maintenance';
  expiresAt: Date;
  status: 'active' | 'used' | 'expired' | 'cancelled';
}

interface ReservationRequest {
  partId: string;
  warehouseId: string;
  quantity: number;
  orderId?: string;
  reservationType?: 'fcx_exchange' | 'purchase_order' | 'maintenance';
}

interface InventoryUpdate {
  partId: string;
  warehouseId: string;
  quantityChange: number; // 正数为增加，负数为减少
  reason: string;
  referenceId?: string;
}

export class InventoryReservationService {
  /**
   * 预留库存
   */
  async reserveInventory(request: ReservationRequest): Promise<{
    success: boolean;
    reservationId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 检查库存是否充足
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_records')
        .select('available_quantity, reserved_quantity, total_quantity')
        .eq('product_id', request.partId)
        .eq('warehouse_id', request.warehouseId)
        .single();

      if (inventoryError) {
        return {
          success: false,
          errorMessage: `查询库存失败: ${inventoryError.message}`
        };
      }

      if (!inventory) {
        return {
          success: false,
          errorMessage: '库存记录不存在'
        };
      }

      if (inventory.available_quantity < request.quantity) {
        return {
          success: false,
          errorMessage: `库存不足，当前可用: ${inventory.available_quantity}, 需要: ${request.quantity}`
        };
      }

      // 2. 创建库存预留记录
      const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
      
      const { error: reservationError } = await supabase
        .from('inventory_reservations')
        .insert({
          id: reservationId,
          part_id: request.partId,
          warehouse_id: request.warehouseId,
          order_item_id: request.orderId,
          quantity: request.quantity,
          reservation_type: request.reservationType || 'fcx_exchange',
          expires_at: expiresAt,
          status: 'active'
        } as any);

      if (reservationError) {
        return {
          success: false,
          errorMessage: `创建预留记录失败: ${reservationError.message}`
        };
      }

      // 3. 更新库存记录（减少可用库存，增加预留库存）
      const { error: updateError } = await supabase
        .from('inventory_records')
        .update({
          available_quantity: inventory.available_quantity - request.quantity,
          reserved_quantity: inventory.reserved_quantity + request.quantity,
          updated_at: new Date()
        } as any)
        .eq('product_id', request.partId)
        .eq('warehouse_id', request.warehouseId);

      if (updateError) {
        // 如果更新失败，删除预留记录
        await supabase
          .from('inventory_reservations')
          .delete()
          .eq('id', reservationId);
        
        return {
          success: false,
          errorMessage: `更新库存失败: ${updateError.message}`
        };
      }

      return {
        success: true,
        reservationId
      };

    } catch (error) {
      console.error('预留库存错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 批量预留库存
   */
  async reserveMultipleItems(items: Array<{
    partId: string;
    warehouseId: string;
    quantity: number;
    orderId?: string;
  }>): Promise<{
    success: boolean;
    reservationIds: string[];
    failedItems: Array<{ partId: string; reason: string }>;
  }> {
    const reservationIds: string[] = [];
    const failedItems: Array<{ partId: string; reason: string }> = [];

    for (const item of items) {
      const result = await this.reserveInventory({
        partId: item.partId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        orderId: item.orderId,
        reservationType: 'fcx_exchange'
      });

      if (result.success && result.reservationId) {
        reservationIds.push(result.reservationId);
      } else {
        failedItems.push({
          partId: item.partId,
          reason: result.errorMessage || '未知错误'
        });
      }
    }

    return {
      success: failedItems.length === 0,
      reservationIds,
      failedItems
    };
  }

  /**
   * 确认预留（将预留库存转为实际扣减）
   */
  async confirmReservation(reservationId: string): Promise<boolean> {
    try {
      // 1. 获取预留记录
      const { data: reservation, error: reservationError } = await supabase
        .from('inventory_reservations')
        .select('part_id, warehouse_id, quantity, status')
        .eq('id', reservationId)
        .single();

      if (reservationError || !reservation) {
        console.error('获取预留记录失败:', reservationError?.message);
        return false;
      }

      if (reservation.status !== 'active') {
        console.error('预留记录状态无效:', reservation.status);
        return false;
      }

      // 2. 更新预留记录状态为已使用
      const { error: updateReservationError } = await supabase
        .from('inventory_reservations')
        .update({
          status: 'used',
          updated_at: new Date()
        } as any)
        .eq('id', reservationId);

      if (updateReservationError) {
        console.error('更新预留记录失败:', updateReservationError.message);
        return false;
      }

      // 3. 更新库存记录（减少总库存和预留库存）
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_records')
        .select('total_quantity, reserved_quantity')
        .eq('product_id', reservation.part_id)
        .eq('warehouse_id', reservation.warehouse_id)
        .single();

      if (inventoryError || !inventory) {
        console.error('获取库存记录失败:', inventoryError?.message);
        // 回滚预留记录状态
        await supabase
          .from('inventory_reservations')
          .update({ status: 'active' } as any)
          .eq('id', reservationId);
        return false;
      }

      const { error: updateInventoryError } = await supabase
        .from('inventory_records')
        .update({
          total_quantity: inventory.total_quantity - reservation.quantity,
          reserved_quantity: inventory.reserved_quantity - reservation.quantity,
          updated_at: new Date()
        } as any)
        .eq('product_id', reservation.part_id)
        .eq('warehouse_id', reservation.warehouse_id);

      if (updateInventoryError) {
        console.error('更新库存记录失败:', updateInventoryError.message);
        // 回滚操作
        await supabase
          .from('inventory_reservations')
          .update({ status: 'active' } as any)
          .eq('id', reservationId);
        return false;
      }

      // 4. 记录库存变动历史
      await this.recordInventoryMovement({
        partId: reservation.part_id,
        warehouseId: reservation.warehouse_id,
        quantityChange: -reservation.quantity,
        reason: 'FCX兑换确认扣减',
        referenceId: reservationId
      });

      return true;

    } catch (error) {
      console.error('确认预留错误:', error);
      return false;
    }
  }

  /**
   * 释放预留库存
   */
  async releaseReservation(reservationId: string): Promise<boolean> {
    try {
      // 1. 获取预留记录
      const { data: reservation, error: reservationError } = await supabase
        .from('inventory_reservations')
        .select('part_id, warehouse_id, quantity, status')
        .eq('id', reservationId)
        .single();

      if (reservationError || !reservation) {
        console.error('获取预留记录失败:', reservationError?.message);
        return false;
      }

      // 2. 更新预留记录状态
      const { error: updateReservationError } = await supabase
        .from('inventory_reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date()
        } as any)
        .eq('id', reservationId);

      if (updateReservationError) {
        console.error('更新预留记录失败:', updateReservationError.message);
        return false;
      }

      // 3. 恢复库存（增加可用库存，减少预留库存）
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_records')
        .select('available_quantity, reserved_quantity')
        .eq('product_id', reservation.part_id)
        .eq('warehouse_id', reservation.warehouse_id)
        .single();

      if (inventoryError || !inventory) {
        console.error('获取库存记录失败:', inventoryError?.message);
        return false;
      }

      const { error: updateInventoryError } = await supabase
        .from('inventory_records')
        .update({
          available_quantity: inventory.available_quantity + reservation.quantity,
          reserved_quantity: inventory.reserved_quantity - reservation.quantity,
          updated_at: new Date()
        } as any)
        .eq('product_id', reservation.part_id)
        .eq('warehouse_id', reservation.warehouse_id);

      if (updateInventoryError) {
        console.error('恢复库存失败:', updateInventoryError.message);
        return false;
      }

      return true;

    } catch (error) {
      console.error('释放预留错误:', error);
      return false;
    }
  }

  /**
   * 批量释放预留
   */
  async releaseMultipleReservations(reservationIds: string[]): Promise<void> {
    for (const reservationId of reservationIds) {
      await this.releaseReservation(reservationId);
    }
  }

  /**
   * 检查并清理过期的预留记录
   */
  async cleanupExpiredReservations(): Promise<{
    cleanedCount: number;
    restoredQuantities: Array<{ partId: string; quantity: number }>;
  }> {
    try {
      // 1. 查找过期的预留记录
      const { data: expiredReservations, error: queryError } = await supabase
        .from('inventory_reservations')
        .select('id, part_id, warehouse_id, quantity, status')
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'active');

      if (queryError) {
        throw new Error(`查询过期预留失败: ${queryError.message}`);
      }

      if (!expiredReservations || expiredReservations.length === 0) {
        return { cleanedCount: 0, restoredQuantities: [] };
      }

      const restoredQuantities: Array<{ partId: string; quantity: number }> = [];
      let cleanedCount = 0;

      // 2. 处理每个过期预留
      for (const reservation of expiredReservations) {
        // 更新预留状态为过期
        const { error: updateError } = await supabase
          .from('inventory_reservations')
          .update({
            status: 'expired',
            updated_at: new Date()
          } as any)
          .eq('id', reservation.id);

        if (updateError) {
          console.error(`更新预留记录${reservation.id}失败:`, updateError.message);
          continue;
        }

        // 恢复库存
        const { error: inventoryError } = await supabase
          .from('inventory_records')
          .update({
            available_quantity: (await this.getCurrentAvailableQuantity(
              reservation.part_id,
              reservation.warehouse_id
            )) + reservation.quantity,
            reserved_quantity: (await this.getCurrentReservedQuantity(
              reservation.part_id,
              reservation.warehouse_id
            )) - reservation.quantity,
            updated_at: new Date()
          } as any)
          .eq('product_id', reservation.part_id)
          .eq('warehouse_id', reservation.warehouse_id);

        if (inventoryError) {
          console.error(`恢复库存失败 for ${reservation.part_id}:`, inventoryError.message);
        } else {
          restoredQuantities.push({
            partId: reservation.part_id,
            quantity: reservation.quantity
          });
          cleanedCount++;
        }
      }

      return { cleanedCount, restoredQuantities };

    } catch (error) {
      console.error('清理过期预留错误:', error);
      return { cleanedCount: 0, restoredQuantities: [] };
    }
  }

  /**
   * 记录库存变动历史
   */
  private async recordInventoryMovement(update: InventoryUpdate): Promise<void> {
    try {
      const movementId = `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase
        .from('inventory_movements')
        .insert({
          id: movementId,
          product_id: update.partId,
          warehouse_id: update.warehouseId,
          movement_type: update.quantityChange > 0 ? 'in' : 'out',
          quantity: Math.abs(update.quantityChange),
          reason: update.reason,
          reference_number: update.referenceId,
          created_at: new Date()
        } as any);
    } catch (error) {
      console.error('记录库存变动历史错误:', error);
    }
  }

  /**
   * 获取当前可用库存数量
   */
  private async getCurrentAvailableQuantity(partId: string, warehouseId: string): Promise<number> {
    const { data } = await supabase
      .from('inventory_records')
      .select('available_quantity')
      .eq('product_id', partId)
      .eq('warehouse_id', warehouseId)
      .single();
    
    return data?.available_quantity || 0;
  }

  /**
   * 获取当前预留库存数量
   */
  private async getCurrentReservedQuantity(partId: string, warehouseId: string): Promise<number> {
    const { data } = await supabase
      .from('inventory_records')
      .select('reserved_quantity')
      .eq('product_id', partId)
      .eq('warehouse_id', warehouseId)
      .single();
    
    return data?.reserved_quantity || 0;
  }

  /**
   * 获取配件的FCX价格
   */
  async getPartFcxPrice(partId: string): Promise<number> {
    const { data, error } = await supabase
      .from('current_part_fcx_prices')
      .select('fcx_price')
      .eq('part_id', partId)
      .single();

    if (error) {
      console.error('获取配件FCX价格失败:', error);
      return 0;
    }

    return data?.fcx_price || 0;
  }

  /**
   * 批量获取多个配件的FCX价格
   */
  async getMultiplePartFcxPrices(partIds: string[]): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('current_part_fcx_prices')
      .select('part_id, fcx_price')
      .in('part_id', partIds);

    if (error) {
      console.error('批量获取配件FCX价格失败:', error);
      return {};
    }

    const priceMap: Record<string, number> = {};
    data?.forEach(item => {
      priceMap[item.part_id] = item.fcx_price;
    });

    return priceMap;
  }
}