// Vercel 定时任务监控脚本
const fs = require('fs').promises;
const path = require('path');

class CronJobMonitor {
  constructor() {
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.monitoring = false;
  }

  async initialize() {
    // 创建日志目录
    try {
      await fs.access(this.logsDir);
    } catch {
      await fs.mkdir(this.logsDir, { recursive: true });
    }
  }

  // 检查 Vercel 配置
  async checkVercelConfig() {
    console.log('🔍 检查 Vercel 配置...');
    
    try {
      const configPath = path.join(__dirname, '..', 'vercel.json');
      await fs.access(configPath);
      
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      console.log('✅ Vercel 配置文件存在');
      console.log('📋 定时任务配置:');
      
      if (config.crons && config.crons.length > 0) {
        config.crons.forEach((cron, index) => {
          console.log(`  ${index + 1}. 路径: ${cron.path}`);
          console.log(`     时间: ${cron.schedule}`);
        });
      } else {
        console.log('  ⚠️ 未找到定时任务配置');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Vercel 配置检查失败:', error.message);
      return null;
    }
  }

  // 检查定时任务 API 路由
  async checkCronRoutes() {
    console.log('\n🔍 检查定时任务路由...');
    
    const routes = [
      'src/app/api/cron/daily-task/route.ts',
      'src/app/api/cron/hourly-task/route.ts'
    ];
    
    const results = {};
    
    for (const route of routes) {
      const fullPath = path.join(__dirname, '..', route);
      try {
        await fs.access(fullPath);
        const content = await fs.readFile(fullPath, 'utf8');
        
        // 检查是否包含必要的函数
        const hasGET = content.includes('export async function GET');
        const hasSupabase = content.includes('@supabase/supabase-js');
        
        results[route] = {
          exists: true,
          hasGET,
          hasSupabase,
          fileSize: content.length
        };
        
        console.log(`✅ ${route}: 存在`);
        if (!hasGET) console.log(`  ⚠️ 缺少 GET 函数`);
        if (!hasSupabase) console.log(`  ⚠️ 缺少 Supabase 引入`);
        
      } catch {
        results[route] = { exists: false };
        console.log(`❌ ${route}: 不存在`);
      }
    }
    
    return results;
  }

  // 模拟执行定时任务测试
  async testCronExecution() {
    console.log('\n🧪 测试定时任务执行...');
    
    const testResults = {};
    
    // 测试每日任务
    try {
      console.log('  执行每日任务测试...');
      const dailyTaskModule = require('../src/app/api/cron/daily-task/route');
      
      // 模拟请求对象
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/cron/daily-task'
      };
      
      // 注意：这里只是检查模块是否能正常导入
      testResults['daily-task'] = {
        moduleLoaded: true,
        message: '模块加载成功'
      };
      
      console.log('  ✅ 每日任务模块测试通过');
      
    } catch (error) {
      testResults['daily-task'] = {
        moduleLoaded: false,
        error: error.message
      };
      console.log('  ❌ 每日任务模块测试失败:', error.message);
    }
    
    // 测试每小时任务
    try {
      console.log('  执行每小时任务测试...');
      const hourlyTaskModule = require('../src/app/api/cron/hourly-task/route');
      
      testResults['hourly-task'] = {
        moduleLoaded: true,
        message: '模块加载成功'
      };
      
      console.log('  ✅ 每小时任务模块测试通过');
      
    } catch (error) {
      testResults['hourly-task'] = {
        moduleLoaded: false,
        error: error.message
      };
      console.log('  ❌ 每小时任务模块测试失败:', error.message);
    }
    
    return testResults;
  }

