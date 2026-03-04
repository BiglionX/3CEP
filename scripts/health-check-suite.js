#!/usr/bin/env node

/**
 * 统一健康检查套件
 * 汇总 quick-health-check.js、system-validation.js 和各种 check-* 脚本
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('🏥 FixCycle 统一健康检查套件\n');
console.log('=====================================\n');

// 定义要运行的检查脚本
const checkScripts = [
  {
    name: '快速健康检查',
    script: 'quick-health-check.js',
    description: '检查项目核心组件和服务状态',
  },
  {
    name: '系统验证',
    script: 'system-validation.js',
    description: '验证核心功能模块是否正常工作',
  },
  {
    name: '环境检查',
    script: 'check-environment.js',
    description: '检查开发环境配置',
  },
  {
    name: '数据库连接检查',
    script: 'verify-database.js',
    description: '验证数据库连接状态',
  },
  {
    name: 'Redis 配置检查',
    script: 'check-redis-setup.js',
    description: '检查 Redis 服务配置',
  },
  {
    name: '实时系统检查',
    script: 'check-realtime-setup.js',
    description: '检查实时处理系统配置',
  },
  {
    name: '监控系统检查',
    script: 'check-monitoring-setup.js',
    description: '检查监控系统配置',
  },
];

let passedChecks = 0;
const totalChecks = checkScripts.length;

// 运行每个检查脚本
checkScripts.forEach((check, index) => {
  console.log(`[${index + 1}/${totalChecks}] ${check.name}`);
  console.log(`📝 ${check.description}`);
  console.log('----------------------------------------');

  try {
    const scriptPath = path.join(__dirname, check.script);
    const result = spawnSync('node', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 30000, // 30秒超时
    });

    if (result.status === 0) {
      console.log(`✅ ${check.name} 通过\n`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.name} 失败\n`);
    }
  } catch (error) {
    console.log(`❌ ${check.name} 执行出错: ${error.message}\n`);
  }
});

// 输出总体结果
console.log('=====================================');
console.log('🏆 健康检查汇总报告\n');

const completionRate = Math.round((passedChecks / totalChecks) * 100);
console.log(
  `📊 检查完成度: ${passedChecks}/${totalChecks} (${completionRate}%)`
);

if (completionRate >= 90) {
  console.log('🎉 项目状态: 优秀 - 准备就绪');
  console.log('🚀 可以开始开发或部署');
} else if (completionRate >= 75) {
  console.log('👍 项目状态: 良好 - 基本完备');
  console.log('🔧 建议修复少量问题后继续');
} else if (completionRate >= 60) {
  console.log('👌 项目状态: 合格 - 需要完善');
  console.log('⚠️  建议先解决关键问题');
} else {
  console.log('🔧 项目状态: 需要大量修复');
  console.log('🛑 建议暂停开发，先修复基础问题');
}

// 提供建议
console.log('\n📝 后续建议:');
if (passedChecks < totalChecks) {
  console.log('1. 根据上述检查结果修复相关问题');
  console.log('2. 重新运行健康检查验证修复效果');
}

if (completionRate >= 75) {
  console.log('3. 运行 npm run test:all 进行完整测试');
  console.log('4. 准备部署到开发或测试环境');
}

console.log('\n✨ 健康检查套件执行完成！');
