// FixCycle 测试体系配置

module.exports = {
  // 测试环境变量配置
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://localhost:5432/fixcycle_test',
    NEXT_PUBLIC_API_URL: 'http://localhost:3000'
  },

  // 覆盖率门槛配置
  coverage: {
    threshold: 80,
    branchThreshold: 75,
    functionThreshold: 80,
    lineThreshold: 85
  },

  // 质量门禁配置
  qualityGates: {
    score: 75,
    passRateThreshold: 85,
    maxAllowedFailures: 5
  },

  // CI/CD配置
  ci: {
    enabled: true,
    playwrightJUnitOutputName: 'playwright-junit.xml',
    jestJUnitOutputDir: './test-results',
    jestJUnitOutputName: 'jest-junit.xml'
  },

  // 报告输出配置
  reports: {
    outputDir: './test-results',
    coverageDir: './coverage',
    htmlEnabled: true,
    jsonEnabled: true
  },

  // 测试超时配置（毫秒）
  timeouts: {
    unit: 5000,
    integration: 30000,
    e2e: 60000,
    performance: 120000
  },

  // 并行测试配置
  parallel: {
    maxWorkers: 4,
    enabled: true
  },

  // Docker配置（用于测试环境）
  docker: {
    network: 'fixcycle-test-network',
    postgresContainer: 'fixcycle-postgres-test',
    redisContainer: 'fixcycle-redis-test'
  },

  // n8n测试配置
  n8n: {
    baseUrl: 'http://localhost:5678',
    apiToken: process.env.N8N_API_TOKEN,
    testDataPassRate: 90
  },

  // 性能测试配置
  performance: {
    concurrentUsers: 10,
    duration: 60,
    rampUp: 10
  },

  // 安全扫描配置
  security: {
    scanDepth: 'full',
    vulnerabilityThreshold: 'medium',
    dependencyCheckEnabled: true
  },

  // 浏览器测试配置
  browsers: {
    list: ['chromium', 'firefox', 'webkit'],
    headless: true,
    videoRecording: false,
    screenshotOnFailure: true
  },

  // 测试数据配置
  testData: {
    seedEnabled: true,
    cleanup: true,
    mockExternalServices: true
  },

  // 日志配置
  logging: {
    level: 'info',
    logToFile: true,
    logFilePath: './test-results/test-logs.log'
  },

  // 通知配置
  notifications: {
    slack: true,
    email: false,
    threshold: 'failure'
  },

  // 缓存配置
  cache: {
    enabled: true,
    durationHours: 24
  }
};