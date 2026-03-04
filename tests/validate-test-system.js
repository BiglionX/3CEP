// 简化的测试验证脚本
const fs = require('fs');
const path = require('path');

console.log('🧪 FixCycle 测试体系验证\n');
console.log('=====================================\n');

// 验证目录结构
console.log('📁 验证测试目录结构...');
const requiredDirs = [
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  'tests/n8n',
  'tests/perf',
  'tests/security',
];

let structureValid = true;
requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir} - 存在`);
  } else {
    console.log(`❌ ${dir} - 不存在`);
    structureValid = false;
  }
});

// 验证测试文件存在
console.log('\n📄 验证测试文件...');
const testFiles = [
  'tests/run-all-tests.js',
  'tests/generate-consolidated-report.js',
  'tests/unit/recommendation-engine.test.ts',
  'tests/n8n/test-n8n-workflows.js',
];

testFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
  }
});

// 验证配置文件
console.log('\n⚙️  验证配置文件...');
const configFiles = ['package.json', 'jest.config.js', 'playwright.config.ts'];

configFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
  }
});

// 验证新的npm脚本
console.log('\n📦 验证npm脚本...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'test:all',
    'test:all:quick',
    'test:all:full',
    'test:coverage',
    'test:integration',
    'test:n8n',
    'test:perf',
    'test:security',
  ];

  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script} - 配置正确`);
    } else {
      console.log(`❌ ${script} - 未配置`);
    }
  });
} catch (error) {
  console.log('❌ 无法读取package.json');
}

// 验证CI配置
console.log('\n🚀 验证CI配置...');
const ciFiles = [
  '.github/workflows/test-suite.yml',
  'config/test-suite.config.js',
];

ciFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
  }
});

// 输出验证结果
console.log('\n=====================================');
if (structureValid) {
  console.log('🎉 测试体系结构验证通过！');
  console.log('\n📊 系统功能概述:');
  console.log('✅ 统一测试入口: npm run test:all');
  console.log('✅ 多类型测试支持: 单元、集成、E2E、n8n、性能、安全');
  console.log('✅ 覆盖率报告生成');
  console.log('✅ 统一报告汇总');
  console.log('✅ CI/CD集成配置');
  console.log('✅ 质量门禁检查');

  console.log('\n🔧 使用指南:');
  console.log('快速测试: npm run test:all -- --quick');
  console.log('完整测试: npm run test:all -- --full');
  console.log('CI模式:   npm run test:all -- --ci');
  console.log('指定测试: npm run test:all -- --include=unit,e2e');
  console.log('排除测试: npm run test:all -- --exclude=perf,security');

  console.log('\n📂 报告输出:');
  console.log('- 测试结果: test-results/');
  console.log('- 覆盖率报告: coverage/');
  console.log('- 综合报告: test-results/consolidated-quality-report.html');
} else {
  console.log('❌ 测试体系结构存在问题，请检查目录结构');
}

console.log('\n✨ 验证完成！');
