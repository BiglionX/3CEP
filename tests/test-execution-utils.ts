import { Page } from '@playwright/test';

/**
 * 简化的依赖管理工具函数
 */

/**
 * 带重试的异步操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`✅ 操作在第 ${attempt} 次尝试时成功`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      console.log(`⚠️ 第 ${attempt}/${maxRetries} 次尝试失败: ${lastError.message}`);

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.log(`❌ 操作在 ${maxRetries} 次尝试后仍然失败`);
  throw lastError!;
}

/**
 * 带超时的异步操作
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage || `操作超时 (${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}

/**
 * 测试前置条件检查
 */
export async function requireCondition(
  condition: () => boolean | Promise<boolean>,
  errorMessage: string
): Promise<void> {
  const result = await condition();
  if (!result) {
    throw new Error(`前置条件不满足: ${errorMessage}`);
  }
}

/**
 * 测试数据准备
 */
export async function prepareTestData(setupFn: () => Promise<void>): Promise<void> {
  console.log('📋 准备测试数据...');
  await setupFn();
  console.log('✅ 测试数据准备完成');
}

/**
 * 测试环境清理
 */
export async function cleanupTestEnvironment(cleanupFn: () => Promise<void>): Promise<void> {
  console.log('🧹 清理测试环境...');
  await cleanupFn();
  console.log('✅ 测试环境清理完成');
}

/**
 * 依赖检查器
 */
export class DependencyChecker {
  private static completedDependencies: Set<string> = new Set();
  private static failedDependencies: Set<string> = new Set();

  /**
   * 标记依赖完成
   */
  static markDependencyCompleted(dependencyId: string) {
    this.completedDependencies.add(dependencyId);
    console.log(`✅ 依赖 ${dependencyId} 完成`);
  }

  /**
   * 标记依赖失败
   */
  static markDependencyFailed(dependencyId: string, error: string) {
    this.failedDependencies.add(dependencyId);
    console.log(`❌ 依赖 ${dependencyId} 失败: ${error}`);
  }

  /**
   * 检查依赖是否满足
   */
  static checkDependencies(dependencyIds: string[]): boolean {
    // 检查是否有失败的依赖
    for (const depId of dependencyIds) {
      if (this.failedDependencies.has(depId)) {
        console.log(`🚫 由于依赖 ${depId} 失败，跳过当前测试`);
        return false;
      }
    }

    // 检查所有依赖是否已完成
    for (const depId of dependencyIds) {
      if (!this.completedDependencies.has(depId)) {
        console.log(`⏳ 等待依赖 ${depId} 完成...`);
        return false;
      }
    }

    return true;
  }

  /**
   * 等待依赖完成
   */
  static async waitForDependencies(
    dependencyIds: string[], 
    timeoutMs: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (this.checkDependencies(dependencyIds)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`⏰ 等待依赖超时 (${timeoutMs}ms)`);
    return false;
  }
}

/**
 * 测试步骤执行器
 */
export class TestStepExecutor {
  private steps: Array<{
    name: string;
    action: () => Promise<void>;
    required: boolean;
  }> = [];

  /**
   * 添加测试步骤
   */
  addStep(name: string, action: () => Promise<void>, required: boolean = true) {
    this.steps.push({ name, action, required });
  }

  /**
   * 执行所有步骤
   */
  async execute(): Promise<{ success: boolean; failedSteps: string[] }> {
    const failedSteps: string[] = [];
    
    for (const step of this.steps) {
      try {
        console.log(`▶️ 执行步骤: ${step.name}`);
        await withTimeout(step.action, 30000, `步骤 "${step.name}" 超时`);
        console.log(`✅ 步骤完成: ${step.name}`);
      } catch (error) {
        console.log(`❌ 步骤失败: ${step.name} - ${(error as Error).message}`);
        failedSteps.push(step.name);
        
        if (step.required) {
          console.log(`🛑 关键步骤失败，停止执行`);
          break;
        }
      }
    }

    const success = failedSteps.length === 0;
    console.log(`${success ? '✅' : '❌'} 测试步骤执行${success ? '成功' : '失败'}`);
    
    return { success, failedSteps };
  }
}

// 使用示例
/*
test('E2E-REPAIR-01: 完整维修流程测试', async ({ page }) => {
  const executor = new TestStepExecutor();
  
  // 添加测试步骤
  executor.addStep('用户登录', async () => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'consumer@test.com');
    await page.fill('[data-testid="password"]', 'Test123!@#');
    await page.click('[data-testid="login-button"]');
  });
  
  executor.addStep('设备扫码', async () => {
    await page.goto('/scan');
    // 模拟扫码操作
  });
  
  executor.addStep('故障诊断', async () => {
    await page.selectOption('[data-testid="fault-type"]', 'screen_broken');
    await page.click('[data-testid="diagnose-button"]');
  });
  
  // 执行所有步骤
  const result = await executor.execute();
  
  // 标记依赖状态
  if (result.success) {
    DependencyChecker.markDependencyCompleted('REPAIR-01');
  } else {
    DependencyChecker.markDependencyFailed('REPAIR-01', result.failedSteps.join(', '));
  }
  
  expect(result.success).toBeTruthy();
});
*/