// 快速匹配推荐算?
export interface QuickMatchConfig {
  coldStartThreshold: number; // 冷启动用户阈?行为数量)
  similarityMethod: 'cosine' | 'jaccard' | 'euclidean' | 'pearson';
  maxCandidates: number; // 最大候选用户数
  minSimilarity: number; // 最小相似度阈?  featureWeights: {
    demographics: number; // 人口统计权重
    behavior: number; // 行为权重
    preferences: number; // 偏好权重
    context: number; // 上下文权?  };
  fallbackStrategies: ('popular' | 'random' | 'category' | 'location')[];
}

export interface UserFeatures {
  userId: string;
  demographics: DemographicFeatures;
  behavior: BehavioralFeatures;
  preferences: PreferenceFeatures;
  context: ContextualFeatures;
}

export interface DemographicFeatures {
  ageGroup?: string;
  gender?: string;
  location?: string;
  occupation?: string;
  membershipLevel?: string;
}

export interface BehavioralFeatures {
  activityLevel: number; // 活跃?0-1
  featureUsage: string[]; // 使用过的功能
  visitFrequency: number; // 访问频率
  sessionDuration: number; // 平均会话时长
  interactionDepth: number; // 交互深度 0-1
}

export interface PreferenceFeatures {
  favoriteCategories: string[];
  preferredBrands: string[];
  contentTypes: string[];
  interactionStyles: string[];
}

export interface ContextualFeatures {
  deviceType: string;
  timeOfDay: number;
  dayOfWeek: number;
  season: string;
  referralSource?: string;
}

export interface SimilarityResult {
  userId: string;
  similarityScore: number;
  matchingFeatures: string[];
  confidence: number;
}

export interface QuickRecommendation {
  userId: string;
  recommendedUsers: SimilarityResult[];
  strategyUsed: string;
  processingTime: number;
  metadata: {
    totalCandidates: number;
    filteredCandidates: number;
    similarityDistribution: number[];
  };
}

export class QuickMatchRecommender {
  private config: QuickMatchConfig;
  private userDatabase: Map<string, UserFeatures>;
  private similarityCache: Map<string, Map<string, number>>;

  constructor(config: Partial<QuickMatchConfig> = {}) {
    this.config = {
      coldStartThreshold: 5,
      similarityMethod: 'cosine',
      maxCandidates: 100,
      minSimilarity: 0.3,
      featureWeights: {
        demographics: 0.25,
        behavior: 0.35,
        preferences: 0.25,
        context: 0.15,
      },
      fallbackStrategies: ['popular', 'category', 'location'],
      ...config,
    };

    this.userDatabase = new Map();
    this.similarityCache = new Map();
  }

  // 添加用户特征数据
  addUserFeatures(features: UserFeatures): void {
    this.userDatabase.set(features.userId, features);
    // 清除相关缓存
    this.invalidateCache(features.userId);
  }

  // 批量添加用户数据
  addUsersBatch(users: UserFeatures[]): void {
    users.forEach(user => this.addUserFeatures(user));
  }

