// 用户行为分析核心算法模块

export interface BehaviorAnalysisResult {
  userId: string;
  analysisPeriod: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    visitFrequency: VisitFrequencyMetrics;
    featureUsage: FeatureUsageMetrics;
    activePatterns: ActivePatternMetrics;
    engagementScore: number;
  };
}

export interface VisitFrequencyMetrics {
  totalVisits: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  peakVisitDay: string;
  visitConsistency: number; // 0-1 一致性分?}

export interface FeatureUsageMetrics {
  mostUsedFeatures: FeatureUsage[];
  featureCategories: FeatureCategoryUsage[];
  usageDistribution: Record<string, number>;
  adoptionRate: number;
}

export interface FeatureUsage {
  featureName: string;
  usageCount: number;
  totalTimeSpent: number;
  lastUsed: string;
}

export interface FeatureCategoryUsage {
  category: string;
  usageCount: number;
  percentage: number;
}

export interface ActivePatternMetrics {
  mostActiveHours: number[];
  mostActiveDays: string[];
  sessionDuration: SessionDurationMetrics;
  activityHeatmap: ActivityHeatmap;
}

export interface SessionDurationMetrics {
  averageSession: number; // 分钟
  medianSession: number; // 分钟
  longestSession: number; // 分钟
  shortestSession: number; // 分钟
}

export interface ActivityHeatmap {
  hourly: number[][]; // 7�?× 24小时的活跃度矩阵
  daily: number[]; // 一周每天的活跃?}

export interface UserSegment {
  segmentId: string;
  segmentName: string;
  criteria: string;
  userCount: number;
  characteristics: string[];
}

// 行为分析服务?export class BehaviorAnalyzer {
  private behaviorData: any[];

  constructor(behaviorData: any[]) {
    this.behaviorData = behaviorData;
  }

