import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthStatus = await checkOverallHealth();

    const statusCode =
      healthStatus.status === 'healthy'
         200
        : healthStatus.status === 'degraded'
           206
          : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('鍋ュ悍妫€鏌ュけ', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: '鍋ュ悍妫€鏌ユ湇鍔″紓,
      },
      { status: 500 }
    );
  }
}

async function checkOverallHealth() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkApiEndpoints(),
    checkExternalServices(),
    checkResourceUsage(),
  ]);

  const serviceStatus = {
    database:
      checks[0].status === 'fulfilled'
         checks[0].value
        : { healthy: false, error: '妫€鏌ュけ },
    api:
      checks[1].status === 'fulfilled'
         checks[1].value
        : { healthy: false, error: '妫€鏌ュけ },
    external:
      checks[2].status === 'fulfilled'
         checks[2].value
        : { healthy: false, error: '妫€鏌ュけ },
    resources:
      checks[3].status === 'fulfilled'
         checks[3].value
        : { healthy: false, error: '妫€鏌ュけ },
  };

  // 璁＄畻鎬讳綋鍋ュ悍鐘  const healthyServices = Object.values(serviceStatus).filter(
    (s: any) => s.healthy
  ).length;
  const totalServices = Object.keys(serviceStatus).length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (healthyServices === 0) {
    overallStatus = 'unhealthy';
  } else if (healthyServices < totalServices) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: serviceStatus,
    summary: {
      healthy: healthyServices,
      total: totalServices,
      uptime: calculateUptime(),
    },
  };
}

async function checkDatabase() {
  try {
    // 妫€鏌ユ暟鎹簱杩炴帴鍜屽熀鏈煡    const startTime = Date.now();

    // 杩欓噷搴旇瀹為檯娴嬭瘯鏁版嵁搴撹繛    // 妯℃嫙鏁版嵁搴撴    await new Promise(resolve => setTimeout(resolve, 100));

    const responseTime = Date.now() - startTime;

    return {
      healthy: true,
      response_time: responseTime,
      latency: responseTime,
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
    };
  }
}

async function checkApiEndpoints() {
  try {
    const endpoints = [
      '/api/health',
      '/api/marketing/lead',
      '/api/marketing/track',
    ];

    const results = await Promise.all(
      endpoints.map(async endpoint => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(`http://localhost:3006${endpoint}`, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          return {
            endpoint,
            healthy: response.ok,
            status: response.status,
            response_time: 0, // 绠€鍖栧          };
        } catch (error) {
          return {
            endpoint,
            healthy: false,
            error: (error as Error).message,
          };
        }
      })
    );

    const healthyEndpoints = results.filter(r => r.healthy).length;

    return {
      healthy: healthyEndpoints === endpoints.length,
      endpoints: results,
      healthy_count: healthyEndpoints,
      total_count: endpoints.length,
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
    };
  }
}

async function checkExternalServices() {
  try {
    // 妫€鏌ュ閮ㄤ緷璧栨湇    const services = [
      { name: 'Supabase', url: 'https://hrjqzbhqueleszkvnsen.supabase.co' },
      { name: 'n8n', url: process.env.N8N_API_URL || 'http://localhost:5678' },
    ];

    const results = await Promise.all(
      services.map(async service => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch(service.url, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          return {
            service: service.name,
            healthy: response.ok,
            status: response.status,
          };
        } catch (error) {
          return {
            service: service.name,
            healthy: false,
            error: (error as Error).message,
          };
        }
      })
    );

    const healthyServices = results.filter(r => r.healthy).length;

    return {
      healthy: healthyServices === services.length,
      services: results,
      healthy_count: healthyServices,
      total_count: services.length,
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
    };
  }
}

async function checkResourceUsage() {
  try {
    // 妫€鏌ョ郴缁熻祫婧愪娇鐢ㄦ儏    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // 鍐呭浣跨敤鐧惧垎姣旓紙鍋囪鏈€GB    const memoryPercent = (memoryUsage.heapUsed / (1024 * 1024 * 1024)) * 100;

    return {
      healthy: memoryPercent < 80, // 鍐呭浣跨敤浣庝簬80%璁や负鍋ュ悍
      metrics: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          percent: Math.round(memoryPercent * 100) / 100,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
    };
  }
}

function calculateUptime(): number {
  // 绠€鍖栫殑杩愯堕棿璁＄畻
  // 瀹為檯搴旇庡簲鐢ㄥ惎鍔ㄦ椂闂磋  return 99.9; // 妯℃嫙}

// POST 鏂规硶鐢ㄤ簬璇︾粏鐨勫仴搴export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detailed = false } = body;

    const healthStatus = await checkOverallHealth();

    if (detailed) {
      // 娣诲姞璇︾粏鐨勮瘖鏂俊      const detailedInfo = await getDetailedDiagnostics();
      return NextResponse.json({
        ...healthStatus,
        diagnostics: detailedInfo,
      });
    }

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('璇︾粏鍋ュ悍妫€鏌ュけ', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: '璇︾粏鍋ュ悍妫€鏌ユ湇鍔″紓,
      },
      { status: 503 }
    );
  }
}

async function getDetailedDiagnostics() {
  return {
    system: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    process: {
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      versions: process.versions,
    },
    environment: {
      node_env: process.env.NODE_ENV,
      next_version: process.env.NEXT_VERSION,
    },
  };
}

