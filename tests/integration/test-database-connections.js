const {
  initializeDatabaseConnections,
  checkDatabaseHealth,
  dbConnectionManager,
} = require('../src/data-center/core/database-connection');

async function testDataBaseConnections() {
  console.log('🧪 测试数据库连接配置...\n');

  try {
    // 加载环境变量
    require('dotenv').config({ path: '.env.datacenter' });

    // 初始化数据库连接
    console.log('🔌 初始化数据库连接...');
    const initSuccess = await initializeDatabaseConnections();

    if (!initSuccess) {
      console.log('❌ 数据库连接初始化失败');
      return;
    }

    // 检查连接池状态
    console.log('\n📊 连接池状态:');
    const poolStatus = dbConnectionManager.getPoolStatus();
    Object.entries(poolStatus).forEach(([name, status]) => {
      console.log(`  ${name}:`);
      console.log(`    总连接数: ${status.totalCount}`);
      console.log(`    空闲连接: ${status.idleCount}`);
      console.log(`    等待连接: ${status.waitingCount}`);
    });

    // 执行健康检查
    console.log('\n🩺 数据库健康检查:');
    const healthStatus = await checkDatabaseHealth();
    Object.entries(healthStatus).forEach(([name, isHealthy]) => {
      console.log(`  ${name}: ${isHealthy ? '✅ 健康' : '❌ 不健康'}`);
    });

    // 测试基本查询
    console.log('\n🔍 测试基本查询:');

    try {
      const lionfixResult = await dbConnectionManager.query(
        'lionfix',
        'SELECT COUNT(*) as device_count FROM devices LIMIT 1'
      );
      console.log(
        `  lionfix设备表记录数: ${lionfixResult.rows[0].device_count}`
      );
    } catch (error) {
      console.log(`  lionfix查询测试: ❌ ${error.message}`);
    }

    try {
      const fixcycleResult = await dbConnectionManager.query(
        'fixcycle',
        'SELECT COUNT(*) as user_count FROM users LIMIT 1'
      );
      console.log(
        `  fixcycle用户表记录数: ${fixcycleResult.rows[0].user_count}`
      );
    } catch (error) {
      console.log(`  fixcycle查询测试: ❌ ${error.message}`);
    }

    // 总结
    const allHealthy = Object.values(healthStatus).every(
      status => status === true
    );
    console.log(
      `\n🎯 数据库连接配置测试: ${allHealthy ? '✅ 成功' : '❌ 部分失败'}`
    );

    if (allHealthy) {
      console.log('\n✅ 第一阶段任务1.2完成：数据库连接配置成功！');
    } else {
      console.log('\n⚠️  部分数据库连接存在问题，请检查配置');
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    // 清理连接
    await dbConnectionManager.closeAll();
  }
}

// 执行测试
testDataBaseConnections().catch(console.error);
