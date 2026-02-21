#!/usr/bin/env node

// 环境变量配置检查脚本
console.log('⚙️  环境变量配置检查...\n');

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'QR_CODE_BASE_URL'
];

console.log('📋 必需环境变量:');
let allRequiredPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: 已配置`);
  } else {
    console.log(`   ❌ ${envVar}: 未配置`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 可选环境变量:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: ${value}`);
  } else {
    console.log(`   ⚠️  ${envVar}: 未配置（使用默认值）`);
  }
});

if (!allRequiredPresent) {
  console.log('\n❌ 缺少必需的环境变量配置');
  console.log('\n🔧 请在 .env.local 文件中添加以下配置:');
  console.log('');
  console.log('# Supabase 配置');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('# 可选配置');
  console.log('QR_CODE_BASE_URL=https://fx.cn');
  console.log('');
  console.log('💡 获取这些值的方法:');
  console.log('1. 登录 Supabase 控制台');
  console.log('2. 选择您的项目');
  console.log('3. 在 Project Settings -> API 中找到 URL 和密钥');
  console.log('4. Service Role Key 用于服务端操作');
} else {
  console.log('\n✅ 所有必需环境变量已配置');
  console.log('🎉 环境配置检查通过！');
}

console.log('\n📊 当前进程环境变量状态:');
console.log(`   Node.js 版本: ${process.version}`);
console.log(`   工作目录: ${process.cwd()}`);