/**
 * 数据库架构验证脚本
 * Verify Analytics Database Schema
 */

const { Client } = require('pg');
require('dotenv').config();

async function verifyDatabaseSchema() {
  console.log('🔍 开始验证数据库架构...\n');

  const client = new Client({
    connectionString: process.env.NEXT_PUBLIC_SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 验证核心表
    const tables = [
      'analytics_events',
      'data_quality_metrics',
      'analytics_hourly_metrics',
      'analytics_daily_metrics',
    ];

    console.log('📊 验证核心表...');
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${table}'
        );
      `);

      if (result.rows[0].exists) {
        console.log(`   ✅ ${table} 表存在`);
      } else {
        console.log(`   ❌ ${table} 表不存在`);
      }
    }

    // 验证视图
    const views = [
      'v_realtime_dashboard',
      'v_realtime_top_pages',
      'v_realtime_event_distribution',
      'v_realtime_device_distribution',
      'v_data_quality_alerts',
      'v_traffic_anomalies',
    ];

    console.log('\n👁️  验证视图...');
    for (const view of views) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.views
          WHERE table_schema = 'public'
          AND table_name = '${view}'
        );
      `);

      if (result.rows[0].exists) {
        console.log(`   ✅ ${view} 视图存在`);
      } else {
        console.log(`   ❌ ${view} 视图不存在`);
      }
    }

    // 验证物化视图
    const materializedViews = ['mv_daily_pageviews', 'mv_hourly_performance'];

    console.log('\n💾 验证物化视图...');
    for (const mv of materializedViews) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_matviews
          WHERE schemaname = 'public'
          AND matviewname = '${mv}'
        );
      `);

      if (result.rows[0].exists) {
        console.log(`   ✅ ${mv} 物化视图存在`);
      } else {
        console.log(`   ❌ ${mv} 物化视图不存在`);
      }
    }

    // 验证函数
    const functions = [
      'refresh_mv_daily_pageviews',
      'refresh_mv_hourly_performance',
      'cleanup_old_analytics_data',
    ];

    console.log('\n🔧 验证函数...');
    for (const func of functions) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = '${func}'
          AND n.nspname = 'public'
        );
      `);

      if (result.rows[0].exists) {
        console.log(`   ✅ ${func} 函数存在`);
      } else {
        console.log(`   ❌ ${func} 函数不存在`);
      }
    }

    // 验证角色
    const roles = ['analytics_readonly', 'analytics_writer', 'analytics_admin'];

    console.log('\n🔐 验证角色...');
    for (const role of roles) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_roles
          WHERE rolname = '${role}'
        );
      `);

      if (result.rows[0].exists) {
        console.log(`   ✅ ${role} 角色存在`);
      } else {
        console.log(`   ❌ ${role} 角色不存在`);
      }
    }

    // 验证索引数量
    const indexResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename LIKE 'analytics%'
    `);

    console.log('\n📑 索引统计...');
    console.log(`   📊 analytics 相关表索引数：${indexResult.rows[0].count}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ 数据库架构验证完成！\n');
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// 如果直接运行
if (require.main === module) {
  verifyDatabaseSchema().catch(console.error);
}

module.exports = { verifyDatabaseSchema };
