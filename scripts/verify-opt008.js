#!/usr/bin/env node

/**
 * OPT-008 快速验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🔍 OPT-008 实现验证');
console.log('========================================\n');

const checks = [
  {
    name: '库存管理 API',
    path: 'src/app/api/agents/[id]/inventory/route.ts',
    required: true,
  },
  {
    name: '库存状态组件',
    path: 'src/components/agent/StockIndicator.tsx',
    required: true,
  },
  {
    name: '测试脚本',
    path: 'scripts/test-opt008-inventory.ts',
    required: false,
  },
];

let allPassed = true;

checks.forEach((check, index) => {
  const fullPath = path.join(process.cwd(), check.path);
  const exists = fs.existsSync(fullPath);

  const status = exists ? '✅' : '❌';
  const requirement = check.required ? '(必需)' : '(可选)';

  console.log(`${status} ${index + 1}. ${check.name} ${requirement}`);

  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   📄 文件大小：${sizeKB} KB`);
    console.log(`   📅 最后修改：${stats.mtime.toLocaleString('zh-CN')}`);
  } else {
    if (check.required) {
      allPassed = false;
      console.log(`   ⚠️  警告：缺少必需文件！`);
    }
  }
  console.log('');
});

// 检查 API 实现完整性
console.log('📋 检查 API 实现完整性...\n');

const apiFilePath = path.join(
  process.cwd(),
  'src/app/api/agents/[id]/inventory/route.ts'
);
if (fs.existsSync(apiFilePath)) {
  const content = fs.readFileSync(apiFilePath, 'utf-8');

  const requiredFeatures = [
    {
      name: 'GET 方法（查询库存）',
      pattern: /export async function GET/,
      found: false,
    },
    {
      name: 'POST 方法（扣减库存）',
      pattern: /export async function POST/,
      found: false,
    },
    {
      name: 'PUT 方法（恢复库存）',
      pattern: /export async function PUT/,
      found: false,
    },
    { name: '库存扣减逻辑', pattern: /inventory_used.*quantity/, found: false },
    {
      name: '库存恢复逻辑',
      pattern: /Math\.max\(0.*currentUsed.*quantity\)|newUsed.*=.*Math\.max/,
      found: false,
    },
    {
      name: '库存预警',
      pattern: /checkAndSendAlert|inventory_alerts/,
      found: false,
    },
    { name: '乐观锁机制', pattern: /\.eq\(['\"]inventory_used/, found: false },
    { name: '错误处理', pattern: /createErrorResponse/, found: false },
  ];

  requiredFeatures.forEach(feature => {
    feature.found = feature.pattern.test(content);
    const status = feature.found ? '✅' : '❌';
    console.log(`${status} ${feature.name}`);

    if (!feature.found) {
      allPassed = false;
    }
  });
} else {
  console.log('❌ API 文件不存在，无法检查实现细节\n');
  allPassed = false;
}

// 检查组件实现
console.log('\n📋 检查前端组件实现...\n');

const componentPath = path.join(
  process.cwd(),
  'src/components/agent/StockIndicator.tsx'
);
if (fs.existsSync(componentPath)) {
  const content = fs.readFileSync(componentPath, 'utf-8');

  const requiredFeatures = [
    {
      name: 'StockIndicator 组件',
      pattern: /export function StockIndicator/,
      found: false,
    },
    {
      name: 'StockAlert 组件',
      pattern: /export function StockAlert/,
      found: false,
    },
    {
      name: '库存状态计算',
      pattern: /getStockInfo|availableStock/,
      found: false,
    },
    { name: '进度条显示', pattern: /w-32 h-2 bg-gray-200/, found: false },
    {
      name: '状态图标',
      pattern: /AlertCircle|CheckCircle|Package|TrendingDown/,
      found: false,
    },
  ];

  requiredFeatures.forEach(feature => {
    feature.found = feature.pattern.test(content);
    const status = feature.found ? '✅' : '❌';
    console.log(`${status} ${feature.name}`);

    if (!feature.found) {
      allPassed = false;
    }
  });
} else {
  console.log('❌ 组件文件不存在\n');
  allPassed = false;
}

console.log('\n========================================');

if (allPassed) {
  console.log('🎉 所有检查通过！OPT-008 已正确实现！\n');
  console.log('下一步操作:');
  console.log('1. 启动开发服务器：npm run dev');
  console.log('2. 运行测试：npx ts-node scripts/test-opt008-inventory.ts');
  console.log('3. 在智能体详情页集成 StockIndicator 组件');
} else {
  console.log('⚠️  部分检查未通过，请检查实现代码\n');
}

console.log('========================================\n');

process.exit(allPassed ? 0 : 1);
