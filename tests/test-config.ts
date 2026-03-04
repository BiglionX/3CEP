// 测试环境配置
export const TEST_ENV = {
  // 环境URL配置
  urls: {
    development: 'http://localhost:3001',
    test: 'https://test.fixcycle.com',
    staging: 'https://staging.fixcycle.com',
    production: 'https://fixcycle.com',
  },

  // 当前测试环境
  currentEnv: process.env.TEST_ENV || 'development',

  // 获取当前环境URL
  getBaseUrl(): string {
    return (
      this.urls[this.currentEnv as keyof typeof this.urls] ||
      this.urls.development
    );
  },

  // 测试超时配置
  timeouts: {
    pageLoad: 30000,
    elementAppear: 10000,
    apiResponse: 15000,
    navigation: 30000,
    testExecution: 300000, // 5分钟
  },

  // 重试配置
  retry: {
    maxAttempts: 3,
    delay: 1000,
    exponentialBackoff: true,
  },

  // 并行执行配置
  parallel: {
    workers: process.env.CI ? 4 : 8,
    shardCount: process.env.CI ? 4 : 1,
  },

  // 报告配置
  reporting: {
    outputDir: 'test-results',
    screenshotOnFailure: true,
    traceOnFailure: true,
    videoOnFailure: true,
  },
};

// 移动设备配置
export const MOBILE_DEVICES = {
  iPhone12: {
    name: 'iPhone 12 Pro',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  SamsungGalaxy: {
    name: 'Samsung Galaxy S21',
    userAgent:
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  iPadAir: {
    name: 'iPad Air',
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
};

// 桌面分辨率配置
export const DESKTOP_RESOLUTIONS = {
  hd: { width: 1366, height: 768 },
  fhd: { width: 1920, height: 1080 },
  qhd: { width: 2560, height: 1440 },
  uhd: { width: 3840, height: 2160 },
};

// 测试数据路径
export const TEST_DATA_PATHS = {
  users: 'test-data/test-users.json',
  storage: 'test-data/storage-states',
  screenshots: 'test-results/screenshots',
  videos: 'test-results/videos',
  traces: 'test-results/traces',
};
