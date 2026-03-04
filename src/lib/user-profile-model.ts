// 用户画像数据模型定义

export interface UserProfile {
  // 基础信息
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  registrationSource: string;

  // 基础属性特?  demographics: {
    ageGroup?: string;
    gender?: string;
    location?: string;
    timeZone?: string;
    language?: string;
  };

  // 行为特征
  behavioral: BehavioralFeatures;

  // 偏好分析
  preferences: UserPreferences;

  // 价值分?  valueTier: ValueTier;

  // 风险评估
  riskProfile: RiskProfile;

  // 生命周期阶段
  lifecycleStage: LifecycleStage;

  // 个性化标签
  tags: string[];

  // 综合评分
  scores: UserScores;

  // 更新时间
  profileUpdatedAt: string;
}

export interface BehavioralFeatures {
  // 访问行为
  visitPatterns: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    preferredTimeSlots: string[];
    sessionDuration: 'short' | 'medium' | 'long';
    devicePreference: 'mobile' | 'desktop' | 'both';
  };

  // 功能使用
  featureAdoption: {
    coreFeatures: string[];
    advancedFeatures: string[];
    rarelyUsedFeatures: string[];
    adoptionRate: number;
  };

  // 互动行为
  interactionStyle: {
    browsingDepth: 'shallow' | 'moderate' | 'deep';
    actionFrequency: 'low' | 'medium' | 'high';
    helpSeeking: 'independent' | 'moderate' | 'frequent';
  };

  // 学习曲线
  learningProgress: {
    onboardingCompletion: boolean;
    tutorialUsage: number;
    featureDiscovery: number;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface UserPreferences {
  // 界面偏好
  uiPreferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    layout: 'compact' | 'comfortable' | 'spacious';
    notificationFrequency: 'immediate' | 'digest' | 'minimal';
  };

  // 功能偏好
  featurePreferences: {
    favoriteFeatures: string[];
    avoidedFeatures: string[];
    preferredWorkflows: string[];
  };

  // 内容偏好
  contentPreferences: {
    contentTypes: string[];
    topicsOfInterest: string[];
    contentFrequency: 'daily' | 'weekly' | 'monthly';
  };

  // 沟通偏?  communicationPreferences: {
    contactMethod: 'email' | 'in_app' | 'sms';
    bestContactTime: string[];
    communicationStyle: 'formal' | 'casual' | 'technical';
  };
}

export type ValueTier =
  | 'platinum' // 铂金用户 - 核心高价值用?  | 'gold' // 黄金用户 - 重要用户群体
  | 'silver' // 白银用户 - 普通活跃用?  | 'bronze' // 青铜用户 - 新用户或低频用户
  | 'inactive'; // 不活跃用?
export interface RiskProfile {
  churnRisk: 'low' | 'medium' | 'high';
  securityRisk: 'low' | 'medium' | 'high';
  complianceRisk: 'low' | 'medium' | 'high';
  engagementRisk: 'low' | 'medium' | 'high';

  riskFactors: string[];
  mitigationStrategies: string[];
}

export type LifecycleStage =
  | 'new_user' // 新用?- 注册7天内
  | 'onboarding' // 体验?- 注册7-30�?  | 'active' // 活跃?- 使用1-6个月
  | 'loyal' // 忠诚?- 使用6个月以上
  | 'at_risk' // 流失预警?  | 'churned'; // 已流?
export interface UserScores {
  // 参与度分?(0-100)
  engagementScore: number;

  // 价值分?(0-100)
  valueScore: number;

  // 满意度分?(0-100)
  satisfactionScore: number;

  // 忠诚度分?(0-100)
  loyaltyScore: number;

  // 潜力分数 (0-100)
  potentialScore: number;

  // 综合健康?(0-100)
  healthScore: number;
}

