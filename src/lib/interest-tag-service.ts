// 兴趣标签服务 - 提供兴趣标签的管理、查询和应用接口

import {
  InterestTagExtractor,
  UserInterestProfile,
  InterestTag,
  BehaviorData,
} from './interest-tag-extractor';

export interface TagQueryOptions {
  userId?: string;
  category?: string;
  minWeight?: number;
  minConfidence?: number;
  limit?: number;
  sortBy?: 'weight' | 'confidence' | 'recency';
}

export interface SimilarUsersResult {
  userId: string;
  similarityScore: number;
  commonTags: string[];
  interestOverlap: number;
}

export interface InterestInsights {
  trendingTags: InterestTag[];
  decliningTags: InterestTag[];
  emergingInterests: string[];
  interestClusters: InterestCluster[];
}

export interface InterestCluster {
  clusterId: string;
  tags: string[];
  userCount: number;
  representativeUsers: string[];
  description: string;
}

export class InterestTagService {
  private extractor: InterestTagExtractor;
  private userProfiles: Map<string, UserInterestProfile>;
  private tagIndex: Map<string, Set<string>>; // tagId -> userIds

  constructor() {
    this.extractor = new InterestTagExtractor();
    this.userProfiles = new Map();
    this.tagIndex = new Map();
  }

  // 为用户提取和更新兴趣标签
  async extractUserInterests(
    userId: string,
    behaviorData: BehaviorData[]
  ): Promise<UserInterestProfile> {
    const profile = this.extractor.extractInterestTags(userId, behaviorData);

    // 更新内存中的用户档案
    this.userProfiles.set(userId, profile);

    // 更新标签索引
    this.updateTagIndex(userId, profile.tags);

    // 这里应该保存到数据库
    await this.saveUserProfile(profile);

    return profile;
  }

