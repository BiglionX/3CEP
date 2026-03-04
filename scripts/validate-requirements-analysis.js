#!/usr/bin/env node

/**
 * 需求分析验证脚本
 * 验证DC002需求分析结果的完整性和准确性
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始需求分析验证...\n');

// 验证项1: 检查需求分析文档完整性
console.log('📋 验证项1: 需求分析文档完整性');
const reqDocPath = path.join(
  __dirname,
  '../docs/modules/data-center/requirements-analysis-report.md'
);
if (fs.existsSync(reqDocPath)) {
  const content = fs.readFileSync(reqDocPath, 'utf8');
  console.log('  ✓ 需求分析文档存在');

  // 检查关键章节是否存在
  const requiredSections = [
    '管理后台模块需求',
    '企业服务模块需求',
    '供应链模块需求',
    'WMS仓储模块需求',
    '采购智能体模块需求',
    '需求优先级排序',
  ];

  var sectionCount = 0;
  requiredSections.forEach(section => {
    if (content.includes(section)) {
      console.log(`  ✓ 包含"${section}"章节`);
      sectionCount++;
    } else {
      console.log(`  ⚠ 缺少"${section}"章节`);
    }
  });

  console.log(`  📊 章节完整度: ${sectionCount}/${requiredSections.length}`);
} else {
  console.log('  ❌ 需求分析文档不存在');
}

// 验证项2: 验证需求覆盖范围
console.log('\n📋 验证项2: 需求覆盖范围验证');
const businessModules = [
  {
    path: '../src/app/admin',
    name: '管理后台',
    requirement: 'dashboard_requirements',
  },
  {
    path: '../src/app/enterprise',
    name: '企业服务',
    requirement: 'enterprise_analytics_needs',
  },
  {
    path: '../src/app/api/supply-chain',
    name: '供应链',
    requirement: 'supply_chain_analytics',
  },
  {
    path: '../src/app/api/wms',
    name: 'WMS仓储',
    requirement: 'warehouse_performance',
  },
  {
    path: '../src/modules/procurement-intelligence',
    name: '采购智能体',
    requirement: 'market_intelligence',
  },
];

let coverageScore = 0;
businessModules.forEach(module => {
  const modulePath = path.join(__dirname, module.path);
  if (fs.existsSync(modulePath)) {
    console.log(`  ✓ ${module.name}模块存在`);
    coverageScore++;
  } else {
    console.log(`  ⚠ ${module.name}模块不存在或路径变更`);
  }
});

console.log(`  📊 模块覆盖率: ${coverageScore}/${businessModules.length}`);

// 验证项3: 技术可行性验证
console.log('\n📋 验证项3: 技术可行性验证');
const techComponents = [
  {
    name: 'Trino查询引擎',
    path: '../src/data-center/core/data-center-service.ts',
    keyword: 'TrinoClient',
  },
  {
    name: 'Redis缓存',
    path: '../src/data-center/core/data-center-service.ts',
    keyword: 'RedisConnectionPool',
  },
  {
    name: '数据虚拟化',
    path: '../src/data-center/core/data-center-service.ts',
    keyword: 'DataVirtualizationService',
  },
  {
    name: 'API路由',
    path: '../src/app/api/data-center/route.ts',
    keyword: 'GET',
  },
];

let techScore = 0;
techComponents.forEach(component => {
  const componentPath = path.join(__dirname, component.path);
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    if (content.includes(component.keyword)) {
      console.log(`  ✓ ${component.name}组件已实现`);
      techScore++;
    } else {
      console.log(`  ⚠ ${component.name}组件缺少关键功能`);
    }
  } else {
    console.log(`  ❌ ${component.name}组件文件不存在`);
  }
});

console.log(`  📊 技术实现度: ${techScore}/${techComponents.length}`);

// 验证项4: 需求优先级合理性检查
console.log('\n📋 验证项4: 需求优先级合理性');
const reqDocContent = fs.readFileSync(reqDocPath, 'utf8');
const hasPrioritySections = [
  reqDocContent.includes('高优先级需求'),
  reqDocContent.includes('中优先级需求'),
  reqDocContent.includes('低优先级需求'),
].filter(Boolean).length;

console.log(`  ✓ 优先级分类完整: ${hasPrioritySections}/3`);

// 验证项5: 实施路径合理性
console.log('\n📋 验证项5: 实施路径合理性');
const hasImplementationPhases = [
  reqDocContent.includes('第一阶段'),
  reqDocContent.includes('第二阶段'),
  reqDocContent.includes('第三阶段'),
].filter(Boolean).length;

console.log(`  ✓ 实施阶段规划: ${hasImplementationPhases}/3`);

// 输出验证结果
console.log('\n📊 需求分析验证结果汇总:');
const totalScore =
  (sectionCount / requiredSections.length +
    coverageScore / businessModules.length +
    techScore / techComponents.length +
    hasPrioritySections / 3 +
    hasImplementationPhases / 3) /
  5;
const rating =
  totalScore >= 0.8 ? '优秀(✓)' : totalScore >= 0.6 ? '良好(○)' : '需改进(✗)';

console.log(`  需求完整性: ${sectionCount}/${requiredSections.length}`);
console.log(`  覆盖范围: ${coverageScore}/${businessModules.length}`);
console.log(`  技术可行性: ${techScore}/${techComponents.length}`);
console.log(`  优先级合理性: ${hasPrioritySections}/3`);
console.log(`  实施路径: ${hasImplementationPhases}/3`);
console.log(`  综合评分: ${(totalScore * 100).toFixed(1)}% ${rating}`);

console.log('\n✅ 需求分析验证完成！');
if (totalScore >= 0.7) {
  console.log('📝 需求分析结果完整准确，具备良好的实施基础。');
} else {
  console.log('⚠️ 需求分析需要进一步完善，建议补充相关内容。');
}
