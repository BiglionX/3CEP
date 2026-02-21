/**
 * 协同过滤推荐算法服务
 * 实现基于用户行为的协同过滤推荐
 */

import {
  CollaborativeFilterConfig,
  RecommendationContext,
  RecommendationItem,
  RecommendationItemType,
  UserBehavior,
} from "../models/recommendation.model";
import { ItemProfileServiceImpl } from "./item-profile.service";
import { Recommender } from "./recommendation.interfaces";
import { UserBehaviorCollectorService } from "./user-behavior-collector.service";
import { UserProfileServiceImpl } from "./user-profile.service";

export class CollaborativeFilterRecommender implements Recommender {
  private userProfiles: Map<string, any> = new Map();
  private userSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private itemSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private userBehaviorCollector: UserBehaviorCollectorService;
  private userProfileService: UserProfileServiceImpl;
  private itemProfileService: ItemProfileServiceImpl;
  private config: CollaborativeFilterConfig;
  private isTrained: boolean = false;

  constructor(config?: Partial<CollaborativeFilterConfig>) {
    this.config = {
      similarityThreshold: 0.3,
      minCommonItems: 3,
      neighborhoodSize: 20,
      decayFactor: 0.95,
      ...config,
    };

    this.userBehaviorCollector = new UserBehaviorCollectorService();
    this.userProfileService = new UserProfileServiceImpl();
    this.itemProfileService = new ItemProfileServiceImpl();
  }

  /**
   * 训练协同过滤模型
   */
  async train(userData: UserBehavior[]): Promise<void> {
    console.log("🤖 开始训练协同过滤模型...");

    try {
      // 1. 构建用户画像
      await this.buildUserProfiles(userData);

      // 2. 计算用户相似度矩阵
      await this.calculateUserSimilarities();

      // 3. 计算物品相似度矩阵
      await this.calculateItemSimilarities();

      this.isTrained = true;
      console.log("✅ 协同过滤模型训练完成");
    } catch (error) {
      console.error("协同过滤模型训练失败:", error);
      throw error;
    }
  }

  /**
   * 生成推荐
   */
  async recommend(
    context: RecommendationContext,
    count: number = 10
  ): Promise<RecommendationItem[]> {
    if (!this.isTrained) {
      console.warn("模型尚未训练，返回默认推荐");
      return this.getDefaultRecommendations(count);
    }

    try {
      const { userId, location, filters } = context;

      // 1. 基于用户相似度的推荐
      const userBasedRecs = await this.getUserBasedRecommendations(
        userId,
        count * 2
      );

      // 2. 基于物品相似度的推荐
      const itemBasedRecs = await this.getItemBasedRecommendations(
        userId,
        count * 2
      );

      // 3. 结合用户画像的个性化调整
      const personalizedRecs = await this.personalizeRecommendations(
        userId,
        [...userBasedRecs, ...itemBasedRecs],
        location,
        filters
      );

      // 4. 去重和排序
      const mergedRecs = this.mergeAndRankRecommendations(
        personalizedRecs,
        count
      );

      // 5. 添加推荐理由
      const finalRecs = this.addRecommendationReasons(mergedRecs, userId);

      return finalRecs;
    } catch (error) {
      console.error("生成协同过滤推荐失败:", error);
      return this.getDefaultRecommendations(count);
    }
  }

  /**
   * 获取算法类型
   */
  getType(): string {
    return "collaborative-filter";
  }

