/**
 * 结构化日志分析服? * FixCycle 6.0 日志系统核心组件
 */

export interface LogEntry {
  /** 日志ID */
  id: string;
  /** 时间?*/
  timestamp: number;
  /** 日志级别 */
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  /** 服务名称 */
  service: string;
  /** 模块名称 */
  module: string;
  /** 日志消息 */
  message: string;
  /** 错误堆栈 */
  stack?: string;
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId?: string;
  /** 请求ID */
  requestId?: string;
  /** IP地址 */
  ip?: string;
  /** 用户代理 */
  userAgent?: string;
  /** 额外上下文数?*/
  context?: Record<string, any>;
  /** 标签 */
  tags?: string[];
}

export interface LogAggregation {
  /** 聚合字段 */
  field: string;
  /** 聚合?*/
  value: string;
  /** 计数 */
  count: number;
  /** 时间范围 */
  timeRange: {
    start: number;
    end: number;
  };
}

export interface LogSearchResult {
  /** 匹配的日志条?*/
  entries: LogEntry[];
  /** 总数 */
  total: number;
  /** 聚合结果 */
  aggregations: LogAggregation[];
  /** 执行时间 */
  executionTime: number;
}

export interface LogAnalysisConfig {
  /** 日志保留天数 */
  retentionDays: number;
  /** 日志轮转大小(MB) */
  rotationSize: number;
  /** 最大日志文件数 */
  maxFiles: number;
  /** 启用的分析规?*/
  analysisRules: string[];
  /** 告警阈值配?*/
  alertThresholds: Record<string, number>;
}

export class LogAnalyzer {
  private logStorage: LogEntry[] = [];
  private config: LogAnalysisConfig;
  private analysisRules: Map<string, (log: LogEntry) => boolean> = new Map();

  constructor(config?: Partial<LogAnalysisConfig>) {
    this.config = {
      retentionDays: 30,
      rotationSize: 100,
      maxFiles: 10,
      analysisRules: ['error_pattern', 'slow_request', 'security_violation'],
      alertThresholds: {
        error_rate: 0.05,
        slow_request: 2000,
        security_events: 10,
      },
      ...config,
    };

    this.initializeAnalysisRules();
    this.startCleanupJob();
  }

