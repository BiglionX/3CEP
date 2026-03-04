/**
 * 维修店用户中心功能验证脚本 (CommonJS版本)
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
        results.details.push('✅ ' + name + ': 通过');
        console.log('✅ ' + name + ': 通过');
      } else {
        results.failed++;
        results.details.push('❌ ' + name + ': 失败');
        console.log('❌ ' + name + ': 失败');
      }
    } catch (error) {
      results.failed++;
      results.details.push('❌ ' + name + ': 错误 - ' + error.message);
      console.log('❌ ' + name + ': 错误 - ' + error.message);
    }
  };

  // ==================== 文件系统验证 ====================
  console.log('📁 文件系统验证:');

  const fs = require('fs');
  const path = require('path');

  // 检查核心文件是否存在
  const coreFiles = [
    'src/components/pwa/PWAManager.tsx',
    'src/components/gestures/index.tsx',
    'src/hooks/use-gestures.ts',
    'src/analytics/behavior-tracker.ts',
    'src/monitoring/performance-monitor.ts',
    'src/stores/repair-shop-store.ts',
    'public/sw.js',
    'public/manifest.json',
  ];

  for (const file of coreFiles) {
    await validate('核心文件存在: ' + file, async () => {
      return fs.existsSync(path.join(__dirname, '..', file));
    });
  }

  // ==================== 依赖包验证 ====================
  console.log('\n📦 依赖包验证:');

  const packageJson = require('../package.json');

  const requiredDeps = [
    '@tanstack/react-query',
    'zustand',
    'recharts',
    'framer-motion',
  ];

  for (const dep of requiredDeps) {
    await validate('依赖包安装: ' + dep, async () => {
      return !!(
        packageJson.dependencies[dep] || packageJson.devDependencies[dep]
      );
    });
  }

  // ==================== 配置文件验证 ====================
  console.log('\n⚙️  配置文件验证:');

  const configFiles = ['tailwind.config.js', 'next.config.js', 'tsconfig.json'];

  for (const configFile of configFiles) {
    await validate('配置文件: ' + configFile, async () => {
      return fs.existsSync(path.join(__dirname, '..', configFile));
    });
  }

  // ==================== API路由验证 ====================
  console.log('\n🌐 API路由验证:');

  const apiRoutes = [
    'src/app/api/repair-shop/shops/route.ts',
    'src/app/api/repair-shop/dashboard/route.ts',
    'src/app/api/notifications/route.ts',
    'src/app/api/analytics/events/route.ts',
    'src/app/api/performance/metrics/route.ts',
  ];

  for (const route of apiRoutes) {
    await validate('API路由: ' + route, async () => {
      return fs.existsSync(path.join(__dirname, '..', route));
    });
  }

  // ==================== 页面组件验证 ====================
  console.log('\n📄 页面组件验证:');

  const pages = [
    'src/app/repair-shop/dashboard/page.tsx',
    'src/app/pwa-demo/page.tsx',
    'src/app/gestures-demo/page.tsx',
    'src/app/behavior-tracking/page.tsx',
    'src/app/performance-monitoring/page.tsx',
  ];

  for (const page of pages) {
    await validate('页面组件: ' + page, async () => {
      return fs.existsSync(path.join(__dirname, '..', page));
    });
  }

  // ==================== 核心组件验证 ====================
  console.log('\n🔧 核心组件验证:');

  const components = [
    'src/components/mobile/index.tsx',
    'src/components/pwa/index.ts',
    'src/components/gestures/index.tsx',
    'src/components/dashboard/repair-shop-dashboard.tsx',
  ];

  for (const component of components) {
    await validate('核心组件: ' + component, async () => {
      return fs.existsSync(path.join(__dirname, '..', component));
    });
  }

  // ==================== Hook和工具验证 ====================
  console.log('\n🎣 Hook和工具验证:');

  const hooksAndUtils = [
    'src/hooks/use-gestures.ts',
    'src/hooks/useReactQueryConfig.ts',
    'src/hooks/use-repair-shop.ts',
    'src/lib/responsive-config.ts',
  ];

  for (const hook of hooksAndUtils) {
    await validate('Hook/工具: ' + hook, async () => {
      return fs.existsSync(path.join(__dirname, '..', hook));
    });
  }

  // ==================== 权限和安全验证 ====================
  console.log('\n🔒 权限和安全验证:');

  const securityModules = [
    'src/permissions/core/rbac-controller.ts',
    'src/permissions/core/data-protection-controller.ts',
    'src/permissions/core/api-interceptor.ts',
    'src/middleware.ts',
  ];

  for (const module of securityModules) {
    await validate('安全模块: ' + module, async () => {
      return fs.existsSync(path.join(__dirname, '..', module));
    });
  }

  // ==================== 监控和分析验证 ====================
  console.log('\n📊 监控和分析验证:');

  const monitoringModules = [
    'src/analytics/behavior-tracker.ts',
    'src/monitoring/performance-monitor.ts',
  ];

  for (const module of monitoringModules) {
    await validate('监控模块: ' + module, async () => {
      return fs.existsSync(path.join(__dirname, '..', module));
    });
  }

  // ==================== 文档和报告验证 ====================
  console.log('\n📚 文档和报告验证:');

  const documentation = [
    'REPAIR_SHOP_OPTIMIZATION_ATOMIC_TASKS.md',
    'A3MODERN001_ZUSTAND_IMPLEMENTATION_REPORT.md',
    'A3MODERN002_PWA_IMPLEMENTATION_REPORT.md',
    'A3MODERN003_GESTURES_IMPLEMENTATION_REPORT.md',
    'A3MONITOR001_BEHAVIOR_TRACKING_IMPLEMENTATION_REPORT.md',
    'A3MONITOR002_PERFORMANCE_MONITORING_IMPLEMENTATION_REPORT.md',
  ];

  for (const doc of documentation) {
    await validate('文档文件: ' + doc, async () => {
      return fs.existsSync(path.join(__dirname, '..', doc));
    });
  }

  // 输出总结报告
  console.log('\n📋 功能验证总结报告');
  console.log('========================');
  console.log('总计验证项: ' + results.total);
  console.log('通过项: ' + results.passed);
  console.log('失败项: ' + results.failed);
  console.log(
    '通过率: ' + ((results.passed / results.total) * 100).toFixed(1) + '%'
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

// 执行验证
validateFunctionality()
  .then(result => {
    if (result.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('验证过程中发生错误:', error);
    process.exit(1);
  });
