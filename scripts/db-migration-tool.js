#!/usr/bin/env node

/**
 * 数据库迁移管理工具
 * 支持Flyway风格的版本化迁移管理
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    this.backupDir = path.join(__dirname, '..', 'backups', 'migrations');

    // 确保备份目录存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * 获取所有迁移文件
   */
  getAllMigrations() {
    if (!fs.existsSync(this.migrationsDir)) {
      return [];
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter(file => file.match(/^V\d+\.\d+__/) && file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const version = file.match(/^V(\d+\.\d+)/)[1];
      const description = file.replace(/^V\d+\.\d+__/, '').replace('.sql', '');
      return { file, version, description };
    });
  }

  /**
   * 获取待执行的迁移
   */
  getPendingMigrations() {
    const allMigrations = this.getAllMigrations();
    // 在实际环境中，这里应该查询数据库获取已执行的迁移
    // 暂时假设没有迁移已执行
    return allMigrations;
  }

  /**
   * 执行迁移
   */
  async executeMigration(migrationFile, dryRun = false) {
    const migrationPath = path.join(this.migrationsDir, migrationFile);

    console.log(`\n🚀 执行迁移: ${migrationFile}`);

    if (dryRun) {
      console.log('🔍 语法检查模式...');
      // 执行语法检查
      const result = spawnSync('supabase', ['db', 'check'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
      });

      if (result.status === 0) {
        console.log('✅ 语法检查通过');
        return { success: true, dryRun: true };
      } else {
        console.log('❌ 语法检查失败');
        console.log(result.stderr.toString());
        return { success: false, error: result.stderr.toString() };
      }
    } else {
      // 实际执行迁移
      console.log('🔄 执行数据库迁移...');

      const result = spawnSync('supabase', ['db', 'push'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });

      if (result.status === 0) {
        console.log('✅ 迁移执行成功');
        return { success: true };
      } else {
        console.log('❌ 迁移执行失败');
        return { success: false, error: result.error?.message };
      }
    }
  }

  /**
   * 执行所有待处理迁移
   */
  async executeAllMigrations(dryRun = false) {
    const pendingMigrations = this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('✅ 没有待执行的迁移');
      return { success: true, executed: 0 };
    }

    console.log(`\n📋 发现 ${pendingMigrations.length} 个待执行迁移:`);
    pendingMigrations.forEach(m => {
      console.log(`  - V${m.version} ${m.description}`);
    });

    let executed = 0;
    let failed = 0;

    for (const migration of pendingMigrations) {
      try {
        const result = await this.executeMigration(migration.file, dryRun);
        if (result.success) {
          executed++;
        } else {
          failed++;
          if (!dryRun) {
            console.log(`❌ 迁移失败，停止执行: ${migration.file}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ 执行迁移时出错: ${error.message}`);
        failed++;
        if (!dryRun) break;
      }
    }

    console.log(`\n📊 迁移执行结果:`);
    console.log(`   成功: ${executed}`);
    console.log(`   失败: ${failed}`);
    console.log(`   总计: ${pendingMigrations.length}`);

    return {
      success: failed === 0,
      executed,
      failed,
      total: pendingMigrations.length,
    };
  }

  /**
   * 创建新迁移文件
   */
  createMigration(version, description, content = '') {
    const fileName = `V${version}__${description.replace(/\s+/g, '_')}.sql`;
    const filePath = path.join(this.migrationsDir, fileName);

    const template = `-- ${fileName}
-- ${description}
-- 创建时间: ${new Date().toISOString().split('T')[0]}
-- 版本: ${version}

${content}

\\echo '✅ 迁移 ${fileName} 执行完成'
`;

    if (fs.existsSync(filePath)) {
      throw new Error(`迁移文件已存在: ${filePath}`);
    }

    fs.writeFileSync(filePath, template);
    console.log(`✅ 迁移文件创建成功: ${filePath}`);

    return filePath;
  }

  /**
   * 验证迁移文件语法
   */
  validateMigrationSyntax() {
    console.log('🔍 验证所有迁移文件语法...');

    const migrations = this.getAllMigrations();
    let valid = 0;
    let invalid = 0;

    for (const migration of migrations) {
      const filePath = path.join(this.migrationsDir, migration.file);
      try {
        // 简单的语法检查：确保文件以正确的格式开头
        const content = fs.readFileSync(filePath, 'utf8');

        if (!content.startsWith('-- V') || !content.includes('\\echo')) {
          console.log(`❌ 格式错误: ${migration.file}`);
          invalid++;
        } else {
          console.log(`✅ 格式正确: ${migration.file}`);
          valid++;
        }
      } catch (error) {
        console.log(`❌ 读取失败: ${migration.file} - ${error.message}`);
        invalid++;
      }
    }

    console.log(`\n📊 语法验证结果:`);
    console.log(`   有效: ${valid}`);
    console.log(`   无效: ${invalid}`);
    console.log(`   总计: ${migrations.length}`);

    return invalid === 0;
  }

  /**
   * 生成迁移状态报告
   */
  generateStatusReport() {
    const migrations = this.getAllMigrations();
    const pending = this.getPendingMigrations();

    const report = {
      timestamp: new Date().toISOString(),
      totalMigrations: migrations.length,
      pendingMigrations: pending.length,
      executedMigrations: migrations.length - pending.length,
      migrations: migrations.map(m => ({
        ...m,
        status: pending.some(p => p.file === m.file) ? 'pending' : 'executed',
      })),
    };

    const reportPath = path.join(
      this.backupDir,
      `migration-status-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 迁移状态报告:`);
    console.log(`   总迁移数: ${report.totalMigrations}`);
    console.log(`   待执行: ${report.pendingMigrations}`);
    console.log(`   已执行: ${report.executedMigrations}`);
    console.log(`   报告文件: ${reportPath}`);

    return report;
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const manager = new MigrationManager();

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
数据库迁移管理工具

用法:
  node scripts/db-migration-tool.js [命令] [选项]

命令:
  status              显示迁移状态
  validate            验证迁移文件语法
  execute             执行待处理迁移
  execute --dry-run   语法检查模式执行
  create <version> <description>  创建新迁移文件
  report              生成详细状态报告

示例:
  node scripts/db-migration-tool.js status
  node scripts/db-migration-tool.js validate
  node scripts/db-migration-tool.js execute --dry-run
  node scripts/db-migration-tool.js create 2.0 "add_user_preferences"
    `);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'status':
        manager.generateStatusReport();
        break;

      case 'validate':
        const isValid = manager.validateMigrationSyntax();
        process.exit(isValid ? 0 : 1);
        break;

      case 'execute':
        const dryRun = args.includes('--dry-run');
        const result = await manager.executeAllMigrations(dryRun);
        process.exit(result.success ? 0 : 1);
        break;

      case 'create':
        if (args.length < 3) {
          console.log('错误: 需要提供版本号和描述');
          process.exit(1);
        }
        const version = args[1];
        const description = args[2];
        manager.createMigration(version, description);
        break;

      case 'report':
        manager.generateStatusReport();
        break;

      default:
        console.log(`未知命令: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationManager;
