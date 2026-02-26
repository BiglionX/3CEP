/**
 * 企业用户端E2E测试配置文件
 * 包含企业服务专用的测试配置和常量定义
 */

// 企业服务测试环境配置
export const ENTERPRISE_TEST_CONFIG = {
  // 基础URL配置
  urls: {
    dev: 'http://localhost:3001',
    test: 'http://localhost:3003',
    prod: 'https://your-domain.com'
  },
  
  // 默认测试环境
  defaultEnv: process.env.TEST_ENV || 'test',
  
  // 获取当前环境URL
  getBaseUrl(): string {
    return this.urls[this.defaultEnv as keyof typeof this.urls] || this.urls.test;
  },
  
  // 超时配置
  timeouts: {
    pageLoad: 30000,
    apiResponse: 10000,
    elementWait: 5000
  },
  
  // 浏览器视窗尺寸
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  }
};

// 企业用户测试账户配置
export const TEST_ENTERPRISE_USERS = {
  admin: {
    email: 'admin@enterprise.com',
    password: 'Admin123456',
    companyName: '企业管理员公司',
    role: 'enterprise_admin'
  },
  procurementManager: {
    email: 'procurement@enterprise.com',
    password: 'Procure123456',
    companyName: '采购经理公司',
    role: 'procurement_manager'
  },
  agentOperator: {
    email: 'agent@enterprise.com',
    password: 'Agent123456',
    companyName: '智能体操作员公司',
    role: 'agent_operator'
  },
  regularUser: {
    email: 'user@enterprise.com',
    password: 'User123456',
    companyName: '普通企业用户公司',
    role: 'enterprise_user'
  }
};

// 测试数据配置
export const TEST_DATA = {
  // 企业基本信息
  enterpriseInfo: {
    companyName: '测试科技有限公司',
    businessLicense: '91310000MA12345678',
    contactPerson: '测试联系人',
    phone: '13800138000',
    email: 'test@enterprise.com'
  },
  
  // 智能体测试数据
  agentData: {
    name: '测试智能体',
    description: '用于E2E测试的AI助手',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048
  },
  
  // 采购订单测试数据
  procurementOrder: {
    title: 'E2E测试采购订单',
    description: '端到端测试用采购需求',
    items: [
      {
        name: '测试设备',
        quantity: 10,
        unitPrice: 1000,
        category: '电子设备'
      }
    ],
    priority: 'medium'
  },
  
  // 配件测试数据
  partData: {
    name: '测试配件',
    category: '电子元件',
    brand: '测试品牌',
    model: 'TEST-MODEL-001',
    description: '用于测试的电子配件',
    price: 99.99,
    stockQuantity: 100
  }
};

// 企业服务页面路径映射
export const ENTERPRISE_ROUTES = {
  // 公共页面
  home: '/enterprise',
  services: '/enterprise/services',
  contact: '/enterprise/contact',
  
  // 认证相关
  login: '/enterprise/login',
  register: '/enterprise/register',
  forgotPassword: '/enterprise/forgot-password',
  
  // 管理后台
  dashboard: '/enterprise/dashboard',
  adminDashboard: '/enterprise/admin/dashboard',
  userProfile: '/enterprise/profile',
  settings: '/enterprise/settings',
  
  // 业务模块
  agents: '/enterprise/agents',
  agentsCustomize: '/enterprise/agents/customize',
  agentsDashboard: '/enterprise/agents/dashboard',
  
  procurement: '/enterprise/procurement',
  procurementDashboard: '/enterprise/procurement/dashboard',
  procurementOrders: '/enterprise/procurement/orders',
  procurementSuppliers: '/enterprise/procurement/suppliers',
  
  // API端点
  api: {
    register: '/api/enterprise/register',
    login: '/api/enterprise/login',
    logout: '/api/enterprise/logout',
    dashboard: '/api/enterprise/dashboard',
    agents: '/api/enterprise/agents',
    procurement: '/api/enterprise/procurement',
    parts: '/api/enterprise/parts',
    users: '/api/enterprise/users',
    profile: '/api/enterprise/profile'
  }
};

// 权限配置
export const PERMISSIONS = {
  // 管理员权限
  admin: [
    'enterprise_full_access',
    'enterprise_manage',
    'enterprise_agents_manage',
    'enterprise_procurement_manage',
    'users_manage',
    'settings_manage'
  ],
  
  // 采购经理权限
  procurement: [
    'enterprise_procurement_read',
    'enterprise_procurement_manage',
    'suppliers_read',
    'orders_manage'
  ],
  
  // 智能体操作员权限
  agent: [
    'enterprise_agents_read',
    'enterprise_agents_manage',
    'workflows_execute'
  ],
  
  // 普通用户权限
  user: [
    'enterprise_read',
    'enterprise_basic_access'
  ]
};

// 性能基准配置
export const PERFORMANCE_BENCHMARKS = {
  // 页面加载时间阈值(ms)
  pageLoadThreshold: 3000,
  
  // API响应时间阈值(ms)
  apiResponseThreshold: 500,
  
  // 并发用户数
  concurrentUsers: 50,
  
  // 系统可用性目标(%)
  availabilityTarget: 99.9
};

// 安全测试配置
export const SECURITY_TEST_CONFIG = {
  // XSS测试载荷
  xssPayloads: [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    'onmouseover="alert(1)"'
  ],
  
  // SQL注入测试载荷
  sqlInjectionPayloads: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "1'; EXEC xp_cmdshell('dir') --"
  ],
  
  // 恶意文件上传测试
  maliciousFiles: [
    'malicious.php',
    'virus.exe',
    'shell.jsp'
  ]
};

// 测试报告配置
export const REPORT_CONFIG = {
  outputPath: './test-results/enterprise-e2e-report.json',
  htmlReportPath: './test-results/enterprise-e2e-html-report',
  junitReportPath: './test-results/enterprise-e2e-junit.xml',
  
  // 质量门禁标准
  qualityGates: {
    minimumPassRate: 95, // 最低通过率(%)
    maximumFailureCount: 5, // 最大失败用例数
    securityVulnerabilities: 0, // 安全漏洞数量上限
    performanceThreshold: PERFORMANCE_BENCHMARKS
  }
};

// 导出默认配置
export default {
  ENTERPRISE_TEST_CONFIG,
  TEST_ENTERPRISE_USERS,
  TEST_DATA,
  ENTERPRISE_ROUTES,
  PERMISSIONS,
  PERFORMANCE_BENCHMARKS,
  SECURITY_TEST_CONFIG,
  REPORT_CONFIG
};