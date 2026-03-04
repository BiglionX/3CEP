/**
 * 联盟管理服务实现
 * 处理维修店加盟、质押、等级管理等功能
 */

import {
  ExtendedRepairShop,
  AllianceLevel,
  StakeFcxDTO,
} from '../models/fcx-account.model';
import { IAllianceService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';
import { FcxAccountService } from './fcx-account.service';
import { FcxTransactionService } from './fcx-transaction.service';
import { STAKING_CONSTANTS, LEVEL_THRESHOLDS } from '../utils/constants';

export class AllianceService implements IAllianceService {
  private accountService: FcxAccountService;
  private transactionService: FcxTransactionService;

  constructor() {
    this.accountService = new FcxAccountService();
    this.transactionService = new FcxTransactionService();
  }

  /**
   * 维修店加入联?   */
  async joinAlliance(
    shopId: string,
    stakingAmount: number
  ): Promise<ExtendedRepairShop> {
    try {
      // 1. 验证质押金额
      if (stakingAmount < STAKING_CONSTANTS.MIN_AMOUNT) {
        throw new Error(`质押金额不能小于${STAKING_CONSTANTS.MIN_AMOUNT} FCX`);
      }

      if (stakingAmount > STAKING_CONSTANTS.MAX_AMOUNT) {
        throw new Error(`质押金额不能大于${STAKING_CONSTANTS.MAX_AMOUNT} FCX`);
      }

      // 2. 获取店铺信息
      const shop = await this.getRepairShop(shopId);
      if (!shop) {
        throw new Error('店铺不存?);
      }

      if (shop.isAllianceMember) {
        throw new Error('该店铺已经是联盟成员');
      }

      // 3. 查找店铺关联的FCX账户
      let fcxAccount = await this.accountService.getAccountByUserId(
        shop.userId!
      );

      if (!fcxAccount) {
        // 如果没有账户，创建新的维修店账户
        fcxAccount = await this.accountService.createAccount({
          userId: shop.userId!,
          accountType: 'repair_shop',
          initialBalance: 0,
        });
      }

      // 4. 验证账户余额是否足够
      const accountBalance = await this.accountService.getBalance(
        fcxAccount.id
      );
      if (accountBalance.availableBalance < stakingAmount) {
        throw new Error('账户余额不足，无法完成质?);
      }

      // 5. 冻结质押资金
      await this.accountService.freeze(fcxAccount.id, stakingAmount);

      // 6. 创建质押交易记录
      const transaction = await this.transactionService.createTransaction({
        fromAccountId: fcxAccount.id,
        toAccountId: '', // 质押到系?        amount: stakingAmount,
        transactionType: 'stake' as any,
        referenceId: shopId,
        memo: `维修店加盟质?${stakingAmount} FCX`,
      });

      // 7. 更新店铺信息
      const joinDate = new Date();
      const initialLevel = this.determineAllianceLevel(0); // 初始为青铜级

      const { data, error } = await supabase
        .from('repair_shops')
        .update({
          fcx_staked: stakingAmount,
          fcx2_balance: 0,
          alliance_level: initialLevel,
          join_date: joinDate,
          is_alliance_member: true,
          updated_at: new Date(),
        } as any)
        .eq('id', shopId)
        .select()
        .single();

      if (error) {
        // 如果更新失败，需要回滚冻结操?        await this.accountService.unfreeze(fcxAccount.id, stakingAmount);
        throw new Error(`更新店铺信息失败: ${error.message}`);
      }

      // 8. 返回更新后的店铺信息
      return this.mapToExtendedRepairShop(data);
    } catch (error) {
      console.error('维修店加盟错?', error);
      throw error;
    }
  }

  /**
   * 维修店退出联?   */
  async leaveAlliance(shopId: string): Promise<ExtendedRepairShop> {
    try {
      // 1. 获取店铺信息
      const shop = await this.getRepairShop(shopId);
      if (!shop) {
        throw new Error('店铺不存?);
      }

      if (!shop.isAllianceMember) {
        throw new Error('该店铺不是联盟成?);
      }

      // 2. 查找店铺关联的FCX账户
      const fcxAccount = await this.accountService.getAccountByUserId(
        shop.userId!
      );
      if (!fcxAccount) {
        throw new Error('未找到关联的FCX账户');
      }

      // 3. 解冻质押资金
      if (shop.fcxStaked && shop.fcxStaked > 0) {
        await this.accountService.unfreeze(fcxAccount.id, shop.fcxStaked);

        // 4. 创建解除质押交易记录
        await this.transactionService.createTransaction({
          fromAccountId: '', // 系统释放
          toAccountId: fcxAccount.id,
          amount: shop.fcxStaked,
          transactionType: 'unstake' as any,
          referenceId: shopId,
          memo: `维修店退出联盟，解除质押 ${shop.fcxStaked} FCX`,
        });
      }

      // 5. 更新店铺信息
      const { data, error } = await supabase
        .from('repair_shops')
        .update({
          fcx_staked: 0,
          fcx2_balance: 0,
          alliance_level: 'bronze',
          join_date: null,
          is_alliance_member: false,
          updated_at: new Date(),
        } as any)
        .eq('id', shopId)
        .select()
        .single();

      if (error) {
        throw new Error(`更新店铺信息失败: ${error.message}`);
      }

      return this.mapToExtendedRepairShop(data);
    } catch (error) {
      console.error('维修店退出联盟错?', error);
      throw error;
    }
  }

  /**
   * 更新联盟等级
   */
  async updateAllianceLevel(shopId: string): Promise<AllianceLevel> {
    try {
      const shop = await this.getRepairShop(shopId);
      if (!shop) {
        throw new Error('店铺不存?);
      }

      if (!shop.isAllianceMember) {
        throw new Error('该店铺不是联盟成?);
      }

      const newLevel = this.determineAllianceLevel(shop.fcx2Balance || 0);

      // 只有等级提升时才更新
      if (newLevel !== shop.allianceLevel) {
        const { error } = await supabase
          .from('repair_shops')
          .update({
            alliance_level: newLevel,
            updated_at: new Date(),
          } as any)
          .eq('id', shopId);

        if (error) {
          throw new Error(`更新联盟等级失败: ${error.message}`);
        }
      }

      return newLevel;
    } catch (error) {
      console.error('更新联盟等级错误:', error);
      throw error;
    }
  }

  /**
   * 获取联盟成员列表
   */
  async listAllianceMembers(
    level?: AllianceLevel
  ): Promise<ExtendedRepairShop[]> {
    try {
      let query = supabase
        .from('repair_shops')
        .select('*')
        .eq('is_alliance_member', true);

      if (level) {
        query = query.eq('alliance_level', level);
      }

      query = query
        .order('fcx2_balance', { ascending: false })
        .order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询联盟成员失败: ${error.message}`);
      }

      return data.map(this.mapToExtendedRepairShop);
    } catch (error) {
      console.error('获取联盟成员列表错误:', error);
      throw error;
    }
  }

  /**
   * 获取联盟排行?   */
  async getRankings(limit: number = 50): Promise<
    Array<{
      shopId: string;
      shopName: string;
      allianceLevel: AllianceLevel;
      fcx2Balance: number;
      rating: number;
      completedOrders: number;
      rank: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('repair_shops')
        .select(
          `
          id,
          name,
          alliance_level,
          fcx2_balance,
          rating,
          service_count
        `
        )
        .eq('is_alliance_member', true)
        .order('fcx2_balance', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`查询排行榜失? ${error.message}`);
      }

      return data.map((shop, index) => ({
        shopId: shop.id,
        shopName: shop.name,
        allianceLevel: shop.alliance_level as AllianceLevel,
        fcx2Balance: shop.fcx2_balance || 0,
        rating: shop.rating || 0,
        completedOrders: shop.service_count || 0,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('获取排行榜错?', error);
      throw error;
    }
  }

  /**
   * 验证店铺联盟资格
   */
  async validateAllianceQualification(shopId: string): Promise<boolean> {
    try {
      // 直接查询数据库获取原始数?      const { data, error } = await supabase
        .from('repair_shops')
        .select('name, contact_person, phone, address, status, is_verified')
        .eq('id', shopId)
        .single();

      if (error || !data) {
        return false;
      }

      // 检查基本条?      const hasValidInfo =
        data.name && data.contact_person && data.phone && data.address;
      const isActive = data.status === 'active';
      const isVerified = Boolean(data.is_verified);

      return hasValidInfo && isActive && isVerified;
    } catch (error) {
      console.error('验证联盟资格错误:', error);
      return false;
    }
  }

  /**
   * 内部方法：获取维修店信息
   */
  private async getRepairShop(
    shopId: string
  ): Promise<ExtendedRepairShop | null> {
    try {
      const { data, error } = await supabase
        .from('repair_shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`查询店铺信息失败: ${error.message}`);
      }

      return this.mapToExtendedRepairShop(data);
    } catch (error) {
      console.error('获取维修店信息错?', error);
      throw error;
    }
  }

  /**
   * 根据FCX2余额确定联盟等级
   */
  private determineAllianceLevel(fcx2Balance: number): AllianceLevel {
    if (fcx2Balance >= LEVEL_THRESHOLDS.DIAMOND) {
      return AllianceLevel.DIAMOND;
    } else if (fcx2Balance >= LEVEL_THRESHOLDS.GOLD) {
      return AllianceLevel.GOLD;
    } else if (fcx2Balance >= LEVEL_THRESHOLDS.SILVER) {
      return AllianceLevel.SILVER;
    } else {
      return AllianceLevel.BRONZE;
    }
  }

  /**
   * 映射数据库记录到扩展维修店对?   */
  private mapToExtendedRepairShop(data: any): ExtendedRepairShop {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      contactPerson: data.contact_person,
      phone: data.phone,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postal_code,
      latitude: data.latitude,
      longitude: data.longitude,
      logoUrl: data.logo_url,
      coverImageUrl: data.cover_image_url,
      businessLicense: data.business_license,
      services: data.services ? JSON.parse(data.services) : null,
      specialties: data.specialties ? JSON.parse(data.specialties) : null,
      rating: data.rating,
      reviewCount: data.review_count,
      serviceCount: data.service_count,
      certificationLevel: data.certification_level,
      isVerified: data.is_verified,
      status: data.status,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      updatedAt: data.updated_at ? new Date(data.updated_at) : null,
      fcxStaked: data.fcx_staked,
      fcx2Balance: data.fcx2_balance,
      allianceLevel: data.alliance_level,
      joinDate: data.join_date ? new Date(data.join_date) : null,
      isAllianceMember: data.is_alliance_member,
      userId: data.user_id,
    };
  }
}
