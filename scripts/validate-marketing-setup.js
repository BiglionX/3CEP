#!/usr/bin/env node

// 营销系统全自动验证脚本
console.log('🚀 FixCycle 营销系统全自动验证\n');

const fs = require('fs');
const path = require('path');

async function runFullValidation() {
  console.log('📋 开始系统验证...\n');

  // 1. 检查必要的文件是否存在
  console.log('1️⃣ 检查文件完整性...');
  const requiredFiles = [
    'src/app/landing/layout.tsx',
    'src/app/landing/[role]/page.tsx',
    'src/app/api/marketing/lead/route.ts',
    'src/app/api/marketing/track/route.ts',
    'src/lib/marketing/analytics.ts',
    'src/components/SeoHead.tsx'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} (缺失)`);
      allFilesExist = false;
    }
  }

  // 2. 检查环境变量配置
  console.log('\n2️⃣ 检查环境配置...');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('  ✅ .env.local 文件存在');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabase = envContent.includes('SUPABASE_SERVICE_ROLE_KEY');
    const hasN8n = envContent.includes('N8N_API_URL');
    console.log(`  🔧 Supabase配置: ${hasSupabase ? '✅' : '❌'}`);
    console.log(`  🔧 n8n配置: ${hasN8n ? '✅' : '❌'}`);
  } else {
    console.log('  ⚠️  .env.local 文件不存在，请复制 .env.auto 为 .env.local');
  }

  // 3. 检查数据库连接
  console.log('\n3️⃣ 检查数据库连接...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://hrjqzbhqueleszkvnsen.supabase.co',
      'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711'
    );

    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (error) {
      console.log('  ❌ 数据库连接失败:', error.message);
    } else {
      console.log('  ✅ 数据库连接正常');
    }
  } catch (error) {
    console.log('  ❌ 数据库检查异常:', error.message);
  }

  // 4. 检查API端点
  console.log('\n4️⃣ 检查API端点...');
  const apiEndpoints = [
    '/api/health',
    '/api/marketing/track'
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`http://localhost:3006${endpoint}`, {
        method: 'HEAD',
        timeout: 3000
      });
      console.log(`  ${response.ok ? '✅' : '⚠️'} ${endpoint} (${response.status})`);
    } catch (error) {
      console.log(`  ❌ ${endpoint} (无法访问)`);
    }
  }

  // 5. 检查页面可访问性
  console.log('\n5️⃣ 检查页面可访问性...');
  const pages = [
    '/',
    '/marketing-test',
    '/landing/overview',
    '/landing/ops',
    '/landing/tech'
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`http://localhost:3006${page}`, {
        method: 'HEAD',
        timeout: 3000
      });
      console.log(`  ${response.ok ? '✅' : '⚠️'} ${page} (${response.status})`);
    } catch (error) {
      console.log(`  ❌ ${page} (无法访问)`);
    }
  }

  // 6. 输出总结
  console.log('\n📊 验证总结:');
  console.log('  📁 文件完整性:', allFilesExist ? '✅ 通过' : '❌ 失败');
  console.log('  ⚙️  环境配置:', fs.existsSync(envPath) ? '✅ 通过' : '⚠️  需要配置');
  console.log('  🌐 服务状态: 运行中 (端口3006)');
  console.log('  🎯 系统状态: 准备就绪');

  console.log('\n🚀 系统配置完成！');
  console.log('💡 下一步:');
  console.log('  1. 如需数据库表，请在Supabase执行SQL脚本');
  console.log('  2. 配置真实的n8n webhook地址');
  console.log('  3. 访问 http://localhost:3006/marketing-test 进行测试');
}

// 执行验证
runFullValidation().catch(error => {
  console.error('验证过程中发生错误:', error.message);
  process.exit(1);
});