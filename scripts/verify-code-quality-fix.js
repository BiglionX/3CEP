const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n========================================');
console.log('  📊 代码质量修复验证报告');
console.log('========================================\n');

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
};

// Test 1: ESLint 状态
console.log('📋 测试 1: ESLint 检查');
console.log('-----------------------------------');
try {
  const eslintOutput = execSync('npm run lint:check 2>&1', {
    encoding: 'utf8',
  });
  const hasErrors = eslintOutput.includes('error');

  if (hasErrors) {
    const errorMatch = eslintOutput.match(
      /(\d+) problems \((\d+) errors, (\d+) warnings\)/
    );
    if (errorMatch) {
      console.log(`⚠️  发现 ${errorMatch[2]} 个错误，${errorMatch[3]} 个警告`);
      results.tests.push({
        name: 'ESLint',
        status: 'PASSED_WITH_WARNINGS',
        errors: parseInt(errorMatch[2]),
        warnings: parseInt(errorMatch[3]),
      });
    }
  } else {
    console.log('✅ ESLint 检查通过，无错误');
    results.tests.push({ name: 'ESLint', status: 'PASSED' });
  }
} catch (error) {
  console.log('❌ ESLint 执行失败');
  results.tests.push({ name: 'ESLint', status: 'FAILED' });
}

// Test 2: Prettier 状态
console.log('\n📝 测试 2: Prettier 格式化');
console.log('-----------------------------------');
try {
  execSync('npm run format:check 2>&1', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ 所有文件已正确格式化');
  results.tests.push({ name: 'Prettier', status: 'PASSED' });
} catch (error) {
  console.log('❌ Prettier 检查失败');
  results.tests.push({ name: 'Prettier', status: 'FAILED' });
}

// Test 3: IDE 配置
console.log('\n⚙️  测试 3: IDE 配置验证');
console.log('-----------------------------------');
try {
  const ideCheck =
    fs.existsSync('.vscode/settings.json') &&
    fs.existsSync('.eslintrc.json') &&
    fs.existsSync('.prettierrc');
  if (ideCheck) {
    console.log('✅ IDE 配置文件完整');
    results.tests.push({ name: 'IDE Config', status: 'PASSED' });
  } else {
    console.log('⚠️  部分 IDE 配置文件缺失');
    results.tests.push({ name: 'IDE Config', status: 'WARNING' });
  }
} catch (error) {
  console.log('❌ IDE 配置检查失败');
  results.tests.push({ name: 'IDE Config', status: 'FAILED' });
}

// Test 4: 项目结构
console.log('\n📁 测试 4: 项目结构验证');
console.log('-----------------------------------');
const requiredDirs = ['src', 'tests', 'scripts', 'public'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));

if (missingDirs.length === 0) {
  console.log('✅ 项目结构完整');
  results.tests.push({ name: 'Project Structure', status: 'PASSED' });
} else {
  console.log(`⚠️  缺少目录：${missingDirs.join(', ')}`);
  results.tests.push({ name: 'Project Structure', status: 'WARNING' });
}

// Test 5: 工具脚本
console.log('\n🛠️  测试 5: 代码质量工具');
console.log('-----------------------------------');
const tools = [
  'scripts/test-code-quality.js',
  'scripts/analyze-console-logs.js',
  'scripts/cleanup-console-logs.js',
  'scripts/fix-chinese-encoding.js',
];

const availableTools = tools.filter(tool => fs.existsSync(tool));
console.log(`✅ 可用工具：${availableTools.length}/${tools.length}`);
availableTools.forEach(tool => console.log(`   • ${tool}`));

results.tests.push({
  name: 'Code Quality Tools',
  status: availableTools.length === tools.length ? 'PASSED' : 'WARNING',
});

// 总结
console.log('\n========================================');
console.log('📊 测试总结');
console.log('========================================');

const passed = results.tests.filter(t => t.status === 'PASSED').length;
const total = results.tests.length;
const passRate = ((passed / total) * 100).toFixed(1);

console.log(`总测试数：${total}`);
console.log(`通过：${passed}`);
console.log(`通过率：${passRate}%`);

if (passRate >= 80) {
  console.log('\n✅ 代码质量良好！');
} else if (passRate >= 60) {
  console.log('\n⚠️  部分测试通过，建议继续优化');
} else {
  console.log('\n❌ 需要大量修复');
}

console.log('\n========================================\n');

// 保存结果
fs.writeFileSync(
  'reports/code-quality-verification.json',
  JSON.stringify(results, null, 2)
);

console.log('💾 测试结果已保存至：reports/code-quality-verification.json\n');
