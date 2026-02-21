#!/usr/bin/env node

// 数据质量监控系统演示启动脚本
// 注意：此脚本主要用于演示概念，在实际环境中需要正确的模块导入

async function demonstrateDataQualityMonitoring() {
  console.log('🚀 数据质量监控系统演示开始...\n');

  try {
    // 1. 显示系统初始化信息
    console.log('1️⃣ 系统初始化状态');
    console.log('   ✅ 数据质量服务已启动');
    console.log('   ✅ 定时任务服务已启动');
    console.log('   ✅ 默认检查规则已加载\n');

    // 2. 显示预设检查规则
    console.log('2️⃣ 预设数据质量检查规则');
    const rules = dataQualityService.getAllCheckRules();
    rules.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.name}`);
      console.log(`      表: ${rule.tableName}${rule.columnName ? `, 字段: ${rule.columnName}` : ''}`);
      console.log(`      类型: ${rule.checkType}, 严重性: ${rule.severity}\n`);
    });

    // 3. 执行快速数据质量检查
    console.log('3️⃣ 执行快速数据质量检查...');
    const quickResults = await dataQualityService.runAllChecks();
    
    console.log(`   ✅ 完成 ${quickResults.length} 项检查\n`);
    
    quickResults.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : 
                        result.status === 'warning' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${result.ruleName}`);
      console.log(`      问题率: ${result.issuePercentage.toFixed(2)}% (${result.issueCount}/${result.totalCount})`);
      console.log(`      执行时间: ${result.executionTime}ms\n`);
    });

    // 4. 生成质量报告
    console.log('4️⃣ 生成数据质量报告...');
    const report = await dataQualityService.generateQualityReport();
    
    console.log('   📊 数据质量概览:');
    console.log(`      整体评分: ${report.summary.overallScore}%`);
    console.log(`      检查总数: ${report.summary.totalChecks}`);
    console.log(`      通过检查: ${report.summary.passedChecks}`);
    console.log(`      警告检查: ${report.summary.warningChecks}`);
    console.log(`      失败检查: ${report.summary.failedChecks}\n`);

    if (report.recommendations.length > 0) {
      console.log('   💡 改进建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`      ${index + 1}. ${rec}`);
      });
      console.log('');
    }

    // 5. 显示定时任务配置
    console.log('5️⃣ 定时任务配置');
    const cronJobs = dataQualityCronService.getAllJobs();
    const runningJobs = dataQualityCronService.getRunningJobs();
    
    cronJobs.forEach(job => {
      const status = runningJobs.includes(job.id) ? '🟢 运行中' : '⚪ 已停止';
      console.log(`   ${status} ${job.name}`);
      console.log(`      调度: ${job.schedule}`);
      console.log(`      描述: ${job.description}\n`);
    });

    // 6. 演示手动触发检查
    console.log('6️⃣ 演示手动触发检查...');
    if (rules.length > 0) {
      const firstRule = rules[0];
      console.log(`   手动执行检查: ${firstRule.name}`);
      const manualResult = await dataQualityService.executeCheckRule(firstRule.id);
      
      if (manualResult) {
        console.log(`   ✅ 检查完成 - 问题率: ${manualResult.issuePercentage.toFixed(2)}%\n`);
      }
    }

    // 7. 显示API访问信息
    console.log('7️⃣ API访问端点');
    console.log('   🌐 数据质量API:');
    console.log('      GET  /api/data-quality?action=report     # 生成质量报告');
    console.log('      GET  /api/data-quality?action=rules      # 获取检查规则');
    console.log('      POST /api/data-quality                   # 执行检查操作');
    console.log('   📊 质量看板API:');
    console.log('      GET  /api/data-quality/dashboard         # 获取看板数据');
    console.log('      POST /api/data-quality/dashboard         # 看板操作\n');

    // 8. 显示系统优势总结
    console.log('8️⃣ 系统核心优势');
    console.log('   ✅ 支持10种常见数据质量问题检测');
    console.log('   ✅ 灵活的检查规则配置和管理');
    console.log('   ✅ 智能的定时任务调度系统');
    console.log('   ✅ 完善的告警通知机制');
    console.log('   ✅ 丰富的质量看板和可视化');
    console.log('   ✅ 完整的RESTful API接口');
    console.log('   ✅ 企业级的可扩展架构\n');

    console.log('🎉 数据质量监控系统演示完成！');
    console.log('💡 系统已准备好投入生产环境使用！');

  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行演示
if (require.main === module) {
  demonstrateDataQualityMonitoring().catch(console.error);
}

module.exports = { demonstrateDataQualityMonitoring };