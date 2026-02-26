/**
 * 企业用户端E2E测试全局配置
 * 包含测试环境变量和全局设置
 */

// 测试环境变量配置
export const ENVIRONMENT_CONFIG = {
  // 开发环境配置
  development: {
    BASE_URL: process.env.DEV_BASE_URL || 'http://localhost:3001',
    API_BASE_URL: process.env.DEV_API_BASE_URL || 'http://localhost:3001/api',
    TIMEOUT: parseInt(process.env.DEV_TIMEOUT || '30000'),
    HEADLESS: process.env.DEV_HEADLESS !== 'false'
  },
  
  // 测试环境配置
  test: {
    BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3003',
    API_BASE_URL: process.env.TEST_API_BASE_URL || 'http://localhost:3003/api',
    TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
    HEADLESS: process.env.TEST_HEADLESS !== 'false'
  },
  
  // 生产环境配置
  production: {
    BASE_URL: process.env.PROD_BASE_URL || 'https://your-domain.com',
    API_BASE_URL: process.env.PROD_API_BASE_URL || 'https://your-domain.com/api',
    TIMEOUT: parseInt(process.env.PROD_TIMEOUT || '30000'),
    HEADLESS: process.env.PROD_HEADLESS !== 'false'
  }
};

// 当前环境配置
export const CURRENT_ENV = process.env.NODE_ENV || 'test';
export const CURRENT_CONFIG = ENVIRONMENT_CONFIG[CURRENT_ENV as keyof typeof ENVIRONMENT_CONFIG];

// 测试数据配置
export const TEST_CONSTANTS = {
  // 测试等待时间
  DEFAULT_TIMEOUT: 30000,
  ELEMENT_WAIT_TIMEOUT: 5000,
  PAGE_LOAD_TIMEOUT: 30000,
  API_RESPONSE_TIMEOUT: 10000,
  
  // 重试配置
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  
  // 并发配置
  MAX_CONCURRENT_TESTS: parseInt(process.env.MAX_CONCURRENT_TESTS || '4'),
  
  // 截图配置
  SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE !== 'false',
  SCREENSHOT_PATH: './test-results/screenshots',
  
  // 视频录制配置
  RECORD_VIDEO: process.env.RECORD_VIDEO === 'true',
  VIDEO_PATH: './test-results/videos'
};

// 日志配置
export const LOGGING_CONFIG = {
  ENABLED: process.env.LOGGING_ENABLED !== 'false',
  LEVEL: process.env.LOG_LEVEL || 'info',
  OUTPUT_PATH: './test-results/logs',
  FORMAT: 'json'
};

// 报告配置
export const REPORTING_CONFIG = {
  HTML_REPORT: {
    OUTPUT_DIR: './test-results/html-report',
    OPEN: process.env.CI ? 'never' : 'on-failure'
  },
  JSON_REPORT: {
    OUTPUT_FILE: './test-results/enterprise-e2e-results.json'
  },
  JUNIT_REPORT: {
    OUTPUT_FILE: './test-results/enterprise-e2e-junit.xml'
  }
};

// 安全配置
export const SECURITY_CONFIG = {
  // 敏感数据脱敏
  MASK_SENSITIVE_DATA: process.env.MASK_SENSITIVE_DATA !== 'false',
  
  // 安全头验证
  VERIFY_SECURITY_HEADERS: process.env.VERIFY_SECURITY_HEADERS === 'true',
  
  // SSL证书验证
  IGNORE_SSL_ERRORS: process.env.IGNORE_SSL_ERRORS === 'true'
};

// 性能监控配置
export const PERFORMANCE_CONFIG = {
  // 性能指标收集
  COLLECT_PERFORMANCE_METRICS: process.env.COLLECT_PERFORMANCE_METRICS === 'true',
  
  // 性能基准
  PERFORMANCE_THRESHOLDS: {
    PAGE_LOAD_TIME: 3000, // ms
    API_RESPONSE_TIME: 500, // ms
    FIRST_PAINT: 1000, // ms
    DOM_CONTENT_LOADED: 2000 // ms
  },
  
  // 内存监控
  MONITOR_MEMORY_USAGE: process.env.MONITOR_MEMORY_USAGE === 'true'
};

// 数据库测试配置
export const DATABASE_CONFIG = {
  // 测试数据库连接
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  
  // 数据清理策略
  CLEANUP_STRATEGY: process.env.CLEANUP_STRATEGY || 'after_each', // before_each, after_each, manual
  
  // 测试数据隔离
  ISOLATE_TEST_DATA: process.env.ISOLATE_TEST_DATA !== 'false'
};

// 第三方服务配置
export const THIRD_PARTY_CONFIG = {
  // 邮件服务测试
  EMAIL_SERVICE_TESTING: process.env.EMAIL_SERVICE_TESTING === 'true',
  
  // SMS服务测试
  SMS_SERVICE_TESTING: process.env.SMS_SERVICE_TESTING === 'true',
  
  // 支付网关测试
  PAYMENT_GATEWAY_TESTING: process.env.PAYMENT_GATEWAY_TESTING === 'true'
};

// CI/CD集成配置
export const CI_CONFIG = {
  // 是否在CI环境中运行
  IS_CI: !!process.env.CI,
  
  // CI特定配置
  CI_RETRY_COUNT: parseInt(process.env.CI_RETRY_COUNT || '2'),
  CI_PARALLEL_JOBS: parseInt(process.env.CI_PARALLEL_JOBS || '2'),
  
  // 工件上传配置
  UPLOAD_ARTIFACTS: process.env.UPLOAD_ARTIFACTS !== 'false',
  ARTIFACTS_PATH: './test-results'
};

// 导出配置对象
export default {
  ENVIRONMENT_CONFIG,
  CURRENT_ENV,
  CURRENT_CONFIG,
  TEST_CONSTANTS,
  LOGGING_CONFIG,
  REPORTING_CONFIG,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG,
  DATABASE_CONFIG,
  THIRD_PARTY_CONFIG,
  CI_CONFIG
};