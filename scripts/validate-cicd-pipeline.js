#!/usr/bin/env node

/**
 * CI/CD 流水线完整性验证脚本
 * 验证所有配置是否正确设置
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('✅ FixCycle CI/CD 流水线验证\n');
console.log('=====================================\n');

// 验证项配置
const VALIDATION_ITEMS = [
  {
    name: '分支保护规则',
    check: () => {
      const rulesPath = path.join(__dirname, '..', '.github', 'branch-protection-rules.json');
      return fs.existsSync(rulesPath);
    },
    description: '检查分支保护规则配置文件'
  },
  {
    name: 'CI/CD 流水线配置',
    check: () => {
      const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'enhanced-ci-cd.yml');
      return fs.existsSync(workflowPath);
    },
    description: '检查增强版 CI/CD 流水线配置'
  },
  {
    name: '测试套件完整性',
    check: () => {
      const testRunnerPath = path.join(__dirname, '..', 'tests', 'run-all-tests.js');
      return fs.existsSync(testRunnerPath);
    },
    description: '检查统一测试套件执行器'
  },
  {
    name: '数据库迁移校验工具',
    check: () => {
      const validatorPath = path.join(__dirname, '..', 'scripts', 'db-migration-validate.js');
      return fs.existsSync(validatorPath);
    },
    description: '检查数据库迁移语法校验工具'
  },
  {
    name: 'n8n 冒烟测试',
    check: () => {
      const smokeTestPath = path.join(__dirname, '..', 'tests', 'n8n', 'n8n-smoke-test.js');
      return fs.existsSync(smokeTestPath);
    },
    description: '检查 n8n 关键流程冒烟测试'
  },
  {
    name: '开发环境配置',
    check: () => {
      const devComposePath = path.join(__dirname, '..', 'docker-compose.dev.yml');
      return fs.existsSync(devComposePath);
    },
    description: '检查开发环境 Docker Compose 配置'
  },
  {
    name: '预发布环境配置',
    check: () => {
      const stageComposePath = path.join(__dirname, '..', 'docker-compose.stage.yml');
      return fs.existsSync(stageComposePath);
    },
    description: '检查预发布环境 Docker Compose 配置'
  },
  {
    name: '回滚脚本',
    check: () => {
      const rollbackPaths = [
        path.join(__dirname, '..', 'scripts', 'rollback-deployment.js'),
        path.join(__dirname, '..', 'scripts', 'db-rollback.js')
      ];
      return rollbackPaths.every(p => fs.existsSync(p));
    },
    description: '检查部署回滚相关脚本'
  },
  {
    name: 'npm 脚本配置',
    check: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
        const requiredScripts = [
          'test:all',
          'db:validate',
          'db:check-syntax'
        ];
        return requiredScripts.every(script => packageJson.scripts && packageJson.scripts[script]);
      } catch (error) {
        return false;
      }
    },
    description: '检查必需的 npm 脚本配置'
  }
];

function runValidation() {
  console.log('🔍 开始验证 CI/CD 流水线配置...\n');
  
  let passedChecks = 0;
  let failedChecks = 0;
  const results = [];
  
  for (const item of VALIDATION_ITEMS) {
    console.log(`🔍 ${item.name}`);
    console.log(`   ${item.description}`);
    
    try {
      const result = item.check();
      if (result) {
        console.log('   ✅ 通过\n');
        passedChecks++;
        results.push({ name: item.name, status: 'PASS' });
      } else {
        console.log('   ❌ 失败\n');
        failedChecks++;
        results.push({ name: item.name, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`   💥 错误: ${error.message}\n`);
      failedChecks++;
      results.push({ name: item.name, status: 'ERROR', error: error.message });
    }
  }
  
  // 功能测试验证
  console.log('🧪 运行功能测试...\n');
  
  const functionalTests = [
    {
      name: '数据库迁移校验测试',
      command: 'node',
      args: ['scripts/db-migration-validate.js', '--help']
    },
    {
      name: 'n8n 冒烟测试帮助',
      command: 'node',
      args: ['tests/n8n/n8n-smoke-test.js', '--help']
    },
    {
      name: '回滚脚本帮助',
      command: 'node',
      args: ['scripts/rollback-deployment.js', '--help']
    }
  ];
  
  for (const test of functionalTests) {
    console.log(`🧪 ${test.name}`);
    try {
      const result = spawnSync(test.command, test.args, {
        cwd: process.cwd(),
        timeout: 5000
      });
      
      if (result.status === 0) {
        console.log('   ✅ 功能正常\n');
        passedChecks++;
        results.push({ name: `${test.name} (功能)`, status: 'PASS' });
      } else {
        console.log('   ❌ 功能异常\n');
        failedChecks++;
        results.push({ name: `${test.name} (功能)`, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`   💥 测试失败: ${error.message}\n`);
      failedChecks++;
      results.push({ name: `${test.name} (功能)`, status: 'ERROR', error: error.message });
    }
  }
  
  // 生成验证报告
  console.log('=====================================');
  console.log('📋 CI/CD 流水线验证报告');
  console.log('=====================================\n');
  
  console.log('📊 验证结果统计:');
  console.log(`   通过: ${passedChecks}`);
  console.log(`   失败: ${failedChecks}`);
  console.log(`   总计: ${passedChecks + failedChecks}`);
  console.log(`   通过率: ${Math.round((passedChecks / (passedChecks + failedChecks)) * 100)}%\n`);
  
  console.log('📋 详细验证结果:');
  results.forEach(result => {
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '💥'
    }[result.status] || '❓';
    
    console.log(`  ${statusIcon} ${result.name} [${result.status}]`);
    if (result.error) {
      console.log(`     错误详情: ${result.error}`);
    }
  });
  
  // 配置建议
  console.log('\n📝 配置建议:');
  if (failedChecks === 0) {
    console.log('✅ 所有验证项通过！CI/CD 流水线配置完整');
    console.log('🚀 可以开始使用增强版 CI/CD 流水线');
    console.log('\n使用方法:');
    console.log('1. 在 GitHub 仓库设置中启用分支保护规则');
    console.log('2. 配置必要的环境变量和 Secrets');
    console.log('3. 推送代码到受保护分支触发流水线');
    console.log('4. 通过 Pull Request 进行代码审查和自动化测试');
  } else {
    console.log('⚠️  发现配置问题，请按以下步骤修复:');
    const failedItems = results.filter(r => r.status !== 'PASS');
    failedItems.forEach((item, index) => {
      console.log(`${index + 1}. 修复: ${item.name}`);
    });
    console.log('\n💡 提示: 运行此脚本可以随时验证配置状态');
  }
  
  console.log('\n✨ CI/CD 流水线验证完成！');
  
  return failedChecks === 0;
}

// 主函数
function main() {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
CI/CD 流水线验证工具

用法: node scripts/validate-cicd-pipeline.js [选项]

选项:
  --help, -h    显示帮助信息
  --verbose     详细输出模式

此工具会验证以下配置:
  ✓ 分支保护规则
  ✓ CI/CD 流水线配置
  ✓ 测试套件完整性
  ✓ 数据库迁移校验工具
  ✓ n8n 冒烟测试
  ✓ 环境配置文件
  ✓ 回滚脚本
  ✓ npm 脚本配置

示例:
  node scripts/validate-cicd-pipeline.js
  `);
  process.exit(0);
}

main();