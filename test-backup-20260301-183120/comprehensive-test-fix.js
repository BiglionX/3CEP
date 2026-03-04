#!/usr/bin/env node

/**
 * 全面测试环境修复脚本
 * 解决所有测试运行时的问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 正在进行全面测试环境修复...');

// 1. 更新测试环境设置文件
const setupEnvPath = path.join(__dirname, '../tests/setup-env.js');
const setupEnvContent = `
// 测试环境变量设置
require('dotenv').config({ path: '.env.test' });

// Mock fetch API for Node.js environments
if (!global.fetch) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
  global.Response = nodeFetch.Response;
}

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null })
  };

  return {
    createClient: () => mockSupabase
  };
});

// Mock other external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// 设置测试环境标识
process.env.NODE_ENV = 'test';
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';

console.log('🧪 测试环境已初始化');
`;

fs.writeFileSync(setupEnvPath, setupEnvContent);
console.log('✅ 更新测试环境设置文件');

// 2. 创建或更新jest配置
const jestConfigPath = path.join(__dirname, '../jest.config.js');
let jestConfig = fs.readFileSync(jestConfigPath, 'utf8');

// 确保包含必要的配置
const requiredConfig = {
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/lib/supabase/client$': '<rootDir>/tests/__mocks__/supabase-client.js',
  },
};

// 更新配置
Object.keys(requiredConfig).forEach(key => {
  if (key === 'moduleNameMapper') {
    // 合并moduleNameMapper配置
    const currentMapper = jestConfig.match(/moduleNameMapper:\s*{([^}]+)}/s);
    if (currentMapper) {
      const existingMapper = currentMapper[1];
      const newEntries = Object.entries(requiredConfig.moduleNameMapper)
        .map(([key, value]) => `    '${key}': '${value}'`)
        .join(',\n');

      jestConfig = jestConfig.replace(
        /moduleNameMapper:\s*{[^}]+}/s,
        `moduleNameMapper: {\n${newEntries}\n  }`
      );
    }
  } else if (!jestConfig.includes(key)) {
    // 添加缺失的配置项
    const configLine = `  ${key}: ${JSON.stringify(requiredConfig[key])},`;
    jestConfig = jestConfig.replace(
      '// 测试环境变量设置',
      `// 测试环境变量设置\n${configLine}`
    );
  }
});

fs.writeFileSync(jestConfigPath, jestConfig);
console.log('✅ 更新Jest配置文件');

// 3. 创建Supabase客户端模拟
const mocksDir = path.join(__dirname, '../tests/__mocks__');
if (!fs.existsSync(mocksDir)) {
  fs.mkdirSync(mocksDir, { recursive: true });
}

const supabaseMockPath = path.join(mocksDir, 'supabase-client.js');
const supabaseMockContent = `
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  then: jest.fn().mockResolvedValue({ data: [], error: null })
};

module.exports = {
  createClient: () => mockSupabase
};
`;

fs.writeFileSync(supabaseMockPath, supabaseMockContent);
console.log('✅ 创建Supabase客户端模拟');

// 4. 创建测试工具函数
const testUtilsPath = path.join(__dirname, '../tests/utils');
if (!fs.existsSync(testUtilsPath)) {
  fs.mkdirSync(testUtilsPath, { recursive: true });
}

const testHelpersPath = path.join(testUtilsPath, 'test-helpers.ts');
const testHelpersContent = `
import { vi } from 'vitest';

// 测试辅助函数

export const mockFetch = (response: any = {}, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    blob: vi.fn().mockResolvedValue(new Blob()),
  };

  global.fetch = vi.fn().mockResolvedValue(mockResponse);
  return mockResponse;
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store
  };
};

export const waitFor = async (callback: () => boolean, timeout = 1000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (callback()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error('waitFor timed out');
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};
`;

fs.writeFileSync(testHelpersPath, testHelpersContent);
console.log('✅ 创建测试辅助工具');

// 5. 更新package.json测试脚本
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 添加或更新测试相关脚本
const testScripts = {
  'test:unit': 'jest --testPathPattern=tests/unit --passWithNoTests',
  'test:unit:watch': 'jest --watch --testPathPattern=tests/unit',
  'test:unit:coverage': 'jest --coverage --testPathPattern=tests/unit',
  'test:repair-shop': 'jest --testPathPattern=tests/unit/repair-shop',
  'test:security': 'jest --testPathPattern=tests/unit/security',
  'test:fix': 'node scripts/fix-test-environment.js',
};

Object.assign(packageJson.scripts, testScripts);
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ 更新package.json测试脚本');

console.log('\n✨ 全面测试环境修复完成！');
console.log('\n🔧 可用的测试命令:');
console.log('  npm run test:unit          - 运行单元测试');
console.log('  npm run test:repair-shop   - 运行维修店相关测试');
console.log('  npm run test:security      - 运行安全相关测试');
console.log('  npm run test:fix           - 重新运行环境修复');
console.log('  npm run test:unit:watch    - 监视模式运行测试');
console.log('  npm run test:unit:coverage - 生成测试覆盖率报告');
