import { NextRequest, NextResponse } from 'next/server';

// 瀛樺偍鐩戞帶鎸囨爣鐨勫唴瀛樺璞★紙鐢熶骇鐜涓簲浣跨敤Redis鎴朠rometheus瀹㈡埛绔級
const metricsStore: Record<string, number> = {
  valuation_requests_total: 0,
  valuation_success_total: 0,
  valuation_error_total: 0,
  valuation_low_confidence_total: 0,
  valuation_method_ml_total: 0,
  valuation_method_market_total: 0,
  valuation_method_rule_total: 0,
  valuation_method_fused_total: 0,
};

// 瀛樺偍鐩存柟鍥炬暟?const histogramBuckets = [0.1, 0.25, 0.5, 1, 2, 5];
const durationHistogram: Record<string, number[]> = {
  '/api/valuation/estimate': Array(histogramBuckets.length + 1).fill(0),
};

// Prometheus鏍煎紡鍖栧嚱?function formatMetrics(): string {
  let result = '';

  // 璁℃暟鍣ㄦ寚?  Object.entries(metricsStore).forEach(([name, value]) => {
    result += `# TYPE ${name} counter\n`;
    result += `${name} ${value}\n\n`;
  });

  // 鐩存柟鍥炬寚?  Object.entries(durationHistogram).forEach(([endpoint, buckets]) => {
    result += `# TYPE http_request_duration_seconds histogram\n`;
    buckets.forEach((count, index) => {
      const le =
        index === buckets.length - 1 ? '+Inf' : histogramBuckets[index];
      result += `http_request_duration_seconds_bucket{le="${le}",endpoint="${endpoint}"} ${count}\n`;
    });
    // 娣诲姞_sum鍜宊count
    const sum = buckets.reduce(
      (acc, count, index) =>
        acc +
        count * (index === buckets.length - 1 ? 5 : histogramBuckets[index]),
      0
    );
    const count = buckets.reduce((acc, val) => acc + val, 0);
    result += `http_request_duration_seconds_sum{endpoint="${endpoint}"} ${sum}\n`;
    result += `http_request_duration_seconds_count{endpoint="${endpoint}"} ${count}\n\n`;
  });

  // Gauge鎸囨爣
  result += `# TYPE valuation_active_connections gauge\n`;
  result += `valuation_active_connections ${Math.floor(Math.random() * 20) + 5}\n\n`;

  result += `# TYPE valuation_confidence_score gauge\n`;
  result += `valuation_confidence_score ${Math.random() * 0.5 + 0.5}\n\n`;

  return result;
}

/**
 * GET /api/monitoring/metrics
 * 杩斿洖Prometheus鏍煎紡鐨勭洃鎺ф寚? */
export async function GET(request: NextRequest) {
  try {
    const metrics = formatMetrics();
    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('鐩戞帶鎸囨爣鑾峰彇澶辫触:', error);
    return NextResponse.json({ error: '鑾峰彇鐩戞帶鎸囨爣澶辫触' }, { status: 500 });
  }
}

// 瀵煎嚭鎸囨爣鏇存柊鍑芥暟渚涘叾浠栨ā鍧椾娇?export function incrementMetric(metricName: string) {
  if (metricsStore.hasOwnProperty(metricName)) {
    metricsStore[metricName]++;
  }
}

export function recordDuration(endpoint: string, durationSeconds: number) {
  if (durationHistogram[endpoint]) {
    const bucketIndex = histogramBuckets.findIndex(
      bucket => durationSeconds <= bucket
    );
    if (bucketIndex === -1) {
      // 瓒呰繃鏈€澶ф《鍊硷紝鏀惧叆鏈€鍚庝竴涓《
      durationHistogram[endpoint][histogramBuckets.length]++;
    } else {
      durationHistogram[endpoint][bucketIndex]++;
    }
  }
}

export function recordValuationMetrics(
  isSuccess: boolean,
  method: string,
  confidence: number,
  durationMs: number
) {
  // 璁板綍鎬昏姹傛暟
  incrementMetric('valuation_requests_total');

  // 璁板綍鎴愬姛/澶辫触
  if (isSuccess) {
    incrementMetric('valuation_success_total');
  } else {
    incrementMetric('valuation_error_total');
  }

  // 璁板綍浣庣疆淇″害
  if (confidence < 0.5) {
    incrementMetric('valuation_low_confidence_total');
  }

  // 璁板綍鏂规硶浣跨敤
  const methodMetric = `valuation_method_${method}_total`;
  if (metricsStore.hasOwnProperty(methodMetric)) {
    incrementMetric(methodMetric);
  }

  // 璁板綍鍝嶅簲鏃堕棿
  recordDuration('/api/valuation/estimate', durationMs / 1000);
}

