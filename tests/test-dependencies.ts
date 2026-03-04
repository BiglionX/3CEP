import { test } from '@playwright/test';
import { testEnvironment, testDataManager } from './test-data-manager';
import { TestHelpers } from './test-helpers';

/**
 * 测试依赖管理装饰器
 */

// 测试前置条件类型
type SetupFunction = () => Promise<void>;
type TeardownFunction = () => Promise<void>;

/**
 * 测试套件装饰器 - 管理测试套件的前置和后置条件
 */
export function TestSuite(options: {
  name: string;
  setup?: SetupFunction;
  teardown?: TeardownFunction;
  skip?: boolean;
}) {
  return function (constructor: Function) {
    // 添加元数据到构造函数
    (constructor as any)._testSuiteMetadata = {
      name: options.name,
      setup: options.setup,
      teardown: options.teardown,
      skip: options.skip,
    };
  };
}

/**
 * 测试用例装饰器 - 管理单个测试用例的依赖
 */
export function TestCase(options: {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  dependsOn?: string[];
  retry?: number;
  timeout?: number;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // 添加测试用例元数据到方法
    if (!target._testCases) {
      target._testCases = {};
    }
    target._testCases[propertyKey] = {
      id: options.id,
      priority: options.priority,
      dependsOn: options.dependsOn || [],
      retry: options.retry || 1,
      timeout: options.timeout,
    };
    return descriptor;
  };
}

/**
 * 依赖管理器 - 处理测试用例间的依赖关系
 */
export class DependencyManager {
  private static executionOrder: Map<string, number> = new Map();
  private static completedTests: Set<string> = new Set();
  private static failedTests: Set<string> = new Set();

  /**
   * 注册测试用例
   */
  static registerTestCase(testId: string, dependsOn: string[] = []) {
    this.executionOrder.set(
      testId,
      this.calculateExecutionOrder(testId, dependsOn)
    );
  }

  /**
   * 计算执行顺序
   */
  private static calculateExecutionOrder(
    testId: string,
    dependsOn: string[]
  ): number {
    if (dependsOn.length === 0) {
      return 0;
    }

    let maxDependencyOrder = 0;
    for (const dependency of dependsOn) {
      const depOrder = this.executionOrder.get(dependency) || 0;
      maxDependencyOrder = Math.max(maxDependencyOrder, depOrder);
    }

    return maxDependencyOrder + 1;
  }

  /**
   * 标记测试完成
   */
  static markTestCompleted(testId: string, success: boolean) {
    if (success) {
      this.completedTests.add(testId);
    } else {
      this.failedTests.add(testId);
    }
  }

  /**
   * 检查依赖是否满足
   */
  static checkDependencies(testId: string, dependsOn: string[]): boolean {
    // 如果有失败的依赖，跳过当前测试
    for (const dependency of dependsOn) {
      if (this.failedTests.has(dependency)) {
        console.log(
          `Skipping test ${testId} due to failed dependency ${dependency}`
        );
        return false;
      }
    }

    // 检查所有依赖是否已完成
    for (const dependency of dependsOn) {
      if (!this.completedTests.has(dependency)) {
        console.log(
          `Skipping test ${testId} due to unmet dependency ${dependency}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * 获取测试执行顺序
   */
  static getExecutionOrder(): string[] {
    return Array.from(this.executionOrder.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([testId]) => testId);
  }
}

/**
 * 重试装饰器 - 实现智能重试机制
 */
export function Retry(maxAttempts: number = 3, delay: number = 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await originalMethod.apply(this, args);
          if (attempt > 1) {
            console.log(
              `✅ Test succeeded on attempt ${attempt}/${maxAttempts}`
            );
          }
          return result;
        } catch (error) {
          lastError = error as Error;
          console.log(
            `⚠️ Test failed on attempt ${attempt}/${maxAttempts}: ${lastError.message}`
          );

          if (attempt < maxAttempts) {
            // 指数退避
            const waitTime = delay * Math.pow(2, attempt - 1);
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      console.log(`❌ Test failed after ${maxAttempts} attempts`);
      throw lastError!;
    };

    return descriptor;
  };
}

/**
 * 超时装饰器
 */
export function Timeout(milliseconds: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return Promise.race([
        originalMethod.apply(this, args),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Test timeout after ${milliseconds}ms`)),
            milliseconds
          )
        ),
      ]);
    };

    return descriptor;
  };
}

/**
 * 测试数据准备装饰器
 */
export function RequiresData(dataSetup: () => Promise<void>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 准备测试数据
      await dataSetup();

      // 执行原始方法
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 环境清理装饰器
 */
export function Cleanup(cleanupFn: () => Promise<void>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // 执行原始方法
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        // 无论测试成功与否都执行清理
        await cleanupFn();
      }
    };

    return descriptor;
  };
}

/**
 * 条件执行装饰器
 */
export function Conditional(
  condition: () => boolean | Promise<boolean>,
  skipMessage?: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const shouldRun = await condition();

      if (!shouldRun) {
        const message = skipMessage || 'Test skipped due to condition';
        test.skip(true, message);
        return;
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 使用说明：
// 这些装饰器可以在Playwright测试中使用，例如：
//
// test('E2E-ROLE-01: 管理员权限测试', async ({ page }) => {
//   const helpers = new TestHelpers(page);
//
//   // 使用重试机制
//   await withRetry(async () => {
//     await helpers.login('admin@test.com', 'Admin123!@#');
//     await helpers.verifyElementExists('[data-testid="admin-dashboard"]');
//   });
// });
//
// // 使用超时控制
// await withTimeout(async () => {
//   await page.goto('/admin/users');
//   await page.waitForSelector('[data-testid="user-table"]');
// }, 30000);
