/**
 * 性能测试配置文件
 * 定义性能测试的标准、阈值和环境配置
 */

module.exports = {
  // 测试环境配置
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      apiBaseUrl: 'http://localhost:3001/api',
      timeout: 10000,
      headless: false,
    },
    production: {
      baseUrl: 'https://your-production-url.com',
      apiBaseUrl: 'https://your-production-url.com/api',
      timeout: 15000,
      headless: true,
    },
  },

  // 性能基准阈值
  performanceThresholds: {
    // 页面加载性能
    pageLoad: {
      firstContentfulPaint: 1800, // ms
      largestContentfulPaint: 2500, // ms
      firstInputDelay: 100, // ms
      cumulativeLayoutShift: 0.1, // score
      speedIndex: 3400, // ms
    },

    // API响应性能
    apiResponse: {
      maxResponseTime: 500, // ms
      p95ResponseTime: 800, // ms
      errorRate: 1, // percentage
      throughput: 50, // requests per second
    },

    // 前端组件性能
    componentRendering: {
      maxRenderTime: 100, // ms
      maxUpdateTime: 50, // ms
      memoryGrowth: 10, // MB per minute
    },

    // 用户交互性能
    userInteraction: {
      clickResponseTime: 100, // ms
      scrollSmoothness: 60, // fps
      animationFrameRate: 55, // fps
    },
  },

  // 测试场景配置
  testScenarios: {
    // 关键用户路径
    criticalPaths: [
      {
        name: '登录流程',
        path: '/login',
        steps: [
          { action: 'navigate', url: '/login' },
          { action: 'fill', selector: '#email', value: 'test@example.com' },
          { action: 'fill', selector: '#password', value: 'password123' },
          { action: 'click', selector: '#login-button' },
          { action: 'waitForNavigation', url: '/dashboard' },
        ],
        expectedMaxTime: 3000, // ms
      },
      {
        name: '工单创建流程',
        path: '/work-orders/create',
        steps: [
          { action: 'navigate', url: '/work-orders' },
          { action: 'click', selector: '#create-order-btn' },
          { action: 'fill', selector: '#customer-name', value: '测试客户' },
          { action: 'fill', selector: '#device-model', value: 'iPhone 14' },
          { action: 'fill', selector: '#issue-description', value: '屏幕损坏' },
          { action: 'click', selector: '#submit-order' },
          { action: 'waitForElement', selector: '.success-message' },
        ],
        expectedMaxTime: 5000, // ms
      },
    ],

    // 数据密集型操作
    dataOperations: [
      {
        name: '大数据表格渲染',
        endpoint: '/api/work-orders?page=1&size=100',
        expectedMaxTime: 1500, // ms
        expectedMemoryUsage: 50, // MB
      },
      {
        name: '复杂搜索操作',
        endpoint: '/api/search?q=test&type=all&filters=active',
        expectedMaxTime: 800, // ms
        expectedMemoryUsage: 30, // MB
      },
    ],
  },

  // 监控指标配置
  monitoringMetrics: {
    // Web Vitals指标
    webVitals: [
      'FCP', // First Contentful Paint
      'LCP', // Largest Contentful Paint
      'FID', // First Input Delay
      'CLS', // Cumulative Layout Shift
      'TTFB', // Time to First Byte
    ],

    // 自定义性能指标
    customMetrics: [
      'componentRenderTime',
      'apiCallDuration',
      'dataProcessingTime',
      'userActionLatency',
    ],

    // 资源加载监控
    resourceMonitoring: [
      'jsBundleSize',
      'cssBundleSize',
      'imageAssetsSize',
      'totalPageWeight',
    ],
  },

  // 报告配置
  reporting: {
    formats: ['json', 'html', 'markdown'],
    outputPath: './reports/performance/',
    includeScreenshots: true,
    includeMetricsCharts: true,
    comparisonWithBaseline: true,
  },

  // 测试执行配置
  execution: {
    iterations: 5, // 每个测试场景执行次数
    warmupIterations: 2, // 预热执行次数
    parallelExecutions: 3, // 并行执行数量
    retryAttempts: 2, // 失败重试次数
    randomizeOrder: true, // 随机化测试顺序
  },
};
