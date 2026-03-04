/**
 * 日志分析服务
 * 提供日志收集、分析、异常检测和可视化功? */

import { Logger, LogLevel } from '@/tech/utils/logger';

// 日志条目接口
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  traceId?: string;
}

// 日志分析配置接口
export interface LogAnalysisConfig {
  retentionDays: number;
  analysisInterval: number; // 分析间隔（毫秒）
  anomalyThreshold: number; // 异常检测阈?  batchSize: number; // 批处理大?}

// 异常检测规则接?export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  category: 'performance' | 'security' | 'business' | 'system';
}

// 日志分析结果接口
export interface LogAnalysisResult {
  timestamp: Date;
  totalLogs: number;
  logLevels: Record<LogLevel, number>;
  topServices: Array<{ service: string; count: number }>;
  anomalies: LogAnomaly[];
  performanceMetrics: PerformanceMetrics;
  securityIssues: SecurityIssue[];
}

// 日志异常接口
export interface LogAnomaly {
  id: string;
  timestamp: Date;
  ruleId: string;
  message: string;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  suggestedActions: string[];
}

// 性能指标接口
export interface PerformanceMetrics {
  avgResponseTime: number;
  errorRate: number;
  throughput: number;
  slowQueries: Array<{ query: string; duration: number; count: number }>;
}

// 安全问题接口
export interface SecurityIssue {
  id: string;
  timestamp: Date;
  type:
    | 'brute_force'
    | 'unauthorized_access'
    | 'suspicious_activity'
    | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  affectedResources: string[];
  remediationSteps: string[];
}

// 日志聚合统计接口
export interface LogAggregation {
  timeWindow: { start: Date; end: Date };
  byLevel: Record<LogLevel, number>;
  byService: Record<string, number>;
  byUser: Record<string, number>;
  errorPatterns: Array<{ pattern: string; count: number }>;
}

export class LogAnalyzerService {
  private static instance: LogAnalyzerService;
  private config: LogAnalysisConfig;
  private anomalyRules: AnomalyRule[] = [];
  private logger: Logger;
  private analysisTimer: NodeJS.Timeout | null = null;
  private logBuffer: LogEntry[] = [];
  private bufferSize: number = 1000;

  private constructor(config?: Partial<LogAnalysisConfig>) {
    this.logger = new Logger('LogAnalyzerService', LogLevel.INFO);
    this.config = {
      retentionDays: 30,
      analysisInterval: 300000, // 5分钟
      anomalyThreshold: 0.1, // 10%异常率阈?      batchSize: 100,
      ...config,
    };

    this.initializeAnomalyRules();
  }

  static getInstance(config?: Partial<LogAnalysisConfig>): LogAnalyzerService {
    if (!LogAnalyzerService.instance) {
      LogAnalyzerService.instance = new LogAnalyzerService(config);
    }
    return LogAnalyzerService.instance;
  }

  /**
   * 初始化异常检测规?   */
  private initializeAnomalyRules(): void {
    this.anomalyRules = [
      {
        id: 'high_error_rate',
        name: '高错误率检?,
        description: '检测短时间内错误日志激增的情况',
        pattern: /error|exception|failed|timeout/i,
        severity: 'high',
        enabled: true,
        category: 'system',
      },
      {
        id: 'security_violation',
        name: '安全违规检?,
        description: '检测潜在的安全威胁和未授权访问',
        pattern: /unauthorized|forbidden|invalid token|brute force/i,
        severity: 'critical',
        enabled: true,
        category: 'security',
      },
      {
        id: 'performance_degradation',
        name: '性能下降检?,
        description: '检测响应时间异常和系统性能问题',
        pattern: /slow|timeout|delay|performance degradation/i,
        severity: 'medium',
        enabled: true,
        category: 'performance',
      },
      {
        id: 'business_anomaly',
        name: '业务异常检?,
        description: '检测业务逻辑相关的异常情?,
        pattern:
          /validation failed|data inconsistency|business rule violation/i,
        severity: 'high',
        enabled: true,
        category: 'business',
      },
      {
        id: 'resource_exhaustion',
        name: '资源耗尽检?,
        description: '检测内存、CPU、磁盘等资源使用异常',
        pattern: /out of memory|disk full|cpu usage|resource exhausted/i,
        severity: 'critical',
        enabled: true,
        category: 'system',
      },
    ];
  }