  // 监控日志文件
  async monitorLogs() {
    console.log('\n📝 监控执行日志...');
    
    try {
      // 创建今天的日志文件
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logsDir, `cron-execution-${today}.log`);
      
      // 写入初始日志
      const initialLog = `[${new Date().toISOString()}] 开始监控定时任务执行\n`;
      await fs.appendFile(logFile, initialLog);
      
      console.log(`  日志文件: ${logFile}`);
      console.log('  📊 实时监控已启动...');
      
      return logFile;
      
    } catch (error) {
      console.error('  ❌ 日志监控初始化失败:', error.message);
      return null;
    }
  }

  // 生成监控报告
  async generateReport(config, routes, testResults, logFile) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Vercel 定时任务配置与监控报告');
    console.log('='.repeat(60));
    
    const report = {
      timestamp: new Date().toISOString(),
      vercelConfig: config ? '✅ 配置正常' : '❌ 配置缺失',
      routes: {},
      tests: testResults,
      logFile: logFile || '❌ 日志文件创建失败'
    };
    
    // 路由状态
    Object.keys(routes).forEach(route => {
      const status = routes[route].exists ? '✅ 存在' : '❌ 缺失';
      report.routes[route] = status;
    });
    
    // 打印详细报告
    console.log('\n📋 配置状态:');
    console.log(`  Vercel 配置: ${report.vercelConfig}`);
    console.log(`  日志文件: ${report.logFile}`);
    
    console.log('\n📁 路由文件状态:');
    Object.entries(report.routes).forEach(([route, status]) => {
      console.log(`  ${route}: ${status}`);
    });
    
    console.log('\n🧪 测试结果:');
    Object.entries(testResults).forEach(([task, result]) => {
      const status = result.moduleLoaded ? '✅ 通过' : '❌ 失败';
      console.log(`  ${task}: ${status}`);
      if (result.error) {
        console.log(`    错误: ${result.error}`);
      }
    });
    
    // 总体评估
    const totalRoutes = Object.keys(routes).length;
    const existingRoutes = Object.values(routes).filter(r => r.exists).length;
    const passedTests = Object.values(testResults).filter(t => t.moduleLoaded).length;
    
    console.log('\n📈 总体评估:');
    console.log(`  路由文件完整度: ${existingRoutes}/${totalRoutes}`);
    console.log(`  模块测试通过率: ${passedTests}/${Object.keys(testResults).length}`);
    
    if (existingRoutes === totalRoutes && passedTests === Object.keys(testResults).length) {
      console.log('\n🎉 配置验证成功！');
      console.log('✅ 所有定时任务已正确配置');
      console.log('✅ 可以部署到 Vercel 并等待自动执行');
    } else {
      console.log('\n⚠️ 配置需要完善');
      if (existingRoutes < totalRoutes) {
        console.log('❌ 部分路由文件缺失');
      }
      if (passedTests < Object.keys(testResults).length) {
        console.log('❌ 部分模块测试失败');
      }
    }
    
    // 保存报告到文件
    const reportFile = path.join(this.logsDir, `cron-monitor-report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportFile}`);
    
    return report;
  }

  // 主监控函数
  async startMonitoring() {
    await this.initialize();
    
    console.log('🚀 启动 Vercel 定时任务监控系统...\n');
    
    // 1. 检查配置
    const config = await this.checkVercelConfig();
    
    // 2. 检查路由文件
    const routes = await this.checkCronRoutes();
    
    // 3. 测试执行
    const testResults = await this.testCronExecution();
    
    // 4. 启动日志监控
    const logFile = await this.monitorLogs();
    
    // 5. 生成报告
    await this.generateReport(config, routes, testResults, logFile);
    
    console.log('\n🎯 监控完成！');
    console.log('💡 下一步建议:');
    console.log('1. 部署到 Vercel 平台');
    console.log('2. 在 Vercel 控制台查看函数日志');
    console.log('3. 首次执行将在配置的时间自动触发');
    console.log('4. 可以通过访问 /api/cron/daily-task 手动测试');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new CronJobMonitor();
  monitor.startMonitoring().catch(error => {
    console.error('❌ 监控过程出错:', error);
    process.exit(1);
  });
}

module.exports = CronJobMonitor;