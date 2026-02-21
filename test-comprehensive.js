#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 开始全面功能测试...\n');

// 测试配置
const TEST_CASES = [
  {
    name: '设备档案API测试',
    url: 'http://localhost:3001/api/devices/test_device_001/profile',
    method: 'POST',
    expectedStatus: 200,
    description: '测试设备档案API是否返回mock数据'
  },
  {
    name: '生命周期事件API测试',
    url: 'http://localhost:3001/api/devices/test_device_001/lifecycle',
    method: 'GET',
    expectedStatus: 200,
    description: '测试生命周期事件API是否返回mock数据'
  },
  {
    name: '扫码落地页访问测试',
    url: 'http://localhost:3001/scan/test_device_001',
    method: 'GET',
    expectedStatus: 200,
    description: '测试扫码落地页是否正常加载'
  }
];

async function runTest(testCase) {
  console.log(`🧪 测试: ${testCase.name}`);
  console.log(`📝 描述: ${testCase.description}`);
  
  return new Promise((resolve) => {
    const curl = spawn('curl', [
      '-X', testCase.method,
      '-H', 'Content-Type: application/json',
      testCase.url,
      '-w', '\nHTTP状态码: %{http_code}\n响应时间: %{time_total}s\n'
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    let output = '';
    let errorOutput = '';

    curl.stdout.on('data', (data) => {
      output += data.toString();
    });

    curl.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    curl.on('close', (code) => {
      const success = code === 0 && output.includes(`HTTP状态码: ${testCase.expectedStatus}`);
      
      console.log(`📊 结果: ${success ? '✅ 通过' : '❌ 失败'}`);
      if (!success) {
        console.log(`📋 错误详情: ${errorOutput || output}`);
      }
      console.log('---\n');
      
      resolve({
        name: testCase.name,
        success,
        output,
        error: errorOutput
      });
    });
  });
}

async function checkFileExistence() {
  console.log('📁 检查关键文件是否存在...\n');
  
  const filesToCheck = [
    'src/components/device/EventCard.tsx',
    'src/components/ui/tabs.tsx',
    'src/app/scan/[id]/page.tsx',
    'src/app/api/devices/[qrcodeId]/profile/route.ts',
    'src/app/api/devices/[qrcodeId]/lifecycle/route.ts'
  ];

  const results = [];
  
  for (const file of filesToCheck) {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '缺失'}`);
    results.push({ file, exists });
  }
  
  console.log('\n---\n');
  return results;
}

async function main() {
  try {
    // 检查文件存在性
    const fileResults = await checkFileExistence();
    
    // 运行API测试
    console.log('🌐 运行API功能测试...\n');
    const testResults = [];
    
    for (const testCase of TEST_CASES) {
      const result = await runTest(testCase);
      testResults.push(result);
    }
    
    // 输出测试报告
    console.log('📋 测试报告汇总:');
    console.log('==================');
    
    console.log('\n📁 文件检查结果:');
    const missingFiles = fileResults.filter(r => !r.exists);
    if (missingFiles.length === 0) {
      console.log('✅ 所有必需文件都存在');
    } else {
      console.log('❌ 缺失文件:');
      missingFiles.forEach(f => console.log(`   - ${f.file}`));
    }
    
    console.log('\n🧪 API测试结果:');
    const failedTests = testResults.filter(t => !t.success);
    if (failedTests.length === 0) {
      console.log('✅ 所有API测试通过');
    } else {
      console.log('❌ 失败的测试:');
      failedTests.forEach(t => console.log(`   - ${t.name}`));
    }
    
    // 整体评估
    const allPassed = missingFiles.length === 0 && failedTests.length === 0;
    console.log(`\n🎯 最终评估: ${allPassed ? '✅ 所有测试通过' : '❌ 存在问题需要修复'}`);
    
    if (!allPassed) {
      console.log('\n🔧 建议修复步骤:');
      if (missingFiles.length > 0) {
        console.log('1. 确认所有组件文件都已正确创建');
      }
      if (failedTests.length > 0) {
        console.log('2. 检查API路由配置和服务端口');
        console.log('3. 确认Next.js开发服务器正在运行');
      }
    }
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ 测试执行出错:', error.message);
    process.exit(1);
  }
}

main();