  // 快速匹配推荐主函数
  async quickMatchRecommendation(
    targetUserId: string,
    options: {
      maxResults?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<QuickRecommendation> {
    const startTime = Date.now();
    const maxResults = options.maxResults || 10;
    const includeMetadata = options.includeMetadata ?? true;

    try {
      // 1. 检查目标用户是否存?      const targetUser = this.userDatabase.get(targetUserId);
      if (!targetUser) {
        throw new Error(`目标用户不存? ${targetUserId}`);
      }

      // 2. 判断是否为冷启动用户
      const isColdStart = this.isColdStartUser(targetUser);

      // 3. 选择合适的推荐策略
      let strategy = 'similarity_match';
      let candidates: SimilarityResult[] = [];

      if (isColdStart) {
        // 冷启动场?- 使用降级策略
        candidates = await this.handleColdStart(targetUserId, targetUser);
        strategy = 'cold_start_fallback';
      } else {
        // 正常场景 - 使用相似度匹?        candidates = await this.performSimilarityMatching(
          targetUserId,
          targetUser
        );
      }

      // 4. 后处理和排序
      const finalRecommendations = this.postProcessRecommendations(
        candidates,
        maxResults
      );

      // 5. 生成元数?      const metadata = includeMetadata
        ? this.generateMetadata(candidates, finalRecommendations)
        : undefined;

      return {
        userId: targetUserId,
        recommendedUsers: finalRecommendations,
        strategyUsed: strategy,
        processingTime: Date.now() - startTime,
        metadata: metadata || {
          totalCandidates: 0,
          filteredCandidates: 0,
          similarityDistribution: [],
        },
      };
    } catch (error) {
      console.error('快速匹配推荐失?', error);
      return {
        userId: targetUserId,
        recommendedUsers: [],
        strategyUsed: 'error_fallback',
        processingTime: Date.now() - startTime,
        metadata: {
          totalCandidates: 0,
          filteredCandidates: 0,
          similarityDistribution: [],
        },
      };
    }
  }

  // 判断是否为冷启动用户
  private isColdStartUser(user: UserFeatures): boolean {
    return user.behavior.featureUsage.length < this.config.coldStartThreshold;
  }

  // 处理冷启动场?  private async handleColdStart(
    userId: string,
    user: UserFeatures
  ): Promise<SimilarityResult[]> {
    const fallbackStrategy = this.config.fallbackStrategies[0] || 'popular';

    switch (fallbackStrategy) {
      case 'popular':
        return this.getPopularUsers(userId, 20);
      case 'category':
        return this.getCategoryBasedMatches(
          userId,
          user.preferences.favoriteCategories
        );
      case 'location':
        return this.getLocationBasedMatches(userId, user.demographics.location);
      case 'random':
        return this.getRandomMatches(userId, 15);
      default:
        return this.getPopularUsers(userId, 20);
    }
  }

