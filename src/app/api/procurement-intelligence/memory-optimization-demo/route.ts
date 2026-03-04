/**
 * 鍐呭瓨浼樺寲婕旂ずAPI
 * 灞曠ず鍐呭瓨鐩戞帶鍜屾硠婕忔娴嬪姛? */

import { NextResponse } from 'next/server';
import { memoryOptimizer } from '@/modules/procurement-intelligence/services/memory-optimizer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  try {
    switch (action) {
      case 'status':
        return await getMemoryStatus();

      case 'report':
        return await getMemoryReport();

      case 'optimize':
        return await triggerOptimization();

      case 'start-monitoring':
        return await startMemoryMonitoring();

      case 'stop-monitoring':
        return await stopMemoryMonitoring();

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被?,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鍐呭瓨浼樺寲API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍐呴儴鏈嶅姟鍣ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'register-object':
        return await registerObjectForTracking(data);

      case 'simulate-leak':
        return await simulateMemoryLeak(data);

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被?,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鍐呭瓨浼樺寲API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '璇锋眰澶勭悊澶辫触',
      },
      { status: 400 }
    );
  }
}

/**
 * 鑾峰彇褰撳墠鍐呭瓨鐘? */
async function getMemoryStatus() {
  const memoryUsage = process.memoryUsage();

  const status = {
    timestamp: new Date().toISOString(),
    heap: {
      used: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      total: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      usagePercentage:
        ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2) + '%',
    },
    external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB',
    rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
    monitoring: {
      active: true,
      interval: '30 seconds',
      threshold: '10 MB growth',
    },
  };

  return NextResponse.json({
    success: true,
    data: status,
  });
}

/**
 * 鑾峰彇璇︾粏鍐呭瓨鎶ュ憡
 */
async function getMemoryReport() {
  const report = memoryOptimizer.getMemoryReport();

  const formattedReport = {
    current: {
      timestamp: new Date(report.current.timestamp).toISOString(),
      heapUsed: (report.current.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (report.current.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      external: (report.current.external / 1024 / 1024).toFixed(2) + ' MB',
      rss: (report.current.rss / 1024 / 1024).toFixed(2) + ' MB',
    },
    statistics: {
      averageUsage: report.statistics.averageUsage.toFixed(2) + ' MB',
      peakUsage: report.statistics.peakUsage.toFixed(2) + ' MB',
      growthTrend: report.statistics.growthTrend,
    },
    leakDetection: {
      detected: report.leakReport.detected,
      severity: report.leakReport.severity,
      currentUsage: report.leakReport.currentUsage.toFixed(2) + ' MB',
      growthRate: report.leakReport.growthRate.toFixed(2) + ' bytes/interval',
      recommendations: report.leakReport.recommendations,
    },
    historyPoints: report.history.length,
  };

  return NextResponse.json({
    success: true,
    data: formattedReport,
  });
}

/**
 * 瑙﹀彂鍐呭瓨浼樺寲
 */
async function triggerOptimization() {
  memoryOptimizer.optimizeMemory();

  return NextResponse.json({
    success: true,
    message: '鍐呭瓨浼樺寲宸茶Е?,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 寮€濮嬪唴瀛樼洃? */
async function startMemoryMonitoring() {
  memoryOptimizer.startMonitoring();

  return NextResponse.json({
    success: true,
    message: '鍐呭瓨鐩戞帶宸插惎?,
    config: {
      threshold: '10 MB',
      checkInterval: '30 seconds',
      alertThreshold: '500 MB',
    },
  });
}

/**
 * 鍋滄鍐呭瓨鐩戞帶
 */
async function stopMemoryMonitoring() {
  memoryOptimizer.stopMonitoring();

  return NextResponse.json({
    success: true,
    message: '鍐呭瓨鐩戞帶宸插仠?,
  });
}

/**
 * 娉ㄥ唽瀵硅薄杩涜璺熻釜
 */
async function registerObjectForTracking(data: {
  identifier: string;
  size?: number;
}) {
  // 鍒涘缓涓€涓祴璇曞?  const testObject = {
    id: data.identifier,
    data: new Array(data.size || 1000).fill('test-data'),
    timestamp: Date.now(),
  };

  memoryOptimizer.registerTrackedObject(testObject, data.identifier);

  return NextResponse.json({
    success: true,
    message: `瀵硅薄 ${data.identifier} 宸叉敞鍐岃窡韪猔,
    objectId: data.identifier,
  });
}

/**
 * 妯℃嫙鍐呭瓨娉勬紡锛堜粎鐢ㄤ簬娴嬭瘯? */
async function simulateMemoryLeak(data: { iterations?: number }) {
  const iterations = data.iterations || 100;
  const leakObjects: any[] = [];

  console.log(`馃И 寮€濮嬫ā鎷熷唴瀛樻硠婕忔祴?(${iterations} 娆¤凯?`);

  for (let i = 0; i < iterations; i++) {
    // 鍒涘缓涓嶆柇澧為暱鐨勫璞℃暟?    const leakObj = {
      id: `leak_${i}_${Date.now()}`,
      data: new Array(10000).fill(`leaked_data_${i}`),
      timestamp: Date.now(),
      iteration: i,
    };

    leakObjects.push(leakObj);

    // 锟?0娆¤凯浠ｆ鏌ヤ竴娆″唴?    if (i % 10 === 0) {
      const currentMemory = process.memoryUsage();
      console.log(
        `杩唬 ${i}: Heap浣跨敤 ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`
      );
    }
  }

  // 涓嶆竻鐞嗚繖浜涘璞★紝璁╁畠浠垚涓哄唴瀛樻硠?
  return NextResponse.json({
    success: true,
    message: '鍐呭瓨娉勬紡妯℃嫙瀹屾垚',
    details: {
      createdObjects: iterations,
      estimatedLeakSize: `${((iterations * 10000 * 20) / 1024 / 1024).toFixed(2)} MB`,
      warning: '杩欐槸娴嬭瘯鐢ㄧ殑鏁呮剰鍐呭瓨娉勬紡锛岃鎵嬪姩娓呯悊',
    },
  });
}

