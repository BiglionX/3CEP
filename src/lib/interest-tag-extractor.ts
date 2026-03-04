// 用户兴趣标签提取系统

export interface InterestTag {
  tagId: string;
  tagName: string;
  category: string;
  weight: number; // 0-1 权重分数
  confidence: number; // 0-1 置信?  source: 'behavior' | 'content' | 'explicit' | 'inferred';
  lastUpdated: string;
}

export interface UserInterestProfile {
  userId: string;
  tags: InterestTag[];
  primaryInterests: string[]; // 主要兴趣标签
  interestStrength: Record<string, number>; // 兴趣强度映射
  interestHistory: InterestHistoryEntry[];
  profileQuality: number; // 0-1 档案质量分数
  lastAnalyzed: string;
}

export interface InterestHistoryEntry {
  timestamp: string;
  action: 'added' | 'removed' | 'updated' | 'decayed';
  tagId: string;
  oldValue?: number;
  newValue?: number;
  reason: string;
}

export interface BehaviorData {
  userId: string;
  eventType: string;
  timestamp: string;
  pageName?: string;
  featureName?: string;
  category?: string;
  duration?: number;
  value?: any;
}

export class InterestTagExtractor {
  private readonly CATEGORY_WEIGHTS: Record<string, number> = {
    page_view: 0.3,
    click: 0.4,
    search: 0.8,
    form_submit: 0.6,
    feature_use: 0.7,
    content_interaction: 0.5,
  };

