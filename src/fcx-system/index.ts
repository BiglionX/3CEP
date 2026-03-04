/**
 * FCX系统主入口文? * 导出所有核心模块和服务
 */

// 数据模型导出
export * from './models/fcx-account.model';
export * from './models/recommendation.model';

// 服务接口导出
export * from './services/interfaces';
export * from './services/recommendation.interfaces';

// 核心服务实现
export * from './services/alliance.service';
export * from './services/fcx-account.service';
export * from './services/fcx-transaction.service';
export * from './services/fcx2-option.service';
export * from './services/fcx2-reward.service';
export * from './services/repair-order.service';
// export * from './services/system-stats.service';
export * from './services/enhanced-payment.service';
export * from './services/payment.service';
export * from './services/quotation-consumption.service';
// export * from './services/risk-control.service';

// 推荐引擎服务
export * from './services/collaborative-filter-recommender.service';
export * from './services/deep-learning-recommender.service';
export * from './services/hybrid-recommender.service';
export * from './services/item-profile.service';
export * from './services/user-behavior-collector.service';
export * from './services/user-profile.service';

// 工具函数导出（暂时注释，避免循环依赖?// export * from './utils/constants';
// export * from './utils/helpers';
// export * from './utils/validators';

// 配置导出（暂时注释）
// export * from './config/fcx-config';

/**
 * FCX系统版本信息
 */
export const FCX_SYSTEM_VERSION = '1.0.0';

/**
 * FCX系统配置常量
 */
export const FCX_CONSTANTS = {
  // 汇率设置
  USD_TO_FCX_RATE: 100, // 1 USD = 100 FCX

  // 质押要求
  MIN_STAKING_AMOUNT: 1000, // 最低质?000 FCX
  MAX_STAKING_AMOUNT: 100000, // 最高质?00000 FCX

  // 奖励设置
  BASE_REWARD_PERCENTAGE: 0.1, // 基础奖励10%
  MAX_RATING_MULTIPLIER: 1.5, // 最高评分倍数1.5�?
  // 等级阈?  BRONZE_THRESHOLD: 0,
  SILVER_THRESHOLD: 1000,
  GOLD_THRESHOLD: 5000,
  DIAMOND_THRESHOLD: 20000,

  // 期权有效?  OPTION_EXPIRY_DAYS: 730, // 2年有效期

  // 系统设置
  TRANSACTION_FEE: 0, // 交易手续费（暂设?�?  MIN_TRANSFER_AMOUNT: 1, // 最小转账金?};
