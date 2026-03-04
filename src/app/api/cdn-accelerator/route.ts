import { NextResponse } from 'next/server';
import { createCDNAccelerator, CDNAccelerator } from '@/lib/cdn-accelerator';

// 鍏ㄥ眬CDN鍔犻€熷櫒瀹炰緥
let cdnAccelerator: CDNAccelerator;

function getCDNAccelerator(): CDNAccelerator {
  if (!cdnAccelerator) {
    cdnAccelerator = createCDNAccelerator({
      provider: 'custom',
      routingRules: [
        {
          name: 'geographic-routing',
          condition: 'geoip',
          action: 'route-to-nearest',
          priority: 1,
        },
        {
          name: 'load-balancing',
          condition: 'server-load',
          action: 'distribute-evenly',
          priority: 2,
        },
      ],
      security: {
        wafEnabled: true,
        rateLimiting: true,
        ddosProtection: true,
      },
      compression: {
        gzip: true,
        brotli: true,
        minFileSize: 1024,
      },
    });
  }
  return cdnAccelerator;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'stats';

  try {
    const accelerator = getCDNAccelerator();

    switch (action) {
      case 'stats':
        return getStatistics(accelerator);

      case 'test':
        return await testCDNPerformance(accelerator);

      case 'purge':
        return await purgeCache(accelerator, searchParams);

      case 'warmup':
        return await warmupCache(accelerator, searchParams);

      case 'config':
        return getConfiguration(accelerator);

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被?,
            availableActions: ['stats', 'test', 'purge', 'warmup', 'config'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CDN鍔犻€熷櫒API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const accelerator = getCDNAccelerator();
    const body = await request.json();

    // 妯℃嫙CDN璇锋眰澶勭悊
    const cdnRequest = {
      url: body.url || '/',
      method: body.method || 'GET',
      headers: body.headers || {},
      body: body.body,
    };

    const response = await accelerator.handleRequest(cdnRequest);

    return NextResponse.json({
      success: true,
      data: {
        cached: response.cached,
        region: response.region,
        processingTime: response.processingTime,
        statusCode: response.statusCode,
        headers: response.headers,
      },
    });
  } catch (error) {
    console.error('CDN璇锋眰澶勭悊閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '璇锋眰澶勭悊澶辫触',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getStatistics(accelerator: CDNAccelerator) {
  const stats = accelerator.getStatistics();

  return NextResponse.json({
    success: true,
    data: {
      statistics: stats,
      timestamp: new Date().toISOString(),
      status: 'active',
    },
  });
}

async function testCDNPerformance(accelerator: CDNAccelerator) {
  // 妯℃嫙鎬ц兘娴嬭瘯
  const testUrls = [
    '/static/main.js',
    '/api/products',
    '/images/logo.png',
    '/dashboard',
  ];

  const results: any[] = [];

  for (const url of testUrls) {
    const startTime = Date.now();
    const response = await accelerator.handleRequest({
      url,
      method: 'GET',
      headers: {},
    });
    const endTime = Date.now();

    results.push({
      url,
      cached: response.cached,
      region: response.region,
      processingTime: response.processingTime,
      totalTime: endTime - startTime,
      statusCode: response.statusCode,
    });
  }

  const cacheHitRate = results.filter(r => r.cached).length / results.length;

  return NextResponse.json({
    success: true,
    data: {
      testResults: results,
      summary: {
        totalTests: results.length,
        cacheHits: results.filter(r => r.cached).length,
        cacheHitRate: Math.round(cacheHitRate * 100),
        averageProcessingTime: Math.round(
          results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
        ),
      },
      timestamp: new Date().toISOString(),
    },
  });
}

async function purgeCache(
  accelerator: CDNAccelerator,
  searchParams: URLSearchParams
) {
  const patternsParam = searchParams.get('patterns');
  if (!patternsParam) {
    return NextResponse.json(
      {
        success: false,
        error: '缂哄皯patterns鍙傛暟',
      },
      { status: 400 }
    );
  }

  try {
    const patterns = patternsParam.split(',');
    await accelerator.purgeCache(patterns);

    return NextResponse.json({
      success: true,
      data: {
        purgedPatterns: patterns,
        message: `鎴愬姛娓呴櫎 ${patterns.length} 涓紦瀛樻ā寮廯,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '缂撳瓨娓呴櫎澶辫触',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function warmupCache(
  accelerator: CDNAccelerator,
  searchParams: URLSearchParams
) {
  const urlsParam = searchParams.get('urls');
  if (!urlsParam) {
    return NextResponse.json(
      {
        success: false,
        error: '缂哄皯urls鍙傛暟',
      },
      { status: 400 }
    );
  }

  try {
    const urls = urlsParam.split(',');
    await accelerator.warmupCache(urls);

    return NextResponse.json({
      success: true,
      data: {
        warmedUpUrls: urls,
        message: `鎴愬姛棰勭儹 ${urls.length} 涓猆RL`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '缂撳瓨棰勭儹澶辫触',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getConfiguration(accelerator: CDNAccelerator) {
  const stats = accelerator.getStatistics();

  return NextResponse.json({
    success: true,
    data: {
      configuration: {
        provider: stats.config.provider,
        routingRules: stats.config.routingRules,
        security: stats.config.security,
        compression: stats.config.compression,
      },
      activeNodes: stats.activeNodes,
      regions: Object.keys(stats.locationStats),
      timestamp: new Date().toISOString(),
    },
  });
}

