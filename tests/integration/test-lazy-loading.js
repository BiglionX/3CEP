/**
 * 懒加载功能测试脚本
 * 验证前端资源懒加载和代码分割优化效果
 */

const {
  lazyLoadingManager,
  useLazyComponent,
} = require('../../src/lib/lazy-loading-manager');
const { routeLazyLoader } = require('../../src/lib/route-lazy-loader');

async function testLazyLoading() {
  console.log('🚀 开始测试懒加载功能...\n');

  // 测试1: 基础懒加载管理器功能
  console.log('📋 测试1: 基础懒加载管理器功能');
  await testBasicLazyLoading();
  console.log('✅ 基础功能测试完成\n');

  // 测试2: 路由懒加载功能
  console.log('📋 测试2: 路由懒加载功能');
  await testRouteLazyLoading();
  console.log('✅ 路由懒加载测试完成\n');

  // 测试3: 预加载策略测试
  console.log('📋 测试3: 预加载策略测试');
  await testPreloadStrategies();
  console.log('✅ 预加载策略测试完成\n');

  // 测试4: 性能统计测试
  console.log('📋 测试4: 性能统计功能');
  await testPerformanceStats();
  console.log('✅ 性能统计测试完成\n');

  console.log('🎉 所有懒加载测试完成！');
}

async function testBasicLazyLoading() {
  console.log('  • 测试懒加载管理器初始化');

  // 检查管理器实例
  if (!lazyLoadingManager) {
    throw new Error('懒加载管理器未正确初始化');
  }

  console.log('  • 检查初始状态');
  const initialStats = lazyLoadingManager.getPerformanceStats();
  console.log(`    - 总组件数: ${initialStats.totalComponents}`);
  console.log(`    - 已加载组件: ${initialStats.loadedComponents}`);
  console.log(`    - 加载队列大小: ${initialStats.loadingQueueSize}`);

  // 注册测试组件
  console.log('  • 注册测试组件');
  lazyLoadingManager.registerComponent({
    loader: async () => ({ default: { name: 'TestComponent' } }),
    name: 'test-component',
    priority: 'medium',
  });

  const updatedStats = lazyLoadingManager.getPerformanceStats();
  console.log(`    - 注册后组件数: ${updatedStats.totalComponents}`);
}

async function testRouteLazyLoading() {
  console.log('  • 测试路由懒加载配置');

  // 检查路由加载器
  if (!routeLazyLoader) {
    throw new Error('路由懒加载器未正确初始化');
  }

  // 获取预加载统计
  const prefetchStats = routeLazyLoader.getPrefetchStats();
  console.log(`    - 总路由数: ${prefetchStats.totalRoutes}`);
  console.log(`    - 已配置路由: ${prefetchStats.configuredRoutes}`);
  console.log(`    - 预加载启用: ${prefetchStats.prefetchEnabled}`);

  // 测试特定路由预加载
  console.log('  • 测试主页路由预加载');
  try {
    await routeLazyLoader.prefetchRoute('/');
    console.log('    - 主页预加载成功');
  } catch (error) {
    console.log(`    - 主页预加载失败: ${error.message}`);
  }
}

async function testPreloadStrategies() {
  console.log('  • 测试不同的预加载策略');

  // 测试组件预加载
  console.log('  • 预加载测试组件');
  try {
    await lazyLoadingManager.preloadComponent('test-component');
    console.log('    - 组件预加载成功');

    // 检查加载状态
    const status = lazyLoadingManager.getComponentStatus('test-component');
    console.log(`    - 组件状态: ${status}`);
  } catch (error) {
    console.log(`    - 组件预加载失败: ${error.message}`);
  }

  // 测试批量预加载
  console.log('  • 测试批量预加载');
  try {
    await lazyLoadingManager.preloadComponents(['test-component'], 1);
    console.log('    - 批量预加载成功');
  } catch (error) {
    console.log(`    - 批量预加载失败: ${error.message}`);
  }
}

async function testPerformanceStats() {
  console.log('  • 测试性能统计功能');

  // 获取性能统计
  const stats = lazyLoadingManager.getPerformanceStats();
  console.log('    性能统计详情:');
  console.log(`      - 总组件数: ${stats.totalComponents}`);
  console.log(`      - 已加载组件: ${stats.loadedComponents}`);
  console.log(`      - 加载队列: ${stats.loadingQueueSize}`);
  console.log(`      - 缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`);

  // 测试路由性能统计
  const routeStats = routeLazyLoader.getPrefetchStats();
  console.log('    路由统计详情:');
  console.log(`      - 总路由数: ${routeStats.totalRoutes}`);
  console.log(`      - 配置路由数: ${routeStats.configuredRoutes}`);
  console.log(`      - 预加载启用: ${routeStats.prefetchEnabled}`);
}

// 执行测试
if (require.main === module) {
  testLazyLoading().catch(console.error);
}

module.exports = { testLazyLoading };
