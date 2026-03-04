// 用户偏好预测服务

import {
  PreferencePredictionModel,
  PreferencePrediction,
  UserBehaviorFeatures,
  ContextualFeatures,
} from './preference-prediction-model';

export interface PredictionServiceConfig {
  cacheTTL: number; // 缓存过期时间(毫秒)
  maxConcurrentPredictions: number;
  enableBatchProcessing: boolean;
  modelUpdateInterval: number; // 模型更新间隔(毫秒)
}

export interface BatchPredictionRequest {
  userId: string;
  behaviorFeatures: UserBehaviorFeatures;
  contextualFeatures: ContextualFeatures;
}

export interface PredictionAnalytics {
  totalPredictions: number;
  averageConfidence: number;
  predictionLatency: number; // 平均延迟(毫秒)
  cacheHitRate: number;
  modelAccuracy: number;
}

export class UserPreferencePredictionService {
  private model: PreferencePredictionModel;
  private config: PredictionServiceConfig;
  private predictionCache: Map<
    string,
    { prediction: PreferencePrediction; timestamp: number }
  >;
  private pendingPredictions: Set<string>;
  private analytics: PredictionAnalytics;

  constructor(config: Partial<PredictionServiceConfig> = {}) {
    this.config = {
      cacheTTL: 30 * 60 * 1000, // 30分钟
      maxConcurrentPredictions: 10,
      enableBatchProcessing: true,
      modelUpdateInterval: 24 * 60 * 60 * 1000, // 24小时
      ...config,
    };

    this.model = new PreferencePredictionModel();
    this.predictionCache = new Map();
    this.pendingPredictions = new Set();
    this.analytics = {
      totalPredictions: 0,
      averageConfidence: 0,
      predictionLatency: 0,
      cacheHitRate: 0,
      modelAccuracy: 0.85, // 初始准确?    };

    this.startPeriodicTasks();
  }

  // 预测单个用户偏好
  async predictUserPreference(
    userId: string,
    behaviorFeatures: UserBehaviorFeatures,
    contextualFeatures: ContextualFeatures
  ): Promise<PreferencePrediction> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(
      userId,
      behaviorFeatures,
      contextualFeatures
    );

    // 检查缓?    const cached = this.predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
      this.updateAnalytics(
        true,
        Date.now() - startTime,
        cached.prediction.confidence
      );
      return cached.prediction;
    }

