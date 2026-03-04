/**
 * 鐩戞帶鎸囨爣API绔偣
 * 鎻愪緵Prometheus鏍煎紡鐨勭洃鎺ф寚? */

import { NextResponse } from 'next/server';

// 绠€鍗曠殑鎸囨爣瀛樺偍
const metricsStore: Record<
  string,
  { value: number; labels?: Record<string, string>; timestamp: Date }
> = {};

// 璁板綍鎸囨爣鐨勮緟鍔╁嚱?function recordMetric(
  name: string,
  value: number,
  labels?: Record<string, string>
) {
  metricsStore[name] = {
    value,
    labels,
    timestamp: new Date(),
  };
}

// 鍒濆鍖栦竴浜涘熀纭€鎸囨爣
function initializeMetrics() {
  // 绯荤粺鎸囨爣
  recordMetric('nodejs_up', 1);
  recordMetric('nodejs_heap_used_bytes', process.memoryUsage().heapUsed);
  recordMetric('nodejs_heap_limit_bytes', process.memoryUsage().heapTotal);
  recordMetric(
    'procurement_intelligence_active_users',
    Math.floor(Math.random() * 100) + 50
  );

  // API鎸囨爣锛堟ā鎷熸暟鎹級
  recordMetric(
    'procurement_intelligence_api_requests_total',
    Math.floor(Math.random() * 1000) + 500
  );
  recordMetric(
    'procurement_intelligence_api_errors_total',
    Math.floor(Math.random() * 20)
  );
  recordMetric(
    'procurement_intelligence_api_response_time_seconds',
    Math.random() * 0.5 + 0.1
  );

  // 涓氬姟鎸囨爣
  recordMetric(
    'procurement_intelligence_supplier_matches_total',
    Math.floor(Math.random() * 500) + 200
  );
  recordMetric(
    'procurement_intelligence_price_optimizations_total',
    Math.floor(Math.random() * 300) + 100
  );
  recordMetric('redis_connected_clients', Math.floor(Math.random() * 10) + 5);
  recordMetric(
    'redis_memory_used_bytes',
    Math.floor(Math.random() * 50000000) + 10000000
  );
}

export async function GET() {
  try {
    // 鏇存柊瀹炴椂鎸囨爣
    initializeMetrics();

    // 璁＄畻涓€浜涙淳鐢熸寚?    const requestTotal =
      metricsStore['procurement_intelligence_api_requests_total']?.value || 1;
    const errorTotal =
      metricsStore['procurement_intelligence_api_errors_total']?.value || 0;
    const errorRate = ((errorTotal / requestTotal) * 100).toFixed(2);

    const lines = [
      '# HELP nodejs_up 1 = up, 0 = down',
      '# TYPE nodejs_up gauge',
      `nodejs_up ${metricsStore['nodejs_up']?.value || 1}`,
      '',

      '# HELP nodejs_heap_used_bytes Node.js heap memory used in bytes',
      '# TYPE nodejs_heap_used_bytes gauge',
      `nodejs_heap_used_bytes ${metricsStore['nodejs_heap_used_bytes']?.value || 0}`,
      '',

      '# HELP nodejs_heap_limit_bytes Node.js heap memory limit in bytes',
      '# TYPE nodejs_heap_limit_bytes gauge',
      `nodejs_heap_limit_bytes ${metricsStore['nodejs_heap_limit_bytes']?.value || 0}`,
      '',

      '# HELP procurement_intelligence_active_users Number of active users',
      '# TYPE procurement_intelligence_active_users gauge',
      `procurement_intelligence_active_users ${metricsStore['procurement_intelligence_active_users']?.value || 0}`,
      '',

      '# HELP procurement_intelligence_api_requests_total Total number of API requests',
      '# TYPE procurement_intelligence_api_requests_total counter',
      `procurement_intelligence_api_requests_total ${requestTotal}`,
      '',

      '# HELP procurement_intelligence_api_errors_total Total number of API errors',
      '# TYPE procurement_intelligence_api_errors_total counter',
      `procurement_intelligence_api_errors_total ${errorTotal}`,
      '',

      '# HELP procurement_intelligence_api_error_rate API error rate percentage',
      '# TYPE procurement_intelligence_api_error_rate gauge',
      `procurement_intelligence_api_error_rate ${errorRate}`,
      '',

      '# HELP procurement_intelligence_api_response_time_seconds API response time in seconds',
      '# TYPE procurement_intelligence_api_response_time_seconds histogram',
      `procurement_intelligence_api_response_time_seconds ${metricsStore['procurement_intelligence_api_response_time_seconds']?.value.toFixed(4) || 0}`,
      '',

      '# HELP procurement_intelligence_supplier_matches_total Total supplier matches',
      '# TYPE procurement_intelligence_supplier_matches_total counter',
      `procurement_intelligence_supplier_matches_total ${metricsStore['procurement_intelligence_supplier_matches_total']?.value || 0}`,
      '',

      '# HELP procurement_intelligence_price_optimizations_total Total price optimizations',
      '# TYPE procurement_intelligence_price_optimizations_total counter',
      `procurement_intelligence_price_optimizations_total ${metricsStore['procurement_intelligence_price_optimizations_total']?.value || 0}`,
      '',

      '# HELP redis_connected_clients Number of connected Redis clients',
      '# TYPE redis_connected_clients gauge',
      `redis_connected_clients ${metricsStore['redis_connected_clients']?.value || 0}`,
      '',

      '# HELP redis_memory_used_bytes Redis memory used in bytes',
      '# TYPE redis_memory_used_bytes gauge',
      `redis_memory_used_bytes ${metricsStore['redis_memory_used_bytes']?.value || 0}`,
      '',
    ];

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('鐩戞帶鎸囨爣鑾峰彇澶辫触:', error);
    return NextResponse.json(
      {
        error: 'Failed to get metrics',
      },
      { status: 500 }
    );
  }
}

// POST鏂规硶鐢ㄤ簬璁板綍鑷畾涔夋寚?export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.name && typeof body.value === 'number') {
      recordMetric(body.name, body.value, body.labels);

      return NextResponse.json({
        success: true,
        message: `Metric ${body.name} recorded`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid metric data',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('璁板綍鎸囨爣澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

