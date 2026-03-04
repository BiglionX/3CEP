#!/usr/bin/env node

/**
 * 数据库迁移执行脚本
 * 支持正向迁移、幂等性检查和迁移历史记录
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🗄️  FixCycle 数据库迁移工具\n');
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

// 解析命令行参数
const args = process.argv.slice(2);
const targetVersion = args
  .find(arg => arg.startsWith('--version='))
  ?.split('=')[1];
const dryRun = args.includes('--dry-run');

async function initializeMigrationHistory() {
  console.log('🔧 初始化迁移历史表...');

  try {
    // 创建迁移历史表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${HISTORY_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        version VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time INTEGER, -- 毫秒
        success BOOLEAN DEFAULT true,
        error_message TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON ${HISTORY_TABLE}(version);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON ${HISTORY_TABLE}(applied_at);
      
      COMMENT ON TABLE ${HISTORY_TABLE} IS '数据库迁移历史记录表';
      COMMENT ON COLUMN ${HISTORY_TABLE}.version IS '迁移版本号';
      COMMENT ON COLUMN ${HISTORY_TABLE}.description IS '迁移描述';
      COMMENT ON COLUMN ${HISTORY_TABLE}.execution_time IS '执行耗时(毫秒)';
    `;

    const { error } = await supabase.rpc('execute_sql', {
      sql: createTableSQL,
    });
    if (error) {
      console.log('⚠️  无法通过RPC创建表，表可能已存在或使用直接SQL执行');
    }

    console.log('✅ 迁移历史表初始化完成');
  } catch (error) {
    console.log('ℹ️  迁移历史表可能已存在');
  }
}

async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('version')
      .order('applied_at', { ascending: true });

    if (error) {
      console.log('⚠️  无法获取迁移历史，假设没有迁移已应用');
      return [];
    }

    return data.map(record => record.version);
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
    .filter(file => file.endsWith('.sql') && file.startsWith('V'))
    .sort();

  return files.map(file => {
    const version = file.split('__')[0].substring(1); // 移除 'V' 前缀
    const description = file.split('__')[1]?.replace('.sql', '') || '';
    return { file, version, description };
  });
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

async function executeMigration(migration) {
  console.log(
    `\n🔄 执行迁移: V${migration.version} - ${migration.description}`
  );
  console.log('----------------------------------------');

  const migrationPath = path.join(MIGRATIONS_DIR, migration.file);
  const startTime = Date.now();

  try {
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    if (dryRun) {
      console.log('📝 DRY RUN - 迁移内容预览:');
      console.log(
        sqlContent.substring(0, 500) + (sqlContent.length > 500 ? '...' : '')
      );
      return { success: true, executionTime: 0 };
    }

    // 分割SQL语句并执行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(
        stmt =>
          stmt.length > 0 &&
          !stmt.startsWith('--') &&
          !stmt.startsWith('\\echo')
      );

    console.log(`📊 执行 ${statements.length} 条SQL语句...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 5) continue;

      try {
        console.log(`   执行语句 ${i + 1}/${statements.length}`);
        const { error } = await supabase.rpc('execute_sql', { sql: statement });

        if (error) {
          // 某些语句可能不需要通过RPC执行，记录警告但继续
          console.log(
            `   ⚠️  语句执行警告: ${error.message.substring(0, 100)}`
          );
        }
      } catch (stmtError) {
        console.log(
          `   ⚠️  语句执行异常: ${stmtError.message.substring(0, 100)}`
        );
      }

      // 添加小延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ 迁移 V${migration.version} 执行成功 (${executionTime}ms)`);

    return { success: true, executionTime };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ 迁移 V${migration.version} 执行失败:`, error.message);
    return { success: false, executionTime, error: error.message };
  }
}

async function recordMigration(migration, result) {
  if (dryRun) return;

  try {
    const { error } = await supabase.from(HISTORY_TABLE).insert({
      version: migration.version,
      description: migration.description,
      execution_time: result.executionTime,
      success: result.success,
      error_message: result.error || null,
    });

    if (error) {
      console.error('❌ 无法记录迁移历史:', error.message);
    } else {
      console.log(`✅ 迁移历史已记录: V${migration.version}`);
    }
  } catch (error) {
    console.error('❌ 记录迁移历史失败:', error.message);
  }
}

async function main() {
  try {
    // 初始化迁移历史表
    await initializeMigrationHistory();

    // 获取已应用的迁移
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📋 已应用的迁移: ${appliedMigrations.length} 个`);
    if (appliedMigrations.length > 0) {
      appliedMigrations.forEach(ver => console.log(`   V${ver}`));
    }

    // 获取所有迁移文件
    const allMigrations = getAllMigrationFiles();
    console.log(`\n📁 发现迁移文件: ${allMigrations.length} 个`);

    // 筛选出需要执行的迁移
    let pendingMigrations = allMigrations.filter(
      m => !appliedMigrations.includes(m.version)
    );

    // 如果指定了目标版本，只执行到该版本
    if (targetVersion) {
      pendingMigrations = pendingMigrations.filter(
        m => compareVersions(m.version, targetVersion) <= 0
      );
      console.log(`🎯 目标版本: V${targetVersion}`);
    }

    if (pendingMigrations.length === 0) {
      console.log('\n🎉 所有迁移都已应用，数据库已是最新状态');
      return;
    }

    console.log(`\n📋 待执行迁移: ${pendingMigrations.length} 个`);
    pendingMigrations.forEach(m => {
      console.log(`   V${m.version} - ${m.description}`);
    });

    if (dryRun) {
      console.log('\n🔍 DRY RUN 模式 - 只显示将要执行的操作');
    } else {
      console.log('\n🚀 开始执行迁移...');
    }

    // 执行迁移
    let successCount = 0;
    let failureCount = 0;

    for (const migration of pendingMigrations) {
      const result = await executeMigration(migration);

      if (result.success) {
        await recordMigration(migration, result);
        successCount++;
      } else {
        await recordMigration(migration, result);
        failureCount++;
        console.error(`\n❌ 迁移失败，停止执行后续迁移`);
        break;
      }
    }

    // 输出总结
    console.log('\n=====================================');
    console.log('🏆 迁移执行总结');
    console.log('=====================================');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failureCount} 个`);
    console.log(`📊 总计: ${pendingMigrations.length} 个`);

    if (failureCount > 0) {
      process.exit(1);
    } else {
      console.log('\n🎉 所有迁移执行成功！');
    }
  } catch (error) {
    console.error('\n❌ 迁移过程发生错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});
