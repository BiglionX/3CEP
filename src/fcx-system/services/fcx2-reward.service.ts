/**
 * FCX2奖励计算服务实现
 * 处理基于工单完成的奖励计算和发放逻辑
 */

import { 
  RepairOrder,
  Fcx2RewardResult,
  AllianceLevel,
  OrderStatus
} from '../models/fcx-account.model';
import { IFcx2RewardService } from './interfaces';
import { REWARD_CONSTANTS, LEVEL_THRESHOLDS } from '../utils/constants';
import { Fcx2OptionService } from './fcx2-option.service';

export class Fcx2RewardService implements IFcx2RewardService {
  
  private optionService: Fcx2OptionService;

  constructor() {
    this.optionService = new Fcx2OptionService();
  }

  /**
   * 计算工单完成奖励
   */
  async calculateOrderReward(order: RepairOrder, rating: number): Promise<Fcx2RewardResult> {
    try {
      // 1. 验证奖励发放条件
      const isValid = await this.validateRewardConditions(order, rating);
      if (!isValid) {
        throw new Error('不满足奖励发放条件');
      }

      // 2. 获取维修店当前等级
      const shopLevel = await this.getShopLevel(order.repairShopId!);
      if (!shopLevel) {
        throw new Error('无法获取维修店等级信息');
      }

      // 3. 计算基础奖励（锁定金额的百分比）
      const baseReward = (order.fcxAmountLocked || 0) * REWARD_CONSTANTS.BASE_PERCENTAGE;

      // 4. 计算评分倍数
      const ratingMultiplier = this.getRatingMultiplier(rating);

      // 5. 计算等级加成
      const levelBonus = await this.calculateLevelBonus(shopLevel, baseReward);

      // 6. 计算最终奖励
      const totalReward = baseReward * ratingMultiplier;
      const finalAmount = totalReward * levelBonus;

      return {
        baseReward,
        ratingMultiplier,
        totalReward,
        levelBonus,
        finalAmount
      };

    } catch (error) {
      console.error('计算奖励错误:', error);
      throw error;
    }
  }

  /**
   * 计算等级加成
   */
  async calculateLevelBonus(currentLevel: AllianceLevel, baseAmount: number): Promise<number> {
    try {
      // 将枚举值转换为常量键名
      const levelKey = currentLevel.toUpperCase() as keyof typeof REWARD_CONSTANTS.LEVEL_BONUS;
      const bonusMultiplier = REWARD_CONSTANTS.LEVEL_BONUS[levelKey] || 1.0;
      return bonusMultiplier;
    } catch (error) {
      console.error('计算等级加成错误:', error);
      return 1.0; // 默认无加成
    }
  }

  /**
   * 获取评分倍数
   */
  getRatingMultiplier(rating: number): number {
    // 评分低于最低要求，无奖励
    if (rating < REWARD_CONSTANTS.MIN_RATING_FOR_REWARD) {
      return 0;
    }

    // 线性计算倍数：3.0分=1.0倍，5.0分=最大倍数
    const minRating = REWARD_CONSTANTS.MIN_RATING_FOR_REWARD;
    const maxRating = 5.0;
    const maxMultiplier = REWARD_CONSTANTS.MAX_RATING_MULTIPLIER;
    const minMultiplier = 1.0;

    // 线性插值计算
    const ratio = (rating - minRating) / (maxRating - minRating);
    const multiplier = minMultiplier + ratio * (maxMultiplier - minMultiplier);

    // 限制在合理范围内
    return Math.max(minMultiplier, Math.min(maxMultiplier, multiplier));
  }

  /**
   * 验证奖励发放条件
   */
  async validateRewardConditions(order: RepairOrder, rating: number): Promise<boolean> {
    try {
      // 1. 工单必须已完成
      if (order.status !== OrderStatus.COMPLETED) {
        return false;
      }

      // 2. 必须有评分
      if (rating === null || rating === undefined) {
        return false;
      }

      // 3. 评分不能为负数
      if (rating < 0) {
        return false;
      }

      // 4. 必须有锁定金额
      if (!order.fcxAmountLocked || order.fcxAmountLocked <= 0) {
        return false;
      }

      // 5. 维修店必须存在且为联盟成员
      const shopLevel = await this.getShopLevel(order.repairShopId!);
      if (shopLevel === null) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('验证奖励条件错误:', error);
      return false;
    }
  }

  /**
   * 发放工单奖励
   */
  async grantOrderReward(order: RepairOrder, rating: number): Promise<Fcx2RewardResult> {
    try {
      // 1. 计算奖励
      const rewardResult = await this.calculateOrderReward(order, rating);

      // 2. 如果奖励金额为0，不发放
      if (rewardResult.finalAmount <= 0) {
        throw new Error('奖励金额为0，不符合发放条件');
      }

      // 3. 发放期权奖励
      await this.optionService.grantOption(
        order.repairShopId!,
        rewardResult.finalAmount,
        order.id
      );

      return rewardResult;

    } catch (error) {
      console.error('发放工单奖励错误:', error);
      throw error;
    }
  }

  /**
   * 获取维修店等级
   */
  private async getShopLevel(shopId: string): Promise<AllianceLevel | null> {
    try {
      const response = await fetch(`/api/fcx/alliance/members/${shopId}`);
      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data.allianceLevel as AllianceLevel;
      }

      return null;

    } catch (error) {
      console.error('获取维修店等级错误:', error);
      return null;
    }
  }

  /**
   * 批量处理奖励发放
   */
  async processBatchRewards(orders: Array<{ order: RepairOrder; rating: number }>): Promise<Array<{
    order: RepairOrder;
    rating: number;
    reward?: Fcx2RewardResult;
    error?: string;
  }>> {
    const results: Array<{
      order: RepairOrder;
      rating: number;
      reward?: Fcx2RewardResult;
      error?: string;
    }> = [];

    for (const { order, rating } of orders) {
      try {
        const reward = await this.grantOrderReward(order, rating);
        results.push({
          order,
          rating,
          reward,
          error: undefined
        });
      } catch (error) {
        results.push({
          order,
          rating,
          reward: undefined,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  /**
   * 获取奖励统计信息
   */
  async getRewardStatistics(shopId: string, days: number = 30): Promise<{
    totalRewards: number;
    totalAmount: number;
    averageRating: number;
    completedOrders: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 这里应该查询数据库获取统计数据
      // 暂时返回模拟数据
      return {
        totalRewards: 0,
        totalAmount: 0,
        averageRating: 0,
        completedOrders: 0
      };

    } catch (error) {
      console.error('获取奖励统计错误:', error);
      throw error;
    }
  }
}