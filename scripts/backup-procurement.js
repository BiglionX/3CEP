#!/usr/bin/env node

/**
 * 采购智能体备份恢复脚本
 *
 * 项目概述:
 * 为采购智能体系统建立完整的数据备份和恢复机制，
 * 确保业务数据安全和系统可靠性。
 *
 * 备份策略:
 * - 每日全量备份: 凌晨2:00执行
 * - 每4小时增量备份: 工作时间段执行
 * - 保留策略: 本地7天，近线90天，离线永久
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

class ProcurementBackupManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.backupBaseDir = path.join(__dirname, '../../backups/procurement');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupId = `procurement-${this.timestamp}`;
  }

  async createFullBackup() {
    console.log('🚀 开始采购智能体全量备份...');

    try {
      // 创建备份目录
      const backupDir = path.join(this.backupBaseDir, this.backupId);
      await fs.promises.mkdir(backupDir, { recursive: true });

      // 1. 备份数据库
      await this.backupDatabase(backupDir);

      // 2. 备份配置文件
      await this.backupConfigs(backupDir);

      // 3. 备份上传文件
      await this.backupUploadedFiles(backupDir);

      // 4. 生成备份元数据
      await this.generateMetadata(backupDir);

      // 5. 验证备份完整性
      const isValid = await this.verifyBackup(backupDir);

      console.log(`✅ 全量备份完成: ${this.backupId}`);
      console.log(`📁 备份位置: ${backupDir}`);
      console.log(`🔍 完整性验证: ${isValid ? '通过' : '失败'}`);

      return {
        backupId: this.backupId,
        path: backupDir,
        timestamp: this.timestamp,
        isValid,
      };
    } catch (error) {
      console.error('❌ 备份失败:', error.message);
      throw error;
    }
  }

  async backupDatabase(backupDir) {
    console.log('🗄️  备份数据库...');

    const dbBackupPath = path.join(backupDir, 'database');
    await fs.promises.mkdir(dbBackupPath, { recursive: true });

    // 备份采购智能体核心表
    const coreTables = [
      'supplier_intelligence_profiles',
      'international_price_indices',
      'procurement_decision_audit',
      'supplier_capability_scores',
      'market_analysis_reports',
      'risk_assessment_records',
      'contract_recommendations',
    ];

    for (const table of coreTables) {
      try {
        const outputPath = path.join(dbBackupPath, `${table}.sql`);
        const command =
          `pg_dump -h ${process.env.DB_HOST || 'localhost'} ` +
          `-p ${process.env.DB_PORT || '5432'} ` +
          `-U ${process.env.DB_USER || 'postgres'} ` +
          `-d ${process.env.DB_NAME || 'postgres'} ` +
          `-t ${table} --inserts > ${outputPath}`;

        await this.executeCommand(command);
        console.log(`  ✅ ${table} 备份完成`);
      } catch (error) {
        console.warn(`  ⚠️  ${table} 备份失败:`, error.message);
      }
    }

    // 备份扩展的外贸表
    try {
      const outputPath = path.join(
        dbBackupPath,
        'foreign_trade_partners_extended.sql'
      );
      const command =
        `pg_dump -h ${process.env.DB_HOST || 'localhost'} ` +
        `-p ${process.env.DB_PORT || '5432'} ` +
        `-U ${process.env.DB_USER || 'postgres'} ` +
        `-d ${process.env.DB_NAME || 'postgres'} ` +
        `-t foreign_trade_partners --column-inserts > ${outputPath}`;

      await this.executeCommand(command);
      console.log('  ✅ foreign_trade_partners 扩展字段备份完成');
    } catch (error) {
      console.warn('  ⚠️  foreign_trade_partners 备份失败:', error.message);
    }
  }

  async backupConfigs(backupDir) {
    console.log('⚙️  备份配置文件...');

    const configBackupPath = path.join(backupDir, 'configs');
    await fs.promises.mkdir(configBackupPath, { recursive: true });

    const configFiles = [
      '.env.procurement',
      'config/procurement-intelligence/',
      'scripts/procurement-scripts/',
      'sql/supplier-intelligence-profiles.sql',
      'sql/international-price-indices.sql',
      'sql/procurement-decision-audit.sql',
      'sql/alter-foreign-trade-partners.sql',
    ];

    for (const configFile of configFiles) {
      const sourcePath = path.join(__dirname, '../../', configFile);
      const destPath = path.join(configBackupPath, path.basename(configFile));

      try {
        if (fs.existsSync(sourcePath)) {
          if (fs.statSync(sourcePath).isDirectory()) {
            await this.copyDirectory(sourcePath, destPath);
          } else {
            await fs.promises.copyFile(sourcePath, destPath);
          }
          console.log(`  ✅ ${configFile} 备份完成`);
        }
      } catch (error) {
        console.warn(`  ⚠️  ${configFile} 备份失败:`, error.message);
      }
    }
  }

  async backupUploadedFiles(backupDir) {
    console.log('📁 备份上传文件...');

    const filesBackupPath = path.join(backupDir, 'uploaded-files');
    await fs.promises.mkdir(filesBackupPath, { recursive: true });

    const uploadDirs = [
      'public/uploads/suppliers/',
      'public/uploads/market-data/',
      'public/reports/procurement/',
    ];

    for (const uploadDir of uploadDirs) {
      const sourcePath = path.join(__dirname, '../../', uploadDir);
      const destPath = path.join(filesBackupPath, path.basename(uploadDir));

      try {
        if (fs.existsSync(sourcePath)) {
          await this.copyDirectory(sourcePath, destPath);
          console.log(`  ✅ ${uploadDir} 备份完成`);
        }
      } catch (error) {
        console.warn(`  ⚠️  ${uploadDir} 备份失败:`, error.message);
      }
    }
  }

  async generateMetadata(backupDir) {
    console.log('📝 生成备份元数据...');

    const metadata = {
      backupId: this.backupId,
      timestamp: this.timestamp,
      version: '1.0',
      backupType: 'full',
      components: {
        database: true,
        configs: true,
        uploadedFiles: true,
      },
      checksum: await this.calculateChecksum(backupDir),
      size: await this.calculateSize(backupDir),
    };

    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    );
  }

  async verifyBackup(backupDir) {
    console.log('🔍 验证备份完整性...');

    try {
      // 检查必需文件是否存在
      const requiredPaths = [
        'database/supplier_intelligence_profiles.sql',
        'configs/.env.procurement',
        'metadata.json',
      ];

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
      const calculatedChecksum = await this.calculateChecksum(backupDir);

      if (calculatedChecksum !== metadata.checksum) {
        console.error('  ❌ 校验和不匹配');
        return false;
      }

      console.log('  ✅ 备份完整性验证通过');
      return true;
    } catch (error) {
      console.error('  ❌ 备份验证失败:', error.message);
      return false;
    }
  }

  async cleanupOldBackups(retentionDays = 7) {
    console.log(`🧹 清理 ${retentionDays} 天前的备份...`);

    try {
      const backups = await fs.promises.readdir(this.backupBaseDir);
      const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;
      for (const backup of backups) {
        const backupPath = path.join(this.backupBaseDir, backup);
        const stats = await fs.promises.stat(backupPath);

        if (stats.mtime.getTime() < cutoffTime) {
          await fs.promises.rm(backupPath, { recursive: true, force: true });
          console.log(`  ✅ 删除过期备份: ${backup}`);
          deletedCount++;
        }
      }

      console.log(`  🧹 共清理 ${deletedCount} 个过期备份`);
      return { deletedCount };
    } catch (error) {
      console.error('  ❌ 清理失败:', error.message);
      return { deletedCount: 0, error: error.message };
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
    // 简化的校验和计算
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

  async calculateSize(dirPath) {
    let totalSize = 0;

    async function getSize(currentPath) {
      const stats = await fs.promises.stat(currentPath);

      if (stats.isDirectory()) {
        const entries = await fs.promises.readdir(currentPath);
        for (const entry of entries) {
          await getSize(path.join(currentPath, entry));
        }
      } else {
        totalSize += stats.size;
      }
    }

    await getSize(dirPath);
    return totalSize;
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const backupManager = new ProcurementBackupManager();

  async function main() {
    try {
      switch (args[0]) {
        case 'backup':
          const result = await backupManager.createFullBackup();
          await backupManager.cleanupOldBackups(7);
          break;

        case 'cleanup':
          const days = parseInt(args[1]) || 7;
          await backupManager.cleanupOldBackups(days);
          break;

        case 'list':
          const backups = await fs.promises.readdir(
            backupManager.backupBaseDir
          );
          console.log('📦 现有备份:');
          backups.forEach(backup => console.log(`  - ${backup}`));
          break;

        default:
          console.log(`
采购智能体备份工具

用法: node backup-procurement.js <命令> [参数]

命令:
  backup          执行全量备份
  cleanup [天数]  清理指定天数前的备份 (默认7天)
  list            列出所有备份

环境变量:
  DB_HOST         数据库主机
  DB_PORT         数据库端口
  DB_USER         数据库用户
  DB_PASSWORD     数据库密码
  DB_NAME         数据库名称
          `);
      }
    } catch (error) {
      console.error('❌ 操作失败:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = { ProcurementBackupManager };
