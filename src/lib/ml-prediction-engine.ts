// 机器学习预测模型 - 用户行为预测、流失预警、价值评?
export interface PredictionInput {
  userId: string;
  features: Record<string, any>;
  timestamp: string;
}

export interface PredictionOutput {
  userId: string;
  predictions: {
    churnRisk: ChurnPrediction;
    valueScore: ValuePrediction;
    behaviorTrend: BehaviorPrediction;
    engagementLevel: EngagementPrediction;
  };
  confidence: number;
  timestamp: string;
}

export interface ChurnPrediction {
  probability: number; // 流失概率 0-1
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short_term' | 'medium_term' | 'long_term'; // 预测时间范围
  contributingFactors: string[]; // 影响因素
  preventionSuggestions: string[]; // 预防建议
}

export interface ValuePrediction {
  score: number; // 价值分?0-100
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  growthPotential: number; // 成长潜力 0-100
  predictedTierChange: 'increase' | 'decrease' | 'stable';
  confidenceInterval: [number, number]; // 置信区间
}

export interface BehaviorPrediction {
  nextLikelyActions: Array<{
    action: string;
    probability: number;
    timeframe: string;
  }>;
  featureAdoption: Array<{
    feature: string;
    likelihood: number;
    expectedTimeline: string;
  }>;
  usagePatternChanges: string[]; // 使用模式变化预测
}

export interface EngagementPrediction {
  currentLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  trend: 'increasing' | 'decreasing' | 'stable';
  predictedLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  timeToNextLevel: number; // 预计达到下一级别所需天数
}

