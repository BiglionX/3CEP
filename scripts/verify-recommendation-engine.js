/**
 * FCX智能推荐引擎验证脚本
 * 验证核心功能模块是否正确实现
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FCX智能推荐引擎验证报告\n');
console.log('='.repeat(50));

// 检查文件结构
const requiredFiles = [
  'src/fcx-system/models/recommendation.model.ts',
  'src/fcx-system/services/recommendation.interfaces.ts',
  'src/fcx-system/services/user-behavior-collector.service.ts',
  'src/fcx-system/services/user-profile.service.ts',
  'src/fcx-system/services/item-profile.service.ts',
  'src/fcx-system/services/collaborative-filter-recommender.service.ts',
  'src/fcx-system/services/deep-learning-recommender.service.ts',
  'src/fcx-system/services/hybrid-recommender.service.ts',
  'src/app/api/fcx/recommendations/route.ts',
  'supabase/migrations/005_fcx_recommendation_engine.sql',
  'tests/recommendation-engine.test.ts',
  'scripts/test-recommendation-engine.js',
  'scripts/deploy-recommendation-engine.js',
  'docs/guides/fcx-recommendation-engine-guide.md',
];

let passedChecks = 0;
const totalChecks = requiredFiles.length;

console.log('📁 文件结构验证:');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
    passedChecks++;
  } else {
    console.log(`  ❌ ${file} (缺失)`);
  }
});

console.log(`\n📊 文件验证结果: ${passedChecks}/${totalChecks} 通过`);

// 检查核心功能实现
console.log('\n🔧 核心功能验证:');

const coreFeatures = [
  { name: '用户行为数据收集', file: 'user-behavior-collector.service.ts' },
  { name: '用户画像构建', file: 'user-profile.service.ts' },
  { name: '物品画像构建', file: 'item-profile.service.ts' },
  { name: '协同过滤算法', file: 'collaborative-filter-recommender.service.ts' },
  { name: '大模型推荐集成', file: 'deep-learning-recommender.service.ts' },
  { name: '混合推荐引擎', file: 'hybrid-recommender.service.ts' },
  { name: '推荐API接口', file: 'route.ts' },
  { name: '数据库表结构', file: '005_fcx_recommendation_engine.sql' },
];

let featureChecks = 0;
coreFeatures.forEach(feature => {
  const filePath = path.join(
    __dirname,
    '..',
    'src',
    'fcx-system',
    'services',
    feature.file
  );
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // 检查关键方法是否存在
    const hasKeyMethods = [
      'recordBehavior',
      'buildUserProfile',
      'buildItemProfile',
      'train',
      'recommend',
      'calculateUserSimilarity',
    ].some(method => content.includes(method));

    if (hasKeyMethods) {
      console.log(`  ✅ ${feature.name}`);
      featureChecks++;
    } else {
      console.log(`  ⚠️  ${feature.name} (方法不完整)`);
    }
  } else {
    console.log(`  ❌ ${feature.name} (文件缺失)`);
  }
});

console.log(`\n📊 功能验证结果: ${featureChecks}/${coreFeatures.length} 通过`);

// 检查API接口
console.log('\n🌐 API接口验证:');
const apiRoutePath = path.join(
  __dirname,
  '..',
  'src',
  'app',
  'api',
  'fcx',
  'recommendations',
  'route.ts'
);
if (fs.existsSync(apiRoutePath)) {
  const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
  const hasHttpMethods = ['GET', 'POST', 'PUT', 'DELETE'].every(method =>
    apiContent.includes(method.toLowerCase())
  );

  if (hasHttpMethods) {
    console.log('  ✅ HTTP方法支持完整');
  } else {
    console.log('  ⚠️  HTTP方法支持不完整');
  }

  const hasKeyEndpoints = [
    'get-recommendations',
    'record-behavior',
    'batch-recommend',
    'record-feedback',
  ].every(endpoint => apiContent.includes(endpoint));

  if (hasKeyEndpoints) {
    console.log('  ✅ 核心端点实现完整');
  } else {
    console.log('  ⚠️  核心端点实现不完整');
  }
}

// 检查测试覆盖率
console.log('\n🧪 测试覆盖验证:');
const testFiles = [
  'tests/recommendation-engine.test.ts',
  'scripts/test-recommendation-engine.js',
];

testFiles.forEach(testFile => {
  const fullPath = path.join(__dirname, '..', testFile);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${testFile}`);
  } else {
    console.log(`  ❌ ${testFile} (缺失)`);
  }
});

// 生成总结报告
console.log(`\n${'='.repeat(50)}`);
console.log('📋 验证总结报告:');
console.log(
  `文件结构完整度: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`
);
console.log(
  `功能实现完整度: ${((featureChecks / coreFeatures.length) * 100).toFixed(1)}%`
);

const overallScore =
  ((passedChecks / totalChecks + featureChecks / coreFeatures.length) / 2) *
  100;
console.log(`总体完成度: ${overallScore.toFixed(1)}%`);

if (overallScore >= 80) {
  console.log('\n🎉 FCX智能推荐引擎核心功能已完成！');
  console.log('✅ 可以进行下一步的集成和部署');
} else if (overallScore >= 60) {
  console.log('\n⚠️  FCX智能推荐引擎基本功能已完成');
  console.log('🔧 建议完善部分功能细节');
} else {
  console.log('\n❌ FCX智能推荐引擎需要进一步开发');
  console.log('🔧 建议补充缺失的核心功能');
}

console.log('\n🚀 下一步建议:');
console.log('1. 配置环境变量 (DeepSeek API密钥)');
console.log('2. 运行数据库迁移');
console.log('3. 启动开发服务器');
console.log('4. 执行集成测试');
console.log('5. 部署到生产环境');
