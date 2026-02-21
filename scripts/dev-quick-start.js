#!/usr/bin/env node

/**
 * 最小本地起服务脚本
 * 整合环境校验、服务启动和自测流程
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FixCycle 最小本地启动流程\n');

// 1. 环境变量校验
console.log('🔍 环境配置检查...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('  ⚠️  .env 文件不存在，正在从 .env.example 复制...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('  ✅ .env 文件已创建，请根据需要修改配置');
  } catch (error) {
    console.error('  ❌ 复制 .env.example 失败:', error.message);
    process.exit(1);
  }
} else {
  console.log('  ✅ .env 文件已存在');
}

// 2. 加载环境变量
try {
  require('dotenv').config({ path: envPath });
} catch (error) {
  console.log('  ⚠️  dotenv模块未安装，跳过环境变量加载');
}

// 3. Docker Compose 服务启动
console.log('\n🐳 启动最小化服务...');
const dockerComposeFile = 'docker-compose.n8n-minimal.yml';

try {
  // 检查 Docker 是否运行
  execSync('docker info', { stdio: 'ignore' });
  console.log('  ✅ Docker 环境正常');
  
  // 启动服务
  console.log('  🚀 启动 n8n 最小化服务...');
  const dockerUp = spawn('docker-compose', ['-f', dockerComposeFile, 'up', '-d'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  dockerUp.on('close', (code) => {
    if (code === 0) {
      console.log('  ✅ Docker 服务启动成功');
      runHealthCheck();
    } else {
      console.error('  ❌ Docker 服务启动失败');
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('  ❌ Docker 环境检查失败:', error.message);
  console.log('  💡 请确保 Docker 已安装并正在运行');
  process.exit(1);
}

// 4. 运行健康检查
function runHealthCheck() {
  console.log('\n🏥 执行健康自检...');
  
  setTimeout(() => {
    const healthCheck = spawn('node', ['scripts/quick-health-check.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    healthCheck.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 最小本地服务启动完成！');
        console.log('\n📝 下一步操作:');
        console.log('  1. 访问 n8n 界面: http://localhost:5678');
        console.log('  2. 运行完整测试: npm run test:all');
        console.log('  3. 启动开发服务器: npm run dev');
      } else {
        console.error('\n❌ 健康检查失败，请检查服务状态');
      }
    });
  }, 5000); // 等待服务完全启动
}