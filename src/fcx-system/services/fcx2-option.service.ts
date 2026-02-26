/**
 * FCX2期权服务实现
 * 处理期权发放、查询、兑换等核心功能
 */

import { 
  Fcx2Option,
  Fcx2OptionStatus,
  RepairOrder
} from '../models/fcx-account.model';
import { IFcx2OptionService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';

export class Fcx2OptionService implements IFcx2OptionService {
  
  /**
   * 发放FCX2期权奖励
   */
  async grantOption(shopId: string, amount: number, orderId?: string): Promise<Fcx2Option> {
    try {
      // 1. 验证参数
      if (amount <= 0) {
        throw new Error('期权金额必须大于0');
      }

      // 2. 检查维修店是否存在
      const { data: shopData, error: shopError } = await supabase
        .from('repair_shops')
        .select('id, name, is_alliance_member')
        .eq('id', shopId)
        .single();

      if (shopError || !shopData) {
        throw new Error('维修店不存在');
      }

      if (!shopData.is_alliance_member) {
        throw new Error('只有联盟成员才能获得FCX2期权奖励');
      }

      // 3. 创建期权记录
      const optionData = {
        id: generateUUID(),
        repair_shop_id: shopId,
        amount: amount,
        earned_from_order_id: orderId || null,
        status: Fcx2OptionStatus.ACTIVE,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString() // 2年后过期
      };

      const { data, error } = await supabase
        .from('fcx2_options')
        .insert(optionData)
        .select()
        .single();

      if (error) {
        throw new Error(`发放期权失败: ${error.message}`);
      }

      // 4. 更新维修店的FCX2余额
      const { data: currentShop, error: currentError } = await supabase
        .from('repair_shops')
        .select('fcx2_balance')
        .eq('id', shopId)
        .single();

      if (currentError) {
        throw new Error(`查询当前余额失败: ${currentError.message}`);
      }

      const newBalance = (currentShop?.fcx2_balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('repair_shops')
        .update({ fcx2_balance: newBalance } as any)
        .eq('id', shopId);

      if (updateError) {
        // 如果更新失败，回滚期权记录
        await supabase.from('fcx2_options').delete().eq('id', data.id);
        throw new Error(`更新FCX2余额失败: ${updateError.message}`);
      }

      // 5. 如果有关联工单，更新工单的期权发放状态
      if (orderId) {
        await supabase
          .from('repair_orders')
          .update({ fcx2_option_granted: true } as any)
          .eq('id', orderId);
      }

      return this.mapToFcx2Option(data);

    } catch (error) {
      console.error('发放FCX2期权错误:', error);
      throw error;
    }
  }

  /**
   * 获取店铺的FCX2期权余额
   */
  async getShopFcx2Balance(shopId: string): Promise<number> {
    try {
      // 1. 获取有效的期权总额（未兑换且未过期）
      const { data: activeOptions, error: optionsError } = await supabase
        .from('fcx2_options')
        .select('amount')
        .eq('repair_shop_id', shopId)
        .eq('status', Fcx2OptionStatus.ACTIVE)
        .gte('expires_at', new Date().toISOString());

      if (optionsError) {
        throw new Error(`查询期权记录失败: ${optionsError.message}`);
      }

      // 2. 计算总余额
      const totalBalance = activeOptions?.reduce((sum, option) => sum + option.amount, 0) || 0;

      return totalBalance;

    } catch (error) {
      console.error('获取FCX2余额错误:', error);
      throw error;
    }
  }

  /**
   * 兑换FCX2期权
   */
  async redeemOptions(shopId: string, amount: number): Promise<void> {
    try {
      // 1. 验证参数
      if (amount <= 0) {
        throw new Error('兑换金额必须大于0');
      }

      // 2. 检查可用余额
      const availableBalance = await this.getShopFcx2Balance(shopId);
      if (availableBalance < amount) {
        throw new Error(`FCX2余额不足，当前余额: ${availableBalance}, 需要: ${amount}`);
      }

      // 3. 获取可兑换的期权记录（按创建时间排序，优先兑换最早的）
      const { data: redeemableOptions, error: optionsError } = await supabase
        .from('fcx2_options')
        .select('id, amount')
        .eq('repair_shop_id', shopId)
        .eq('status', Fcx2OptionStatus.ACTIVE)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (optionsError) {
        throw new Error(`查询可兑换期权失败: ${optionsError.message}`);
      }

      if (!redeemableOptions || redeemableOptions.length === 0) {
        throw new Error('没有可兑换的期权');
      }

      // 4. 按顺序兑换期权直到满足金额要求
      let remainingAmount = amount;
      const optionsToRedeem: Array<{ id: string; amount: number }> = [];

      for (const option of redeemableOptions) {
        if (remainingAmount <= 0) break;

        const redeemAmount = Math.min(option.amount, remainingAmount);
        optionsToRedeem.push({
          id: option.id,
          amount: redeemAmount
        });

        remainingAmount -= redeemAmount;
      }

      // 5. 更新期权状态为已兑换
      for (const option of optionsToRedeem) {
        await supabase
          .from('fcx2_options')
          .update({
            status: Fcx2OptionStatus.REDEEMED,
            redeemed_at: new Date().toISOString()
          } as any)
          .eq('id', option.id);
      }

      // 6. 更新维修店的FCX2余额
      const { data: currentShop, error: currentError } = await supabase
        .from('repair_shops')
        .select('fcx2_balance')
        .eq('id', shopId)
        .single();

      if (currentError) {
        throw new Error(`查询当前余额失败: ${currentError.message}`);
      }

      const newBalance = Math.max(0, (currentShop?.fcx2_balance || 0) - amount);
      
      const { error: updateError } = await supabase
        .from('repair_shops')
        .update({ fcx2_balance: newBalance } as any)
        .eq('id', shopId);

      if (updateError) {
        throw new Error(`更新FCX2余额失败: ${updateError.message}`);
      }

    } catch (error) {
      console.error('兑换FCX2期权错误:', error);
      throw error;
    }
  }

  /**
   * 查询店铺期权记录
   */
  async listShopOptions(shopId: string): Promise<Fcx2Option[]> {
    try {
      const { data, error } = await supabase
        .from('fcx2_options')
        .select(`
          *,
          repair_orders!inner(order_number, fault_description, rating)
        `)
        .eq('repair_shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`查询期权记录失败: ${error.message}`);
      }

      return data.map(this.mapToFcx2Option);

    } catch (error) {
      console.error('查询店铺期权记录错误:', error);
      throw error;
    }
  }

  /**
   * 清理过期期权
   */
  async cleanupExpiredOptions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('fcx2_options')
        .update({ status: Fcx2OptionStatus.EXPIRED } as any)
        .lt('expires_at', new Date().toISOString())
        .eq('status', Fcx2OptionStatus.ACTIVE)
        .select();

      if (error) {
        throw new Error(`清理过期期权失败: ${error.message}`);
      }

      return (data as any)?.data?.length || 0;

    } catch (error) {
      console.error('清理过期期权错误:', error);
      throw error;
    }
  }

  /**
   * 映射数据库记录到FCX2期权对象
   */
  private mapToFcx2Option(data: any): Fcx2Option {
    return {
      id: data.id,
      repairShopId: data.repair_shop_id,
      amount: data.amount,
      earnedFromOrderId: data.earned_from_order_id,
      status: data.status as Fcx2OptionStatus,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at)
    };
  }
}