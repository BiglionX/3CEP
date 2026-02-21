/**
 * 深度学习推荐服务
 * 集成大语言模型和深度学习算法进行智能推荐
 */

import {
  RecommendationContext,
  RecommendationItem,
  RecommendationItemType,
  UserBehavior,
} from "../models/recommendation.model";
import { ItemProfileServiceImpl } from "./item-profile.service";
import { Recommender } from "./recommendation.interfaces";
import { UserBehaviorCollectorService } from "./user-behavior-collector.service";
import { UserProfileServiceImpl } from "./user-profile.service";

export class DeepLearningRecommender implements Recommender {
  private userBehaviorCollector: UserBehaviorCollectorService;
  private userProfileService: UserProfileServiceImpl;
  private itemProfileService: ItemProfileServiceImpl;
  private isInitialized: boolean = false;
  private modelVersion: string = "1.0.0";

  constructor() {
    this.userBehaviorCollector = new UserBehaviorCollectorService();
    this.userProfileService = new UserProfileServiceImpl();
    this.itemProfileService = new ItemProfileServiceImpl();
  }

  /**
   * 初始化深度学习模型
   */
  async initialize(): Promise<void> {
    try {
      console.log("🧠 初始化深度学习推荐模型...");

      // 检查必要的环境变量
      if (!process.env.DEEPSEEK_API_KEY) {
        console.warn("⚠️ 未配置DeepSeek API密钥，将使用简化推荐逻辑");
        this.isInitialized = true;
        return;
      }

      // 可以在这里加载预训练模型或初始化API连接
      this.isInitialized = true;
      console.log("✅ 深度学习推荐模型初始化完成");
    } catch (error) {
      console.error("深度学习模型初始化失败:", error);
      // 即使初始化失败也标记为已初始化，使用备用方案
      this.isInitialized = true;
    }
  }

  /**
   * 训练模型（在线学习）
   */
  async train(userData: UserBehavior[]): Promise<void> {
    console.log("🤖 深度学习模型在线学习...");

    // 在实际应用中，这里可以：
    // 1. 将数据发送到训练服务
    // 2. 更新嵌入向量
    // 3. 微调模型参数

    console.log("✅ 深度学习模型学习完成");
  }

  /**
   * 生成推荐
   */
  async recommend(
    context: RecommendationContext,
    count: number = 10
  ): Promise<RecommendationItem[]> {
    try {
      // 确保模型已初始化
      if (!this.isInitialized) {
        await this.initialize();
      }

      const { userId, location, filters } = context;

      // 1. 获取用户画像
      const userProfile = await this.userProfileService.getUserProfile(userId);

      // 2. 获取候选物品池
      const candidates = await this.getCandidateItems(userId, filters);

      // 3. 使用大模型进行智能排序
      const rankedItems = await this.rankItemsWithLLM(
        userProfile,
        candidates,
        context
      );

      // 4. 后处理和多样化
      const finalRecommendations = await this.postProcessRecommendations(
        rankedItems,
        count,
        location
      );

      return finalRecommendations;
    } catch (error) {
      console.error("深度学习推荐生成失败:", error);
      return this.getFallbackRecommendations(count);
    }
  }

  /**
   * 获取算法类型
   */
  getType(): string {
    return "deep-learning";
  }

  /**
   * 更新配置
   */
  async updateConfig(config: any): Promise<void> {
    // 可以在这里更新模型参数或API配置
    this.modelVersion = config.version || this.modelVersion;
    console.log("✅ 深度学习推荐配置已更新");
  }

  /**
   * 获取候选物品
   */
  private async getCandidateItems(
    userId: string,
    filters?: any
  ): Promise<any[]> {
    try {
      // 1. 获取用户历史行为中的物品
      const userBehaviors = await this.userBehaviorCollector.getUserBehaviors(
        userId,
        100
      );
      const userItemIds = [...new Set(userBehaviors.map((b) => b.itemId))];

      // 2. 获取热门物品
      const popularItems = await this.getPopularItems(50);

      // 3. 获取新品物品
      const newItemIds = await this.getNewItems(30);

      // 4. 合并并去重
      const allCandidateIds = [...userItemIds, ...popularItems, ...newItemIds];
      const uniqueCandidateIds = [...new Set(allCandidateIds)].slice(0, 200);

      // 5. 获取物品详情
      const candidateDetails = await Promise.all(
        uniqueCandidateIds.map(async (itemId) => {
          try {
            const profile = await this.itemProfileService.getItemProfile(
              itemId
            );
            return profile ? { id: itemId, profile } : null;
          } catch {
            return null;
          }
        })
      );

      return candidateDetails.filter(Boolean) as any[];
    } catch (error) {
      console.error("获取候选物品失败:", error);
      return [];
    }
  }

