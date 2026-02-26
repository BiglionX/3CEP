const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RobustE2ETestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      modules: {},
      summary: {
        totalModules: 0,
        completedModules: 0,
        passedTests: 0,
        failedTests: 0,
        totalTime: 0
      }
    };
  }

  async executeModule(moduleName, testFile) {
    console.log(`\n🚀 开始执行模块: ${moduleName}`);
    console.log(`📄 测试文件: ${testFile}`);
    
    const startTime = Date.now();
    
    try {
      // 先执行基础验证确保环境正常
      console.log('🔍 执行环境检查...');
      execSync('npx playwright test tests/e2e/basic-functionality.spec.ts --project=chromium-desktop', {
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('✅ 环境检查通过');
      
      // 执行目标测试模块
      console.log('🧪 执行测试模块...');
      const result = execSync(`npx playwright test ${testFile} --project=chromium-desktop --workers=1 --timeout=120000`, {
        stdio: 'pipe',
        timeout: 180000 // 3分钟超时
      });
      
      const output = result.toString();
      const duration = Date.now() - startTime;
      
      // 解析结果
      const passedMatches = output.match(/✓/g) || [];
      const failedMatches = output.match(/✘|failed/gi) || [];
      const passedCount = passedMatches.length;
      const failedCount = failedMatches.length;
      
      this.results.modules[moduleName] = {
        status: '✅ 通过',
        file: testFile,
        passed: passedCount,
        failed: failedCount,
        duration: `${(duration / 1000).toFixed(1)}s`,
        output: output.substring(0, 1000) + '...'
      };
      
      this.results.summary.passedTests += passedCount;
      this.results.summary.failedTests += failedCount;
      this.results.summary.completedModules++;
      
      console.log(`📊 模块结果: ${passedCount} 通过, ${failedCount} 失败, 耗时 ${(duration / 1000).toFixed(1)}s`);
      console.log(`✅ 模块 ${moduleName} 执行完成`);
      
      return true;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.modules[moduleName] = {
        status: '❌ 失败',
        file: testFile,
        passed: 0,
        failed: 1,
        duration: `${(duration / 1000).toFixed(1)}s`,
        error: error.message.substring(0, 500)
      };
      
      this.results.summary.failedTests += 1;
      this.results.summary.completedModules++;
      
      console.log(`❌ 模块 ${moduleName} 执行失败: ${error.message.substring(0, 100)}`);
      return false;
    }
  }

  async runAllModules() {
    const testModules = [
      {
        name: '角色权限测试',
        file: 'tests/e2e/roles-permissions.e2e.spec.ts'
      },
      {
        name: '维修流程测试', 
        file: 'tests/e2e/repair-workflow.e2e.spec.ts'
      },
      {
        name: '配件店铺测试',
        file: 'tests/e2e/parts-shop-management.e2e.spec.ts'
      },
      {
        name: 'FCX生态测试',
        file: 'tests/e2e/fcx-ecosystem.e2e.spec.ts'
      },
      {
        name: 'WMS仓储测试',
        file: 'tests/e2e/wms-warehouse.e2e.spec.ts'
      },
      {
        name: '跨模块一致性测试',
        file: 'tests/e2e/cross-module-consistency.e2e.spec.ts'
      }
    ];

    this.results.summary.totalModules = testModules.length;
    const startTime = Date.now();
    
    console.log('🏁 FixCycle 端到端测试执行开始');
    console.log('='.repeat(60));
    
    for (let i = 0; i < testModules.length; i++) {
      const module = testModules[i];
      await this.executeModule(module.name, module.file);
      
      // 模块间短暂休息
      if (i < testModules.length - 1) {
        console.log('⏳ 模块间休息2秒...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.results.summary.totalTime = Date.now() - startTime;
    this.generateFinalReport();
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 端到端测试执行总结报告');
    console.log('='.repeat(60));
    
    console.log(`🕒 执行时间: ${(this.results.summary.totalTime / 1000).toFixed(1)}s`);
    console.log(`📦 测试模块: ${this.results.summary.totalModules}`);
    console.log(`✅ 完成模块: ${this.results.summary.completedModules}`);
    console.log(`🟢 通过测试: ${this.results.summary.passedTests}`);
    console.log(`🔴 失败测试: ${this.results.summary.failedTests}`);
    console.log(`📈 通过率: ${Math.round((this.results.summary.passedTests / (this.results.summary.passedTests + this.results.summary.failedTests || 1)) * 100)}%`);
    
    console.log('\n📋 各模块详细结果:');
    Object.entries(this.results.modules).forEach(([moduleName, result]) => {
      console.log(`${result.status} ${moduleName}`);
      console.log(`   文件: ${result.file}`);
      console.log(`   结果: ${result.passed} 通过, ${result.failed} 失败`);
      console.log(`   耗时: ${result.duration}`);
      if (result.error) {
        console.log(`   错误: ${result.error.substring(0, 100)}...`);
      }
    });
    
    // 生成JSON报告
    const reportPath = path.join(process.cwd(), 'test-results', 'robust-e2e-execution-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
    
    // 生成简洁的执行状态文件
    const statusPath = path.join(process.cwd(), 'E2E_EXECUTION_COMPLETED.md');
    const statusContent = `# E2E测试执行完成状态

## 📊 执行概览
- **执行时间**: ${(this.results.summary.totalTime / 1000).toFixed(1)}秒
- **测试模块**: ${this.results.summary.totalModules}个
- **完成模块**: ${this.results.summary.completedModules}个
- **通过测试**: ${this.results.summary.passedTests}个
- **失败测试**: ${this.results.summary.failedTests}个
- **通过率**: ${Math.round((this.results.summary.passedTests / (this.results.summary.passedTests + this.results.summary.failedTests || 1)) * 100)}%

## 🎯 执行结果
${Object.entries(this.results.modules).map(([name, result]) => 
  `- ${result.status} ${name}: ${result.passed}通过/${result.failed}失败 (${result.duration})`
).join('\n')}

## 📝 详细报告
完整执行详情请查看: \`test-results/robust-e2e-execution-report.json\`
`;
    
    fs.writeFileSync(statusPath, statusContent);
    console.log(`\n📝 执行状态报告已保存: ${statusPath}`);
  }
}

// 执行测试
if (require.main === module) {
  const runner = new RobustE2ETestRunner();
  runner.runAllModules().catch(error => {
    console.error('❌ 测试执行过程中发生严重错误:', error);
    process.exit(1);
  });
}

module.exports = RobustE2ETestRunner;