    // 检查是否已在处理中
    if (this.pendingPredictions.has(userId)) {
      // 等待处理完成
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          const updatedCached = this.predictionCache.get(cacheKey);
          if (updatedCached) {
            clearInterval(checkInterval);
            this.pendingPredictions.delete(userId);
            this.updateAnalytics(
              true,
              Date.now() - startTime,
              updatedCached.prediction.confidence
            );
            resolve(updatedCached.prediction);
          }
        }, 100);
      });
    }

    // 标记为处理中
    this.pendingPredictions.add(userId);

    try {
      // 执行预测
      const prediction = await this.model.predictUserPreferences(
        userId,
        behaviorFeatures,
        contextualFeatures
      );

      // 缓存结果
      this.predictionCache.set(cacheKey, {
        prediction,
        timestamp: Date.now(),
      });

      // 更新统计
      this.updateAnalytics(
        false,
        Date.now() - startTime,
        prediction.confidence
      );

      return prediction;
    } finally {
      this.pendingPredictions.delete(userId);
    }
  }

  // 批量预测用户偏好
  async batchPredictUserPreferences(
    requests: BatchPredictionRequest[]
  ): Promise<Record<string, PreferencePrediction>> {
    if (!this.config.enableBatchProcessing) {
      // 串行处理
      const results: Record<string, PreferencePrediction> = {};
      for (const request of requests) {
        results[request.userId] = await this.predictUserPreference(
          request.userId,
          request.behaviorFeatures,
          request.contextualFeatures
        );
      }
      return results;
    }

    // 并行处理（受并发限制?    const batches = this.createBatches(
      requests,
      this.config.maxConcurrentPredictions
    );
    const results: Record<string, PreferencePrediction> = {};

    for (const batch of batches) {
      const batchPromises = batch.map(request =>
        this.predictUserPreference(
          request.userId,
          request.behaviorFeatures,
          request.contextualFeatures
        )
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((result, index) => {
        results[batch[index].userId] = result;
      });
    }

    return results;
  }

  // 获取用户偏好历史
  getUserPreferenceHistory(
    userId: string,
    limit: number = 10
  ): PreferencePrediction[] {
    const history: PreferencePrediction[] = [];

    // 从缓存中获取历史预测
    for (const [key, value] of this.predictionCache.entries()) {
      if (key.startsWith(`user_${userId}_`) && history.length < limit) {
        history.push(value.prediction);
      }
    }

    return history.sort(
      (a, b) =>
        new Date(b.predictionTimestamp).getTime() -
        new Date(a.predictionTimestamp).getTime()
    );
  }

  // 更新用户行为数据
  updateUserBehavior(
    userId: string,
    newBehavior: Partial<UserBehaviorFeatures>
  ): void {
    // 这里应该更新用户的行为特征数?    // 实际实现需要连接到行为数据存储
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`更新用户 ${userId} 的行为数?`, newBehavior)// 使相关缓存失?    this.invalidateUserCache(userId);
  }

  // 获取预测分析数据
  getPredictionAnalytics(): PredictionAnalytics {
    return { ...this.analytics };
  }

  // 导出预测结果
  exportPredictions(
    userIds: string[],
    format: 'json' | 'csv' = 'json'
  ): string {
    const predictions: PreferencePrediction[] = [];

    userIds.forEach(userId => {
      for (const [key, value] of this.predictionCache.entries()) {
        if (key.startsWith(`user_${userId}_`)) {
          predictions.push(value.prediction);
        }
      }
    });

    if (format === 'json') {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          predictionCount: predictions.length,
          predictions,
        },
        null,
        2
      );
    } else {
      return this.convertToCSV(predictions);
    }
  }

  // 清理过期缓存
  cleanupExpiredCache(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of this.predictionCache.entries()) {
      if (now - value.timestamp > this.config.cacheTTL) {
        this.predictionCache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // 重置服务状?  resetService(): void {
    this.predictionCache.clear();
    this.pendingPredictions.clear();
    this.analytics = {
      totalPredictions: 0,
      averageConfidence: 0,
      predictionLatency: 0,
      cacheHitRate: 0,
      modelAccuracy: 0.85,
    };
  }

  // 私有方法
  private generateCacheKey(
    userId: string,
    behaviorFeatures: UserBehaviorFeatures,
    contextualFeatures: ContextualFeatures
  ): string {
    // 基于用户ID和特征生成缓存键
    const featureHash = this.hashFeatures(behaviorFeatures, contextualFeatures);
    return `user_${userId}_${featureHash}`;
  }

  private hashFeatures(
    behaviorFeatures: UserBehaviorFeatures,
    contextualFeatures: ContextualFeatures
  ): string {
    // 简化的特征哈希（实际应用中应使用更复杂的哈希算法）
    const behaviorKeys = [
      behaviorFeatures.visitFrequency,
      behaviorFeatures.sessionDuration,
      behaviorFeatures.featureAdoptionRate,
      behaviorFeatures.engagementScore,
    ].join('|');

    const contextKeys = [
      contextualFeatures.deviceType,
      contextualFeatures.browser,
      contextualFeatures.location,
      contextualFeatures.timeOfDay,
    ].join('|');

    return `${behaviorKeys}_${contextKeys}`.slice(0, 32);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private updateAnalytics(
    isCacheHit: boolean,
    latency: number,
    confidence: number
  ): void {
    this.analytics.totalPredictions++;

    // 更新平均置信?    const totalConfidence =
      this.analytics.averageConfidence * (this.analytics.totalPredictions - 1) +
      confidence;
    this.analytics.averageConfidence =
      totalConfidence / this.analytics.totalPredictions;

    // 更新平均延迟
    const totalLatency =
      this.analytics.predictionLatency * (this.analytics.totalPredictions - 1) +
      latency;
    this.analytics.predictionLatency =
      totalLatency / this.analytics.totalPredictions;

    // 更新缓存命中?    if (isCacheHit) {
      const hits =
        this.analytics.cacheHitRate * (this.analytics.totalPredictions - 1) + 1;
      this.analytics.cacheHitRate = hits / this.analytics.totalPredictions;
    }
  }

  private invalidateUserCache(userId: string): void {
    // 移除该用户的所有缓存条?    for (const key of this.predictionCache.keys()) {
      if (key.startsWith(`user_${userId}_`)) {
        this.predictionCache.delete(key);
      }
    }
  }

  private startPeriodicTasks(): void {
    // 定期清理过期缓存
    setInterval(
      () => {
        const cleaned = this.cleanupExpiredCache();
        if (cleaned > 0) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`清理?${cleaned} 个过期的预测缓存`)}
      },
      60 * 60 * 1000
    ); // 每小时执行一?
    // 定期更新模型（简化实现）
    setInterval(() => {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('执行模型周期性更?..')// 这里应该实现模型再训练逻辑
    }, this.config.modelUpdateInterval);
  }

  private convertToCSV(predictions: PreferencePrediction[]): string {
    let csv =
      'User ID,Timestamp,Confidence,Model Version,Feature Preferences,Content Type,Communication Style\n';

    predictions.forEach(prediction => {
      const featurePrefs = prediction.predictions.featurePreferences
        .slice(0, 3)
        .map(fp => `${fp.featureName}(${(fp.likelihood * 100).toFixed(1)}%)`)
        .join('; ');

      csv +=
        `"${prediction.userId}",` +
        `"${prediction.predictionTimestamp}",` +
        `${prediction.confidence.toFixed(3)},` +
        `"${prediction.modelVersion}",` +
        `"${featurePrefs}",` +
        `"${prediction.predictions.contentPreferences.contentType}",` +
        `"${prediction.predictions.interactionPreferences.communicationStyle}"\n`;
    });

    return csv;
  }
}

