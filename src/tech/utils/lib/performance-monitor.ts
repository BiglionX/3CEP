// 性能监控和健康检查工?import { createClient } from '@supabase/supabase-js';

// 性能指标接口
interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timestamp: string;
  userAgent: string;
  url: string;
}

// 健康检查结果接?interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    api: boolean;
    n8n: boolean;
    supabase: boolean;
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
  timestamp: string;
}

// 性能监控?export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly BUFFER_SIZE = 100;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 记录页面性能指标
  public recordPageMetrics(
    metrics: Omit<PerformanceMetrics, 'timestamp' | 'userAgent' | 'url'>
  ) {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
      url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    };

    this.metricsBuffer.push(fullMetrics);

    // 保持缓冲区大?    if (this.metricsBuffer.length > this.BUFFER_SIZE) {
      this.metricsBuffer.shift();
    }

    // 异步发送到后端
    this.sendMetrics(fullMetrics);
  }

  // 发送性能指标到后?  private async sendMetrics(metrics: PerformanceMetrics) {
    try {
      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        console.warn('性能指标发送失?', response.statusText);
      }
    } catch (error) {
      console.warn('性能指标发送异?', error);
    }
  }

  // 获取缓冲区指?  public getBufferedMetrics(): PerformanceMetrics[] {
    return [...this.metricsBuffer];
  }

  // 清空缓冲?  public clearBuffer(): void {
    this.metricsBuffer = [];
  }
}

// 健康检查工?export class HealthChecker {
  private static instance: HealthChecker;
  private readonly CHECK_INTERVAL = 30000; // 30秒检查一?  private healthStatus: HealthCheckResult | null = null;

  private constructor() {}

  public static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  // 执行完整健康检?  public async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkApi(),
      this.checkN8n(),
      this.checkSupabase(),
    ]);

    const serviceStatus = {
      database: checks[0].status === 'fulfilled' && checks[0].value,
      api: checks[1].status === 'fulfilled' && checks[1].value,
      n8n: checks[2].status === 'fulfilled' && checks[2].value,
      supabase: checks[3].status === 'fulfilled' && checks[3].value,
    };

    const healthyServices = Object.values(serviceStatus).filter(Boolean).length;
    const totalServices = Object.keys(serviceStatus).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyServices === 0) {
      status = 'unhealthy';
    } else if (healthyServices < totalServices) {
      status = 'degraded';
    }

    const result: HealthCheckResult = {
      status,
      services: serviceStatus,
      metrics: {
        uptime: this.calculateUptime(),
        responseTime: this.calculateAverageResponseTime(),
        errorRate: this.calculateErrorRate(),
      },
      timestamp: new Date().toISOString(),
    };

    this.healthStatus = result;
    return result;
  }

  // 检查数据库连接
  private async checkDatabase(): Promise<boolean> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data, error } = await supabase
        .from('leads')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      return false;
    }
  }

  // 检查API服务
  private async checkApi(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 检查n8n服务
  private async checkN8n(): Promise<boolean> {
    try {
      const n8nIntegration = await import('@/lib/n8n-integration');
      const health = await n8nIntegration.checkN8nHealth();
      return health.healthy;
    } catch (error) {
      return false;
    }
  }

  // 检查Supabase服务
  private async checkSupabase(): Promise<boolean> {
    try {
      const response = await fetch(
        'https://hrjqzbhqueleszkvnsen.supabase.co/rest/v1/',
        {
          method: 'HEAD',
        }
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 计算运行时间
  private calculateUptime(): number {
    // 简化的uptime计算，实际应该从服务器启动时间计?    return 99.9; // 模拟?  }

  // 计算平均响应时间
  private calculateAverageResponseTime(): number {
    // 从性能监控获取平均响应时间
    const monitor = PerformanceMonitor.getInstance();
    const metrics = monitor.getBufferedMetrics();
    if (metrics.length === 0) return 0;

    const avg =
      metrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / metrics.length;
    return Math.round(avg);
  }

  // 计算错误?  private calculateErrorRate(): number {
    // 简化的错误率计?    return 0.1; // 模拟?  }

  // 获取当前健康状?  public getCurrentHealth(): HealthCheckResult | null {
    return this.healthStatus;
  }

  // 启动定期健康检?  public startPeriodicChecks(): void {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.CHECK_INTERVAL);
  }
}

// Web Vitals 监控
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  const monitor = PerformanceMonitor.getInstance();

  // 监听页面加载完成
  window.addEventListener('load', () => {
    // 记录页面加载时间
    const loadTime = performance.now();
    monitor.recordPageMetrics({
      pageLoadTime: loadTime,
      apiResponseTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    });
  });

  // 监听首次内容绘制
  if ('performance' in window && 'getEntriesByType' in performance) {
    new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (
          entry.entryType === 'paint' &&
          entry.name === 'first-contentful-paint'
        ) {
          monitor.recordPageMetrics({
            pageLoadTime: 0,
            apiResponseTime: 0,
            firstContentfulPaint: entry.startTime,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
          });
        }
      });
    }).observe({ entryTypes: ['paint'] });
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
export const healthChecker = HealthChecker.getInstance();

// 默认导出
export default {
  performanceMonitor,
  healthChecker,
  initWebVitals,
};
