#!/usr/bin/env node

/**
 * 验证测试演示页面修复效果
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FixCycle 测试页面修复验证\n');

// 检查关键文件是否存在
const requiredFiles = [
  'src/app/components/TestComponentDemo.tsx',
  'src/app/page.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/badge.tsx',
];

console.log('📋 文件完整性检查:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n🌐 服务状态检查:');
try {
  // 尝试访问首页
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET',
    timeout: 5000,
  };

  const req = http.request(options, res => {
    console.log(`  ✅ 服务响应: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('  🎯 页面可访问性: 正常');
    } else {
      console.log(`  ⚠️  页面状态码: ${res.statusCode}`);
    }
  });

  req.on('error', err => {
    console.log(`  ❌ 服务连接失败: ${err.message}`);
    console.log('  💡 请确保开发服务器正在运行 (npm run dev)');
  });

  req.on('timeout', () => {
    console.log('  ⏱️  请求超时');
    req.destroy();
  });

  req.end();
} catch (error) {
  console.log(`  ❌ 检查失败: ${error.message}`);
}

// 验证React组件结构
console.log('\n⚛️  React组件验证:');
const pageContent = fs.readFileSync(
  path.join(__dirname, '..', 'src/app/page.tsx'),
  'utf8'
);

const checks = [
  { pattern: /'use client'/, desc: '客户端组件声明' },
  { pattern: /dynamic from 'next\/dynamic'/, desc: '动态导入支持' },
  { pattern: /TestComponentDemo/, desc: '测试组件引用' },
  { pattern: /Card.*CardHeader.*CardTitle/, desc: 'UI组件结构' },
  { pattern: /统计卡片|边界测试执行平台/, desc: '中文内容显示' },
];

checks.forEach(check => {
  const found = check.pattern.test(pageContent);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} ${check.desc}`);
});

console.log('\n🚀 修复验证完成!');
console.log('\n💡 使用说明:');
console.log('   1. 确保开发服务器运行中 (npm run dev)');
console.log('   2. 访问 http://localhost:3001');
console.log('   3. 点击"运行所有测试"按钮查看效果');
console.log('   4. 观察测试执行过程和结果显示');

console.log('\n🎯 预期效果:');
console.log('   • 页面显示完整的测试控制面板');
console.log('   • 可以运行边界测试用例');
console.log('   • 实时显示测试进度和结果');
console.log('   • 展示测试统计数据和通过率');
