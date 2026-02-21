// 数据质量定时检查服务
import { dataQualityService } from "./data-quality-service";
import { monitoringService } from "./monitoring-service";

export interface CronJobConfig {
  id: string;
  name: string;
  schedule: string; // cron表达式
  enabled: boolean;
  description?: string;
  parameters?: Record<string, any>;
}

export class DataQualityCronService {
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private jobConfigs: CronJobConfig[] = [];

  constructor() {
    this.initializeDefaultJobs();
  }

  // 初始化默认定时任务
  private initializeDefaultJobs(): void {
    const defaultJobs: CronJobConfig[] = [
      {
        id: "daily_quality_check",
        name: "每日数据质量全面检查",
        schedule: "0 2 * * *", // 每天凌晨2点执行
        enabled: true,
        description: "执行所有启用的数据质量检查规则",
        parameters: {
          checkAllRules: true,
          sendNotification: true,
        },
      },
      {
        id: "hourly_critical_check",
        name: "关键数据质量小时检查",
        schedule: "0 * * * *", // 每小时执行
        enabled: true,
        description: "检查关键业务数据的质量状况",
        parameters: {
          criticalTablesOnly: true,
          quickCheck: true,
        },
      },
      {
        id: "weekly_detailed_report",
        name: "周数据质量详细报告",
        schedule: "0 3 * * 1", // 每周一凌晨3点执行
        enabled: true,
        description: "生成详细的数据质量分析报告",
        parameters: {
          generateDetailedReport: true,
          includeTrends: true,
          sendEmail: true,
        },
      },
    ];

    defaultJobs.forEach((job) => {
      this.jobConfigs.push(job);
    });

    console.log("✅ 数据质量定时任务配置已初始化");
  }

  // 启动定时任务
  start(): void {
    console.log("🚀 启动数据质量定时检查服务...");

    this.jobConfigs
      .filter((job) => job.enabled)
      .forEach((job) => {
        this.scheduleJob(job);
      });
  }

  // 停止定时任务
  stop(): void {
    console.log("🛑 停止数据质量定时检查服务...");

    this.jobs.forEach((timeout, jobId) => {
      clearInterval(timeout);
      console.log(`✅ 已停止定时任务: ${jobId}`);
    });

    this.jobs.clear();
  }

  // 调度单个任务
  private scheduleJob(config: CronJobConfig): void {
    // 解析cron表达式
    const scheduleParts = config.schedule.split(" ");
    if (scheduleParts.length !== 5) {
      console.error(`❌ 无效的cron表达式: ${config.schedule}`);
      return;
    }

    // 简化的cron解析器（实际项目中建议使用node-cron等库）
    const [minute, hour, dayOfMonth, month, dayOfWeek] = scheduleParts;

    // 对于演示目的，我们使用简单的间隔调度
    // 实际生产环境中应使用专业的cron库
    const interval = this.getCronInterval(config.schedule);

    if (interval > 0) {
      const timeout = setInterval(() => {
        this.executeJob(config);
      }, interval);

      this.jobs.set(config.id, timeout);
      console.log(`✅ 定时任务已启动: ${config.name} (${config.schedule})`);
    }
  }

  // 获取cron表达式的执行间隔（毫秒）
  private getCronInterval(cronExpression: string): number {
    // 简化实现 - 实际项目中应使用专业cron库
    if (cronExpression.includes("* * * * *")) {
      // 每分钟
      return 60 * 1000;
    } else if (cronExpression.includes("0 * * * *")) {
      // 每小时
      return 60 * 60 * 1000;
    } else if (cronExpression.includes("0 2 * * *")) {
      // 每天凌晨2点
      return 24 * 60 * 60 * 1000;
    } else if (cronExpression.includes("0 3 * * 1")) {
      // 每周一凌晨3点
      return 7 * 24 * 60 * 60 * 1000;
    }

    // 默认每天执行一次
    return 24 * 60 * 60 * 1000;
  }

  // 执行定时任务
  private async executeJob(config: CronJobConfig): Promise<void> {
    console.log(`⏰ 执行定时任务: ${config.name}`);

    try {
      let results: any[];

      if (config.parameters?.checkAllRules) {
        // 执行所有检查
        results = await dataQualityService.runAllChecks();
      } else if (config.parameters?.criticalTablesOnly) {
        // 只检查关键表
        const criticalTables = ["parts", "users", "orders"];
        results = [];
        for (const table of criticalTables) {
          const tableResults = await dataQualityService.runTableChecks(table);
          results.push(...tableResults);
        }
      } else {
        // 默认行为
        results = await dataQualityService.runAllChecks();
      }

      // 分析结果并发送告警
      await this.analyzeAndAlert(results, config);

      // 记录执行统计
      monitoringService.recordMetric("data_quality_cron_executions", 1, {
        jobId: config.id,
        success: "true",
        checkCount: results.length.toString(),
      });

      console.log(
        `✅ 定时任务执行完成: ${config.name} (${results.length} checks)`
      );
    } catch (error) {
      console.error(`❌ 定时任务执行失败 ${config.name}:`, error);

      // 记录失败统计
      monitoringService.recordMetric("data_quality_cron_executions", 1, {
        jobId: config.id,
        success: "false",
        error: (error as Error).message,
      });

      // 发送失败告警
      await this.sendFailureAlert(config, error as Error);
    }
  }

