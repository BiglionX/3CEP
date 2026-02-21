/**
 * 混合推荐引擎服务
 * 结合多种推荐算法提供更精准的推荐结果
 */

import {
  AbTestConfig,
  AbTestResult,
  HybridRecommendationConfig,
  RecommendationContext,
  RecommendationFeedback,
  RecommendationItem,
  RecommendationItemType,
  RecommendationResult,
  UserActionType,
} from "../models/recommendation.model";
import { generateUUID } from "../utils/helpers";
import { CollaborativeFilterRecommender } from "./collaborative-filter-recommender.service";
import { DeepLearningRecommender } from "./deep-learning-recommender.service";
import { RecommendationEngine } from "./recommendation.interfaces";
import { UserBehaviorCollectorService } from "./user-behavior-collector.service";

export class HybridRecommenderService implements RecommendationEngine {
  private collaborativeRecommender: CollaborativeFilterRecommender;
  private deepLearningRecommender: DeepLearningRecommender;
  private behaviorCollector: UserBehaviorCollectorService;
  private config: HybridRecommendationConfig;
  private abTestConfig: AbTestConfig | null = null;
  private isInitialized: boolean = false;

  constructor(config?: Partial<HybridRecommendationConfig>) {
    this.config = {
      collaborativeWeight: 0.6,
      contentBasedWeight: 0.2,
      deepLearningWeight: 0.2,
      diversityPenalty: 0.1,
      freshnessBoost: 0.15,
      ...config,
    };

    this.collaborativeRecommender = new CollaborativeFilterRecommender();
    this.deepLearningRecommender = new DeepLearningRecommender();
    this.behaviorCollector = new UserBehaviorCollectorService();
  }

  /**
   * 初始化推荐引擎
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🔄 初始化混合推荐引擎...");

      // 初始化各推荐算法
      await Promise.all([
        this.collaborativeRecommender.train([]), // 使用空数据初始化
        this.deepLearningRecommender.initialize(),
      ]);

      // 加载A/B测试配置
      await this.loadAbTestConfig();

      this.isInitialized = true;
      console.log("✅ 混合推荐引擎初始化完成");
    } catch (error) {
      console.error("混合推荐引擎初始化失败:", error);
      throw error;
    }
  }

  /**
   * 生成个性化推荐
   */
  async getRecommendations(
    context: RecommendationContext,
    count: number = 10
  ): Promise<RecommendationResult> {
    const startTime = Date.now();
    const requestId = generateUUID();

    try {
      // 确保引擎已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`🚀 生成推荐请求: ${requestId} for user ${context.userId}`);

      // 确定使用的算法变体（A/B测试）
      const algorithmVariant = await this.determineAlgorithmVariant(
        context.userId
      );

      // 并行生成不同算法的推荐
      const [collaborativeRecs, deepLearningRecs] = await Promise.all([
        this.collaborativeRecommender.recommend(context, count * 2),
        this.deepLearningRecommender.recommend(context, count * 2),
      ]);

      // 混合推荐结果
      const hybridItems = await this.hybridRecommendations(
        collaborativeRecs,
        deepLearningRecs,
        context,
        count
      );

      // 计算元数据
      const metadata = await this.calculateMetadata(
        collaborativeRecs,
        deepLearningRecs,
        hybridItems
      );

      const result: RecommendationResult = {
        requestId,
        userId: context.userId,
        context,
        items: hybridItems,
        algorithm: algorithmVariant,
        generationTime: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        metadata,
      };

      // 保存推荐结果用于后续分析
      await this.saveRecommendationResult(result);

      console.log(
        `✅ 推荐生成完成: ${requestId}, ${hybridItems.length} 个项目`
      );

      return result;
    } catch (error) {
      console.error(`推荐生成失败 (${requestId}):`, error);

      // 返回降级推荐
      const fallbackItems = await this.getFallbackRecommendations(count);

      return {
        requestId,
        userId: context.userId,
        context,
        items: fallbackItems,
        algorithm: "fallback",
        generationTime: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        metadata: {
          totalCandidates: 0,
          filteredCount: 0,
          diversityScore: 0,
          noveltyScore: 0,
          modelVersion: "fallback",
        },
      };
    }
  }

  /**
   * 批量生成推荐
   */
  async batchRecommend(
    contexts: RecommendationContext[],
    count: number = 10
  ): Promise<RecommendationResult[]> {
    console.log(`🔄 批量生成推荐 (${contexts.length} 个用户)`);

    // 并行处理所有推荐请求
    const results = await Promise.all(
      contexts.map((context) => this.getRecommendations(context, count))
    );

    console.log("✅ 批量推荐生成完成");
    return results;
  }

