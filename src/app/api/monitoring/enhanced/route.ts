// 鐩戞帶API绔偣 - 鎻愪緵瀹炴椂鎸囨爣鏌ヨ鍜屼华琛ㄦ澘鏁版嵁
import { NextRequest, NextResponse } from 'next/server';
import { enhancedMonitoring } from '@/lib/enhanced-monitoring';
import { performance } from 'perf_hooks';

// 绯荤粺鍋ュ悍鐘舵€佹帴interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  metrics: {
    cpu: number;
    memory: number;
    activeRequests: number;
    activeSessions: number;
  };
}

// 〃鏉挎暟鎹帴interface DashboardData {
  systemHealth: SystemHealth;
  requestMetrics: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    activeRequests: number;
  };
  authMetrics: {
    loginAttempts: number;
    loginSuccessRate: number;
    activeSessions: number;
    avgSessionDuration: number;
  };
  businessMetrics: {
    userRegistrations: number;
    successfulOperations: number;
    failedOperations: number;
    successRate: number;
  };
  customMetrics: any[];
  timestamp: string;
}

// 鑾峰彇绯荤粺鍋ュ悍鐘async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // 鑾峰彇绯荤粺鎸囨爣
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000;

    // 鑾峰彇娲昏穬璇眰鏁板拰氳瘽    const activeRequests = 0; // 闇€瑕佷粠鐩戞帶涓棿惰幏    const activeSessions = 0; // 闇€瑕佷粠璁よ瘉鏈嶅姟鑾峰彇

    // 纭畾鍋ュ悍鐘    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (cpuPercent > 80 || memoryPercent > 85) {
      status = 'degraded';
    }
    if (cpuPercent > 90 || memoryPercent > 95) {
      status = 'unhealthy';
    }

    return {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: parseFloat(cpuPercent.toFixed(2)),
        memory: parseFloat(memoryPercent.toFixed(2)),
        activeRequests,
        activeSessions,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      uptime: 0,
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: 0,
        memory: 0,
        activeRequests: 0,
        activeSessions: 0,
      },
    };
  }
}

// 鑾峰彇璇眰鎸囨爣鎽樿
async function getRequestMetricsSummary(): Promise<any> {
  // 杩欓噷闇€瑕佷粠Prometheus鎸囨爣涓彁鍙栨暟  // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
  return {
    totalRequests: Math.floor(Math.random() * 10000) + 1000,
    errorRate: parseFloat((Math.random() * 5).toFixed(2)),
    avgResponseTime: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    activeRequests: Math.floor(Math.random() * 20) + 5,
  };
}

// 鑾峰彇璁よ瘉鎸囨爣鎽樿
async function getAuthMetricsSummary(): Promise<any> {
  // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
  const totalAttempts = Math.floor(Math.random() * 500) + 100;
  const successfulLogins = Math.floor(
    totalAttempts * (0.7 + Math.random() * 0.25)
  );

  return {
    loginAttempts: totalAttempts,
    loginSuccessRate: parseFloat(
      ((successfulLogins / totalAttempts) * 100).toFixed(2)
    ),
    activeSessions: Math.floor(Math.random() * 100) + 20,
    avgSessionDuration: parseFloat((Math.random() * 30 + 10).toFixed(2)),
  };
}

// 鑾峰彇涓氬姟鎸囨爣鎽樿
async function getBusinessMetricsSummary(): Promise<any> {
  // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
  const totalOperations = Math.floor(Math.random() * 1000) + 200;
  const successfulOperations = Math.floor(
    totalOperations * (0.85 + Math.random() * 0.1)
  );
  const failedOperations = totalOperations - successfulOperations;

  return {
    userRegistrations: Math.floor(Math.random() * 50) + 10,
    successfulOperations,
    failedOperations,
    successRate: parseFloat(
      ((successfulOperations / totalOperations) * 100).toFixed(2)
    ),
  };
}

// 鑾峰彇〃鏉挎暟async function getDashboardData(): Promise<DashboardData> {
  const [systemHealth, requestMetrics, authMetrics, businessMetrics] =
    await Promise.all([
      getSystemHealth(),
      getRequestMetricsSummary(),
      getAuthMetricsSummary(),
      getBusinessMetricsSummary(),
    ]);

  return {
    systemHealth,
    requestMetrics,
    authMetrics,
    businessMetrics,
    customMetrics: enhancedMonitoring.getCustomMetrics(50),
    timestamp: new Date().toISOString(),
  };
}

// API璺敱澶勭悊export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard':
        const dashboardData = await getDashboardData();
        return NextResponse.json(dashboardData);

      case 'metrics':
        // 杩斿洖Prometheus鏍煎紡鐨勫師濮嬫寚        const metricsText = await enhancedMonitoring.getMetricsText();
        return new Response(metricsText, {
          headers: {
            'Content-Type': 'text/plain; version=0.0.4',
            'Cache-Control': 'no-cache',
          },
        });

      case 'health':
        // 绯荤粺鍋ュ悍妫€        const health = await getSystemHealth();
        return NextResponse.json(health);

      case 'summary':
        // 鎸囨爣鎽樿
        const summary = {
          requestMetrics: await getRequestMetricsSummary(),
          authMetrics: await getAuthMetricsSummary(),
          businessMetrics: await getBusinessMetricsSummary(),
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(summary);

      case 'custom-metrics':
        // 鑷畾涔変笟鍔℃寚        const limit = parseInt(searchParams.get('limit') || '100');
        const customMetrics = enhancedMonitoring.getCustomMetrics(limit);
        return NextResponse.json({
          metrics: customMetrics,
          count: customMetrics.length,
          timestamp: new Date().toISOString(),
        });

      case 'reset':
        // 閲嶇疆鎸囨爣锛堥渶瑕佺鐞嗗憳鏉冮檺        const isAdmin = request.headers.get('x-user-role') === 'admin';
        if (!isAdmin) {
          return NextResponse.json(
            { error: '闇€瑕佺鐞嗗憳鏉冮檺鎵嶈兘閲嶇疆鎸囨爣' },
            { status: 403 }
          );
        }
        enhancedMonitoring.resetAllMetrics();
        return NextResponse.json({
          message: '鎵€鏈夋寚鏍囧凡閲嶇疆',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鐩戞帶API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST鏂规硶鐢ㄤ簬璁板綍鑷畾涔夋寚export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, labels } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鐨勫弬 name value' },
        { status: 400 }
      );
    }

    // 璁板綍鑷畾涔夋寚    enhancedMonitoring.recordCustomMetric(name, value, labels);

    return NextResponse.json({
      message: '鎸囨爣璁板綍鎴愬姛',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('璁板綍鎸囨爣閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '璁板綍鎸囨爣澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

