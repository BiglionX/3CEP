// 增强型监控库 - 整合Prometheus指标收集、业务指标、性能追踪
import { Counter, Gauge, Histogram, Summary, Registry } from 'prom-client';
import { performance } from 'perf_hooks';

// 监控指标接口
interface MetricLabels {
  [key: string]: string | number;
}

interface BusinessMetric {
  name: string;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

interface PerformanceTrace {
  traceId: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  labels?: MetricLabels;
}

// 认证相关指标
interface AuthMetrics {
  loginAttempts: Counter;
  loginSuccess: Counter;
  loginFailures: Counter;
  logoutCount: Counter;
  activeSessions: Gauge;
  sessionDuration: Histogram;
  authLatency: Histogram;
}

// API性能指标
interface ApiMetrics {
  requestCount: Counter;
  requestDuration: Histogram;
  requestErrors: Counter;
  responseSize: Summary;
  activeRequests: Gauge;
}

// 业务指标
interface BusinessMetrics {
  userRegistrations: Counter;
  successfulOperations: Counter;
  failedOperations: Counter;
  businessLatency: Histogram;
  concurrentUsers: Gauge;
}

// 系统资源指标
interface SystemMetrics {
  cpuUsage: Gauge;
  memoryUsage: Gauge;
  heapUsed: Gauge;
  heapTotal: Gauge;
  eventLoopLag: Gauge;
}

export class EnhancedMonitoring {
  private static instance: EnhancedMonitoring;
  private registry: Registry;
  private authMetrics!: AuthMetrics;
  private apiMetrics!: ApiMetrics;
  private businessMetrics!: BusinessMetrics;
  private systemMetrics!: SystemMetrics;
  private businessMetricsBuffer: BusinessMetric[] = [];
  private traces: Map<string, PerformanceTrace> = new Map();
  private readonly BUFFER_SIZE = 1000;

  private constructor() {
    this.registry = new Registry();
    this.setupMetrics();
    this.startSystemMonitoring();
  }

  public static getInstance(): EnhancedMonitoring {
    if (!EnhancedMonitoring.instance) {
      EnhancedMonitoring.instance = new EnhancedMonitoring();
    }
    return EnhancedMonitoring.instance;
  }

  // 设置所有监控指?  private setupMetrics(): void {
    // 认证指标
    this.authMetrics = {
      loginAttempts: new Counter({
        name: 'auth_login_attempts_total',
        help: 'Total number of login attempts',
        labelNames: ['method', 'result'],
        registers: [this.registry],
      }),
      loginSuccess: new Counter({
        name: 'auth_login_success_total',
        help: 'Total number of successful logins',
        labelNames: ['method'],
        registers: [this.registry],
      }),
      loginFailures: new Counter({
        name: 'auth_login_failures_total',
        help: 'Total number of failed logins',
        labelNames: ['reason'],
        registers: [this.registry],
      }),
      logoutCount: new Counter({
        name: 'auth_logout_total',
        help: 'Total number of logouts',
        registers: [this.registry],
      }),
      activeSessions: new Gauge({
        name: 'auth_active_sessions',
        help: 'Current number of active sessions',
        registers: [this.registry],
      }),
      sessionDuration: new Histogram({
        name: 'auth_session_duration_seconds',
        help: 'Session duration in seconds',
        buckets: [60, 300, 600, 1800, 3600, 7200],
        registers: [this.registry],
      }),
      authLatency: new Histogram({
        name: 'auth_operation_latency_seconds',
        help: 'Authentication operation latency',
        labelNames: ['operation'],
        buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
        registers: [this.registry],
      }),
    };

    // API指标
    this.apiMetrics = {
      requestCount: new Counter({
        name: 'http_requests_total',
        help: 'Total HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
      }),
      requestDuration: new Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      }),
      requestErrors: new Counter({
        name: 'http_request_errors_total',
        help: 'Total HTTP request errors',
        labelNames: ['method', 'route', 'error_type'],
        registers: [this.registry],
      }),
      responseSize: new Summary({
        name: 'http_response_size_bytes',
        help: 'HTTP response size in bytes',
        labelNames: ['method', 'route'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
        registers: [this.registry],
      }),
      activeRequests: new Gauge({
        name: 'http_active_requests',
        help: 'Current number of active HTTP requests',
        registers: [this.registry],
      }),
    };

    // 业务指标
    this.businessMetrics = {
      userRegistrations: new Counter({
        name: 'business_user_registrations_total',
        help: 'Total user registrations',
        labelNames: ['source'],
        registers: [this.registry],
      }),
      successfulOperations: new Counter({
        name: 'business_operations_successful_total',
        help: 'Total successful business operations',
        labelNames: ['operation_type'],
        registers: [this.registry],
      }),
      failedOperations: new Counter({
        name: 'business_operations_failed_total',
        help: 'Total failed business operations',
        labelNames: ['operation_type', 'reason'],
        registers: [this.registry],
      }),
      businessLatency: new Histogram({
        name: 'business_operation_latency_seconds',
        help: 'Business operation latency',
        labelNames: ['operation_type'],
        buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
        registers: [this.registry],
      }),
      concurrentUsers: new Gauge({
        name: 'business_concurrent_users',
        help: 'Current number of concurrent users',
        registers: [this.registry],
      }),
    };

