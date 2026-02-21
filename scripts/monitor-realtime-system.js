#!/usr/bin/env node

// 实时数据处理系统监控脚本
// 持续监控系统状态和性能指标

const { enhancedRealTimeService } = require('../src/data-center/streaming/enhanced-realtime-service');
const { monitoringAlertSystem } = require('../src/data-center/streaming/monitoring-alert-system');

async function monitorSystem() {
  console.log('🔍 实时数据处理系统监控启动...\n');
  
  try {
    // 初始化服务
    await enhancedRealTimeService.connect();
    monitoringAlertSystem.start();
    
    console.log('✅ 监控系统已启动\n');
    
    // 持续监控循环
    const monitoringInterval = setInterval(async () => {
      try {
        // 获取系统状态
        const stats = enhancedRealTimeService.getProcessingStats();
        const alerts = monitoringAlertSystem.getActiveAlerts();
        const systemHealth = await monitoringAlertSystem.getSystemHealth();
        
        // 清屏并显示状态
        console.clear();
        console.log('📊 实时数据处理系统监控面板');
        console.log('=====================================\n');
        
        // 处理统计
        console.log('📈 处理统计:');
        let totalProcessed = 0;
        let totalErrors = 0;
        
        for (const [eventType, stat] of stats.entries()) {
          if (stat.totalProcessed > 0) {
            const errorRate = stat.totalProcessed > 0 ? 
              ((stat.errorCount / stat.totalProcessed) * 100).toFixed(2) : '0.00';
            console.log(`  ${eventType}:`);
            console.log(`    处理量: ${stat.totalProcessed}`);
            console.log(`    成功率: ${((stat.successCount / stat.totalProcessed) * 100).toFixed(2)}%`);
            console.log(`    错误率: ${errorRate}%`);
            console.log(`    平均耗时: ${stat.averageProcessingTime}ms`);
            totalProcessed += stat.totalProcessed;
            totalErrors += stat.errorCount;
          }
        }
        
        console.log(`\n  总计: 处理${totalProcessed}个事件, 错误${totalErrors}个\n`);
        
        // 系统健康状态
        console.log('🏥 系统健康状态:');
        for (const [checkName, isHealthy] of Object.entries(systemHealth)) {
          const status = isHealthy ? '✅ 正常' : '❌ 异常';
          console.log(`  ${checkName}: ${status}`);
        }
        
        console.log('');
        
        // 活跃告警
        if (alerts.length > 0) {
          console.log('🚨 活跃告警:');
          alerts.slice(0, 5).forEach(alert => {
            const severityIcon = {
              'info': '🔵',
              'warning': '🟡',
              'error': '🔴',
              'critical': '💥'
            }[alert.severity] || '❓';
            
            console.log(`  ${severityIcon} [${alert.severity.toUpperCase()}] ${alert.title}`);
            console.log(`     ${alert.message}`);
            console.log(`     时间: ${new Date(alert.timestamp).toLocaleString()}`);
          });
          
          if (alerts.length > 5) {
            console.log(`  ... 还有 ${alerts.length - 5} 个告警`);
          }
        } else {
          console.log('✅ 无活跃告警\n');
        }
        
        // 资源使用情况
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        console.log('🖥️  资源使用情况:');
        console.log(`  内存使用: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  内存总量: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  CPU用户时间: ${(cpuUsage.user / 1000000).toFixed(2)} 秒`);
        console.log(`  CPU系统时间: ${(cpuUsage.system / 1000000).toFixed(2)} 秒\n`);
        
        console.log('🕒 更新时间:', new Date().toLocaleString());
        console.log('按 Ctrl+C 退出监控');
        
      } catch (error) {
        console.error('❌ 监控轮询失败:', error.message);
      }
    }, 5000); // 每5秒更新一次
    
    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n\n🛑 正在停止监控...');
      clearInterval(monitoringInterval);
      monitoringAlertSystem.stop();
      enhancedRealTimeService.disconnect().then(() => {
        console.log('✅ 监控系统已停止');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ 监控系统启动失败:', error);
    process.exit(1);
  }
}

// 运行监控
if (require.main === module) {
  monitorSystem().catch(error => {
    console.error('监控异常:', error);
    process.exit(1);
  });
}

module.exports = { monitorSystem };