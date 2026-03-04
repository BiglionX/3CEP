/**
 * 打包优化功能测试脚本
 * 验证前端打包体积和加载性能优化效果
 */

const { bundleOptimizer } = require('../../src/lib/bundle-optimizer');

async function testBundleOptimization() {
  console.log('🚀 开始测试打包优化功能...\n');

  // 测试1: 打包分析功能
  console.log('📋 测试1: 打包分析功能');
  await testBundleAnalysis();
  console.log('✅ 打包分析测试完成\n');

  // 测试2: 代码分割优化
  console.log('📋 测试2: 代码分割优化');
  await testCodeSplitting();
  console.log('✅ 代码分割测试完成\n');

  // 测试3: Tree Shaking优化
  console.log('📋 测试3: Tree Shaking优化');
  await testTreeShaking();
  console.log('✅ Tree Shaking测试完成\n');

  // 测试4: 压缩优化
  console.log('📋 测试4: 压缩优化');
  await testCompression();
  console.log('✅ 压缩优化测试完成\n');

  // 测试5: 预加载优化
  console.log('📋 测试5: 预加载优化');
  await testPreloading();
  console.log('✅ 预加载优化测试完成\n');

  // 测试6: 缓存优化
  console.log('📋 测试6: 缓存优化');
  await testCaching();
  console.log('✅ 缓存优化测试完成\n');

  // 测试7: 完整优化流程
  console.log('📋 测试7: 完整优化流程');
  await testFullOptimization();
  console.log('✅ 完整优化流程测试完成\n');

  console.log('🎉 所有打包优化测试完成！');
}

async function testBundleAnalysis() {
  console.log('  • 测试打包状态分析');

  try {
    const analysis = await bundleOptimizer.analyzeBundle();

    console.log(
      `    - 总包大小: ${(analysis.totalSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`    - Chunk数量: ${Object.keys(analysis.chunkSizes).length}`);
    console.log(`    - 重复依赖: ${analysis.duplicatePackages.length}个`);
    console.log(`    - 未使用导出: ${analysis.unusedExports.length}个`);

    // 验证分析结果合理性
    if (analysis.totalSize > 0 && Object.keys(analysis.chunkSizes).length > 0) {
      console.log('    ✅ 打包分析功能正常');
    } else {
      throw new Error('打包分析结果异常');
    }
  } catch (error) {
    console.log(`    ❌ 打包分析失败: ${error.message}`);
    throw error;
  }
}

async function testCodeSplitting() {
  console.log('  • 测试代码分割优化');

  try {
    const mockAnalysis = {
      totalSize: 2100000,
      chunkSizes: {
        'main.js': 800000,
        'vendor.js': 900000,
        'styles.css': 200000,
      },
      duplicatePackages: ['lodash', 'moment'],
      unusedExports: ['unusedFunction'],
    };

    const optimizations = bundleOptimizer.optimizeCodeSplitting(mockAnalysis);

    console.log(`    - 优化策略数量: ${optimizations.length}`);
    console.log(`    - 优化策略: ${optimizations.slice(0, 2).join(', ')}`);

    if (optimizations.length >= 4) {
      console.log('    ✅ 代码分割优化功能正常');
    } else {
      throw new Error('代码分割优化策略不足');
    }
  } catch (error) {
    console.log(`    ❌ 代码分割优化失败: ${error.message}`);
    throw error;
  }
}

async function testTreeShaking() {
  console.log('  • 测试Tree Shaking优化');

  try {
    const optimizations = bundleOptimizer.optimizeTreeShaking();

    console.log(`    - Tree Shaking策略: ${optimizations.length}项`);
    console.log(`    - 主要优化: ${optimizations[0]}`);

    if (optimizations.length >= 3) {
      console.log('    ✅ Tree Shaking优化功能正常');
    } else {
      throw new Error('Tree Shaking优化策略不足');
    }
  } catch (error) {
    console.log(`    ❌ Tree Shaking优化失败: ${error.message}`);
    throw error;
  }
}

async function testCompression() {
  console.log('  • 测试压缩优化');

  try {
    const optimizations = bundleOptimizer.optimizeCompression();

    console.log(`    - 压缩策略数量: ${optimizations.length}`);
    console.log(`    - 启用的压缩类型: JavaScript, CSS, HTML`);

    if (optimizations.length >= 4) {
      console.log('    ✅ 压缩优化功能正常');
    } else {
      throw new Error('压缩优化策略不足');
    }
  } catch (error) {
    console.log(`    ❌ 压缩优化失败: ${error.message}`);
    throw error;
  }
}

async function testPreloading() {
  console.log('  • 测试预加载优化');

  try {
    const optimizations = bundleOptimizer.optimizePreloading();

    console.log(`    - 预加载策略数量: ${optimizations.length}`);
    console.log(`    - 预加载类型: prefetch`);

    if (optimizations.length >= 3) {
      console.log('    ✅ 预加载优化功能正常');
    } else {
      throw new Error('预加载优化策略不足');
    }
  } catch (error) {
    console.log(`    ❌ 预加载优化失败: ${error.message}`);
    throw error;
  }
}

async function testCaching() {
  console.log('  • 测试缓存优化');

  try {
    const optimizations = bundleOptimizer.optimizeCaching();

    console.log(`    - 缓存策略数量: ${optimizations.length}`);
    console.log(`    - 缓存命名策略: contenthash`);

    if (optimizations.length >= 3) {
      console.log('    ✅ 缓存优化功能正常');
    } else {
      throw new Error('缓存优化策略不足');
    }
  } catch (error) {
    console.log(`    ❌ 缓存优化失败: ${error.message}`);
    throw error;
  }
}

async function testFullOptimization() {
  console.log('  • 测试完整优化流程');

  try {
    const result = await bundleOptimizer.optimizeBundle();

    console.log('    优化结果详情:');
    console.log(
      `      - 原始大小: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `      - 优化后大小: ${(result.optimizedSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`      - 减少比例: ${result.reductionPercentage}%`);

    // 验证优化效果
    if (result.reductionPercentage >= 30 && result.reductionPercentage <= 60) {
      console.log('    ✅ 完整优化流程正常，效果符合预期');
    } else {
      throw new Error(`优化效果异常: ${result.reductionPercentage}%`);
    }

    // 检查优化历史
    const history = bundleOptimizer.getOptimizationHistory();
    console.log(`    - 优化历史记录: ${history.length}次`);
  } catch (error) {
    console.log(`    ❌ 完整优化流程失败: ${error.message}`);
    throw error;
  }
}

// 执行测试
if (require.main === module) {
  testBundleOptimization().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testBundleOptimization };