  // 批量处理多个用户的兴趣标?  async batchExtractInterests(
    userBehaviors: Record<string, BehaviorData[]>
  ): Promise<Record<string, UserInterestProfile>> {
    const results: Record<string, UserInterestProfile> = {};

    for (const [userId, behaviors] of Object.entries(userBehaviors)) {
      try {
        const profile = await this.extractUserInterests(userId, behaviors);
        results[userId] = profile;
      } catch (error) {
        console.error(`处理用户 ${userId} 的兴趣标签时出错:`, error);
      }
    }

    return results;
  }

  // 查询兴趣标签
  queryTags(options: TagQueryOptions): InterestTag[] {
    let allTags: InterestTag[] = [];

    // 如果指定了用户，只查询该用户的标?    if (options.userId) {
      const profile = this.userProfiles.get(options.userId);
      if (profile) {
        allTags = [...profile.tags];
      }
    } else {
      // 查询所有用户的标签
      for (const profile of this.userProfiles.values()) {
        allTags.push(...profile.tags);
      }
    }

    // 应用过滤条件
    let filteredTags = allTags.filter(tag => {
      if (options.category && tag.category !== options.category) return false;
      if (options.minWeight && tag.weight < options.minWeight) return false;
      if (options.minConfidence && tag.confidence < options.minConfidence)
        return false;
      return true;
    });

    // 排序
    switch (options.sortBy) {
      case 'weight':
        filteredTags.sort((a, b) => b.weight - a.weight);
        break;
      case 'confidence':
        filteredTags.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'recency':
        filteredTags.sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
        );
        break;
      default:
        filteredTags.sort((a, b) => b.weight - a.weight);
    }

    // 限制返回数量
    if (options.limit) {
      filteredTags = filteredTags.slice(0, options.limit);
    }

    return filteredTags;
  }

  // 查找兴趣相似的用?  findSimilarUsers(
    targetUserId: string,
    maxResults: number = 10
  ): SimilarUsersResult[] {
    const targetProfile = this.userProfiles.get(targetUserId);
    if (!targetProfile) return [];

    const similarities: SimilarUsersResult[] = [];

    for (const [userId, profile] of this.userProfiles.entries()) {
      if (userId === targetUserId) continue;

      const similarityScore = this.extractor.calculateInterestSimilarity(
        targetProfile,
        profile
      );

      if (similarityScore > 0.1) {
        // 最小相似度阈?        const commonTags = this.getCommonTags(targetProfile, profile);

        similarities.push({
          userId,
          similarityScore,
          commonTags,
          interestOverlap:
            commonTags.length /
            Math.max(targetProfile.tags.length, profile.tags.length),
        });
      }
    }

    // 按相似度排序并限制结?    return similarities
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxResults);
  }

  // 获取兴趣洞察
  getInterestInsights(days: number = 7): InterestInsights {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.toISOString();

    // 获取近期更新的标?    const recentTags: InterestTag[] = [];
    const tagChanges: Record<string, { oldWeight: number; newWeight: number }> =
      {};

    for (const profile of this.userProfiles.values()) {
      profile.tags.forEach(tag => {
        if (tag.lastUpdated >= cutoffTime) {
          recentTags.push(tag);
        }
      });

      // 分析变化趋势
      profile.interestHistory.forEach(entry => {
        if (
          entry.timestamp >= cutoffTime &&
          entry.oldValue !== undefined &&
          entry.newValue !== undefined
        ) {
          if (!tagChanges[entry.tagId]) {
            tagChanges[entry.tagId] = {
              oldWeight: entry.oldValue,
              newWeight: entry.newValue,
            };
          } else {
            tagChanges[entry.tagId].newWeight = entry.newValue;
          }
        }
      });
    }

    // 识别趋势标签
    const trendingTags = recentTags
      .filter(
        tag =>
          tagChanges[tag.tagId] &&
          tagChanges[tag.tagId].newWeight > tagChanges[tag.tagId].oldWeight
      )
      .sort(
        (a, b) =>
          tagChanges[b.tagId].newWeight -
          tagChanges[b.tagId].oldWeight -
          (tagChanges[a.tagId].newWeight - tagChanges[a.tagId].oldWeight)
      )
      .slice(0, 10);

    const decliningTags = recentTags
      .filter(
        tag =>
          tagChanges[tag.tagId] &&
          tagChanges[tag.tagId].newWeight < tagChanges[tag.tagId].oldWeight
      )
      .sort(
        (a, b) =>
          tagChanges[a.tagId].oldWeight -
          tagChanges[a.tagId].newWeight -
          (tagChanges[b.tagId].oldWeight - tagChanges[b.tagId].newWeight)
      )
      .slice(0, 10);

    // 识别新兴兴趣
    const emergingInterests = recentTags
      .filter(
        tag =>
          tag.source === 'behavior' && tag.confidence > 0.7 && tag.weight > 0.5
      )
      .map(tag => tag.tagName)
      .filter((tagName, index, self) => self.indexOf(tagName) === index) // 去重
      .slice(0, 5);

    // 生成兴趣聚类
    const interestClusters = this.generateInterestClusters();

    return {
      trendingTags,
      decliningTags,
      emergingInterests,
      interestClusters,
    };
  }

  // 为用户推荐相关内?  recommendContentForUser(
    userId: string,
    contentPool: any[],
    maxRecommendations: number = 10
  ): any[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    // 基于用户兴趣标签匹配内容
    const scoredContent = contentPool.map(content => {
      const matchScore = this.calculateContentMatchScore(profile, content);
      return { content, score: matchScore };
    });

    // 按匹配分数排序并返回推荐
    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
      .map(item => item.content);
  }

  // 获取用户档案
  getUserProfile(userId: string): UserInterestProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // 获取标签使用统计
  getTagStatistics(): {
    totalTags: number;
    tagsByCategory: Record<string, number>;
    averageWeight: number;
    mostPopularTags: InterestTag[];
  } {
    const allTags: InterestTag[] = [];
    const categoryCounts: Record<string, number> = {};
    let totalWeight = 0;

    for (const profile of this.userProfiles.values()) {
      allTags.push(...profile.tags);
      profile.tags.forEach(tag => {
        categoryCounts[tag.category] = (categoryCounts[tag.category] || 0) + 1;
        totalWeight += tag.weight;
      });
    }

    const averageWeight = allTags.length > 0 ? totalWeight / allTags.length : 0;

    const mostPopularTags = [...allTags]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20);

    return {
      totalTags: allTags.length,
      tagsByCategory: categoryCounts,
      averageWeight,
      mostPopularTags,
    };
  }

  // 私有方法
  private updateTagIndex(userId: string, tags: InterestTag[]): void {
    // 从旧索引中移除用?    for (const [tagId, userIds] of this.tagIndex.entries()) {
      userIds.delete(userId);
    }

    // 添加新索?    tags.forEach(tag => {
      if (!this.tagIndex.has(tag.tagId)) {
        this.tagIndex.set(tag.tagId, new Set());
      }
      this.tagIndex.get(tag.tagId)!.add(userId);
    });
  }

  private async saveUserProfile(profile: UserInterestProfile): Promise<void> {
    // 这里应该实现数据库保存逻辑
    // 示例：await database.save('user_interest_profiles', profile);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`保存用户 ${profile.userId} 的兴趣档案`)}

  private getCommonTags(
    profile1: UserInterestProfile,
    profile2: UserInterestProfile
  ): string[] {
    const tags1 = new Set(profile1.tags.map(t => t.tagId));
    const tags2 = new Set(profile2.tags.map(t => t.tagId));

    return [...tags1]
      .filter(tagId => tags2.has(tagId))
      .map(tagId => profile1.tags.find(t => t.tagId === tagId)?.tagName || '');
  }

  private calculateContentMatchScore(
    profile: UserInterestProfile,
    content: any
  ): number {
    let score = 0;

    // 基于标签匹配计算分数
    profile.tags.forEach(tag => {
      if (this.contentMatchesTag(content, tag)) {
        score += tag.weight * tag.confidence;
      }
    });

    return score;
  }

  private contentMatchesTag(content: any, tag: InterestTag): boolean {
    // 这里应该实现具体的内容标签匹配逻辑
    // 示例实现?    const contentText =
      `${content.title || ''} ${content.description || ''} ${content.tags || ''}`.toLowerCase();
    return contentText.includes(tag.tagName.toLowerCase());
  }

  private generateInterestClusters(): InterestCluster[] {
    // 简单的聚类实现 - 基于共同标签
    const clusters: InterestCluster[] = [];
    const processedUsers = new Set<string>();

    for (const [userId, profile] of this.userProfiles.entries()) {
      if (processedUsers.has(userId)) continue;

      // 找到具有相似兴趣的用?      const similarUsers = this.findSimilarUsers(userId, 20)
        .filter(result => result.similarityScore > 0.4)
        .map(result => result.userId);

      if (similarUsers.length >= 2) {
        // 创建聚类
        const clusterUsers = [userId, ...similarUsers];
        const commonTags = this.findCommonTagsInCluster(clusterUsers);

        clusters.push({
          clusterId: `cluster_${clusters.length + 1}`,
          tags: commonTags.slice(0, 5),
          userCount: clusterUsers.length,
          representativeUsers: clusterUsers.slice(0, 3),
          description: `兴趣聚类?{commonTags.slice(0, 3).join(', ')}`,
        });

        clusterUsers.forEach(u => processedUsers.add(u));
      }
    }

    return clusters;
  }

  private findCommonTagsInCluster(userIds: string[]): string[] {
    if (userIds.length === 0) return [];

    const firstProfile = this.userProfiles.get(userIds[0]);
    if (!firstProfile) return [];

    let commonTags = new Set(firstProfile.tags.map(t => t.tagName));

    for (let i = 1; i < userIds.length; i++) {
      const profile = this.userProfiles.get(userIds[i]);
      if (profile) {
        const profileTags = new Set(profile.tags.map(t => t.tagName));
        commonTags = new Set(
          [...commonTags].filter(tag => profileTags.has(tag))
        );
      }
    }

    return [...commonTags];
  }
}
