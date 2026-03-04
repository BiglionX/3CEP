#!/usr/bin/env node

/**
 * 数据库迁移状态查看脚本
 * 显示当前数据库状态和待执行迁移
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('📊 FixCycle 数据库迁移状态\n');
console.log('=====================================\n');

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 迁移目录配置
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const HISTORY_TABLE = 'schema_migrations';

async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .order('applied_at', { ascending: true });

    if (error) {
      console.log('⚠️  无法获取迁移历史，假设没有迁移已应用');
      return [];
    }

    return data;
  } catch (error) {
    console.log('⚠️  迁移历史查询失败，返回空数组');
    return [];
  }
}

function getAllMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ 迁移目录不存在: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const migrations = [];
  const rollbacks = [];

  files.forEach(file => {
    if (file.startsWith('V')) {
      const version = file.split('__')[0].substring(1);
      const description = file.split('__')[1]?.replace('.sql', '') || '';
      migrations.push({ file, version, description, type: 'forward' });
    } else if (file.startsWith('U')) {
      const version = file.split('__')[0].substring(1);
      const description = file.split('__')[1]?.replace('.sql', '') || '';
      rollbacks.push({ file, version, description, type: 'rollback' });
    }
  });

  return { migrations, rollbacks };
}

function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0] || 0),
    minor: parseInt(parts[1] || 0),
    patch: parseInt(parts[2] || 0),
  };
}

function compareVersions(v1, v2) {
  const ver1 = parseVersion(v1);
  const ver2 = parseVersion(v2);

  if (ver1.major !== ver2.major) {
    return ver1.major - ver2.major;
  }
  if (ver1.minor !== ver2.minor) {
    return ver1.minor - ver2.minor;
  }
  return ver1.patch - ver2.patch;
}

function getVersionStatus(appliedMigrations, allMigrations) {
  const appliedVersions = appliedMigrations.map(m => m.version);
  const allVersions = allMigrations.map(m => m.version);

  const status = {
    current:
      appliedVersions.length > 0
        ? appliedVersions[appliedVersions.length - 1]
        : '0.0.0',
    latest:
      allVersions.length > 0 ? allVersions[allVersions.length - 1] : '0.0.0',
    upToDate: appliedVersions.length === allVersions.length,
    pendingCount: 0,
    failedCount: 0,
  };

  status.pendingCount = allMigrations.filter(
    m => !appliedVersions.includes(m.version)
  ).length;

  status.failedCount = appliedMigrations.filter(m => !m.success).length;

  return status;
}

async function checkDatabaseConnectivity() {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('count()', { count: 'exact' })
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}

async function getDatabaseInfo() {
  try {
    // 获取数据库基本信息
    const info = {
      tables: [],
      extensions: [],
    };

    // 获取表信息
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tables) {
      info.tables = tables.map(t => ({
        name: t.table_name,
        type: t.table_type,
      }));
    }

    // 获取扩展信息
    const { data: extensions } = await supabase
      .from('pg_extension')
      .select('extname, extversion');

    if (extensions) {
      info.extensions = extensions.map(e => ({
        name: e.extname,
        version: e.extversion,
      }));
    }

    return info;
  } catch (error) {
    console.log('⚠️  无法获取数据库详细信息');
    return { tables: [], extensions: [] };
  }
}

async function main() {
  try {
    // 检查数据库连接
    console.log('🔌 检查数据库连接...');
    const isConnected = await checkDatabaseConnectivity();

    if (!isConnected) {
      console.log('❌ 数据库连接失败');
      process.exit(1);
    }
    console.log('✅ 数据库连接正常\n');

    // 获取迁移状态
    const appliedMigrations = await getAppliedMigrations();
    const { migrations: allMigrations, rollbacks: allRollbacks } =
      getAllMigrationFiles();

    const status = getVersionStatus(appliedMigrations, allMigrations);

    // 显示版本信息
    console.log('📈 版本状态:');
    console.log(`   当前版本: V${status.current}`);
    console.log(`   最新版本: V${status.latest}`);
    console.log(`   状态: ${status.upToDate ? '✅ 最新' : '⏳ 需要更新'}`);
    console.log(`   待执行: ${status.pendingCount} 个迁移`);
    console.log(`   失败记录: ${status.failedCount} 个\n`);

    // 显示已应用的迁移
    console.log('📋 已应用的迁移:');
    if (appliedMigrations.length === 0) {
      console.log('   (暂无已应用的迁移)');
    } else {
      appliedMigrations.forEach(migration => {
        const statusIcon = migration.success ? '✅' : '❌';
        const timeInfo = migration.execution_time
          ? `(${migration.execution_time}ms)`
          : '';
        console.log(
          `   ${statusIcon} V${migration.version} - ${migration.description} ${timeInfo}`
        );
        if (!migration.success && migration.error_message) {
          console.log(
            `      错误: ${migration.error_message.substring(0, 100)}...`
          );
        }
      });
    }

    // 显示待执行的迁移
    const appliedVersions = appliedMigrations.map(m => m.version);
    const pendingMigrations = allMigrations.filter(
      m => !appliedVersions.includes(m.version)
    );

    if (pendingMigrations.length > 0) {
      console.log('\n⏳ 待执行的迁移:');
      pendingMigrations.forEach(m => {
        console.log(`   ◻️  V${m.version} - ${m.description}`);
      });
    }

    // 显示回滚信息
    if (allRollbacks.length > 0) {
      console.log('\n↩️  可用的回滚脚本:');
      const rollbackMap = {};
      allRollbacks.forEach(r => {
        if (!rollbackMap[r.version]) rollbackMap[r.version] = [];
        rollbackMap[r.version].push(r.description);
      });

      Object.keys(rollbackMap)
        .sort(compareVersions)
        .forEach(version => {
          const hasApplied = appliedVersions.includes(version);
          const statusIcon = hasApplied ? '✅' : '◻️';
          console.log(`   ${statusIcon} V${version}`);
          rollbackMap[version].forEach(desc => {
            console.log(`      - ${desc}`);
          });
        });
    }

    // 显示数据库信息
    console.log('\n🗄️  数据库概览:');
    const dbInfo = await getDatabaseInfo();

    console.log(`   表数量: ${dbInfo.tables.length}`);
    if (dbInfo.tables.length > 0) {
      const userTables = dbInfo.tables.filter(t => t.type === 'BASE TABLE');
      const viewTables = dbInfo.tables.filter(t => t.type === 'VIEW');
      console.log(`      基础表: ${userTables.length} 个`);
      console.log(`      视图: ${viewTables.length} 个`);
    }

    console.log(`   扩展数量: ${dbInfo.extensions.length}`);
    if (dbInfo.extensions.length > 0) {
      const extNames = dbInfo.extensions.map(e => e.name).join(', ');
      console.log(`      已加载: ${extNames}`);
    }

    // 显示操作建议
    console.log('\n💡 操作建议:');
    if (status.pendingCount > 0) {
      console.log(`   执行迁移: npm run db:migrate`);
      if (status.pendingCount === 1) {
        console.log(
          `   或指定版本: npm run db:migrate -- --version=${pendingMigrations[0].version}`
        );
      }
    }

    if (appliedMigrations.length > 0) {
      const lastVersion =
        appliedMigrations[appliedMigrations.length - 1].version;
      console.log(`   回滚最近迁移: npm run db:rollback -- --steps=1`);
      console.log(`   回滚到版本: npm run db:rollback -- --to=${lastVersion}`);
    }

    if (status.failedCount > 0) {
      console.log('   ⚠️  存在失败的迁移记录，建议检查并修复');
    }

    console.log('\n✨ 状态检查完成！');
  } catch (error) {
    console.error('\n❌ 状态检查失败:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});
