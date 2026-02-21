import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pageLoadTime,
      apiResponseTime,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift,
      firstInputDelay,
      userAgent,
      url
    } = body;

    // 参数验证
    if (!pageLoadTime && !apiResponseTime) {
      return NextResponse.json(
        { error: '缺少性能指标数据' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 插入性能数据
    const { error } = await supabase.from('performance_metrics').insert({
      page_load_time: pageLoadTime || null,
      api_response_time: apiResponseTime || null,
      first_contentful_paint: firstContentfulPaint || null,
      largest_contentful_paint: largestContentfulPaint || null,
      cumulative_layout_shift: cumulativeLayoutShift || null,
      first_input_delay: firstInputDelay || null,
      user_agent: userAgent || null,
      url: url || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('保存性能数据失败:', error);
      return NextResponse.json(
        { error: '保存性能数据失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '性能数据记录成功'
    });

  } catch (error) {
    console.error('处理性能数据错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const page = searchParams.get('page') || '';
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 计算时间范围
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // 构建查询
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (page) {
      query = query.like('url', `%${page}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查询性能数据失败:', error);
      return NextResponse.json(
        { error: '查询性能数据失败' },
        { status: 500 }
      );
    }

    // 计算统计信息
    const stats = calculatePerformanceStats(data || []);

    return NextResponse.json({
      success: true,
      data: {
        metrics: data,
        stats,
        timeframe: {
          hours,
          record_count: data?.length || 0,
          from: since,
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('处理性能查询错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

function calculatePerformanceStats(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      pageLoadTime: { avg: 0, min: 0, max: 0, median: 0 },
      apiResponseTime: { avg: 0, min: 0, max: 0, median: 0 },
      firstContentfulPaint: { avg: 0, min: 0, max: 0, median: 0 },
      largestContentfulPaint: { avg: 0, min: 0, max: 0, median: 0 },
      cumulativeLayoutShift: { avg: 0, min: 0, max: 0, median: 0 },
      firstInputDelay: { avg: 0, min: 0, max: 0, median: 0 }
    };
  }

  const stats: any = {};

  // 定义要计算统计的字段
  const fields = [
    'page_load_time',
    'api_response_time', 
    'first_contentful_paint',
    'largest_contentful_paint',
    'cumulative_layout_shift',
    'first_input_delay'
  ];

  fields.forEach(field => {
    const values = metrics
      .map(m => m[field])
      .filter(v => v !== null && v !== undefined)
      .sort((a, b) => a - b);

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = values[0];
      const max = values[values.length - 1];
      const median = values[Math.floor(values.length / 2)];

      stats[field.replace(/_/g, '')] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        median: Math.round(median * 100) / 100,
        count: values.length
      };
    } else {
      stats[field.replace(/_/g, '')] = {
        avg: 0, min: 0, max: 0, median: 0, count: 0
      };
    }
  });

  // 计算Core Web Vitals评分
  const fcpScores = metrics.map(m => getFCPScore(m.first_contentful_paint)).filter(s => s !== null);
  const lcpScores = metrics.map(m => getLCPScore(m.largest_contentful_paint)).filter(s => s !== null);
  const clsScores = metrics.map(m => getCLSScore(m.cumulative_layout_shift)).filter(s => s !== null);
  const fidScores = metrics.map(m => getFIDScore(m.first_input_delay)).filter(s => s !== null);

  stats.coreWebVitals = {
    fcp: fcpScores.length > 0 ? {
      good: fcpScores.filter(s => s === 'good').length,
      needsImprovement: fcpScores.filter(s => s === 'needs-improvement').length,
      poor: fcpScores.filter(s => s === 'poor').length,
      score: Math.round((fcpScores.filter(s => s === 'good').length / fcpScores.length) * 100)
    } : null,
    lcp: lcpScores.length > 0 ? {
      good: lcpScores.filter(s => s === 'good').length,
      needsImprovement: lcpScores.filter(s => s === 'needs-improvement').length,
      poor: lcpScores.filter(s => s === 'poor').length,
      score: Math.round((lcpScores.filter(s => s === 'good').length / lcpScores.length) * 100)
    } : null,
    cls: clsScores.length > 0 ? {
      good: clsScores.filter(s => s === 'good').length,
      needsImprovement: clsScores.filter(s => s === 'needs-improvement').length,
      poor: clsScores.filter(s => s === 'poor').length,
      score: Math.round((clsScores.filter(s => s === 'good').length / clsScores.length) * 100)
    } : null,
    fid: fidScores.length > 0 ? {
      good: fidScores.filter(s => s === 'good').length,
      needsImprovement: fidScores.filter(s => s === 'needs-improvement').length,
      poor: fidScores.filter(s => s === 'poor').length,
      score: Math.round((fidScores.filter(s => s === 'good').length / fidScores.length) * 100)
    } : null
  };

  return stats;
}

// Core Web Vitals评分标准
function getFCPScore(fcp: number | null): string | null {
  if (fcp === null) return null;
  if (fcp <= 1800) return 'good';
  if (fcp <= 3000) return 'needs-improvement';
  return 'poor';
}

function getLCPScore(lcp: number | null): string | null {
  if (lcp === null) return null;
  if (lcp <= 2500) return 'good';
  if (lcp <= 4000) return 'needs-improvement';
  return 'poor';
}

function getCLSScore(cls: number | null): string | null {
  if (cls === null) return null;
  if (cls <= 0.1) return 'good';
  if (cls <= 0.25) return 'needs-improvement';
  return 'poor';
}

function getFIDScore(fid: number | null): string | null {
  if (fid === null) return null;
  if (fid <= 100) return 'good';
  if (fid <= 300) return 'needs-improvement';
  return 'poor';
}