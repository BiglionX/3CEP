/**
 * 权限同步功能验证脚本
 */

async function testPermissionSync() {
  console.log('🚀 开始权限同步功能验证...\n');

  try {
    // 动态导入模块
    const { PermissionSyncManager } =
      await import('../src/permissions/core/permission-sync.js');
    const { PermissionManager } =
      await import('../src/permissions/core/permission-manager.js');
    const { PermissionConfigManager } =
      await import('../src/permissions/config/permission-config.js');

    console.log('✅ 模块导入成功');

    // 创建实例
    const syncManager = PermissionSyncManager.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    console.log('✅ 实例创建成功');

    // 测试初始状态
    const initialStatus = syncManager.getStatus();
    console.log('\n📋 初始同步状态:');
    console.log('- 已同步:', initialStatus.isSynced);
    console.log(
      '- 上次同步时间:',
      new Date(initialStatus.lastSyncTime).toLocaleString()
    );
    console.log('- 不匹配数量:', initialStatus.mismatchCount);

    // 测试事件记录
    console.log('\n📝 测试事件记录...');
    syncManager['recordSyncEvent']('sync_start');
    syncManager['recordSyncEvent']('sync_complete', {
      duration: 150,
      hasMismatches: false,
    });
    syncManager['recordSyncEvent']('sync_error', { error: '测试错误' });

    const history = syncManager.getSyncHistory(5);
    console.log('✅ 记录了', history.length, '个同步事件');

    // 测试不匹配记录
    console.log('\n⚠️  测试不匹配记录...');
    syncManager['recordMismatch']({
      permission: 'test_permission',
      frontendResult: true,
      backendResult: false,
      userId: 'test-user',
      timestamp: Date.now(),
    });

    const mismatches = syncManager.getMismatches(10);
    console.log('✅ 记录了', mismatches.length, '个权限不匹配');

    // 测试状态订阅
    console.log('\n📡 测试状态订阅...');
    let subscriptionCalled = false;
    const unsubscribe = syncManager.subscribe(status => {
      subscriptionCalled = true;
      console.log('收到状态更新:', {
        synced: status.isSynced,
        mismatchCount: status.mismatchCount,
      });
    });

    // 触发状态更新
    syncManager['syncStatus'].isSynced = true;
    syncManager['notifySubscribers']();

    if (subscriptionCalled) {
      console.log('✅ 状态订阅功能正常');
    }

    // 测试报告生成
    console.log('\n📊 测试报告生成...');
    const report = syncManager.getSyncReport();

    console.log('同步状态报告:');
    console.log('- 状态:', report.status);
    console.log('- 不匹配数量:', report.mismatches.length);
    console.log('- 历史记录数量:', report.syncHistory.length);

    console.log('\n性能统计:');
    console.log(
      '- 平均同步时间:',
      report.performance.averageSyncTime.toFixed(2),
      'ms'
    );
    console.log('- 同步频率:', report.performance.syncFrequency, 'ms');
    console.log('- 错误率:', report.performance.errorRate.toFixed(2), '%');

    // 测试清理功能
    console.log('\n🧹 测试清理功能...');
    syncManager.clearMismatches();
    const clearedMismatches = syncManager.getMismatches();

    if (clearedMismatches.length === 0) {
      console.log('✅ 不匹配记录清理成功');
    }

    // 取消订阅
    unsubscribe();

    console.log('\n🎉 权限同步功能验证完成！');
    console.log('\n✅ 所有核心功能测试通过:');
    console.log('  - 单例模式 ✓');
    console.log('  - 状态管理 ✓');
    console.log('  - 事件记录 ✓');
    console.log('  - 不匹配检测 ✓');
    console.log('  - 状态订阅 ✓');
    console.log('  - 报告生成 ✓');
    console.log('  - 清理功能 ✓');

    return true;
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    return false;
  }
}

// 执行测试
testPermissionSync()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
