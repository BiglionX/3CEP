/**
 * Jest测试配置
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],

  // 文件扩展名映射
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // TypeScript 支持
  preset: 'ts-jest',

  // ESM 模块转换配置
  transformIgnorePatterns: ['/node_modules/(?!(node-fetch)/)'],

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // 修复 Supabase 客户端映射
    '^@/lib/supabase/client$': '<rootDir>/src/lib/supabase.ts',
    '^@/lib/supabase/(.*)$': '<rootDir>/src/lib/supabase.ts',
  },

  // 测试覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],

  // 覆盖率报告目录
  coverageDirectory: 'coverage',

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // 测试超时时间
  testTimeout: 10000,

  // 设置测试环境变量
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // 忽略的文件
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // 并行运行测试
  maxWorkers: '50%',

  // 清理模拟调用
  clearMocks: true,

  // 重置模块注册表
  resetModules: false,

  // 重置模拟
  restoreMocks: true,
};
