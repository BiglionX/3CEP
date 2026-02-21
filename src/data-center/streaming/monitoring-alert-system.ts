// 监控告警系统
// 实现消息堆积检测、延迟监控和性能指标收集

import { monitoringService } from '../monitoring/monitoring-service';
import { enhancedRealTimeService } from './enhanced-realtime-service';
import { messageQueueManager } from './message-queue-manager';

// 监控指标类型
export interface MonitoringMetric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  unit?: string;
}

// 堆积告警配置
export interface BacklogAlertConfig {
  topic: string;
  threshold: number; // 消息数量阈值
  checkInterval: number; // 检查间隔（毫秒）
  alertChannels: string[]; // 告警渠道
}

// 延迟监控配置
export interface LatencyAlertConfig {
  topic: string;
  thresholdMs: number; // 延迟阈值（毫秒）
  windowSize: number; // 时间窗口大小（毫秒）
  alertChannels: string[];
}

// 系统健康检查项
export interface HealthCheckItem {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
  description: string;
}

// 告警通知
export interface AlertNotification {
  id: string;
  type: 'backlog' | 'latency' | 'health' | 'performance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

// 监控告警系统主类
export class MonitoringAlertSystem {
  private backlogConfigs: BacklogAlertConfig[] = [];
  private latencyConfigs: LatencyAlertConfig[] = [];
  private healthChecks: HealthCheckItem[] = [];
  private activeAlerts: Map<string, AlertNotification> = new Map();
  private monitoringTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  
  constructor() {
    this.initializeDefaultConfigs();
    this.initializeHealthChecks();
  }
  
  private initializeDefaultConfigs(): void {
    // 默认堆积告警配置
    this.backlogConfigs = [
      {
        topic: 'price_update',
        threshold: 1000,
        checkInterval: 30000, // 30秒
        alertChannels: ['email', 'slack']
      },
      {
        topic: 'inventory_change',
        threshold: 500,
        checkInterval: 30000,
        alertChannels: ['email', 'sms']
      },
      {
        topic: 'order_status_change',
        threshold: 2000,
        checkInterval: 60000, // 1分钟
        alertChannels: ['email', 'webhook']
      }
    ];
    
    // 默认延迟告警配置
    this.latencyConfigs = [
      {
        topic: 'price_update',
        thresholdMs: 100,
        windowSize: 60000, // 1分钟窗口
        alertChannels: ['email', 'slack']
      },
      {
        topic: 'inventory_change',
        thresholdMs: 200,
        windowSize: 60000,
        alertChannels: ['email']
      },
      {
        topic: 'user_action',
        thresholdMs: 500,
        windowSize: 60000,
        alertChannels: ['email']
      }
    ];
  }
  
  private initializeHealthChecks(): void {
    this.healthChecks = [
      {
        name: 'redis_connection',
        check: async () => messageQueueManager.isConnected(),
        critical: true,
        description: 'Redis连接状态检查'
      },
      {
        name: 'message_queue_status',
        check: async () => {
          try {
            await messageQueueManager.getQueueStats('health_check');
            return true;
          } catch {
            return false;
          }
        },
        critical: true,
        description: '消息队列状态检查'
      },
      {
        name: 'processing_service_health',
        check: async () => true, // TODO: 实现实际的健康检查
        critical: true,
        description: '实时处理服务健康检查'
      },
      {
        name: 'system_memory',
        check: async () => {
          const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
          return usedMemory < 1000; // 1GB阈值
        },
        critical: false,
        description: '系统内存使用检查'
      },
      {
        name: 'event_processing_rate',
        check: async () => {
          // 检查事件处理速率是否正常
          const stats = enhancedRealTimeService.getProcessingStats();
          let totalProcessed = 0;
          for (const stat of stats.values()) {
            totalProcessed += stat.totalProcessed;
          }
          return totalProcessed > 0; // 至少有处理记录
        },
        critical: false,
        description: '事件处理速率检查'
      }
    ];
  }
  
  // 添加堆积告警配置
  addBacklogAlert(config: BacklogAlertConfig): void {
    this.backlogConfigs.push(config);
    console.log(`✅ 添加堆积告警配置: ${config.topic}`);
  }
  
  // 添加延迟告警配置
  addLatencyAlert(config: LatencyAlertConfig): void {
    this.latencyConfigs.push(config);
    console.log(`✅ 添加延迟告警配置: ${config.topic}`);
  }
  
  // 移除告警配置
  removeBacklogAlert(topic: string): void {
    this.backlogConfigs = this.backlogConfigs.filter(config => config.topic !== topic);
    console.log(`🗑️ 移除堆积告警配置: ${topic}`);
  }
  
  removeLatencyAlert(topic: string): void {
    this.latencyConfigs = this.latencyConfigs.filter(config => config.topic !== topic);
    console.log(`🗑️ 移除延迟告警配置: ${topic}`);
  }
  
