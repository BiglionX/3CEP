#!/usr/bin/env node

/**
 * 第三方服务密钥配置验证脚本
 * 用于验证所有环境变量是否正确配置
 */

const fs = require('fs');
const path = require('path');

// 需要验证的关键环境变量
const requiredEnvVars = [
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  
  // Google Custom Search
  'GOOGLE_CUSTOM_SEARCH_API_KEY',
  'GOOGLE_CUSTOM_SEARCH_ENGINE_ID',
  
  // DeepSeek
  'DEEPSEEK_API_KEY',
  
  // 电商联盟
  'TAOBAO_UNION_APP_KEY',
  'TAOBAO_UNION_APP_SECRET',
  'JD_UNION_ACCESS_KEY',
  'JD_UNION_SECRET_KEY',
  
  // Stripe
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

// 可选的环境变量
const optionalEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'STRIPE_WEBHOOK_SECRET',
  'TAOBAO_UNION_PID',
  'JD_UNION_SITE_ID'
];

async function checkEnvironmentVariables() {
  console.log('🔍 开始验证第三方服务密钥配置...\n');
  
  let missingRequired = [];
  let missingOptional = [];
  let configuredVars = [];
  
  // 检查每个必需的环境变量
  console.log('📋 必需的环境变量检查:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.includes('your') || value.includes('替换')) {
      missingRequired.push(envVar);
      console.log(`❌ ${envVar}: 未配置或使用占位符`);
    } else {
      configuredVars.push(envVar);
      console.log(`✅ ${envVar}: 已配置`);
    }
  });
  
  console.log('\n📋 可选的环境变量检查:');
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.includes('your') || value.includes('替换')) {
      missingOptional.push(envVar);
      console.log(`⚠️  ${envVar}: 未配置（可选）`);
    } else {
      configuredVars.push(envVar);
      console.log(`✅ ${envVar}: 已配置`);
    }
  });
  
  // 生成报告
  console.log('\n📊 配置状态报告:');
  console.log(`✅ 已配置: ${configuredVars.length} 项`);
  console.log(`❌ 缺失必需项: ${missingRequired.length} 项`);
  console.log(`⚠️  缺失可选项: ${missingOptional.length} 项`);
  
  if (missingRequired.length > 0) {
    console.log('\n🚨 需要立即处理的缺失项:');
    missingRequired.forEach(envVar => {
      console.log(`   • ${envVar}`);
    });
    
    console.log('\n💡 解决建议:');
    console.log('1. 按照部署指南获取相应服务的API密钥');
    console.log('2. 通过Vercel控制台添加环境变量');
    console.log('3. 重新运行此验证脚本确认');
    
    process.exit(1);
  } else {
    console.log('\n🎉 所有必需的第三方服务密钥均已正确配置！');
    
    if (missingOptional.length > 0) {
      console.log('\nℹ️  以下可选功能可能受限:');
      missingOptional.forEach(envVar => {
        console.log(`   • ${envVar}`);
      });
    }
    
    console.log('\n🚀 准备就绪，可以进行生产部署！');
    process.exit(0);
  }
}

// 运行检查
checkEnvironmentVariables().catch(error => {
  console.error('❌ 验证过程中发生错误:', error);
  process.exit(1);
});