  /**
   * 更新配置
   */
  async updateConfig(
    config: Partial<CollaborativeFilterConfig>
  ): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log("✅ 协同过滤配置已更新");
  }

  /**
   * 构建用户画像
   */
  private async buildUserProfiles(userData: UserBehavior[]): Promise<void> {
    console.log("👤 构建用户画像...");

    // 按用户分组行为数据
    const userBehaviors = new Map<string, UserBehavior[]>();

    userData.forEach((behavior) => {
      if (!userBehaviors.has(behavior.userId)) {
        userBehaviors.set(behavior.userId, []);
      }
      userBehaviors.get(behavior.userId)?.push(behavior);
    });

    // 并行构建每个用户的画像
    const profilePromises = Array.from(userBehaviors.entries()).map(
      async ([userId, behaviors]) => {
        try {
          const profile = await this.userProfileService.buildUserProfile(
            userId
          );
          this.userProfiles.set(userId, {
            ...profile,
            behaviorHistory: behaviors,
          });
        } catch (error) {
          console.warn(`构建用户${userId}画像失败:`, error);
        }
      }
    );

    await Promise.all(profilePromises);
    console.log(`✅ 构建了 ${this.userProfiles.size} 个用户画像`);
  }

  /**
   * 计算用户相似度矩阵
   */
  private async calculateUserSimilarities(): Promise<void> {
    console.log("👥 计算用户相似度矩阵...");

    const userIds = Array.from(this.userProfiles.keys());
    const similarityMatrix = new Map<string, Map<string, number>>();

    // 计算所有用户对之间的相似度
    for (let i = 0; i < userIds.length; i++) {
      const userId1 = userIds[i];
      const similarities = new Map<string, number>();

      for (let j = i + 1; j < userIds.length; j++) {
        const userId2 = userIds[j];
        const similarity =
          await this.userProfileService.calculateUserSimilarity(
            userId1,
            userId2
          );

        if (similarity >= this.config.similarityThreshold) {
          similarities.set(userId2, similarity);
        }
      }

      similarityMatrix.set(userId1, similarities);
    }

    this.userSimilarityMatrix = similarityMatrix;
    console.log("✅ 用户相似度矩阵计算完成");
  }

  /**
   * 计算物品相似度矩阵
   */
  private async calculateItemSimilarities(): Promise<void> {
    console.log("📦 计算物品相似度矩阵...");

    // 收集所有物品ID
    const itemIds = new Set<string>();
    this.userProfiles.forEach((profile) => {
      profile.behaviorHistory.forEach((behavior: UserBehavior) => {
        itemIds.add(behavior.itemId);
      });
    });

    // 计算物品相似度
    const itemIdArray = Array.from(itemIds);
    const similarityMatrix = new Map<string, Map<string, number>>();

    for (let i = 0; i < itemIdArray.length; i++) {
      const itemId1 = itemIdArray[i];
      const similarities = new Map<string, number>();

      for (let j = i + 1; j < itemIdArray.length; j++) {
        const itemId2 = itemIdArray[j];
        const similarity =
          await this.itemProfileService.calculateItemSimilarity(
            itemId1,
            itemId2
          );

        if (similarity > 0) {
          // 只保存有相似度的物品对
          similarities.set(itemId2, similarity);
        }
      }

      similarityMatrix.set(itemId1, similarities);
    }

    this.itemSimilarityMatrix = similarityMatrix;
    console.log(`✅ 物品相似度矩阵计算完成 (${itemIds.size} 个物品)`);
  }

  /**
   * 基于用户的推荐
   */
  private async getUserBasedRecommendations(
    userId: string,
    count: number
  ): Promise<RecommendationItem[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return [];
    }

    // 找到相似用户
    const similarUsers = this.findSimilarUsers(userId);

    // 收集相似用户喜欢但目标用户未接触的物品
    const userItems = new Set(
      userProfile.behaviorHistory.map((b: UserBehavior) => b.itemId)
    );

    const candidateScores = new Map<
      string,
      { score: number; sources: number }
    >();

    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarProfile = this.userProfiles.get(similarUserId);
      if (similarProfile) {
        similarProfile.behaviorHistory.forEach((behavior: UserBehavior) => {
          if (!userItems.has(behavior.itemId)) {
            const timeDecay = this.calculateTimeDecay(behavior.timestamp);
            const adjustedScore = behavior.score * similarity * timeDecay;

            const current = candidateScores.get(behavior.itemId) || {
              score: 0,
              sources: 0,
            };
            candidateScores.set(behavior.itemId, {
              score: current.score + adjustedScore,
              sources: current.sources + 1,
            });
          }
        });
      }
    });

    // 转换为推荐项
    const recommendations: RecommendationItem[] = [];
    candidateScores.forEach((data, itemId) => {
      // 平均分数并考虑来源数量
      const avgScore = data.score / data.sources;
      const confidence = Math.min(1, data.sources / this.config.minCommonItems);

      recommendations.push({
        itemId,
        itemType: this.getItemType(itemId), // 需要实现此方法
        score: avgScore * 10, // 调整到0-100范围
        confidence,
        reason: "基于相似用户喜好推荐",
        rank: 0,
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, count);
  }

  /**
   * 基于物品的推荐
   */
  private async getItemBasedRecommendations(
    userId: string,
    count: number
  ): Promise<RecommendationItem[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return [];
    }

    const recommendations: RecommendationItem[] = [];

    // 基于用户最近交互的物品寻找相似物品
    const recentBehaviors = userProfile.behaviorHistory
      .sort(
        (a: UserBehavior, b: UserBehavior) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10); // 取最近10个行为

    const itemScores = new Map<string, number>();

    recentBehaviors.forEach((behavior: UserBehavior) => {
      const similarItems = this.findSimilarItems(behavior.itemId);

      similarItems.forEach(({ itemId: similarItemId, similarity }) => {
        const timeDecay = this.calculateTimeDecay(behavior.timestamp);
        const score = behavior.score * similarity * timeDecay;

        const currentScore = itemScores.get(similarItemId) || 0;
        itemScores.set(similarItemId, currentScore + score);
      });
    });

    // 转换为推荐项
    itemScores.forEach((score, itemId) => {
      recommendations.push({
        itemId,
        itemType: this.getItemType(itemId),
        score: Math.min(100, score * 5), // 调整分数范围
        confidence: 0.8,
        reason: "基于您浏览过的相似物品推荐",
        rank: 0,
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, count);
  }

  /**
   * 个性化推荐调整
   */
  private async personalizeRecommendations(
    userId: string,
    recommendations: RecommendationItem[],
    location?: { lat: number; lng: number },
    filters?: any
  ): Promise<RecommendationItem[]> {
    const userProfile = await this.userProfileService.getUserProfile(userId);
    if (!userProfile) return recommendations;

    return recommendations.map((rec) => {
      let adjustedScore = rec.score;

      // 基于用户偏好的调整
      const itemProfile = this.itemProfiles.get(rec.itemId);
      if (itemProfile) {
        // 类别偏好加权
        if (
          userProfile.preferences.categories.includes(
            itemProfile.basicInfo.category
          )
        ) {
          adjustedScore *= 1.2;
        }

        // 品牌偏好加权
        if (
          userProfile.preferences.brands.includes(
            itemProfile.basicInfo.brand || ""
          )
        ) {
          adjustedScore *= 1.1;
        }

        // 地理位置加权（如果是维修店）
        if (location && itemProfile.location) {
          const distance = this.calculateDistance(
            location.lat,
            location.lng,
            itemProfile.location.lat,
            itemProfile.location.lng
          );
          // 距离越近分数越高（最多加20%）
          const distanceBonus = Math.max(0, 1 - distance / 50) * 0.2;
          adjustedScore *= 1 + distanceBonus;
        }
      }

      return {
        ...rec,
        score: Math.min(100, adjustedScore),
      };
    });
  }

  /**
   * 合并和排名推荐
   */
  private mergeAndRankRecommendations(
    recommendations: RecommendationItem[],
    count: number
  ): RecommendationItem[] {
    // 按物品ID合并重复推荐
    const merged = new Map<string, RecommendationItem>();

    recommendations.forEach((rec) => {
      const existing = merged.get(rec.itemId);
      if (existing) {
        // 合并分数（取最高分）
        merged.set(rec.itemId, {
          ...rec,
          score: Math.max(existing.score, rec.score),
          confidence: Math.max(existing.confidence, rec.confidence),
        });
      } else {
        merged.set(rec.itemId, rec);
      }
    });

    // 排序并截取指定数量
    return Array.from(merged.values())
      .sort((a, b) => {
        // 主要按分数排序，次要按置信度排序
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, count)
      .map((rec, index) => ({
        ...rec,
        rank: index + 1,
      }));
  }

  /**
   * 添加推荐理由
   */
  private addRecommendationReasons(
    recommendations: RecommendationItem[],
    userId: string
  ): RecommendationItem[] {
    return recommendations.map((rec) => {
      let reason = rec.reason;

      // 根据推荐类型添加更具体的理由
      if (rec.score > 80) {
        reason = `强烈推荐：${reason}`;
      } else if (rec.score > 60) {
        reason = `推荐：${reason}`;
      } else {
        reason = `可能感兴趣：${reason}`;
      }

      return {
        ...rec,
        reason,
      };
    });
  }

  /**
   * 获取默认推荐
   */
  private getDefaultRecommendations(count: number): RecommendationItem[] {
    // 返回热门物品作为默认推荐
    return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
      itemId: `popular_item_${i + 1}`,
      itemType: RecommendationItemType.REPAIR_SHOP,
      score: 50 - i * 5,
      confidence: 0.5,
      reason: "热门推荐",
      rank: i + 1,
    }));
  }

  // 辅助方法...

  private findSimilarUsers(
    userId: string
  ): Array<{ userId: string; similarity: number }> {
    const similarities = this.userSimilarityMatrix.get(userId) || new Map();

    return Array.from(similarities.entries())
      .map(([similarUserId, similarity]) => ({
        userId: similarUserId,
        similarity,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.config.neighborhoodSize);
  }

  private findSimilarItems(
    itemId: string
  ): Array<{ itemId: string; similarity: number }> {
    const similarities = this.itemSimilarityMatrix.get(itemId) || new Map();

    return Array.from(similarities.entries())
      .map(([similarItemId, similarity]) => ({
        itemId: similarItemId,
        similarity,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20); // 限制相似物品数量
  }

  private calculateTimeDecay(timestamp: string): number {
    const behaviorTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const daysDiff = (currentTime - behaviorTime) / (1000 * 60 * 60 * 24);

    // 指数衰减
    return Math.pow(this.config.decayFactor, daysDiff);
  }

  private getItemType(itemId: string): RecommendationItemType {
    // 简化实现，实际应该根据物品ID前缀或数据库查询确定
    if (itemId.startsWith("shop_")) {
      return RecommendationItemType.REPAIR_SHOP;
    } else if (itemId.startsWith("part_")) {
      return RecommendationItemType.PART;
    } else {
      return RecommendationItemType.REPAIR_SHOP; // 默认
    }
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Getter for item profiles (needed for personalization)
  private get itemProfiles(): Map<string, any> {
    // 这里应该返回物品画像缓存
    // 简化实现，实际应该从itemProfileService获取
    return new Map();
  }
}
