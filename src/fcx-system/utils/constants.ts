/**
 * FCX系统常量定义
 */

// 汇率常量
export const FXC_EXCHANGE_RATES = {
  USD_TO_FCX: 100,        // 1 USD = 100 FCX
  FCX_TO_USD: 0.01,       // 1 FCX = 0.01 USD
} as const;

// 质押相关常量
export const STAKING_CONSTANTS = {
  MIN_AMOUNT: 1000,       // 最低质押金额
  MAX_AMOUNT: 100000,     // 最高质押金额
  DEFAULT_AMOUNT: 5000,   // 默认质押金额
  LOCK_PERIOD_DAYS: 30,   // 锁定期（天）
} as const;

// 奖励计算常量
export const REWARD_CONSTANTS = {
  BASE_PERCENTAGE: 0.1,   // 基础奖励百分比 (10%)
  MIN_RATING_FOR_REWARD: 3.0, // 获得奖励的最低评分
  MAX_RATING_MULTIPLIER: 1.5, // 最高评分倍数
  LEVEL_BONUS: {
    BRONZE: 1.0,          // 青铜级无加成
    SILVER: 1.1,          // 白银级10%加成
    GOLD: 1.2,            // 黄金级20%加成
    DIAMOND: 1.5,         // 钻石级50%加成
  },
} as const;

// 等级阈值常量
export const LEVEL_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  DIAMOND: 20000,
} as const;

// 交易相关常量
export const TRANSACTION_CONSTANTS = {
  MIN_TRANSFER_AMOUNT: 1,     // 最小转账金额
  MAX_TRANSFER_AMOUNT: 1000000, // 最大转账金额
  TRANSACTION_FEE: 0,         // 交易手续费（暂为0）
  BATCH_TRANSFER_LIMIT: 100,  // 批量转账限制
} as const;

// 工单相关常量
export const ORDER_CONSTANTS = {
  ORDER_NUMBER_PREFIX: 'FCX', // 工单编号前缀
  ORDER_NUMBER_LENGTH: 12,    // 工单编号长度
  MAX_ORDER_DESCRIPTION: 1000, // 工单描述最大长度
  RATING_SCALE: 5,            // 评分满分
  MIN_RATING: 0,              // 最低评分
  MAX_RATING: 5,              // 最高评分
} as const;

// 系统配置常量
export const SYSTEM_CONSTANTS = {
  CACHE_TTL: 300,             // 缓存过期时间（秒）
  MAX_RETRY_ATTEMPTS: 3,      // 最大重试次数
  REQUEST_TIMEOUT: 5000,      // 请求超时时间（毫秒）
  BATCH_SIZE: 100,            // 批处理大小
} as const;

// 期权相关常量
export const OPTION_CONSTANTS = {
  EXPIRY_DAYS: 730,           // 期权有效期（天）
  MIN_REDEMPTION_AMOUNT: 100, // 最小兑换金额
  MAX_REDEMPTION_AMOUNT: 10000, // 最大兑换金额
} as const;

// 风控相关常量
export const RISK_CONSTANTS = {
  HIGH_RISK_THRESHOLD: 0.8,   // 高风险阈值
  SUSPICIOUS_TRANSACTION_COUNT: 10, // 可疑交易次数阈值
  ACCOUNT_FREEZE_DURATION: 86400, // 账户冻结时长（秒）
} as const;

// 数据库相关常量
export const DB_CONSTANTS = {
  MAX_CONNECTIONS: 20,        // 最大连接数
  CONNECTION_TIMEOUT: 10000,  // 连接超时（毫秒）
  QUERY_TIMEOUT: 30000,       // 查询超时（毫秒）
} as const;