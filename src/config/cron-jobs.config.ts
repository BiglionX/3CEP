/**
 * 定时任务配置
 *
 * 使用 Vercel Cron Jobs 或 Node.js setTimeout 实现
 */

import {
  cleanupExpiredHistory,
  executeAgentStatusSnapshot,
} from '../jobs/snapshot-agent-status.job';
import { executeAlertEvaluation } from '../services/monitoring/alert.service';

/**
 * 定时任务定义
 */
export const cronJobs = [
  {
    name: 'agent-status-snapshot',
    description: '智能体状态快照采集（每小时执行）',
    schedule: '0 * * * *', // 每小时整点执行
    handler: executeAgentStatusSnapshot,
    enabled: true,
    timeout: 300000, // 5 分钟超时
  },
  {
    name: 'alert-evaluation',
    description: '告警规则评估（每 5 分钟执行）',
    schedule: '*/5 * * * *', // 每 5 分钟执行
    handler: executeAlertEvaluation,
    enabled: true,
    timeout: 180000, // 3 分钟超时
  },
  {
    name: 'agent-history-cleanup',
    description: '清理过期历史数据（每天凌晨 2 点执行）',
    schedule: '0 2 * * *', // 每天凌晨 2 点
    handler: cleanupExpiredHistory,
    enabled: true,
    timeout: 600000, // 10 分钟超时
  },
];

/**
 * 注册所有定时任务
 * 在 Next.js 中，可以通过 API 路由 + Vercel Cron 实现
 */
export function registerCronJobs() {
  // eslint-disable-next-line no-console
  console.log('📅 注册定时任务...');

  cronJobs.forEach(job => {
    if (job.enabled) {
      // eslint-disable-next-line no-console
      console.log(`✅ 已注册：${job.name} - ${job.schedule}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`⏸️  已禁用：${job.name}`);
    }
  });
}

/**
 * 手动触发定时任务（用于测试或管理界面）
 */
export async function triggerCronJob(jobName: string) {
  const job = cronJobs.find(j => j.name === jobName);

  if (!job) {
    throw new Error(`定时任务不存在：${jobName}`);
  }

  if (!job.enabled) {
    throw new Error(`定时任务已禁用：${jobName}`);
  }

  // eslint-disable-next-line no-console
  console.log(`⏰ 手动触发定时任务：${job.name}`);

  try {
    const result = await job.handler();
    // eslint-disable-next-line no-console
    console.log(`✅ 定时任务执行成功：${job.name}`, result);
    return { success: true, result };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ 定时任务执行失败：${job.name}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '执行失败',
    };
  }
}
