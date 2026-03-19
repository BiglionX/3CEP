/**
 * 鍒嗗眰缂撳绛栫暐婕旂ずAPI
 * 灞曠ず涓嶅悓缂撳绛栫暐鐨勪娇鐢ㄦ柟娉曞拰鏁堟灉
 */

import { NextResponse } from 'next/server';
import { layeredCache } from '@/modules/procurement-intelligence/services/layered-cache.service';
import { CACHE_STRATEGIES } from '@/modules/procurement-intelligence/config/cache-strategy.config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'demo';

  try {
    switch (action) {
      case 'demo':
        return await demonstrateCacheStrategies();

      case 'stats':
        return await getCacheStatistics();

      case 'test':
        return await runCacheTest();

      case 'clear':
        return await clearAllCache();

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鍒嗗眰缂撳婕旂ずAPI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍐呴儴鏈嶅姟鍣ㄩ敊,
      },
      { status: 500 }
    );
  }
}

/**
 * 婕旂ず涓嶅悓缂撳绛栫暐
 */
async function demonstrateCacheStrategies() {
  console.log('馃殌 寮€濮嬪垎灞傜紦瀛樼瓥鐣ユ紨);

  const demoResults = {
    timestamp: new Date().toISOString(),
    strategies: [] as any[],
  };

  // 婕旂ず鐑偣鏁版嵁绛栫暐
  const hotDataDemo = await demoHotDataStrategy();
  demoResults.strategies.push({
    name: '鐑偣鏁版嵁绛栫暐 (HOT_DATA)',
    description: '傜敤浜庨珮棰戣闂殑鐑偣鏁版嵁灞傜紦瀛樻灦,
    ...hotDataDemo,
  });

  // 婕旂ず閰嶇疆鏁版嵁绛栫暐
  const configDemo = await demoConfigurationStrategy();
  demoResults.strategies.push({
    name: '閰嶇疆鏁版嵁绛栫暐 (CONFIGURATION)',
    description: '傜敤浜庣浉瀵归潤鎬佺殑閰嶇疆鏁版嵁灞傜紦瀛樻灦,
    ...configDemo,
  });

  // 婕旂ず璁＄畻缁撴灉绛栫暐
  const computeDemo = await demoComputationStrategy();
  demoResults.strategies.push({
    name: '璁＄畻缁撴灉绛栫暐 (COMPUTATION)',
    description: '傜敤浜嶤PU瀵嗛泦鍨嬭绠楃粨鏋滐紝2灞傜紦瀛樻灦,
    ...computeDemo,
  });

  console.log('鍒嗗眰缂撳绛栫暐婕旂ず瀹屾垚');

  return NextResponse.json({
    success: true,
    data: demoResults,
  });
}

/**
 * 鐑偣鏁版嵁绛栫暐婕旂ず
 */
async function demoHotDataStrategy() {
  const testKey = `hot-demo-${Date.now()}`;
  const testData = {
    id: testKey,
    name: '鐑偣鏁版嵁婕旂ず',
    timestamp: Date.now(),
    accessCount: 0,
  };

  // 璁剧疆鏁版嵁
  await layeredCache.set(testKey, testData, 'HOT_DATA');

  // 妯℃嫙澶氭璁块棶
  const accessResults = [];
  for (let i = 0; i < 5; i++) {
    const result = await layeredCache.get(testKey, 'HOT_DATA');
    if (result) {
      result.accessCount++;
      accessResults.push({
        access: i + 1,
        found: true,
        accessCount: result.accessCount,
      });
    } else {
      accessResults.push({
        access: i + 1,
        found: false,
      });
    }
  }

  // 鑾峰彇鏈€缁堢粺  const finalStats = layeredCache.getStats();

  return {
    testData,
    accessResults,
    finalStats: {
      totalHits: finalStats.totalHits,
      totalMisses: finalStats.totalMisses,
      overallHitRate: (finalStats.overallHitRate * 100).toFixed(2) + '%',
    },
    performance: {
      ttl: CACHE_STRATEGIES.HOT_DATA.defaultTTL,
      layers: CACHE_STRATEGIES.HOT_DATA.layers.length,
    },
  };
}

/**
 * 閰嶇疆鏁版嵁绛栫暐婕旂ず
 */
async function demoConfigurationStrategy() {
  const testKey = `config-demo-${Date.now()}`;
  const testData = {
    setting: 'configuration_demo',
    value: Math.random(),
    lastModified: new Date().toISOString(),
  };

  // 璁剧疆閰嶇疆鏁版嵁
  await layeredCache.set(testKey, testData, 'CONFIGURATION');

  // 璁块棶娴嬭瘯
  const result = await layeredCache.get(testKey, 'CONFIGURATION');

  return {
    testData,
    retrievedData: result,
    match: JSON.stringify(testData) === JSON.stringify(result),
    performance: {
      ttl: CACHE_STRATEGIES.CONFIGURATION.defaultTTL,
      layers: CACHE_STRATEGIES.CONFIGURATION.layers.length,
    },
  };
}

/**
 * 璁＄畻缁撴灉绛栫暐婕旂ず
 */
async function demoComputationStrategy() {
  const testKey = `compute-demo-${Date.now()}`;

  // 妯℃嫙澶嶆潅鐨勮绠楄繃  const heavyComputation = () => {
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }
    return {
      result,
      timestamp: Date.now(),
      complexity: 'high',
    };
  };

  // 绗竴娆¤绠楀苟缂撳
  const startTime1 = Date.now();
  const computedData = heavyComputation();
  await layeredCache.set(testKey, computedData, 'COMPUTATION');
  const firstComputeTime = Date.now() - startTime1;

  // 绗簩娆′粠缂撳鑾峰彇
  const startTime2 = Date.now();
  const cachedResult = await layeredCache.get(testKey, 'COMPUTATION');
  const cacheRetrieveTime = Date.now() - startTime2;

  return {
    computation: {
      firstRunMs: firstComputeTime,
      cacheRunMs: cacheRetrieveTime,
      speedup: (firstComputeTime / cacheRetrieveTime).toFixed(2) + 'x',
    },
    result: cachedResult,
    performance: {
      ttl: CACHE_STRATEGIES.COMPUTATION.defaultTTL,
      layers: CACHE_STRATEGIES.COMPUTATION.layers.length,
    },
  };
}

