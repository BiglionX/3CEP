// 用户偏好预测模型系统

export interface PreferencePrediction {
  userId: string;
  predictions: {
    // 功能偏好预测
    featurePreferences: FeaturePreferencePrediction[];

    // 内容偏好预测
    contentPreferences: ContentPreferencePrediction;

    // 交互方式偏好
    interactionPreferences: InteractionPreferencePrediction;

    // 时间偏好预测
    temporalPreferences: TemporalPreferencePrediction;

    // 价值偏好预?    valuePreferences: ValuePreferencePrediction;
  };
  confidence: number;
  predictionTimestamp: string;
  modelVersion: string;
}

export interface FeaturePreferencePrediction {
  featureId: string;
  featureName: string;
  likelihood: number; // 0-1 概率
  ranking: number; // 排名
  confidence: number; // 预测置信?  expectedAdoptionTimeframe: string; // 预期采用时间
  influencingFactors: string[]; // 影响因素
}

export interface ContentPreferencePrediction {
  contentType: string;
  topics: string[];
  preferredFormats: string[];
  consumptionFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  engagementLikelihood: number;
  contentQualityPreference: 'basic' | 'detailed' | 'expert';
}

export interface InteractionPreferencePrediction {
  channels: {
    email: number;
    in_app: number;
    sms: number;
    push: number;
  };
  communicationStyle: 'formal' | 'casual' | 'technical';
  feedbackPreference: 'proactive' | 'reactive' | 'passive';
  supportChannelPreference: 'self_service' | 'live_chat' | 'phone' | 'email';
}

export interface TemporalPreferencePrediction {
  activeHours: number[]; // 活跃时间?  preferredNotificationTimes: string[];
  sessionDurationPreference: 'short' | 'medium' | 'long';
  weeklyPattern: WeeklyPattern;
}

export interface WeeklyPattern {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface ValuePreferencePrediction {
  priceSensitivity: number; // 价格敏感?0-1
  featureValueRatio: number; // 功能价值比 0-1
  upgradeLikelihood: number; // 升级可能?0-1
  premiumFeatureInterest: string[]; // 感兴趣的高级功能
  budgetRange: [number, number]; // 预算范围
}

export interface UserBehaviorFeatures {
  // 基础行为特征
  visitFrequency: number;
  sessionDuration: number;
  featureAdoptionRate: number;
  engagementScore: number;

  // 功能使用特征
  mostUsedFeatures: string[];
  recentlyUsedFeatures: string[];
  abandonedFeatures: string[];

  // 内容消费特征
  viewedContentTypes: string[];
  contentInteractionRate: number;
  bookmarkedItems: string[];

  // 时间行为特征
  activeHours: number[];
  sessionPatterns: string[];
  timezone: string;

  // 交互历史特征
  supportRequests: number;
  feedbackProvided: number;
  helpArticlesViewed: number;
}

export interface ContextualFeatures {
  deviceType: string;
  browser: string;
  location: string;
  timeOfDay: number;
  dayOfWeek: number;
  seasonalFactors: string[];
  systemLoad: number;
}

export class PreferencePredictionModel {
  private modelVersion: string = '1.0.0';
  private featureImportance: Record<string, number> = {};
  private trainingDataSize: number = 0;

  // 预测用户整体偏好
  async predictUserPreferences(
    userId: string,
    behaviorFeatures: UserBehaviorFeatures,
    contextualFeatures: ContextualFeatures
  ): Promise<PreferencePrediction> {
    // 1. 特征工程和预处理
    const processedFeatures = this.preprocessFeatures(
      behaviorFeatures,
      contextualFeatures
    );

    // 2. 各类偏好预测
    const featurePreferences =
      this.predictFeaturePreferences(processedFeatures);
    const contentPreferences =
      this.predictContentPreferences(processedFeatures);
    const interactionPreferences =
      this.predictInteractionPreferences(processedFeatures);
    const temporalPreferences =
      this.predictTemporalPreferences(processedFeatures);
    const valuePreferences = this.predictValuePreferences(processedFeatures);

    // 3. 计算整体置信?    const confidence = this.calculateOverallConfidence(
      featurePreferences,
      contentPreferences,
      interactionPreferences,
      temporalPreferences,
      valuePreferences
    );

