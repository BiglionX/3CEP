#!/usr/bin/env node

/**
 * 简化版部署检查脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 FixCycle 简化部署检查\n');

// 1. 检查环境配置
console.log('📋 环境配置检查:');
const envPath = path.join(__dirname, '..', '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allGood = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName) && 
        !envContent.includes(`${varName}=your_`) &&
        !envContent.includes(`${varName}=YOUR_`)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} (需要配置)`);
      allGood = false;
    }
  });
  
  console.log(`  环境配置状态: ${allGood ? '✅ 完整' : '❌ 需要完善'}`);
} catch (error) {
  console.log('  ❌ 无法读取环境文件');
}

// 2. 检查构建状态
console.log('\n🏗️ 构建状态检查:');
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  console.log('  ✅ 构建目录存在');
  
  // 检查关键构建文件
  const requiredFiles = ['BUILD_ID', 'routes-manifest.json'];
  requiredFiles.forEach(file => {
    const filePath = path.join(nextDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ⚠️ ${file} (缺失)`);
    }
  });
} else {
  console.log('  ❌ 构建目录不存在，请先执行 npm run build');
}

// 3. 检查配置文件
console.log('\n⚙️ 配置文件检查:');
const configFiles = [
  'next.config.js',
  'tsconfig.json', 
  'package.json',
  'vercel.json'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}`);
  }
});

// 4. 检查生产配置
console.log('\n🔧 生产配置检查:');
const prodEnvPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(prodEnvPath)) {
  console.log('  ✅ 生产环境配置文件存在');
  const prodContent = fs.readFileSync(prodEnvPath, 'utf8');
  const placeholderCount = (prodContent.match(/your_|YOUR_/g) || []).length;
  console.log(`  ⚠️ 发现 ${placeholderCount} 个占位符需要替换`);
} else {
  console.log('  ❌ 生产环境配置文件不存在');
}

// 5. 检查部署清单
console.log('\n📋 部署清单检查:');
const checklistPath = path.join(__dirname, '..', 'DEPLOYMENT_CHECKLIST.md');
if (fs.existsSync(checklistPath)) {
  console.log('  ✅ 部署检查清单已生成');
} else {
  console.log('  ❌ 部署检查清单缺失');
}

console.log('\n🎯 部署准备状态评估:');
console.log('  建议在部署前完成以下事项:');
console.log('  1. 更新 .env.production 中的占位符值');
console.log('  2. 获取真实的 Supabase Service Role Key');
console.log('  3. 配置域名和 SSL 证书');
console.log('  4. 在 Vercel 上创建项目并配置环境变量');
console.log('  5. 执行完整的端到端测试');

console.log('\n✅ 简化检查完成！');