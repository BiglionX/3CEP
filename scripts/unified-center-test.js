#!/usr/bin/env node

/**
 * 统一用户中心功能测试脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 统一用户中心功能测试\n');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3002',
  testPages: [
    '/unified-center-test',
    '/profile/dashboard',
    '/profile',
    '/'
  ],
  requiredFiles: [
    'src/app/profile/layout.tsx',
    'src/components/user/UserSidebarNavigation.tsx',
    'src/lib/module-registry.ts',
    'src/components/user/DynamicModuleMenu.tsx',
    'src/app/profile/dashboard/page.tsx',
    'src/app/unified-center-test/page.tsx'
  ]
};

// 1. 文件存在性检查
console.log('1️⃣ 文件完整性检查');
let allFilesExist = true;

testConfig.requiredFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${filePath}`);
  if (!exists) allFilesExist = false;
});

// 2. 模块注册系统验证
console.log('\n2️⃣ 模块注册系统验证');

try {
  const moduleRegistryPath = path.join(process.cwd(), 'src/lib/module-registry.ts');
  const registryContent = fs.readFileSync(moduleRegistryPath, 'utf8');
  
  const validations = [
    {
      name: '模块配置接口定义',
      pattern: 'interface ModuleConfig',
      required: true
    },
    {
      name: '模块注册表',
      pattern: 'MODULE_REGISTRY:',
      required: true
    },
    {
      name: '业务模块分类',
      pattern: 'BUSINESS_MODULES:',
      required: true
    },
    {
      name: '管理模块分类',
      pattern: 'MANAGEMENT_MODULES:',
      required: true
    },
    {
      name: '个人模块分类',
      pattern: 'PERSONAL_MODULES:',
      required: true
    }
  ];

  let passedValidations = 0;
  validations.forEach(validation => {
    const found = registryContent.includes(validation.pattern);
    const status = found ? '✅' : '❌';
    console.log(`   ${status} ${validation.name}`);
    if (found) passedValidations++;
  });

  console.log(`\n   通过率: ${passedValidations}/${validations.length}`);

} catch (error) {
  console.log('   ❌ 模块注册系统验证失败:', error.message);
}

// 3. 组件功能检查
console.log('\n3️⃣ 组件功能检查');

const componentChecks = [
  {
    file: 'src/components/user/UserSidebarNavigation.tsx',
    checks: [
      'useUnifiedAuth',
      'moduleRegistry',
      '动态导航',
      '权限控制'
    ]
  },
  {
    file: 'src/components/user/DynamicModuleMenu.tsx',
    checks: [
      '模块搜索',
      '分类筛选',
      '权限过滤',
      '多种显示模式'
    ]
  }
];

componentChecks.forEach(component => {
  try {
    const fullPath = path.join(process.cwd(), component.file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`\n   📄 ${component.file}`);
    component.checks.forEach(check => {
      const found = content.includes(check);
      const status = found ? '✅' : '❌';
      console.log(`      ${status} ${check}`);
    });
  } catch (error) {
    console.log(`\n   ❌ ${component.file}: 文件读取失败`);
  }
});

// 4. 页面结构验证
console.log('\n4️⃣ 页面结构验证');

const pageChecks = [
  {
    file: 'src/app/profile/dashboard/page.tsx',
    features: ['用户概览', '业务统计', '快捷访问', '最近活动']
  },
  {
    file: 'src/app/unified-center-test/page.tsx',
    features: ['标签页导航', '模块统计', '测试面板', '权限显示']
  }
];

pageChecks.forEach(page => {
  try {
    const fullPath = path.join(process.cwd(), page.file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`\n   📄 ${page.file}`);
    page.features.forEach(feature => {
      const found = content.includes(feature);
      const status = found ? '✅' : '❌';
      console.log(`      ${status} ${feature}`);
    });
  } catch (error) {
    console.log(`\n   ❌ ${page.file}: 文件读取失败`);
  }
});

// 5. 总结报告
console.log('\n📋 测试总结');
console.log('='.repeat(40));

if (allFilesExist) {
  console.log('✅ 所有必需文件均已创建');
} else {
  console.log('❌ 部分文件缺失，请检查上述结果');
}

console.log('\n🚀 下一步建议:');
console.log('1. 通过预览浏览器访问测试页面');
console.log('2. 验证用户中心导航功能');
console.log('3. 测试模块搜索和筛选功能');
console.log('4. 检查权限控制是否正常工作');

console.log('\n🎯 测试页面地址:');
testConfig.testPages.forEach(page => {
  console.log(`   ${testConfig.baseUrl}${page}`);
});