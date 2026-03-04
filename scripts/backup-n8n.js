/**
 * n8n备份脚本
 * 定期备份n8n数据库和配置文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置参数
const CONFIG = {
  // 备份目录
  backupDir: './backups/n8n',

  // 保留最近N个备份
  keepLast: 10,

  // 备份文件命名格式
  filenameFormat: 'n8n-backup-{date}.tar.gz',

  // Docker容器名称
  containers: {
    postgres: 'n8n-postgres',
    n8n: 'n8n',
  },

  // 需要备份的路径
  backupPaths: [
    '/home/node/.n8n', // n8n配置和数据目录
  ],
};

/**
 * 获取当前时间戳
 */
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-');
}

/**
 * 创建备份目录
 */
function createBackupDirectory() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    console.log(`📁 创建备份目录: ${CONFIG.backupDir}`);
  }
}

/**
 * 生成备份文件名
 */
function generateBackupFilename() {
  const timestamp = getCurrentTimestamp();
  return CONFIG.filenameFormat.replace('{date}', timestamp);
}

/**
 * 执行PostgreSQL数据库备份
 */
function backupPostgresDatabase() {
  console.log('🐘 正在备份PostgreSQL数据库...');

  const backupFile = path.join(
    CONFIG.backupDir,
    `n8n-db-${getCurrentTimestamp()}.sql`
  );

  try {
    // 使用pg_dump备份数据库
    const command = `docker exec ${CONFIG.containers.postgres} pg_dump -U n8n n8n > ${backupFile}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ 数据库备份完成: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error(`❌ 数据库备份失败: ${error.message}`);
    throw error;
  }
}

/**
 * 备份n8n配置文件和数据
 */
function backupN8nData() {
  console.log('📂 正在备份n8n配置和数据...');

  const timestamp = getCurrentTimestamp();
  const backupFile = path.join(
    CONFIG.backupDir,
    `n8n-data-${timestamp}.tar.gz`
  );

  try {
    // 创建临时目录
    const tempDir = `/tmp/n8n-backup-${timestamp}`;
    execSync(`mkdir -p ${tempDir}`, { stdio: 'inherit' });

    // 从容器中复制数据
    execSync(
      `docker cp ${CONFIG.containers.n8n}:/home/node/.n8n ${tempDir}/n8n-data`,
      { stdio: 'inherit' }
    );

    // 创建压缩包
    execSync(`tar -czf ${backupFile} -C ${tempDir} .`, { stdio: 'inherit' });

    // 清理临时目录
    execSync(`rm -rf ${tempDir}`, { stdio: 'inherit' });

    console.log(`✅ n8n数据备份完成: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error(`❌ n8n数据备份失败: ${error.message}`);
    throw error;
  }
}

/**
 * 备份Docker卷
 */
function backupDockerVolumes() {
  console.log('💾 正在备份Docker卷...');

  const volumes = ['n8n-postgres-data', 'n8n-redis-data', 'n8n-storage'];
  const backupFiles = [];

  for (const volume of volumes) {
    try {
      const backupFile = path.join(
        CONFIG.backupDir,
        `${volume}-${getCurrentTimestamp()}.tar.gz`
      );

      // 创建卷备份
      execSync(
        `docker run --rm -v ${volume}:/volume -v ${CONFIG.backupDir}:/backup alpine tar czf /backup/${path.basename(backupFile)} -C /volume .`,
        { stdio: 'inherit' }
      );

      console.log(`✅ 卷备份完成: ${backupFile}`);
      backupFiles.push(backupFile);
    } catch (error) {
      console.warn(`⚠️  卷 ${volume} 备份失败: ${error.message}`);
    }
  }

  return backupFiles;
}

/**
 * 清理旧备份
 */
