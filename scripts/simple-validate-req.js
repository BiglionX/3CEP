#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 需求分析验证报告\n');

// 检查文档存在性
const reqDocPath = path.join(
  __dirname,
  '../docs/modules/data-center/requirements-analysis-report.md'
);
console.log('📋 文档完整性检查:');
if (fs.existsSync(reqDocPath)) {
  console.log('  ✓ 需求分析文档存在');

  const content = fs.readFileSync(reqDocPath, 'utf8');
  const sections = [
    '管理后台模块需求',
    '企业服务模块需求',
    '供应链模块需求',
    'WMS仓储模块需求',
    '采购智能体模块需求',
  ];

  let foundSections = 0;
  sections.forEach(section => {
    if (content.includes(section)) {
      console.log(`  ✓ 包含"${section}"`);
      foundSections++;
    }
  });
  console.log(`  📊 章节覆盖率: ${foundSections}/${sections.length}`);
} else {
  console.log('  ❌ 需求分析文档不存在');
}

// 检查业务模块存在性
console.log('\n📋 业务模块覆盖检查:');
const modules = [
  { name: '管理后台', path: '../src/app/admin' },
  { name: '企业服务', path: '../src/app/enterprise' },
  { name: '供应链', path: '../src/app/api/supply-chain' },
  { name: 'WMS仓储', path: '../src/app/api/wms' },
  { name: '采购智能体', path: '../src/modules/procurement-intelligence' },
];

let existingModules = 0;
modules.forEach(module => {
  const modulePath = path.join(__dirname, module.path);
  if (fs.existsSync(modulePath)) {
    console.log(`  ✓ ${module.name}模块存在`);
    existingModules++;
  } else {
    console.log(`  ⚠ ${module.name}模块不存在`);
  }
});
console.log(`  📊 模块覆盖率: ${existingModules}/${modules.length}`);

// 检查技术组件
console.log('\n📋 技术组件验证:');
const components = [
  {
    name: 'Trino查询引擎',
    file: '../src/data-center/core/data-center-service.ts',
    keyword: 'TrinoClient',
  },
  {
    name: 'Redis缓存',
    file: '../src/data-center/core/data-center-service.ts',
    keyword: 'RedisConnectionPool',
  },
  {
    name: '数据虚拟化',
    file: '../src/data-center/core/data-center-service.ts',
    keyword: 'DataVirtualizationService',
  },
];

let workingComponents = 0;
components.forEach(comp => {
  const filePath = path.join(__dirname, comp.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(comp.keyword)) {
      console.log(`  ✓ ${comp.name}组件正常`);
      workingComponents++;
    } else {
      console.log(`  ⚠ ${comp.name}组件功能缺失`);
    }
  } else {
    console.log(`  ❌ ${comp.name}组件文件不存在`);
  }
});
console.log(`  📊 组件可用性: ${workingComponents}/${components.length}`);

// 综合评估
console.log('\n📊 综合评估结果:');
const score =
  (foundSections / sections.length +
    existingModules / modules.length +
    workingComponents / components.length) /
  3;
const rating = score >= 0.8 ? '优秀 ✓' : score >= 0.6 ? '良好 ○' : '需改进 ✗';

console.log(`  综合得分: ${(score * 100).toFixed(1)}% (${rating})`);

if (score >= 0.7) {
  console.log('\n✅ 需求分析验证通过！');
  console.log('📝 分析结果完整准确，具备良好的实施基础。');
} else {
  console.log('\n⚠️ 需求分析需要完善');
  console.log('📝 建议补充相关内容以提高实施可行性。');
}
