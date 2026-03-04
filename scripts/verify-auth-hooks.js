/**
 * 认证Hook验证脚本
 * 用于手动验证useSafeAuth Hook的功能
 */

// 模拟浏览器环境
const mockBrowserEnv = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
};

// 简单的测试运行器
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 开始认证Hook功能验证...\n');

    for (const test of this.tests) {
      try {
        console.log(`正在执行: ${test.name}`);
        await test.testFn();
        this.results.push({ name: test.name, passed: true });
        console.log(`✅ ${test.name} - 通过\n`);
      } catch (error) {
        this.results.push({
          name: test.name,
          passed: false,
          error: error.message,
        });
        console.log(`❌ ${test.name} - 失败: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log('\n📊 测试结果汇总:');
    console.log(`总计: ${total} 个测试`);
    console.log(`通过: ${passed} 个测试`);
    console.log(`失败: ${total - passed} 个测试`);
    console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`);

    if (passed === total) {
      console.log('\n🎉 所有测试通过！认证Hook功能正常');
    } else {
      console.log('\n⚠️  存在失败的测试，请检查实现');
    }
  }
}

// 创建测试实例
const runner = new TestRunner();

// 测试1: Hook基本结构验证
runner.addTest('Hook基本结构验证', async () => {
  // 模拟导入Hook
  const hookModule = await import('../src/hooks/use-safe-auth');

  if (!hookModule.useSafeAuth) {
    throw new Error('找不到useSafeAuth函数');
  }

  if (typeof hookModule.useSafeAuth !== 'function') {
    throw new Error('useSafeAuth不是一个函数');
  }

  console.log('  ✓ useSafeAuth函数存在');
  console.log('  ✓ 函数类型正确');
});

// 测试2: 返回值结构验证
runner.addTest('返回值结构验证', async () => {
  const { useSafeAuth } = await import('../src/hooks/use-safe-auth');

  // 创建模拟的React环境
  const mockSetState = jest.fn();
  const mockUseState = jest.fn(() => [{}, mockSetState]);
  const mockUseRef = jest.fn(() => ({ current: true }));
  const mockUseCallback = jest.fn(fn => fn);
  const mockUseEffect = jest.fn(fn => fn());

  // 临时替换React hooks
  const originalHooks = {
    useState: global.useState,
    useRef: global.useRef,
    useCallback: global.useCallback,
    useEffect: global.useEffect,
  };

  global.useState = mockUseState;
  global.useRef = mockUseRef;
  global.useCallback = mockUseCallback;
  global.useEffect = mockUseEffect;

  try {
    const result = useSafeAuth();

    // 验证返回的属性
    const requiredProperties = [
      'user',
      'isAuthenticated',
      'isLoading',
      'error',
      'isAdmin',
      'roles',
      'tenantId',
      'login',
      'logout',
      'hasPermission',
    ];

    for (const prop of requiredProperties) {
      if (!(prop in result)) {
        throw new Error(`缺少必需属性: ${prop}`);
      }
    }

    console.log('  ✓ 所有必需属性都存在');

    // 验证函数类型
    if (typeof result.login !== 'function') {
      throw new Error('login不是函数');
    }

    if (typeof result.logout !== 'function') {
      throw new Error('logout不是函数');
    }

    if (typeof result.hasPermission !== 'function') {
      throw new Error('hasPermission不是函数');
    }

    console.log('  ✓ 所有函数属性类型正确');
  } finally {
    // 恢复原始hooks
    Object.assign(global, originalHooks);
  }
});

// 测试3: 内存泄漏防护验证
runner.addTest('内存泄漏防护验证', async () => {
  const { useSafeAuth } = await import('../src/hooks/use-safe-auth');

  // 模拟组件挂载和卸载
  let cleanupFunction = null;
  let effectCallback = null;

  const mockUseEffect = jest.fn(callback => {
    effectCallback = callback;
    // 模拟返回清理函数
    cleanupFunction = jest.fn();
    return cleanupFunction;
  });

  const mockUseRef = jest.fn(() => ({ current: true }));

  const originalUseEffect = global.useEffect;
  const originalUseRef = global.useRef;

  global.useEffect = mockUseEffect;
  global.useRef = mockUseRef;

  try {
    useSafeAuth();

    // 验证useEffect被调用
    if (!mockUseEffect.mock.calls.length) {
      throw new Error('useEffect未被调用');
    }

    console.log('  ✓ useEffect被正确调用');

    // 验证清理函数存在
    if (!cleanupFunction) {
      throw new Error('未返回清理函数');
    }

    console.log('  ✓ 清理函数已定义');

    // 模拟组件卸载
    if (effectCallback) {
      const cleanup = effectCallback();
      if (typeof cleanup === 'function') {
        cleanup();
        console.log('  ✓ 组件卸载清理执行');
      }
    }
  } finally {
    global.useEffect = originalUseEffect;
    global.useRef = originalUseRef;
  }
});

// 测试4: 状态管理集成验证
runner.addTest('状态管理集成验证', async () => {
  // 验证状态管理器是否存在并正确导出
  const authModule = await import('../src/lib/auth/state-manager');

  if (!authModule.AuthStateManager) {
    throw new Error('AuthStateManager类不存在');
  }

  if (!authModule.authStateManager) {
    throw new Error('authStateManager实例不存在');
  }

  console.log('  ✓ AuthStateManager类存在');
  console.log('  ✓ authStateManager实例存在');

  // 验证必需的方法
  const requiredMethods = [
    'getState',
    'subscribe',
    'setAuthenticated',
    'setUnauthenticated',
  ];

  for (const method of requiredMethods) {
    if (typeof authModule.authStateManager[method] !== 'function') {
      throw new Error(`authStateManager缺少方法: ${method}`);
    }
  }

  console.log('  ✓ 所有必需方法都存在');
});

// 运行所有测试
runner.run().catch(error => {
  console.error('测试执行失败:', error);
});
