/**
 * FixCycle 6.0 数据收集 API 路由
 * Analytics Data Collection API Endpoint
 */

import { createDataCleaningService } from '@/lib/analytics/data-cleaning-service';
import { AnalyticsEvent } from '@/lib/analytics/data-collection-sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/collect
 * 接收并处理分析数据
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const payload = await request.json();

    // 验证基本结构
    if (!payload.appId || !payload.events || !Array.isArray(payload.events)) {
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    const { appId, environment, events } = payload;

    // 获取清洗服务实例
    const cleaningService = createDataCleaningService();

    // 批量清洗数据
    const cleaningResults = cleaningService.cleanEvents(
      events as AnalyticsEvent[]
    );

    // 过滤出通过清洗的数据
    const validEvents = cleaningResults
      .filter(result => result.passed && result.cleaned)
      .map(result => result.cleaned!);

    // 统计质量问题
    const qualityStats = {
      total: events.length,
      valid: validEvents.length,
      invalid: events.length - validEvents.length,
      duplicates: cleaningResults.filter(r => r.cleaned?.flags.isDuplicate)
        .length,
      anomalies: cleaningResults.filter(r => r.cleaned?.flags.isAnomaly).length,
      avgQualityScore:
        validEvents.length > 0
          ? validEvents.reduce((sum, e) => sum + e.qualityScore, 0) /
            validEvents.length
          : 0,
    };

    // 存储到数据库
    if (validEvents.length > 0) {
      await storeAnalytics(validEvents, {
        appId,
        environment: environment || 'production',
      });
    }

    // 记录质量指标（异步，不阻塞响应）
    recordQualityMetrics(qualityStats, appId).catch(console.error);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      received: events.length,
      processed: validEvents.length,
      stats: qualityStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Analytics API] 处理失败:', error);

    return NextResponse.json(
      {
        error: 'Failed to process analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 存储分析数据到数据库
 */
async function storeAnalytics(
  events: any[],
  metadata: { appId: string; environment: string }
) {
  try {
    // 检查是否在服务器端
    if (typeof window !== 'undefined') {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Analytics API] Supabase 配置缺失，跳过存储');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 分批插入（每批最多 1000 条）
    const BATCH_SIZE = 1000;
    const batches = Math.ceil(events.length / BATCH_SIZE);

    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, events.length);
      const batch = events.slice(start, end);

      // 转换为数据库记录格式
      const records = batch.map(event => ({
        event_id: event.eventId,
        event_type: event.eventType,
        event_name: event.eventName,
        event_timestamp: event.timestamp,
        user_id: event.userId || null,
        session_id: event.sessionId,

        // 设备信息
        device_type: event.device?.type || null,
        device_os: event.device?.os || null,
        device_browser: event.device?.browser || null,
        device_resolution: event.device?.screenResolution || null,
        device_language: event.device?.language || null,

        // 页面信息
        page_url: event.page?.url || null,
        page_path: event.page?.path || null,
        page_title: event.page?.title || null,
        page_referrer: event.page?.referrer || null,

        // 性能指标
        metrics: event.metrics || null,

        // 属性和丰富数据
        properties: event.properties || null,
        enriched_data: event.enrichedData || null,

        // 质量和标记
        quality_score: event.qualityScore || 100,
        flags: event.flags || {},

        // 元数据
        app_id: metadata.appId,
        environment: metadata.environment,
        created_at: new Date().toISOString(),
      }));

      // 插入数据库
      const { error } = await supabase.from('analytics_events').insert(records);

      if (error) {
        console.error('[Analytics API] 数据库插入失败:', error);
        // 继续处理下一批，不中断整个流程
      }
    }

    console.log(`[Analytics API] 成功存储 ${events.length} 个事件`);
  } catch (error) {
    console.error('[Analytics API] 存储失败:', error);
  }
}

/**
 * 记录质量指标（用于监控）
 */
async function recordQualityMetrics(stats: any, appId: string) {
  try {
    if (typeof window !== 'undefined') {
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 记录到质量指标表
    await supabase.from('data_quality_metrics').insert({
      app_id: appId,
      timestamp: new Date().toISOString(),
      total_events: stats.total,
      valid_events: stats.valid,
      invalid_events: stats.invalid,
      duplicate_count: stats.duplicates,
      anomaly_count: stats.anomalies,
      avg_quality_score: stats.avgQualityScore,
      validity_rate: stats.valid / stats.total,
    });
  } catch (error) {
    console.error('[Analytics API] 质量指标记录失败:', error);
  }
}

/**
 * GET /api/analytics/collect
 * 健康检查端点
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'analytics-collector',
    timestamp: new Date().toISOString(),
  });
}
