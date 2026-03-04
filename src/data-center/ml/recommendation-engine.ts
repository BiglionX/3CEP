// 机器学习推荐算法服务
// 实现基于协同过滤和内容的混合推荐系统

// 用户行为记录
export interface UserBehavior {
  userId: string;
  itemId: string; // 设备或配件ID
  actionType: 'view' | 'search' | 'purchase' | 'favorite' | 'compare';
  timestamp: string;
  score: number; // 行为权重分数
}

// 推荐项目
export interface RecommendationItem {
  itemId: string;
  itemType: 'device' | 'part' | 'accessory';
  score: number; // 推荐分数
  reason: string; // 推荐理由
  confidence: number; // 置信?0-1
}

// 用户画像
export interface UserProfile {
  userId: string;
  preferences: {
    categories: string[]; // 偏好类别
    brands: string[]; // 偏好品牌
    priceRange: [number, number]; // 价格区间
  };
  behaviorHistory: UserBehavior[];
  similarityScore?: number; // 与其他用户的相似?}

// 协同过滤配置
export interface CollaborativeFilterConfig {
  similarityThreshold: number; // 相似度阈?  minCommonItems: number; // 最少共同项目数
  neighborhoodSize: number; // 邻居用户数量
}

// 推荐算法接口
export interface Recommender {
  train(userData: UserBehavior[]): Promise<void>;
  recommend(userId: string, count?: number): Promise<RecommendationItem[]>;
  getType(): string;
}

// 协同过滤推荐?export class CollaborativeFilterRecommender implements Recommender {
  private userProfiles: Map<string, UserProfile> = new Map();
  private itemSimilarityMatrix: Map<string, Map<string, number>> = new Map();
  private config: CollaborativeFilterConfig;

  constructor(config?: Partial<CollaborativeFilterConfig>) {
    this.config = {
      similarityThreshold: 0.3,
      minCommonItems: 3,
      neighborhoodSize: 20,
      ...config,
    };
  }

  async train(userData: UserBehavior[]): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🤖 开始训练协同过滤模?..')// 构建用户画像
    this.buildUserProfiles(userData);

    // 计算用户相似?    await this.calculateUserSimilarities();

    // 计算物品相似?    await this.calculateItemSimilarities();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?协同过滤模型训练完成')}

  async recommend(
    userId: string,
    count: number = 10
  ): Promise<RecommendationItem[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return this.getDefaultRecommendations(count);
    }

    // 基于用户相似度的推荐
    const userBasedRecs = await this.getUserBasedRecommendations(
      userProfile,
      count
    );

    // 基于物品相似度的推荐
    const itemBasedRecs = await this.getItemBasedRecommendations(
      userProfile,
      count
    );