  // 执行相似度匹?  private async performSimilarityMatching(
    targetUserId: string,
    targetUser: UserFeatures
  ): Promise<SimilarityResult[]> {
    const candidates: SimilarityResult[] = [];
    const targetFeatures = this.extractComparableFeatures(targetUser);

    // 获取候选用?    const candidateUsers = Array.from(this.userDatabase.entries())
      .filter(([userId]) => userId !== targetUserId)
      .slice(0, this.config.maxCandidates);

    // 计算相似?    for (const [candidateId, candidateUser] of candidateUsers) {
      try {
        const candidateFeatures = this.extractComparableFeatures(candidateUser);
        const similarity = this.calculateCompositeSimilarity(
          targetFeatures,
          candidateFeatures
        );

        if (similarity >= this.config.minSimilarity) {
          const matchingFeatures = this.identifyMatchingFeatures(
            targetUser,
            candidateUser
          );

          candidates.push({
            userId: candidateId,
            similarityScore: similarity,
            matchingFeatures,
            confidence: this.calculateConfidence(
              similarity,
              matchingFeatures.length
            ),
          });
        }
      } catch (error) {
        console.warn(`计算用户 ${candidateId} 相似度时出错:`, error);
      }
    }

    return candidates;
  }

  // 提取可比较的特征向量
  private extractComparableFeatures(user: UserFeatures): number[] {
    const features: number[] = [];

    // 行为特征 (0-1标准?
    features.push(user.behavior.activityLevel);
    features.push(user.behavior.visitFrequency / 10); // 假设最大频率为10
    features.push(user.behavior.sessionDuration / 3600); // 转换为小?    features.push(user.behavior.interactionDepth);

    // 偏好特征 (one-hot编码简?
    features.push(user.preferences.favoriteCategories.length / 10); // 假设最?0个类?    features.push(user.preferences.contentTypes.length / 5); // 假设最?种类?
    // 上下文特?    features.push(user.context.timeOfDay / 24);
    features.push(user.context.dayOfWeek / 7);

    return features;
  }

  // 计算复合相似?  private calculateCompositeSimilarity(
    features1: number[],
    features2: number[]
  ): number {
    // 加权余弦相似?    const weights = [
      this.config.featureWeights.behavior, // activityLevel
      this.config.featureWeights.behavior, // visitFrequency
      this.config.featureWeights.behavior, // sessionDuration
      this.config.featureWeights.behavior, // interactionDepth
      this.config.featureWeights.preferences, // favoriteCategories
      this.config.featureWeights.preferences, // contentTypes
      this.config.featureWeights.context, // timeOfDay
      this.config.featureWeights.context, // dayOfWeek
    ];

    return this.weightedCosineSimilarity(features1, features2, weights);
  }

  // 加权余弦相似度计?  private weightedCosineSimilarity(
    vec1: number[],
    vec2: number[],
    weights: number[]
  ): number {
    if (vec1.length !== vec2.length || vec1.length !== weights.length) {
      throw new Error('向量维度不匹?);
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      const w = weights[i];
      const a = vec1[i] * w;
      const b = vec2[i] * w;

      dotProduct += a * b;
      norm1 += a * a;
      norm2 += b * b;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // 识别匹配特征
  private identifyMatchingFeatures(
    user1: UserFeatures,
    user2: UserFeatures
  ): string[] {
    const matches: string[] = [];

    // 人口统计匹配
    if (user1.demographics.ageGroup === user2.demographics.ageGroup) {
      matches.push('年龄组相?);
    }
    if (user1.demographics.gender === user2.demographics.gender) {
      matches.push('性别相同');
    }
    if (user1.demographics.location === user2.demographics.location) {
      matches.push('地理位置相近');
    }

    // 行为匹配
    const commonFeatures = user1.behavior.featureUsage.filter(f =>
      user2.behavior.featureUsage.includes(f)
    );
    if (commonFeatures.length > 0) {
      matches.push(`共同使用${commonFeatures.length}个功能`);
    }

    // 偏好匹配
    const commonCategories = user1.preferences.favoriteCategories.filter(c =>
      user2.preferences.favoriteCategories.includes(c)
    );
    if (commonCategories.length > 0) {
      matches.push(`共同偏好${commonCategories.length}个类别`);
    }

    return matches;
  }

  // 计算置信?  private calculateConfidence(
    similarity: number,
    matchingFeatures: number
  ): number {
    // 基于相似度和匹配特征数量的综合置信度
    const featureBonus = Math.min(0.3, matchingFeatures * 0.05);
    return Math.min(1, similarity + featureBonus);
  }

  // 后处理推荐结?  private postProcessRecommendations(
    candidates: SimilarityResult[],
    maxResults: number
  ): SimilarityResult[] {
    // 按相似度降序排列
    const sorted = candidates.sort(
      (a, b) => b.similarityScore - a.similarityScore
    );

    // 去重和限制数?    const uniqueResults = this.removeDuplicates(sorted);

    return uniqueResults.slice(0, maxResults);
  }

  // 去重处理
  private removeDuplicates(results: SimilarityResult[]): SimilarityResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.userId)) {
        return false;
      }
      seen.add(result.userId);
      return true;
    });
  }

  // 生成元数?  private generateMetadata(
    allCandidates: SimilarityResult[],
    finalResults: SimilarityResult[]
  ): QuickRecommendation['metadata'] {
    const similarityScores = allCandidates.map(c => c.similarityScore);

    return {
      totalCandidates: allCandidates.length,
      filteredCandidates: finalResults.length,
      similarityDistribution: this.calculateDistribution(similarityScores),
    };
  }

  // 计算分布统计
  private calculateDistribution(scores: number[]): number[] {
    const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const distribution = new Array(bins.length - 1).fill(0);

    scores.forEach(score => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (score >= bins[i] && score < bins[i + 1]) {
          distribution[i]++;
          break;
        }
      }
    });

    return distribution;
  }

  // 降级策略实现
  private async getPopularUsers(
    userId: string,
    limit: number
  ): Promise<SimilarityResult[]> {
    // 基于活跃度的热门用户推荐
    const popularUsers = Array.from(this.userDatabase.entries())
      .filter(([id]) => id !== userId)
      .map(([id, user]) => ({
        userId: id,
        score: user.behavior.activityLevel * user.behavior.visitFrequency,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return popularUsers.map(user => ({
      userId: user.userId,
      similarityScore: 0.5, // 固定相似?      matchingFeatures: ['活跃用户'],
      confidence: 0.6,
    }));
  }

  private async getCategoryBasedMatches(
    userId: string,
    categories: string[]
  ): Promise<SimilarityResult[]> {
    if (!categories || categories.length === 0) {
      return this.getRandomMatches(userId, 10);
    }

    const matches = Array.from(this.userDatabase.entries())
      .filter(
        ([id, user]) =>
          id !== userId &&
          user.preferences.favoriteCategories.some(cat =>
            categories.includes(cat)
          )
      )
      .slice(0, 15);

    return matches.map(([id, user]) => {
      const commonCategories = user.preferences.favoriteCategories.filter(cat =>
        categories.includes(cat)
      );
      return {
        userId: id,
        similarityScore: 0.4 + commonCategories.length * 0.1,
        matchingFeatures: [`共同偏好类别: ${commonCategories.join(', ')}`],
        confidence: 0.5 + commonCategories.length * 0.1,
      };
    });
  }

  private async getLocationBasedMatches(
    userId: string,
    location?: string
  ): Promise<SimilarityResult[]> {
    if (!location) {
      return this.getRandomMatches(userId, 10);
    }

    const matches = Array.from(this.userDatabase.entries())
      .filter(
        ([id, user]) => id !== userId && user.demographics.location === location
      )
      .slice(0, 15);

    return matches.map(([id]) => ({
      userId: id,
      similarityScore: 0.6,
      matchingFeatures: [`地理位置相同: ${location}`],
      confidence: 0.7,
    }));
  }

  private async getRandomMatches(
    userId: string,
    limit: number
  ): Promise<SimilarityResult[]> {
    const allUsers = Array.from(this.userDatabase.keys()).filter(
      id => id !== userId
    );

    const randomUsers = this.shuffleArray(allUsers).slice(0, limit);

    return randomUsers.map(id => ({
      userId: id,
      similarityScore: 0.3,
      matchingFeatures: ['随机推荐'],
      confidence: 0.4,
    }));
  }

  // 数组随机打乱
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 缓存管理
  private invalidateCache(userId: string): void {
    this.similarityCache.delete(userId);
    // 清除涉及该用户的所有缓?    for (const [key, cache] of this.similarityCache.entries()) {
      cache.delete(userId);
    }
  }

  // 获取系统状?  getSystemStats(): {
    totalUsers: number;
    config: QuickMatchConfig;
    cacheSize: number;
  } {
    return {
      totalUsers: this.userDatabase.size,
      config: { ...this.config },
      cacheSize: this.similarityCache.size,
    };
  }
}

