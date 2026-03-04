/**
 * FCX智能推荐引擎数据模型
 * 包含用户行为、推荐结果、画像等相关数据结构
 */

// 用户行为类型枚举
export enum UserActionType {
  VIEW = 'view', // 浏览
  SEARCH = 'search', // 搜索
  PURCHASE = 'purchase', // 购买
  REPAIR = 'repair', // 维修
  BOOKMARK = 'bookmark', // 收藏
  COMPARE = 'compare', // 对比
  SHARE = 'share', // 分享
  COMMENT = 'comment', // 评论
}

// 推荐物品类型
export enum RecommendationItemType {
  REPAIR_SHOP = 'repair_shop', // 维修?  PART = 'part', // 配件
  SERVICE = 'service', // 服务
  DEVICE = 'device', // 设备
  ACCESSORY = 'accessory', // 配件附件
}

// 用户行为记录
export interface UserBehavior {
  id: string;
  userId: string;
  itemId: string; // 物品ID（维修店ID、配件ID等）
  itemType: RecommendationItemType;
  actionType: UserActionType;
  timestamp: string;
  score: number; // 行为权重分数 (1.0-5.0)
  context?: {
    location?: { lat: number; lng: number }; // 地理位置
    deviceInfo?: string; // 设备信息
    sessionId?: string; // 会话ID
    userAgent?: string; // 用户代理
    referrer?: string; // 来源页面
  };
  metadata?: Record<string, any>; // 额外元数?}

// 用户画像
export interface UserProfile {
  userId: string;
  demographics?: {
    age?: number;
    gender?: string;
    location?: { city: string; province: string; country: string };
    deviceTypes?: string[]; // 常用设备类型
  };
  preferences: {
    categories: string[]; // 偏好类别
    brands: string[]; // 偏好品牌
    priceRange?: [number, number]; // 价格区间偏好
    serviceTypes?: string[]; // 偏好服务类型
  };
  behaviorSummary: {
    totalActions: number; // 总行为次?    recentActivityDays: number; // 最近活跃天?    favoriteCategories: string[]; // 最喜欢的类?    avgSessionDuration?: number; // 平均会话时长
  };
  engagementLevel: 'low' | 'medium' | 'high'; // 用户参与度等?  lastUpdated: string;
}

// 物品画像
export interface ItemProfile {
  itemId: string;
  itemType: RecommendationItemType;
  basicInfo: {
    name: string;
    description?: string;
    category: string;
    brand?: string;
    price?: number;
  };
  features: {
    tags: string[]; // 标签
    attributes: Record<string, any>; // 属性特?    popularityScore: number; // 流行度分?    qualityScore: number; // 质量分数
  };
  statistics: {
    viewCount: number;
    purchaseCount: number;
    rating?: number;
    reviewCount?: number;
  };
  location?: {
    lat: number;
    lng: number;
    city?: string;
    province?: string;
  };
  lastUpdated: string;
}

// 推荐项目
export interface RecommendationItem {
  itemId: string;
  itemType: RecommendationItemType;
  score: number; // 推荐分数 (0-100)
  confidence: number; // 置信?(0-1)
  reason: string; // 推荐理由
  rank: number; // 排名
  metadata?: {
    similarityScore?: number; // 相似度分?    diversityScore?: number; // 多样性分?    noveltyScore?: number; // 新颖性分?    popularityBoost?: number; // 流行度加?  };
}

// 推荐请求上下?export interface RecommendationContext {
  userId: string;
  location?: { lat: number; lng: number };
  deviceType?: string;
  timeOfDay?: string;
  season?: string;
  specialEvent?: string; // 特殊事件（节日、促销等）
  filters?: {
    categories?: string[];
    priceRange?: [number, number];
    brands?: string[];
    distanceLimit?: number; // 距离限制（公里）
  };
}

// 推荐响应结果
export interface RecommendationResult {
  requestId: string;
  userId: string;
  context: RecommendationContext;
  items: RecommendationItem[];
  algorithm: string; // 使用的算?  generationTime: string;
  processingTimeMs: number;
  metadata: {
    totalCandidates: number;
    filteredCount: number;
    diversityScore: number; // 结果多样性分?    noveltyScore: number; // 结果新颖性分?    modelVersion: string;
  };
}

// 协同过滤配置
export interface CollaborativeFilterConfig {
  similarityThreshold: number; // 相似度阈?(0.0-1.0)
  minCommonItems: number; // 最少共同项目数
  neighborhoodSize: number; // 邻居用户数量
  decayFactor: number; // 时间衰减因子
}

// 内容基础推荐配置
export interface ContentBasedConfig {
  tfidfWeight: number; // TF-IDF权重
  categoryWeight: number; // 类别权重
  brandWeight: number; // 品牌权重
  locationWeight: number; // 地理位置权重
}

// 混合推荐配置
export interface HybridRecommendationConfig {
  collaborativeWeight: number; // 协同过滤权重
  contentBasedWeight: number; // 内容基础权重
  deepLearningWeight: number; // 深度学习权重
  diversityPenalty: number; // 多样性惩罚系?  freshnessBoost: number; // 新鲜度加权系?}

// 推荐反馈
export interface RecommendationFeedback {
  userId: string;
  recommendationId: string;
  itemId: string;
  rating: number; // 评分 (1-5)
  feedbackType: 'click' | 'purchase' | 'skip' | 'dislike' | 'explicit';
  timestamp: string;
  metadata?: {
    timeToAction?: number; // 到行动的时间
    sessionDuration?: number; // 会话时长
    conversion?: boolean; // 是否转化
  };
}

// A/B测试相关
export interface AbTestConfig {
  experimentId: string;
  variants: Array<{
    variantId: string;
    algorithm: string;
    weight: number;
  }>;
  startDate: string;
  endDate: string;
  metrics: string[]; // 要跟踪的指标
}

export interface AbTestResult {
  experimentId: string;
  variantId: string;
  metrics: Record<string, number>;
  sampleSize: number;
  statisticalSignificance: boolean;
}