// 便捷的工厂函?export function createUserPreferencePredictionService(
  config?: Partial<PredictionServiceConfig>
): UserPreferencePredictionService {
  return new UserPreferencePredictionService(config);
}

// 预测结果处理?export class PredictionResultProcessor {
  static processFeatureRecommendations(
    predictions: PreferencePrediction[]
  ): Record<string, { feature: string; recommendation: string }[]> {
    const recommendations: Record<
      string,
      { feature: string; recommendation: string }[]
    > = {};

    predictions.forEach(prediction => {
      const userId = prediction.userId;
      recommendations[userId] = [];

      // 基于功能偏好生成推荐
      prediction.predictions.featurePreferences
        .filter(fp => fp.likelihood > 0.7)
        .slice(0, 3)
        .forEach(fp => {
          recommendations[userId].push({
            feature: fp.featureName,
            recommendation: `推荐尝试${fp.featureName}功能，您?{(fp.likelihood * 100).toFixed(0)}%的可能性感兴趣`,
          });
        });
    });

    return recommendations;
  }

  static processContentRecommendations(
    predictions: PreferencePrediction[]
  ): Record<string, string[]> {
    const recommendations: Record<string, string[]> = {};

    predictions.forEach(prediction => {
      const userId = prediction.userId;
      const contentPref = prediction.predictions.contentPreferences;

      recommendations[userId] = [
        `推荐关注${contentPref.contentType}类型的内容`,
        `建议${contentPref.consumptionFrequency}查看相关内容`,
        `偏好${contentPref.contentQualityPreference}级别的内容质量`,
      ];
    });

    return recommendations;
  }

  static processCommunicationStrategy(
    predictions: PreferencePrediction[]
  ): Record<string, { channel: string; timing: string; style: string }> {
    const strategies: Record<string, any> = {};

    predictions.forEach(prediction => {
      const userId = prediction.userId;
      const interactionPref = prediction.predictions.interactionPreferences;
      const temporalPref = prediction.predictions.temporalPreferences;

      // 找到最优沟通渠?      const bestChannel = Object.entries(interactionPref.channels).sort(
        ([, a], [, b]) => b - a
      )[0][0];

      strategies[userId] = {
        channel: bestChannel,
        timing: temporalPref.preferredNotificationTimes[0] || '工作时间',
        style: interactionPref.communicationStyle,
      };
    });

    return strategies;
  }
}
