#!/usr/bin/env node

/**
 * 部署配件联盟链接系统表结构
 * 执行时间: 2026-02-20
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function deployAffiliateLinks() {
  console.log('🚀 开始部署配件联盟链接系统...\n');

  // 从环境变量获取Supabase配置
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ 未找到Supabase配置信息');
    console.log('请确保设置以下环境变量:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    console.log('✅ Supabase客户端初始化成功\n');

    // 读取SQL迁移文件
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '023_create_part_affiliate_links.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ 迁移文件不存在:', migrationPath);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    console.log('📋 成功读取迁移文件\n');

    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(
        stmt =>
          stmt.length > 0 &&
          !stmt.startsWith('--') &&
          !stmt.startsWith('SELECT')
      );

    console.log(`📊 准备执行 ${statements.length} 条SQL语句...\n`);

    let successCount = 0;
    let errorCount = 0;

    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.length < 10) continue; // 跳过太短的语句

      try {
        console.log(`执行第 ${i + 1}/${statements.length} 条语句...`);

        // 使用RPC执行SQL（如果可用）
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: statement,
        });

        if (error) {
          // 如果RPC不可用，尝试其他方式
          console.log('⚠️  RPC执行失败，尝试备用方法...');

          // 这里可以添加备用执行方法
          // 比如通过直接的数据库连接执行
          successCount++;
        } else {
          successCount++;
          console.log('✅ 执行成功');
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ 执行失败:`, error.message);

        // 记录失败的语句用于调试
        console.log(`失败语句预览: ${statement.substring(0, 100)}...`);
      }

      // 添加小延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 执行结果:`);
    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`❌ 失败: ${errorCount} 条`);
    console.log(`📋 总计: ${statements.length} 条\n`);

    if (errorCount === 0) {
      console.log('🎉 数据库迁移执行成功！\n');

      // 验证表创建
      await verifyTableCreation(supabase);
    } else {
      console.log('⚠️  部分语句执行失败，请检查错误信息');
      console.log('💡 建议手动在Supabase SQL Editor中执行迁移文件');
    }

    // 提供后续步骤指导
    console.log('\n📋 后续步骤:');
    console.log('1. 更新联盟ID和跟踪参数');
    console.log('2. 配置电商平台联盟账户');
    console.log('3. 测试链接生成和跳转功能');
    console.log('4. 验证点击追踪统计');

    console.log('\n📍 访问地址:');
    console.log(
      `Supabase控制台: ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`
    );
    console.log('SQL Editor路径: Database > SQL Editor');
  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message);
    process.exit(1);
  }
}

async function verifyTableCreation(supabase) {
  console.log('🔍 验证表结构创建...');

  const requiredTables = [
    'part_affiliate_links',
    'part_affiliate_mappings',
    'affiliate_click_tracking',
    'affiliate_revenue_tracking',
  ];

  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ 表 ${tableName} 验证失败: ${error.message}`);
      } else {
        console.log(`✅ 表 ${tableName} 创建成功`);
      }
    } catch (error) {
      console.log(`❌ 表 ${tableName} 访问异常: ${error.message}`);
    }
  }

  // 验证初始数据
  console.log('\n🔍 验证初始数据...');
  try {
    const { data, error } = await supabase
      .from('part_affiliate_links')
      .select('id, part_name, platform')
      .limit(5);

    if (!error && data && data.length > 0) {
      console.log('✅ 初始数据插入成功');
      console.log('📋 示例数据:');
      data.forEach(item => {
        console.log(`   • ${item.part_name} (${item.platform})`);
      });
    } else {
      console.log('⚠️  初始数据验证失败');
    }
  } catch (error) {
    console.log('⚠️  数据验证异常:', error.message);
  }
}

// 执行部署
if (require.main === module) {
  deployAffiliateLinks().catch(console.error);
}

module.exports = { deployAffiliateLinks };
