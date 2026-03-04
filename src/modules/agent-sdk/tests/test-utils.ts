/**
 * FixCycle Agent SDK 测试配置
 */

// 测试环境配置
export const TEST_CONFIG = {
  // API测试配置
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000,
  },

  // 插件测试配置
  plugins: {
    testDir: './test-plugins',
    maxFileSize: 1024 * 1024, // 1MB
    timeout: 10000,
  },

  // 模板测试配置
  templates: {
    testDir: './test-templates',
    maxCodeSize: 512 * 1024, // 512KB
    timeout: 15000,
  },

  // 安全扫描配置
  security: {
    rules: [
      {
        id: 'test_rule_1',
        name: '测试规则1',
        description: '测试用安全规?,
        severity: 'medium',
        pattern: /test-pattern/,
        category: 'test',
        recommendation: '测试建议',
      },
    ],
  },
};

// 测试数据工厂
export class TestDataFactory {
  /**
   * 创建测试插件信息
   */
  static createTestPluginInfo(overrides: Partial<any> = {}): any {
    return {
      id: 'test-plugin-1.0.0',
      name: 'Test Plugin',
      version: '1.0.0',
      description: '测试插件',
      author: 'Test Author',
      category: 'test',
      tags: ['test', 'demo'],
      entryPoint: 'index.js',
      dependencies: [],
      permissions: ['read'],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * 创建测试模板信息
   */
  static createTestTemplateInfo(overrides: Partial<any> = {}): any {
    return {
      id: 'test-template-1.0.0',
      name: 'Test Template',
      version: '1.0.0',
      description: '测试模板',
      category: 'test',
      author: 'Test Author',
      authorId: 'test-author-id',
      tags: ['test', 'demo'],
      readme: '# Test Template\n\n这是一个测试模?,
      sourceCode: 'class TestTemplate extends BaseAgent {}',
      dependencies: [],
      license: 'MIT',
      price: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * 创建测试安全规则
   */
  static createTestSecurityRule(overrides: Partial<any> = {}): any {
    return {
      id: 'test-security-rule',
      name: '测试安全规则',
      description: '用于测试的安全规?,
      severity: 'medium',
      pattern: /test/,
      category: 'test',
      recommendation: '测试修复建议',
      ...overrides,
    };
  }

  /**
   * 创建测试HTTP响应
   */
  static createTestResponse(data: any, status: number = 200): any {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  }
}

// 测试工具函数
export class TestUtils {
  /**
   * 等待指定时间
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建模拟函数
   */
  static createMockFunction(implementation?: Function): jest.Mock {
    return jest.fn(implementation);
  }

  /**
   * 创建模拟对象
   */
  static createMockObject(methods: string[]): any {
    const mockObj: any = {};
    methods.forEach(method => {
      mockObj[method] = jest.fn();
    });
    return mockObj;
  }

  /**
   * 捕获异步错误
   */
  static async expectAsyncError(
    asyncFn: () => Promise<any>,
    expectedError?: string | RegExp
  ): Promise<void> {
    try {
      await asyncFn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string') {
          expect((error as Error).message).toContain(expectedError);
        } else {
          expect((error as Error).message).toMatch(expectedError);
        }
      }
    }
  }

  /**
   * 生成随机ID
   */
  static generateId(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建临时目录
   */
  static createTempDir(): string {
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  }

  /**
   * 清理临时目录
   */
  static cleanupTempDir(dirPath: string): void {
    const fs = require('fs');
    const path = require('path');

    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}

// 测试断言工具
export class TestAssertions {
  /**
   * 断言对象具有必需的属?   */
  static assertHasProperties(obj: any, properties: string[]): void {
    properties.forEach(prop => {
      expect(obj).toHaveProperty(prop);
    });
  }

  /**
   * 断言数组包含特定元素
   */
  static assertContains<T>(array: T[], element: T, message?: string): void {
    expect(array).toContainEqual(element, message);
  }

  /**
   * 断言函数被调用指定次?   */
  static assertCalledTimes(
    mockFn: jest.Mock,
    times: number,
    message?: string
  ): void {
    expect(mockFn).toHaveBeenCalledTimes(times, message);
  }

  /**
   * 断言函数被调用且带有特定参数
   */
  static assertCalledWith(mockFn: jest.Mock, ...args: any[]): void {
    expect(mockFn).toHaveBeenCalledWith(...args);
  }

  /**
   * 断言Promise被拒?   */
  static async assertRejected(
    promise: Promise<any>,
    expectedError?: string | RegExp
  ): Promise<void> {
    await expect(promise).rejects.toThrow(expectedError);
  }

  /**
   * 断言值在范围?   */
  static assertInRange(
    value: number,
    min: number,
    max: number,
    message?: string
  ): void {
    expect(value).toBeGreaterThanOrEqual(min, message);
    expect(value).toBeLessThanOrEqual(max, message);
  }
}

// 测试生命周期钩子
export class TestLifecycle {
  private static tempDirs: string[] = [];

  /**
   * 测试前设?   */
  static beforeEach(): void {
    // 清理模拟
    jest.clearAllMocks();
  }

  /**
   * 测试后清?   */
  static afterEach(): void {
    // 清理临时目录
    TestLifecycle.tempDirs.forEach(dir => {
      TestUtils.cleanupTempDir(dir);
    });
    TestLifecycle.tempDirs = [];
  }

  /**
   * 测试套件前设?   */
  static beforeAll(): void {
    // 全局设置
    jest.setTimeout(30000);
  }

  /**
   * 测试套件后清?   */
  static afterAll(): void {
    // 最终清?    TestLifecycle.tempDirs.forEach(dir => {
      TestUtils.cleanupTempDir(dir);
    });
    TestLifecycle.tempDirs = [];
  }

  /**
   * 注册临时目录以便自动清理
   */
  static registerTempDir(dirPath: string): void {
    TestLifecycle.tempDirs.push(dirPath);
  }
}

// 导出所有测试工?export { TestDataFactory, TestUtils, TestAssertions, TestLifecycle };
