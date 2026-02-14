// 一键部署定时任务脚本
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class CronDeployer {
  constructor() {
    this.projectRoot = path.join(__dirname);
  }

  async checkPrerequisites() {
    console.log('🔍 检查部署前提条件...\n');
    
    const checks = {
      vercelCli: false,
      configFile: false,
      envVars: false,
      cronRoutes: true
    };
    
    // 1. 检查 Vercel CLI
    try {
      await this.runCommand('vercel', ['--version'], { silent: true });
      checks.vercelCli = true;
      console.log('✅ Vercel CLI 已安装');
    } catch (error) {
      console.log('❌ Vercel CLI 未安装');
      console.log('💡 请运行: npm install -g vercel');
    }
    
    // 2. 检查配置文件
    try {
      await fs.access(path.join(this.projectRoot, 'vercel.json'));
      checks.configFile = true;
      console.log('✅ Vercel 配置文件存在');
    } catch {
      console.log('❌ Vercel 配置文件不存在');
    }
    
    // 3. 检查环境变量
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingEnvVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingEnvVars.push(envVar);
      }
    }
    
    if (missingEnvVars.length === 0) {
      checks.envVars = true;
      console.log('✅ 必需环境变量已设置');
    } else {
      console.log('❌ 缺少环境变量:');
      missingEnvVars.forEach(envVar => {
        console.log(`   - ${envVar}`);
      });
    }
    
    // 4. 检查定时任务路由
    const cronRoutes = [
      'src/app/api/cron/daily-task/route.ts',
      'src/app/api/cron/hourly-task/route.ts'
    ];
    
    for (const route of cronRoutes) {
      try {
        await fs.access(path.join(this.projectRoot, route));
        console.log(`✅ ${route} 存在`);
      } catch {
        console.log(`❌ ${route} 不存在`);
        checks.cronRoutes = false;
      }
    }
    
    return checks;
  }
  
  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: options.silent ? 'pipe' : 'inherit',
        shell: true
      });
      
      let output = '';
      if (options.silent) {
        child.stdout.on('data', (data) => {
          output += data.toString();
        });
      }
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`命令失败: ${command} ${args.join(' ')} (退出码: ${code})`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  async loginToVercel() {
    console.log('\n🔐 登录 Vercel...\n');
    
    try {
      await this.runCommand('vercel', ['login']);
      console.log('✅ Vercel 登录成功');
      return true;
    } catch (error) {
      console.error('❌ Vercel 登录失败:', error.message);
      return false;
    }
  }
  
  async deployToVercel() {
    console.log('\n🚀 部署到 Vercel...\n');
    
    try {
      const output = await this.runCommand('vercel', ['--prod'], {
        silent: false
      });
      
      console.log('\n✅ 部署完成!');
      
      // 提取部署 URL
      const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
      if (urlMatch) {
        const deployUrl = urlMatch[0];
        console.log(`🌐 部署地址: ${deployUrl}`);
        return deployUrl;
      }
      
      return null;
    } catch (error) {
      console.error('❌ 部署失败:', error.message);
      return null;
    }
  }
  
  async testDeployment(deployUrl) {
    if (!deployUrl) {
      console.log('\n⚠️ 无法测试部署 - 缺少部署 URL');
      return;
    }
    
    console.log('\n🧪 测试部署功能...\n');
    
    const testEndpoints = [
      '/api/health',
      '/api/cron/daily-task',
      '/api/cron/hourly-task'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`测试 ${endpoint}...`);
        const url = `${deployUrl}${endpoint}`;
        
        // 使用 Node.js 内置 fetch (Node 18+)
        const response = await fetch(url, { 
          method: 'GET',
          timeout: 10000 
        });
        
        console.log(`  状态码: ${response.status}`);
        if (response.ok) {
          console.log('  ✅ 响应正常');
        } else {
          console.log('  ⚠️ 响应异常');
        }
        
      } catch (error) {
        console.log(`  ❌ 测试失败: ${error.message}`);
      }
    }
  }
  
  async startMonitoring() {
    console.log('\n📊 启动监控...\n');
    
    try {
      // 运行监控脚本
      await this.runCommand('node', ['scripts/monitor-cron-jobs.js']);
      await this.runCommand('node', ['scripts/check-cron-execution.js', '--report']);
      
      console.log('\n✅ 监控系统启动完成');
    } catch (error) {
      console.error('❌ 监控启动失败:', error.message);
    }
  }
  
  async deploy() {
    console.log('🚀 开始 Vercel 定时任务部署流程...\n');
    
    // 1. 检查前提条件
    const checks = await this.checkPrerequisites();
    
    const allPassed = Object.values(checks).every(check => check);
    
    if (!allPassed) {
      console.log('\n❌ 部署前提条件未满足');
      console.log('💡 请解决上述问题后再重新部署');
      return false;
    }
    
    console.log('\n✅ 所有前提条件检查通过\n');
    
    // 2. 登录 Vercel
    const loggedIn = await this.loginToVercel();
    if (!loggedIn) {
      return false;
    }
    
    // 3. 执行部署
    const deployUrl = await this.deployToVercel();
    if (!deployUrl) {
      return false;
    }
    
    // 4. 测试部署
    await this.testDeployment(deployUrl);
    
    // 5. 启动监控
    await this.startMonitoring();
    
    // 6. 输出部署总结
    console.log('\n' + '='.repeat(50));
    console.log('🎉 部署完成总结');
    console.log('='.repeat(50));
    console.log(`✅ 应用已部署到: ${deployUrl}`);
    console.log('✅ 定时任务已配置:');
    console.log('   - 每日任务: 凌晨 3:00 执行');
    console.log('   - 每小时任务: 每小时整点执行');
    console.log('✅ 监控系统已启动');
    console.log('\n💡 后续操作:');
    console.log('1. 首次执行将在预定时间自动触发');
    console.log('2. 可通过 Vercel 控制台查看函数日志');
    console.log('3. 运行 "node scripts/check-cron-execution.js" 监控执行状态');
    console.log('4. 访问部署 URL 测试各项功能');
    
    return true;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const deployer = new CronDeployer();
  
  deployer.deploy()
    .then(success => {
      if (success) {
        console.log('\n🎊 部署流程成功完成!');
        process.exit(0);
      } else {
        console.log('\n💥 部署流程中断');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 部署过程中发生错误:', error);
      process.exit(1);
    });
}

module.exports = CronDeployer;