  // 分析检查结果并发送告警
  private async analyzeAndAlert(
    results: any[],
    config: CronJobConfig
  ): Promise<void> {
    const failedChecks = results.filter((r) => r.status === "failed");
    const warningChecks = results.filter((r) => r.status === "warning");

    if (failedChecks.length > 0) {
      // 发送严重问题告警
      await this.sendAlert({
        type: "data_quality_failure",
        severity: "critical",
        title: "数据质量严重问题",
        message: `发现 ${failedChecks.length} 个严重数据质量问题`,
        details: failedChecks.map((check) => ({
          rule: check.ruleName,
          table: check.tableName,
          issues: `${check.issueCount}/${
            check.totalCount
          } (${check.issuePercentage.toFixed(1)}%)`,
        })),
        config,
      });
    }

    if (warningChecks.length > 0) {
      // 发送警告
      await this.sendAlert({
        type: "data_quality_warning",
        severity: "warning",
        title: "数据质量警告",
        message: `发现 ${warningChecks.length} 个数据质量警告`,
        details: warningChecks.map((check) => ({
          rule: check.ruleName,
          table: check.tableName,
          issues: `${check.issueCount}/${
            check.totalCount
          } (${check.issuePercentage.toFixed(1)}%)`,
        })),
        config,
      });
    }

    // 如果启用了详细报告，生成并发送
    if (config.parameters?.generateDetailedReport) {
      await this.generateAndSendReport(results, config);
    }
  }

  // 发送告警
  private async sendAlert(alert: {
    type: string;
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    details: any[];
    config: CronJobConfig;
  }): Promise<void> {
    console.log(`🔔 发送告警: ${alert.title}`);

    // 记录到监控系统
    monitoringService.recordMetric("data_quality_alert", 1, {
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      details: JSON.stringify(alert.details),
      jobId: alert.config.id,
    });

    // 实际项目中这里应该集成具体的告警渠道
    // 如邮件、短信、企业微信、钉钉等

    if (alert.config.parameters?.sendNotification !== false) {
      // 模拟发送通知
      console.log("📧 模拟发送告警通知:", {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
      });
    }
  }

  // 发送失败告警
  private async sendFailureAlert(
    config: CronJobConfig,
    error: Error
  ): Promise<void> {
    await this.sendAlert({
      type: "cron_job_failure",
      severity: "critical",
      title: "数据质量定时任务执行失败",
      message: `任务 "${config.name}" 执行失败: ${error.message}`,
      details: [{ error: error.stack }],
      config,
    });
  }

  // 生成并发送详细报告
  private async generateAndSendReport(
    results: any[],
    config: CronJobConfig
  ): Promise<void> {
    const report = await dataQualityService.generateQualityReport();

    console.log("📊 生成数据质量报告:", {
      overallScore: report.summary.overallScore,
      totalChecks: report.summary.totalChecks,
      passedChecks: report.summary.passedChecks,
      failedChecks: report.summary.failedChecks,
    });

    if (config.parameters?.sendEmail) {
      // 模拟发送邮件报告
      console.log("📧 模拟发送数据质量报告邮件");
    }
  }

  // 手动触发任务执行
  async triggerJob(jobId: string): Promise<void> {
    const jobConfig = this.jobConfigs.find((j) => j.id === jobId);
    if (!jobConfig) {
      throw new Error(`定时任务不存在: ${jobId}`);
    }

    console.log(`⚡ 手动触发任务: ${jobConfig.name}`);
    await this.executeJob(jobConfig);
  }

  // 获取所有定时任务
  getAllJobs(): CronJobConfig[] {
    return [...this.jobConfigs];
  }

  // 获取运行中的任务
  getRunningJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  // 添加新的定时任务
  addJob(config: CronJobConfig): void {
    if (this.jobConfigs.some((j) => j.id === config.id)) {
      throw new Error(`定时任务ID已存在: ${config.id}`);
    }

    this.jobConfigs.push(config);

    if (config.enabled) {
      this.scheduleJob(config);
    }

    console.log(`✅ 添加定时任务: ${config.name}`);
  }

  // 更新定时任务
  updateJob(jobId: string, updates: Partial<CronJobConfig>): boolean {
    const index = this.jobConfigs.findIndex((j) => j.id === jobId);
    if (index === -1) {
      return false;
    }

    const oldJob = this.jobConfigs[index];
    const updatedJob = { ...oldJob, ...updates };
    this.jobConfigs[index] = updatedJob;

    // 如果任务正在运行，重新调度
    if (this.jobs.has(jobId)) {
      clearInterval(this.jobs.get(jobId)!);
      this.jobs.delete(jobId);

      if (updatedJob.enabled) {
        this.scheduleJob(updatedJob);
      }
    } else if (updatedJob.enabled) {
      this.scheduleJob(updatedJob);
    }

    console.log(`✅ 更新定时任务: ${jobId}`);
    return true;
  }

  // 删除定时任务
  removeJob(jobId: string): boolean {
    const index = this.jobConfigs.findIndex((j) => j.id === jobId);
    if (index === -1) {
      return false;
    }

    // 停止运行中的任务
    if (this.jobs.has(jobId)) {
      clearInterval(this.jobs.get(jobId)!);
      this.jobs.delete(jobId);
    }

    this.jobConfigs.splice(index, 1);
    console.log(`✅ 删除定时任务: ${jobId}`);
    return true;
  }
}

// 导出实例
export const dataQualityCronService = new DataQualityCronService();