  // 启动监控
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ 监控系统已在运行');
      return;
    }
    
    this.isRunning = true;
    this.startMonitoringLoop();
    console.log('✅ 监控告警系统已启动');
  }
  
  // 停止监控
  stop(): void {
    this.isRunning = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    console.log('🛑 监控告警系统已停止');
  }
  
  private startMonitoringLoop(): void {
    this.monitoringTimer = setInterval(async () => {
      try {
        await this.performMonitoringChecks();
      } catch (error) {
        console.error('❌ 监控检查执行失败:', error);
      }
    }, 10000); // 每10秒执行一次监控检查
  }
  
  private async performMonitoringChecks(): Promise<void> {
    // 执行健康检查
    await this.performHealthChecks();
    
    // 检查消息堆积
    await this.checkMessageBacklog();
    
    // 检查处理延迟
    await this.checkProcessingLatency();
    
    // 收集性能指标
    await this.collectPerformanceMetrics();
  }
  
  private async performHealthChecks(): Promise<void> {
    for (const check of this.healthChecks) {
      try {
        const isHealthy = await check.check();
        
        if (!isHealthy) {
          const severity = check.critical ? 'critical' : 'warning';
          await this.createAlert({
            type: 'health',
            severity,
            title: `健康检查失败: ${check.name}`,
            message: check.description,
            alertChannels: ['email', 'slack']
          });
        }
      } catch (error) {
        console.error(`❌ 健康检查执行失败 ${check.name}:`, error);
        await this.createAlert({
          type: 'health',
          severity: check.critical ? 'critical' : 'error',
          title: `健康检查异常: ${check.name}`,
          message: `检查执行异常: ${error instanceof Error ? error.message : '未知错误'}`,
          alertChannels: ['email']
        });
      }
    }
  }
  
  private async checkMessageBacklog(): Promise<void> {
    for (const config of this.backlogConfigs) {
      try {
        const stats = await messageQueueManager.getQueueStats(config.topic);
        
        if (stats && typeof stats.messageCount === 'number') {
          const messageCount = stats.messageCount;
          
          if (messageCount > config.threshold) {
            await this.createAlert({
              type: 'backlog',
              severity: messageCount > config.threshold * 2 ? 'critical' : 'warning',
              title: `消息堆积告警: ${config.topic}`,
              message: `队列 ${config.topic} 当前堆积 ${messageCount} 条消息，超过阈值 ${config.threshold}`,
              alertChannels: config.alertChannels
            });
          }
        }
      } catch (error) {
        console.error(`❌ 堆积检查失败 ${config.topic}:`, error);
      }
    }
  }
  
  private async checkProcessingLatency(): Promise<void> {
    // 这里需要实现延迟监控逻辑
    // 可以通过在事件中添加处理时间戳来计算延迟
    
    const stats = enhancedRealTimeService.getProcessingStats();
    
    for (const config of this.latencyConfigs) {
      const topicStats = stats.get(config.topic as any);
      if (topicStats && topicStats.averageProcessingTime > config.thresholdMs) {
        await this.createAlert({
          type: 'latency',
          severity: topicStats.averageProcessingTime > config.thresholdMs * 2 ? 'critical' : 'warning',
          title: `处理延迟告警: ${config.topic}`,
          message: `事件类型 ${config.topic} 平均处理时间 ${topicStats.averageProcessingTime}ms，超过阈值 ${config.thresholdMs}ms`,
          alertChannels: config.alertChannels
        });
      }
    }
  }
  
  private async collectPerformanceMetrics(): Promise<void> {
    const stats = enhancedRealTimeService.getProcessingStats();
    let totalProcessed = 0;
    let totalErrors = 0;
    let avgProcessingTime = 0;
    let count = 0;
    
    // 收集汇总统计
    for (const [eventType, stat] of stats.entries()) {
      totalProcessed += stat.totalProcessed;
      totalErrors += stat.errorCount;
      
      if (stat.averageProcessingTime > 0) {
        avgProcessingTime += stat.averageProcessingTime;
        count++;
      }
      
      // 记录各事件类型的指标
      monitoringService.recordMetric(`event_processing_rate_${eventType}`, stat.totalProcessed);
      monitoringService.recordMetric(`event_error_rate_${eventType}`, stat.errorCount);
    }
    
    // 记录总体指标
    monitoringService.recordMetric('total_events_processed', totalProcessed);
    monitoringService.recordMetric('total_processing_errors', totalErrors);
    
    const errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0;
    monitoringService.recordMetric('overall_error_rate', errorRate);
    
    if (count > 0) {
      const overallAvgTime = avgProcessingTime / count;
      monitoringService.recordMetric('average_processing_time', overallAvgTime);
    }
    
    // 系统资源指标
    const memoryUsage = process.memoryUsage();
    monitoringService.recordMetric('memory_heap_used_mb', memoryUsage.heapUsed / 1024 / 1024);
    monitoringService.recordMetric('memory_heap_total_mb', memoryUsage.heapTotal / 1024 / 1024);
    
    const cpuUsage = process.cpuUsage();
    monitoringService.recordMetric('cpu_user_time_ms', cpuUsage.user / 1000);
    monitoringService.recordMetric('cpu_system_time_ms', cpuUsage.system / 1000);
  }
  
  private async createAlert(options: {
    type: AlertNotification['type'];
    severity: AlertNotification['severity'];
    title: string;
    message: string;
    alertChannels: string[];
  }): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: AlertNotification = {
      id: alertId,
      type: options.type,
      severity: options.severity,
      title: options.title,
      message: options.message,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.activeAlerts.set(alertId, alert);
    
    // 发送告警通知
    await this.sendAlertNotification(alert, options.alertChannels);
    
    // 记录到监控系统
    monitoringService.recordMetric('alerts_created', 1, {
      type: alert.type,
      severity: alert.severity
    });
    
    console.log(`🚨 创建告警: ${alert.title} (${alert.severity})`);
  }
  
  private async sendAlertNotification(alert: AlertNotification, channels: string[]): Promise<void> {
    // 这里应该集成实际的通知服务
    console.log(`📢 发送告警通知:`, {
      title: alert.title,
      message: alert.message,
      channels: channels,
      severity: alert.severity
    });
    
    // 示例：发送到不同渠道
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          // await emailService.send({
          //   to: 'alerts@company.com',
          //   subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
          //   html: alert.message
          // });
          break;
          
        case 'slack':
          // await slackService.sendMessage({
          //   text: `🚨 [${alert.severity.toUpperCase()}] ${alert.title}\n${alert.message}`
          // });
          break;
          
        case 'sms':
          // await smsService.send({
          //   to: '+86-138-0000-0000',
          //   message: `[${alert.severity.toUpperCase()}] ${alert.title}`
          // });
          break;
          
        case 'webhook':
          // await fetch(WEBHOOK_URL, {
          //   method: 'POST',
          //   body: JSON.stringify(alert)
          // });
          break;
      }
    }
  }
  
  // 解决告警
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      console.log(`✅ 告警已解决: ${alert.title}`);
    }
  }
  
  // 获取活跃告警
  getActiveAlerts(): AlertNotification[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // 获取历史告警
  getAlertHistory(limit: number = 50): AlertNotification[] {
    return Array.from(this.activeAlerts.values())
      .slice(0, limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // 获取监控统计
  getMonitoringStats(): {
    activeAlerts: number;
    totalAlerts: number;
    backlogConfigs: number;
    latencyConfigs: number;
    healthChecks: number;
  } {
    return {
      activeAlerts: this.getActiveAlerts().length,
      totalAlerts: this.activeAlerts.size,
      backlogConfigs: this.backlogConfigs.length,
      latencyConfigs: this.latencyConfigs.length,
      healthChecks: this.healthChecks.length
    };
  }
  
  // 获取系统健康状态
  async getSystemHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    
    for (const check of this.healthChecks) {
      try {
        healthStatus[check.name] = await check.check();
      } catch {
        healthStatus[check.name] = false;
      }
    }
    
    return healthStatus;
  }
}

// 性能分析器
export class PerformanceAnalyzer {
  private latencySamples: Map<string, number[]> = new Map();
  private sampleWindowSize: number = 100; // 保留最近100个样本
  
  recordLatency(eventType: string, latencyMs: number): void {
    if (!this.latencySamples.has(eventType)) {
      this.latencySamples.set(eventType, []);
    }
    
    const samples = this.latencySamples.get(eventType)!;
    samples.push(latencyMs);
    
    // 保持样本窗口大小
    if (samples.length > this.sampleWindowSize) {
      samples.shift();
    }
  }
  
  getLatencyStats(eventType: string): {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const samples = this.latencySamples.get(eventType);
    if (!samples || samples.length === 0) return null;
    
    const sorted = [...samples].sort((a, b) => a - b);
    const avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return { avg, min, max, p95, p99 };
  }
  
  getAllLatencyStats(): Record<string, ReturnType<PerformanceAnalyzer['getLatencyStats']>> {
    const stats: Record<string, any> = {};
    for (const eventType of this.latencySamples.keys()) {
      stats[eventType] = this.getLatencyStats(eventType);
    }
    return stats;
  }
  
  clearSamples(eventType?: string): void {
    if (eventType) {
      this.latencySamples.delete(eventType);
    } else {
      this.latencySamples.clear();
    }
  }
}

// 导出默认实例
export const monitoringAlertSystem = new MonitoringAlertSystem();
export const performanceAnalyzer = new PerformanceAnalyzer();