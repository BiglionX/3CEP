// 数据库备份脚本
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class DatabaseBackup {
  constructor(databaseUrl, backupDir = './backups') {
    this.databaseUrl = databaseUrl;
    this.backupDir = backupDir;
  }

  async createBackupDir() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`📁 创建备份目录: ${this.backupDir}`);
    }
  }

  async createBackup(options = {}) {
    const {
      includeData = true,
      includeSchema = true,
      compress = true,
    } = options;

    await this.createBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}${compress ? '.sql.gz' : '.sql'}`;
    const filepath = path.join(this.backupDir, filename);

    console.log(`💾 开始创建数据库备份: ${filename}`);

    let dumpCommand = `pg_dump "${this.databaseUrl}"`;

    // 构建pg_dump命令参数
    const args = [];

    if (includeSchema && includeData) {
      args.push('--verbose');
    } else if (includeSchema) {
      args.push('--schema-only');
    } else if (includeData) {
      args.push('--data-only');
    }

    args.push('--no-owner'); // 不包含对象所有权
    args.push('--no-privileges'); // 不包含权限

    dumpCommand += ` ${args.join(' ')}`;

    try {
      if (compress) {
        // 压缩备份
        const command = `${dumpCommand} | gzip > "${filepath}"`;
        await execAsync(command);
      } else {
        // 不压缩备份
        const command = `${dumpCommand} > "${filepath}"`;
        await execAsync(command);
      }

      // 获取文件大小
      const stats = await fs.stat(filepath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ 备份创建成功: ${filepath}`);
      console.log(`📊 文件大小: ${sizeInMB} MB`);
      console.log(`⏰ 创建时间: ${new Date().toLocaleString()}`);

      return {
        filepath,
        filename,
        size: stats.size,
        sizeFormatted: `${sizeInMB} MB`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 备份创建失败:', error.message);
      throw error;
    }
  }

  async listBackups() {
    try {
      await this.createBackupDir();
      const files = await fs.readdir(this.backupDir);

      const backups = [];
      for (const file of files) {
        if (
          file.startsWith('backup-') &&
          (file.endsWith('.sql') || file.endsWith('.sql.gz'))
        ) {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);

          backups.push({
            filename: file,
            filepath: filepath,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
          });
        }
      }

      // 按创建时间排序
      backups.sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      console.error('❌ 列出备份失败:', error.message);
      throw error;
    }
  }

  async cleanupOldBackups(maxAgeDays = 7, maxCount = 10) {
    console.log(`🧹 清理 ${maxAgeDays} 天前或超过 ${maxCount} 个的旧备份`);

    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      let deletedCount = 0;

      // 删除超过指定天数的备份
      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          await fs.unlink(backup.filepath);
          console.log(`🗑️  删除过期备份: ${backup.filename}`);
          deletedCount++;
        }
      }

      // 如果还有太多备份，删除最旧的
      const remainingBackups = await this.listBackups();
      if (remainingBackups.length > maxCount) {
        const backupsToDelete = remainingBackups.slice(maxCount);
        for (const backup of backupsToDelete) {
          await fs.unlink(backup.filepath);
          console.log(`🗑️  删除多余备份: ${backup.filename}`);
          deletedCount++;
        }
      }

      console.log(`✅ 清理完成，删除了 ${deletedCount} 个备份文件`);
      return deletedCount;
    } catch (error) {
      console.error('❌ 清理备份失败:', error.message);
      throw error;
    }
  }

  async restoreBackup(backupFile) {
    const filepath = path.isAbsolute(backupFile)
      ? backupFile
      : path.join(this.backupDir, backupFile);

    console.log(`🔄 开始恢复备份: ${filepath}`);

    try {
      // 检查备份文件是否存在
      await fs.access(filepath);

      let restoreCommand = `psql "${this.databaseUrl}"`;

      if (filepath.endsWith('.gz')) {
        // 解压并恢复
        restoreCommand = `gunzip -c "${filepath}" | psql "${this.databaseUrl}"`;
      } else {
        // 直接恢复
        restoreCommand = `psql "${this.databaseUrl}" -f "${filepath}"`;
      }

      await execAsync(restoreCommand);

      console.log(`✅ 备份恢复成功: ${filepath}`);
      return true;
    } catch (error) {
      console.error('❌ 备份恢复失败:', error.message);
      throw error;
    }
  }

  async scheduleDailyBackup() {
    // 这里可以集成到定时任务系统
    console.log('📅 设置每日备份计划...');

    // 示例：使用node-cron或其他调度库
    // const cron = require('node-cron');
    // cron.schedule('0 2 * * *', async () => {
    //   await this.createBackup();
    //   await this.cleanupOldBackups();
    // });

    console.log('💡 请在生产环境中配置适当的定时任务系统');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ 请设置 DATABASE_URL 环境变量');
    process.exit(1);
  }

  const backupManager = new DatabaseBackup(databaseUrl);

  const action = process.argv[2] || 'backup';

  switch (action) {
    case 'backup':
      backupManager
        .createBackup()
        .then(result => {
          console.log('🎉 备份任务完成');
          process.exit(0);
        })
        .catch(error => {
          console.error('💥 备份任务失败');
          process.exit(1);
        });
      break;

    case 'list':
      backupManager
        .listBackups()
        .then(backups => {
          console.log('📋 备份列表:');
          backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup.filename}`);
            console.log(
              `   大小: ${(backup.size / (1024 * 1024)).toFixed(2)} MB`
            );
            console.log(`   创建时间: ${backup.created.toLocaleString()}`);
            console.log('');
          });
          process.exit(0);
        })
        .catch(error => {
          console.error('💥 列出备份失败');
          process.exit(1);
        });
      break;

    case 'cleanup':
      backupManager
        .cleanupOldBackups()
        .then(deletedCount => {
          console.log(`🎉 清理完成，删除了 ${deletedCount} 个备份`);
          process.exit(0);
        })
        .catch(error => {
          console.error('💥 清理失败');
          process.exit(1);
        });
      break;

    default:
      console.log('使用方法:');
      console.log('  node scripts/backup-database.js backup    # 创建备份');
      console.log('  node scripts/backup-database.js list      # 列出备份');
      console.log('  node scripts/backup-database.js cleanup   # 清理旧备份');
      process.exit(1);
  }
}

module.exports = DatabaseBackup;
