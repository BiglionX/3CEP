#!/usr/bin/env node

/**
 * 标准化数据种子脚本
 * 统一调用各种 seed-* 脚本
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('🌱 FixCycle 数据种子初始化\n');
console.log('=====================================\n');

// 定义要运行的种子脚本（按依赖顺序）
const seedScripts = [
  {
    name: '初始数据播种',
    script: 'seed-initial-data.js',
    description: '基础用户、权限、配置数据',
    required: true
  },
  {
    name: '增强数据播种',
    script: 'seed-data-enhanced.js',
    description: '扩展的测试数据和示例数据',
    required: false
  },
  {
    name: '全球店铺数据',
    script: 'seed-global-shops.js',
    description: '全球维修店和供应商数据',
    required: false
  },
  {
    name: '扩展全球店铺',
    script: 'seed-global-shops-expanded.js',
    description: '更多全球店铺详细信息',
    required: false
  },
  {
    name: 'API数据播种',
    script: 'seed-data-api.js',
    description: '通过API接口播种数据',
    required: false
  }
];

// 检查参数来决定运行哪些脚本
const args = process.argv.slice(2);
let selectedScripts = seedScripts;

if (args.includes('--minimal')) {
  // 只运行必需的脚本
  selectedScripts = seedScripts.filter(script => script.required);
  console.log('📦 运行最小数据集播种\n');
} else if (args.includes('--full')) {
  // 运行所有脚本
  console.log('📦 运行完整数据集播种\n');
} else {
  // 默认运行前三个脚本
  selectedScripts = seedScripts.slice(0, 3);
  console.log('📦 运行标准数据集播种\n');
}

console.log(`🎯 计划执行 ${selectedScripts.length} 个播种脚本\n`);

let successfulSeeds = 0;
let totalSeeds = selectedScripts.length;

// 运行每个种子脚本
selectedScripts.forEach((seed, index) => {
  console.log(`[${index + 1}/${totalSeeds}] ${seed.name}`);
  console.log(`📝 ${seed.description}`);
  console.log('----------------------------------------');
  
  try {
    const scriptPath = path.join(__dirname, seed.script);
    const result = spawnSync('node', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 120000 // 2分钟超时
    });
    
    if (result.status === 0) {
      console.log(`✅ ${seed.name} 完成\n`);
      successfulSeeds++;
    } else {
      console.log(`❌ ${seed.name} 失败\n`);
      if (seed.required) {
        console.log('🛑 必需的种子脚本失败，停止执行');
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(`❌ ${seed.name} 执行出错: ${error.message}\n`);
    if (seed.required) {
      console.log('🛑 必需的种子脚本出错，停止执行');
      process.exit(1);
    }
  }
});

// 输出总体结果
console.log('=====================================');
console.log('🏆 数据播种汇总报告\n');

const successRate = Math.round((successfulSeeds / totalSeeds) * 100);
console.log(`📊 播种成功率: ${successfulSeeds}/${totalSeeds} (${successRate}%)`);

if (successRate === 100) {
  console.log('🎉 所有数据播种成功完成！');
  console.log('🚀 数据库已准备好进行开发和测试');
} else if (successRate >= 75) {
  console.log('👍 大部分数据播种成功');
  console.log('🔧 可以继续开发，但建议检查失败的脚本');
} else {
  console.log('⚠️  数据播种存在问题');
  console.log('🛑 建议修复问题后重新运行播种');
}

// 提供验证建议
console.log('\n📝 后续建议:');
console.log('1. 运行 npm run verify:database 验证数据');
console.log('2. 运行 npm run prepare:test-data 准备测试数据');
if (successRate === 100) {
  console.log('3. 运行 npm run test:all 进行完整测试');
  console.log('4. 启动开发服务器: npm run dev');
}

console.log('\n✨ 数据种子初始化完成！');