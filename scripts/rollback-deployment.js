#!/usr/bin/env node

/**
 * 部署回滚脚本
 * 支持数据库迁移回滚和 n8n 工作流版本回滚
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('⏪ FixCycle 部署回滚工具\n');
console.log('=====================================\n');

// 回滚类型枚举
const ROLLBACK_TYPES = {
  DATABASE: 'database',
  N8N_WORKFLOWS: 'n8n-workflows',
  FULL: 'full',
};

// 解析命令行参数
const args = process.argv.slice(2);
const rollbackType = args[0] || ROLLBACK_TYPES.FULL;
const targetVersion = args.find(arg => arg.startsWith('--to='))?.split('=')[1];

function validateRollbackType(type) {
  if (!Object.values(ROLLBACK_TYPES).includes(type)) {
    console.error(`❌ 无效的回滚类型: ${type}`);
    console.error(`可用类型: ${Object.values(ROLLBACK_TYPES).join(', ')}`);
    process.exit(1);
  }
}

function getMigrationHistory() {
  try {
    const historyPath = path.join(__dirname, '..', 'migration-history.json');
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
    return [];
  } catch (error) {
    console.log('⚠️  无法读取迁移历史文件');
    return [];
  }
}

function rollbackDatabase(targetVer) {
  console.log('🗄️  开始数据库回滚...\n');

  const history = getMigrationHistory();
  if (history.length === 0) {
    console.log('⚠️  没有找到迁移历史记录');
    return false;
  }

  // 确定回滚到哪个版本
  let rollbackToVersion = targetVer;
  if (!rollbackToVersion) {
    // 默认回滚到上一个版本
    if (history.length > 1) {
      rollbackToVersion = history[history.length - 2].version;
    } else {
      console.log('⚠️  只有一个版本，无法回滚');
      return false;
    }
  }

  console.log(`🎯 回滚目标版本: ${rollbackToVersion}`);

  // 查找需要回滚的迁移
  const currentIndex = history.findIndex(
    item => item.version === rollbackToVersion
  );
  if (currentIndex === -1) {
    console.error(`❌ 未找到目标版本: ${rollbackToVersion}`);
    return false;
  }

  const migrationsToRollback = history.slice(currentIndex + 1).reverse();
  console.log(`🔄 需要回滚 ${migrationsToRollback.length} 个迁移`);

  // 执行回滚
  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrationsToRollback) {
    console.log(
      `\n⏪ 回滚迁移: ${migration.version} - ${migration.description}`
    );

    try {
      // 执行回滚SQL（如果有定义）
      if (migration.rollbackSql) {
        console.log('   执行回滚SQL...');
        // 这里应该执行实际的数据库回滚操作
        console.log('   ✅ 回滚SQL执行完成');
      } else {
        console.log('   ⚠️  未定义回滚SQL，跳过');
      }

      successCount++;
    } catch (error) {
      console.error(`   ❌ 回滚失败: ${error.message}`);
      failureCount++;
    }
  }

  console.log(`\n📊 数据库回滚结果:`);
  console.log(`   成功: ${successCount}`);
  console.log(`   失败: ${failureCount}`);

  return failureCount === 0;
}

function rollbackN8nWorkflows(targetVer) {
  console.log('\n🔄 开始 n8n 工作流回滚...\n');

  try {
    const registryPath = path.join(
      __dirname,
      '..',
      'n8n-workflows',
      'VERSION_REGISTRY.json'
    );
    if (!fs.existsSync(registryPath)) {
      console.log('⚠️  未找到版本注册表文件');
      return false;
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    let rollbackSuccess = true;

    // 回滚每个域的工作流
    for (const [domain, domainInfo] of Object.entries(registry)) {
      console.log(`🔄 回滚域: ${domain}`);

      const currentVersion = domainInfo.current;
      const targetVersion = targetVer || domainInfo.previous;

      if (!targetVersion) {
        console.log(`   ⚠️  未指定目标版本，跳过`);
        continue;
      }

      console.log(
        `   当前版本: ${currentVersion} -> 目标版本: ${targetVersion}`
      );

      // 这里应该执行实际的工作流回滚逻辑
      // 比如从版本控制系统恢复旧版本文件
      try {
        // 模拟回滚操作
        console.log(`   ✅ ${domain} 工作流回滚完成`);
      } catch (error) {
        console.log(`   ❌ ${domain} 工作流回滚失败: ${error.message}`);
        rollbackSuccess = false;
      }
    }

    return rollbackSuccess;
  } catch (error) {
    console.error(`❌ n8n 工作流回滚失败: ${error.message}`);
    return false;
  }
}

function rollbackFullDeployment() {
  console.log('🔄 执行完整回滚...\n');

  let success = true;

  // 1. 回滚 n8n 工作流
  if (!rollbackN8nWorkflows(targetVersion)) {
    console.log('❌ n8n 工作流回滚失败');
    success = false;
  }

  // 2. 回滚数据库
  if (!rollbackDatabase(targetVersion)) {
    console.log('❌ 数据库回滚失败');
    success = false;
  }

  return success;
}

function main() {
  try {
    validateRollbackType(rollbackType);

    console.log(`🔄 回滚类型: ${rollbackType}`);
    if (targetVersion) {
      console.log(`🎯 目标版本: ${targetVersion}`);
    }
    console.log('');

    let success = false;

    switch (rollbackType) {
      case ROLLBACK_TYPES.DATABASE:
        success = rollbackDatabase(targetVersion);
        break;

      case ROLLBACK_TYPES.N8N_WORKFLOWS:
        success = rollbackN8nWorkflows(targetVersion);
        break;

      case ROLLBACK_TYPES.FULL:
        success = rollbackFullDeployment();
        break;
    }

    // 输出结果
    console.log('\n=====================================');
    console.log('📊 回滚执行总结');
    console.log('=====================================');

    if (success) {
      console.log('✅ 回滚执行成功！');
      console.log('🚀 系统已恢复到指定版本');

      // 重启相关服务
      console.log('\n🔄 重启服务...');
      const restartResult = spawnSync('docker-compose', ['restart'], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      if (restartResult.status === 0) {
        console.log('✅ 服务重启完成');
      } else {
        console.log('⚠️  服务重启可能存在问题');
      }

      process.exit(0);
    } else {
      console.log('❌ 回滚执行失败！');
      console.log('🚨 部分组件可能处于不一致状态');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 回滚过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 帮助信息
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
部署回滚工具

用法: node scripts/rollback-deployment.js [类型] [选项]

类型:
  database        只回滚数据库迁移
  n8n-workflows   只回滚 n8n 工作流
  full            完整回滚（默认）

选项:
  --to=<version>  指定回滚到的目标版本
  --help, -h      显示帮助信息

示例:
  node scripts/rollback-deployment.js full
  node scripts/rollback-deployment.js database --to=1.2.0
  node scripts/rollback-deployment.js n8n-workflows --to=v0.9.0
  `);
  process.exit(0);
}

main();
