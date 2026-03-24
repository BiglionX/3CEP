/**
 * FixCycle 6.0 实时数据流处理器
 * Real-time Data Stream Processor
 *
 * 功能:
 * - 监听新事件（通过 Supabase Realtime）
 * - 实时更新聚合指标
 * - 触发告警和通知
 * - 流式数据处理管道
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

/**
 * 流式事件类型
 */
export interface StreamEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  timestamp: string;
}

/**
 * 聚合更新事件
 */
export interface AggregationUpdate {
  metricType: 'hourly' | 'daily' | 'realtime';
  app_id: string;
  updates: Record<string, any>;
  timestamp: string;
}

/**
 * 告警事件
 */
export interface AlertEvent {
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'quality' | 'traffic' | 'performance' | 'system';
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

/**
 * 配置选项
 */
interface StreamProcessorConfig {
  supabaseUrl: string;
  supabaseKey: string;
  enableRealtime: boolean;
  aggregationInterval: number; // 毫秒
  alertThresholds: {
    qualityScoreMin: number;
    errorRateMax: number;
    trafficSpikeMultiplier: number;
  };
}

/**
 * 实时数据流处理器主类
 */
export class RealtimeStreamProcessor extends EventEmitter {
  private static instance: RealtimeStreamProcessor;

  private config: Required<StreamProcessorConfig>;
  private supabase: ReturnType<typeof createClient>;
  private realtimeChannel?: RealtimeChannel;
  private aggregationTimer?: NodeJS.Timeout;
  private eventBuffer: StreamEvent[] = [];
  private isProcessing: boolean = false;
  private metricsCache = new Map<string, any>();

  private constructor(config: Partial<StreamProcessorConfig>) {
    super();

    this.config = {
      supabaseUrl:
        config.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey:
        config.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      enableRealtime: config.enableRealtime ?? true,
      aggregationInterval: config.aggregationInterval ?? 60000, // 1 分钟
      alertThresholds: {
        qualityScoreMin: config.alertThresholds?.qualityScoreMin ?? 80,
        errorRateMax: config.alertThresholds?.errorRateMax ?? 0.05,
        trafficSpikeMultiplier:
          config.alertThresholds?.trafficSpikeMultiplier ?? 3,
      },
    };

    if (!this.config.supabaseUrl || !this.config.supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseKey
    );

    console.log('[StreamProcessor] 初始化完成', {
      realtime: this.config.enableRealtime,
      aggregationInterval: this.config.aggregationInterval,
    });
  }

  /**
   * 获取单例实例
   */
  static getInstance(
    config: Partial<StreamProcessorConfig> = {}
  ): RealtimeStreamProcessor {
    if (!RealtimeStreamProcessor.instance) {
      RealtimeStreamProcessor.instance = new RealtimeStreamProcessor(config);
    }
    return RealtimeStreamProcessor.instance;
  }

  /**
   * 启动流处理器
   */
  async start() {
    console.log('[StreamProcessor] 启动...');

    if (this.config.enableRealtime) {
      await this.subscribeToRealtime();
    }

    this.startAggregationLoop();
    this.emit('started');
  }

  /**
   * 停止流处理器
   */
  async stop() {
    console.log('[StreamProcessor] 停止...');

    if (this.realtimeChannel) {
      await this.realtimeChannel.unsubscribe();
    }

    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }

    this.eventBuffer = [];
    this.emit('stopped');
  }

  /**
   * 订阅 Supabase Realtime
   */
  private async subscribeToRealtime() {
    try {
      this.realtimeChannel = this.supabase
        .channel('analytics-stream')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'analytics_events',
          },
          payload => {
            const streamEvent: StreamEvent = {
              type: 'INSERT',
              table: 'analytics_events',
              record: payload.new,
              timestamp: new Date().toISOString(),
            };

            this.handleStreamEvent(streamEvent);
          }
        )
        .subscribe();

