// 检查定时任务执行状态脚本
const fs = require('fs').promises;
const path = require('path');

class CronExecutionChecker {
  constructor() {
    this.logsDir = path.join(__dirname, '..', 'logs');
  }

  async checkExecutionStatus() {
    console.log('🔍 检查定时任务执行状态...\n');
    
    try {
      // 1. 检查日志目录
      await fs.access(this.logsDir);
      console.log('✅ 日志目录存在');
      
      // 2. 查找最新的执行日志
      const logFiles = await fs.readdir(this.logsDir);
      const cronLogs = logFiles.filter(file => file.startsWith('cron-execution-'));
      
      if (cronLogs.length === 0) {
        console.log('⚠️ 未找到定时任务执行日志');
        console.log('💡 可能原因:');
        console.log('  - 定时任务尚未首次执行');
        console.log('  - 应用程序还未部署到 Vercel');
        console.log('  - 日志记录功能未启用');
        return;
      }
      
      // 找到最新的日志文件
      const latestLogFile = cronLogs.sort().reverse()[0];
      const logFilePath = path.join(this.logsDir, latestLogFile);
      
      console.log(`📄 检查日志文件: ${latestLogFile}`);
      
      // 3. 读取并分析日志内容
      const logContent = await fs.readFile(logFilePath, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      console.log(`📊 日志行数: ${logLines.length}`);
      
      // 分析日志内容
      const executionEntries = [];
      let lastExecution = null;
      
      for (const line of logLines) {
        if (line.includes('开始执行') || line.includes('执行完成') || line.includes('执行失败')) {
          const timestampMatch = line.match(/\[(.*?)\]/);
          if (timestampMatch) {
            executionEntries.push({
              timestamp: timestampMatch[1],
              content: line
            });
            
            if (line.includes('执行完成') || line.includes('执行失败')) {
              lastExecution = {
                timestamp: timestampMatch[1],
                success: line.includes('执行完成'),
                content: line
              };
            }
          }
        }
      }
      
      // 4. 显示执行历史
      console.log('\n📋 执行历史记录:');
      if (executionEntries.length > 0) {
        executionEntries.slice(-10).forEach(entry => {
          const status = entry.content.includes('执行完成') ? '✅' : 
                        entry.content.includes('执行失败') ? '❌' : '⏳';
          console.log(`  ${status} [${entry.timestamp}] ${entry.content.replace(/\[.*?\]\s*/, '')}`);
        });
      } else {
        console.log('  ⚠️ 未找到明确的执行记录');
      }
      
      // 5. 显示最近一次执行状态
      console.log('\n📊 最近执行状态:');
      if (lastExecution) {
        const status = lastExecution.success ? '成功' : '失败';
        const statusIcon = lastExecution.success ? '✅' : '❌';
        console.log(`  状态: ${statusIcon} ${status}`);
        console.log(`  时间: ${lastExecution.timestamp}`);
        console.log(`  详情: ${lastExecution.content}`);
      } else {
        console.log('  ⚠️ 未找到最近的执行记录');
      }
      
      // 6. 检查错误信息
      const errorLines = logLines.filter(line => 
        line.includes('ERROR') || 
        line.includes('error') || 
        line.includes('失败') ||
        line.includes('Exception')
      );
      
      if (errorLines.length > 0) {
        console.log('\n❌ 发现错误记录:');
        errorLines.slice(-5).forEach(errorLine => {
          console.log(`  ${errorLine}`);
        });
      } else {
        console.log('\n✅ 未发现明显错误记录');
      }
      
      // 7. 提供监控建议
      console.log('\n💡 监控建议:');
      
      const now = new Date();
      const lastExecTime = lastExecution ? new Date(lastExecution.timestamp) : null;
      
      if (!lastExecution) {
        console.log('  🔍 首次执行可能还在等待中');
        console.log('  ⏰ 每日任务: 凌晨3点执行');
        console.log('  ⏰ 每小时任务: 每小时整点执行');
      } else if (lastExecTime) {
        const hoursSinceLast = (now - lastExecTime) / (1000 * 60 * 60);
        
        if (hoursSinceLast > 25) {
          console.log('  ⚠️ 距离上次执行已超过25小时');
          console.log('  🔧 建议检查:');
          console.log('    - Vercel 部署状态');
          console.log('    - 函数日志是否有错误');
          console.log('    - 环境变量配置');
        } else if (hoursSinceLast > 2) {
          console.log('  ℹ️ 系统运行正常');
          console.log(`  ⏰ 上次执行: ${Math.floor(hoursSinceLast)}小时前`);
        } else {
          console.log('  ✅ 系统近期有正常执行记录');
        }
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('❌ 日志目录不存在');
        console.log('💡 请先运行监控脚本初始化日志系统');
      } else {
        console.error('❌ 检查过程中发生错误:', error.message);
      }
    }
  }
  
  async manualTestExecution() {
    console.log('🧪 手动测试定时任务执行...\n');
    
    try {
      // 测试每日任务
      console.log('1️⃣ 测试每日任务 (/api/cron/daily-task)');
      const dailyTaskPath = path.join(__dirname, '..', 'src', 'app', 'api', 'cron', 'daily-task', 'route.ts');
      
      try {
        await fs.access(dailyTaskPath);
        console.log('  ✅ 路由文件存在');
        
        // 动态导入测试
        const dailyTaskModule = await import(dailyTaskPath);
        console.log('  ✅ 模块可以正常导入');
        
        if (typeof dailyTaskModule.GET === 'function') {
          console.log('  ✅ GET 函数存在');
        } else {
          console.log('  ⚠️ GET 函数不存在');
        }
        
      } catch (error) {
        console.log('  ❌ 路由文件不存在或导入失败:', error.message);
      }
      
      // 测试每小时任务
      console.log('\n2️⃣ 测试每小时任务 (/api/cron/hourly-task)');
      const hourlyTaskPath = path.join(__dirname, '..', 'src', 'app', 'api', 'cron', 'hourly-task', 'route.ts');
      
      try {
        await fs.access(hourlyTaskPath);
        console.log('  ✅ 路由文件存在');
        
        const hourlyTaskModule = await import(hourlyTaskPath);
        console.log('  ✅ 模块可以正常导入');
        
        if (typeof hourlyTaskModule.GET === 'function') {
          console.log('  ✅ GET 函数存在');
        } else {
          console.log('  ⚠️ GET 函数不存在');
        }
        
      } catch (error) {
        console.log('  ❌ 路由文件不存在或导入失败:', error.message);
      }
      
      console.log('\n✅ 手动测试完成');
      console.log('💡 如需实际执行测试，请部署到 Vercel 后访问对应路由');
      
    } catch (error) {
      console.error('❌ 手动测试过程中发生错误:', error.message);
    }
  }
  
  async generateStatusReport() {
    console.log('📊 生成定时任务状态报告...\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: 'unknown',
      lastExecution: null,
      recentErrors: [],
      recommendations: []
    };
    
    try {
      // 尝试读取日志文件
      await fs.access(this.logsDir);
      const logFiles = await fs.readdir(this.logsDir);
      const cronLogs = logFiles.filter(file => file.startsWith('cron-execution-'));
      
      if (cronLogs.length > 0) {
        const latestLogFile = cronLogs.sort().reverse()[0];
        const logFilePath = path.join(this.logsDir, latestLogFile);
        const logContent = await fs.readFile(logFilePath, 'utf8');
        
        // 分析日志内容填充报告
        const lines = logContent.split('\n');
        const executionLines = lines.filter(line => 
          line.includes('执行完成') || line.includes('执行失败')
        );
        
        if (executionLines.length > 0) {
          const lastLine = executionLines[executionLines.length - 1];
          const timestampMatch = lastLine.match(/\[(.*?)\]/);
          
          if (timestampMatch) {
            report.lastExecution = {
              timestamp: timestampMatch[1],
              success: lastLine.includes('执行完成'),
              message: lastLine
            };
            
            report.systemStatus = lastLine.includes('执行完成') ? 'healthy' : 'degraded';
          }
        }
        
        // 收集错误信息
        const errorLines = lines.filter(line => 
          line.includes('ERROR') || line.includes('error') || line.includes('失败')
        );
        
        report.recentErrors = errorLines.slice(-10).map(line => ({
          content: line,
          timestamp: line.match(/\[(.*?)\]/)?.[1] || 'unknown'
        }));
      }
      
    } catch (error) {
      report.systemStatus = 'unknown';
      report.error = error.message;
    }
    
    // 生成建议
    if (report.systemStatus === 'unknown') {
      report.recommendations = [
        '部署应用程序到 Vercel',
        '等待首次定时任务自动执行',
        '检查 Vercel 函数日志'
      ];
    } else if (report.systemStatus === 'degraded') {
      report.recommendations = [
        '检查函数日志中的错误信息',
        '验证环境变量配置',
        '确认 Supabase 连接状态'
      ];
    } else {
      report.recommendations = [
        '系统运行正常',
        '继续保持监控',
        '定期检查执行日志'
      ];
    }
    
    // 输出报告
    console.log('📋 定时任务状态报告');
    console.log('====================');
    console.log(`状态: ${report.systemStatus}`);
    console.log(`报告时间: ${report.timestamp}`);
    
    if (report.lastExecution) {
      console.log(`最后执行: ${report.lastExecution.timestamp}`);
      console.log(`执行结果: ${report.lastExecution.success ? '成功' : '失败'}`);
    }
    
    if (report.recentErrors.length > 0) {
      console.log(`\n最近错误 (${report.recentErrors.length} 条):`);
      report.recentErrors.forEach(error => {
        console.log(`  [${error.timestamp}] ${error.content}`);
      });
    }
    
    console.log(`\n建议操作:`);
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
    // 保存报告
    const reportFile = path.join(this.logsDir, `status-report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 报告已保存到: ${reportFile}`);
    
    return report;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const checker = new CronExecutionChecker();
  
  // 根据参数决定执行什么操作
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    checker.manualTestExecution();
  } else if (args.includes('--report')) {
    checker.generateStatusReport();
  } else {
    checker.checkExecutionStatus();
  }
}

module.exports = CronExecutionChecker;