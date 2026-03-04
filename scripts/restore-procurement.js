#!/usr/bin/env node

/**
 * 采购智能体数据恢复脚本
 *
 * 用于从备份中恢复采购智能体系统的数据
 * 支持全量恢复和选择性恢复
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ProcurementRestoreManager {
  constructor() {
    this.backupBaseDir = path.join(__dirname, '../../backups/procurement');
  }

  async restoreFromBackup(backupId, options = {}) {
    console.log(`🔄 开始从备份 ${backupId} 恢复...`);

    try {
      const backupDir = path.join(this.backupBaseDir, backupId);

      // 验证备份存在性
      if (!fs.existsSync(backupDir)) {
        throw new Error(`备份不存在: ${backupDir}`);
      }

      // 验证备份完整性
      const isValid = await this.verifyBackup(backupDir);
      if (!isValid) {
        throw new Error('备份完整性验证失败');
      }

      // 读取备份元数据
      const metadataPath = path.join(backupDir, 'metadata.json');
      const metadata = JSON.parse(
        await fs.promises.readFile(metadataPath, 'utf8')
      );

      console.log(`📦 备份信息:`);
      console.log(`   ID: ${metadata.backupId}`);
      console.log(`   时间: ${metadata.timestamp}`);
      console.log(`   类型: ${metadata.backupType}`);
      console.log(`   大小: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`);

      // 执行恢复
      if (options.components?.database !== false) {
        await this.restoreDatabase(backupDir, options);
      }

      if (options.components?.configs !== false) {
        await this.restoreConfigs(backupDir, options);
      }

      if (options.components?.files !== false) {
        await this.restoreFiles(backupDir, options);
      }

      // 验证恢复结果
      const verifyResult = await this.verifyRestoration(backupId);

      console.log(`✅ 恢复完成: ${backupId}`);
      console.log(
        `🔍 验证结果: ${verifyResult.passed}/${verifyResult.total} 项通过`
      );

      return {
        backupId,
        timestamp: new Date().toISOString(),
        components: options.components || {
          database: true,
          configs: true,
          files: true,
        },
        verification: verifyResult,
      };
    } catch (error) {
      console.error('❌ 恢复失败:', error.message);
      throw error;
    }
  }

  async restoreDatabase(backupDir, options) {
    console.log('🗄️  恢复数据库...');

    const dbBackupPath = path.join(backupDir, 'database');
    if (!fs.existsSync(dbBackupPath)) {
      console.warn('  ⚠️  数据库备份不存在，跳过数据库恢复');
      return;
    }

    const tables = await fs.promises.readdir(dbBackupPath);
    let restoredCount = 0;

    for (const tableFile of tables) {
      if (!tableFile.endsWith('.sql')) continue;

      try {
        const tablePath = path.join(dbBackupPath, tableFile);
        const tableName = path.basename(tableFile, '.sql');

        // 如果指定了要恢复的表，只恢复指定的表
        if (options.tables && !options.tables.includes(tableName)) {
          continue;
        }

        const command =
          `psql -h ${process.env.DB_HOST || 'localhost'} ` +
          `-p ${process.env.DB_PORT || '5432'} ` +
          `-U ${process.env.DB_USER || 'postgres'} ` +
          `-d ${process.env.DB_NAME || 'postgres'} ` +
          `< ${tablePath}`;

        await this.executeCommand(command);
        console.log(`  ✅ ${tableName} 恢复完成`);
        restoredCount++;
      } catch (error) {
        console.error(`  ❌ ${tableFile} 恢复失败:`, error.message);
      }
    }

    console.log(`  📊 共恢复 ${restoredCount} 个表`);
  }

  async restoreConfigs(backupDir, options) {
    console.log('⚙️  恢复配置文件...');

    const configBackupPath = path.join(backupDir, 'configs');
    if (!fs.existsSync(configBackupPath)) {
      console.warn('  ⚠️  配置文件备份不存在，跳过配置恢复');
      return;
    }

    const projectRoot = path.join(__dirname, '../../');
    const configFiles = await fs.promises.readdir(configBackupPath);
    let restoredCount = 0;

    for (const configFile of configFiles) {
      try {
        const sourcePath = path.join(configBackupPath, configFile);
        const destPath = path.join(projectRoot, configFile);

        if (fs.statSync(sourcePath).isDirectory()) {
          await this.copyDirectory(sourcePath, destPath);
        } else {
          await fs.promises.copyFile(sourcePath, destPath);
        }

        console.log(`  ✅ ${configFile} 恢复完成`);
        restoredCount++;
      } catch (error) {
        console.error(`  ❌ ${configFile} 恢复失败:`, error.message);
      }
    }

    console.log(`  📊 共恢复 ${restoredCount} 个配置文件`);
  }

  async restoreFiles(backupDir, options) {
    console.log('📁 恢复上传文件...');

    const filesBackupPath = path.join(backupDir, 'uploaded-files');
    if (!fs.existsSync(filesBackupPath)) {
      console.warn('  ⚠️  文件备份不存在，跳过文件恢复');
      return;
    }

    const projectRoot = path.join(__dirname, '../../');
    const fileDirs = await fs.promises.readdir(filesBackupPath);
    let restoredCount = 0;

    for (const fileDir of fileDirs) {
      try {
        const sourcePath = path.join(filesBackupPath, fileDir);
        const destPath = path.join(projectRoot, 'public', fileDir);

        await this.copyDirectory(sourcePath, destPath);
        console.log(`  ✅ ${fileDir} 恢复完成`);
        restoredCount++;
      } catch (error) {
        console.error(`  ❌ ${fileDir} 恢复失败:`, error.message);
      }
    }

    console.log(`  📊 共恢复 ${restoredCount} 个文件目录`);
  }

  async verifyBackup(backupDir) {
    console.log('🔍 验证备份完整性...');

    try {
      // 检查必需文件
      const requiredPaths = ['metadata.json', 'database/', 'configs/'];

      for (const requiredPath of requiredPaths) {
        const fullPath = path.join(backupDir, requiredPath);
        if (!fs.existsSync(fullPath)) {
          console.error(`  ❌ 缺少必需文件: ${requiredPath}`);
          return false;
        }
      }

      // 验证校验和
      const metadataPath = path.join(backupDir, 'metadata.json');
      const metadata = JSON.parse(
        await fs.promises.readFile(metadataPath, 'utf8')
      );

      if (metadata.checksum) {
        const calculatedChecksum = await this.calculateChecksum(backupDir);
        if (calculatedChecksum !== metadata.checksum) {
          console.error('  ❌ 校验和不匹配');
          return false;
        }
      }

      console.log('  ✅ 备份完整性验证通过');
      return true;
    } catch (error) {
      console.error('  ❌ 备份验证失败:', error.message);
      return false;
    }
  }

  async verifyRestoration(backupId) {
    console.log('🔍 验证恢复结果...');

    const checks = [
      {
        name: '数据库连接',
        check: () => this.verifyDatabaseConnection(),
      },
      {
        name: '核心表存在性',
        check: () => this.verifyCoreTables(),
      },
      {
        name: '配置文件完整性',
        check: () => this.verifyConfigFiles(),
      },
      {
        name: '服务可用性',
        check: () => this.verifyServiceAvailability(),
      },
    ];

    let passed = 0;
    const total = checks.length;

    for (const { name, check } of checks) {
      console.log(`  检查 ${name}...`);
      try {
        const result = await check();
        if (result.success) {
          console.log(`    ✅ 通过 - ${result.message}`);
          passed++;
        } else {
          console.log(`    ❌ 失败 - ${result.message}`);
        }
      } catch (error) {
        console.log(`    ❌ 错误 - ${error.message}`);
      }
    }

    return {
      passed,
      total,
      successRate: Math.round((passed / total) * 100),
    };
  }

  // 验证方法
  async verifyDatabaseConnection() {
    try {
      const command =
        `pg_isready -h ${process.env.DB_HOST || 'localhost'} ` +
        `-p ${process.env.DB_PORT || '5432'} ` +
        `-U ${process.env.DB_USER || 'postgres'}`;

      await this.executeCommand(command);
      return { success: true, message: '数据库连接正常' };
    } catch (error) {
      return { success: false, message: '数据库连接失败' };
    }
  }

  async verifyCoreTables() {
    try {
      const coreTables = [
        'supplier_intelligence_profiles',
        'international_price_indices',
        'procurement_decision_audit',
      ];

      for (const table of coreTables) {
        const command =
          `psql -h ${process.env.DB_HOST || 'localhost'} ` +
          `-p ${process.env.DB_PORT || '5432'} ` +
          `-U ${process.env.DB_USER || 'postgres'} ` +
          `-d ${process.env.DB_NAME || 'postgres'} ` +
          `-c "SELECT COUNT(*) FROM ${table}"`;

        await this.executeCommand(command);
      }

      return { success: true, message: '核心表结构完整' };
    } catch (error) {
      return { success: false, message: '核心表验证失败' };
    }
  }

  async verifyConfigFiles() {
    const requiredConfigs = [
      '.env.procurement',
      'config/procurement-intelligence/',
      'sql/supplier-intelligence-profiles.sql',
    ];

    const projectRoot = path.join(__dirname, '../../');
    let missingCount = 0;

    for (const configFile of requiredConfigs) {
      const fullPath = path.join(projectRoot, configFile);
      if (!fs.existsSync(fullPath)) {
        missingCount++;
      }
    }

    return {
      success: missingCount === 0,
      message:
        missingCount === 0 ? '配置文件完整' : `缺少 ${missingCount} 个配置文件`,
    };
  }

  async verifyServiceAvailability() {
    try {
      // 检查API端点
      const response = await fetch('http://localhost:3000/api/health');
      return {
        success: response.ok,
        message: response.ok ? '服务正常运行' : '服务无响应',
      };
    } catch (error) {
      return { success: false, message: '服务检查失败' };
    }
  }

  // 辅助方法
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } },
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        }
      );
    });
  }

  async copyDirectory(src, dest) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  }

  async calculateChecksum(dirPath) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');

    async function hashDirectory(currentPath) {
      const entries = await fs.promises.readdir(currentPath, {
        withFileTypes: true,
      });

      for (const entry of entries.sort()) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await hashDirectory(fullPath);
        } else {
          const content = await fs.promises.readFile(fullPath);
          hash.update(content);
        }
      }
    }

    await hashDirectory(dirPath);
    return hash.digest('hex');
  }

  async listAvailableBackups() {
    try {
      const backups = await fs.promises.readdir(this.backupBaseDir);
      const backupInfo = [];

      for (const backup of backups) {
        const backupPath = path.join(this.backupBaseDir, backup);
        const stats = await fs.promises.stat(backupPath);

        let metadata = {};
        const metadataPath = path.join(backupPath, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          metadata = JSON.parse(
            await fs.promises.readFile(metadataPath, 'utf8')
          );
        }

        backupInfo.push({
          id: backup,
          timestamp: stats.mtime.toISOString(),
          size: stats.size,
          metadata: metadata,
        });
      }

      return backupInfo.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    } catch (error) {
      console.error('❌ 获取备份列表失败:', error.message);
      return [];
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const restoreManager = new ProcurementRestoreManager();

  async function main() {
    try {
      switch (args[0]) {
        case 'restore':
          if (!args[1]) {
            console.error('❌ 请指定备份ID');
            process.exit(1);
          }

          const backupId = args[1];
          const options = {};

          // 解析选项参数
          if (args.includes('--no-database')) {
            options.components = options.components || {};
            options.components.database = false;
          }

          if (args.includes('--no-configs')) {
            options.components = options.components || {};
            options.components.configs = false;
          }

          if (args.includes('--no-files')) {
            options.components = options.components || {};
            options.components.files = false;
          }

          await restoreManager.restoreFromBackup(backupId, options);
          break;

        case 'list':
          const backups = await restoreManager.listAvailableBackups();
          console.log('📦 可用备份列表:');
          backups.forEach(backup => {
            console.log(
              `  - ${backup.id} (${new Date(backup.timestamp).toLocaleString()})`
            );
            if (backup.metadata.size) {
              console.log(
                `    大小: ${(backup.metadata.size / 1024 / 1024).toFixed(2)} MB`
              );
            }
          });
          break;

        case 'verify':
          if (!args[1]) {
            console.error('❌ 请指定备份ID');
            process.exit(1);
          }

          const verifyResult = await restoreManager.verifyBackup(
            path.join(restoreManager.backupBaseDir, args[1])
          );
          console.log(`验证结果: ${verifyResult ? '通过' : '失败'}`);
          break;

        default:
          console.log(`
采购智能体恢复工具

用法: node restore-procurement.js <命令> [参数] [选项]

命令:
  restore <备份ID>    从指定备份恢复
  list               列出所有可用备份
  verify <备份ID>    验证备份完整性

选项:
  --no-database      跳过数据库恢复
  --no-configs       跳过配置文件恢复
  --no-files         跳过文件恢复

示例:
  node restore-procurement.js restore procurement-2026-02-26
  node restore-procurement.js restore procurement-2026-02-26 --no-files
  node restore-procurement.js list
          `);
      }
    } catch (error) {
      console.error('❌ 操作失败:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = { ProcurementRestoreManager };
