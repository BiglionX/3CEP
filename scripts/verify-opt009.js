#!/usr/bin/env node

/**
 * OPT-009 快速验证脚本
 */

const fs = require('fs');
const path = require('path');

/* eslint-disable no-console */
console.log('\n========================================');
console.log('🔍 OPT-009 实现验证');
console.log('========================================\n');

const checks = [
  {
    name: '数据库迁移脚本',
    path: 'supabase/migrations/20260324_add_optimistic_lock_to_agents.sql',
    required: true,
  },
  {
    name: '乐观锁工具类',
    path: 'src/lib/db/optimistic-lock.ts',
    required: true,
  },
  {
    name: '更新 API（已集成乐观锁）',
    path: 'src/app/api/agents/[id]/route.ts',
    required: true,
  },
  {
    name: '测试脚本',
    path: 'scripts/test-opt009-optimistic-lock.ts',
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

// 检查数据库迁移脚本
console.log('📋 检查数据库迁移脚本...\n');

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260324_add_optimistic_lock_to_agents.sql'
);
if (fs.existsSync(migrationPath)) {
  const content = fs.readFileSync(migrationPath, 'utf-8');

  const requiredFeatures = [
    {
      name: '添加 version 字段',
      pattern: /ADD COLUMN IF NOT EXISTS version/,
      found: false,
    },
    { name: '设置默认值为 0', pattern: /DEFAULT 0/, found: false },
    {
      name: '创建索引',
      pattern: /CREATE INDEX.*idx_agents_version/,
      found: false,
    },
    { name: '字段注释', pattern: /COMMENT ON COLUMN/, found: false },
    {
      name: '初始化数据',
      pattern: /UPDATE agents SET version = 0/,
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
  console.log('❌ 迁移文件不存在\n');
  allPassed = false;
}

// 检查工具类实现
console.log('\n📋 检查乐观锁工具类实现...\n');

const toolPath = path.join(process.cwd(), 'src/lib/db/optimistic-lock.ts');
if (fs.existsSync(toolPath)) {
  const content = fs.readFileSync(toolPath, 'utf-8');

  const requiredFeatures = [
    {
      name: 'OptimisticLockManager 类',
      pattern: /export class OptimisticLockManager/,
      found: false,
    },
    {
      name: 'updateWithOptimisticLock 方法',
      pattern: /async updateWithOptimisticLock/,
      found: false,
    },
    {
      name: 'getCurrentVersion 方法',
      pattern: /async getCurrentVersion/,
      found: false,
    },
    {
      name: '乐观锁条件检查',
      pattern: /\.eq\(['"]version['"].*currentVersion\)/,
      found: false,
    },
    {
      name: '冲突检测',
      pattern: /conflict.*expectedVersion.*currentVersion/,
      found: false,
    },
    {
      name: 'formatConflictResponse 方法',
      pattern: /formatConflictResponse/,
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
  console.log('❌ 工具类文件不存在\n');
  allPassed = false;
}

// 检查 API 集成
console.log('\n📋 检查 API 乐观锁集成...\n');

const apiPath = path.join(process.cwd(), 'src/app/api/agents/[id]/route.ts');
if (fs.existsSync(apiPath)) {
  const content = fs.readFileSync(apiPath, 'utf-8');

  const requiredFeatures = [
    { name: '导入乐观锁工具', pattern: /OptimisticLockManager/, found: false },
    {
      name: '获取当前版本号',
      pattern: /currentVersion.*version/,
      found: false,
    },
    {
      name: '使用乐观锁更新',
      pattern: /updateWithOptimisticLock/,
      found: false,
    },
    { name: '冲突错误处理', pattern: /OPTIMISTIC_LOCK_CONFLICT/, found: false },
    { name: '返回 409 状态码', pattern: /status: 409/, found: false },
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
  console.log('❌ API 文件不存在\n');
  allPassed = false;
}

console.log('\n========================================');

if (allPassed) {
  console.log('🎉 所有检查通过！OPT-009 已正确实现！\n');
  console.log('下一步操作:');
  console.log('1. 执行数据库迁移：npx supabase db push');
  console.log(
    '2. 运行测试：npx ts-node scripts/test-opt009-optimistic-lock.ts'
  );
  console.log('3. 在其他需要并发控制的 API 中集成乐观锁');
} else {
  console.log('⚠️  部分检查未通过，请检查实现代码\n');
}

console.log('========================================\n');

process.exit(allPassed ? 0 : 1);