    // 系统指标
    this.systemMetrics = {
      cpuUsage: new Gauge({
        name: 'nodejs_cpu_usage_percent',
        help: 'Node.js CPU usage percentage',
        registers: [this.registry],
      }),
      memoryUsage: new Gauge({
        name: 'nodejs_memory_usage_percent',
        help: 'Node.js memory usage percentage',
        registers: [this.registry],
      }),
      heapUsed: new Gauge({
        name: 'nodejs_heap_used_bytes',
        help: 'Node.js heap used in bytes',
        registers: [this.registry],
      }),
      heapTotal: new Gauge({
        name: 'nodejs_heap_total_bytes',
        help: 'Node.js heap total in bytes',
        registers: [this.registry],
      }),
      eventLoopLag: new Gauge({
        name: 'nodejs_eventloop_lag_seconds',
        help: 'Node.js event loop lag in seconds',
        registers: [this.registry],
      }),
    };
  }

  // 开始系统监?  private startSystemMonitoring(): void {
    // 定期收集系统指标
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // �?秒收集一?
    // 监控事件循环延迟
    this.monitorEventLoopLag();
  }

  // 收集系统指标
  private collectSystemMetrics(): void {
    // CPU使用率（简化计算）
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // 转换为百分比
    this.systemMetrics.cpuUsage.set(cpuPercent);

    // 内存使用?    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    this.systemMetrics.memoryUsage.set(memoryPercent);
    this.systemMetrics.heapUsed.set(memoryUsage.heapUsed);
    this.systemMetrics.heapTotal.set(memoryUsage.heapTotal);
  }

  // 监控事件循环延迟
  private monitorEventLoopLag(): void {
    const start = performance.now();
    setImmediate(() => {
      const lag = performance.now() - start;
      this.systemMetrics.eventLoopLag.set(lag / 1000); // 转换为秒
    });
  }

  // 认证指标记录
  public recordLoginAttempt(
    method: string,
    success: boolean,
    failureReason?: string
  ): void {
    this.authMetrics.loginAttempts.inc({
      method,
      result: success ? 'success' : 'failure',
    });

    if (success) {
      this.authMetrics.loginSuccess.inc({ method });
    } else {
      this.authMetrics.loginFailures.inc({
        reason: failureReason || 'unknown',
      });
    }
  }

  public recordLogout(): void {
    this.authMetrics.logoutCount.inc();
  }

  public updateActiveSessions(count: number): void {
    this.authMetrics.activeSessions.set(count);
  }

  public recordSessionDuration(durationSeconds: number): void {
    this.authMetrics.sessionDuration.observe(durationSeconds);
  }

  public recordAuthLatency(operation: string, durationSeconds: number): void {
    this.authMetrics.authLatency.observe({ operation }, durationSeconds);
  }

  // API指标记录
  public startHttpRequest(method: string, route: string): string {
    const traceId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.traces.set(traceId, {
      traceId,
      operation: `${method} ${route}`,
      startTime: performance.now(),
      labels: { method, route },
    });

    this.apiMetrics.activeRequests.inc();
    return traceId;
  }

  public endHttpRequest(
    traceId: string,
    statusCode: number,
    responseSize: number
  ): void {
    const trace = this.traces.get(traceId);
    if (trace) {
      const duration = (performance.now() - trace.startTime) / 1000; // 转换为秒

      const labels = {
        method: trace?.method || 'unknown',
        route: trace?.route || 'unknown',
        status_code: statusCode.toString(),
      };

      this.apiMetrics.requestCount.inc(labels);
      this.apiMetrics.requestDuration.observe(labels, duration);
      this.apiMetrics.responseSize.observe(labels, responseSize);
      this.apiMetrics.activeRequests.dec();

      // 记录错误
      if (statusCode >= 400) {
        this.apiMetrics.requestErrors.inc({
          method: labels.method,
          route: labels.route,
          error_type: statusCode >= 500 ? 'server_error' : 'client_error',
        });
      }

      this.traces.delete(traceId);
    }
  }

  // 业务指标记录
  public recordUserRegistration(source: string = 'direct'): void {
    this.businessMetrics.userRegistrations.inc({ source });
  }

  public recordSuccessfulOperation(operationType: string): void {
    this.businessMetrics.successfulOperations.inc({
      operation_type: operationType,
    });
  }

  public recordFailedOperation(operationType: string, reason: string): void {
    this.businessMetrics.failedOperations.inc({
      operation_type: operationType,
      reason,
    });
  }

  public recordBusinessLatency(
    operationType: string,
    durationSeconds: number
  ): void {
    this.businessMetrics.businessLatency.observe(
      { operation_type: operationType },
      durationSeconds
    );
  }

  public updateConcurrentUsers(count: number): void {
    this.businessMetrics.concurrentUsers.set(count);
  }

  // 记录自定义业务指?  public recordCustomMetric(
    name: string,
    value: number,
    labels?: MetricLabels
  ): void {
    const metric: BusinessMetric = {
      name,
      value,
      labels,
      timestamp: new Date(),
    };

    this.businessMetricsBuffer.push(metric);

    // 维持缓冲区大?    if (this.businessMetricsBuffer.length > this.BUFFER_SIZE) {
      this.businessMetricsBuffer.shift();
    }
  }

  // 获取自定义业务指?  public getCustomMetrics(limit: number = 100): BusinessMetric[] {
    return this.businessMetricsBuffer.slice(-limit);
  }

  // 获取监控指标文本（Prometheus格式?  public async getMetricsText(): Promise<string> {
    return await this.registry.metrics();
  }

  // 获取指标注册?  public getRegistry(): Registry {
    return this.registry;
  }

  // 重置所有计数器（谨慎使用）
  public resetAllMetrics(): void {
    this.registry.resetMetrics();
    this.businessMetricsBuffer = [];
    this.traces.clear();
  }
}

// 导出单例实例
export const enhancedMonitoring = EnhancedMonitoring.getInstance();

// 默认导出
export default enhancedMonitoring;
