/**
 * 用户画像服务
 * 负责构建、维护和更新用户画像，支持个性化推荐
 */

import { createClient } from "@supabase/supabase-js";
import { UserBehavior, UserProfile } from "../models/recommendation.model";
import { UserProfileService } from "./recommendation.interfaces";
import { UserBehaviorCollectorService } from "./user-behavior-collector.service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class UserProfileServiceImpl implements UserProfileService {
  private behaviorCollector: UserBehaviorCollectorService;

  constructor() {
    this.behaviorCollector = new UserBehaviorCollectorService();
  }

  /**
   * 构建或更新用户画像
   */
  async buildUserProfile(userId: string): Promise<UserProfile> {
    try {
      console.log(`🤖 开始构建用户画像: ${userId}`);

      // 1. 获取用户基本信息
      const basicInfo = await this.getUserBasicInfo(userId);

      // 2. 获取用户行为数据
      const behaviors = await this.behaviorCollector.getUserBehaviors(
        userId,
        500
      );

      // 3. 分析用户偏好
      const preferences = this.analyzeUserPreferences(behaviors);

      // 4. 计算行为摘要
      const behaviorSummary = this.calculateBehaviorSummary(behaviors);

      // 5. 确定用户参与度等级
      const engagementLevel = this.determineEngagementLevel(behaviorSummary);

      // 6. 构建完整用户画像
      const userProfile: UserProfile = {
        userId,
        demographics: basicInfo.demographics,
        preferences,
        behaviorSummary,
        engagementLevel,
        lastUpdated: new Date().toISOString(),
      };

      // 7. 保存到数据库
      await this.saveUserProfile(userProfile);

      console.log(`✅ 用户画像构建完成: ${userId}`);
      return userProfile;
    } catch (error) {
      console.error(`构建用户画像失败 (${userId}):`, error);
      throw error;
    }
  }

  /**
   * 获取用户画像
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // 记录不存在，返回null
          return null;
        }
        throw new Error(`获取用户画像失败: ${error.message}`);
      }

      return {
        userId: data.user_id,
        demographics: data.demographics
          ? JSON.parse(data.demographics)
          : undefined,
        preferences: {
          categories: data.preferences?.categories || [],
          brands: data.preferences?.brands || [],
          priceRange: data.preferences?.price_range,
          serviceTypes: data.preferences?.service_types || [],
        },
        behaviorSummary: {
          totalActions: data.behavior_summary?.total_actions || 0,
          recentActivityDays: data.behavior_summary?.recent_activity_days || 0,
          favoriteCategories: data.behavior_summary?.favorite_categories || [],
          avgSessionDuration: data.behavior_summary?.avg_session_duration,
        },
        engagementLevel: data.engagement_level,
        lastUpdated: data.last_updated,
      };
    } catch (error) {
      console.error("获取用户画像错误:", error);
      throw error;
    }
  }

  /**
   * 更新用户偏好
   */
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          preferences: {
            categories: preferences.categories || [],
            brands: preferences.brands || [],
            price_range: preferences.priceRange,
            service_types: preferences.serviceTypes || [],
          } as any,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        throw new Error(`更新用户偏好失败: ${error.message}`);
      }

      console.log(`✅ 用户偏好更新成功: ${userId}`);
    } catch (error) {
      console.error("更新用户偏好错误:", error);
      throw error;
    }
  }

  /**
   * 计算用户相似度（基于余弦相似度）
   */
  async calculateUserSimilarity(
    userId1: string,
    userId2: string
  ): Promise<number> {
    try {
      // 获取两个用户的画像
      const profile1 = await this.getUserProfile(userId1);
      const profile2 = await this.getUserProfile(userId2);

      if (!profile1 || !profile2) {
        return 0;
      }

      // 计算偏好向量相似度
      const categorySimilarity = this.calculateVectorSimilarity(
        profile1.preferences.categories,
        profile2.preferences.categories
      );

      const brandSimilarity = this.calculateVectorSimilarity(
        profile1.preferences.brands,
        profile2.preferences.brands
      );

      // 行为模式相似度
      const behaviorSimilarity = this.calculateBehaviorSimilarity(
        profile1.behaviorSummary,
        profile2.behaviorSummary
      );

      // 加权平均相似度
      const similarity =
        categorySimilarity * 0.4 +
        brandSimilarity * 0.3 +
        behaviorSimilarity * 0.3;

      return Math.max(0, Math.min(1, similarity)); // 限制在0-1之间
    } catch (error) {
      console.error("计算用户相似度错误:", error);
      return 0;
    }
  }

  /**
   * 获取活跃用户列表
   */
  async getActiveUsers(days: number = 30): Promise<string[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from("user_behaviors")
        .select("user_id")
        .gte("timestamp", cutoffDate.toISOString())
        .order("timestamp", { ascending: false });

      if (error) {
        throw new Error(`获取活跃用户失败: ${error.message}`);
      }

      // 去重并返回用户ID列表
      const userIds = [...new Set((data || []).map((item) => item.user_id))];
      return userIds;
    } catch (error) {
      console.error("获取活跃用户错误:", error);
      throw error;
    }
  }

  /**
   * 获取用户基本信息
   */
  private async getUserBasicInfo(userId: string): Promise<any> {
    try {
      // 从用户档案表获取基本信息
      const { data: profileData } = await supabase
        .from("profiles")
        .select("city, province, country")
        .eq("id", userId)
        .single();

      // 从维修订单获取设备类型信息
      const { data: orderData } = await supabase
        .from("repair_orders")
        .select("device_type")
        .eq("consumer_id", userId)
        .limit(10);

      const deviceTypes = orderData
        ? [
            ...new Set(
              orderData.map((order) => order.device_type).filter(Boolean)
            ),
          ]
        : [];

      return {
        demographics: profileData
          ? {
              location: {
                city: profileData.city,
                province: profileData.province,
                country: profileData.country,
              },
              deviceTypes,
            }
          : undefined,
      };
    } catch (error) {
      console.warn("获取用户基本信息警告:", error);
      return { demographics: undefined };
    }
  }

  /**
   * 分析用户偏好
   */
  private analyzeUserPreferences(behaviors: UserBehavior[]): any {
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};
    let totalPrice = 0;
    let purchaseCount = 0;
    const serviceTypes = new Set<string>();

    behaviors.forEach((behavior) => {
      // 从itemId中提取类别和品牌信息（简化处理）
      const itemInfo = this.parseItemId(behavior.itemId);

      if (itemInfo.category) {
        categoryCount[itemInfo.category] =
          (categoryCount[itemInfo.category] || 0) + behavior.score;
      }

      if (itemInfo.brand) {
        brandCount[itemInfo.brand] =
          (brandCount[itemInfo.brand] || 0) + behavior.score;
      }

      // 统计购买相关信息
      if (behavior.actionType === "purchase") {
        totalPrice += behavior.metadata?.amount || 0;
        purchaseCount++;
      }

      // 收集服务类型
      if (behavior.metadata?.serviceType) {
        serviceTypes.add(behavior.metadata.serviceType);
      }
    });

    // 获取最偏好的类别和品牌
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category]) => category);

    const topBrands = Object.entries(brandCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([brand]) => brand);

    // 计算价格区间偏好
    const avgPurchasePrice = purchaseCount > 0 ? totalPrice / purchaseCount : 0;
    const priceRange: [number, number] = [
      Math.max(0, avgPurchasePrice * 0.7),
      avgPurchasePrice * 1.3,
    ];

    return {
      categories: topCategories,
      brands: topBrands,
      priceRange: priceRange,
      serviceTypes: Array.from(serviceTypes),
    };
  }

  /**
   * 计算行为摘要
   */
  private calculateBehaviorSummary(behaviors: UserBehavior[]): any {
    if (behaviors.length === 0) {
      return {
        totalActions: 0,
        recentActivityDays: 0,
        favoriteCategories: [],
        avgSessionDuration: 0,
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 计算最近活跃天数
    const activeDates = new Set(
      behaviors
        .filter((b) => new Date(b.timestamp) > thirtyDaysAgo)
        .map((b) => new Date(b.timestamp).toISOString().split("T")[0])
    );

    // 统计各类别行为
    const categoryActions: Record<string, number> = {};
    behaviors.forEach((behavior) => {
      const itemInfo = this.parseItemId(behavior.itemId);
      if (itemInfo.category) {
        categoryActions[itemInfo.category] =
          (categoryActions[itemInfo.category] || 0) + 1;
      }
    });

    const favoriteCategories = Object.entries(categoryActions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return {
      totalActions: behaviors.length,
      recentActivityDays: activeDates.size,
      favoriteCategories,
      avgSessionDuration: this.estimateAvgSessionDuration(behaviors),
    };
  }

  /**
   * 确定用户参与度等级
   */
  private determineEngagementLevel(
    behaviorSummary: any
  ): "low" | "medium" | "high" {
    const { totalActions, recentActivityDays } = behaviorSummary;

    // 高参与度：最近30天活跃超过15天且总行为超过50次
    if (recentActivityDays > 15 && totalActions > 50) {
      return "high";
    }

    // 中等参与度：最近30天活跃超过5天或总行为超过20次
    if (recentActivityDays > 5 || totalActions > 20) {
      return "medium";
    }

    // 低参与度
    return "low";
  }

  /**
   * 保存用户画像到数据库
   */
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: profile.userId,
        demographics: profile.demographics
          ? JSON.stringify(profile.demographics)
          : null,
        preferences: {
          categories: profile.preferences.categories,
          brands: profile.preferences.brands,
          price_range: profile.preferences.priceRange,
          service_types: profile.preferences.serviceTypes,
        },
        behavior_summary: {
          total_actions: profile.behaviorSummary.totalActions,
          recent_activity_days: profile.behaviorSummary.recentActivityDays,
          favorite_categories: profile.behaviorSummary.favoriteCategories,
          avg_session_duration: profile.behaviorSummary.avgSessionDuration,
        },
        engagement_level: profile.engagementLevel,
        last_updated: profile.lastUpdated,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      throw new Error(`保存用户画像失败: ${error.message}`);
    }
  }

  /**
   * 计算向量相似度（余弦相似度）
   */
  private calculateVectorSimilarity(vec1: string[], vec2: string[]): number {
    if (vec1.length === 0 || vec2.length === 0) return 0;

    // 创建词汇表
    const vocabulary = [...new Set([...vec1, ...vec2])];

    // 创建向量表示
    const vector1 = vocabulary.map((word) => (vec1.includes(word) ? 1 : 0));
    const vector2 = vocabulary.map((word) => (vec2.includes(word) ? 1 : 0));

    // 计算余弦相似度
    const dotProduct = vector1.reduce(
      (sum, val, i) => sum + val * vector2[i],
      0 as number
    );
    const magnitude1 = Math.sqrt(
      vector1.reduce((sum, val) => sum + val * val, 0 as number)
    );
    const magnitude2 = Math.sqrt(
      vector2.reduce((sum, val) => sum + val * val, 0 as number)
    );

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 计算行为相似度
   */
  private calculateBehaviorSimilarity(summary1: any, summary2: any): number {
    // 基于行为总数的相似度
    const actionsDiff = Math.abs(summary1.totalActions - summary2.totalActions);
    const maxActions = Math.max(summary1.totalActions, summary2.totalActions);
    const actionsSimilarity = maxActions > 0 ? 1 - actionsDiff / maxActions : 0;

    // 基于活跃天数的相似度
    const daysDiff = Math.abs(
      summary1.recentActivityDays - summary2.recentActivityDays
    );
    const maxDays = Math.max(
      summary1.recentActivityDays,
      summary2.recentActivityDays
    );
    const daysSimilarity = maxDays > 0 ? 1 - daysDiff / maxDays : 0;

    return (actionsSimilarity + daysSimilarity) / 2;
  }

  /**
   * 从itemId解析类别和品牌信息
   */
  private parseItemId(itemId: string): { category?: string; brand?: string } {
    // 简化的解析逻辑，实际应用中可能需要更复杂的规则
    const lowerId = itemId.toLowerCase();

    // 品牌识别
    const brands = ["apple", "huawei", "xiaomi", "samsung", "oppo", "vivo"];
    const brand = brands.find((b) => lowerId.includes(b));

    // 类别识别
    const categories = ["phone", "tablet", "laptop", "watch", "accessory"];
    const category = categories.find((c) => lowerId.includes(c));

    return { category, brand };
  }

  /**
   * 估算平均会话时长
   */
  private estimateAvgSessionDuration(behaviors: UserBehavior[]): number {
    if (behaviors.length < 2) return 0;

    // 简化估算：假设相邻行为间隔代表会话时长的一部分
    let totalTime = 0;
    for (let i = 1; i < behaviors.length; i++) {
      const timeDiff =
        new Date(behaviors[i].timestamp).getTime() -
        new Date(behaviors[i - 1].timestamp).getTime();
      // 只考虑合理的时间间隔（小于1小时）
      if (timeDiff > 0 && timeDiff < 3600000) {
        totalTime += timeDiff;
      }
    }

    return behaviors.length > 1 ? totalTime / (behaviors.length - 1) / 1000 : 0; // 转换为秒
  }
}