  /**
   * 初始化分析规?   */
  private initializeAnalysisRules(): void {
    // 错误模式检?    this.analysisRules.set('error_pattern', (log: LogEntry) => {
      return log.level === 'error' || log.level === 'fatal';
    });

    // 慢请求检?    this.analysisRules.set('slow_request', (log: LogEntry) => {
      if (log.context?.responseTime) {
        return (
          log.context.responseTime > this.config.alertThresholds.slow_request
        );
      }
      return false;
    });

    // 安全违规检?    this.analysisRules.set('security_violation', (log: LogEntry) => {
      const securityKeywords = [
        'unauthorized',
        'forbidden',
        'xss',
        'sql injection',
        'csrf',
      ];
      const message = log.message.toLowerCase();
      return securityKeywords.some(keyword => message.includes(keyword));
    });

    // 异常用户行为检?    this.analysisRules.set('anomalous_behavior', (log: LogEntry) => {
      if (log.context?.requestCount) {
        return log.context.requestCount > 1000; // 异常高频请求
      }
      return false;
    });
  }

  /**
   * 记录日志
   */
  log(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      ...entry,
    };

    this.logStorage.push(logEntry);

    // 执行实时分析
    this.analyzeLog(logEntry);

    // 清理过期日志
    this.cleanupExpiredLogs();
  }

  /**
   * 搜索日志
   */
  searchLogs(query: {
    level?: string;
    service?: string;
    module?: string;
    message?: string;
    userId?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
    offset?: number;
  }): LogSearchResult {
    const startTime = Date.now();

    let filteredLogs = this.logStorage.filter(log => {
      // 时间范围过滤
      if (query.startTime && log.timestamp < query.startTime) return false;
      if (query.endTime && log.timestamp > query.endTime) return false;

      // 精确匹配过滤
      if (query.level && log.level !== query.level) return false;
      if (query.service && log.service !== query.service) return false;
      if (query.module && log.module !== query.module) return false;
      if (query.userId && log.userId !== query.userId) return false;

      // 消息模糊匹配
      if (
        query.message &&
        !log.message.toLowerCase().includes(query.message.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // 排序（最新的在前?    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    // 分页
    const limit = query.limit || 100;
    const offset = query.offset || 0;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // 聚合分析
    const aggregations = this.performAggregations(filteredLogs);

    return {
      entries: paginatedLogs,
      total: filteredLogs.length,
      aggregations,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * 执行聚合分析
   */
  private performAggregations(logs: LogEntry[]): LogAggregation[] {
    const aggregations: LogAggregation[] = [];

    // 按服务聚?    const serviceCounts = new Map<string, number>();
    logs.forEach(log => {
      serviceCounts.set(log.service, (serviceCounts.get(log.service) || 0) + 1);
    });

    serviceCounts.forEach((count, service) => {
      aggregations.push({
        field: 'service',
        value: service,
        count,
        timeRange: {
          start: Math.min(...logs.map(l => l.timestamp)),
          end: Math.max(...logs.map(l => l.timestamp)),
        },
      });
    });

    // 按级别聚?    const levelCounts = new Map<string, number>();
    logs.forEach(log => {
      levelCounts.set(log.level, (levelCounts.get(log.level) || 0) + 1);
    });

    levelCounts.forEach((count, level) => {
      aggregations.push({
        field: 'level',
        value: level,
        count,
        timeRange: {
          start: Math.min(...logs.map(l => l.timestamp)),
          end: Math.max(...logs.map(l => l.timestamp)),
        },
      });
    });

    return aggregations;
  }

  /**
   * 分析单条日志
   */
  private analyzeLog(log: LogEntry): void {
    const triggeredRules: string[] = [];

    for (const [ruleName, ruleFn] of this.analysisRules.entries()) {
      if (ruleFn(log)) {
        triggeredRules.push(ruleName);
      }
    }

    if (triggeredRules.length > 0) {
      // 记录分析结果
      this.log({
        level: 'info',
        service: 'log-analyzer',
        module: 'analysis',
        message: `Log analysis triggered rules: ${triggeredRules.join(', ')}`,
        context: {
          originalLogId: log.id,
          triggeredRules,
          logLevel: log.level,
          service: log.service,
        },
      });

      // 触发相关告警
      this.triggerAnalysisAlerts(log, triggeredRules);
    }
  }

  /**
   * 触发分析告警
   */
  private triggerAnalysisAlerts(log: LogEntry, rules: string[]): void {
    rules.forEach(rule => {
      switch (rule) {
        case 'error_pattern':
          if (log.level === 'fatal') {
            this.createAlert('fatal_error_detected', log, 'critical');
          }
          break;

        case 'slow_request':
          this.createAlert('slow_request_detected', log, 'warning');
          break;

        case 'security_violation':
          this.createAlert('security_violation_detected', log, 'error');
          break;

        case 'anomalous_behavior':
          this.createAlert('anomalous_user_behavior', log, 'warning');
          break;
      }
    });
  }

  /**
   * 创建告警
   */
  private createAlert(
    alertType: string,
    log: LogEntry,
    severity: string
  ): void {
    this.log({
      level: 'warn',
      service: 'alert-system',
      module: 'log-analysis',
      message: `Alert created: ${alertType}`,
      context: {
        alertType,
        severity,
        originalLog: {
          id: log.id,
          message: log.message,
          level: log.level,
          service: log.service,
        },
      },
    });
  }

  /**
   * 清理过期日志
   */
  private cleanupExpiredLogs(): void {
    const cutoffTime =
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const initialLength = this.logStorage.length;

    this.logStorage = this.logStorage.filter(log => log.timestamp > cutoffTime);

    if (initialLength !== this.logStorage.length) {
      this.log({
        level: 'info',
        service: 'log-analyzer',
        module: 'cleanup',
        message: `Cleaned up ${initialLength - this.logStorage.length} expired logs`,
      });
    }
  }

  /**
   * 启动定时清理任务
   */
  private startCleanupJob(): void {
    setInterval(
      () => {
        this.cleanupExpiredLogs();
      },
      60 * 60 * 1000
    ); // 每小时执行一?  }

  /**
   * 生成日志ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsByService: Record<string, number>;
    retentionDays: number;
    oldestLog: number | null;
    newestLog: number | null;
  } {
    const logsByLevel: Record<string, number> = {};
    const logsByService: Record<string, number> = {};

    this.logStorage.forEach(log => {
      logsByLevel[log.level] = (logsByLevel[log.level] || 0) + 1;
      logsByService[log.service] = (logsByService[log.service] || 0) + 1;
    });

    const timestamps = this.logStorage.map(log => log.timestamp);

    return {
      totalLogs: this.logStorage.length,
      logsByLevel,
      logsByService,
      retentionDays: this.config.retentionDays,
      oldestLog: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestLog: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  /**
   * 导出日志
   */
  exportLogs(
    format: 'json' | 'csv' = 'json',
    options?: {
      startTime?: number;
      endTime?: number;
      service?: string;
      level?: string;
    }
  ): string {
    let filteredLogs = this.logStorage;

    if (options) {
      filteredLogs = filteredLogs.filter(log => {
        if (options.startTime && log.timestamp < options.startTime)
          return false;
        if (options.endTime && log.timestamp > options.endTime) return false;
        if (options.service && log.service !== options.service) return false;
        if (options.level && log.level !== options.level) return false;
        return true;
      });
    }

    if (format === 'json') {
      return JSON.stringify(filteredLogs, null, 2);
    } else {
      // CSV格式导出
      const headers = [
        'timestamp',
        'level',
        'service',
        'module',
        'message',
        'userId',
      ];
      const csvRows = [headers.join(',')];

      filteredLogs.forEach(log => {
        const row = [
          new Date(log.timestamp).toISOString(),
          log.level,
          log.service,
          log.module,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || '',
        ].join(',');
        csvRows.push(row);
      });

      return csvRows.join('\n');
    }
  }

  /**
   * 获取热门错误模式
   */
  getTopErrorPatterns(
    limit: number = 10
  ): Array<{ pattern: string; count: number; examples: string[] }> {
    const errorLogs = this.logStorage.filter(
      log => log.level === 'error' || log.level === 'fatal'
    );

    const patternMap = new Map<string, { count: number; examples: string[] }>();

    errorLogs.forEach(log => {
      // 提取错误模式（简化版?      const pattern = log.message.split(':')[0] || log.message.substring(0, 50);

      if (patternMap.has(pattern)) {
        const existing = patternMap.get(pattern)!;
        existing.count++;
        if (existing.examples.length < 3) {
          existing.examples.push(log.message);
        }
      } else {
        patternMap.set(pattern, {
          count: 1,
          examples: [log.message],
        });
      }
    });

    return Array.from(patternMap.entries())
      .map(([pattern, data]) => ({ pattern, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取服务健康度报?   */
  getServiceHealthReport(): Record<
    string,
    {
      status: 'healthy' | 'degraded' | 'unhealthy';
      errorRate: number;
      avgResponseTime: number;
      requestCount: number;
    }
  > {
    const report: Record<string, any> = {};
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentLogs = this.logStorage.filter(
      log => log.timestamp > oneHourAgo
    );

    // 按服务分?    const services = [...new Set(recentLogs.map(log => log.service))];

    services.forEach(service => {
      const serviceLogs = recentLogs.filter(log => log.service === service);
      const errorLogs = serviceLogs.filter(
        log => log.level === 'error' || log.level === 'fatal'
      );

      const requestLogs = serviceLogs.filter(
        log => log.context?.responseTime !== undefined
      );

      const errorRate =
        serviceLogs.length > 0 ? errorLogs.length / serviceLogs.length : 0;
      const avgResponseTime =
        requestLogs.length > 0
          ? requestLogs.reduce(
              (sum, log) => sum + (log.context?.responseTime || 0),
              0
            ) / requestLogs.length
          : 0;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (errorRate > 0.1 || avgResponseTime > 5000) {
        status = 'unhealthy';
      } else if (errorRate > 0.05 || avgResponseTime > 2000) {
        status = 'degraded';
      }

      report[service] = {
        status,
        errorRate: Number(errorRate.toFixed(4)),
        avgResponseTime: Number(avgResponseTime.toFixed(2)),
        requestCount: serviceLogs.length,
      };
    });

    return report;
  }
}

// 导出全局日志分析器实?export const logAnalyzer = new LogAnalyzer();
