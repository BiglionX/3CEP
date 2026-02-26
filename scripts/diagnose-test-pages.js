#!/usr/bin/env node

/**
 * 测试页面访问诊断脚本
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 测试页面访问诊断\n');

// 诊断配置
const diagnostics = {
  baseUrl: 'http://localhost:3002',
  testPaths: [
    '/',
    '/profile',
    '/profile/dashboard', 
    '/unified-center-test'
  ],
  requiredFiles: [
    'src/app/unified-center-test/page.tsx',
    'src/app/profile/dashboard/page.tsx',
    'src/app/profile/page.tsx'
  ]
};

// 1. 文件存在性检查
console.log('1️⃣ 必需文件检查');
diagnostics.requiredFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${filePath}`);
});

// 2. HTTP连接测试
console.log('\n2️⃣ HTTP连接测试');

function testHttpConnection(path) {
  return new Promise((resolve) => {
    const url = `${diagnostics.baseUrl}${path}`;
    const req = http.get(url, (res) => {
      resolve({
        path,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    }).on('error', (err) => {
      resolve({
        path,
        error: err.message,
        success: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        error: '请求超时',
        success: false
      });
    });
  });
}

async function runHttpTests() {
  console.log('   测试连接到:', diagnostics.baseUrl);
  
  for (const testPath of diagnostics.testPaths) {
    try {
      const result = await testHttpConnection(testPath);
      const status = result.success ? '✅' : '❌';
      if (result.success) {
        console.log(`   ${status} ${testPath} - ${result.statusCode} ${result.statusMessage}`);
      } else {
        console.log(`   ${status} ${testPath} - ${result.error || '连接失败'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${testPath} - 测试异常: ${error.message}`);
    }
  }
}

// 3. 服务器进程检查
console.log('\n3️⃣ 服务器进程检查');

function checkServerProcess() {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('tasklist /fi "imagename eq node.exe"', (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
        return;
      }
      
      const lines = stdout.split('\n');
      const nodeProcesses = lines.filter(line => 
        line.includes('node.exe') && line.includes('next')
      );
      
      resolve({
        success: nodeProcesses.length > 0,
        processes: nodeProcesses.length,
        details: nodeProcesses
      });
    });
  });
}

async function runProcessCheck() {
  try {
    const result = await checkServerProcess();
    if (result.success) {
      console.log(`   ✅ 检测到 ${result.processes} 个Node.js进程正在运行Next.js`);
      result.details.forEach((process, index) => {
        console.log(`      ${index + 1}. ${process.trim()}`);
      });
    } else {
      console.log('   ❌ 未检测到运行中的Next.js服务器进程');
    }
  } catch (error) {
    console.log(`   ❌ 进程检查失败: ${error.message}`);
  }
}

// 4. 端口监听检查
console.log('\n4️⃣ 端口监听检查');

function checkPortListening() {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :3002', (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
        return;
      }
      
      const listening = stdout.includes('LISTENING');
      resolve({
        success: listening,
        output: stdout
      });
    });
  });
}

async function runPortCheck() {
  try {
    const result = await checkPortListening();
    if (result.success) {
      console.log('   ✅ 端口3002正在监听');
      // 显示监听详情
      const lines = result.output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('LISTENING')) {
          console.log(`      ${line.trim()}`);
        }
      });
    } else {
      console.log('   ❌ 端口3002未在监听状态');
    }
  } catch (error) {
    console.log(`   ❌ 端口检查失败: ${error.message}`);
  }
}

// 5. 综合诊断报告
async function runFullDiagnostics() {
  await runHttpTests();
  await runProcessCheck();
  await runPortCheck();
  
  console.log('\n📋 诊断总结');
  console.log('='.repeat(30));
  console.log('如果HTTP测试失败但端口监听正常，可能是：');
  console.log('1. 防火墙阻止了本地连接');
  console.log('2. 浏览器缓存问题');
  console.log('3. Next.js编译错误');
  console.log('4. 路由配置问题');
  
  console.log('\n🔧 建议解决方案：');
  console.log('1. 重启开发服务器: npm run dev -- -p 3002');
  console.log('2. 清除浏览器缓存');
  console.log('3. 检查控制台错误信息');
  console.log('4. 验证路由文件是否存在语法错误');
}

// 执行诊断
runFullDiagnostics().catch(console.error);