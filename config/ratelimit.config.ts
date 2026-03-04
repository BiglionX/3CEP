/**
 * API限流配置文件
 */

export interface RateLimitRule {
  // 限流规则名称
  name: string;
  // 匹配路径模式（支持通配符）
  pathPattern: string | RegExp;
  // 请求方法限制
  methods?: string[];
  // 限流配置
  config: {
    windowMs: number; // 时间窗口（毫秒）
    maxRequests: number; // 最大请求数
    banDuration?: number; // 封禁时长（毫秒）
  };
  // 限流类型
  type: 'api' | 'sensitive' | 'auth' | 'search' | 'custom';
  // 是否启用
  enabled: boolean;
  // 描述信息
  description: string;
}

// 采购智能体模块限流规则
export const PROCUREMENT_INTELLIGENCE_RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    name: 'supplier-profiling-rate-limit',
    pathPattern: '/api/procurement-intelligence/supplier-profiling*',
    methods: ['GET', 'POST'],
    config: {
      windowMs: 60000, // 1分钟
      maxRequests: 50, // 最多50次请求
      banDuration: 3600000, // 封禁1小时
    },
    type: 'api',
    enabled: true,
    description: '供应商画像API限流',
  },
  {
    name: 'market-intelligence-rate-limit',
    pathPattern: '/api/procurement-intelligence/market-intelligence*',
    methods: ['GET', 'POST'],
    config: {
      windowMs: 60000,
      maxRequests: 30,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '市场情报API限流',
  },
  {
    name: 'risk-analysis-rate-limit',
    pathPattern: '/api/procurement-intelligence/risk-analysis*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 20,
      banDuration: 7200000, // 封禁2小时（敏感操作）
    },
    type: 'sensitive',
    enabled: true,
    description: '风险分析API限流',
  },
  {
    name: 'decision-engine-rate-limit',
    pathPattern: '/api/procurement-intelligence/decision-engine*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 15,
      banDuration: 7200000,
    },
    type: 'sensitive',
    enabled: true,
    description: '决策引擎API限流',
  },
  {
    name: 'price-optimization-rate-limit',
    pathPattern: '/api/procurement-intelligence/price-optimization*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 25,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '价格优化API限流',
  },
  {
    name: 'market-intelligence-rate-limit',
    pathPattern: '/api/procurement-intelligence/market-intelligence*',
    methods: ['GET', 'POST'],
    config: {
      windowMs: 60000,
      maxRequests: 30,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '市场情报API限流',
  },
  {
    name: 'risk-analysis-rate-limit',
    pathPattern: '/api/procurement-intelligence/risk-analysis*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 20,
      banDuration: 7200000, // 封禁2小时（敏感操作）
    },
    type: 'sensitive',
    enabled: true,
    description: '风险分析API限流',
  },
  {
    name: 'decision-engine-rate-limit',
    pathPattern: '/api/procurement-intelligence/decision-engine*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 15,
      banDuration: 7200000,
    },
    type: 'sensitive',
    enabled: true,
    description: '决策引擎API限流',
  },
  {
    name: 'price-optimization-rate-limit',
    pathPattern: '/api/procurement-intelligence/price-optimization*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 25,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '价格优化API限流',
  },
  {
    name: 'auth-sensitive-rate-limit',
    pathPattern: '/api/auth/*',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 5,
      banDuration: 3600000,
    },
    type: 'auth',
    enabled: true,
    description: '认证相关API限流',
  },
  {
    name: 'enterprise-api-rate-limit',
    pathPattern: '/api/enterprise/*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    config: {
      windowMs: 60000,
      maxRequests: 100,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '企业服务API限流',
  },
  {
    name: 'admin-api-rate-limit',
    pathPattern: '/api/admin/*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    config: {
      windowMs: 60000,
      maxRequests: 200,
      banDuration: 7200000,
    },
    type: 'sensitive',
    enabled: true,
    description: '管理API限流',
  },
];

// 全局限流规则
export const GLOBAL_RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    name: 'global-api-rate-limit',
    pathPattern: '/api/*',
    config: {
      windowMs: 60000,
      maxRequests: 1000,
      banDuration: 3600000,
    },
    type: 'api',
    enabled: true,
    description: '全局API限流',
  },
  {
    name: 'search-rate-limit',
    pathPattern: '*search*',
    config: {
      windowMs: 60000,
      maxRequests: 30,
      banDuration: 1800000,
    },
    type: 'search',
    enabled: true,
    description: '搜索功能限流',
  },
  {
    name: 'login-rate-limit',
    pathPattern: '/login',
    methods: ['POST'],
    config: {
      windowMs: 60000,
      maxRequests: 10,
      banDuration: 3600000,
    },
    type: 'auth',
    enabled: true,
    description: '登录页面限流',
  },
  {
    name: 'register-rate-limit',
    pathPattern: '/api/auth/register',
    methods: ['POST'],
    config: {
      windowMs: 3600000, // 1小时窗口
      maxRequests: 5, // 每小时最多5次注册
      banDuration: 86400000, // 封禁24小时
    },
    type: 'auth',
    enabled: true,
    description: '用户注册限流',
  },
  {
    name: 'marketing-demo-rate-limit',
    pathPattern: '/api/marketing/demo/*',
    methods: ['POST'],
    config: {
      windowMs: 3600000,
      maxRequests: 20,
      banDuration: 1800000,
    },
    type: 'api',
    enabled: true,
    description: '营销演示API限流',
  },
];

// 获取匹配的限流规则
export function getMatchingRateLimitRules(
  pathname: string,
  method: string
): RateLimitRule[] {
  const allRules = [
    ...PROCUREMENT_INTELLIGENCE_RATE_LIMIT_RULES,
    ...GLOBAL_RATE_LIMIT_RULES,
  ];

  return allRules.filter(rule => {
    if (!rule.enabled) return false;

    // 检查方法限制
    if (rule.methods && !rule.methods.includes(method)) {
      return false;
    }

    // 检查路径匹配
    if (typeof rule.pathPattern === 'string') {
      // 简单的通配符匹配
      const pattern = rule.pathPattern.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(pathname);
    } else if (rule.pathPattern instanceof RegExp) {
      return rule.pathPattern.test(pathname);
    }

    return false;
  });
}

// 默认限流配置
export const DEFAULT_RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1分钟
  maxRequests: 100, // 100次请求
  banDuration: 3600000, // 1小时
};

export default {
  PROCUREMENT_INTELLIGENCE_RATE_LIMIT_RULES,
  GLOBAL_RATE_LIMIT_RULES,
  getMatchingRateLimitRules,
  DEFAULT_RATE_LIMIT_CONFIG,
};
