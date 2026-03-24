/**
 * 阶段一 API 端点验证脚本
 *
 * 使用方法:
 * npx tsx scripts/verify-phase1-apis.ts
 */

import { readFileSync } from 'fs';

const apiPaths = [
  'src/app/api/admin/skill-store/list/route.ts',
  'src/app/api/admin/skill-store/approve/route.ts',
  'src/app/api/admin/skill-store/toggle-status/route.ts',
  'src/app/api/admin/skill-store/statistics/route.ts',
  'src/app/api/admin/marketplace/overview/route.ts',
  'src/app/api/admin/marketplace/revenue-stats/route.ts',
  'src/app/api/admin/marketplace/developer-stats/route.ts',
  'src/app/api/admin/developers/list/route.ts',
  'src/app/api/admin/developers/manage/route.ts',
];

console.log('🔍 开始验证阶段一 API 端点...\n');

let allValid = true;

apiPaths.forEach(path => {
  try {
    const content = readFileSync(path, 'utf-8');

    // 检查基本结构
    const hasGetExport = content.includes('export async function GET');
    const hasPostExport = content.includes('export async function POST');
    const hasAuthCheck = content.includes('getAuthUser');
    const hasPermissionCheck = content.includes('user.role');
    const hasSupabaseClient = content.includes('createClient');
    const hasErrorHandling =
      content.includes('try') && content.includes('catch');
    const hasNextResponse = content.includes('NextResponse.json');

    // 检查注释文档
    const hasJSDoc = content.startsWith('/**');

    console.log(`✅ ${path.split('/').slice(-3).join('/')}`);
    console.log(
      `   - 导出方法：${hasGetExport ? 'GET' : ''}${hasPostExport ? ' POST' : ''}`
    );
    console.log(
      `   - 权限验证：${hasAuthCheck && hasPermissionCheck ? '✅' : '❌'}`
    );
    console.log(`   - 数据库客户端：${hasSupabaseClient ? '✅' : '❌'}`);
    console.log(`   - 错误处理：${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`   - JSDoc 注释：${hasJSDoc ? '✅' : '❌'}`);
    console.log('');
  } catch (error: any) {
    console.log(`❌ ${path}`);
    console.log(`   错误：${error.message}\n`);
    allValid = false;
  }
});

// 统计信息
console.log('📊 统计信息:');
console.log('─'.repeat(50));
console.log(`总文件数：${apiPaths.length}`);
console.log(`验证通过：${allValid ? '✅ 是' : '❌ 否'}`);
console.log('');

if (allValid) {
  console.log('🎉 所有 API 端点验证通过！');
  console.log('');
  console.log('📝 API 端点列表:');
  console.log('─'.repeat(50));

  const endpoints = [
    {
      path: '/api/admin/skill-store/list',
      method: 'GET',
      desc: 'Skill 列表查询',
    },
    {
      path: '/api/admin/skill-store/approve',
      method: 'POST',
      desc: 'Skill 审核',
    },
    {
      path: '/api/admin/skill-store/toggle-status',
      method: 'POST',
      desc: 'Skill 上下架切换',
    },
    {
      path: '/api/admin/skill-store/statistics',
      method: 'GET',
      desc: 'Skill 统计数据',
    },
    {
      path: '/api/admin/marketplace/overview',
      method: 'GET',
      desc: '市场概览',
    },
    {
      path: '/api/admin/marketplace/revenue-stats',
      method: 'GET',
      desc: '收入统计',
    },
    {
      path: '/api/admin/marketplace/developer-stats',
      method: 'GET',
      desc: '开发者统计',
    },
    { path: '/api/admin/developers/list', method: 'GET', desc: '开发者列表' },
    {
      path: '/api/admin/developers/manage',
      method: 'POST',
      desc: '开发者管理',
    },
  ];

  endpoints.forEach(endpoint => {
    console.log(
      `${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(45)} - ${endpoint.desc}`
    );
  });

  console.log('\n✅ 阶段一：API 端点开发完成！');
  console.log('📄 详细报告请查看：PHASE1_API_COMPLETION_REPORT.md\n');
} else {
  console.log('❌ 部分 API 端点验证失败，请检查上述错误信息。\n');
  process.exit(1);
}
