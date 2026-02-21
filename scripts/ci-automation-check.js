#!/usr/bin/env node

/**
 * CI/CD 自动化检查脚本
 * 集成迁移验证、健康检查和种子数据验证
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('🤖 FixCycle CI/CD 自动化检查\n');
console.log('=====================================\n');

// 定义要执行的检查步骤
const CHECK_STEPS = [
  {
    name: '迁移脚本验证',
    command: 'npm',
    args: ['run', 'db:validate'],
    description: '验证迁移脚本语法和规范',
    required: true
  },
  {
    name: '数据库健康检查',
    script: 'db-health-check.js',
    description: '检查数据库连接和表结构',
    required: true
  },
  {
    name: '迁移状态检查',
    command: 'npm',
    args: ['run', 'db:status'],
    description: '检查当前迁移状态',
    required: false
  },
  {
    name: '种子数据验证',
    command: 'npm',
    args: ['run', 'seed', '--', '--minimal'],
    description: '验证种子数据初始化',
    required: false
  }
];

// 解析参数
const args = process.argv.slice(2);
const quickMode = args.includes('--quick');
const fullMode = args.includes('--full');

let selectedSteps = CHECK_STEPS;

if (quickMode) {
  selectedSteps = CHECK_STEPS.filter(step => step.required);
  console.log('⚡ 快速模式 - 只执行必要检查\n');
} else if (fullMode) {
  console.log('🔬 完整模式 - 执行所有检查\n');
} else {
  // 默认模式：执行前三个检查
  selectedSteps = CHECK_STEPS.slice(0, 3);
  console.log('🧪 标准模式 - 执行核心检查\n');
}

console.log(`🎯 计划执行 ${selectedSteps.length} 个检查步骤\n`);

let passedSteps = 0;
let totalSteps = selectedSteps.length;
const failedSteps = [];

// 执行检查步骤
selectedSteps.forEach((step, index) => {
  console.log(`[${index + 1}/${totalSteps}] ${step.name}`);
  console.log(`📝 ${step.description}`);
  console.log('----------------------------------------');
  
  try {
    let result;
    
    if (step.command) {
      // 执行 npm 命令
      result = spawnSync(step.command, step.args, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        timeout: 120000 // 2分钟超时
      });
    } else if (step.script) {
      // 执行脚本文件
      const scriptPath = path.join(__dirname, step.script);
      result = spawnSync('node', [scriptPath], {
        cwd: __dirname,
        stdio: 'inherit',
        timeout: 120000 // 2分钟超时
      });
    }
    
    if (result && result.status === 0) {
      console.log(`✅ ${step.name} 通过\n`);
      passedSteps++;
    } else {
      console.log(`❌ ${step.name} 失败\n`);
      failedSteps.push(step.name);
      
      if (step.required) {
        console.log('🛑 必要检查失败，停止执行');
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(`❌ ${step.name} 执行异常: ${error.message}\n`);
    failedSteps.push(step.name);
    
    if (step.required) {
      console.log('🛑 必要检查异常，停止执行');
      process.exit(1);
    }
  }
});

// 输出总结报告
console.log('=====================================');
console.log('🏆 CI/CD 自动化检查报告\n');

const passRate = Math.round((passedSteps / totalSteps) * 100);
console.log(`📊 通过率: ${passedSteps}/${totalSteps} (${passRate}%)`);

if (passRate === 100) {
  console.log('🎉 所有检查通过 - 可以安全部署');
} else if (passRate >= 80) {
  console.log('👍 大部分检查通过 - 可以考虑部署');
  console.log('🔧 建议修复失败的检查项');
} else if (passRate >= 60) {
  console.log('⚠️  检查通过率偏低 - 建议暂缓部署');
  console.log('🛑 优先修复关键问题');
} else {
  console.log('❌ 检查失败较多 - 不建议部署');
  console.log('🚨 需要全面修复问题');
}

// 显示失败详情
if (failedSteps.length > 0) {
  console.log('\n❌ 失败的检查项:');
  failedSteps.forEach(stepName => {
    console.log(`  - ${stepName}`);
  });
}

// 提供后续建议
console.log('\n📝 后续操作建议:');
if (passRate >= 80) {
  console.log('1. ✅ 准备部署到测试环境');
  console.log('2. 🚀 运行完整测试套件');
  console.log('3. 📊 监控部署后系统状态');
} else {
  console.log('1. 🔧 修复失败的检查项');
  console.log('2. 🔄 重新运行自动化检查');
  console.log('3. 📋 检查环境配置和依赖');
}

if (passRate === 100) {
  console.log('4. 🎯 考虑部署到生产环境');
  console.log('5. 📈 建立持续监控机制');
}

console.log('\n📋 CI/CD 集成建议:');
console.log('• 在 PR 提交时自动运行: node scripts/ci-automation-check.js --quick');
console.log('• 在部署前运行完整检查: node scripts/ci-automation-check.js --full');
console.log('• 结合 GitHub Actions 或其他 CI 工具使用');

console.log('\n✨ 自动化检查完成！');