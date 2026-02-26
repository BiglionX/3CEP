#!/usr/bin/env node

/**
 * 统一认证组件迁移一键执行脚本
 * 集成迁移、验证和报告生成的完整流程
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 统一认证组件迁移一键执行工具');
console.log('=======================================\n');

// 迁移阶段配置
const migrationStages = [
  {
    name: '环境检查',
    script: 'environment-check.js',
    description: '检查Node.js版本、依赖包等环境要求'
  },
  {
    name: '备份创建',
    script: 'create-backups.js',
    description: '为所有目标文件创建备份'
  },
  {
    name: '自动化迁移',
    script: 'automated-auth-migration.js',
    description: '执行统一认证组件的自动化迁移'
  },
  {
    name: '迁移验证',
    script: 'validate-migration.js',
    description: '验证迁移结果的正确性和完整性'
  },
  {
    name: '性能测试',
    script: 'performance-test.js',
    description: '测试迁移后组件的性能表现'
  },
  {
    name: '生成报告',
    script: 'generate-final-report.js',
    description: '生成最终的迁移报告和文档'
  }
];

// 工具函数
const utils = {
  // 执行脚本
  async executeScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`\n▶️  执行: ${scriptName}`);
      
      const scriptPath = path.join(__dirname, scriptName);
      
      // 检查脚本是否存在
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️  脚本不存在: ${scriptName}`);
        resolve({ success: false, error: 'Script not found' });
        return;
      }

      const child = spawn('node', [scriptPath, ...args], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${scriptName} 执行成功`);
          resolve({ success: true });
        } else {
          console.log(`❌ ${scriptName} 执行失败 (退出码: ${code})`);
          resolve({ success: false, exitCode: code });
        }
      });

      child.on('error', (error) => {
        console.log(`❌ ${scriptName} 执行出错: ${error.message}`);
        reject(error);
      });
    });
  },

  // 创建迁移状态文件
  createMigrationState(status, details = {}) {
    const state = {
      timestamp: new Date().toISOString(),
      status,
      details,
      pid: process.pid
    };
    
    const statePath = path.join(process.cwd(), '.migration-state.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  },

  // 读取迁移状态
  readMigrationState() {
    const statePath = path.join(process.cwd(), '.migration-state.json');
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
    return null;
  },

  // 清理临时文件
  cleanup() {
    const tempFiles = ['.migration-state.json'];
    tempFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 已清理临时文件: ${file}`);
      }
    });
  }
};

// 主迁移流程控制器
class MigrationController {
  constructor() {
    this.results = {
      stages: [],
      startTime: Date.now(),
      errors: []
    };
  }

  // 执行单个阶段
  async executeStage(stage) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 阶段 ${this.results.stages.length + 1}: ${stage.name}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`说明: ${stage.description}`);

    const startTime = Date.now();
    
    try {
      const result = await utils.executeScript(stage.script);
      const duration = Date.now() - startTime;
      
      const stageResult = {
        name: stage.name,
        script: stage.script,
        success: result.success,
        duration: `${(duration / 1000).toFixed(2)}s`,
        timestamp: new Date().toISOString()
      };

      if (!result.success) {
        stageResult.error = result.error || `Exit code: ${result.exitCode}`;
        this.results.errors.push(stageResult);
      }

      this.results.stages.push(stageResult);
      
      // 更新状态文件
      utils.createMigrationState('running', {
        currentStage: stage.name,
        completedStages: this.results.stages.length,
        totalStages: migrationStages.length,
        results: this.results
      });

      return result.success;

    } catch (error) {
      const duration = Date.now() - startTime;
      const stageResult = {
        name: stage.name,
        script: stage.script,
        success: false,
        duration: `${(duration / 1000).toFixed(2)}s`,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.stages.push(stageResult);
      this.results.errors.push(stageResult);
      
      utils.createMigrationState('error', {
        error: error.message,
        stage: stage.name,
        results: this.results
      });

      return false;
    }
  }

  // 执行完整迁移流程
  async executeFullMigration() {
    console.log('开始执行完整的迁移流程...\n');

    let successCount = 0;
    let hasCriticalFailure = false;

    // 依次执行每个阶段
    for (const stage of migrationStages) {
      const success = await this.executeStage(stage);
      
      if (success) {
        successCount++;
      } else {
        // 关键阶段失败则停止执行
        if (['自动化迁移', '迁移验证'].includes(stage.name)) {
          hasCriticalFailure = true;
          console.log(`\n🚨 关键阶段 "${stage.name}" 失败，停止执行后续阶段`);
          break;
        }
      }
    }

    // 生成最终报告
    await this.generateFinalReport(successCount, hasCriticalFailure);

    return {
      totalStages: migrationStages.length,
      successCount,
      hasCriticalFailure
    };
  }

  // 生成最终报告
  async generateFinalReport(successCount, hasCriticalFailure) {
    const totalTime = Date.now() - this.results.startTime;
    
    const finalReport = {
      migrationSummary: {
        totalStages: migrationStages.length,
        completedStages: this.results.stages.length,
        successCount,
        failureCount: this.results.stages.length - successCount,
        hasCriticalFailure,
        totalTime: `${(totalTime / 1000).toFixed(2)}s`,
        successRate: `${((successCount / migrationStages.length) * 100).toFixed(1)}%`
      },
      stageDetails: this.results.stages,
      errors: this.results.errors,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      }
    };

    // 保存报告
    const reportPath = path.join(process.cwd(), 'migration-complete-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    
    console.log(`\n📄 完整迁移报告已保存至: ${utils.getRelativePath(reportPath)}`);

    // 控制台输出摘要
    this.printFinalSummary(finalReport);
  }

  // 打印最终摘要
  printFinalSummary(report) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 统一认证组件迁移完成');
    console.log('='.repeat(60));

    const summary = report.migrationSummary;
    
    console.log(`\n📊 执行摘要:`);
    console.log(`   总阶段数: ${summary.totalStages}`);
    console.log(`   完成阶段: ${summary.completedStages}`);
    console.log(`   成功阶段: ${summary.successCount}`);
    console.log(`   失败阶段: ${summary.failureCount}`);
    console.log(`   执行时间: ${summary.totalTime}`);
    console.log(`   成功率: ${summary.successRate}`);

    if (summary.hasCriticalFailure) {
      console.log(`\n❌ 迁移过程中出现关键错误`);
      console.log(`   建议检查错误日志并手动修复问题`);
    } else if (summary.successCount === summary.totalStages) {
      console.log(`\n✅ 所有迁移阶段均已成功完成`);
      console.log(`   可以开始测试迁移后的功能`);
    } else {
      console.log(`\n⚠️  部分阶段执行失败`);
      console.log(`   请检查具体错误信息`);
    }

    if (report.errors.length > 0) {
      console.log(`\n🔧 错误详情:`);
      report.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.name}: ${error.error}`);
      });
    }

    console.log(`\n📋 下一步建议:`);
    if (!summary.hasCriticalFailure) {
      console.log(`   1. 运行 npm run dev 启动开发服务器`);
      console.log(`   2. 访问各登录页面进行功能测试`);
      console.log(`   3. 检查浏览器控制台是否有错误`);
      console.log(`   4. 验证管理员和普通用户登录`);
      console.log(`   5. 测试移动端适配效果`);
    } else {
      console.log(`   1. 根据错误信息排查问题`);
      console.log(`   2. 必要时恢复备份文件`);
      console.log(`   3. 重新执行迁移流程`);
    }

    console.log(`\n📖 相关文档:`);
    console.log(`   - 迁移计划: docs/guides/auth-component-migration-plan.md`);
    console.log(`   - 组件库: docs/guides/auth-component-library.md`);
    console.log(`   - 最佳实践: docs/guides/auth-best-practices.md`);
  }
}

// 交互式菜单
async function showInteractiveMenu() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('请选择执行模式:');
    console.log('1. 🚀 全自动迁移 (推荐)');
    console.log('2. 🔧 手动选择阶段');
    console.log('3. 📋 查看迁移状态');
    console.log('4. 🧹 清理临时文件');
    console.log('5. ❌ 退出');

    readline.question('\n请输入选项 (1-5): ', (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

// 手动阶段选择
async function manualStageSelection() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n可执行的迁移阶段:');
  migrationStages.forEach((stage, index) => {
    console.log(`${index + 1}. ${stage.name} - ${stage.description}`);
  });

  return new Promise((resolve) => {
    readline.question('\n请输入要执行的阶段编号 (多个用逗号分隔): ', (answer) => {
      readline.close();
      const selectedIndices = answer.split(',').map(n => parseInt(n.trim()) - 1);
      const selectedStages = selectedIndices
        .filter(i => i >= 0 && i < migrationStages.length)
        .map(i => migrationStages[i]);
      
      resolve(selectedStages);
    });
  });
}

// 主函数
async function main() {
  try {
    // 检查是否提供了命令行参数
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      // 命令行模式
      const mode = args[0];
      
      switch (mode) {
        case 'auto':
          console.log('执行全自动迁移模式...\n');
          const controller = new MigrationController();
          await controller.executeFullMigration();
          break;
          
        case 'status':
          const state = utils.readMigrationState();
          if (state) {
            console.log('当前迁移状态:');
            console.log(JSON.stringify(state, null, 2));
          } else {
            console.log('未找到迁移状态信息');
          }
          break;
          
        case 'cleanup':
          utils.cleanup();
          break;
          
        default:
          console.log('未知参数，使用 interactive 模式');
          await interactiveMode();
      }
    } else {
      // 交互式模式
      await interactiveMode();
    }

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 交互式模式
async function interactiveMode() {
  const choice = await showInteractiveMenu();
  
  switch (choice) {
    case '1':
      console.log('\n🚀 启动全自动迁移...\n');
      const controller = new MigrationController();
      await controller.executeFullMigration();
      break;
      
    case '2':
      const selectedStages = await manualStageSelection();
      if (selectedStages.length > 0) {
        console.log(`\n执行选定的 ${selectedStages.length} 个阶段...\n`);
        for (const stage of selectedStages) {
          const stageController = new MigrationController();
          await stageController.executeStage(stage);
        }
      } else {
        console.log('未选择任何阶段');
      }
      break;
      
    case '3':
      const state = utils.readMigrationState();
      if (state) {
        console.log('\n当前迁移状态:');
        console.log(`状态: ${state.status}`);
        console.log(`时间: ${state.timestamp}`);
        if (state.details) {
          console.log(`详情:`, JSON.stringify(state.details, null, 2));
        }
      } else {
        console.log('\n未找到迁移状态信息');
      }
      break;
      
    case '4':
      utils.cleanup();
      console.log('\n临时文件清理完成');
      break;
      
    case '5':
      console.log('\n👋 再见！');
      process.exit(0);
      
    default:
      console.log('\n❌ 无效选项，请重新选择');
      await interactiveMode();
  }
}

// 工具函数扩展
utils.getRelativePath = (absolutePath) => {
  return path.relative(process.cwd(), absolutePath);
};

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
  utils.createMigrationState('crashed', { error: error.message });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  utils.createMigrationState('crashed', { error: error.message });
  process.exit(1);
});

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { MigrationController, utils };