  private readonly DECAY_FACTOR = 0.95; // 时间衰减因子
  private readonly MIN_CONFIDENCE = 0.3; // 最小置信度阈?
  // 从用户行为数据提取兴趣标?  extractInterestTags(
    userId: string,
    behaviorData: BehaviorData[]
  ): UserInterestProfile {
    // 1. 按时间窗口分组行为数?    const recentBehaviors = this.filterRecentBehaviors(behaviorData, 30); // 30�?
    // 2. 提取不同类型的兴趣信?    const pageViewTags = this.extractFromPageViews(recentBehaviors);
    const clickTags = this.extractFromClicks(recentBehaviors);
    const searchTags = this.extractFromSearches(recentBehaviors);
    const featureTags = this.extractFromFeatureUsage(recentBehaviors);

    // 3. 合并和加权所有标?    const allTags = this.mergeAndWeightTags([
      pageViewTags,
      clickTags,
      searchTags,
      featureTags,
    ]);

    // 4. 应用时间衰减
    const decayedTags = this.applyTimeDecay(allTags, behaviorData);

    // 5. 过滤低置信度标签
    const filteredTags = this.filterLowConfidenceTags(decayedTags);

    // 6. 生成用户兴趣档案
    const interestProfile = this.buildInterestProfile(
      userId,
      filteredTags,
      behaviorData
    );

    return interestProfile;
  }

  // 更新现有兴趣档案
  updateInterestProfile(
    profile: UserInterestProfile,
    newBehaviors: BehaviorData[]
  ): UserInterestProfile {
    // 将新行为合并到历史数据中
    const allBehaviors = [...newBehaviors]; // 这里应该从数据库获取历史行为

    // 重新提取兴趣标签
    const updatedProfile = this.extractInterestTags(
      profile.userId,
      allBehaviors
    );

    // 合并历史记录
    updatedProfile.interestHistory = [
      ...profile.interestHistory,
      ...updatedProfile.interestHistory,
    ].slice(-100); // 保留最?00条记?
    return updatedProfile;
  }

  // 获取用户的主要兴?  getPrimaryInterests(
    profile: UserInterestProfile,
    topN: number = 5
  ): InterestTag[] {
    return profile.tags.sort((a, b) => b.weight - a.weight).slice(0, topN);
  }

  // 计算两个用户兴趣的相似度
  calculateInterestSimilarity(
    profile1: UserInterestProfile,
    profile2: UserInterestProfile
  ): number {
    const tags1 = new Set(profile1.tags.map(t => t.tagId));
    const tags2 = new Set(profile2.tags.map(t => t.tagId));

    const intersection = new Set([...tags1].filter(x => tags2.has(x)));
    const union = new Set([...tags1, ...tags2]);

    if (union.size === 0) return 0;

    // Jaccard相似?    return intersection.size / union.size;
  }

  // 私有方法：过滤近期行为数?  private filterRecentBehaviors(
    behaviors: BehaviorData[],
    days: number
  ): BehaviorData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.toISOString();

    return behaviors.filter(b => b.timestamp >= cutoffTime);
  }

  // 从页面浏览行为提取兴趣标?  private extractFromPageViews(behaviors: BehaviorData[]): InterestTag[] {
    const pageViews = behaviors.filter(b => b.eventType === 'page_view');

    // 统计页面访问频率
    const pageCounts: Record<
      string,
      { count: number; totalTime: number; lastVisit: string }
    > = {};

    pageViews.forEach(view => {
      const pageKey = this.normalizePageName(view.pageName || 'unknown');
      if (!pageCounts[pageKey]) {
        pageCounts[pageKey] = { count: 0, totalTime: 0, lastVisit: '' };
      }

      pageCounts[pageKey].count++;
      pageCounts[pageKey].totalTime += view.duration || 0;
      if (view.timestamp > pageCounts[pageKey].lastVisit) {
        pageCounts[pageKey].lastVisit = view.timestamp;
      }
    });

    // 转换为兴趣标?    return Object.entries(pageCounts).map(([pageName, data]) => {
      const baseWeight = Math.min(data.count * 0.1, 0.8); // 访问次数权重
      const timeWeight = Math.min(data.totalTime / 3600, 0.5); // 时间权重（小时）
      const recencyWeight = this.calculateRecencyWeight(data.lastVisit);

      return {
        tagId: `page_${this.slugify(pageName)}`,
        tagName: pageName,
        category: 'page_view',
        weight: (baseWeight + timeWeight) * recencyWeight,
        confidence: Math.min(baseWeight + 0.2, 1),
        source: 'behavior',
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // 从点击行为提取兴趣标?  private extractFromClicks(behaviors: BehaviorData[]): InterestTag[] {
    const clicks = behaviors.filter(b => b.eventType === 'click');

    const elementCounts: Record<string, { count: number; lastClick: string }> =
      {};

    clicks.forEach(click => {
      const elementKey = this.extractElementCategory(
        click.featureName || 'unknown_element'
      );
      if (!elementCounts[elementKey]) {
        elementCounts[elementKey] = { count: 0, lastClick: '' };
      }

      elementCounts[elementKey].count++;
      if (click.timestamp > elementCounts[elementKey].lastClick) {
        elementCounts[elementKey].lastClick = click.timestamp;
      }
    });

    return Object.entries(elementCounts).map(([elementName, data]) => {
      const weight = Math.min(data.count * 0.05, 0.6);
      const recencyWeight = this.calculateRecencyWeight(data.lastClick);

      return {
        tagId: `click_${this.slugify(elementName)}`,
        tagName: elementName,
        category: 'interaction',
        weight: weight * recencyWeight,
        confidence: Math.min(weight + 0.1, 1),
        source: 'behavior',
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // 从搜索行为提取兴趣标?  private extractFromSearches(behaviors: BehaviorData[]): InterestTag[] {
    const searches = behaviors.filter(b => b.eventType === 'search');

    const searchTerms: Record<string, { count: number; lastSearch: string }> =
      {};

    searches.forEach(search => {
      const query = (search?.query || '').toLowerCase().trim();
      if (!query) return;

      // 分词处理
      const terms = this.tokenizeSearchQuery(query);
      terms.forEach(term => {
        if (term.length < 2) return; // 过滤太短的词

        if (!searchTerms[term]) {
          searchTerms[term] = { count: 0, lastSearch: '' };
        }

        searchTerms[term].count++;
        if (search.timestamp > searchTerms[term].lastSearch) {
          searchTerms[term].lastSearch = search.timestamp;
        }
      });
    });

    return Object.entries(searchTerms).map(([term, data]) => {
      const weight = Math.min(data.count * 0.15, 0.9);
      const recencyWeight = this.calculateRecencyWeight(data.lastSearch);

      return {
        tagId: `search_${this.slugify(term)}`,
        tagName: term,
        category: 'search',
        weight: weight * recencyWeight,
        confidence: Math.min(weight + 0.3, 1),
        source: 'behavior',
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // 从功能使用提取兴趣标?  private extractFromFeatureUsage(behaviors: BehaviorData[]): InterestTag[] {
    const features = behaviors.filter(b => b.eventType === 'feature_use');

    const featureCounts: Record<
      string,
      { count: number; totalTime: number; lastUse: string }
    > = {};

    features.forEach(feature => {
      const featureKey = feature.featureName || 'unknown_feature';
      if (!featureCounts[featureKey]) {
        featureCounts[featureKey] = { count: 0, totalTime: 0, lastUse: '' };
      }

      featureCounts[featureKey].count++;
      featureCounts[featureKey].totalTime += feature.duration || 0;
      if (feature.timestamp > featureCounts[featureKey].lastUse) {
        featureCounts[featureKey].lastUse = feature.timestamp;
      }
    });

    return Object.entries(featureCounts).map(([featureName, data]) => {
      const usageWeight = Math.min(data.count * 0.1, 0.7);
      const timeWeight = Math.min(data.totalTime / 1800, 0.4); // 30分钟基准
      const recencyWeight = this.calculateRecencyWeight(data.lastUse);

      return {
        tagId: `feature_${this.slugify(featureName)}`,
        tagName: featureName,
        category: 'feature',
        weight: (usageWeight + timeWeight) * recencyWeight,
        confidence: Math.min(usageWeight + 0.25, 1),
        source: 'behavior',
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  // 合并和加权标?  private mergeAndWeightTags(tagGroups: InterestTag[][]): InterestTag[] {
    const tagMap: Record<string, InterestTag> = {};

    tagGroups.flat().forEach(tag => {
      if (!tagMap[tag.tagId]) {
        tagMap[tag.tagId] = { ...tag };
      } else {
        // 合并相同标签
        const existing = tagMap[tag.tagId];
        const categoryWeight = this.CATEGORY_WEIGHTS[tag.category] || 0.5;

        existing.weight = Math.min(
          existing.weight + tag.weight * categoryWeight,
          1
        );
        existing.confidence = Math.min(
          (existing.confidence + tag.confidence) / 2,
          1
        );
        existing.lastUpdated = tag.lastUpdated;
      }
    });

    return Object.values(tagMap);
  }

  // 应用时间衰减
  private applyTimeDecay(
    tags: InterestTag[],
    allBehaviors: BehaviorData[]
  ): InterestTag[] {
    const latestBehavior = allBehaviors.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    if (!latestBehavior) return tags;

    const latestTime = new Date(latestBehavior.timestamp).getTime();

    return tags.map(tag => {
      const tagTime = new Date(tag.lastUpdated).getTime();
      const timeDiffDays = (latestTime - tagTime) / (1000 * 60 * 60 * 24);

      // 指数衰减
      const decayMultiplier = Math.pow(this.DECAY_FACTOR, timeDiffDays);
      const decayedWeight = tag.weight * decayMultiplier;

      return {
        ...tag,
        weight: Math.max(decayedWeight, 0.01), // 保持最小权?      };
    });
  }

  // 过滤低置信度标签
  private filterLowConfidenceTags(tags: InterestTag[]): InterestTag[] {
    return tags.filter(tag => tag.confidence >= this.MIN_CONFIDENCE);
  }

  // 构建用户兴趣档案
  private buildInterestProfile(
    userId: string,
    tags: InterestTag[],
    allBehaviors: BehaviorData[]
  ): UserInterestProfile {
    // 提取主要兴趣（权重最高的标签?    const primaryInterests = tags
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8)
      .map(tag => tag.tagName);

    // 构建兴趣强度映射
    const interestStrength: Record<string, number> = {};
    tags.forEach(tag => {
      interestStrength[tag.tagName] = tag.weight;
    });

    // 生成兴趣历史记录
    const interestHistory: InterestHistoryEntry[] = tags.map(tag => ({
      timestamp: tag.lastUpdated,
      action: 'added',
      tagId: tag.tagId,
      newValue: tag.weight,
      reason: `基于${tag.category}行为提取`,
    }));

    // 计算档案质量分数
    const profileQuality = this.calculateProfileQuality(tags, allBehaviors);

    return {
      userId,
      tags,
      primaryInterests,
      interestStrength,
      interestHistory,
      profileQuality,
      lastAnalyzed: new Date().toISOString(),
    };
  }

  // 计算档案质量
  private calculateProfileQuality(
    tags: InterestTag[],
    behaviors: BehaviorData[]
  ): number {
    if (behaviors.length === 0) return 0;

    const uniqueCategories = new Set(tags.map(t => t.category)).size;
    const avgConfidence =
      tags.reduce((sum, tag) => sum + tag.confidence, 0) / tags.length;
    const behaviorCoverage = Math.min(behaviors.length / 20, 1); // 20个行为为满分

    // 综合质量分数
    return (
      uniqueCategories * 0.3 + avgConfidence * 0.4 + behaviorCoverage * 0.3
    );
  }

  // 辅助方法
  private normalizePageName(pageName: string): string {
    return pageName
      .replace(/^\/|\/$/g, '') // 移除首尾斜杠
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // 首字母大?  }

  private extractElementCategory(elementName: string): string {
    const mappings: Record<string, string> = {
      login: '账户管理',
      register: '账户管理',
      search: '搜索功能',
      filter: '筛选功?,
      sort: '排序功能',
      export: '数据导出',
      import: '数据导入',
      setting: '系统设置',
      profile: '个人资料',
      notification: '消息通知',
    };

    for (const [key, category] of Object.entries(mappings)) {
      if (elementName.toLowerCase().includes(key)) {
        return category;
      }
    }

    return '通用交互';
  }

  private tokenizeSearchQuery(query: string): string[] {
    // 简单的中文分词（实际应用中应使用专业分词库?    return query.split(/[\s\-_,，。；;]+/).filter(term => term.length > 0);
  }

  private calculateRecencyWeight(timestamp: string): number {
    const timeDiff =
      (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
    // 最?天权重为1，之后线性递减
    return Math.max(0, 1 - timeDiff / 7);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }
}