  /**
   * 添加日志条目到缓冲区
   */
  addLogEntry(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // 当缓冲区达到指定大小时触发分?    if (this.logBuffer.length >= this.bufferSize) {
      this.triggerAnalysis();
    }
  }

  /**
   * 触发即时分析
   */
  triggerAnalysis(): Promise<LogAnalysisResult> {
    return this.analyzeLogs(this.logBuffer.splice(0));
  }

  /**
   * 启动定时分析
   */
  startScheduledAnalysis(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
    }

    this.analysisTimer = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.triggerAnalysis().catch(error => {
          this.logger.error('定时日志分析失败', { error: error.message });
        });
      }
    }, this.config.analysisInterval);

    this.logger.info('启动定时日志分析', {
      interval: this.config.analysisInterval,
    });
  }

  /**
   * 停止定时分析
   */
  stopScheduledAnalysis(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
      this.logger.info('停止定时日志分析');
    }
  }

  /**
   * 分析日志数据
   */
  private async analyzeLogs(entries: LogEntry[]): Promise<LogAnalysisResult> {
    const startTime = Date.now();

    try {
      // 基础统计分析
      const logLevels: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
      };

      const serviceCounts: Record<string, number> = {};
      const anomalies: LogAnomaly[] = [];

      // 处理每个日志条目
      for (const entry of entries) {
        // 统计日志级别
        logLevels[entry.level]++;

        // 统计服务调用次数
        if (entry?.service) {
          serviceCounts[entry.context.service] =
            (serviceCounts[entry.context.service] || 0) + 1;
        }

        // 异常检?        const detectedAnomalies = this.detectAnomalies(entry);
        anomalies.push(...detectedAnomalies);
      }

      // 获取Top服务列表
      const topServices = Object.entries(serviceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([service, count]) => ({ service, count }));

      // 性能指标分析
      const performanceMetrics = await this.analyzePerformance(entries);

      // 安全问题分析
      const securityIssues = this.analyzeSecurity(entries);

      const result: LogAnalysisResult = {
        timestamp: new Date(),
        totalLogs: entries.length,
        logLevels,
        topServices,
        anomalies,
        performanceMetrics,
        securityIssues,
      };

      const analysisTime = Date.now() - startTime;
      this.logger.info('日志分析完成', {
        totalEntries: entries.length,
        analysisTimeMs: analysisTime,
        anomaliesFound: anomalies.length,
      });

      return result;
    } catch (error) {
      this.logger.error('日志分析失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 检测单个日志条目的异常
   */
  private detectAnomalies(entry: LogEntry): LogAnomaly[] {
    const anomalies: LogAnomaly[] = [];

    for (const rule of this.anomalyRules.filter(r => r.enabled)) {
      if (rule.pattern.test(entry.message.toLowerCase())) {
        const anomaly: LogAnomaly = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: entry.timestamp,
          ruleId: rule.id,
          message: entry.message,
          context: entry.context || {},
          severity: rule.severity,
          category: rule.category,
          suggestedActions: this.getSuggestedActions(rule.id, entry),
        };

        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * 根据异常类型提供修复建议
   */
  private getSuggestedActions(ruleId: string, entry: LogEntry): string[] {
    const actionsMap: Record<string, string[]> = {
      high_error_rate: [
        '检查相关服务的健康状?,
        '查看系统资源使用情况',
        '审查最近的代码变更',
        '联系相关团队进行问题排查',
      ],
      security_violation: [
        '立即审查访问日志',
        '检查用户权限配?,
        '临时封锁可疑IP地址',
        '通知安全团队进行深入调查',
      ],
      performance_degradation: [
        '检查数据库查询性能',
        '分析系统资源使用情况',
        '考虑增加缓存策略',
        '优化相关业务逻辑',
      ],
      business_anomaly: [
        '验证数据一致性和完整?,
        '检查业务规则配?,
        '审查相关业务流程',
        '联系业务方确认预期行?,
      ],
      resource_exhaustion: [
        '立即扩容相关资源',
        '检查内存泄漏问?,
        '优化资源使用策略',
        '设置更严格的资源限制',
      ],
    };

    return actionsMap[ruleId] || ['需要进一步分析具体情?];
  }

  /**
   * 性能指标分析
   */
  private async analyzePerformance(
    entries: LogEntry[]
  ): Promise<PerformanceMetrics> {
    const errorEntries = entries.filter(e => e.level === LogLevel.ERROR);
    const httpEntries = entries.filter(e => e?.httpRequest);

    // 计算错误?    const errorRate =
      entries.length > 0 ? errorEntries.length / entries.length : 0;

    // 计算平均响应时间（如果有HTTP请求上下文）
    let totalDuration = 0;
    let httpCount = 0;

    for (const entry of httpEntries) {
      if (entry?.httpRequest?.duration) {
        totalDuration += entry.context.httpRequest.duration;
        httpCount++;
      }
    }

    const avgResponseTime = httpCount > 0 ? totalDuration / httpCount : 0;

    // 识别慢查询（假设数据库查询日志有duration字段?    const slowQueries = this.identifySlowQueries(entries);

    return {
      avgResponseTime,
      errorRate,
      throughput: entries.length,
      slowQueries,
    };
  }

  /**
   * 识别慢查?   */
  private identifySlowQueries(
    entries: LogEntry[]
  ): Array<{ query: string; duration: number; count: number }> {
    const queryMap: Record<string, { duration: number; count: number }> = {};

    for (const entry of entries) {
      if (entry?.query && entry?.duration) {
        const queryKey = entry.context.query.substring(0, 100); // 截取?00字符作为?        if (!queryMap[queryKey]) {
          queryMap[queryKey] = { duration: 0, count: 0 };
        }
        queryMap[queryKey].duration += entry.context.duration;
        queryMap[queryKey].count++;
      }
    }

    // 返回平均执行时间超过阈值的查询
    return Object.entries(queryMap)
      .filter(
        ([, stats]) => stats.count > 0 && stats.duration / stats.count > 1000
      ) // 超过1�?      .map(([query, stats]) => ({
        query,
        duration: stats.duration / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  /**
   * 安全问题分析
   */
  private analyzeSecurity(entries: LogEntry[]): SecurityIssue[] {
    const securityIssues: SecurityIssue[] = [];
    const securityEntries = entries.filter(e =>
      /unauthorized|forbidden|invalid token|login failed|brute force/i.test(
        e.message
      )
    );

    if (securityEntries.length > 0) {
      // 检测暴力破解尝?      const bruteForceAttempts = this.detectBruteForce(securityEntries);
      securityIssues.push(...bruteForceAttempts);

      // 检测未授权访问
      const unauthorizedAccess = this.detectUnauthorizedAccess(securityEntries);
      securityIssues.push(...unauthorizedAccess);
    }

    return securityIssues;
  }

  /**
   * 检测暴力破解尝?   */
  private detectBruteForce(entries: LogEntry[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const ipAttempts: Record<string, number> = {};

    for (const entry of entries) {
      const ip = entry?.ipAddress || entry?.clientIp;
      if (ip && /login failed|invalid credentials/i.test(entry.message)) {
        ipAttempts[ip] = (ipAttempts[ip] || 0) + 1;
      }
    }

    // 如果某个IP的失败尝试超过阈值，则标记为暴力破解
    for (const [ip, count] of Object.entries(ipAttempts)) {
      if (count > 5) {
        // 5次失败尝试阈?        issues.push({
          id: `brute_force_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          type: 'brute_force',
          severity: count > 10 ? 'critical' : 'high',
          details: { ipAddress: ip, failedAttempts: count },
          affectedResources: ['authentication'],
          remediationSteps: [
            `临时封锁IP地址: ${ip}`,
            '检查账户锁定策?,
            '审查登录日志',
            '通知安全团队',
          ],
        });
      }
    }

    return issues;
  }

  /**
   * 检测未授权访问
   */
  private detectUnauthorizedAccess(entries: LogEntry[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    const unauthorizedEntries = entries.filter(e =>
      /unauthorized|forbidden|access denied/i.test(e.message)
    );

    if (unauthorizedEntries.length > 0) {
      issues.push({
        id: `unauthorized_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type: 'unauthorized_access',
        severity: 'high',
        details: {
          totalCount: unauthorizedEntries.length,
          sampleMessages: unauthorizedEntries.slice(0, 3).map(e => e.message),
        },
        affectedResources: ['protected_endpoints', 'sensitive_data'],
        remediationSteps: [
          '审查权限配置',
          '检查认证令牌有效?,
          '验证用户角色分配',
          '加强访问控制策略',
        ],
      });
    }

    return issues;
  }

  /**
   * 获取日志聚合统计
   */
  async getLogAggregation(
    timeWindowHours: number = 24
  ): Promise<LogAggregation> {
    const endTime = new Date();
    const startTime = new Date(
      endTime.getTime() - timeWindowHours * 60 * 60 * 1000
    );

    // 这里应该从持久化存储中获取日志数?    // 当前使用内存缓冲区的数据作为示例
    const recentLogs = this.logBuffer.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );

    const byLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
    };

    const byService: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const errorPatterns: Array<{ pattern: string; count: number }> = [];

    for (const log of recentLogs) {
      byLevel[log.level]++;

      if (log?.service) {
        byService[log.context.service] =
          (byService[log.context.service] || 0) + 1;
      }

      if (log?.userId) {
        byUser[log.context.userId] = (byUser[log.context.userId] || 0) + 1;
      }

      if (log.level === LogLevel.ERROR) {
        // 简单的错误模式识别
        const pattern = log.message
          .toLowerCase()
          .split(' ')
          .slice(0, 3)
          .join(' ');
        const existingPattern = errorPatterns.find(p => p.pattern === pattern);
        if (existingPattern) {
          existingPattern.count++;
        } else {
          errorPatterns.push({ pattern, count: 1 });
        }
      }
    }

    return {
      timeWindow: { start: startTime, end: endTime },
      byLevel,
      byService,
      byUser,
      errorPatterns: errorPatterns
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<LogAnalysisConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('更新日志分析配置', config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): LogAnalysisConfig {
    return { ...this.config };
  }

  /**
   * 清理过期日志数据
   */
  async cleanupExpiredLogs(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
    );

    // 清理缓冲区中的过期日?    this.logBuffer = this.logBuffer.filter(log => log.timestamp > cutoffDate);

    this.logger.info('清理过期日志完成', {
      retentionDays: this.config.retentionDays,
      remainingLogs: this.logBuffer.length,
    });
  }

  /**
   * 导出分析报告
   */
  async exportAnalysisReport(format: 'json' | 'csv' = 'json'): Promise<string> {
    const aggregation = await this.getLogAggregation(24);
    const analysis = await this.triggerAnalysis();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLogs: analysis.totalLogs,
        errorRate: analysis.performanceMetrics.errorRate,
        anomaliesDetected: analysis.anomalies.length,
        securityIssues: analysis.securityIssues.length,
      },
      logDistribution: analysis.logLevels,
      topServices: analysis.topServices,
      anomalies: analysis.anomalies,
      securityIssues: analysis.securityIssues,
      aggregation,
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      // CSV格式导出（简化版本）
      return this.convertToCSV(report);
    }
  }

  private convertToCSV(data: any): string {
    // 简化的CSV转换逻辑
    return JSON.stringify(data, null, 2); // 实际项目中应实现真正的CSV转换
  }

  /**
   * 关闭服务
   */
  async shutdown(): Promise<void> {
    this.stopScheduledAnalysis();
    await this.cleanupExpiredLogs();
    this.logger.info('日志分析服务已关?);
  }
}

// 导出默认实例
export const logAnalyzerService = LogAnalyzerService.getInstance();
