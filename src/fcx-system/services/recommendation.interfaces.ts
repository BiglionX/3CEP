/**
 * FCX智能推荐引擎服务接口定义
 */

import {
  AbTestConfig,
  AbTestResult,
  ItemProfile,
  RecommendationContext,
  RecommendationFeedback,
  RecommendationItem,
  RecommendationResult,
  UserBehavior,
  UserProfile,
} from '../models/recommendation.model';

// 推荐算法接口
export interface Recommender {
  /**
   * 训练推荐模型
   * @param userData 用户行为数据
   */
  train(userData: UserBehavior[]): Promise<void>;

  /**
   * 生成推荐
   * @param context 推荐上下?   * @param count 推荐数量
   */
  recommend(
    context: RecommendationContext,
    count?: number
  ): Promise<RecommendationItem[]>;

  /**
   * 获取算法类型标识
   */
  getType(): string;

  /**
   * 更新配置
   * @param config 配置对象
   */
  updateConfig(config: any): Promise<void>;
}

// 用户行为收集服务接口
export interface UserBehaviorCollector {
  /**
   * 记录用户行为
   * @param behavior 用户行为数据
   */
  recordBehavior(behavior: UserBehavior): Promise<void>;

  /**
   * 批量记录用户行为
   * @param behaviors 用户行为数组
   */
  recordBehaviors(behaviors: UserBehavior[]): Promise<void>;

  /**
   * 获取用户历史行为
   * @param userId 用户ID
   * @param limit 限制数量
   */
  getUserBehaviors(userId: string, limit?: number): Promise<UserBehavior[]>;

  /**
   * 清理过期行为数据
   * @param days 保留天数
   */
  cleanupOldBehaviors(days: number): Promise<number>;
}

// 用户画像服务接口
export interface UserProfileService {
  /**
   * 构建或更新用户画?   * @param userId 用户ID
   */
  buildUserProfile(userId: string): Promise<UserProfile>;

  /**
   * 获取用户画像
   * @param userId 用户ID
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /**
   * 更新用户偏好
   * @param userId 用户ID
   * @param preferences 新偏?   */
  updateUserPreferences(userId: string, preferences: any): Promise<void>;

  /**
   * 计算用户相似?   * @param userId1 用户1
   * @param userId2 用户2
   */
  calculateUserSimilarity(userId1: string, userId2: string): Promise<number>;
}

// 物品画像服务接口
export interface ItemProfileService {
  /**
   * 构建或更新物品画?   * @param itemId 物品ID
   * @param itemType 物品类型
   */
  buildItemProfile(itemId: string, itemType: string): Promise<ItemProfile>;

  /**
   * 获取物品画像
   * @param itemId 物品ID
   */
  getItemProfile(itemId: string): Promise<ItemProfile | null>;

  /**
   * 批量构建物品画像
   * @param itemIds 物品ID数组
   */
  buildItemProfiles(itemIds: string[]): Promise<void>;

  /**
   * 计算物品相似?   * @param itemId1 物品1
   * @param itemId2 物品2
   */
  calculateItemSimilarity(itemId1: string, itemId2: string): Promise<number>;
}

// 推荐引擎主服务接?export interface RecommendationEngine {
  /**
   * 初始化推荐引?   */
  initialize(): Promise<void>;

  /**
   * 生成个性化推荐
   * @param context 推荐上下?   * @param count 推荐数量，默?0
   */
  getRecommendations(
    context: RecommendationContext,
    count?: number
  ): Promise<RecommendationResult>;

  /**
   * 批量生成推荐
   * @param contexts 推荐上下文数?   * @param count 每个用户的推荐数?   */
  batchRecommend(
    contexts: RecommendationContext[],
    count?: number
  ): Promise<RecommendationResult[]>;

  /**
   * 记录推荐反馈
   * @param feedback 反馈数据
   */
  recordFeedback(feedback: RecommendationFeedback): Promise<void>;

  /**
   * 重新训练模型
   * @param force 是否强制重新训练
   */
  retrainModel(force?: boolean): Promise<void>;

  /**
   * 获取系统健康状?   */
  getHealthStatus(): Promise<{
    isHealthy: boolean;
    modelAccuracy?: number;
    lastTrainingTime?: string;
    totalUsers?: number;
    totalItems?: number;
    metrics?: Record<string, any>;
  }>;

  /**
   * 获取A/B测试配置
   */
  getAbTestConfig(): Promise<AbTestConfig | null>;

  /**
   * 记录A/B测试结果
   */
  recordAbTestResult(result: AbTestResult): Promise<void>;
}

// 数据存储接口
export interface RecommendationStorage {
  /**
   * 保存用户行为
   */
  saveUserBehavior(behavior: UserBehavior): Promise<void>;

  /**
   * 获取用户行为列表
   */
  getUserBehaviors(userId: string, limit?: number): Promise<UserBehavior[]>;

  /**
   * 保存用户画像
   */
  saveUserProfile(profile: UserProfile): Promise<void>;

  /**
   * 获取用户画像
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /**
   * 保存物品画像
   */
  saveItemProfile(profile: ItemProfile): Promise<void>;

  /**
   * 获取物品画像
   */
  getItemProfile(itemId: string): Promise<ItemProfile | null>;

  /**
   * 保存推荐结果
   */
  saveRecommendationResult(result: RecommendationResult): Promise<void>;

  /**
   * 保存反馈数据
   */
  saveFeedback(feedback: RecommendationFeedback): Promise<void>;

  /**
   * 获取推荐历史
   */
  getRecommendationHistory(
    userId: string,
    limit?: number
  ): Promise<RecommendationResult[]>;
}
