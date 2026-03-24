/**
 * 数据一致性检查 - Cron 作业
 *
 * 每日凌晨 2 点自动执行数据一致性检查
 * 发送报告邮件给管理员
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SCRIPT_PATH = path.join(
  process.cwd(),
  'scripts',
  'data-consistency-checker.ts'
);
const LOG_DIR = path.join(process.cwd(), 'logs', 'cron');
const LOG_FILE = path.join(
  LOG_DIR,
  `data-consistency-${new Date().toISOString().split('T')[0]}.log`
);

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * 记录日志
 */
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // 写入文件
  fs.appendFileSync(LOG_FILE, logMessage);

  // 同时输出到控制台
  console.log(logMessage.trim());
}

/**
 * 执行检查脚本
 */
function executeChecker(): Promise<void> {
  return new Promise((resolve, reject) => {
    log('🚀 开始执行数据一致性检查...');

    const child = spawn('tsx', [SCRIPT_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
      const output = data.toString();
      stdout += output;
      log(output);
    });

    child.stderr.on('data', data => {
      const output = data.toString();
      stderr += output;
      log(`ERROR: ${output}`);
    });

    child.on('close', code => {
      if (code === 0) {
        log('✅ 数据一致性检查完成');
        resolve();
      } else {
        log(`❌ 数据一致性检查失败，退出码：${code}`);
        reject(new Error(`检查失败，退出码：${code}`));
      }
    });

    child.on('error', err => {
      log(`❌ 子进程错误：${err.message}`);
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    await executeChecker();
    log('🎉 Cron 作业执行成功');
    process.exit(0);
  } catch (error) {
    log(`💥 Cron 作业执行失败：${error}`);

    // TODO: 发送告警通知给管理员
    // 可以集成邮件、短信、钉钉、企业微信等通知渠道

    process.exit(1);
  }
}

// 运行主函数
main();
