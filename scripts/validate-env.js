#!/usr/bin/env node

/**
 * 环境变量验证和修复脚本
 */

require('dotenv').config();

function validateEnvironment() {
  console.log('🔍 环境变量验证');
  console.log('================');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allValid = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const isValid = value && value !== 'YOUR_ACTUAL_SERVICE_KEY_HERE' && value.length > 10;
    
    console.log(`${varName}: ${isValid ? '✅' : '❌'} ${value ? value.substring(0, 30) + '...' : '未设置'}`);
    
    if (!isValid) {
      allValid = false;
    }
  });
  
  console.log('\n📊 验证结果:', allValid ? '通过' : '失败');
  
  if (!allValid) {
    console.log('\n🔧 正在修复环境配置...');
    fixEnvironment();
  }
  
  return allValid;
}

function fixEnvironment() {
  const fs = require('fs');
  const path = require('path');
  
  // 检查系统环境变量
  const systemServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (systemServiceKey && systemServiceKey !== 'YOUR_ACTUAL_SERVICE_KEY_HERE') {
    console.log('✅ 找到系统环境变量中的有效服务密钥');
    
    // 更新.env文件
    const envFiles = ['.env', '.env.local'];
    
    envFiles.forEach(envFile => {
      const filePath = path.join(__dirname, '..', envFile);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 替换占位符
        const updatedContent = content.replace(
          /SUPABASE_SERVICE_ROLE_KEY=.*YOUR_ACTUAL_SERVICE_KEY_HERE.*/,
          `SUPABASE_SERVICE_ROLE_KEY=${systemServiceKey}`
        );
        
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(`✅ 已更新 ${envFile}`);
        }
      }
    });
  } else {
    console.log('❌ 未找到有效的系统环境变量');
  }
}

// 执行验证
const isValid = validateEnvironment();

if (isValid) {
  console.log('\n🚀 启动服务...');
  const { spawn } = require('child_process');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('error', (error) => {
    console.error('启动失败:', error);
  });
} else {
  console.log('\n❌ 环境配置存在问题，请检查后重试');
  process.exit(1);
}