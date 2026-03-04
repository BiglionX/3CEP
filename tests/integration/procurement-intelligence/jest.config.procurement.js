/**
 * 采购智能体集成测试专用配置
 */
module.exports = {
  // 使用node环境而非浏览器环境
  testEnvironment: 'node',

  // 测试文件匹配
  testMatch: ['**/procurement-intelligence/**/*.test.ts'],

  // 文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // TypeScript支持
  preset: 'ts-jest',

  // 不使用setup文件中的浏览器mock
  setupFilesAfterEnv: [],

  // 模块映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../src/$1',
  },

  // 测试超时
  testTimeout: 15000,

  // 清理mock
  clearMocks: true,
  restoreMocks: true,
};
