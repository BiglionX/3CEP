import { NextRequest, NextResponse } from 'next/server';

// 存储监控指标的内存对象（生产环境中应使用Redis或Prometheus客户端）
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

// 存储直方图数据
const histogramBuckets = [0.1, 0.25, 0.5, 1, 2, 5];
const durationHistogram: Record<string, number[]> = {
  '/api/valuation/estimate': Array(histogramBuckets.length + 1).fill(0)
};

// Prometheus格式化函数
function formatMetrics(): string {
  let result = '';
  
  // 计数器指标
  Object.entries(metricsStore).forEach(([name, value]) => {
    result += `# TYPE ${name} counter\n`;
    result += `${name} ${value}\n\n`;
  });
  
  // 直方图指标
  Object.entries(durationHistogram).forEach(([endpoint, buckets]) => {
    result += `# TYPE http_request_duration_seconds histogram\n`;
    buckets.forEach((count, index) => {
      const le = index === buckets.length - 1 ? '+Inf' : histogramBuckets[index];
      result += `http_request_duration_seconds_bucket{le="${le}",endpoint="${endpoint}"} ${count}\n`;
    });
    // 添加_sum和_count
    const sum = buckets.reduce((acc, count, index) => 
      acc + (count * (index === buckets.length - 1 ? 5 : histogramBuckets[index])), 0);
    const count = buckets.reduce((acc, val) => acc + val, 0);
    result += `http_request_duration_seconds_sum{endpoint="${endpoint}"} ${sum}\n`;
    result += `http_request_duration_seconds_count{endpoint="${endpoint}"} ${count}\n\n`;
  });
  
  // Gauge指标
  result += `# TYPE valuation_active_connections gauge\n`;
  result += `valuation_active_connections ${Math.floor(Math.random() * 20) + 5}\n\n`;
  
  result += `# TYPE valuation_confidence_score gauge\n`;
  result += `valuation_confidence_score ${Math.random() * 0.5 + 0.5}\n\n`;
  
  return result;
}

/**
 * GET /api/monitoring/metrics
 * 返回Prometheus格式的监控指标
 */
export async function GET(request: NextRequest) {
  try {
    const metrics = formatMetrics();
    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('监控指标获取失败:', error);
    return NextResponse.json(
      { error: '获取监控指标失败' },
      { status: 500 }
    );
  }
}

// 导出指标更新函数供其他模块使用
export function incrementMetric(metricName: string) {
  if (metricsStore.hasOwnProperty(metricName)) {
    metricsStore[metricName]++;
  }
}

export function recordDuration(endpoint: string, durationSeconds: number) {
  if (durationHistogram[endpoint]) {
    const bucketIndex = histogramBuckets.findIndex(bucket => durationSeconds <= bucket);
    if (bucketIndex === -1) {
      // 超过最大桶值，放入最后一个桶
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
  // 记录总请求数
  incrementMetric('valuation_requests_total');
  
  // 记录成功/失败
  if (isSuccess) {
    incrementMetric('valuation_success_total');
  } else {
    incrementMetric('valuation_error_total');
  }
  
  // 记录低置信度
  if (confidence < 0.5) {
    incrementMetric('valuation_low_confidence_total');
  }
  
  // 记录方法使用
  const methodMetric = `valuation_method_${method}_total`;
  if (metricsStore.hasOwnProperty(methodMetric)) {
    incrementMetric(methodMetric);
  }
  
  // 记录响应时间
  recordDuration('/api/valuation/estimate', durationMs / 1000);
}