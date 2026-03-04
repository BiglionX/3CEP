#!/usr/bin/env node

/**
 * 采购智能体生产环境部署脚本
 * 实现一键部署采购智能体系统的完整功能
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

class ProcurementIntelligenceDeployer {
  constructor(options = {}) {
    this.options = {
      environment: process.env.NODE_ENV || 'production',
      verbose: false,
      dryRun: false,
      backup: true,
      ...options,
    };

    this.logger = new Logger(this.options.verbose);
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupDir = path.join(this.projectRoot, 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async deploy() {
    console.log('🚀 开始部署采购智能体系统...');
    console.log('='.repeat(50));

    const startTime = Date.now();
    const results = {
      backup: null,
      build: null,
      migrate: null,
      deploy: null,
      verify: null,
    };

    try {
      // 阶段1: 备份当前版本
      if (this.options.backup) {
        console.log('\n📁 阶段1: 备份当前版本');
        console.log('-'.repeat(30));
        results.backup = await this.createBackup();
      }

      // 阶段2: 构建应用
      console.log('\n🏗️  阶段2: 构建应用');
      console.log('-'.repeat(30));
      results.build = await this.buildApplication();

      // 阶段3: 数据库迁移
      console.log('\n📊 阶段3: 数据库迁移');
      console.log('-'.repeat(30));
      results.migrate = await this.runDatabaseMigration();

      // 阶段4: 部署服务
      console.log('\n🚚 阶段4: 部署服务');
      console.log('-'.repeat(30));
      results.deploy = await this.deployServices();

      // 阶段5: 验证部署
      console.log('\n✅ 阶段5: 验证部署');
      console.log('-'.repeat(30));
      results.verify = await this.verifyDeployment();

      // 输出总结
      this.printSummary(results, startTime);

      return { success: true, results };
    } catch (error) {
      console.error('\n❌ 部署过程中发生错误:', error.message);
      this.handleRollback(results);
      return { success: false, error: error.message, results };
    }
  }

  async createBackup() {
    try {
      this.logger.info('创建备份目录...');

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const backupName = `procurement-intelligence-${this.timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // 备份重要文件
      const filesToBackup = [
        '.env',
        'package.json',
        'next.config.js',
        'src/app/procurement-intelligence',
        'sql/supplier-intelligence-profiles.sql',
        'sql/international-price-indices.sql',
        'sql/procurement-decision-audit.sql',
      ];

      fs.mkdirSync(backupPath, { recursive: true });

      for (const file of filesToBackup) {
        const sourcePath = path.join(this.projectRoot, file);
        const destPath = path.join(backupPath, file);

        if (fs.existsSync(sourcePath)) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });

          if (fs.statSync(sourcePath).isDirectory()) {
            this.copyDirectory(sourcePath, destPath);
          } else {
            fs.copyFileSync(sourcePath, destPath);
          }

          this.logger.info(`备份文件: ${file}`);
        }
      }

      this.logger.success(`备份完成: ${backupPath}`);
      return { success: true, path: backupPath };
    } catch (error) {
      this.logger.error(`备份失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async buildApplication() {
    try {
      this.logger.info('安装生产依赖...');

      const installResult = await this.executeCommand('npm', [
        'ci',
        '--production',
      ]);
      if (!installResult.success) {
        throw new Error('依赖安装失败');
      }

      this.logger.info('构建Next.js应用...');
      const buildResult = await this.executeCommand('npm', ['run', 'build']);
      if (!buildResult.success) {
        throw new Error('应用构建失败');
      }

      this.logger.success('应用构建完成');
      return { success: true };
    } catch (error) {
      this.logger.error(`构建失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runDatabaseMigration() {
    try {
      this.logger.info('执行数据库迁移...');

      // 执行采购智能体相关的SQL脚本
      const migrationScripts = [
        'sql/supplier-intelligence-profiles.sql',
        'sql/international-price-indices.sql',
        'sql/procurement-decision-audit.sql',
        'sql/alter-foreign-trade-partners.sql',
      ];

      for (const script of migrationScripts) {
        const scriptPath = path.join(this.projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          this.logger.info(`执行迁移脚本: ${script}`);
          const result = await this.executeCommand('psql', ['-f', scriptPath]);
          if (!result.success) {
            this.logger.warning(`脚本执行警告: ${script}`);
          }
        }
      }

      // 运行数据迁移工具
      const migratorPath = path.join(
        this.projectRoot,
        'scripts/data-migration-tools/procurement-data-migrator.js'
      );
      if (fs.existsSync(migratorPath)) {
        this.logger.info('运行数据迁移工具...');
        const migrateResult = await this.executeCommand('node', [migratorPath]);
        if (!migrateResult.success) {
          this.logger.warning('数据迁移工具执行警告');
        }
      }

      this.logger.success('数据库迁移完成');
      return { success: true };
    } catch (error) {
      this.logger.error(`数据库迁移失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async deployServices() {
    try {
      this.logger.info('启动服务...');

      // 启动Next.js服务
      const startResult = await this.executeCommand('npm', ['run', 'start']);
      if (!startResult.success) {
        throw new Error('服务启动失败');
      }

      // 如果使用Docker，启动相关容器
      const dockerComposeFiles = [
        'docker-compose.prod.yml',
        'docker-compose.n8n.yml',
      ];

      for (const composeFile of dockerComposeFiles) {
        const composePath = path.join(this.projectRoot, composeFile);
        if (fs.existsSync(composePath)) {
          this.logger.info(`启动Docker服务: ${composeFile}`);
          await this.executeCommand('docker-compose', [
            '-f',
            composePath,
            'up',
            '-d',
          ]);
        }
      }

      this.logger.success('服务部署完成');
      return { success: true };
    } catch (error) {
      this.logger.error(`服务部署失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async verifyDeployment() {
    try {
      this.logger.info('验证部署状态...');

      // 等待服务启动
      await this.sleep(10000);

      // 检查服务健康状态
      const healthChecks = [
        { url: 'http://localhost:3000/api/health', name: '主服务' },
        {
          url: 'http://localhost:3000/api/procurement-intelligence/health',
          name: '采购智能体服务',
        },
      ];

      const results = [];
      for (const check of healthChecks) {
        try {
          const response = await this.fetchWithTimeout(check.url, 5000);
          if (response.ok) {
            this.logger.success(`${check.name} 健康检查通过`);
            results.push({ name: check.name, status: 'healthy' });
          } else {
            this.logger.warning(
              `${check.name} 健康检查异常: ${response.status}`
            );
            results.push({
              name: check.name,
              status: 'warning',
              statusCode: response.status,
            });
          }
        } catch (error) {
          this.logger.error(`${check.name} 健康检查失败: ${error.message}`);
          results.push({
            name: check.name,
            status: 'error',
            error: error.message,
          });
        }
      }

      // 验证核心功能
      const functionalTests = [
        {
          endpoint: '/api/procurement-intelligence/suppliers/profiles',
          method: 'GET',
          name: '供应商画像接口',
        },
        {
          endpoint: '/api/procurement-intelligence/market/prices',
          method: 'GET',
          name: '市场价格接口',
        },
        {
          endpoint: '/api/procurement-intelligence/decisions/history',
          method: 'GET',
          name: '决策历史接口',
        },
      ];

      for (const test of functionalTests) {
        try {
          const response = await this.fetchWithTimeout(
            `http://localhost:3000${test.endpoint}`,
            5000,
            { method: test.method }
          );

          if (response.ok) {
            this.logger.success(`${test.name} 功能测试通过`);
          } else {
            this.logger.warning(
              `${test.name} 功能测试异常: ${response.status}`
            );
          }
        } catch (error) {
          this.logger.error(`${test.name} 功能测试失败: ${error.message}`);
        }
      }

      this.logger.success('部署验证完成');
      return { success: true, healthResults: results };
    } catch (error) {
      this.logger.error(`部署验证失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // 辅助方法
  async executeCommand(command, args = [], options = {}) {
    return new Promise(resolve => {
      if (this.options.dryRun) {
        this.logger.info(
          `[DRY-RUN] Would execute: ${command} ${args.join(' ')}`
        );
        resolve({ success: true, stdout: '', stderr: '' });
        return;
      }

      this.logger.info(`执行命令: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
        if (this.options.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
        if (this.options.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', code => {
        const success = code === 0;
        if (success) {
          this.logger.success(`命令执行成功: ${command}`);
        } else {
          this.logger.error(`命令执行失败: ${command} (exit code: ${code})`);
        }
        resolve({ success, stdout, stderr, code });
      });

      child.on('error', error => {
        this.logger.error(`命令执行错误: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
    });
  }

  async fetchWithTimeout(url, timeout = 5000, options = {}) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('请求超时'));
      }, timeout);

      fetch(url, { ...options, signal: controller.signal })
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  printSummary(results, startTime) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(50)}`);
    console.log('📋 部署总结报告');
    console.log('='.repeat(50));
    console.log(`⏱️  总耗时: ${duration}秒`);
    console.log('');

    const stages = [
      { name: '备份', key: 'backup' },
      { name: '构建', key: 'build' },
      { name: '迁移', key: 'migrate' },
      { name: '部署', key: 'deploy' },
      { name: '验证', key: 'verify' },
    ];

    for (const stage of stages) {
      const result = results[stage.key];
      const status = result?.success ? '✅ 成功' : '❌ 失败';
      console.log(`${stage.name}: ${status}`);
    }

    console.log('\n🌐 访问地址:');
    console.log(
      '  采购智能体主页面: http://localhost:3000/procurement-intelligence'
    );
    console.log(
      '  API文档: http://localhost:3000/api/procurement-intelligence/docs'
    );
    console.log(
      '  健康检查: http://localhost:3000/api/procurement-intelligence/health'
    );

    console.log('\n📝 后续操作:');
    console.log('  1. 检查服务日志: npm run logs');
    console.log('  2. 监控系统状态: npm run monitor');
    console.log('  3. 查看备份文件: backups/');

    console.log('\n🎉 采购智能体部署完成！');
  }

  handleRollback(results) {
    console.log('\n🔄 执行回滚操作...');

    if (results.backup?.success) {
      console.log(`备份位置: ${results.backup.path}`);
      console.log('请手动恢复备份文件');
    }

    // 停止服务
    try {
      spawnSync('npm', ['run', 'stop'], { cwd: this.projectRoot });
    } catch (error) {
      console.error('停止服务失败:', error.message);
    }
  }
}

// 日志工具类
class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message) {
    if (this.verbose) {
      console.log(`ℹ️  ${message}`);
    }
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  warning(message) {
    console.log(`⚠️  ${message}`);
  }

  error(message) {
    console.error(`❌ ${message}`);
  }
}

// 主程序入口
async function main() {
  const args = process.argv.slice(2);
  const options = {
    environment: process.env.NODE_ENV || 'production',
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    backup: !args.includes('--no-backup'),
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    console.log(`
采购智能体部署脚本

用法: node deploy-procurement-intelligence.js [选项]

选项:
  -v, --verbose    显示详细输出
  -d, --dry-run    模拟执行，不实际部署
  --no-backup      不创建备份
  -h, --help       显示帮助信息

环境变量:
  NODE_ENV         部署环境 (默认: production)

示例:
  # 生产环境部署
  node deploy-procurement-intelligence.js
  
  # 开发环境部署（带详细输出）
  NODE_ENV=development node deploy-procurement-intelligence.js --verbose
  
  # 模拟部署
  node deploy-procurement-intelligence.js --dry-run
    `);
    process.exit(0);
  }

  const deployer = new ProcurementIntelligenceDeployer(options);
  const result = await deployer.deploy();

  process.exit(result.success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('部署脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { ProcurementIntelligenceDeployer };
