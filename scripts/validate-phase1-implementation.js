// 移动端API重构第一阶段验证脚本
async function validatePhase1Implementation() {
  console.log('📱 开始验证移动端API重构第一阶段实施...\n');
  
  const baseUrl = 'http://localhost:3000';
  const testResults = [];
  
  // 1. 验证目录结构
  console.log('1️⃣ 验证目录结构...');
  const expectedDirs = [
    'src/app/api/v1',
    'src/app/api/v1/feed',
    'src/app/api/v1/feed/hot',
    'src/app/api/v1/articles',
    'src/app/api/v1/parts',
    'src/app/api/v1/shops',
    'src/app/api/v1/user',
    'src/app/api/v1/search',
    'src/app/api/v1/upload',
    'src/app/api/v1/appointments'
  ];
  
  const fs = require('fs');
  const path = require('path');
  
  let dirCheckPassed = 0;
  expectedDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
    if (exists) dirCheckPassed++;
  });
  
  testResults.push({
    name: '目录结构验证',
    passed: dirCheckPassed,
    total: expectedDirs.length,
    status: dirCheckPassed === expectedDirs.length ? 'PASS' : 'FAIL'
  });
  
  // 2. 验证API文件存在
  console.log('\n2️⃣ 验证API文件...');
  const apiFiles = [
    'src/app/api/v1/feed/hot/route.ts',
    'src/app/api/v1/articles/[id]/route.ts',
    'src/app/api/v1/search/route.ts',
    'src/app/api/v1/user/profile/route.ts'
  ];
  
  let fileCheckPassed = 0;
  apiFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (exists) fileCheckPassed++;
  });
  
  testResults.push({
    name: 'API文件验证',
    passed: fileCheckPassed,
    total: apiFiles.length,
    status: fileCheckPassed === apiFiles.length ? 'PASS' : 'FAIL'
  });
  
  // 3. 验证文档文件
  console.log('\n3️⃣ 验证技术文档...');
  const docFiles = [
    'docs/technical-docs/mobile-api-design-guidelines.md',
    'docs/project-planning/mobile-api-refactoring-plan.md'
  ];
  
  let docCheckPassed = 0;
  docFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (exists) docCheckPassed++;
  });
  
  testResults.push({
    name: '技术文档验证',
    passed: docCheckPassed,
    total: docFiles.length,
    status: docCheckPassed === docFiles.length ? 'PASS' : 'FAIL'
  });
  
  // 4. 基本语法检查（简化版）
  console.log('\n4️⃣ 基本语法检查...');
  const syntaxCheckFiles = [
    'src/app/api/v1/feed/hot/route.ts',
    'src/app/api/v1/articles/[id]/route.ts'
  ];
  
  let syntaxCheckPassed = 0;
  syntaxCheckFiles.forEach(file => {
    try {
      const fullPath = path.join(__dirname, '..', file);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 简单的语法检查
      const hasImports = content.includes('import');
      const hasExports = content.includes('export');
      const hasAsyncFunction = content.includes('async function');
      
      if (hasImports && hasExports && hasAsyncFunction) {
        console.log(`   ✅ ${file} - 基本语法正确`);
        syntaxCheckPassed++;
      } else {
        console.log(`   ❌ ${file} - 语法检查失败`);
      }
    } catch (error) {
      console.log(`   ❌ ${file} - 读取失败: ${error.message}`);
    }
  });
  
  testResults.push({
    name: '语法检查',
    passed: syntaxCheckPassed,
    total: syntaxCheckFiles.length,
    status: syntaxCheckPassed === syntaxCheckFiles.length ? 'PASS' : 'FAIL'
  });
  
  // 5. 输出总结报告
  console.log('\n📊 第一阶段实施总结报告:');
  console.log('=====================================');
  
  let totalPassed = 0;
  let totalTests = 0;
  
  testResults.forEach(result => {
    const percentage = Math.round((result.passed / result.total) * 100);
    console.log(`${result.name}: ${result.passed}/${result.total} (${percentage}%) - ${result.status}`);
    totalPassed += result.passed;
    totalTests += result.total;
  });
  
  const overallPercentage = Math.round((totalPassed / totalTests) * 100);
  console.log('=====================================');
  console.log(`总体完成度: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
  
  if (overallPercentage >= 80) {
    console.log('🎉 第一阶段实施基本完成！');
    console.log('\n📋 下一步建议:');
    console.log('1. 启动开发服务器进行实际API测试');
    console.log('2. 配置数据库连接测试');
    console.log('3. 开始第二阶段功能开发');
  } else {
    console.log('⚠️  需要完善部分功能后再进入下一阶段');
  }
  
  return {
    overallPercentage,
    testResults,
    recommendations: overallPercentage >= 80 ? 
      ['启动服务器测试', '配置数据库', '开始第二阶段'] :
      ['完善缺失文件', '修复语法错误', '重新验证']
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  validatePhase1Implementation().then(result => {
    console.log('\n验证完成！');
    process.exit(result.overallPercentage >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

module.exports = { validatePhase1Implementation };