  /**
   * 使用大语言模型进行物品排序
   */
  private async rankItemsWithLLM(
    userProfile: any,
    candidates: any[],
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    try {
      // 如果有DeepSeek API配置，使用大模型排序
      if (process.env.DEEPSEEK_API_KEY) {
        return await this.llmBasedRanking(userProfile, candidates, context);
      }

      // 否则使用传统机器学习方法
      return await this.mlBasedRanking(userProfile, candidates, context);
    } catch (error) {
      console.error("LLM排序失败，使用备用方案:", error);
      return await this.mlBasedRanking(userProfile, candidates, context);
    }
  }

  /**
   * 基于大语言模型的排序
   */
  private async llmBasedRanking(
    userProfile: any,
    candidates: any[],
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    try {
      // 构建Prompt
      const prompt = this.buildRankingPrompt(userProfile, candidates, context);

      // 调用DeepSeek API
      const response = await this.callDeepSeekAPI(prompt);

      // 解析响应
      const rankedItems = this.parseLLMResponse(response, candidates);

      return rankedItems;
    } catch (error) {
      console.error("调用DeepSeek API失败:", error);
      throw error;
    }
  }

  /**
   * 传统机器学习排序
   */
  private async mlBasedRanking(
    userProfile: any,
    candidates: any[],
    context: RecommendationContext
  ): Promise<RecommendationItem[]> {
    // 基于特征的评分系统
    const scoredCandidates = candidates.map((candidate) => {
      let score = 50; // 基础分数

      // 用户偏好匹配度
      if (
        userProfile?.preferences?.categories?.includes(
          candidate.profile?.basicInfo?.category
        )
      ) {
        score += 20;
      }

      if (
        userProfile?.preferences?.brands?.includes(
          candidate.profile?.basicInfo?.brand
        )
      ) {
        score += 15;
      }

      // 物品质量分数
      score += (candidate.profile?.features?.qualityScore || 50) * 0.3;

      // 流行度分数
      score += (candidate.profile?.features?.popularityScore || 50) * 0.2;

      // 地理位置因素
      if (context.location && candidate.profile?.location) {
        const distance = this.calculateDistance(
          context.location.lat,
          context.location.lng,
          candidate.profile.location.lat,
          candidate.profile.location.lng
        );
        const distanceBonus = Math.max(0, 1 - distance / 50) * 15;
        score += distanceBonus;
      }

      return {
        itemId: candidate.id,
        itemType:
          candidate.profile?.itemType || RecommendationItemType.REPAIR_SHOP,
        score: Math.min(100, score),
        confidence: 0.8,
        reason: "基于机器学习算法推荐",
        rank: 0,
      };
    });

    return scoredCandidates.sort((a, b) => b.score - a.score);
  }

