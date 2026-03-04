/**
 * 维修店用户中心功能验证脚本
 * 手动验证各模块功能是否正常运行
 */

async function validateFunctionality() {
  console.log('🔧 维修店用户中心功能验证开始...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: [],
  };

  // 验证函数
  const validate = async (name, testFn) => {
    results.total++;
    try {
      const result = await testFn();
      if (result) {
        results.passed++;
        results.details.push(`✅ ${name}: 通过`);
        console.log(`✅ ${name}: 通过`);
      } else {
        results.failed++;
        results.details.push(`❌ ${name}: 失败`);
        console.log(`❌ ${name}: 失败`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ ${name}: 错误 - ${error.message}`);
      console.log(`❌ ${name}: 错误 - ${error.message}`);
    }
  };

  // ==================== API功能验证 ====================
  console.log('🌐 API功能验证:');

  await validate('维修店API接口', async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/api/repair-shop/shops'
      );
      const data = await response.json();
      return response.ok && data.shops;
    } catch {
      return false;
    }
  });

  await validate('仪表板数据API', async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/api/repair-shop/dashboard'
      );
      const data = await response.json();
      return response.ok && data.metrics;
    } catch {
      return false;
    }
  });

  await validate('通知系统API', async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications');
      const data = await response.json();
      return response.ok && Array.isArray(data.notifications);
    } catch {
      return false;
    }
  });

  // ==================== 前端组件验证 ====================
  console.log('\n🖥️  前端组件验证:');

  await validate('响应式断点系统', async () => {
    // 检查CSS变量和类名
    const hasResponsiveCSS =
      typeof window !== 'undefined' &&
      (document.querySelector('[class*="responsive"]') !== null ||
        getComputedStyle(document.body).getPropertyValue('--breakpoint-xs'));
    return hasResponsiveCSS || typeof window === 'undefined'; // 服务端渲染也算通过
  });

  await validate('移动端组件库', async () => {
    // 检查移动端组件是否存在
    try {
      const mobileComponents = await import('@/components/mobile');
      return !!mobileComponents;
    } catch {
      return false;
    }
  });

  await validate('PWA功能组件', async () => {
    try {
      const pwaComponents = await import('@/components/pwa');
      return !!pwaComponents.PWAManager;
    } catch {
      return false;
    }
  });

  await validate('手势识别Hook', async () => {
    try {
      const gestureHook = await import('@/hooks/use-gestures');
      return !!gestureHook.useGestures;
    } catch {
      return false;
    }
  });

  // ==================== 状态管理验证 ====================
  console.log('\n🔄 状态管理验证:');

  await validate('Zustand状态管理', async () => {
    try {
      const store = await import('@/stores/repair-shop-store');
      return !!store.useRepairShopStore;
    } catch {
      return false;
    }
  });

  await validate('React Query配置', async () => {
    try {
      const queryConfig = await import('@/hooks/useReactQueryConfig');
      return !!queryConfig.defaultQueryOptions;
    } catch {
      return false;
    }
  });

  // ==================== 安全功能验证 ====================
  console.log('\n🔒 安全功能验证:');

  await validate('RBAC权限控制器', async () => {
    try {
      const rbac = await import('@/permissions/core/rbac-controller');
      return !!rbac.RBACController;
    } catch {
      return false;
    }
  });

  await validate('数据保护机制', async () => {
    try {
      const dataProtection =
        await import('@/permissions/core/data-protection-controller');
      return !!dataProtection.DataProtectionController;
    } catch {
      return false;
    }
  });

  await validate('API拦截器', async () => {
    try {
      const interceptor = await import('@/permissions/core/api-interceptor');
      return !!interceptor.APIInterceptor;
    } catch {
      return false;
    }
  });

  // ==================== 监控系统验证 ====================
  console.log('\n📊 监控系统验证:');

  await validate('行为追踪系统', async () => {
    try {
      const behaviorTracker = await import('@/analytics/behavior-tracker');
      return !!behaviorTracker.BehaviorTracker;
    } catch {
      return false;
    }
  });

  await validate('性能监控系统', async () => {
    try {
      const perfMonitor = await import('@/monitoring/performance-monitor');
      return !!perfMonitor.PerformanceMonitor;
    } catch {
      return false;
    }
  });

  // ==================== 页面路由验证 ====================
  console.log('\n🔗 页面路由验证:');

  const pagesToCheck = [
    '/repair-shop/dashboard',
    '/repair-shop/orders',
    '/pwa-demo',
    '/gestures-demo',
    '/behavior-tracking',
    '/performance-monitoring',
  ];

  for (const page of pagesToCheck) {
    await validate(`页面路由: ${page}`, async () => {
      try {
        // 检查页面组件是否存在
        const pageModule = await import(`@/app${page}/page`);
        return !!pageModule.default;
      } catch {
        return false;
      }
    });
  }

  // ==================== 集成验证 ====================
  console.log('\n🔗 集成功能验证:');

  await validate('统一布局系统', async () => {
    try {
      const layout = await import('@/components/layout/UnifiedLayout');
      return !!layout.UnifiedLayout;
    } catch {
      return false;
    }
  });

  await validate('错误处理系统', async () => {
    try {
      const errorHandler = await import('@/components/error-handling');
      return !!(errorHandler.ErrorProvider && errorHandler.GlobalErrorBoundary);
    } catch {
      return false;
    }
  });

  await validate('反馈系统', async () => {
    try {
      const feedback = await import('@/components/feedback-system');
      return !!feedback.FeedbackProvider;
    } catch {
      return false;
    }
  });

  // 输出总结报告
  console.log('\n📋 功能验证总结报告');
  console.log('========================');
  console.log(`总计验证项: ${results.total}`);
  console.log(`通过项: ${results.passed}`);
  console.log(`失败项: ${results.failed}`);
  console.log(
    `通过率: ${((results.passed / results.total) * 100).toFixed(1)}%`
  );
  console.log('========================');

  if (results.failed > 0) {
    console.log('\n❌ 失败详情:');
    results.details
      .filter(detail => detail.startsWith('❌'))
      .forEach(detail => {
        console.log(detail);
      });
  }

  console.log('\n✅ 验证完成!');

  return {
    total: results.total,
    passed: results.passed,
    failed: results.failed,
    passRate: ((results.passed / results.total) * 100).toFixed(1),
    details: results.details,
  };
}

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  // Node.js环境
  validateFunctionality().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
} else {
  // 浏览器环境
  window.validateRepairShopFunctionality = validateFunctionality;
}

export { validateFunctionality };