    // 合并和排序推荐结?    const mergedRecs = this.mergeRecommendations(
      userBasedRecs,
      itemBasedRecs,
      count
    );

    return mergedRecs;
  }

  getType(): string {
    return 'collaborative-filter';
  }

  // 构建用户画像
  private buildUserProfiles(userData: UserBehavior[]): void {
    const userBehaviors = new Map<string, UserBehavior[]>();

    // 按用户分组行为数?    userData.forEach(behavior => {
      if (!userBehaviors.has(behavior.userId)) {
        userBehaviors.set(behavior.userId, []);
      }
      userBehaviors.get(behavior.userId)?.push(behavior);
    });

    // 创建用户画像
    userBehaviors.forEach((behaviors, userId) => {
      const profile: UserProfile = {
        userId,
        preferences: this.extractPreferences(behaviors),
        behaviorHistory: behaviors,
      };
      this.userProfiles.set(userId, profile);
    });
  }

  // 提取用户偏好
  private extractPreferences(
    behaviors: UserBehavior[]
  ): UserProfile['preferences'] {
    const categories = new Set<string>();
    const brands = new Set<string>();
    const scores: number[] = [];

    behaviors.forEach(behavior => {
      // 从itemId中提取类别和品牌信息（简化处理）
      const itemInfo = this.parseItemId(behavior.itemId);
      if (itemInfo.category) categories.add(itemInfo.category);
      if (itemInfo.brand) brands.add(itemInfo.brand);
      scores.push(behavior.score);
    });

    // 计算价格偏好（基于行为分数）
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const priceMin = Math.max(0, avgScore * 50 - 100);
    const priceMax = avgScore * 150 + 100;

    return {
      categories: Array.from(categories),
      brands: Array.from(brands),
      priceRange: [priceMin, priceMax],
    };
  }

  // 解析物品ID获取基本信息
  private parseItemId(itemId: string): { category?: string; brand?: string } {
    // 简化的解析逻辑，实际应该查询数据库
    if (itemId.includes('iphone'))
      return { category: 'smartphone', brand: 'Apple' };
    if (itemId.includes('galaxy'))
      return { category: 'smartphone', brand: 'Samsung' };
    if (itemId.includes('screen')) return { category: 'screen' };
    if (itemId.includes('battery')) return { category: 'battery' };
    return {};
  }

  // 计算用户相似?  private async calculateUserSimilarities(): Promise<void> {
    const users = Array.from(this.userProfiles.keys());

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const similarity = this.calculateUserSimilarity(users[i], users[j]);
        if (similarity > this.config.similarityThreshold) {
          // 存储相似度（简化存储）
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
            `👥 用户 ${users[i]} �?${users[j]} 相似? ${similarity.toFixed(3)}`
          );
        }
      }
    }
  }

  // 计算两个用户的相似度（余弦相似度?  private calculateUserSimilarity(userId1: string, userId2: string): number {
    const profile1 = this.userProfiles.get(userId1);
    const profile2 = this.userProfiles.get(userId2);

    if (!profile1 || !profile2) return 0;

    // 简化的相似度计?    const commonCategories = profile1.preferences.categories.filter(cat =>
      profile2.preferences.categories.includes(cat)
    ).length;

    const commonBrands = profile1.preferences.brands.filter(brand =>
      profile2.preferences.brands.includes(brand)
    ).length;

    const categorySimilarity =
      commonCategories /
      Math.max(
        profile1.preferences.categories.length,
        profile2.preferences.categories.length,
        1
      );

    const brandSimilarity =
      commonBrands /
      Math.max(
        profile1.preferences.brands.length,
        profile2.preferences.brands.length,
        1
      );

    return (categorySimilarity + brandSimilarity) / 2;
  }

  // 计算物品相似度矩?  private async calculateItemSimilarities(): Promise<void> {
    // 简化实现，实际应该基于用户行为计算物品间相似度
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔢 计算物品相似度矩?..')}

  // 基于用户的推?  private async getUserBasedRecommendations(
    userProfile: UserProfile,
    count: number
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];

    // 找到相似用户喜欢的物?    const similarUsers = this.findSimilarUsers(userProfile.userId);

    // 收集相似用户的行为但目标用户未接触过的物?    const userItems = new Set(userProfile.behaviorHistory.map(b => b.itemId));
    const candidateItems = new Map<string, number>();

    similarUsers.forEach(similarUser => {
      const similarProfile = this.userProfiles.get(similarUser.userId);
      if (similarProfile) {
        similarProfile.behaviorHistory.forEach(behavior => {
          if (!userItems.has(behavior.itemId)) {
            const currentScore = candidateItems.get(behavior.itemId) || 0;
            candidateItems.set(
              behavior.itemId,
              currentScore + behavior.score * similarUser.similarity
            );
          }
        });
      }
    });

    // 转换为推荐项?    candidateItems.forEach((score, itemId) => {
      recommendations.push({
        itemId,
        itemType: this.getItemType(itemId),
        score,
        reason: '基于相似用户喜好推荐',
        confidence: Math.min(1, score / 100),
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, count);
  }

  // 基于物品的推?  private async getItemBasedRecommendations(
    userProfile: UserProfile,
    count: number
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];

    // 基于用户历史行为中物品的相似物品进行推荐
    const recentItems = userProfile.behaviorHistory
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5)
      .map(b => b.itemId);

    recentItems.forEach(itemId => {
      const similarItems = this.findSimilarItems(itemId);
      similarItems.forEach(similarItem => {
        recommendations.push({
          itemId: similarItem.itemId,
          itemType: similarItem.itemType,
          score: similarItem.similarity * 50, // 基础分数
          reason: `与您浏览?${this.getItemDisplayName(itemId)} 相似`,
          confidence: similarItem.similarity,
        });
      });
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, count);
  }

  // 查找相似用户
  private findSimilarUsers(
    userId: string
  ): Array<{ userId: string; similarity: number }> {
    const similarities: Array<{ userId: string; similarity: number }> = [];

    this.userProfiles.forEach((profile, otherUserId) => {
      if (otherUserId !== userId) {
        const similarity = this.calculateUserSimilarity(userId, otherUserId);
        if (similarity > this.config.similarityThreshold) {
          similarities.push({ userId: otherUserId, similarity });
        }
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.config.neighborhoodSize);
  }

  // 查找相似物品（简化实现）
  private findSimilarItems(
    itemId: string
  ): Array<{ itemId: string; itemType: string; similarity: number }> {
    // 简化实现，返回同类别的一些物?    const itemInfo = this.parseItemId(itemId);
    return [
      {
        itemId: `${itemId}_variant1`,
        itemType: this.getItemType(itemId) as 'device' | 'part' | 'accessory',
        similarity: 0.8,
      },
      {
        itemId: `${itemId}_variant2`,
        itemType: this.getItemType(itemId) as 'device' | 'part' | 'accessory',
        similarity: 0.7,
      },
      {
        itemId: `${itemId}_related1`,
        itemType: this.getItemType(itemId) as 'device' | 'part' | 'accessory',
        similarity: 0.6,
      },
    ];
  }

  // 合并推荐结果
  private mergeRecommendations(
    recs1: RecommendationItem[],
    recs2: RecommendationItem[],
    count: number
  ): RecommendationItem[] {
    const merged = new Map<string, RecommendationItem>();

    // 合并两个推荐列表
    [...recs1, ...recs2].forEach(rec => {
      if (merged.has(rec.itemId)) {
        const existing = merged.get(rec.itemId)!;
        existing.score = Math.max(existing.score, rec.score);
        existing.confidence = Math.max(existing.confidence, rec.confidence);
      } else {
        merged.set(rec.itemId, rec);
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // 获取默认推荐
  private getDefaultRecommendations(count: number): RecommendationItem[] {
    // 返回热门物品作为默认推荐
    return [
      {
        itemId: 'popular_item_1',
        itemType: 'device',
        score: 90,
        reason: '热门推荐',
        confidence: 0.9,
      },
      {
        itemId: 'popular_item_2',
        itemType: 'part',
        score: 85,
        reason: '热门推荐',
        confidence: 0.85,
      },
      {
        itemId: 'popular_item_3',
        itemType: 'accessory',
        score: 80,
        reason: '热门推荐',
        confidence: 0.8,
      },
    ].slice(0, count);
  }

  // 获取物品类型
  private getItemType(itemId: string): 'device' | 'part' | 'accessory' {
    if (itemId.includes('device') || itemId.includes('phone')) return 'device';
    if (
      itemId.includes('part') ||
      itemId.includes('screen') ||
      itemId.includes('battery')
    )
      return 'part';
    return 'accessory';
  }

  // 获取物品显示名称
  private getItemDisplayName(itemId: string): string {
    return itemId.replace(/_/g, ' ').toUpperCase();
  }
}

// 内容基础推荐?export class ContentBasedRecommender implements Recommender {
  async train(userData: UserBehavior[]): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📚 训练内容基础推荐模型...')// 基于物品特征的推荐逻辑
  }

  async recommend(
    userId: string,
    count: number = 10
  ): Promise<RecommendationItem[]> {
    // 基于用户偏好和物品特征的推荐
    return [
      {
        itemId: 'content_based_rec',
        itemType: 'device',
        score: 75,
        reason: '基于内容特征推荐',
        confidence: 0.75,
      },
    ];
  }

  getType(): string {
    return 'content-based';
  }
}

// 混合推荐服务
export class HybridRecommender {
  private recommenders: Recommender[] = [];
  private weights: Map<string, number> = new Map();

  constructor() {
    // 初始化推荐器
    this.recommenders.push(new CollaborativeFilterRecommender());
    this.recommenders.push(new ContentBasedRecommender());

    // 设置权重
    this.weights.set('collaborative-filter', 0.7);
    this.weights.set('content-based', 0.3);
  }

  async train(userData: UserBehavior[]): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 训练混合推荐系统...')// 并行训练所有推荐器
    await Promise.all(
      this.recommenders.map(recommender => recommender.train(userData))
    );

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?混合推荐系统训练完成')}

  async recommend(
    userId: string,
    count: number = 10
  ): Promise<RecommendationItem[]> {
    // 获取各个推荐器的结果
    const recommendationSets = await Promise.all(
      this.recommenders.map(async recommender => ({
        type: recommender.getType(),
        recommendations: await recommender.recommend(userId, count * 2), // 获取更多候?      }))
    );

    // 合并和加权推荐结?    const mergedRecommendations = this.mergeWeightedRecommendations(
      recommendationSets,
      count
    );

    return mergedRecommendations;
  }

  private mergeWeightedRecommendations(
    recommendationSets: Array<{
      type: string;
      recommendations: RecommendationItem[];
    }>,
    count: number
  ): RecommendationItem[] {
    const itemScores: Map<string, { totalScore: number; count: number }> =
      new Map();

    recommendationSets.forEach(set => {
      const weight = this.weights.get(set.type) || 1;
      set.recommendations.forEach(rec => {
        if (!itemScores.has(rec.itemId)) {
          itemScores.set(rec.itemId, { totalScore: 0, count: 0 });
        }
        const scoreInfo = itemScores.get(rec.itemId)!;
        scoreInfo.totalScore += rec.score * weight;
        scoreInfo.count += 1;
      });
    });

    // 转换为最终推荐列?    const finalRecommendations: RecommendationItem[] = [];
    itemScores.forEach((scoreInfo, itemId) => {
      // 找到该物品的最佳推荐信?      const bestRec = recommendationSets
        .flatMap(set => set.recommendations)
        .find(rec => rec.itemId === itemId);

      if (bestRec) {
        finalRecommendations.push({
          ...bestRec,
          score: scoreInfo.totalScore / scoreInfo.count,
        });
      }
    });

    return finalRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // 添加新的推荐?  addRecommender(recommender: Recommender, weight: number): void {
    this.recommenders.push(recommender);
    this.weights.set(recommender.getType(), weight);
  }
}

// 导出实例
export const hybridRecommender = new HybridRecommender();