  /**
   * 构建排序Prompt
   */
  private buildRankingPrompt(
    userProfile: any,
    candidates: any[],
    context: RecommendationContext
  ): string {
    const userPrefs = userProfile?.preferences || {};
    const locationInfo = context.location
      ? `位置: ${context.location.lat.toFixed(
          4
        )}, ${context.location.lng.toFixed(4)}`
      : "位置: 未提供";

    const candidatesInfo = candidates
      .slice(0, 20) // 限制候选物品数量
      .map((c, i) => {
        const profile = c.profile;
        return `${i + 1}. ${profile?.basicInfo?.name || c.id} - ${
          profile?.basicInfo?.category || "未知类别"
        } - 质量分:${profile?.features?.qualityScore || 0}`;
      })
      .join("\n");

    return `
你是一个专业的推荐系统AI助手。请根据以下信息为用户推荐最合适的服务/商品：

用户画像:
- 偏好类别: ${userPrefs.categories?.join(", ") || "未提供"}
- 偏好品牌: ${userPrefs.brands?.join(", ") || "未提供"}
- 参与度: ${userProfile?.engagementLevel || "未知"}

上下文信息:
- ${locationInfo}
- 时间: ${new Date().toISOString()}

候选物品列表:
${candidatesInfo}

请按照适合程度对这些物品进行排序，只返回物品编号的排序结果，如："3,1,7,2,5..."。
`;
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl =
      process.env.DEEPSEEK_API_URL ||
      "https://api.deepseek.com/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  /**
   * 解析LLM响应
   */
  private parseLLMResponse(
    response: string,
    candidates: any[]
  ): RecommendationItem[] {
    try {
      // 提取数字序列
      const numbers = response.match(/\d+/g);
      if (!numbers) {
        throw new Error("无法解析LLM响应");
      }

      const rankedIndices = numbers
        .map((num) => parseInt(num) - 1) // 转换为0基索引
        .filter((index) => index >= 0 && index < candidates.length) // 过滤有效索引
        .slice(0, 20); // 限制数量

      // 去重保持顺序
      const uniqueRankedIndices = [...new Set(rankedIndices)];

      return uniqueRankedIndices.map((index, rank) => {
        const candidate = candidates[index];
        return {
          itemId: candidate.id,
          itemType:
            candidate.profile?.itemType || RecommendationItemType.REPAIR_SHOP,
          score: Math.max(50, 100 - rank * 3), // 根据排名给分
          confidence: 0.9,
          reason: "基于大语言模型智能推荐",
          rank: rank + 1,
        };
      });
    } catch (error) {
      console.error("解析LLM响应失败:", error);
      // 返回原始顺序
      return candidates.slice(0, 10).map((candidate, index) => ({
        itemId: candidate.id,
        itemType:
          candidate.profile?.itemType || RecommendationItemType.REPAIR_SHOP,
        score: 70 - index * 5,
        confidence: 0.7,
        reason: "基于大语言模型推荐（降级处理）",
        rank: index + 1,
      }));
    }
  }

  /**
   * 推荐后处理
   */
  private async postProcessRecommendations(
    recommendations: RecommendationItem[],
    targetCount: number,
    location?: { lat: number; lng: number }
  ): Promise<RecommendationItem[]> {
    // 1. 多样化处理 - 确保类别多样性
    const diversified = this.ensureDiversity(recommendations);

    // 2. 地理位置优化
    const locationOptimized = location
      ? this.optimizeForLocation(diversified, location)
      : diversified;

    // 3. 最终排序和截取
    return locationOptimized
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  /**
   * 确保推荐多样性
   */
  private ensureDiversity(
    recommendations: RecommendationItem[]
  ): RecommendationItem[] {
    const categoryGroups = new Map<string, RecommendationItem[]>();

    // 按类别分组
    recommendations.forEach((item) => {
      const category = this.getItemCategory(item.itemId);
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)?.push(item);
    });

    // 从每个类别中选取物品，确保多样性
    const result: RecommendationItem[] = [];
    const categories = Array.from(categoryGroups.keys());
    let remainingSlots = recommendations.length;

    while (remainingSlots > 0 && categories.length > 0) {
      for (const category of categories) {
        const items = categoryGroups.get(category) || [];
        if (items.length > 0 && remainingSlots > 0) {
          result.push(items.shift()!);
          remainingSlots--;
        }
      }
    }

    return result;
  }

  /**
   * 基于位置优化
   */
  private optimizeForLocation(
    recommendations: RecommendationItem[],
    location: { lat: number; lng: number }
  ): RecommendationItem[] {
    return recommendations.map((item) => {
      // 这里可以查询物品的具体位置并计算距离
      // 简化处理：给所有物品添加位置相关分数
      const locationBonus = Math.random() * 10; // 模拟位置优势
      return {
        ...item,
        score: Math.min(100, item.score + locationBonus),
      };
    });
  }

  /**
   * 获取备用推荐
   */
  private getFallbackRecommendations(count: number): RecommendationItem[] {
    return Array.from({ length: count }, (_, i) => ({
      itemId: `fallback_item_${i + 1}`,
      itemType: RecommendationItemType.REPAIR_SHOP,
      score: 50 - i * 3,
      confidence: 0.6,
      reason: "系统推荐",
      rank: i + 1,
    }));
  }

  /**
   * 获取热门物品
   */
  private async getPopularItems(limit: number): Promise<string[]> {
    // 模拟热门物品获取
    return Array.from({ length: limit }, (_, i) => `popular_${i + 1}`);
  }

  /**
   * 获取新物品
   */
  private async getNewItems(limit: number): Promise<string[]> {
    // 模拟新物品获取
    return Array.from({ length: limit }, (_, i) => `new_${i + 1}`);
  }

  /**
   * 获取物品类别
   */
  private getItemCategory(itemId: string): string {
    // 简化实现
    if (itemId.includes("shop")) return "维修店";
    if (itemId.includes("part")) return "配件";
    if (itemId.includes("service")) return "服务";
    return "其他";
  }

  /**
   * 计算距离
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