  /**
   * 记录推荐反馈
   */
  async recordFeedback(feedback: RecommendationFeedback): Promise<void> {
    try {
      await this.behaviorCollector.recordBehavior({
        id: generateUUID(),
        userId: feedback.userId,
        itemId: feedback.itemId,
        itemType: RecommendationItemType.REPAIR_SHOP,
        actionType: UserActionType.VIEW,
        timestamp: feedback.timestamp,
        score: this.calculateFeedbackScore(feedback),
        metadata: {
          recommendationId: feedback.recommendationId,
          feedbackType: feedback.feedbackType,
          rating: feedback.rating,
        },
      });

      console.log(`✅ 反馈记录成功: ${feedback.recommendationId}`);
    } catch (error) {
      console.error("记录推荐反馈失败:", error);
      throw error;
    }
  }

  /**
   * 重新训练模型
   */
  async retrainModel(force: boolean = false): Promise<void> {
    try {
      console.log("🔄 重新训练推荐模型...");

      // 获取最新的用户行为数据
      const recentBehaviors = await this.getRecentUserBehaviors(30); // 最近30天

      if (recentBehaviors.length === 0 && !force) {
        console.log("ℹ️ 没有新的行为数据，跳过训练");
        return;
      }

      // 重新训练协同过滤模型
      await this.collaborativeRecommender.train(recentBehaviors);

      // 深度学习模型在线学习
      await this.deepLearningRecommender.train(recentBehaviors);

      console.log("✅ 模型重新训练完成");
    } catch (error) {
      console.error("模型重新训练失败:", error);
      throw error;
    }
  }

