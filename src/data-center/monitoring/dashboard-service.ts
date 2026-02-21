// 监控仪表板服务
import { monitoringService, AlertEvent, MonitoringMetric } from './monitoring-service';

// 仪表板数据接口
export interface DashboardData {
  systemHealth: SystemHealth;
  activeAlerts: ActiveAlertSummary;
  performanceMetrics: PerformanceMetrics;
  dataQuality: DataQualitySummary;
  recentActivity: RecentActivity[];
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface ActiveAlertSummary {
  total: number;
  bySeverity: Record<string, number>;
  criticalAlerts: AlertEvent[];
}

export interface PerformanceMetrics {
  queryResponseTime: MetricStats;
  cacheHitRate: MetricStats;
  throughput: MetricStats;
  errorRate: MetricStats;
}

export interface MetricStats {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DataQualitySummary {
  overallScore: number;
  byTable: Record<string, number>;
  issuesCount: number;
  lastChecked: string;
}

export interface RecentActivity {
  type: 'alert_triggered' | 'alert_resolved' | 'metric_threshold' | 'system_event';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  timestamp: string;
  source?: string;
}

// 监控仪表板服务类
export class MonitoringDashboardService {
  private refreshInterval: number = 30000; // 30秒刷新一次
  private dashboardCache: DashboardData | null = null;
  private cacheTimestamp: number = 0;
  private cacheTTL: number = 30000; // 30秒缓存

  // 获取完整的仪表板数据
  async getDashboardData(forceRefresh: boolean = false): Promise<DashboardData> {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (!forceRefresh && this.dashboardCache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.dashboardCache;
    }

    // 重新生成仪表板数据
    const dashboardData = await this.generateDashboardData();
    this.dashboardCache = dashboardData;
    this.cacheTimestamp = now;
    
    return dashboardData;
  }

  // 生成仪表板数据
  private async generateDashboardData(): Promise<DashboardData> {
    return {
      systemHealth: this.getSystemHealth(),
      activeAlerts: this.getActiveAlertsSummary(),
      performanceMetrics: this.getPerformanceMetrics(),
      dataQuality: this.getDataQualitySummary(),
      recentActivity: this.getRecentActivity(),
      timestamp: new Date().toISOString()
    };
  }

  // 获取系统健康状态
  private getSystemHealth(): SystemHealth {
    // 这里应该从实际的系统监控中获取数据
    // 目前使用模拟数据
    const stats = monitoringService.getMonitoringStats();
    
    // 计算健康状态
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (stats.activeAlerts > 10) {
      status = 'degraded';
    }
    if (stats.activeAlerts > 20) {
      status = 'unhealthy';
    }

    return {
      status,
      uptime: this.formatUptime(process.uptime()),
      cpuUsage: this.getRandomPercentage(40, 80),
      memoryUsage: this.getRandomPercentage(50, 90),
      diskUsage: this.getRandomPercentage(30, 70),
      networkLatency: this.getRandomValue(10, 100)
    };
  }

  // 获取活跃告警摘要
  private getActiveAlertsSummary(): ActiveAlertSummary {
    const activeAlerts = monitoringService.getActiveAlerts();
    const bySeverity: Record<string, number> = {};
    
    activeAlerts.forEach(alert => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    });

    return {
      total: activeAlerts.length,
      bySeverity,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency')
    };
  }

  // 获取性能指标
  private getPerformanceMetrics(): PerformanceMetrics {
    // 获取最近的指标数据
    const recentMetrics = monitoringService.getMetrics(undefined, 100);
    
    return {
      queryResponseTime: this.calculateMetricStats(recentMetrics, 'query_response_time'),
      cacheHitRate: this.calculateMetricStats(recentMetrics, 'cache_hit_rate'),
      throughput: this.calculateMetricStats(recentMetrics, 'requests_per_second'),
      errorRate: this.calculateMetricStats(recentMetrics, 'error_rate')
    };
  }

  // 计算指标统计
  private calculateMetricStats(metrics: MonitoringMetric[], metricName: string): MetricStats {
    const filteredMetrics = metrics.filter(m => m.name === metricName);
    
    if (filteredMetrics.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable'
      };
    }

    const values = filteredMetrics.map(m => m.value);
    const current = values[values.length - 1];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // 简单趋势计算
    const trend = values.length > 1 ? 
      (values[values.length - 1] > values[values.length - 2] ? 'up' : 'down') : 
      'stable';

    return {
      current,
      average,
      min,
      max,
      trend
    };
  }

  // 获取数据质量摘要
  private getDataQualitySummary(): DataQualitySummary {
    const qualityReport = monitoringService.getDataQualityReport();
    
    const byTable: Record<string, number> = {};
    qualityReport.metrics.forEach(metric => {
      byTable[metric.tableName] = metric.score;
    });

    return {
      overallScore: qualityReport.overallScore,
      byTable,
      issuesCount: qualityReport.issues.length,
      lastChecked: new Date().toISOString()
    };
  }

  // 获取最近活动
  private getRecentActivity(): RecentActivity[] {
    const activities: RecentActivity[] = [];
    
    // 添加最近的告警活动
    const recentAlerts = monitoringService.getAlertHistory(10);
    recentAlerts.forEach(alert => {
      activities.push({
        type: alert.resolvedAt ? 'alert_resolved' : 'alert_triggered',
        message: `${alert.ruleName}: ${alert.currentValue}`,
        severity: alert.severity,
        timestamp: alert.resolvedAt || alert.triggeredAt,
        source: 'monitoring_system'
      });
    });

    // 添加最近的指标阈值事件
    const recentMetrics = monitoringService.getMetrics(undefined, 20);
    recentMetrics.slice(-5).forEach(metric => {
      if (this.isMetricAnomalous(metric)) {
        activities.push({
          type: 'metric_threshold',
          message: `${metric.name} 超出正常范围: ${metric.value}`,
          severity: 'warning',
          timestamp: metric.timestamp,
          source: metric.tags?.source || 'system'
        });
      }
    });

    // 按时间排序并限制数量
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
  }

  // 检查指标是否异常
  private isMetricAnomalous(metric: MonitoringMetric): boolean {
    // 简单的异常检测逻辑
    const thresholds: Record<string, { min: number; max: number }> = {
      'query_response_time': { min: 0, max: 2000 },
      'cache_hit_rate': { min: 70, max: 100 },
      'error_rate': { min: 0, max: 5 }
    };

    const threshold = thresholds[metric.name];
    if (!threshold) return false;

    return metric.value < threshold.min || metric.value > threshold.max;
  }

  // 工具方法
  private getRandomPercentage(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  private getRandomValue(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // 清除缓存
  clearCache(): void {
    this.dashboardCache = null;
    this.cacheTimestamp = 0;
  }

  // 设置缓存TTL
  setCacheTTL(ttlMs: number): void {
    this.cacheTTL = ttlMs;
  }
}

// 导出实例
export const dashboardService = new MonitoringDashboardService();