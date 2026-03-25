/**
 * 数据中心表依赖检测工具
 *
 * 用途：检测数据中心功能所需的数据库表是否已创建
 * 执行方式：node scripts/check-datacenter-tables.js
 */

const { Client } = require('pg');
require('dotenv').config();

// 定义需要检测的表
const REQUIRED_TABLES = {
  设备管理模块: [
    'devices', // 设备信息表
    'device_profiles', // 设备档案表
    'device_lifecycle_events', // 设备生命周期事件表
    'crowdfunding_pledges', // 众筹承诺表
    'repair_orders', // 维修订单表
    'parts', // 配件库表
    'fault_types', // 故障类型表
    'repair_shops', // 维修店铺表
  ],
  用户与权限模块: [
    'admin_users', // 管理员用户表
    'user_profiles', // 用户档案表
    'tenants', // 租户表
    'user_tenants', // 用户租户关联表
    'roles', // 角色表
    'permissions', // 权限表
    'user_roles', // 用户角色关联表
    'role_permissions', // 角色权限关联表
  ],
  数据中心模块: [
    'data_sources', // 数据源表
    'data_assets', // 数据资产表
    'metadata_registry', // 元数据注册表
    'data_quality_rules', // 数据质量规则表
    'data_lineage', // 数据血缘表
  ],
};

async function checkDatabaseTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 获取所有已存在的表
    const existingTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const existingResult = await client.query(existingTablesQuery);
    const existingTables = new Set(
      existingResult.rows.map(row => row.table_name)
    );

    console.log(`📊 当前数据库中共有 ${existingTables.size} 张表\n`);

    let totalRequired = 0;
    let totalExists = 0;
    const missingTables = [];

    // 按模块检测
    for (const [moduleName, tables] of Object.entries(REQUIRED_TABLES)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 ${moduleName}`);
      console.log('='.repeat(60));

      totalRequired += tables.length;

      for (const tableName of tables) {
        const exists = existingTables.has(tableName);

        if (exists) {
          totalExists++;

          // 获取表的详细信息
          const tableInfoQuery = `
            SELECT
              COALESCE(ps.reltuples, 0)::BIGINT as row_count,
              EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                WHERE tc.table_name = $1
                  AND tc.constraint_type = 'PRIMARY KEY'
              ) as has_primary_key,
              pg_stat_get_last_analyze_time(c.oid) as last_analyzed
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = $1
              AND n.nspname = 'public';
          `;

          const tableInfo = await client.query(tableInfoQuery, [tableName]);
          const info = tableInfo.rows[0];

          const status = info.row_count > 0 ? '✅ 正常' : '⚠️ 空表';
          console.log(
            `  ✓ ${tableName.padEnd(35)} ${status} (${info.row_count.toLocaleString()} 行)`
          );
        } else {
          console.log(`  ✗ ${tableName.padEnd(35)} ❌ 不存在`);
          missingTables.push({ module: moduleName, table: tableName });
        }
      }
    }

    // 显示统计信息
    console.log(`\n${'='.repeat(60)}`);
    console.log('📈 统计信息');
    console.log('='.repeat(60));
    console.log(`总需表数：${totalRequired}`);
    console.log(
      `已存在：${totalExists} (${((totalExists / totalRequired) * 100).toFixed(1)}%)`
    );
    console.log(
      `缺失：${missingTables.length} (${((missingTables.length / totalRequired) * 100).toFixed(1)}%)`
    );

    // 显示缺失的表
    if (missingTables.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('⚠️ 缺失或需要创建的表');
      console.log('='.repeat(60));

      const tablesByModule = {};
      missingTables.forEach(({ module, table }) => {
        if (!tablesByModule[module]) {
          tablesByModule[module] = [];
        }
        tablesByModule[module].push(table);
      });

      for (const [module, tables] of Object.entries(tablesByModule)) {
        console.log(`\n${module}:`);
        tables.forEach(table => {
          console.log(`  - ${table}`);
        });
      }

      console.log(`\n💡 建议：请先运行相关的数据库迁移脚本创建这些表`);
    } else {
      console.log(`\n✅ 所有必需的表都已存在!`);
    }

    // RLS 策略检查
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔒 RLS (行级安全) 策略检查');
    console.log('='.repeat(60));

    const rlsQuery = `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;

    const rlsResult = await client.query(rlsQuery);

    if (rlsResult.rows.length > 0) {
      console.log(`发现 ${rlsResult.rows.length} 个 RLS 策略:`);
      rlsResult.rows.forEach(policy => {
        console.log(
          `  • ${policy.tablename}.${policy.policyname} (${policy.cmd})`
        );
      });
    } else {
      console.log('  ⚠️ 未发现 RLS 策略');
    }

    // 索引检查
    console.log(`\n${'='.repeat(60)}`);
    console.log('📇 索引使用情况');
    console.log('='.repeat(60));

    const indexQuery = `
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
      LIMIT 20;
    `;

    const indexResult = await client.query(indexQuery);

    if (indexResult.rows.length > 0) {
      console.log(`前 20 个索引:`);
      indexResult.rows.forEach(idx => {
        console.log(`  • ${idx.tablename}.${idx.indexname}`);
      });
    } else {
      console.log('  ⚠️ 未发现索引');
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ 检测完成!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ 检测失败:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDatabaseTables()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkDatabaseTables, REQUIRED_TABLES };
