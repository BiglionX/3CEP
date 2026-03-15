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
      url,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!pageLoadTime && !apiResponseTime) {
      return NextResponse.json({ error: '缂哄皯鎬ц兘鎸囨爣鏁版嵁' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鎻掑叆鎬ц兘鏁版嵁
    const { error } = await supabase.from('performance_metrics').insert({
      page_load_time: pageLoadTime || null,
      api_response_time: apiResponseTime || null,
      first_contentful_paint: firstContentfulPaint || null,
      largest_contentful_paint: largestContentfulPaint || null,
      cumulative_layout_shift: cumulativeLayoutShift || null,
      first_input_delay: firstInputDelay || null,
      user_agent: userAgent || null,
      url: url || null,
      created_at: new Date().toISOString(),
    } as any);

    if (error) {
      console.error('淇濆鎬ц兘鏁版嵁澶辫触:', error);
      return NextResponse.json({ error: '淇濆鎬ц兘鏁版嵁澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '鎬ц兘鏁版嵁璁板綍鎴愬姛',
    }) as any;
  } catch (error) {
    console.error('澶勭悊鎬ц兘鏁版嵁閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
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

    // 璁＄畻堕棿鑼冨洿
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // 鏋勫缓鏌ヨ
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
      console.error('鏌ヨ鎬ц兘鏁版嵁澶辫触:', error);
      return NextResponse.json({ error: '鏌ヨ鎬ц兘鏁版嵁澶辫触' }, { status: 500 });
    }

    // 璁＄畻缁熻淇℃伅
    const stats = calculatePerformanceStats(data || []);

    return NextResponse.json({
      success: true,
      data: {
        metrics: data,
        stats,
        timeframe: {
          hours,
          record_count: (data as any).(data as any).length || 0,
          from: since,
          to: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('澶勭悊鎬ц兘鏌ヨ閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
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
      firstInputDelay: { avg: 0, min: 0, max: 0, median: 0 },
    };
  }

  const stats: any = {};

  // 瀹氫箟瑕佽绠楃粺璁＄殑瀛楁
  const fields = [
    'page_load_time',
    'api_response_time',
    'first_contentful_paint',
    'largest_contentful_paint',
    'cumulative_layout_shift',
    'first_input_delay',
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
        count: values.length,
      };
    } else {
      stats[field.replace(/_/g, '')] = {
        avg: 0,
        min: 0,
        max: 0,
        median: 0,
        count: 0,
      };
    }
  });

  // 璁＄畻Core Web Vitals璇勫垎
  const fcpScores = metrics
    .map(m => getFCPScore(m.first_contentful_paint))
    .filter(s => s !== null);
  const lcpScores = metrics
    .map(m => getLCPScore(m.largest_contentful_paint))
    .filter(s => s !== null);
  const clsScores = metrics
    .map(m => getCLSScore(m.cumulative_layout_shift))
    .filter(s => s !== null);
  const fidScores = metrics
    .map(m => getFIDScore(m.first_input_delay))
    .filter(s => s !== null);

  stats.coreWebVitals = {
    fcp:
      fcpScores.length > 0
         {
            good: fcpScores.filter(s => s === 'good').length,
            needsImprovement: fcpScores.filter(s => s === 'needs-improvement')
              .length,
            poor: fcpScores.filter(s => s === 'poor').length,
            score: Math.round(
              (fcpScores.filter(s => s === 'good').length / fcpScores.length) *
                100
            ),
          }
        : null,
    lcp:
      lcpScores.length > 0
         {
            good: lcpScores.filter(s => s === 'good').length,
            needsImprovement: lcpScores.filter(s => s === 'needs-improvement')
              .length,
            poor: lcpScores.filter(s => s === 'poor').length,
            score: Math.round(
              (lcpScores.filter(s => s === 'good').length / lcpScores.length) *
                100
            ),
          }
        : null,
    cls:
      clsScores.length > 0
         {
            good: clsScores.filter(s => s === 'good').length,
            needsImprovement: clsScores.filter(s => s === 'needs-improvement')
              .length,
            poor: clsScores.filter(s => s === 'poor').length,
            score: Math.round(
              (clsScores.filter(s => s === 'good').length / clsScores.length) *
                100
            ),
          }
        : null,
    fid:
      fidScores.length > 0
         {
            good: fidScores.filter(s => s === 'good').length,
            needsImprovement: fidScores.filter(s => s === 'needs-improvement')
              .length,
            poor: fidScores.filter(s => s === 'poor').length,
            score: Math.round(
              (fidScores.filter(s => s === 'good').length / fidScores.length) *
                100
            ),
          }
        : null,
  };

  return stats;
}

// Core Web Vitals璇勫垎鏍囧噯
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


