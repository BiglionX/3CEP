import { MonitoringService } from '../src/services/monitoring-service';

async function testMonitoringService() {
  console.log('🧪 开始测试监控服务...');
  
  // 测试获取系统指标
  console.log('\n--- 测试获取系统指标 ---');
  const metrics = await MonitoringService.getSystemMetrics();
  console.log('系统指标:', metrics);
  
  // 测试获取系统健康度
  console.log('\n--- 测试获取系统健康度 ---');
  const healthScore = await MonitoringService.getSystemHealth();
  console.log('系统健康度:', healthScore + '%');
  
  // 测试获取历史数据
  console.log('\n--- 测试获取历史数据 ---');
  const historicalData = await MonitoringService.getHistoricalData('active_users', 6);
  console.log('历史数据点数:', historicalData.length);
  console.log('示例数据点:', historicalData[0]);
  
  // 测试获取系统警告
  console.log('\n--- 测试获取系统警告 ---');
  const alerts = await MonitoringService.getRecentAlerts(5);
  console.log('警告数量:', alerts.length);
  alerts.forEach((alert, index) => {
    console.log(`警告 ${index + 1}:`, alert.message);
  });
  
  console.log('\n✅ 监控服务测试完成');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testMonitoringService().catch(console.error);
}

export { testMonitoringService };
