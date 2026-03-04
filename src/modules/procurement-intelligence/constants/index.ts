// 采购智能体常量定?
export const PROCUREMENT_CONSTANTS = {
  // 评分权重配置
  SCORING_WEIGHTS: {
    QUALITY: 0.3,
    PRICE: 0.25,
    DELIVERY: 0.2,
    SERVICE: 0.15,
    INNOVATION: 0.1,
  },

  // 风险阈?  RISK_THRESHOLDS: {
    HIGH_RISK_SCORE: 80,
    MEDIUM_RISK_SCORE: 50,
    LOW_RISK_SCORE: 20,
  },

  // 价格波动阈?  PRICE_VOLATILITY: {
    HIGH: 0.15, // 15% 以上为高波动
    MEDIUM: 0.08, // 8-15% 为中等波?    LOW: 0.03, // 3-8% 为低波动
  },

  // 供应商等级标?  SUPPLIER_TIERS: {
    PREMIUM: 90, // 优质供应?>= 90�?    STANDARD: 70, // 标准供应?70-89�?    BASIC: 50, // 基础供应?50-69�?    RISKY: 0, // 风险供应?< 50�?  },

  // 决策置信度阈?  CONFIDENCE_LEVELS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
  },

  // 缓存配置
  CACHE_TTL: {
    SUPPLIER_PROFILE: 3600, // 1小时
    PRICE_INDEX: 1800, // 30分钟
    MARKET_DATA: 7200, // 2小时
    RISK_ASSESSMENT: 300, // 5分钟
  },

  // API限制
  API_LIMITS: {
    MAX_SUPPLIERS_PER_QUERY: 100,
    MAX_PRICE_HISTORY_DAYS: 365,
    MAX_DECISION_RECORDS: 1000,
  },
};

// 数据库表名常?export const TABLE_NAMES = {
  SUPPLIER_INTELLIGENCE_PROFILES: 'supplier_intelligence_profiles',
  INTERNATIONAL_PRICE_INDICES: 'international_price_indices',
  PROCUREMENT_DECISION_RECORDS: 'procurement_decision_records',
  SMART_PROCUREMENT_REQUESTS: 'smart_procurement_requests',
};

// API端点常量
export const API_ENDPOINTS = {
  SUPPLIER_PROFILING: '/api/procurement-intelligence/supplier-profiling',
  MARKET_INTELLIGENCE: '/api/procurement-intelligence/market-intelligence',
  RISK_ANALYSIS: '/api/procurement-intelligence/risk-analysis',
  DECISION_ENGINE: '/api/procurement-intelligence/decision-engine',
  PRICE_OPTIMIZATION: '/api/procurement-intelligence/price-optimization',
};

// 消息队列主题
export const MESSAGE_TOPICS = {
  SUPPLIER_DATA_UPDATE: 'supplier.data.update',
  PRICE_INDEX_UPDATE: 'price.index.update',
  RISK_ALERT: 'risk.alert',
  PROCUREMENT_DECISION: 'procurement.decision',
};

// 日志级别
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

// 国际货币代码
export const CURRENCY_CODES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  KRW: 'KRW',
};

// 主要贸易区域
export const TRADE_REGIONS = {
  ASIA_PACIFIC: 'asia_pacific',
  NORTH_AMERICA: 'north_america',
  EUROPE: 'europe',
  LATIN_AMERICA: 'latin_america',
  MIDDLE_EAST: 'middle_east',
  AFRICA: 'africa',
};