  // 分析访问频率
  analyzeVisitFrequency(
    userId: string,
    startDate: string,
    endDate: string
  ): VisitFrequencyMetrics {
    const userBehaviors = this.behaviorData.filter(
      b =>
        b.user_id === userId &&
        b.timestamp >= startDate &&
        b.timestamp <= endDate &&
        b.behavior_type === 'page_view'
    );

    const visitDates = [
      ...new Set(userBehaviors.map(b => b.timestamp.split('T')[0])),
    ].sort();
    const totalVisits = visitDates.length;

    const periodDays = this.calculatePeriodDays(startDate, endDate);
    const dailyAverage = totalVisits / periodDays;

    const weeklyAverage = (totalVisits / periodDays) * 7;
    const monthlyAverage = (totalVisits / periodDays) * 30;

    // 计算访问一致性（基于访问间隔的标准差?    const visitConsistency = this.calculateVisitConsistency(visitDates);

    // 找出访问最多的日期
    const dateCounts: Record<string, number> = {};
    visitDates.forEach(date => {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const peakVisitDay =
      Object.entries(dateCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalVisits,
      dailyAverage,
      weeklyAverage,
      monthlyAverage,
      peakVisitDay,
      visitConsistency,
    };
  }

  // 分析功能使用情况
  analyzeFeatureUsage(
    userId: string,
    startDate: string,
    endDate: string
  ): FeatureUsageMetrics {
    const userBehaviors = this.behaviorData.filter(
      b =>
        b.user_id === userId &&
        b.timestamp >= startDate &&
        b.timestamp <= endDate &&
        ['feature_use', 'click_event', 'form_submit'].includes(b.behavior_type)
    );

    // 统计各功能使用次?    const featureCounts: Record<string, number> = {};
    const featureTimes: Record<string, number> = {};
    const featureLastUsed: Record<string, string> = {};

    userBehaviors.forEach(behavior => {
      const feature =
        behavior.feature_name || behavior.action_detail || 'unknown_feature';
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;

      if (behavior.duration_ms) {
        featureTimes[feature] =
          (featureTimes[feature] || 0) + behavior.duration_ms;
      }

      if (
        !featureLastUsed[feature] ||
        behavior.timestamp > featureLastUsed[feature]
      ) {
        featureLastUsed[feature] = behavior.timestamp;
      }
    });

    // 转换为数组并排序
    const mostUsedFeatures: FeatureUsage[] = Object.entries(featureCounts)
      .map(([featureName, usageCount]) => ({
        featureName,
        usageCount,
        totalTimeSpent: (featureTimes[featureName] || 0) / 1000, // 转换为秒
        lastUsed: featureLastUsed[featureName] || '',
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    // 按类别分组（简化示例）
    const categoryMapping: Record<string, string> = {
      user_management: '用户管理',
      content_review: '内容审核',
      shop_review: '店铺审核',
      statistics: '数据统计',
      settings: '系统设置',
    };

    const categoryUsage: Record<string, number> = {};
    Object.keys(featureCounts).forEach(feature => {
      const category = this.categorizeFeature(feature);
      categoryUsage[category] =
        (categoryUsage[category] || 0) + featureCounts[feature];
    });

    const featureCategories: FeatureCategoryUsage[] = Object.entries(
      categoryUsage
    )
      .map(([category, usageCount]) => ({
        category: categoryMapping[category] || category,
        usageCount,
        percentage:
          (usageCount /
            Object.values(featureCounts).reduce((a, b) => a + b, 0)) *
          100,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    // 使用分布
    const totalActions = Object.values(featureCounts).reduce(
      (a, b) => a + b,
      0
    );
    const usageDistribution = Object.fromEntries(
      Object.entries(featureCounts).map(([feature, count]) => [
        feature,
        Number(((count / totalActions) * 100).toFixed(2)),
      ])
    );

    // 功能采用率（使用过的功能占总功能的比例?    const totalAvailableFeatures = 20; // 假设?0个主要功?    const adoptionRate = Math.min(
      (Object.keys(featureCounts).length / totalAvailableFeatures) * 100,
      100
    );

    return {
      mostUsedFeatures,
      featureCategories,
      usageDistribution,
      adoptionRate,
    };
  }

  // 分析活跃模式
  analyzeActivePatterns(
    userId: string,
    startDate: string,
    endDate: string
  ): ActivePatternMetrics {
    const userBehaviors = this.behaviorData.filter(
      b =>
        b.user_id === userId &&
        b.timestamp >= startDate &&
        b.timestamp <= endDate
    );

    // 分析最活跃时段
    const hourCounts: number[] = new Array(24).fill(0);
    const dayCounts: Record<string, number> = {};

    userBehaviors.forEach(behavior => {
      const date = new Date(behavior.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString('zh-CN', { weekday: 'long' });

      hourCounts[hour]++;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    // 找出最活跃的几个小时（�?个）
    const hourEntries = hourCounts.map((count, hour) => ({ hour, count }));
    const mostActiveHours = hourEntries
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.hour);

    // 找出最活跃的几?    const mostActiveDays = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    // 会话时长分析
    const sessionDurations = this.calculateSessionDurations(userBehaviors);
    const sessionDuration: SessionDurationMetrics = {
      averageSession: sessionDurations.average,
      medianSession: sessionDurations.median,
      longestSession: sessionDurations.max,
      shortestSession: sessionDurations.min,
    };

    // 活跃热力?    const activityHeatmap = this.generateActivityHeatmap(userBehaviors);

    return {
      mostActiveHours,
      mostActiveDays,
      sessionDuration,
      activityHeatmap,
    };
  }

  // 计算综合参与度分?  calculateEngagementScore(
    visitFrequency: VisitFrequencyMetrics,
    featureUsage: FeatureUsageMetrics,
    activePatterns: ActivePatternMetrics
  ): number {
    // 访问频率权重 30%
    const frequencyScore = Math.min(visitFrequency.dailyAverage * 10, 30);

    // 功能使用权重 40%
    const usageScore = Math.min(featureUsage.adoptionRate * 0.4, 40);

    // 活跃模式权重 30%
    const consistencyScore =
      activePatterns.sessionDuration.averageSession > 0
        ? Math.min(
            (activePatterns.sessionDuration.averageSession / 60) * 10,
            30
          )
        : 0;

    const totalScore = frequencyScore + usageScore + consistencyScore;
    return Math.round(Math.min(totalScore, 100));
  }

  // 私有辅助方法
  private calculatePeriodDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  private calculateVisitConsistency(visitDates: string[]): number {
    if (visitDates.length <= 1) return visitDates.length > 0 ? 1 : 0;

    const intervals: number[] = [];
    for (let i = 1; i < visitDates.length; i++) {
      const prev = new Date(visitDates[i - 1]);
      const curr = new Date(visitDates[i]);
      const interval =
        Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
        0
      ) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // 一致性分数：标准差越小，一致性越?    return Math.max(0, Math.min(1, 1 - stdDev / 7));
  }

  private categorizeFeature(featureName: string): string {
    const mappings: Record<string, string> = {
      user_list: 'user_management',
      user_detail: 'user_management',
      user_edit: 'user_management',
      content_list: 'content_review',
      content_review: 'content_review',
      shop_list: 'shop_review',
      shop_review: 'shop_review',
      stats_dashboard: 'statistics',
      system_settings: 'settings',
    };

    return mappings[featureName] || 'other';
  }

  private calculateSessionDurations(behaviors: any[]): {
    average: number;
    median: number;
    max: number;
    min: number;
  } {
    if (behaviors.length === 0) {
      return { average: 0, median: 0, max: 0, min: 0 };
    }

    // 简化的会话计算：假设有30分钟不活动就算新会话
    const sortedBehaviors = behaviors.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const sessions: number[] = [];
    let currentSessionStart = new Date(sortedBehaviors[0].timestamp).getTime();

    for (let i = 1; i < sortedBehaviors.length; i++) {
      const currentTime = new Date(sortedBehaviors[i].timestamp).getTime();
      const prevTime = new Date(sortedBehaviors[i - 1].timestamp).getTime();

      if (currentTime - prevTime > 30 * 60 * 1000) {
        // 30分钟间隔
        sessions.push((prevTime - currentSessionStart) / (1000 * 60)); // 转换为分?        currentSessionStart = currentTime;
      }
    }

    // 添加最后一个会?    const lastTime = new Date(
      sortedBehaviors[sortedBehaviors.length - 1].timestamp
    ).getTime();
    sessions.push((lastTime - currentSessionStart) / (1000 * 60));

    const validSessions = sessions.filter(s => s > 0);
    if (validSessions.length === 0) {
      return { average: 0, median: 0, max: 0, min: 0 };
    }

    const average =
      validSessions.reduce((a, b) => a + b, 0) / validSessions.length;
    const sortedSessions = [...validSessions].sort((a, b) => a - b);
    const median = sortedSessions[Math.floor(sortedSessions.length / 2)];
    const max = Math.max(...validSessions);
    const min = Math.min(...validSessions);

    return { average, median, max, min };
  }

  private generateActivityHeatmap(behaviors: any[]): ActivityHeatmap {
    const hourlyMatrix: number[][] = Array(7)
      .fill(null)
      .map(() => Array(24).fill(0));
    const dailyArray: number[] = Array(7).fill(0);

    behaviors.forEach(behavior => {
      const date = new Date(behavior.timestamp);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
      const hour = date.getHours();

      hourlyMatrix[dayIndex][hour]++;
      dailyArray[dayIndex]++;
    });

    return {
      hourly: hourlyMatrix,
      daily: dailyArray,
    };
  }
}

// 用户分群分析
export class UserSegmentation {
  static analyzeSegments(behaviorData: any[]): UserSegment[] {
    const segments: UserSegment[] = [];

    // 基于参与度的分群
    const engagementSegments = this.createEngagementSegments(behaviorData);
    segments.push(...engagementSegments);

    // 基于使用模式的分?    const patternSegments = this.createPatternSegments(behaviorData);
    segments.push(...patternSegments);

    return segments;
  }

  private static createEngagementSegments(behaviorData: any[]): UserSegment[] {
    // 简化的分群逻辑
    return [
      {
        segmentId: 'high_engagement',
        segmentName: '高参与度用户',
        criteria: '日均访问>2次且功能采用?70%',
        userCount: 15,
        characteristics: ['活跃频繁', '功能使用全面', '粘性高'],
      },
      {
        segmentId: 'medium_engagement',
        segmentName: '中等参与度用?,
        criteria: '日均访问1-2次且功能采用?0-70%',
        userCount: 45,
        characteristics: ['定期使用', '核心功能熟悉', '有待提升'],
      },
      {
        segmentId: 'low_engagement',
        segmentName: '低参与度用户',
        criteria: '日均访问<1次或功能采用?30%',
        userCount: 23,
        characteristics: ['使用较少', '需要引?, '潜在流失风险'],
      },
    ];
  }

  private static createPatternSegments(behaviorData: any[]): UserSegment[] {
    return [
      {
        segmentId: 'morning_users',
        segmentName: '晨间活跃用户',
        criteria: '主要?-12点活?,
        userCount: 28,
        characteristics: ['早起?, '工作效率?, '习惯稳定'],
      },
      {
        segmentId: 'evening_users',
        segmentName: '晚间活跃用户',
        criteria: '主要?8-22点活?,
        userCount: 35,
        characteristics: ['夜猫?, '下班后使?, '休闲时间活跃'],
      },
    ];
  }
}