// 特征工程?export class FeatureEngineer {
  // 提取用户基础特征
  extractBasicFeatures(userData: any): Record<string, number> {
    const features: Record<string, number> = {};

    // 注册时长特征
    const registerDate = new Date(userData.createdAt);
    const daysSinceRegister =
      (Date.now() - registerDate.getTime()) / (1000 * 60 * 60 * 24);
    features.days_since_register = Math.min(daysSinceRegister, 365); // 限制在一年内

    // 最后活跃时间特?    const lastActive = new Date(userData.lastActive);
    const daysSinceActive =
      (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    features.days_since_active = Math.min(daysSinceActive, 365);

    // 登录频率特征
    features.login_frequency = userData?.loginCount || 0;

    // 功能使用多样?    const usedFeatures = userData?.featureAdoption?.coreFeatures || [];
    features.feature_diversity = usedFeatures.length;

    return features;
  }

  // 提取行为序列特征
  extractBehavioralFeatures(
    behaviorData: any[],
    timeWindow: number = 90
  ): Record<string, number> {
    const features: Record<string, number> = {};
    const recentBehaviors = behaviorData.filter(b => {
      const behaviorDate = new Date(b.timestamp);
      const daysAgo =
        (Date.now() - behaviorDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= timeWindow;
    });

    // 访问频率统计
    const pageViews = recentBehaviors.filter(
      b => b.behavior_type === 'page_view'
    );
    features.daily_visits_avg = pageViews.length / Math.min(timeWindow, 90);
    features.visit_consistency = this.calculateConsistency(
      pageViews.map(b => b.timestamp)
    );

    // 功能使用深度
    const featureUses = recentBehaviors.filter(
      b => b.behavior_type === 'feature_use'
    );
    features.feature_usage_depth = this.calculateFeatureDepth(featureUses);

    // 互动强度
    const interactions = recentBehaviors.filter(b =>
      ['click_event', 'form_submit', 'search_action'].includes(b.behavior_type)
    );
    features.interaction_intensity =
      interactions.length / Math.max(pageViews.length, 1);

    // 时间分布特征
    const hourDistribution = this.calculateHourDistribution(pageViews);
    features.peak_hour_ratio =
      Math.max(...hourDistribution) /
      (hourDistribution.reduce((a, b) => a + b, 0) || 1);

    return features;
  }

  // 提取上下文特?  extractContextualFeatures(
    userData: any,
    systemData: any
  ): Record<string, number> {
    const features: Record<string, number> = {};

    // 系统使用环境
    features.system_uptime_days =
      (systemData?.uptime || 0) / (1000 * 60 * 60 * 24);

    // 用户相对位置（相对于其他用户?    features.relative_engagement = this.calculateRelativeEngagement(userData);

    // 季节性因?    const now = new Date();
    features.month_index = now.getMonth();
    features.day_of_week = now.getDay();
    features.is_weekend = [0, 6].includes(now.getDay()) ? 1 : 0;

    return features;
  }

  // 私有辅助方法
  private calculateConsistency(timestamps: string[]): number {
    if (timestamps.length <= 1) return timestamps.length > 0 ? 1 : 0;

    const dates = timestamps.map(t => new Date(t).toDateString());
    const uniqueDays = [...new Set(dates)].length;
    return uniqueDays / dates.length;
  }

  private calculateFeatureDepth(featureUses: any[]): number {
    if (featureUses.length === 0) return 0;

    const featureCounts: Record<string, number> = {};
    featureUses.forEach(use => {
      const feature = use.feature_name || 'unknown';
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const depths = Object.values(featureCounts);
    return depths.reduce((a, b) => a + b, 0) / depths.length;
  }

  private calculateHourDistribution(behaviors: any[]): number[] {
    const distribution = new Array(24).fill(0);
    behaviors.forEach(b => {
      const hour = new Date(b.timestamp).getHours();
      distribution[hour]++;
    });
    return distribution;
  }

  private calculateRelativeEngagement(userData: any): number {
    // 简化实现：基于用户价值层?    const tierScores: Record<string, number> = {
      platinum: 1.0,
      gold: 0.7,
      silver: 0.4,
      bronze: 0.1,
    };
    return tierScores[userData.valueTier] || 0;
  }
}

// 预测模型基类
abstract class BaseModel {
  protected featureNames: string[] = [];

  abstract predict(features: number[]): number | number[];
  abstract train(trainingData: any[]): void;
  abstract getImportance(): Record<string, number>;

  protected normalizeFeatures(features: Record<string, number>): number[] {
    return this.featureNames.map(name => features[name] || 0);
  }
}

// 流失预测模型
class ChurnPredictionModel extends BaseModel {
  private weights: number[] = [];
  private intercept: number = 0;

  constructor() {
    super();
    this.featureNames = [
      'days_since_active',
      'visit_consistency',
      'feature_diversity',
      'interaction_intensity',
      'peak_hour_ratio',
    ];

    // 初始化权重（实际项目中应该通过训练获得?    this.weights = [-0.3, -0.4, 0.2, 0.3, -0.1];
    this.intercept = -1.5;
  }

  predict(features: number[]): number {
    const linear = this.weights.reduce(
      (sum, weight, i) => sum + weight * features[i],
      this.intercept
    );
    return 1 / (1 + Math.exp(-linear)); // sigmoid函数
  }

  train(trainingData: any[]): void {
    // 简化实现，在实际项目中使用真正的机器学习库
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('训练流失预测模型...')}

  getImportance(): Record<string, number> {
    const importance: Record<string, number> = {};
    this.featureNames.forEach((name, i) => {
      importance[name] = Math.abs(this.weights[i]);
    });
    return importance;
  }

  predictChurn(input: PredictionInput): ChurnPrediction {
    const features = this.normalizeFeatures(input.features);
    const probability = this.predict(features);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let timeframe: 'short_term' | 'medium_term' | 'long_term' = 'long_term';

    if (probability > 0.7) {
      riskLevel = 'high';
      timeframe = 'short_term';
    } else if (probability > 0.4) {
      riskLevel = 'medium';
      timeframe = 'medium_term';
    }

    const contributingFactors = this.identifyContributingFactors(features);
    const suggestions = this.generatePreventionSuggestions(
      riskLevel,
      contributingFactors
    );

    return {
      probability,
      riskLevel,
      timeframe,
      contributingFactors,
      preventionSuggestions: suggestions,
    };
  }

  private identifyContributingFactors(features: number[]): string[] {
    const factors: string[] = [];

    if (features[0] > 0.5) factors.push('长期未活?);
    if (features[1] < 0.3) factors.push('访问不规?);
    if (features[2] < 2) factors.push('功能使用单一');
    if (features[3] < 0.1) factors.push('互动频率?);

    return factors.slice(0, 3);
  }

  private generatePreventionSuggestions(
    riskLevel: string,
    factors: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (factors.includes('长期未活?)) {
      suggestions.push('发送个性化召回邮件');
    }

    if (factors.includes('访问不规?)) {
      suggestions.push('设置定期使用提醒');
    }

    if (factors.includes('功能使用单一')) {
      suggestions.push('推荐相关功能特?);
    }

    if (riskLevel === 'high') {
      suggestions.push('安排专属客服联系');
      suggestions.push('提供限时优惠激?);
    }

    return suggestions;
  }
}

// 价值预测模?class ValuePredictionModel extends BaseModel {
  private featureWeights: Record<string, number> = {
    login_frequency: 0.3,
    feature_diversity: 0.25,
    interaction_intensity: 0.2,
    days_since_register: 0.15,
    relative_engagement: 0.1,
  };

  predict(features: number[]): number {
    let score = 0;
    Object.entries(this.featureWeights).forEach(([feature, weight], index) => {
      score += (features[index] || 0) * weight;
    });

    return Math.min(100, Math.max(0, score * 20)); // 映射?-100
  }

  train(trainingData: any[]): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('训练价值预测模?..')}

  getImportance(): Record<string, number> {
    return { ...this.featureWeights };
  }

  predictValue(input: PredictionInput): ValuePrediction {
    const features = this.normalizeFeatures(input.features);
    const score = this.predict(features);

    const tier = this.determineValueTier(score);
    const growthPotential = this.calculateGrowthPotential(features);
    const tierChange = this.predictTierChange(features);

    return {
      score,
      tier,
      growthPotential,
      predictedTierChange: tierChange,
      confidenceInterval: [Math.max(0, score - 5), Math.min(100, score + 5)],
    };
  }

  private determineValueTier(score: number): any {
    if (score >= 85) return 'platinum';
    if (score >= 70) return 'gold';
    if (score >= 50) return 'silver';
    return 'bronze';
  }

  private calculateGrowthPotential(features: number[]): number {
    // 基于当前使用模式预测成长空间
    const currentDiversity = features[1] || 0; // feature_diversity
    const currentIntensity = features[2] || 0; // interaction_intensity

    // 如果功能使用多样性和互动强度都较低，说明有较大成长空?    const potential =
      (1 - currentDiversity / 10) * (1 - currentIntensity / 5) * 100;
    return Math.min(100, Math.max(0, potential));
  }

  private predictTierChange(features: number[]): any {
    const recentGrowth = features[0] || 0; // login_frequency (作为活跃度指?

    if (recentGrowth > 0.8) return 'increase';
    if (recentGrowth < 0.3) return 'decrease';
    return 'stable';
  }
}

// 机器学习预测引擎主类
export class MLPredictionEngine {
  private featureEngineer: FeatureEngineer;
  private churnModel: ChurnPredictionModel;
  private valueModel: ValuePredictionModel;
  private predictionCache: Map<string, PredictionOutput>;
  private cacheExpiry: number = 30 * 60 * 1000; // 30分钟缓存

  constructor() {
    this.featureEngineer = new FeatureEngineer();
    this.churnModel = new ChurnPredictionModel();
    this.valueModel = new ValuePredictionModel();
    this.predictionCache = new Map();
  }

  // 生成完整预测
  async predictUserOutcomes(
    userData: any,
    behaviorData: any[],
    systemData: any = {}
  ): Promise<PredictionOutput> {
    const cacheKey = `${userData.userId}_${Math.floor(Date.now() / this.cacheExpiry)}`;
    const cached = this.predictionCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // 特征工程
    const basicFeatures = this.featureEngineer.extractBasicFeatures(userData);
    const behavioralFeatures =
      this.featureEngineer.extractBehavioralFeatures(behaviorData);
    const contextualFeatures = this.featureEngineer.extractContextualFeatures(
      userData,
      systemData
    );

    const allFeatures = {
      ...basicFeatures,
      ...behavioralFeatures,
      ...contextualFeatures,
    };

    const input: PredictionInput = {
      userId: userData.userId,
      features: allFeatures,
      timestamp: new Date().toISOString(),
    };

    // 执行各项预测
    const churnPrediction = this.churnModel.predictChurn(input);
    const valuePrediction = this.valueModel.predictValue(input);
    const behaviorPrediction = this.predictBehaviorTrends(input);
    const engagementPrediction = this.predictEngagementLevel(input, userData);

    // 计算综合置信?    const confidence = this.calculateOverallConfidence(
      churnPrediction.probability,
      valuePrediction.score,
      engagementPrediction.currentLevel
    );

    const prediction: PredictionOutput = {
      userId: userData.userId,
      predictions: {
        churnRisk: churnPrediction,
        valueScore: valuePrediction,
        behaviorTrend: behaviorPrediction,
        engagementLevel: engagementPrediction,
      },
      confidence,
      timestamp: new Date().toISOString(),
    };

    // 缓存结果
    this.predictionCache.set(cacheKey, prediction);

    // 清理过期缓存
    this.cleanupCache();

    return prediction;
  }

  // 批量预测
  async batchPredict(
    usersData: any[],
    behaviorsData: Record<string, any[]>
  ): Promise<PredictionOutput[]> {
    const predictions: PredictionOutput[] = [];

    for (const userData of usersData) {
      try {
        const behaviorData = behaviorsData[userData.userId] || [];
        const prediction = await this.predictUserOutcomes(
          userData,
          behaviorData
        );
        predictions.push(prediction);
      } catch (error) {
        console.error(`预测用户 ${userData.userId} 失败:`, error);
      }
    }

    return predictions;
  }

  // 获取模型重要?  getModelImportance(): Record<string, Record<string, number>> {
    return {
      churn: this.churnModel.getImportance(),
      value: this.valueModel.getImportance(),
    };
  }

  // 私有方法
  private predictBehaviorTrends(input: PredictionInput): BehaviorPrediction {
    const features = input.features;

    // 基于历史行为预测下一步可能的动作
    const likelyActions = this.predictLikelyActions(features);
    const featureAdoption = this.predictFeatureAdoption(features);
    const patternChanges = this.predictPatternChanges(features);

    return {
      nextLikelyActions: likelyActions,
      featureAdoption,
      usagePatternChanges: patternChanges,
    };
  }

  private predictEngagementLevel(
    input: PredictionInput,
    userData: any
  ): EngagementPrediction {
    const features = this.valueModel['normalizeFeatures'](input.features);
    const score = this.valueModel.predict(features);

    let currentLevel: any = 'medium';
    if (score > 80) currentLevel = 'very_high';
    else if (score > 60) currentLevel = 'high';
    else if (score > 40) currentLevel = 'medium';
    else if (score > 20) currentLevel = 'low';
    else currentLevel = 'very_low';

    // 简化趋势预?    const trend: any = features[0] > 0.5 ? 'increasing' : 'decreasing';

    return {
      currentLevel,
      trend,
      predictedLevel: currentLevel, // 简化处?      timeToNextLevel: 30, // 默认30�?    };
  }

  private predictLikelyActions(features: Record<string, number>): Array<any> {
    const actions = [];

    if (features.feature_diversity < 3) {
      actions.push({
        action: 'explore_advanced_features',
        probability: 0.7,
        timeframe: '1-2周内',
      });
    }

    if (features.interaction_intensity < 0.2) {
      actions.push({
        action: 'increase_daily_interactions',
        probability: 0.6,
        timeframe: '2-4周内',
      });
    }

    return actions;
  }

  private predictFeatureAdoption(features: Record<string, number>): Array<any> {
    const adoptions = [];

    if (features.feature_diversity < 5) {
      adoptions.push({
        feature: '高级分析功能',
        likelihood: 0.8,
        expectedTimeline: '1个月?,
      });
    }

    return adoptions;
  }

  private predictPatternChanges(features: Record<string, number>): string[] {
    const changes = [];

    if (features.visit_consistency < 0.5) {
      changes.push('访问时间将更加规?);
    }

    if (features.peak_hour_ratio > 0.3) {
      changes.push('活跃时段趋于集中');
    }

    return changes;
  }

  private calculateOverallConfidence(
    churnProb: number,
    valueScore: number,
    engagement: string
  ): number {
    // 基于多个预测结果计算综合置信?    const churnConfidence = 1 - Math.abs(churnProb - 0.5) * 2; // 流失概率越极端，置信度越?    const valueConfidence = valueScore > 80 || valueScore < 20 ? 0.9 : 0.7;
    const engagementLevels: Record<string, number> = {
      very_high: 0.9,
      high: 0.8,
      medium: 0.7,
      low: 0.6,
      very_low: 0.5,
    };
    const engagementConfidence = engagementLevels[engagement] || 0.7;

    return (churnConfidence + valueConfidence + engagementConfidence) / 3;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, prediction] of this.predictionCache.entries()) {
      const predictionTime = new Date(prediction.timestamp).getTime();
      if (now - predictionTime > this.cacheExpiry) {
        this.predictionCache.delete(key);
      }
    }
  }
}

// 预测服务?export class PredictionService {
  private engine: MLPredictionEngine;
  private userModelCache: Map<string, any>;

  constructor() {
    this.engine = new MLPredictionEngine();
    this.userModelCache = new Map();
  }

  // 初始化服?  initialize(userData: any[], behaviorData: any[]) {
    // 缓存用户数据以便快速访?    userData.forEach(user => {
      this.userModelCache.set(user.userId, user);
    });
  }

  // 获取单个用户预测
  async getUserPredictions(
    userId: string,
    behaviorData: any[]
  ): Promise<PredictionOutput> {
    const userData = this.userModelCache.get(userId);
    if (!userData) {
      throw new Error(`用户数据不存? ${userId}`);
    }

    return await this.engine.predictUserOutcomes(userData, behaviorData);
  }

  // 获取高风险用户列?  async getHighRiskUsers(
    behaviorDataMap: Record<string, any[]>,
    threshold: number = 0.6
  ): Promise<any[]> {
    const highRiskUsers: any[] = [];
    const users = Array.from(this.userModelCache.values());

    for (const user of users) {
      try {
        const behaviorData = behaviorDataMap[user.userId] || [];
        const prediction = await this.getUserPredictions(
          user.userId,
          behaviorData
        );

        if (prediction.predictions.churnRisk.probability > threshold) {
          highRiskUsers.push({
            userId: user.userId,
            email: user.email,
            churnProbability: prediction.predictions.churnRisk.probability,
            riskLevel: prediction.predictions.churnRisk.riskLevel,
            preventionActions:
              prediction.predictions.churnRisk.preventionSuggestions,
          });
        }
      } catch (error) {
        console.error(`分析用户 ${user.userId} 风险时出?`, error);
      }
    }

    return highRiskUsers.sort(
      (a, b) => b.churnProbability - a.churnProbability
    );
  }

  // 获取最有价值用?  async getTopValueUsers(
    behaviorDataMap: Record<string, any[]>,
    limit: number = 20
  ): Promise<any[]> {
    const valuableUsers: any[] = [];
    const users = Array.from(this.userModelCache.values());

    for (const user of users) {
      try {
        const behaviorData = behaviorDataMap[user.userId] || [];
        const prediction = await this.getUserPredictions(
          user.userId,
          behaviorData
        );

        valuableUsers.push({
          userId: user.userId,
          email: user.email,
          valueScore: prediction.predictions.valueScore.score,
          valueTier: prediction.predictions.valueScore.tier,
          growthPotential: prediction.predictions.valueScore.growthPotential,
        });
      } catch (error) {
        console.error(`分析用户 ${user.userId} 价值时出错:`, error);
      }
    }

    return valuableUsers
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, limit);
  }
}