      console.log('[StreamProcessor] Realtime 订阅成功');
    } catch (error) {
      console.error('[StreamProcessor] Realtime 订阅失败:', error);
      this.emit('error', {
        type: 'realtime_subscription_failed',
        error,
      });
    }
  }

  /**
   * 处理流事件
   */
  private handleStreamEvent(event: StreamEvent) {
    // 添加到缓冲区
    this.eventBuffer.push(event);

    // 如果缓冲区太大，立即处理
    if (this.eventBuffer.length >= 100) {
      this.processBuffer();
    }

    // 发出原始事件（供外部监听）
    this.emit('raw_event', event);

    // 实时质量检查
    this.checkDataQuality(event);

    // 实时流量监控
    this.monitorTraffic(event);
  }

  /**
   * 处理缓冲区内的事件
   */
  private async processBuffer() {
    if (this.isProcessing || this.eventBuffer.length === 0) {
      return;
    }

    this.isProcessing = true;
    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // 批量更新聚合指标
      await this.updateAggregations(events);

      // 检测异常
      await this.detectAnomalies(events);

      console.log(`[StreamProcessor] 处理了 ${events.length} 个事件`);
    } catch (error) {
      console.error('[StreamProcessor] 批处理失败:', error);
      this.emit('error', {
        type: 'batch_processing_failed',
        error,
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 启动定时聚合循环
   */
  private startAggregationLoop() {
    this.aggregationTimer = setInterval(async () => {
      try {
        await this.processBuffer();
        await this.refreshMaterializedViews();
      } catch (error) {
        console.error('[StreamProcessor] 聚合循环失败:', error);
      }
    }, this.config.aggregationInterval);
  }

  /**
   * 更新聚合指标
   */
  private async updateAggregations(events: StreamEvent[]) {
    const appIds = [
      ...new Set(events.map(e => e.record.app_id).filter(Boolean)),
    ];

    for (const appId of appIds) {
      const hourAgo = new Date(Date.now() - 3600000).toISOString();

      // 获取最近 1 小时的数据
      const { data: recentEvents } = await this.supabase
        .from('analytics_events')
        .select('*')
        .eq('app_id', appId)
        .gte('event_timestamp', hourAgo);

      if (!recentEvents || recentEvents.length === 0) {
        continue;
      }

      // 计算小时聚合
      const hourlyMetrics = this.calculateHourlyMetrics(recentEvents);

      // 更新或插入小时指标
      await this.upsertHourlyMetrics(appId, hourlyMetrics);

      // 如果是整点，更新日聚合
      if (new Date().getMinutes() === 0) {
        await this.updateDailyMetrics(appId);
      }

      // 发出聚合更新事件
      this.emit('aggregation_update', {
        metricType: 'hourly',
        app_id: appId,
        updates: hourlyMetrics,
        timestamp: new Date().toISOString(),
      } as AggregationUpdate);
    }
  }

  /**
   * 计算小时指标
   */
  private calculateHourlyMetrics(events: any[]): Record<string, any> {
    const pageviews = events.filter(e => e.event_type === 'pageview').length;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;
    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean))
      .size;

    // 性能指标
    const performanceEvents = events.filter(
      e => e.event_type === 'performance' && e.metrics
    );
    const avgPageLoadTime =
      performanceEvents.length > 0
        ? performanceEvents.reduce(
            (sum, e) => sum + (e.metrics?.pageLoadTime || 0),
            0
          ) / performanceEvents.length
        : null;

    // 错误统计
    const errors = events.filter(e => e.event_type === 'error').length;

    // 设备分布
    const deviceCounts = events.reduce(
      (acc, e) => {
        const type = e.device_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalWithDevice = Object.values(deviceCounts).reduce(
      (a, b) => a + b,
      0
    );
    const mobilePercentage =
      totalWithDevice > 0
        ? ((deviceCounts.mobile || 0) / totalWithDevice) * 100
        : 0;
    const desktopPercentage =
      totalWithDevice > 0
        ? ((deviceCounts.desktop || 0) / totalWithDevice) * 100
        : 0;
    const tabletPercentage =
      totalWithDevice > 0
        ? ((deviceCounts.tablet || 0) / totalWithDevice) * 100
        : 0;

    // 质量评分
    const avgQualityScore =
      events.reduce((sum, e) => sum + (e.quality_score || 100), 0) /
      events.length;

    return {
      pageviews,
      unique_visitors: uniqueUsers,
      sessions: uniqueSessions,
      avg_page_load_time: avgPageLoadTime,
      error_count: errors,
      mobile_percentage: mobilePercentage,
      desktop_percentage: desktopPercentage,
      tablet_percentage: tabletPercentage,
      avg_quality_score: avgQualityScore,
      event_count: events.length,
    };
  }

  /**
   * 更新小时指标
   */
  private async upsertHourlyMetrics(
    appId: string,
    metrics: Record<string, any>
  ) {
    const hour = new Date();
    hour.setMinutes(0, 0, 0);

    try {
      await this.supabase.from('analytics_hourly_metrics').upsert(
        {
          hour: hour.toISOString(),
          app_id: appId,
          ...metrics,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'hour,app_id',
        }
      );
    } catch (error) {
      console.error('[StreamProcessor] 更新小时指标失败:', error);
    }
  }

  /**
   * 更新日指标
   */
  private async updateDailyMetrics(appId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const { data: dailyEvents } = await this.supabase
        .from('analytics_events')
        .select('*')
        .eq('app_id', appId)
        .gte('event_timestamp', today.toISOString());

      if (!dailyEvents || dailyEvents.length === 0) {
        return;
      }

      // 计算日指标（简化版本）
      const metrics = {
        total_pageviews: dailyEvents.filter(e => e.event_type === 'pageview')
          .length,
        total_unique_visitors: new Set(
          dailyEvents.map(e => e.user_id).filter(Boolean)
        ).size,
        total_sessions: new Set(dailyEvents.map(e => e.session_id)).size,
        avg_quality_score:
          dailyEvents.reduce((sum, e) => sum + (e.quality_score || 100), 0) /
          dailyEvents.length,
      };

      await this.supabase.from('analytics_daily_metrics').upsert(
        {
          date: today.toISOString(),
          app_id: appId,
          ...metrics,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'date,app_id',
        }
      );
    } catch (error) {
      console.error('[StreamProcessor] 更新日指标失败:', error);
    }
  }

  /**
   * 刷新物化视图
   */
  private async refreshMaterializedViews() {
    try {
      // 刷新每小时性能视图
      await this.supabase.rpc('refresh_mv_hourly_performance');

      // 刷新每日页面浏览量视图
      await this.supabase.rpc('refresh_mv_daily_pageviews');

      console.log('[StreamProcessor] 物化视图已刷新');
    } catch (error) {
      console.error('[StreamProcessor] 刷新物化视图失败:', error);
    }
  }

  /**
   * 数据质量检查
   */
  private checkDataQuality(event: StreamEvent) {
    const qualityScore = event.record.quality_score || 100;

    if (qualityScore < this.config.alertThresholds.qualityScoreMin) {
      const alert: AlertEvent = {
        level: 'warning',
        category: 'quality',
        message: `检测到低质量数据：质量评分 ${qualityScore}`,
        details: {
          eventId: event.record.event_id,
          qualityScore,
          issues: event.record.flags,
        },
        timestamp: new Date().toISOString(),
      };

      this.emit('alert', alert);
    }
  }

  /**
   * 流量监控
   */
  private monitorTraffic(event: StreamEvent) {
    // 简化的流量突增检测
    // 实际应该对比历史同期数据
    const now = Date.now();
    const cacheKey = `traffic_${event.record.app_id}`;

    const cached = this.metricsCache.get(cacheKey);
    const count = cached ? cached.count + 1 : 1;

    this.metricsCache.set(cacheKey, {
      count,
      startTime: cached?.startTime || now,
    });

    // 如果 1 分钟内事件数超过阈值
    if (cached && now - cached.startTime < 60000) {
      if (count > 1000) {
        // 阈值示例
        const alert: AlertEvent = {
          level: 'warning',
          category: 'traffic',
          message: `检测到流量突增：${count} 事件/分钟`,
          details: {
            app_id: event.record.app_id,
            eventCount: count,
            threshold: 1000,
          },
          timestamp: new Date().toISOString(),
        };

        this.emit('alert', alert);
      }
    } else {
      this.metricsCache.set(cacheKey, {
        count: 1,
        startTime: now,
      });
    }
  }

  /**
   * 异常检测
   */
  private async detectAnomalies(events: StreamEvent[]) {
    const anomalyEvents = events.filter(e => e.record.flags?.isAnomaly);

    for (const anomaly of anomalyEvents) {
      const alert: AlertEvent = {
        level: 'info',
        category: 'quality',
        message: '检测到异常数据',
        details: {
          eventId: anomaly.record.event_id,
          eventName: anomaly.record.event_name,
          flags: anomaly.record.flags,
        },
        timestamp: new Date().toISOString(),
      };

      this.emit('alert', alert);
    }
  }

  /**
   * 获取当前缓存的指标
   */
  getCachedMetrics(appId?: string): Map<string, any> {
    if (appId) {
      const filtered = new Map<string, any>();
      this.metricsCache.forEach((value, key) => {
        if (key.includes(appId)) {
          filtered.set(key, value);
        }
      });
      return filtered;
    }
    return this.metricsCache;
  }
}

/**
 * 创建实时流处理器实例
 */
export function createStreamProcessor(
  config: Partial<StreamProcessorConfig> = {}
): RealtimeStreamProcessor {
  return RealtimeStreamProcessor.getInstance(config);
}
