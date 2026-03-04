/**
 * 采购智能体集成测试环境设置
 */

// 设置测试所需的环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

// Mock console输出以减少测试噪音
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// 测试前清理
beforeEach(() => {
  jest.clearAllMocks();
});

// 测试后清理
afterEach(() => {
  // 可以在这里添加清理逻辑
});