/**
 * 鑾峰彇缂撳缁熻淇℃伅
 */
async function getCacheStatistics() {
  const stats = layeredCache.getStats();

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalHits: stats.totalHits,
        totalMisses: stats.totalMisses,
        overallHitRate: (stats.overallHitRate * 100).toFixed(2) + '%',
        memoryUsage: stats.memoryUsage + ' bytes',
        lastUpdated: new Date(stats.lastUpdated).toISOString(),
      },
      layerDetails: Object.entries(stats.layerStats).map(
        ([layerName, layerStats]) => ({
          layer: layerName,
          hits: layerStats.hits,
          misses: layerStats.misses,
          hitRate: (layerStats.hitRate * 100).toFixed(2) + '%',
          evictions: layerStats.evictions,
          currentSize: layerStats.size,
        })
      ),
    },
  });
}

/**
 * 杩愯缂撳娴嬭瘯
 */
async function runCacheTest() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
  };

  // 鍩虹鍔熻兘娴嬭瘯
  try {
    const testKey = 'functional-test';
    const testData = { test: 'data', timestamp: Date.now() };

    await layeredCache.set(testKey, testData, 'HOT_DATA');
    const result = await layeredCache.get(testKey, 'HOT_DATA');

    testResults.tests.push({
      name: '鍩虹璇诲啓鍔熻兘',
      passed: JSON.stringify(result) === JSON.stringify(testData),
      details: '缂撳璇诲啓鍔熻兘姝ｅ父',
    });
  } catch (error) {
    testResults.tests.push({
      name: '鍩虹璇诲啓鍔熻兘',
      passed: false,
      details: `娴嬭瘯澶辫触: ${(error as Error).message}`,
    });
  }

  // 鎬ц兘娴嬭瘯
  try {
    const iterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await layeredCache.get('perf-test-key', 'HOT_DATA');
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / iterations;

    testResults.tests.push({
      name: '鎬ц兘鍩哄噯娴嬭瘯',
      passed: avgTime < 50,
      details: `骞冲潎鍝嶅簲堕棿: ${avgTime.toFixed(2)}ms (${avgTime < 50 ? '杈炬爣' : '鏈揪})`,
    });
  } catch (error) {
    testResults.tests.push({
      name: '鎬ц兘鍩哄噯娴嬭瘯',
      passed: false,
      details: `娴嬭瘯澶辫触: ${(error as Error).message}`,
    });
  }

  const passedTests = testResults.tests.filter(t => t.passed).length;
  const totalTests = testResults.tests.length;

  return NextResponse.json({
    success: true,
    data: {
      ...testResults,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        passRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
      },
    },
  });
}

/**
 * 娓呯┖鎵€鏈夌紦 */
async function clearAllCache() {
  await layeredCache.clearAll();

  return NextResponse.json({
    success: true,
    message: '鎵€鏈夌紦瀛樺凡娓呯┖',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: 'POST鏂规硶涓嶆敮,
    },
    { status: 405 }
  );
}