    return {
      userId,
      predictions: {
        featurePreferences,
        contentPreferences,
        interactionPreferences,
        temporalPreferences,
        valuePreferences,
      },
      confidence,
      predictionTimestamp: new Date().toISOString(),
      modelVersion: this.modelVersion,
    };
  }

  // 预测功能偏好
  private predictFeaturePreferences(
    features: any
  ): FeaturePreferencePrediction[] {
    const availableFeatures = [
      'device_management',
      'repair_scheduling',
      'inventory_tracking',
      'analytics_dashboard',
      'report_generation',
      'user_management',
      'notification_center',
      'integration_hub',
      'automation_tools',
    ];

    const predictions: FeaturePreferencePrediction[] = [];

    availableFeatures.forEach((feature, index) => {
      // 基于用户行为特征计算偏好概率
      const baseLikelihood = this.calculateFeatureLikelihood(feature, features);
      const contextualBoost = this.applyContextualBoost(
        feature,
        features.contextual
      );
      const historicalInfluence = this.applyHistoricalInfluence(
        feature,
        features.behavioral
      );

      const finalLikelihood = Math.min(
        1,
        baseLikelihood + contextualBoost + historicalInfluence
      );

      predictions.push({
        featureId: `feat_${feature}`,
        featureName: this.formatFeatureName(feature),
        likelihood: finalLikelihood,
        ranking: 0, // 后续排序
        confidence: this.calculateFeatureConfidence(finalLikelihood, features),
        expectedAdoptionTimeframe:
          this.predictAdoptionTimeframe(finalLikelihood),
        influencingFactors: this.identifyInfluencingFactors(feature, features),
      });
    });

    // 按概率排序并分配排名
    return predictions
      .sort((a, b) => b.likelihood - a.likelihood)
      .map((pred, index) => ({
        ...pred,
        ranking: index + 1,
      }));
  }

  // 预测内容偏好
  private predictContentPreferences(
    features: any
  ): ContentPreferencePrediction {
    const contentTypes = [
      'analytics',
      'tutorials',
      'announcements',
      'reports',
      'case_studies',
    ];

    // 选择最可能的内容类?    const primaryContentType = contentTypes[0]; // 简化实?
    const engagementLikelihood = this.calculateContentEngagement(
      features,
      primaryContentType
    );
    const qualityPreference = this.predictContentQualityPreference(features);
    const frequency = this.predictConsumptionFrequency(engagementLikelihood);

    return {
      contentType: primaryContentType,
      topics: this.predictPreferredTopics(primaryContentType, features),
      preferredFormats: this.predictPreferredFormats(
        primaryContentType,
        features
      ),
      consumptionFrequency: frequency,
      engagementLikelihood,
      contentQualityPreference: qualityPreference,
    };
  }

  // 预测交互偏好
  private predictInteractionPreferences(
    features: any
  ): InteractionPreferencePrediction {
    // 渠道偏好预测
    const channels = {
      email: this.predictChannelPreference('email', features),
      in_app: this.predictChannelPreference('in_app', features),
      sms: this.predictChannelPreference('sms', features),
      push: this.predictChannelPreference('push', features),
    };

    // 通信风格预测
    const communicationStyle = this.predictCommunicationStyle(features);

    // 反馈偏好预测
    const feedbackPreference = this.predictFeedbackPreference(features);

    // 支持渠道偏好
    const supportChannelPreference =
      this.predictSupportChannelPreference(features);

    return {
      channels,
      communicationStyle,
      feedbackPreference,
      supportChannelPreference,
    };
  }

  // 预测时间偏好
  private predictTemporalPreferences(
    features: any
  ): TemporalPreferencePrediction {
    const activeHours = this.predictActiveHours(features);
    const notificationTimes = this.predictNotificationTimes(activeHours);
    const sessionDuration = this.predictSessionDurationPreference(features);
    const weeklyPattern = this.predictWeeklyPattern(features);

    return {
      activeHours,
      preferredNotificationTimes: notificationTimes,
      sessionDurationPreference: sessionDuration,
      weeklyPattern,
    };
  }

