/**
 * 采购智能体集成测试配置
 */
module.exports = {
  // 使用Node环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/procurement-intelligence/**/*.test.ts',
    '**/procurement-intelligence/**/*.spec.ts',
  ],

  // 文件扩展名映射
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // TypeScript支持
  preset: 'ts-jest',

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../src/$1',
  },

  // 设置测试环境变量
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],

  // 测试超时时间
  testTimeout: 20000,

  // 忽略的文件
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // 并行运行测试
  maxWorkers: '25%',

  // 清理模拟调用
  clearMocks: true,

  // 重置模块注册表
  resetModules: false,

  // 重置模拟
  restoreMocks: true,
};
