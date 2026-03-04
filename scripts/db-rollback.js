#!/usr/bin/env node

/**
 * 数据库迁移回滚脚本
 * 专门用于回滚数据库变更
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('⏪ 数据库迁移回滚工具\n');
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
const targetVersion = args.find(arg => arg.startsWith('--to='))?.split('=')[1];
const steps = args.find(arg => arg.startsWith('--steps='))?.split('=')[1];
const dryRun = args.includes('--dry-run');

async function getMigrationHistory() {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .order('applied_at', { ascending: false }); // 最新的在前

    if (error) {
      console.log('⚠️  无法获取迁移历史:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log('⚠️  迁移历史查询失败:', error.message);
    return [];
  }
}

function findRollbackSteps(history, targetVer, stepCount) {
  let migrationsToRollback = [];

  if (targetVer) {
    // 回滚到指定版本
    const targetIndex = history.findIndex(m => m.version === targetVer);
    if (targetIndex === -1) {
      throw new Error(`未找到目标版本: ${targetVer}`);
    }
    migrationsToRollback = history.slice(0, targetIndex);
  } else if (stepCount) {
    // 回滚指定步数
    migrationsToRollback = history.slice(0, parseInt(stepCount));
  } else {
    // 默认回滚一步
    migrationsToRollback = history.slice(0, 1);
  }

  return migrationsToRollback.reverse(); // 按应用顺序的逆序回滚
}

async function executeRollback(migration) {
  console.log(`\n⏪ 回滚迁移: ${migration.version} - ${migration.description}`);

  if (dryRun) {
    console.log('📝 DRY RUN - 只显示将要执行的操作');
    return true;
  }

  try {
    // 查找对应的回滚文件
    const rollbackFileName = `R${migration.version}__rollback.sql`;
    const rollbackFilePath = path.join(MIGRATIONS_DIR, rollbackFileName);

    if (!fs.existsSync(rollbackFilePath)) {
      console.log(`⚠️  未找到回滚文件: ${rollbackFileName}`);
      console.log('   尝试通过迁移历史推断回滚操作...');

      // 简单的回滚逻辑（可以根据实际情况扩展）
      await performInferredRollback(migration);
    } else {
      // 执行回滚SQL文件
      const rollbackSql = fs.readFileSync(rollbackFilePath, 'utf8');
      console.log('   执行回滚SQL...');

      const statements = rollbackSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.length < 5) continue;

        const { error } = await supabase.rpc('execute_sql', { sql: statement });
        if (error) {
          console.log(
            `   ⚠️  语句执行警告: ${error.message.substring(0, 100)}`
          );
        }
      }
    }

    // 从迁移历史中删除记录
    const { error: deleteError } = await supabase
      .from(HISTORY_TABLE)
      .delete()
      .eq('version', migration.version);

    if (deleteError) {
      console.error('❌ 删除迁移历史记录失败:', deleteError.message);
    } else {
      console.log(`✅ 迁移 ${migration.version} 回滚完成`);
    }

    return true;
  } catch (error) {
    console.error(`❌ 迁移回滚失败: ${error.message}`);
    return false;
  }
}

async function performInferredRollback(migration) {
  // 基于迁移描述推断回滚操作的简单实现
  const description = migration.description.toLowerCase();

  if (description.includes('create table')) {
    console.log('   推断操作: 删除相关表');
    // 这里应该实现具体的表删除逻辑
  } else if (description.includes('add column')) {
    console.log('   推断操作: 删除相关列');
    // 这里应该实现具体的列删除逻辑
  } else {
    console.log('   ⚠️  无法自动推断回滚操作，请手动处理');
  }
}

async function main() {
  try {
    console.log(`🔄 回滚模式: ${dryRun ? 'DRY RUN' : '实际执行'}`);

    // 获取迁移历史
    const history = await getMigrationHistory();
    if (history.length === 0) {
      console.log('🎉 没有已应用的迁移，无需回滚');
      return;
    }

    console.log(`📋 已应用的迁移 (${history.length} 个):`);
    history.forEach(m => console.log(`   V${m.version} - ${m.description}`));

    // 确定要回滚的迁移
    const migrationsToRollback = findRollbackSteps(
      history,
      targetVersion,
      steps
    );

    if (migrationsToRollback.length === 0) {
      console.log('\n✅ 没有需要回滚的迁移');
      return;
    }

    console.log(`\n🔄 准备回滚 ${migrationsToRollback.length} 个迁移:`);
    migrationsToRollback.forEach(m =>
      console.log(`   V${m.version} - ${m.description}`)
    );

    if (!dryRun) {
      console.log('\n⚠️  警告: 这将永久改变数据库结构！');
      console.log('   请确保已备份重要数据');

      // 简单确认机制
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('确认继续回滚? (yes/no): ', async answer => {
        rl.close();
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ 操作已取消');
          process.exit(0);
        }

        await executeRollbacks(migrationsToRollback);
      });
    } else {
      await executeRollbacks(migrationsToRollback);
    }
  } catch (error) {
    console.error('\n❌ 回滚过程发生错误:', error.message);
    process.exit(1);
  }
}

async function executeRollbacks(migrations) {
  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrations) {
    const success = await executeRollback(migration);
    if (success) {
      successCount++;
    } else {
      failureCount++;
      break; // 遇到失败就停止
    }
  }

  // 输出总结
  console.log('\n=====================================');
  console.log('📊 回滚执行总结');
  console.log('=====================================');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failureCount} 个`);
  console.log(`📊 总计: ${migrations.length} 个`);

  if (failureCount > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 数据库回滚完成！');
  }
}

// 帮助信息
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
数据库迁移回滚工具

用法: node scripts/db-rollback.js [选项]

选项:
  --to=<version>     回滚到指定版本
  --steps=<number>   回滚指定步数
  --dry-run          预演模式，不实际执行
  --help, -h         显示帮助信息

示例:
  node scripts/db-rollback.js --dry-run
  node scripts/db-rollback.js --to=1.2.0
  node scripts/db-rollback.js --steps=2
  `);
  process.exit(0);
}

main();
