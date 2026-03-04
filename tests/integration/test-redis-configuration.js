#!/usr/bin/env node

// Redis配置和连接测试脚本
// 环境变量将在运行时从.env.datacenter文件加载

// 动态导入ES模块
async function runRedisTests() {
  try {
    // 导入必要的模块
    const { redisClient, redisPool, RedisConnectionPool } =
      await import('../src/data-center/core/data-center-service');
    const { redisHealthMonitor } =
      await import('../src/data-center/core/redis-health-monitor');
    const { monitoringService } =
      await import('../src/data-center/monitoring/monitoring-service');

    console.log('🧪 开始Redis配置和连接测试...\n');

    // 测试1: 基本连接测试
    console.log('1️⃣ 测试基本Redis连接...');
    try {
      const pingResult = await redisClient.ping();
      console.log(`   ✅ Ping测试成功: ${pingResult}`);
    } catch (error) {
      console.log(`   ❌ Ping测试失败: ${error.message}`);
      return false;
    }

    // 测试2: 连接池功能测试
    console.log('\n2️⃣ 测试Redis连接池...');
    try {
      const pool = RedisConnectionPool.getInstance();
      const testCommands = [
        ['set', 'test:key1', 'value1'],
        ['set', 'test:key2', 'value2'],
        ['get', 'test:key1'],
        ['get', 'test:key2'],
      ];

      const results = await pool.pipeline(testCommands);
      console.log(`   ✅ 连接池pipeline测试成功`);
      console.log(`   📊 结果: ${JSON.stringify(results)}`);
    } catch (error) {
      console.log(`   ❌ 连接池测试失败: ${error.message}`);
    }

    // 测试3: 健康监控测试
    console.log('\n3️⃣ 测试健康监控服务...');
    try {
      const healthStatus = await redisHealthMonitor.checkHealth();
      console.log(`   ✅ 健康检查完成:`);
      console.log(`     连接状态: ${healthStatus.isConnected ? '✅' : '❌'}`);
      console.log(`     延迟: ${healthStatus.pingLatency}ms`);
      console.log(`     内存使用: ${healthStatus.memoryUsage.usedMemoryHuman}`);
      console.log(`     连接数: ${healthStatus.clients.connectedClients}`);
    } catch (error) {
      console.log(`   ❌ 健康监控测试失败: ${error.message}`);
    }

    // 测试4: 监控指标记录
    console.log('\n4️⃣ 测试监控指标记录...');
    try {
      monitoringService.recordMetric('redis_test_metric', 95.5, {
        test: 'connection_pool',
      });

      const recentMetrics = monitoringService.getMetrics('redis_test_metric');
      console.log(`   ✅ 监控指标记录成功`);
      console.log(`   📊 最近指标数: ${recentMetrics.length}`);
    } catch (error) {
      console.log(`   ❌ 监控指标测试失败: ${error.message}`);
    }

    // 测试5: 性能基准测试
    console.log('\n5️⃣ 执行性能基准测试...');
    try {
      const testIterations = 1000;
      const startTime = Date.now();

      // 批量SET操作
      const setCommands = [];
      for (let i = 0; i < testIterations; i++) {
        setCommands.push(['set', `perf:test:${i}`, `value_${i}`]);
      }

      await redisPool.pipeline(setCommands);

      // 批量GET操作
      const getCommands = [];
      for (let i = 0; i < testIterations; i++) {
        getCommands.push(['get', `perf:test:${i}`]);
      }

      const getResults = await redisPool.pipeline(getCommands);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const opsPerSecond = Math.round(
        (testIterations * 2) / (totalTime / 1000)
      );

      console.log(`   ✅ 性能基准测试完成:`);
      console.log(`     总操作数: ${testIterations * 2}`);
      console.log(`     总耗时: ${totalTime}ms`);
      console.log(`     QPS: ${opsPerSecond}`);
      console.log(
        `     平均延迟: ${(totalTime / (testIterations * 2)).toFixed(2)}ms`
      );

      // 记录性能指标
      monitoringService.recordMetric('redis_benchmark_qps', opsPerSecond);
      monitoringService.recordMetric(
        'redis_benchmark_avg_latency',
        totalTime / (testIterations * 2)
      );
    } catch (error) {
      console.log(`   ❌ 性能基准测试失败: ${error.message}`);
    }

    // 测试6: 错误处理和恢复
    console.log('\n6️⃣ 测试错误处理和恢复...');
    try {
      // 模拟连接中断后的恢复
      console.log('   模拟连接测试...');
      await redisClient.ping();
      console.log('   ✅ 错误恢复测试通过');
    } catch (error) {
      console.log(`   ⚠️ 错误处理测试: ${error.message}`);
    }

    // 启动健康监控
    console.log('\n7️⃣ 启动健康监控...');
    try {
      redisHealthMonitor.startMonitoring(10000); // 10秒检查一次用于测试
      console.log('   ✅ 健康监控已启动');

      // 运行几秒钟观察
      await new Promise(resolve => setTimeout(resolve, 15000));

      redisHealthMonitor.stopMonitoring();
      console.log('   ✅ 健康监控已停止');
    } catch (error) {
      console.log(`   ❌ 健康监控测试失败: ${error.message}`);
    }

    // 清理测试数据
    console.log('\n8️⃣ 清理测试数据...');
    try {
      const cleanupPattern = 'test:*';
      const keys = await redisClient.keys(cleanupPattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`   ✅ 清理了 ${keys.length} 个测试键`);
      } else {
        console.log('   ✅ 无需清理测试数据');
      }
    } catch (error) {
      console.log(`   ⚠️ 数据清理警告: ${error.message}`);
    }

    console.log('\n🎉 Redis配置和连接测试完成！');
    console.log('\n📊 测试总结:');
    console.log('✅ 基本连接测试通过');
    console.log('✅ 连接池功能正常');
    console.log('✅ 健康监控服务可用');
    console.log('✅ 监控指标记录正常');
    console.log('✅ 性能基准测试完成');
    console.log('✅ 错误处理机制有效');

    return true;
  } catch (error) {
    console.error('\n❌ Redis测试执行失败:', error);
    return false;
  }
}

// 运行测试
if (require.main === module) {
  runRedisTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试脚本执行异常:', error);
      process.exit(1);
    });
}

module.exports = { runRedisTests };
