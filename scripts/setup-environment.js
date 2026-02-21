#!/usr/bin/env node

/**
 * 环境变量设置和校验脚本
 * 校验并生成 .env 本地模板
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FixCycle 环境变量设置工具\n');

// 检查是否存在 .env 文件
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// 1. 检查现有 .env 文件
console.log('📋 环境文件检查:');
let hasEnvFile = false;
let envVars = {};

if (fs.existsSync(envPath)) {
  console.log('  ✅ .env 文件已存在');
  hasEnvFile = true;
  
  // 读取现有环境变量
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value !== undefined) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
  
  console.log(`  📦 已配置 ${Object.keys(envVars).length} 个环境变量`);
} else {
  console.log('  ❌ .env 文件不存在');
}

// 2. 检查示例文件
console.log('\n📄 示例文件检查:');
if (fs.existsSync(envExamplePath)) {
  console.log('  ✅ .env.example 文件存在');
} else {
  console.log('  ❌ .env.example 文件不存在');
  process.exit(1);
}

// 3. 分析必需的环境变量
console.log('\n🔍 必需环境变量分析:');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'NEXT_PUBLIC_SITE_URL'
];

const missingVars = [];
const configuredVars = [];

requiredVars.forEach(varName => {
  if (hasEnvFile && envVars[varName]) {
    configuredVars.push(varName);
    console.log(`  ✅ ${varName}`);
  } else {
    missingVars.push(varName);
    console.log(`  ❌ ${varName} (缺失)`);
  }
});

// 4. 提供解决方案
console.log('\n🛠️ 环境设置状态:');
if (missingVars.length === 0) {
  console.log('  🎉 所有必需环境变量已配置！');
  console.log('  🚀 可以开始开发了');
} else {
  console.log(`  ⚠️  缺失 ${missingVars.length} 个必需环境变量`);
  console.log('\n📝 解决方案:');
  
  if (!hasEnvFile) {
    console.log('  1. 生成 .env 文件:');
    console.log('     cp .env.example .env');
    console.log('  2. 编辑 .env 文件，填入实际值');
  } else {
    console.log('  1. 编辑 .env 文件，补充以下变量:');
    missingVars.forEach((varName, index) => {
      console.log(`     ${index + 1}. ${varName}=your_value_here`);
    });
  }
  
  console.log('\n🔑 获取配置值的方法:');
  console.log('  - Supabase 配置: https://app.supabase.com/project/_/settings/api');
  console.log('  - 数据库 URL: 从 Supabase 项目设置中获取');
  console.log('  - 其他 API 密钥: 根据对应服务商文档配置');
}

// 5. 交互式设置向导（简化版）
console.log('\n🤖 快速设置向导:');
console.log('  运行以下命令快速复制模板:');
console.log('  npm run setup:env:copy');

// 6. 验证建议
console.log('\n✅ 环境校验完成！');
console.log('💡 建议后续运行: npm run check:health');

process.exit(missingVars.length === 0 ? 0 : 1);