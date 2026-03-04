// 智能推荐引擎 - 基于用户行为和画像的智能推荐系统

export interface RecommendationConfig {
  algorithm: 'collaborative' | 'content_based' | 'hybrid' | 'similarity';
  similarityThreshold: number; // 相似度阈?0-1
  maxRecommendations: number; // 最大推荐数?  lookbackPeriod: number; // 回溯天数
  weightFactors: {
    behavior: number; // 行为权重
    preference: number; // 偏好权重
    demographic: number; // 人口统计权重
    temporal: number; // 时间因素权重
  };
}

export interface UserSimilarity {
  userId: string;
  similarityScore: number; // 0-1 相似度分?  commonFeatures: string[]; // 共同特征
  similarityFactors: {
    behaviorOverlap: number;
    preferenceMatch: number;
    demographicMatch: number;
  };
}

export interface RecommendedUser {
  userId: string;
  email: string;
  displayName: string;
  similarity: UserSimilarity;
  recommendationReason: string;
  confidence: number; // 0-1 置信?  recommendedActions: string[]; // 推荐的操?}

export interface ContentRecommendation {
  contentType: 'user_group' | 'feature' | 'workflow' | 'template';
  itemId: string;
  itemName: string;
  relevanceScore: number;
  targetUsers: string[];
  recommendationReason: string;
}

// 推荐引擎核心?export class SmartRecommender {
  private config: RecommendationConfig;
  private userData: Map<string, any>;
  private behaviorData: any[];

  constructor(config: Partial<RecommendationConfig> = {}) {
    this.config = {
      algorithm: 'hybrid',
      similarityThreshold: 0.6,
      maxRecommendations: 10,
      lookbackPeriod: 90,
      weightFactors: {
        behavior: 0.4,
        preference: 0.3,
        demographic: 0.2,
        temporal: 0.1,
      },
      ...config,
    };

    this.userData = new Map();
    this.behaviorData = [];
  }

  // 设置用户数据
  setUserData(users: any[]) {
    this.userData.clear();
    users.forEach(user => {
      this.userData.set(user.userId, user);
    });
  }

  // 设置行为数据
  setBehaviorData(behaviors: any[]) {
    this.behaviorData = behaviors;
  }

  // 计算用户间的相似?  calculateUserSimilarity(userId1: string, userId2: string): UserSimilarity {
    const user1 = this.userData.get(userId1);
    const user2 = this.userData.get(userId2);

    if (!user1 || !user2) {
      throw new Error(`用户数据不存? ${!user1 ? userId1 : userId2}`);
    }

    // 1. 行为相似度计?    const behaviorOverlap = this.calculateBehaviorSimilarity(userId1, userId2);

    // 2. 偏好相似度计?    const preferenceMatch = this.calculatePreferenceSimilarity(user1, user2);

    // 3. 人口统计相似度计?    const demographicMatch = this.calculateDemographicSimilarity(user1, user2);

    // 4. 综合相似度计?    const weightedSimilarity =
      behaviorOverlap * this.config.weightFactors.behavior +
      preferenceMatch * this.config.weightFactors.preference +
      demographicMatch * this.config.weightFactors.demographic;

    // 5. 识别共同特征
    const commonFeatures = this.identifyCommonFeatures(user1, user2);

