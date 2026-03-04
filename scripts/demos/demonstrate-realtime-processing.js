#!/usr/bin/env node

// 实时数据处理系统演示脚本
// 展示完整的事件处理流程

const {
  enhancedRealTimeService,
  EventPriority,
} = require('../src/data-center/streaming/enhanced-realtime-service');
const {
  businessEventTrigger,
} = require('../src/data-center/streaming/business-event-trigger');
const {
  eventProcessingPipeline,
} = require('../src/data-center/streaming/notification-alert-system');
const {
  monitoringAlertSystem,
} = require('../src/data-center/streaming/monitoring-alert-system');

async function runDemonstration() {
  console.log('🚀 实时数据处理系统演示开始...\n');

  try {
    // 1. 系统初始化
    console.log('1️⃣ 系统初始化...');
    await enhancedRealTimeService.connect();
    await enhancedRealTimeService.startConsumers();
    eventProcessingPipeline.start();
    monitoringAlertSystem.start();
    console.log('   ✅ 系统初始化完成\n');

    // 2. 演示不同类型事件处理
    console.log('2️⃣ 事件处理演示...');

    // 价格更新事件（高优先级）
    console.log('   💰 价格更新事件处理:');
    const priceEventId = await businessEventTrigger.triggerPriceUpdate({
      partId: 'PART001',
      oldPrice: 100.0,
      newPrice: 85.0,
      changePercent: -15.0,
      platform: 'taobao',
      currency: 'CNY',
      supplierId: 'SUP001',
    });
    console.log(`      事件ID: ${priceEventId}`);

    // 库存变更事件（高优先级）
    console.log('   📦 库存变更事件处理:');
    const inventoryEventId = await businessEventTrigger.triggerInventoryChange({
      partId: 'PART002',
      oldQuantity: 50,
      newQuantity: 5,
      changeAmount: -45,
      minStock: 10,
      maxStock: 100,
      warehouseId: 'WH001',
    });
    console.log(`      事件ID: ${inventoryEventId}`);

    // 用户行为事件（低优先级）
    console.log('   👤 用户行为事件处理:');
    const userEventId = await businessEventTrigger.triggerUserAction({
      userId: 'USER001',
      actionType: 'product_view',
      resourceId: 'PART001',
      resourceType: 'product',
      timestamp: new Date().toISOString(),
      sessionId: 'SESSION001',
    });
    console.log(`      事件ID: ${userEventId}`);

    console.log('');

    // 3. 演示告警触发
    console.log('3️⃣ 告警系统演示...');

    // 触发价格大幅波动告警
    console.log('   🚨 价格波动告警:');
    const alertEventId = await businessEventTrigger.triggerPriceUpdate({
      partId: 'PART003',
      oldPrice: 100.0,
      newPrice: 65.0,
      changePercent: -35.0, // 超过阈值触发告警
      platform: 'jd',
      currency: 'CNY',
    });
    console.log(`      告警事件ID: ${alertEventId}`);

    // 触发库存不足告警
    console.log('   🚨 库存不足告警:');
    const lowStockEventId = await businessEventTrigger.triggerInventoryChange({
      partId: 'PART004',
      oldQuantity: 15,
      newQuantity: 2,
      changeAmount: -13,
      minStock: 10,
      maxStock: 50,
    });
    console.log(`      告警事件ID: ${lowStockEventId}`);

    console.log('');

    // 4. 显示系统状态
    console.log('4️⃣ 系统状态展示...');

    // 显示处理统计
    const processingStats = enhancedRealTimeService.getProcessingStats();
    console.log('   📊 处理统计:');
    for (const [eventType, stats] of processingStats.entries()) {
      if (stats.totalProcessed > 0) {
        console.log(
          `      ${eventType}: 处理${stats.totalProcessed}个, 成功${stats.successCount}个, 错误${stats.errorCount}个`
        );
      }
    }

    // 显示活跃告警
    const activeAlerts = monitoringAlertSystem.getActiveAlerts();
    console.log('   🚨 活跃告警:');
    if (activeAlerts.length > 0) {
      activeAlerts.slice(0, 3).forEach(alert => {
        console.log(`      [${alert.severity}] ${alert.title}`);
      });
    } else {
      console.log('      无活跃告警');
    }

    console.log('');

    // 5. 性能测试
    console.log('5️⃣ 性能测试...');

    const startTime = Date.now();
    const testEvents = 50;

    // 批量发布测试事件
    const promises = [];
    for (let i = 0; i < testEvents; i++) {
      promises.push(
        businessEventTrigger.triggerUserAction({
          userId: `USER_TEST_${i}`,
          actionType: 'test_performance',
          timestamp: new Date().toISOString(),
        })
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgLatency = totalTime / testEvents;

    console.log(`   📈 性能结果:`);
    console.log(`      总事件数: ${testEvents}`);
    console.log(`      总耗时: ${totalTime}ms`);
    console.log(`      平均延迟: ${avgLatency.toFixed(2)}ms`);
    console.log(
      `      处理速率: ${(testEvents / (totalTime / 1000)).toFixed(2)} events/sec`
    );

    console.log('');

    // 6. 验证结果
    console.log('6️⃣ 结果验证...');

    const validationPassed = avgLatency < 100; // 验证延迟要求
    console.log(
      `   ⚡ 延迟验证: ${validationPassed ? '✅ 通过' : '❌ 未通过'} (<100ms)`
    );
    console.log(
      `   🎯 系统验证: ${validationPassed ? '✅ 系统运行正常' : '❌ 需要优化'}`
    );

    console.log('\n🎉 实时数据处理系统演示完成！');
  } catch (error) {
    console.error('❌ 演示执行失败:', error);
    process.exit(1);
  } finally {
    // 清理资源
    console.log('\n🧹 清理系统资源...');
    monitoringAlertSystem.stop();
    eventProcessingPipeline.stop();
    await enhancedRealTimeService.disconnect();
    console.log('✅ 资源清理完成');
  }
}

// 运行演示
if (require.main === module) {
  runDemonstration().catch(error => {
    console.error('演示异常:', error);
    process.exit(1);
  });
}

module.exports = { runDemonstration };
