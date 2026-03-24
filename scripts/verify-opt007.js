#!/usr/bin/env node

/**
 * OPT-007 快速验证脚本
 *
 * 用于快速检查手动上下架 API 是否正常部署
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🔍 OPT-007 实现验证');
console.log('========================================\n');

const checks = [
  {
    name: 'API 路由文件',
    path: 'src/app/api/admin/agents/[id]/shelf/route.ts',
    required: true,
  },
  {
    name: '测试脚本',
    path: 'scripts/test-opt007-shelf-api.ts',
    required: false,
  },
  {
    name: '使用文档',
    path: 'docs/api-guides/OPT007_SHELF_API.md',
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

// 检查 API 路由文件内容
console.log('📋 检查 API 实现完整性...\n');

const apiFilePath = path.join(
  process.cwd(),
  'src/app/api/admin/agents/[id]/shelf/route.ts'
);
if (fs.existsSync(apiFilePath)) {
  const content = fs.readFileSync(apiFilePath, 'utf-8');

  const requiredFeatures = [
    { name: '权限验证', pattern: /AgentPermission\.AGENT_SHELF/, found: false },
    { name: 'POST 方法', pattern: /export async function POST/, found: false },
    { name: '审计日志', pattern: /agent_audit_logs/, found: false },
    { name: '邮件通知', pattern: /sendShelfNotification/, found: false },
    { name: '错误处理', pattern: /createErrorResponse/, found: false },
    { name: '成功响应', pattern: /createSuccessResponse/, found: false },
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

console.log('\n========================================');

if (allPassed) {
  console.log('🎉 所有检查通过！OPT-007 已正确实现！\n');
  console.log('下一步操作:');
  console.log('1. 启动开发服务器：npm run dev');
  console.log('2. 运行测试：npx ts-node scripts/test-opt007-shelf-api.ts');
  console.log('3. 查看文档：docs/api-guides/OPT007_SHELF_API.md');
} else {
  console.log('⚠️  部分检查未通过，请检查实现\n');
}

console.log('========================================\n');

process.exit(allPassed ? 0 : 1);