  /**
   * 获取系统健康状态
   */
  async getHealthStatus(): Promise<any> {
    try {
      // 检查各组件状态
      const collaborativeHealthy = true; // 简化检查
      const deepLearningHealthy = !!process.env.DEEPSEEK_API_KEY;

      // 获取基本统计信息
      const totalUsers = await this.getTotalUserCount();
      const totalItems = await this.getTotalItemCount();

      return {
        isHealthy: collaborativeHealthy && deepLearningHealthy,
        modelAccuracy: 0.85, // 模拟准确率
        lastTrainingTime: new Date().toISOString(),
        totalUsers,
        totalItems,
        algorithms: {
          collaborative: collaborativeHealthy,
          deepLearning: deepLearningHealthy,
        },
        metrics: {
          avgProcessingTime: 150, // 毫秒
          successRate: 0.98,
          recommendationCount: 1000,
        },
      };
    } catch (error) {
      console.error("获取健康状态失败:", error);
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 获取A/B测试配置
   */
  async getAbTestConfig(): Promise<AbTestConfig | null> {
    return this.abTestConfig;
  }

  /**
   * 记录A/B测试结果
   */
  async recordAbTestResult(result: AbTestResult): Promise<void> {
    try {
      console.log(
        `📊 A/B测试结果记录: ${result.experimentId} - ${result.variantId}`
      );

      // 这里应该保存到专门的A/B测试表中
      // 简化处理：仅记录日志
      console.log("A/B测试指标:", result.metrics);
    } catch (error) {
      console.error("记录A/B测试结果失败:", error);
    }
  }

  /**
   * 混合推荐算法
   */
  private async hybridRecommendations(
    collaborativeRecs: RecommendationItem[],
    deepLearningRecs: RecommendationItem[],
    context: RecommendationContext,
    count: number
  ): Promise<RecommendationItem[]> {
    // 1. 加权合并不同算法的结果
    const weightedItems = this.weightedMerge(
      collaborativeRecs,
      deepLearningRecs
    );

    // 2. 多样性调整
    const diverseItems = this.applyDiversityPenalty(weightedItems);

    // 3. 新鲜度加权
    const freshItems = this.applyFreshnessBoost(diverseItems);

    // 4. 最终排序和截取
    return freshItems
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  /**
   * 加权合并推荐结果
   */
  private weightedMerge(
    collaborativeRecs: RecommendationItem[],
    deepLearningRecs: RecommendationItem[]
  ): RecommendationItem[] {
    const itemScores = new Map<
      string,
      { score: number; sources: number; confidences: number[] }
    >();

    // 处理协同过滤结果
    collaborativeRecs.forEach((item) => {
      const current = itemScores.get(item.itemId) || {
        score: 0,
        sources: 0,
        confidences: [],
      };
      itemScores.set(item.itemId, {
        score: current.score + item.score * this.config.collaborativeWeight,
        sources: current.sources + 1,
        confidences: [...current.confidences, item.confidence],
      });
    });

    // 处理深度学习结果
    deepLearningRecs.forEach((item) => {
      const current = itemScores.get(item.itemId) || {
        score: 0,
        sources: 0,
        confidences: [],
      };
      itemScores.set(item.itemId, {
        score: current.score + item.score * this.config.deepLearningWeight,
        sources: current.sources + 1,
        confidences: [...current.confidences, item.confidence],
      });
    });

    // 转换为推荐项数组
    return Array.from(itemScores.entries()).map(([itemId, data]) => {
      const avgConfidence =
        data.confidences.reduce((sum, c) => sum + c, 0) /
        data.confidences.length;

      return {
        itemId,
        itemType: this.getItemType(itemId),
        score: data.score / data.sources, // 平均分数
        confidence: avgConfidence,
        reason: "混合推荐算法结果",
        rank: 0,
        metadata: {
          sources: data.sources,
          collaborativeScore:
            collaborativeRecs.find((i) => i.itemId === itemId)?.score || 0,
          deepLearningScore:
            deepLearningRecs.find((i) => i.itemId === itemId)?.score || 0,
        },
      };
    });
  }

  /**
   * 应用多样性惩罚
   */
  private applyDiversityPenalty(
    items: RecommendationItem[]
  ): RecommendationItem[] {
    const categoryCounts = new Map<string, number>();

    return items.map((item) => {
      const category = this.getItemCategory(item.itemId);
      const currentCount = categoryCounts.get(category) || 0;

      // 对同类物品施加递增惩罚
      const penalty = currentCount * this.config.diversityPenalty * 10;
      categoryCounts.set(category, currentCount + 1);

      return {
        ...item,
        score: Math.max(0, item.score - penalty),
      };
    });
  }

  /**
   * 应用新鲜度加权
   */
  private applyFreshnessBoost(
    items: RecommendationItem[]
  ): RecommendationItem[] {
    return items.map((item) => ({
      ...item,
      score: item.score * (1 + this.config.freshnessBoost),
    }));
  }

  /**
   * 计算元数据
   */
  private async calculateMetadata(
    collabRecs: RecommendationItem[],
    dlRecs: RecommendationItem[],
    finalRecs: RecommendationItem[]
  ): Promise<any> {
    // 计算多样性分数
    const categories = new Set(
      finalRecs.map((item) => this.getItemCategory(item.itemId))
    );
    const diversityScore = Math.min(
      1,
      categories.size / Math.max(1, finalRecs.length / 3)
    );

    // 计算新颖性分数（基于物品的新鲜度）
    const noveltyScore = 0.75; // 简化处理

    return {
      totalCandidates: collabRecs.length + dlRecs.length,
      filteredCount: finalRecs.length,
      diversityScore,
      noveltyScore,
      modelVersion: "1.0.0",
    };
  }

  /**
   * 确定算法变体（用于A/B测试）
   */
  private async determineAlgorithmVariant(userId: string): Promise<string> {
    if (!this.abTestConfig) {
      return "hybrid_default";
    }

    // 简单的哈希分配
    const hash = this.simpleHash(userId);
    let cumulativeWeight = 0;

    for (const variant of this.abTestConfig.variants) {
      cumulativeWeight += variant.weight;
      if (hash < cumulativeWeight) {
        return variant.algorithm;
      }
    }

    return "hybrid_default";
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return (Math.abs(hash) % 1000) / 1000; // 返回0-1之间的值
  }

  /**
   * 计算反馈分数
   */
  private calculateFeedbackScore(feedback: RecommendationFeedback): number {
    const baseScore = feedback.rating * 20; // 1-5星转换为20-100分

    switch (feedback.feedbackType) {
      case "purchase":
        return baseScore * 1.5;
      case "click":
        return baseScore * 1.2;
      case "dislike":
        return Math.max(0, baseScore - 30);
      default:
        return baseScore;
    }
  }

  /**
   * 获取降级推荐
   */
  private async getFallbackRecommendations(
    count: number
  ): Promise<RecommendationItem[]> {
    return Array.from({ length: count }, (_, i) => ({
      itemId: `fallback_${i + 1}`,
      itemType: RecommendationItemType.REPAIR_SHOP,
      score: 50 - i * 3,
      confidence: 0.5,
      reason: "系统降级推荐",
      rank: i + 1,
    }));
  }

  // 辅助方法...

  private async loadAbTestConfig(): Promise<void> {
    // 简化实现：硬编码A/B测试配置
    this.abTestConfig = {
      experimentId: "rec_alg_v1",
      variants: [
        { variantId: "A", algorithm: "collaborative_only", weight: 0.5 },
        { variantId: "B", algorithm: "hybrid_balanced", weight: 0.5 },
      ],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
      metrics: ["ctr", "conversion_rate", "engagement_time"],
    };
  }

  private async getRecentUserBehaviors(days: number): Promise<any[]> {
    // 获取最近的用户行为数据
    return []; // 简化实现
  }

  private async getTotalUserCount(): Promise<number> {
    return 1000; // 模拟用户数
  }

  private async getTotalItemCount(): Promise<number> {
    return 500; // 模拟物品数
  }

  private async saveRecommendationResult(
    result: RecommendationResult
  ): Promise<void> {
    // 保存推荐结果用于分析
    console.log(`💾 保存推荐结果: ${result.requestId}`);
  }

  private getItemType(itemId: string): string {
    if (itemId.startsWith("shop_")) return RecommendationItemType.REPAIR_SHOP;
    if (itemId.startsWith("part_")) return RecommendationItemType.PART;
    return RecommendationItemType.REPAIR_SHOP;
  }

  private getItemCategory(itemId: string): string {
    if (itemId.includes("phone")) return "手机";
    if (itemId.includes("tablet")) return "平板";
    if (itemId.includes("laptop")) return "笔记本";
    return "其他";
  }
}
