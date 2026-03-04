// Redis缓存性能测试脚本
const {
  cacheManager,
  generateCacheKey,
} = require('../src/utils/cache-manager');

async function testRedisCache() {
  console.log('🚀 开始Redis缓存性能测试...\n');

  try {
    // 1. 测试缓存连接状态
    console.log('1️⃣ 测试缓存连接状态...');
    const stats = await cacheManager.getStats();
    console.log(`   Redis状态: ${stats.enabled ? '✅ 已连接' : '❌ 未连接'}`);
    if (stats.enabled) {
      console.log(`   数据库大小: ${stats.dbSize || 0} keys`);
      console.log(`   内存使用: ${stats.usedMemory || 'N/A'}`);
      console.log(`   连接客户端: ${stats.connectedClients || 'N/A'}`);
    }

    // 2. 测试基本读写性能
    console.log('\n2️⃣ 测试基本读写性能...');

    const testKey = 'performance_test_key';
    const testData = {
      id: 1,
      name: '测试数据',
      timestamp: Date.now(),
      data: Array(100).fill('测试内容').join(''),
    };

    // 写入测试
    const startTime = Date.now();
    const setResult = await cacheManager.set(testKey, testData, 300); // 5分钟缓存
    const writeTime = Date.now() - startTime;

    console.log(`   写入耗时: ${writeTime}ms ${setResult ? '✅' : '❌'}`);

    // 读取测试
    const readStartTime = Date.now();
    const getResult = await cacheManager.get(testKey);
    const readTime = Date.now() - readStartTime;

    console.log(`   读取耗时: ${readTime}ms ${getResult ? '✅' : '❌'}`);

    // 验证数据一致性
    const dataMatch = JSON.stringify(testData) === JSON.stringify(getResult);
    console.log(`   数据一致性: ${dataMatch ? '✅' : '❌'}`);

    // 3. 测试批量操作性能
    console.log('\n3️⃣ 测试批量操作性能...');

    const batchKeys = [];
    const batchSize = 10;

    // 批量写入
    const batchWriteStart = Date.now();
    for (let i = 0; i < batchSize; i++) {
      const key = `batch_test_${i}`;
      const value = { index: i, data: `批量测试数据${i}` };
      await cacheManager.set(key, value, 300);
      batchKeys.push(key);
    }
    const batchWriteTime = Date.now() - batchWriteStart;
    console.log(`   批量写入(${batchSize}条): ${batchWriteTime}ms`);

    // 批量读取
    const batchReadStart = Date.now();
    const batchResults = [];
    for (const key of batchKeys) {
      const result = await cacheManager.get(key);
      batchResults.push(result);
    }
    const batchReadTime = Date.now() - batchReadStart;
    console.log(`   批量读取(${batchSize}条): ${batchReadTime}ms`);

    const batchSuccess =
      batchResults.filter(r => r !== null).length === batchSize;
    console.log(`   批量操作成功率: ${batchSuccess ? '✅' : '❌'}`);

    // 4. 测试缓存失效
    console.log('\n4️⃣ 测试缓存失效...');

    const expireKey = 'expire_test';
    await cacheManager.set(expireKey, { test: 'expire' }, 2); // 2秒过期

    // 立即读取
    const immediateResult = await cacheManager.get(expireKey);
    console.log(`   立即读取: ${immediateResult ? '✅ 有数据' : '❌ 无数据'}`);

    // 等待过期后读取
    setTimeout(async () => {
      const expiredResult = await cacheManager.get(expireKey);
      console.log(
        `   过期后读取: ${expiredResult ? '❌ 仍有数据' : '✅ 已过期'}`
      );
    }, 2500);

    // 5. 测试删除操作
    console.log('\n5️⃣ 测试删除操作...');

    const deleteKey = 'delete_test';
    await cacheManager.set(deleteKey, { test: 'delete' }, 300);

    const beforeDelete = await cacheManager.get(deleteKey);
    console.log(`   删除前: ${beforeDelete ? '✅ 存在' : '❌ 不存在'}`);

    const deleteResult = await cacheManager.del(deleteKey);
    console.log(`   删除操作: ${deleteResult ? '✅ 成功' : '❌ 失败'}`);

    const afterDelete = await cacheManager.get(deleteKey);
    console.log(`   删除后: ${afterDelete ? '❌ 仍存在' : '✅ 已删除'}`);

    // 6. 性能基准测试
    console.log('\n6️⃣ 性能基准测试...');

    const benchmarkIterations = 100;
    let totalWriteTime = 0;
    let totalReadTime = 0;
    let successfulOperations = 0;

    for (let i = 0; i < benchmarkIterations; i++) {
      const benchKey = `benchmark_${i}`;
      const benchData = { iteration: i, timestamp: Date.now() };

      // 写入测试
      const writeStart = Date.now();
      const writeSuccess = await cacheManager.set(benchKey, benchData, 60);
      totalWriteTime += Date.now() - writeStart;

      // 读取测试
      const readStart = Date.now();
      const readResult = await cacheManager.get(benchKey);
      totalReadTime += Date.now() - readStart;

      if (writeSuccess && readResult) {
        successfulOperations++;
      }
    }

    const avgWriteTime = (totalWriteTime / benchmarkIterations).toFixed(2);
    const avgReadTime = (totalReadTime / benchmarkIterations).toFixed(2);
    const successRate = (
      (successfulOperations / benchmarkIterations) *
      100
    ).toFixed(1);

    console.log(`   平均写入时间: ${avgWriteTime}ms`);
    console.log(`   平均读取时间: ${avgReadTime}ms`);
    console.log(`   操作成功率: ${successRate}%`);

    // 7. 清理测试数据
    console.log('\n7️⃣ 清理测试数据...');
    const cleanupPatterns = [
      'performance_test*',
      'batch_test_*',
      'benchmark_*',
    ];
    let totalCleaned = 0;

    for (const pattern of cleanupPatterns) {
      const cleaned = await cacheManager.delPattern(pattern);
      totalCleaned += cleaned;
    }

    console.log(`   清理完成，删除 ${totalCleaned} 条测试数据`);

    console.log('\n🎉 Redis缓存性能测试完成！');

    // 生成性能报告
    console.log('\n📊 性能测试报告:');
    console.log('=====================================');
    console.log(`缓存连接: ${stats.enabled ? '✅ 正常' : '❌ 异常'}`);
    console.log(`单次读取: ${readTime}ms`);
    console.log(`单次写入: ${writeTime}ms`);
    console.log(`批量操作: ${batchSuccess ? '✅ 通过' : '❌ 失败'}`);
    console.log(`基准测试: ${successRate}% 成功率`);
    console.log('=====================================');

    if (stats.enabled && successRate > 95) {
      console.log('🏆 缓存系统性能优秀，可以投入生产使用！');
    } else if (stats.enabled && successRate > 80) {
      console.log('🟡 缓存系统性能良好，建议进一步优化');
    } else {
      console.log('🔴 缓存系统存在问题，需要检查配置');
    }
  } catch (error) {
    console.error('❌ 缓存测试过程中出错:', error);
  } finally {
    // 关闭连接
    await cacheManager.close();
    console.log('\n🔒 Redis连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testRedisCache()
    .then(() => {
      console.log('\n缓存测试脚本执行完毕！');
      process.exit(0);
    })
    .catch(error => {
      console.error('缓存测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testRedisCache };
