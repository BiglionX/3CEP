/**
 * 用户行为数据收集服务
 * 负责收集、存储和管理用户在FCX生态系统中的各种行为数据
 */

import { createClient } from "@supabase/supabase-js";
import {
  RecommendationItemType,
  UserActionType,
  UserBehavior,
} from "../models/recommendation.model";
import { generateUUID } from "../utils/helpers";
import { UserBehaviorCollector } from "./recommendation.interfaces";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class UserBehaviorCollectorService implements UserBehaviorCollector {
  private readonly BEHAVIOR_SCORE_MAP = {
    [UserActionType.VIEW]: 1.0,
    [UserActionType.SEARCH]: 1.2,
    [UserActionType.BOOKMARK]: 1.5,
    [UserActionType.COMPARE]: 1.3,
    [UserActionType.SHARE]: 1.8,
    [UserActionType.COMMENT]: 1.6,
    [UserActionType.PURCHASE]: 2.5,
    [UserActionType.REPAIR]: 2.0,
  };

  private readonly DECAY_FACTOR = 0.95; // 时间衰减因子
  private readonly BATCH_SIZE = 100; // 批量处理大小

  /**
   * 记录单个用户行为
   */
  async recordBehavior(behavior: UserBehavior): Promise<void> {
    try {
      // 验证必填字段
      if (!behavior.userId || !behavior.itemId || !behavior.actionType) {
        throw new Error("缺少必要的行为数据字段");
      }

      // 自动补充字段
      const behaviorWithDefaults: UserBehavior = {
        id: behavior.id || generateUUID(),
        userId: behavior.userId,
        itemId: behavior.itemId,
        itemType: behavior.itemType || RecommendationItemType.REPAIR_SHOP,
        actionType: behavior.actionType,
        timestamp: behavior.timestamp || new Date().toISOString(),
        score:
          behavior.score || this.calculateBehaviorScore(behavior.actionType),
        context: behavior.context,
        metadata: behavior.metadata,
      };

      // 保存到数据库
      const { error } = await supabase.from("user_behaviors").insert({
        id: behaviorWithDefaults.id,
        user_id: behaviorWithDefaults.userId,
        item_id: behaviorWithDefaults.itemId,
        item_type: behaviorWithDefaults.itemType,
        action_type: behaviorWithDefaults.actionType,
        timestamp: behaviorWithDefaults.timestamp,
        score: behaviorWithDefaults.score,
        context: behaviorWithDefaults.context
          ? JSON.stringify(behaviorWithDefaults.context)
          : null,
        metadata: behaviorWithDefaults.metadata
          ? JSON.stringify(behaviorWithDefaults.metadata)
          : null,
      } as any);

      if (error) {
        console.error("保存用户行为失败:", error);
        throw new Error(`保存用户行为失败: ${error.message}`);
      }

      console.log(
        `✅ 用户行为记录成功: ${behaviorWithDefaults.userId} -> ${behaviorWithDefaults.actionType} -> ${behaviorWithDefaults.itemId}`
      );
    } catch (error) {
      console.error("记录用户行为错误:", error);
      throw error;
    }
  }

  /**
   * 批量记录用户行为
   */
  async recordBehaviors(behaviors: UserBehavior[]): Promise<void> {
    if (!behaviors.length) return;

    try {
      // 分批处理大量数据
      for (let i = 0; i < behaviors.length; i += this.BATCH_SIZE) {
        const batch = behaviors.slice(i, i + this.BATCH_SIZE);
        const batchData = batch.map((behavior) => ({
          id: behavior.id || generateUUID(),
          user_id: behavior.userId,
          item_id: behavior.itemId,
          item_type: behavior.itemType || RecommendationItemType.REPAIR_SHOP,
          action_type: behavior.actionType,
          timestamp: behavior.timestamp || new Date().toISOString(),
          score:
            behavior.score || this.calculateBehaviorScore(behavior.actionType),
          context: behavior.context ? JSON.stringify(behavior.context) : null,
          metadata: behavior.metadata
            ? JSON.stringify(behavior.metadata)
            : null,
        }));

        const { error } = await supabase
          .from("user_behaviors")
          .insert(batchData);

        if (error) {
          console.error(
            `批量保存用户行为失败 (批次 ${
              Math.floor(i / this.BATCH_SIZE) + 1
            }):`,
            error
          );
          throw new Error(`批量保存用户行为失败: ${error.message}`);
        }
      }

      console.log(`✅ 批量用户行为记录成功 (${behaviors.length} 条)`);
    } catch (error) {
      console.error("批量记录用户行为错误:", error);
      throw error;
    }
  }

  /**
   * 获取用户历史行为
   */
  async getUserBehaviors(
    userId: string,
    limit: number = 100
  ): Promise<UserBehavior[]> {
    try {
      const { data, error } = await supabase
        .from("user_behaviors")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("获取用户行为失败:", error);
        throw new Error(`获取用户行为失败: ${error.message}`);
      }

      return (data || []).map((record) => ({
        id: record.id,
        userId: record.user_id,
        itemId: record.item_id,
        itemType: record.item_type,
        actionType: record.action_type,
        timestamp: record.timestamp,
        score: record.score,
        context: record.context ? JSON.parse(record.context) : undefined,
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      }));
    } catch (error) {
      console.error("获取用户行为错误:", error);
      throw error;
    }
  }

  /**
   * 获取特定时间范围内的用户行为
   */
  async getUserBehaviorsByTimeRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<UserBehavior[]> {
    try {
      let query = supabase
        .from("user_behaviors")
        .select("*")
        .eq("user_id", userId)
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())
        .order("timestamp", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`获取时间范围内用户行为失败: ${error.message}`);
      }

      return (data || []).map((record) => ({
        id: record.id,
        userId: record.user_id,
        itemId: record.item_id,
        itemType: record.item_type,
        actionType: record.action_type,
        timestamp: record.timestamp,
        score: record.score,
        context: record.context ? JSON.parse(record.context) : undefined,
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      }));
    } catch (error) {
      console.error("获取时间范围内用户行为错误:", error);
      throw error;
    }
  }

  /**
   * 清理过期行为数据
   */
  async cleanupOldBehaviors(days: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from("user_behaviors")
        .delete()
        .lt("timestamp", cutoffDate.toISOString())
        .select();

      if (error) {
        throw new Error(`清理过期行为数据失败: ${error.message}`);
      }

      const deletedCount = (data as any)?.data?.length || 0;
      console.log(`✅ 清理过期行为数据完成: 删除 ${deletedCount} 条记录`);

      return deletedCount;
    } catch (error) {
      console.error("清理过期行为数据错误:", error);
      throw error;
    }
  }

  /**
   * 获取用户行为统计
   */
  async getUserBehaviorStats(userId: string): Promise<{
    totalActions: number;
    actionDistribution: Record<string, number>;
    recentActivityDays: number;
    favoriteCategories: string[];
  }> {
    try {
      // 获取用户所有行为
      const behaviors = await this.getUserBehaviors(userId, 1000);

      if (behaviors.length === 0) {
        return {
          totalActions: 0,
          actionDistribution: {},
          recentActivityDays: 0,
          favoriteCategories: [],
        };
      }

      // 计算统计信息
      const actionDistribution: Record<string, number> = {};
      const categoryCount: Record<string, number> = {};
      const today = new Date();
      const recentCutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30天内

      let recentActivityDays = 0;
      const activeDates = new Set<string>();

      behaviors.forEach((behavior) => {
        // 动作分布统计
        actionDistribution[behavior.actionType] =
          (actionDistribution[behavior.actionType] || 0) + 1;

        // 活跃天数统计
        const behaviorDate = new Date(behavior.timestamp)
          .toISOString()
          .split("T")[0];
        activeDates.add(behaviorDate);

        if (new Date(behavior.timestamp) > recentCutoff) {
          recentActivityDays++;
        }
      });

      // 计算最喜欢的类别（需要从物品信息中获取）
      // 这里简化处理，实际应该关联物品表获取类别信息
      const favoriteCategories = Object.keys(categoryCount)
        .sort((a, b) => categoryCount[b] - categoryCount[a])
        .slice(0, 5);

      return {
        totalActions: behaviors.length,
        actionDistribution,
        recentActivityDays: activeDates.size,
        favoriteCategories,
      };
    } catch (error) {
      console.error("获取用户行为统计错误:", error);
      throw error;
    }
  }

  /**
   * 根据行为类型计算分数
   */
  private calculateBehaviorScore(actionType: UserActionType): number {
    const baseScore = this.BEHAVIOR_SCORE_MAP[actionType] || 1.0;

    // 可以根据业务需求添加更多复杂的评分逻辑
    // 例如：时间衰减、频率奖励等

    return baseScore;
  }

  /**
   * 记录页面浏览行为
   */
  async recordPageView(
    userId: string,
    itemId: string,
    itemType: RecommendationItemType,
    context?: any
  ): Promise<void> {
    await this.recordBehavior({
      id: generateUUID(),
      userId,
      itemId,
      itemType,
      actionType: UserActionType.VIEW,
      timestamp: new Date().toISOString(),
      score: this.calculateBehaviorScore(UserActionType.VIEW),
      context,
    });
  }

  /**
   * 记录搜索行为
   */
  async recordSearch(
    userId: string,
    searchQuery: string,
    resultsCount: number,
    context?: any
  ): Promise<void> {
    await this.recordBehavior({
      id: generateUUID(),
      userId,
      itemId: `search_${searchQuery}`,
      itemType: RecommendationItemType.DEVICE, // 搜索通常针对设备
      actionType: UserActionType.SEARCH,
      timestamp: new Date().toISOString(),
      score: this.calculateBehaviorScore(UserActionType.SEARCH),
      context: {
        ...context,
        searchQuery,
        resultsCount,
      },
      metadata: {
        query: searchQuery,
        resultCount: resultsCount,
      },
    });
  }

  /**
   * 记录购买行为
   */
  async recordPurchase(
    userId: string,
    itemId: string,
    itemType: RecommendationItemType,
    amount: number,
    context?: any
  ): Promise<void> {
    await this.recordBehavior({
      id: generateUUID(),
      userId,
      itemId,
      itemType,
      actionType: UserActionType.PURCHASE,
      timestamp: new Date().toISOString(),
      score: 2.5 + Math.log10(amount + 1), // 金额越高分数越高
      context,
      metadata: {
        amount,
      },
    });
  }

  /**
   * 记录维修行为
   */
  async recordRepair(
    userId: string,
    shopId: string,
    deviceId: string,
    serviceType: string,
    context?: any
  ): Promise<void> {
    await this.recordBehavior({
      id: generateUUID(),
      userId,
      itemId: shopId,
      itemType: RecommendationItemType.REPAIR_SHOP,
      actionType: UserActionType.REPAIR,
      timestamp: new Date().toISOString(),
      score: this.calculateBehaviorScore(UserActionType.REPAIR),
      context: {
        ...context,
        deviceId,
        serviceType,
      },
      metadata: {
        deviceId,
        serviceType,
      },
    });
  }
}