// 预定义的快速匹配配?export class QuickMatchPresets {
  static getColdStartOptimized(): QuickMatchConfig {
    return {
      coldStartThreshold: 3,
      similarityMethod: 'cosine',
      maxCandidates: 50,
      minSimilarity: 0.2,
      featureWeights: {
        demographics: 0.3,
        behavior: 0.2,
        preferences: 0.3,
        context: 0.2,
      },
      fallbackStrategies: ['category', 'location', 'popular'],
    };
  }

  static getPerformanceOptimized(): QuickMatchConfig {
    return {
      coldStartThreshold: 10,
      similarityMethod: 'cosine',
      maxCandidates: 200,
      minSimilarity: 0.4,
      featureWeights: {
        demographics: 0.2,
        behavior: 0.4,
        preferences: 0.25,
        context: 0.15,
      },
      fallbackStrategies: ['popular', 'category'],
    };
  }

  static getAccuracyOptimized(): QuickMatchConfig {
    return {
      coldStartThreshold: 15,
      similarityMethod: 'pearson',
      maxCandidates: 300,
      minSimilarity: 0.5,
      featureWeights: {
        demographics: 0.25,
        behavior: 0.35,
        preferences: 0.25,
        context: 0.15,
      },
      fallbackStrategies: ['category', 'location', 'popular'],
    };
  }
}
