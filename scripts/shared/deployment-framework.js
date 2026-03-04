#!/usr/bin/env node

/**
 * 统一部署框架
 * 提供通用的部署功能和工具函数
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

class DeploymentFramework {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      dryRun: false,
      environment: process.env.NODE_ENV || 'development',
      ...options,
    };

    this.logger = new Logger(this.options.verbose);
    this.validator = new Validator();
  }

  /**
   * 执行命令
   */
  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      if (this.options.dryRun) {
        this.logger.info(
          `[DRY-RUN] Would execute: ${command} ${args.join(' ')}`
        );
        resolve({ stdout: '', stderr: '' });
        return;
      }

      this.logger.info(`Executing: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
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
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  /**
   * 同步执行命令
   */
  executeCommandSync(command, args = [], options = {}) {
    if (this.options.dryRun) {
      this.logger.info(`[DRY-RUN] Would execute: ${command} ${args.join(' ')}`);
      return { status: 0, stdout: '', stderr: '' };
    }

    this.logger.info(`Executing (sync): ${command} ${args.join(' ')}`);

    const result = spawnSync(command, args, {
      stdio: this.options.verbose ? 'inherit' : 'pipe',
      ...options,
    });

    if (result.error) {
      throw result.error;
    }

    return {
      status: result.status,
      stdout: result.stdout ? result.stdout.toString().trim() : '',
      stderr: result.stderr ? result.stderr.toString().trim() : '',
    };
  }

  /**
   * 检查必要工具
   */
  checkRequiredTools(tools) {
    const missing = [];

    for (const tool of tools) {
      try {
        this.executeCommandSync(tool, ['--version']);
        this.logger.success(`${tool} ✓`);
      } catch (error) {
        missing.push(tool);
        this.logger.error(`${tool} ✗`);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required tools: ${missing.join(', ')}`);
    }
  }

  /**
   * 加载环境配置
   */
  loadEnvironmentConfig(configPath) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const env = this.options.environment;

      if (!config[env]) {
        throw new Error(`Environment '${env}' not found in config`);
      }

      // 设置环境变量
      Object.entries(config[env]).forEach(([key, value]) => {
        process.env[key] = value;
      });

      this.logger.success(`Loaded environment config for '${env}'`);
      return config[env];
    } catch (error) {
      throw new Error(`Failed to load environment config: ${error.message}`);
    }
  }

  /**
   * 创建备份
   */
  createBackup(source, backupDir) {
    if (this.options.dryRun) {
      this.logger.info(`[DRY-RUN] Would backup ${source} to ${backupDir}`);
      return;
    }

    fs.mkdirSync(backupDir, { recursive: true });

    if (fs.existsSync(source)) {
      const dest = path.join(backupDir, path.basename(source));
      fs.cpSync(source, dest, { recursive: true });
      this.logger.success(`Backed up ${source} to ${dest}`);
    }
  }

  /**
   * 生成部署报告
   */
  generateReport(data, outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.options.environment,
      dryRun: this.options.dryRun,
      ...data,
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    this.logger.success(`Deployment report saved to ${outputPath}`);
  }
}

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message) {
    console.log(`\x1b[34m[INFO]\x1b[0m ${message}`);
  }

  success(message) {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
  }

  warning(message) {
    console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`);
  }

  error(message) {
    console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  }

  debug(message) {
    if (this.verbose) {
      console.log(`\x1b[36m[DEBUG]\x1b[0m ${message}`);
    }
  }
}

class Validator {
  static validateNotEmpty(value, fieldName) {
    if (!value || value.toString().trim() === '') {
      throw new Error(`${fieldName} cannot be empty`);
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  static validateUrl(url) {
    try {
      new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  static validateFileExists(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
  }
}

module.exports = { DeploymentFramework, Logger, Validator };