// 用户画像服务?export class UserProfileService {
  // 从行为数据生成用户画?  static async generateUserProfile(
    userId: string,
    behaviorData: any[]
  ): Promise<UserProfile> {
    const analyzer = new (
      await import('@/lib/behavior-analyzer')
    ).BehaviorAnalyzer(behaviorData);

    // 分析时间范围
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90天数?
    // 执行各项分析
    const visitFrequency = analyzer.analyzeVisitFrequency(
      userId,
      startDate.toISOString(),
      endDate
    );
    const featureUsage = analyzer.analyzeFeatureUsage(
      userId,
      startDate.toISOString(),
      endDate
    );
    const activePatterns = analyzer.analyzeActivePatterns(
      userId,
      startDate.toISOString(),
      endDate
    );
    const engagementScore = analyzer.calculateEngagementScore(
      visitFrequency,
      featureUsage,
      activePatterns
    );

    // 构建用户画像
    const userProfile: UserProfile = {
      userId,
      email: '',
      username: '',
      displayName: '',
      createdAt: '',
      lastActive: new Date().toISOString(),
      registrationSource: 'unknown',

      demographics: {
        ageGroup: this.inferAgeGroup(visitFrequency),
        gender: 'unknown',
        location: 'unknown',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'zh-CN',
      },

      behavioral: this.extractBehavioralFeatures(
        visitFrequency,
        featureUsage,
        activePatterns
      ),

      preferences: this.inferUserPreferences(featureUsage, activePatterns),

      valueTier: this.determineValueTier(
        engagementScore,
        visitFrequency.totalVisits
      ),

      riskProfile: this.assessRiskProfile(visitFrequency, engagementScore),

      lifecycleStage: this.determineLifecycleStage(
        visitFrequency.totalVisits,
        engagementScore
      ),

      tags: this.generateTags(visitFrequency, featureUsage, activePatterns),

      scores: {
        engagementScore,
        valueScore: this.calculateValueScore(visitFrequency, featureUsage),
        satisfactionScore: 75, // 需要更多数据支?        loyaltyScore: this.calculateLoyaltyScore(visitFrequency),
        potentialScore: this.calculatePotentialScore(featureUsage),
        healthScore: this.calculateHealthScore(
          engagementScore,
          visitFrequency.visitConsistency
        ),
      },

      profileUpdatedAt: new Date().toISOString(),
    };

    return userProfile;
  }

  // 批量生成用户画像
  static async generateMultipleProfiles(
    behaviorData: any[]
  ): Promise<UserProfile[]> {
    const userIds = [...new Set(behaviorData.map(b => b.user_id))];
    const profiles: UserProfile[] = [];

    for (const userId of userIds) {
      try {
        const userProfile = await this.generateUserProfile(
          userId,
          behaviorData
        );
        profiles.push(userProfile);
      } catch (error) {
        console.error(`生成用户 ${userId} 的画像失?`, error);
      }
    }

    return profiles;
  }

  // 私有辅助方法
  private static inferAgeGroup(visitFrequency: any): string {
    // 基于活跃时段推测年龄组（简化逻辑?    if (visitFrequency.peakVisitDay.includes('工作?)) {
      return '25-40'; // 职场人群
    } else {
      return '18-35'; // 年轻用户
    }
  }

  private static extractBehavioralFeatures(
    visitFreq: any,
    featureUsage: any,
    activePatterns: any
  ): BehavioralFeatures {
    return {
      visitPatterns: {
        frequency:
          visitFreq.dailyAverage > 1
            ? 'daily'
            : visitFreq.weeklyAverage > 1
              ? 'weekly'
              : 'monthly',
        preferredTimeSlots: activePatterns.mostActiveHours.map(
          (h: number) => `${h}:00-${h + 1}:00`
        ),
        sessionDuration:
          activePatterns.sessionDuration.averageSession > 30
            ? 'long'
            : activePatterns.sessionDuration.averageSession > 10
              ? 'medium'
              : 'short',
        devicePreference: 'desktop', // 简化处?      },

      featureAdoption: {
        coreFeatures: featureUsage.mostUsedFeatures
          .slice(0, 3)
          .map((f: any) => f.featureName),
        advancedFeatures: featureUsage.mostUsedFeatures
          .slice(3, 6)
          .map((f: any) => f.featureName),
        rarelyUsedFeatures: [], // 需要额外数?        adoptionRate: featureUsage.adoptionRate,
      },

      interactionStyle: {
        browsingDepth: 'moderate', // 简化处?        actionFrequency:
          visitFreq.dailyAverage > 2
            ? 'high'
            : visitFreq.dailyAverage > 0.5
              ? 'medium'
              : 'low',
        helpSeeking: 'moderate',
      },

      learningProgress: {
        onboardingCompletion: true, // 简化处?        tutorialUsage: 50,
        featureDiscovery: featureUsage.adoptionRate,
        proficiencyLevel:
          featureUsage.adoptionRate > 70
            ? 'advanced'
            : featureUsage.adoptionRate > 30
              ? 'intermediate'
              : 'beginner',
      },
    };
  }

  private static inferUserPreferences(
    featureUsage: any,
    activePatterns: any
  ): UserPreferences {
    return {
      uiPreferences: {
        theme: 'light',
        language: 'zh-CN',
        layout: 'comfortable',
        notificationFrequency: 'digest',
      },

      featurePreferences: {
        favoriteFeatures: featureUsage.mostUsedFeatures
          .slice(0, 3)
          .map((f: any) => f.featureName),
        avoidedFeatures: [],
        preferredWorkflows: ['dashboard_first'], // 简化处?      },

      contentPreferences: {
        contentTypes: ['analytics', 'reports'],
        topicsOfInterest: ['user_management', 'system_performance'],
        contentFrequency: 'weekly',
      },

      communicationPreferences: {
        contactMethod: 'email',
        bestContactTime: activePatterns.mostActiveHours
          .slice(0, 2)
          .map((h: number) => `${h}:00`),
        communicationStyle: 'technical',
      },
    };
  }

  private static determineValueTier(
    engagementScore: number,
    totalVisits: number
  ): ValueTier {
    if (engagementScore >= 80 && totalVisits >= 50) return 'platinum';
    if (engagementScore >= 60 && totalVisits >= 20) return 'gold';
    if (engagementScore >= 40 && totalVisits >= 5) return 'silver';
    if (engagementScore >= 20) return 'bronze';
    return 'inactive';
  }

  private static assessRiskProfile(
    visitFreq: any,
    engagementScore: number
  ): RiskProfile {
    const churnRisk =
      visitFreq.visitConsistency < 0.3
        ? 'high'
        : visitFreq.visitConsistency < 0.6
          ? 'medium'
          : 'low';

    return {
      churnRisk,
      securityRisk: 'low',
      complianceRisk: 'low',
      engagementRisk:
        engagementScore < 30 ? 'high' : engagementScore < 60 ? 'medium' : 'low',
      riskFactors: this.identifyRiskFactors(visitFreq, engagementScore),
      mitigationStrategies: this.suggestMitigationStrategies(churnRisk),
    };
  }

  private static determineLifecycleStage(
    totalVisits: number,
    engagementScore: number
  ): LifecycleStage {
    if (totalVisits <= 3) return 'new_user';
    if (totalVisits <= 10) return 'onboarding';
    if (totalVisits <= 30) return 'active';
    if (totalVisits > 30 && engagementScore > 70) return 'loyal';
    if (engagementScore < 30) return 'at_risk';
    return 'active';
  }

  private static generateTags(
    visitFreq: any,
    featureUsage: any,
    activePatterns: any
  ): string[] {
    const tags: string[] = [];

    // 基于访问频率的标?    if (visitFreq.dailyAverage > 2) tags.push('高频用户');
    if (visitFreq.visitConsistency > 0.8) tags.push('规律用户');

    // 基于功能使用的标?    if (featureUsage.adoptionRate > 80) tags.push('功能专家');
    if (featureUsage.adoptionRate < 30) tags.push('基础用户');

    // 基于活跃时段的标?    const morningHours = activePatterns.mostActiveHours.filter(
      (h: number) => h >= 6 && h <= 12
    );
    if (morningHours.length >= 2) tags.push('晨型?);

    const eveningHours = activePatterns.mostActiveHours.filter(
      (h: number) => h >= 18 && h <= 23
    );
    if (eveningHours.length >= 2) tags.push('夜猫?);

    return tags;
  }

  // 评分计算方法
  private static calculateValueScore(
    visitFreq: any,
    featureUsage: any
  ): number {
    const frequencyScore = Math.min(visitFreq.dailyAverage * 20, 40);
    const adoptionScore = Math.min(featureUsage.adoptionRate * 0.6, 60);
    return Math.round(frequencyScore + adoptionScore);
  }

  private static calculateLoyaltyScore(visitFreq: any): number {
    return Math.round(visitFreq.visitConsistency * 100);
  }

  private static calculatePotentialScore(featureUsage: any): number {
    // 基于未使用功能的数量和采用率计算潜力
    const unusedPotential = (100 - featureUsage.adoptionRate) * 0.5;
    const growthPotential = featureUsage.adoptionRate > 50 ? 30 : 50;
    return Math.round(unusedPotential + growthPotential);
  }

  private static calculateHealthScore(
    engagementScore: number,
    consistency: number
  ): number {
    return Math.round((engagementScore * 0.7 + consistency * 30) * 0.7);
  }

  private static identifyRiskFactors(
    visitFreq: any,
    engagementScore: number
  ): string[] {
    const factors: string[] = [];
    if (visitFreq.visitConsistency < 0.4) factors.push('访问不规?);
    if (engagementScore < 40) factors.push('参与度低');
    if (visitFreq.dailyAverage < 0.1) factors.push('使用频率极低');
    return factors;
  }

  private static suggestMitigationStrategies(churnRisk: string): string[] {
    switch (churnRisk) {
      case 'high':
        return ['发送召回邮?, '提供专属优惠', '安排客服回访'];
      case 'medium':
        return ['推送个性化内容', '功能使用提醒', '满意度调?];
      default:
        return ['维持现状', '持续关注'];
    }
  }
}

// 用户画像查询接口
export interface UserProfileQuery {
  userId?: string;
  valueTier?: ValueTier;
  lifecycleStage?: LifecycleStage;
  minEngagementScore?: number;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