  // 预测价值偏?  private predictValuePreferences(features: any): ValuePreferencePrediction {
    const priceSensitivity = this.predictPriceSensitivity(features);
    const featureValueRatio = this.predictFeatureValueRatio(features);
    const upgradeLikelihood = this.predictUpgradeLikelihood(features);
    const premiumFeatures = this.predictPremiumFeatureInterest(features);
    const budgetRange = this.predictBudgetRange(features);

    return {
      priceSensitivity,
      featureValueRatio,
      upgradeLikelihood,
      premiumFeatureInterest: premiumFeatures,
      budgetRange,
    };
  }

  // 特征预处?  private preprocessFeatures(
    behavioral: UserBehaviorFeatures,
    contextual: ContextualFeatures
  ): any {
    return {
      behavioral: this.normalizeBehavioralFeatures(behavioral),
      contextual: this.normalizeContextualFeatures(contextual),
      derived: this.deriveFeatures(behavioral, contextual),
    };
  }

  // 计算功能偏好概率
  private calculateFeatureLikelihood(feature: string, features: any): number {
    const behavioral = features.behavioral;
    const derived = features.derived;

    // 基于相似用户行为的加权计?    let likelihood = 0.5; // 基准概率

    // 功能相关性权?    const featureWeights: Record<string, number> = {
      device_management: 0.8,
      repair_scheduling: 0.7,
      inventory_tracking: 0.6,
      analytics_dashboard: 0.9,
      report_generation: 0.7,
      user_management: 0.5,
      notification_center: 0.6,
      integration_hub: 0.4,
      automation_tools: 0.5,
    };

    const baseWeight = featureWeights[feature] || 0.5;

    // 根据用户行为调整
    if (behavioral.mostUsedFeatures.includes(feature)) {
      likelihood += 0.3;
    }

    if (derived.featureAffinity[feature]) {
      likelihood += derived.featureAffinity[feature] * 0.2;
    }

    // 考虑参与?    likelihood += (behavioral.engagementScore / 100) * 0.1;

    return Math.min(1, likelihood * baseWeight);
  }

  // 应用情境增强
  private applyContextualBoost(feature: string, contextual: any): number {
    let boost = 0;

    // 设备类型影响
    if (
      contextual.deviceType === 'mobile' &&
      feature.includes('notification')
    ) {
      boost += 0.1;
    }

    // 时间影响
    const isBusinessHours =
      contextual.timeOfDay >= 9 && contextual.timeOfDay <= 17;
    if (isBusinessHours && feature.includes('management')) {
      boost += 0.05;
    }

    // 地理位置影响
    if (contextual.location === 'office' && feature.includes('analytics')) {
      boost += 0.08;
    }

    return boost;
  }

  // 应用历史影响
  private applyHistoricalInfluence(feature: string, behavioral: any): number {
    let influence = 0;

    // 最近使用影?    if (behavioral.recentlyUsedFeatures.includes(feature)) {
      influence += 0.15;
    }

    // 弃用功能惩罚
    if (behavioral.abandonedFeatures.includes(feature)) {
      influence -= 0.2;
    }

    // 使用频率影响
    const usageCount = behavioral.mostUsedFeatures.filter((f: string) =>
      f.includes(feature.split('_')[0])
    ).length;

    influence += usageCount * 0.05;

    return Math.max(-0.5, influence); // 限制最小?  }

  // 计算特征预测置信?  private calculateFeatureConfidence(
    likelihood: number,
    features: any
  ): number {
    const behavioral = features.behavioral;

    // 基于数据丰富度的置信?    let confidence = 0.5; // 基准置信?
    // 行为数据量影?    const behaviorRichness = Math.min(
      behavioral.visitFrequency * behavioral.featureAdoptionRate,
      1
    );
    confidence += behaviorRichness * 0.3;

    // 参与度影?    confidence += (behavioral.engagementScore / 100) * 0.2;

    return Math.min(1, confidence);
  }

  // 预测采用时间框架
  private predictAdoptionTimeframe(likelihood: number): string {
    if (likelihood > 0.8) return 'immediate'; // 立即
    if (likelihood > 0.6) return 'short_term'; // 短期(1-4�?
    if (likelihood > 0.4) return 'medium_term'; // 中期(1-3�?
    if (likelihood > 0.2) return 'long_term'; // 长期(3-6�?
    return 'unlikely'; // 不太可能
  }

  // 识别影响因素
  private identifyInfluencingFactors(feature: string, features: any): string[] {
    const factors: string[] = [];
    const behavioral = features.behavioral;

    if (behavioral.mostUsedFeatures.includes(feature)) {
      factors.push('历史使用习惯');
    }

    if (behavioral.recentlyUsedFeatures.includes(feature)) {
      factors.push('近期兴趣');
    }

    if (behavioral.engagementScore > 80) {
      factors.push('高参与度');
    }

    if (behavioral.featureAdoptionRate > 0.7) {
      factors.push('功能采用积极');
    }

    return factors.slice(0, 3); // 限制返回?个因?  }

  // 计算内容参与?  private calculateContentEngagement(
    features: any,
    contentType: string
  ): number {
    const behavioral = features.behavioral;

    let engagement = 0.3; // 基准参与?
    // 基于内容类型的历史交?    if (behavioral.viewedContentTypes.includes(contentType)) {
      engagement += 0.4;
    }

    // 书签影响
    const bookmarkedCount = behavioral.bookmarkedItems.filter((item: string) =>
      item.includes(contentType)
    ).length;
    engagement += bookmarkedCount * 0.1;

    // 参与度调?    engagement += (behavioral.contentInteractionRate / 100) * 0.2;

    return Math.min(1, engagement);
  }

  // 预测内容质量偏好
  private predictContentQualityPreference(
    features: any
  ): 'basic' | 'detailed' | 'expert' {
    const behavioral = features.behavioral;

    if (behavioral.engagementScore > 90) return 'expert';
    if (behavioral.engagementScore > 70) return 'detailed';
    return 'basic';
  }

  // 预测消费频率
  private predictConsumptionFrequency(
    engagement: number
  ): 'daily' | 'weekly' | 'monthly' | 'occasional' {
    if (engagement > 0.8) return 'daily';
    if (engagement > 0.6) return 'weekly';
    if (engagement > 0.3) return 'monthly';
    return 'occasional';
  }

  // 预测偏好的主?  private predictPreferredTopics(contentType: string, features: any): string[] {
    const topicMap: Record<string, string[]> = {
      analytics: ['performance_metrics', 'user_behavior', 'system_health'],
      tutorials: ['getting_started', 'advanced_features', 'best_practices'],
      announcements: ['product_updates', 'feature_releases', 'company_news'],
      reports: ['usage_statistics', 'performance_analysis', 'trend_reports'],
      case_studies: [
        'success_stories',
        'implementation_examples',
        'roi_analysis',
      ],
    };

    return topicMap[contentType] || ['general'];
  }

  // 预测偏好的格?  private predictPreferredFormats(
    contentType: string,
    features: any
  ): string[] {
    const behavioral = features.behavioral;
    const formats: string[] = [];

    // 基于设备类型
    if (features.contextual.deviceType === 'mobile') {
      formats.push('mobile_friendly', 'short_form');
    } else {
      formats.push('desktop_optimized', 'detailed');
    }

    // 基于参与?    if (behavioral.engagementScore > 80) {
      formats.push('interactive', 'video');
    }

    return formats;
  }

  // 预测渠道偏好
  private predictChannelPreference(channel: string, features: any): number {
    const behavioral = features.behavioral;
    const contextual = features.contextual;

    let preference = 0.5; // 基准偏好

    switch (channel) {
      case 'email':
        preference += behavioral.engagementScore > 50 ? 0.2 : -0.1;
        break;
      case 'in_app':
        preference += contextual.deviceType !== 'mobile' ? 0.3 : 0.1;
        break;
      case 'sms':
        preference += contextual.deviceType === 'mobile' ? 0.2 : -0.1;
        break;
      case 'push':
        preference += behavioral.engagementScore > 70 ? 0.25 : 0;
        break;
    }

    return Math.min(1, Math.max(0, preference));
  }

  // 预测通信风格
  private predictCommunicationStyle(
    features: any
  ): 'formal' | 'casual' | 'technical' {
    const behavioral = features.behavioral;

    if (behavioral.helpArticlesViewed > 10) return 'technical';
    if (behavioral.engagementScore > 80) return 'formal';
    return 'casual';
  }

  // 预测反馈偏好
  private predictFeedbackPreference(
    features: any
  ): 'proactive' | 'reactive' | 'passive' {
    const behavioral = features.behavioral;

    if (behavioral.feedbackProvided > 5) return 'proactive';
    if (behavioral.supportRequests > 3) return 'reactive';
    return 'passive';
  }

  // 预测支持渠道偏好
  private predictSupportChannelPreference(
    features: any
  ): 'self_service' | 'live_chat' | 'phone' | 'email' {
    const behavioral = features.behavioral;

    if (behavioral.helpArticlesViewed > 8) return 'self_service';
    if (behavioral.engagementScore > 85) return 'live_chat';
    if (behavioral.supportRequests > 2) return 'phone';
    return 'email';
  }

  // 预测活跃时间?  private predictActiveHours(features: any): number[] {
    const behavioral = features.behavioral;
    const baseHours =
      behavioral.activeHours.length > 0
        ? behavioral.activeHours
        : [9, 10, 11, 14, 15, 16];

    // 根据参与度调?    if (behavioral.engagementScore > 80) {
      // 高参与度用户可能更活?      return [...baseHours, 8, 17, 18];
    }

    return baseHours;
  }

  // 预测通知时间
  private predictNotificationTimes(activeHours: number[]): string[] {
    return activeHours
      .filter(hour => hour >= 9 && hour <= 18)
      .map(hour => `${hour}:00`)
      .slice(0, 3); // 限制3个时间点
  }

  // 预测会话时长偏好
  private predictSessionDurationPreference(
    features: any
  ): 'short' | 'medium' | 'long' {
    const avgDuration = features.behavioral.sessionDuration;

    if (avgDuration > 30) return 'long';
    if (avgDuration > 10) return 'medium';
    return 'short';
  }

  // 预测周模?  private predictWeeklyPattern(features: any): WeeklyPattern {
    const basePattern: WeeklyPattern = {
      monday: 0.7,
      tuesday: 0.8,
      wednesday: 0.8,
      thursday: 0.8,
      friday: 0.6,
      saturday: 0.3,
      sunday: 0.2,
    };

    // 根据行业特点调整（假设为B2B软件?    return basePattern;
  }

  // 预测价格敏感?  private predictPriceSensitivity(features: any): number {
    const behavioral = features.behavioral;

    let sensitivity = 0.5; // 基准敏感?
    // 参与度反向影响（参与度越高，价格敏感度越低）
    sensitivity -= (behavioral.engagementScore / 100) * 0.3;

    // 功能采用率影?    sensitivity -= behavioral.featureAdoptionRate * 0.2;

    return Math.max(0, Math.min(1, sensitivity));
  }

  // 预测功能价值比
  private predictFeatureValueRatio(features: any): number {
    const behavioral = features.behavioral;

    // 基于功能使用广度和深?    const breadth = behavioral.mostUsedFeatures.length / 10; // 假设总共?0个主要功?    const depth = behavioral.featureAdoptionRate;

    return Math.min(1, (breadth + depth) / 2);
  }

  // 预测升级可能?  private predictUpgradeLikelihood(features: any): number {
    const behavioral = features.behavioral;
    const derived = features.derived;

    let likelihood = 0.3; // 基准可能?
    // 高参与度用户更容易升?    likelihood += (behavioral.engagementScore / 100) * 0.4;

    // 功能重度使用?    likelihood += behavioral.featureAdoptionRate * 0.3;

    return Math.min(1, likelihood);
  }

  // 预测感兴趣的高级功能
  private predictPremiumFeatureInterest(features: any): string[] {
    const behavioral = features.behavioral;
    const highValueFeatures = [
      'advanced_analytics',
      'custom_reporting',
      'api_access',
      'white_labeling',
      'priority_support',
      'dedicated_account_manager',
    ];

    // 基于当前使用模式推断
    const interestedFeatures: string[] = [];

    if (behavioral.mostUsedFeatures.includes('analytics_dashboard')) {
      interestedFeatures.push('advanced_analytics', 'custom_reporting');
    }

    if (behavioral.engagementScore > 90) {
      interestedFeatures.push('api_access', 'white_labeling');
    }

    if (behavioral.featureAdoptionRate > 0.8) {
      interestedFeatures.push('priority_support');
    }

    return [...new Set(interestedFeatures)].slice(0, 4);
  }

  // 预测预算范围
  private predictBudgetRange(features: any): [number, number] {
    const behavioral = features.behavioral;

    // 基于参与度和价值感?    const baseMultiplier = behavioral.engagementScore / 100;
    const adoptionMultiplier = behavioral.featureAdoptionRate;

    const avgBudget = 1000 * baseMultiplier * adoptionMultiplier;
    const range = avgBudget * 0.3; // ±30%的范?
    return [
      Math.max(100, avgBudget - range),
      Math.min(10000, avgBudget + range),
    ];
  }

  // 计算整体置信?  private calculateOverallConfidence(...predictions: any[]): number {
    const confidences = predictions.map(pred =>
      Array.isArray(pred)
        ? pred.reduce((sum: number, p: any) => sum + (p.confidence || 0.5), 0) /
          pred.length
        : pred.confidence || 0.5
    );

    return (
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    );
  }

  // 格式化功能名?  private formatFeatureName(featureId: string): string {
    const nameMap: Record<string, string> = {
      device_management: '设备管理',
      repair_scheduling: '维修排程',
      inventory_tracking: '库存追踪',
      analytics_dashboard: '分析仪表?,
      report_generation: '报告生成',
      user_management: '用户管理',
      notification_center: '通知中心',
      integration_hub: '集成中心',
      automation_tools: '自动化工?,
    };

    return nameMap[featureId] || featureId;
  }

  // 规范化行为特?  private normalizeBehavioralFeatures(features: UserBehaviorFeatures): any {
    return {
      ...features,
      visitFrequency: Math.min(features.visitFrequency, 1),
      sessionDuration: Math.min(features.sessionDuration / 60, 1), // 转换为小时并标准?      featureAdoptionRate: Math.min(features.featureAdoptionRate, 1),
      engagementScore: features.engagementScore / 100,
    };
  }

  // 规范化情境特?  private normalizeContextualFeatures(features: ContextualFeatures): any {
    return {
      ...features,
      timeOfDay: features.timeOfDay / 24,
      dayOfWeek: features.dayOfWeek / 6,
      systemLoad: Math.min(features.systemLoad, 1),
    };
  }

  // 派生特征
  private deriveFeatures(
    behavioral: UserBehaviorFeatures,
    contextual: ContextualFeatures
  ): any {
    return {
      // 功能亲和?      featureAffinity: this.calculateFeatureAffinity(behavioral),

      // 使用成熟?      usageMaturity: this.calculateUsageMaturity(behavioral),

      // 情境适应?      contextAdaptability: this.calculateContextAdaptability(contextual),
    };
  }

  // 计算功能亲和?  private calculateFeatureAffinity(
    behavioral: UserBehaviorFeatures
  ): Record<string, number> {
    const affinity: Record<string, number> = {};

    behavioral.mostUsedFeatures.forEach(feature => {
      affinity[feature] = 0.8;
    });

    behavioral.recentlyUsedFeatures.forEach(feature => {
      affinity[feature] = Math.max(affinity[feature] || 0, 0.6);
    });

    return affinity;
  }

  // 计算使用成熟?  private calculateUsageMaturity(behavioral: UserBehaviorFeatures): number {
    const factors = [
      behavioral.visitFrequency,
      behavioral.featureAdoptionRate,
      behavioral.engagementScore / 100,
      behavioral.contentInteractionRate / 100,
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  // 计算情境适应?  private calculateContextAdaptability(contextual: ContextualFeatures): number {
    // 基于设备和时间的一致?    return 0.7; // 简化实?  }
}