function cleanupOldBackups() {
  console.log('🧹 清理旧备份文件...');

  try {
    const files = fs
      .readdirSync(CONFIG.backupDir)
      .filter(
        file =>
          file.startsWith('n8n-') &&
          (file.endsWith('.tar.gz') || file.endsWith('.sql'))
      )
      .map(file => ({
        name: file,
        path: path.join(CONFIG.backupDir, file),
        mtime: fs.statSync(path.join(CONFIG.backupDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排列

    // 删除超出保留数量的旧备份
    if (files.length > CONFIG.keepLast) {
      const filesToDelete = files.slice(CONFIG.keepLast);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  删除旧备份: ${file.name}`);
      });
    }

    console.log(
      `✅ 保留最新的 ${Math.min(files.length, CONFIG.keepLast)} 个备份`
    );
  } catch (error) {
    console.error(`❌ 清理旧备份失败: ${error.message}`);
  }
}

/**
 * 验证备份文件完整性
 */
function verifyBackupIntegrity(backupFiles) {
  console.log('🔍 验证备份文件完整性...');

  let allValid = true;

  for (const file of backupFiles) {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (stats.size > 0) {
          console.log(`✅ ${path.basename(file)} - 大小: ${stats.size} 字节`);
        } else {
          console.error(`❌ ${path.basename(file)} - 文件为空`);
          allValid = false;
        }
      } else {
        console.error(`❌ ${path.basename(file)} - 文件不存在`);
        allValid = false;
      }
    } catch (error) {
      console.error(`❌ ${path.basename(file)} - 验证失败: ${error.message}`);
      allValid = false;
    }
  }

  return allValid;
}

/**
 * 生成备份报告
 */
function generateBackupReport(backupFiles, startTime) {
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000);

  const report = {
    timestamp: endTime.toISOString(),
    duration: `${duration}秒`,
    files: backupFiles.map(file => ({
      name: path.basename(file),
      size: fs.existsSync(file) ? fs.statSync(file).size : 0,
      path: file,
    })),
    totalSize: backupFiles.reduce((total, file) => {
      return total + (fs.existsSync(file) ? fs.statSync(file).size : 0);
    }, 0),
  };

  const reportFile = path.join(
    CONFIG.backupDir,
    `backup-report-${getCurrentTimestamp()}.json`
  );
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`📊 备份报告已生成: ${reportFile}`);
  return reportFile;
}

/**
 * 主备份函数
 */
async function main() {
  console.log('🔄 开始n8n备份...');
  console.log('================================');

  const startTime = new Date();
  const backupFiles = [];

  try {
    // 创建备份目录
    createBackupDirectory();

    // 检查Docker容器是否运行
    console.log('🔍 检查Docker容器状态...');
    try {
      execSync(
        `docker ps | grep -E "(${CONFIG.containers.postgres}|${CONFIG.containers.n8n})"`,
        { stdio: 'pipe' }
      );
      console.log('✅ Docker容器运行正常');
    } catch (error) {
      console.error('❌ Docker容器未运行，请先启动n8n服务');
      process.exit(1);
    }

    // 执行各项备份
    try {
      const dbBackup = backupPostgresDatabase();
      backupFiles.push(dbBackup);
    } catch (error) {
      console.warn('⚠️  数据库备份跳过');
    }

    try {
      const dataBackup = backupN8nData();
      backupFiles.push(dataBackup);
    } catch (error) {
      console.warn('⚠️  n8n数据备份跳过');
    }

    const volumeBackups = backupDockerVolumes();
    backupFiles.push(...volumeBackups);

    // 验证备份完整性
    const isValid = verifyBackupIntegrity(backupFiles);

    if (!isValid) {
      console.error('❌ 备份文件验证失败');
      process.exit(1);
    }

    // 生成备份报告
    const reportFile = generateBackupReport(backupFiles, startTime);
    backupFiles.push(reportFile);

    // 清理旧备份
    cleanupOldBackups();

    console.log('\n🎉 n8n备份完成！');
    console.log('================================');
    console.log(`备份文件数: ${backupFiles.length - 1}`); // 不包括报告文件
    console.log(
      `总大小: ${Math.round(backupFiles.reduce((total, file) => total + (fs.existsSync(file) ? fs.statSync(file).size : 0), 0) / 1024 / 1024)} MB`
    );
    console.log(`备份目录: ${CONFIG.backupDir}`);
  } catch (error) {
    console.error('\n❌ 备份过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 定时备份功能
function scheduleBackup(cronExpression) {
  const cron = require('node-cron');

  console.log(`⏰ 已设置定时备份，cron表达式: ${cronExpression}`);

  cron.schedule(cronExpression, () => {
    console.log('\n🔔 触发定时备份...');
    main().catch(console.error);
  });
}

// 命令行参数处理
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--schedule')) {
    const cronExpr = args[args.indexOf('--schedule') + 1] || '0 2 * * *'; // 默认每天凌晨2点
    scheduleBackup(cronExpr);
  } else {
    main();
  }
}

module.exports = {
  backupPostgresDatabase,
  backupN8nData,
  backupDockerVolumes,
  cleanupOldBackups,
  verifyBackupIntegrity,
};