    return {
      userId: userId2,
      similarityScore: Math.min(1, Math.max(0, weightedSimilarity)),
      commonFeatures,
      similarityFactors: {
        behaviorOverlap,
        preferenceMatch,
        demographicMatch,
      },
    };
  }

  // 基于协同过滤的用户推?  recommendSimilarUsers(targetUserId: string): RecommendedUser[] {
    const recommendations: RecommendedUser[] = [];
    const targetUser = this.userData.get(targetUserId);

    if (!targetUser) {
      throw new Error(`目标用户不存? ${targetUserId}`);
    }

    // 计算所有其他用户的相似?    for (const [userId, userData] of this.userData.entries()) {
      if (userId === targetUserId) continue;

      try {
        const similarity = this.calculateUserSimilarity(targetUserId, userId);

        // 只推荐超过阈值的用户
        if (similarity.similarityScore >= this.config.similarityThreshold) {
          const recommendedUser: RecommendedUser = {
            userId: userData.userId,
            email: userData.email,
            displayName: userData.displayName,
            similarity,
            confidence: similarity.similarityScore,
            recommendationReason: this.generateRecommendationReason(similarity),
            recommendedActions: this.generateRecommendedActions(
              targetUser,
              userData,
              similarity
            ),
          };

          recommendations.push(recommendedUser);
        }
      } catch (error) {
        console.warn(`计算用户 ${userId} 相似度时出错:`, error);
      }
    }

    // 按相似度排序并限制数?    return recommendations
      .sort(
        (a, b) => b.similarity.similarityScore - a.similarity.similarityScore
      )
      .slice(0, this.config.maxRecommendations);
  }

  // 内容推荐（基于用户画像推荐功能、模板等?  recommendContent(targetUserId: string): ContentRecommendation[] {
    const targetUser = this.userData.get(targetUserId);
    if (!targetUser) return [];

    const recommendations: ContentRecommendation[] = [];

    // 基于用户价值层级推?    const contentByValueTier = this.getContentByValueTier(targetUser.valueTier);
    contentByValueTier.forEach(content => {
      recommendations.push({
        ...content,
        relevanceScore: 0.8,
        targetUsers: [targetUserId],
        recommendationReason: `匹配您的价值等?${targetUser.valueTier}`,
      });
    });

    // 基于行为模式推荐
    const behaviorBasedContent = this.getContentByBehaviorPattern(targetUser);
    behaviorBasedContent.forEach(content => {
      recommendations.push({
        ...content,
        relevanceScore: 0.7,
        targetUsers: [targetUserId],
        recommendationReason: '基于您的使用习惯推荐',
      });
    });

    // 基于生命周期阶段推荐
    const lifecycleContent = this.getContentByLifecycle(
      targetUser.lifecycleStage
    );
    lifecycleContent.forEach(content => {
      recommendations.push({
        ...content,
        relevanceScore: 0.6,
        targetUsers: [targetUserId],
        recommendationReason: `适合${this.getLifecycleDescription(targetUser.lifecycleStage)}阶段`,
      });
    });

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.config.maxRecommendations);
  }

  // 实时推荐更新
  updateRecommendations(targetUserId: string): {
    userRecommendations: RecommendedUser[];
    contentRecommendations: ContentRecommendation[];
  } {
    const userRecs = this.recommendSimilarUsers(targetUserId);
    const contentRecs = this.recommendContent(targetUserId);

    return {
      userRecommendations: userRecs,
      contentRecommendations: contentRecs,
    };
  }

  // 私有辅助方法
  private calculateBehaviorSimilarity(
    userId1: string,
    userId2: string
  ): number {
    const behaviors1 = this.behaviorData.filter(b => b.user_id === userId1);
    const behaviors2 = this.behaviorData.filter(b => b.user_id === userId2);

    if (behaviors1.length === 0 || behaviors2.length === 0) {
      return 0;
    }

    // 计算功能使用重叠?    const features1 = new Set(
      behaviors1
        .filter(b => ['feature_use', 'click_event'].includes(b.behavior_type))
        .map(b => b.feature_name || b.action_detail)
    );

    const features2 = new Set(
      behaviors2
        .filter(b => ['feature_use', 'click_event'].includes(b.behavior_type))
        .map(b => b.feature_name || b.action_detail)
    );

    const intersection = new Set([...features1].filter(x => features2.has(x)));
    const union = new Set([...features1, ...features2]);

    const jaccardSimilarity =
      union.size > 0 ? intersection.size / union.size : 0;

    // 计算访问频率相似?    const freq1 = behaviors1.filter(
      b => b.behavior_type === 'page_view'
    ).length;
    const freq2 = behaviors2.filter(
      b => b.behavior_type === 'page_view'
    ).length;
    const frequencySimilarity =
      1 - Math.abs(freq1 - freq2) / Math.max(freq1, freq2, 1);

    // 综合行为相似?    return jaccardSimilarity * 0.7 + frequencySimilarity * 0.3;
  }

  private calculatePreferenceSimilarity(user1: any, user2: any): number {
    const prefs1 = user1.preferences || {};
    const prefs2 = user2.preferences || {};

    let totalWeight = 0;
    let matchedWeight = 0;

    // 界面偏好匹配
    if (prefs1.uiPreferences && prefs2.uiPreferences) {
      const uiPrefs1 = prefs1.uiPreferences;
      const uiPrefs2 = prefs2.uiPreferences;

      totalWeight += 3;
      if (uiPrefs1.theme === uiPrefs2.theme) matchedWeight += 1;
      if (uiPrefs1.language === uiPrefs2.language) matchedWeight += 1;
      if (uiPrefs1.layout === uiPrefs2.layout) matchedWeight += 1;
    }

    // 功能偏好匹配
    if (prefs1.featurePreferences && prefs2.featurePreferences) {
      const fav1 = new Set(prefs1.featurePreferences.favoriteFeatures || []);
      const fav2 = new Set(prefs2.featurePreferences.favoriteFeatures || []);

      const intersection = new Set([...fav1].filter(x => fav2.has(x)));
      const union = new Set([...fav1, ...fav2]);

      if (union.size > 0) {
        totalWeight += 2;
        matchedWeight += (intersection.size / union.size) * 2;
      }
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  private calculateDemographicSimilarity(user1: any, user2: any): number {
    const demo1 = user1.demographics || {};
    const demo2 = user2.demographics || {};

    let matches = 0;
    let total = 0;

    // 年龄组匹?    if (demo1.ageGroup && demo2.ageGroup) {
      total++;
      if (demo1.ageGroup === demo2.ageGroup) matches++;
    }

    // 地理位置匹配
    if (demo1.location && demo2.location) {
      total++;
      if (demo1.location === demo2.location) matches++;
    }

    // 语言匹配
    if (demo1.language && demo2.language) {
      total++;
      if (demo1.language === demo2.language) matches++;
    }

    return total > 0 ? matches / total : 0;
  }

  private identifyCommonFeatures(user1: any, user2: any): string[] {
    const common: string[] = [];

    // 行为特征
    if (user1?.visitPatterns?.frequency === user2?.visitPatterns?.frequency) {
      common.push('访问频率相似');
    }

    if (user1.valueTier === user2.valueTier) {
      common.push(`同为${user1.valueTier}级别用户`);
    }

    if (user1.lifecycleStage === user2.lifecycleStage) {
      common.push(`处于相同生命周期阶段`);
    }

    // 偏好特征
    const favFeatures1 = user1?.featurePreferences?.favoriteFeatures || [];
    const favFeatures2 = user2?.featurePreferences?.favoriteFeatures || [];
    const commonFeatures = favFeatures1.filter((f: string) =>
      favFeatures2.includes(f)
    );
    if (commonFeatures.length > 0) {
      common.push(`都喜?{commonFeatures.slice(0, 2).join('�?)}功能`);
    }

    return common;
  }

  private generateRecommendationReason(similarity: UserSimilarity): string {
    const factors = [];

    if (similarity.similarityFactors.behaviorOverlap > 0.7) {
      factors.push('使用习惯高度相似');
    }
    if (similarity.similarityFactors.preferenceMatch > 0.7) {
      factors.push('偏好设置相近');
    }
    if (similarity.similarityFactors.demographicMatch > 0.8) {
      factors.push('背景特征匹配');
    }

    if (factors.length === 0) {
      factors.push('综合特征相似');
    }

    return `因为你们${factors.join('�?)}，所以为您推荐`;
  }

  private generateRecommendedActions(
    targetUser: any,
    similarUser: any,
    similarity: UserSimilarity
  ): string[] {
    const actions: string[] = [];

    // 基于共同喜欢的功能推荐交?    const targetFavs = targetUser?.featurePreferences?.favoriteFeatures || [];
    const similarFavs = similarUser?.featurePreferences?.favoriteFeatures || [];
    const commonFavs = similarFavs.filter(
      (f: string) => !targetFavs.includes(f)
    );

    if (commonFavs.length > 0) {
      actions.push(`交流${commonFavs[0]}功能的使用经验`);
    }

    // 基于价值层级的协作建议
    if (
      similarUser.valueTier === 'platinum' &&
      targetUser.valueTier !== 'platinum'
    ) {
      actions.push('向该用户请教高级功能使用技?);
    }

    // 基于生命周期的互助建?    if (
      targetUser.lifecycleStage === 'new_user' &&
      similarUser.lifecycleStage === 'loyal'
    ) {
      actions.push('寻求使用指导和最佳实践分?);
    }

    return actions.slice(0, 2);
  }

  private getContentByValueTier(
    valueTier: string
  ): Omit<ContentRecommendation, 'targetUsers' | 'recommendationReason'>[] {
    const contentMap: Record<string, any[]> = {
      platinum: [
        {
          contentType: 'feature',
          itemId: 'advanced_analytics',
          itemName: '高级分析功能',
        },
        {
          contentType: 'template',
          itemId: 'executive_dashboard',
          itemName: '高管仪表板模?,
        },
        {
          contentType: 'workflow',
          itemId: 'automated_reporting',
          itemName: '自动化报告流?,
        },
      ],
      gold: [
        {
          contentType: 'feature',
          itemId: 'team_collaboration',
          itemName: '团队协作工具',
        },
        {
          contentType: 'template',
          itemId: 'department_report',
          itemName: '部门报表模板',
        },
      ],
      silver: [
        {
          contentType: 'feature',
          itemId: 'basic_reporting',
          itemName: '基础报告功能',
        },
        {
          contentType: 'template',
          itemId: 'weekly_summary',
          itemName: '周报模板',
        },
      ],
      bronze: [
        {
          contentType: 'feature',
          itemId: 'getting_started',
          itemName: '新手引导',
        },
        {
          contentType: 'template',
          itemId: 'daily_checklist',
          itemName: '日常检查清?,
        },
      ],
    };

    return (contentMap[valueTier] || []).map(item => ({
      ...item,
      relevanceScore: 0.8,
    }));
  }

  private getContentByBehaviorPattern(
    user: any
  ): Omit<ContentRecommendation, 'targetUsers' | 'recommendationReason'>[] {
    const behavioral = user.behavioral || {};
    const recommendations: any[] = [];

    // 高频访问用户推荐效率工具
    if (behavioral?.frequency === 'daily') {
      recommendations.push({
        contentType: 'feature',
        itemId: 'productivity_tools',
        itemName: '生产力提升工?,
        relevanceScore: 0.7,
      });
    }

    // 深度浏览用户推荐高级功能
    if (behavioral?.browsingDepth === 'deep') {
      recommendations.push({
        contentType: 'feature',
        itemId: 'advanced_features',
        itemName: '高级功能探索',
        relevanceScore: 0.7,
      });
    }

    return recommendations;
  }

  private getContentByLifecycle(
    lifecycleStage: string
  ): Omit<ContentRecommendation, 'targetUsers' | 'recommendationReason'>[] {
    const lifecycleMap: Record<string, any[]> = {
      new_user: [
        {
          contentType: 'feature',
          itemId: 'onboarding_tour',
          itemName: '新手引导教程',
        },
        {
          contentType: 'template',
          itemId: 'setup_checklist',
          itemName: '系统设置清单',
        },
      ],
      onboarding: [
        {
          contentType: 'feature',
          itemId: 'feature_discovery',
          itemName: '功能发现向导',
        },
        {
          contentType: 'workflow',
          itemId: 'best_practices',
          itemName: '最佳实践指?,
        },
      ],
      active: [
        {
          contentType: 'feature',
          itemId: 'efficiency_boost',
          itemName: '效率提升技?,
        },
        {
          contentType: 'template',
          itemId: 'custom_reports',
          itemName: '自定义报?,
        },
      ],
      loyal: [
        {
          contentType: 'feature',
          itemId: 'power_user',
          itemName: '专家级功?,
        },
        {
          contentType: 'workflow',
          itemId: 'process_optimization',
          itemName: '流程优化方案',
        },
      ],
    };

    return (lifecycleMap[lifecycleStage] || []).map(item => ({
      ...item,
      relevanceScore: 0.6,
    }));
  }

  private getLifecycleDescription(stage: string): string {
    const descriptions: Record<string, string> = {
      new_user: '新手入门',
      onboarding: '体验适应',
      active: '活跃使用',
      loyal: '忠实用户',
    };
    return descriptions[stage] || stage;
  }
}

// 推荐服务?export class RecommendationService {
  private recommender: SmartRecommender;
  private cache: Map<string, any>;

  constructor(config?: Partial<RecommendationConfig>) {
    this.recommender = new SmartRecommender(config);
    this.cache = new Map();
  }

  // 初始化推荐服?  initialize(userData: any[], behaviorData: any[]) {
    this.recommender.setUserData(userData);
    this.recommender.setBehaviorData(behaviorData);
  }

  // 获取用户推荐
  async getUserRecommendations(userId: string): Promise<RecommendedUser[]> {
    const cacheKey = `user_recs_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      // 30分钟缓存
      return cached.data;
    }

    const recommendations = this.recommender.recommendSimilarUsers(userId);
    this.cache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now(),
    });

    return recommendations;
  }

  // 获取内容推荐
  async getContentRecommendations(
    userId: string
  ): Promise<ContentRecommendation[]> {
    const cacheKey = `content_recs_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return cached.data;
    }

    const recommendations = this.recommender.recommendContent(userId);
    this.cache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now(),
    });

    return recommendations;
  }

  // 批量获取推荐
  async getBulkRecommendations(userIds: string[]): Promise<
    Record<
      string,
      {
        users: RecommendedUser[];
        content: ContentRecommendation[];
      }
    >
  > {
    const results: Record<string, any> = {};

    for (const userId of userIds) {
      try {
        const [userRecs, contentRecs] = await Promise.all([
          this.getUserRecommendations(userId),
          this.getContentRecommendations(userId),
        ]);

        results[userId] = {
          users: userRecs,
          content: contentRecs,
        };
      } catch (error) {
        console.error(`获取用户 ${userId} 的推荐失?`, error);
        results[userId] = { users: [], content: [] };
      }
    }

    return results;
  }

  // 清除缓存
  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(`user_recs_${userId}`);
      this.cache.delete(`content_recs_${userId}`);
    } else {
      this.cache.clear();
    }
  }
}
