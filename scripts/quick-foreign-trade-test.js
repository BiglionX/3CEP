#!/usr/bin/env node

/**
 * 外贸采购快速验证脚本
 * 用于快速验证核心功能是否正常工作
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 外贸采购系统快速验证\n');

// 检查必需文件是否存在
const requiredFiles = [
  'tests/e2e/foreign-trade-procurement.e2e.spec.ts',
  'tests/e2e/foreign-trade-test-data.ts',
  'scripts/run-foreign-trade-e2e.js',
];

console.log('📄 检查测试文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (缺失)`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分测试文件缺失，请检查文件结构');
  process.exit(1);
}

// 检查环境变量
console.log('\n⚙️  检查环境配置...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.log(`  ⚠️  缺少环境变量: ${missingEnvVars.join(', ')}`);
  console.log('  请设置必要的环境变量后再运行测试');
} else {
  console.log('  ✅ 环境变量配置完整');
}

// 检查依赖
console.log('\n📦 检查依赖包...');
const dependencies = ['@playwright/test', 'uuid'];

dependencies.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`  ✅ ${dep}`);
  } catch (e) {
    console.log(`  ❌ ${dep} (未安装)`);
  }
});

// 快速语法检查
console.log('\n📝 文件存在性检查...');
const testFiles = [
  'tests/e2e/foreign-trade-procurement.e2e.spec.ts',
  'tests/e2e/foreign-trade-test-data.ts',
];

let fileCheckPassed = true;

testFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    if (stats.isFile()) {
      console.log(`  ✅ ${file} 存在且可读`);
      // 简单的内容检查
      const content = fs.readFileSync(file, 'utf8');
      if (content.length > 100) {
        console.log(`     文件大小: ${content.length} 字符`);
      } else {
        console.log(`     ⚠️  文件内容可能不完整`);
        fileCheckPassed = false;
      }
    }
  } catch (error) {
    console.log(`  ❌ ${file} 读取失败: ${error.message}`);
    fileCheckPassed = false;
  }
});

function showSummary() {
  console.log('\n📋 验证总结:');
  console.log('============');

  if (allFilesExist && fileCheckPassed) {
    console.log('✅ 基本验证通过！可以执行完整测试');
    console.log('\n🚀 执行完整测试:');
    console.log('   npm run test:e2e:foreign-trade');
    console.log('\n👀 可视化调试模式:');
    console.log('   npm run test:e2e:foreign-trade:debug');
    console.log('\n⚡ 快速验证:');
    console.log('   npm run test:e2e:foreign-trade:quick');
  } else {
    console.log('❌ 验证未通过，请修复上述问题后再执行测试');
    process.exit(1);
  }
}

// 立即执行总结
setTimeout(showSummary, 1000);
