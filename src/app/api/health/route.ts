import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthStatus = await checkOverallHealth();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 206 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });

  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: '健康检查服务异常'
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
    checkResourceUsage()
  ]);

  const serviceStatus = {
    database: checks[0].status === 'fulfilled' ? checks[0].value : { healthy: false, error: '检查失败' },
    api: checks[1].status === 'fulfilled' ? checks[1].value : { healthy: false, error: '检查失败' },
    external: checks[2].status === 'fulfilled' ? checks[2].value : { healthy: false, error: '检查失败' },
    resources: checks[3].status === 'fulfilled' ? checks[3].value : { healthy: false, error: '检查失败' }
  };

  // 计算总体健康状态
  const healthyServices = Object.values(serviceStatus).filter(
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
      uptime: calculateUptime()
    }
  };
}

async function checkDatabase() {
  try {
    // 检查数据库连接和基本查询
    const startTime = Date.now();
    
    // 这里应该实际测试数据库连接
    // 模拟数据库检查
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: true,
      response_time: responseTime,
      latency: responseTime
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message
    };
  }
}

async function checkApiEndpoints() {
  try {
    const endpoints = [
      '/api/health',
      '/api/marketing/lead',
      '/api/marketing/track'
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(
            `http://localhost:3006${endpoint}`,
            {
              method: 'HEAD',
              signal: controller.signal
            }
          );
          
          clearTimeout(timeoutId);
          
          return {
            endpoint,
            healthy: response.ok,
            status: response.status,
            response_time: 0 // 简化处理
          };
        } catch (error) {
          return {
            endpoint,
            healthy: false,
            error: (error as Error).message
          };
        }
      })
    );

    const healthyEndpoints = results.filter(r => r.healthy).length;
    
    return {
      healthy: healthyEndpoints === endpoints.length,
      endpoints: results,
      healthy_count: healthyEndpoints,
      total_count: endpoints.length
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message
    };
  }
}

async function checkExternalServices() {
  try {
    // 检查外部依赖服务
    const services = [
      { name: 'Supabase', url: 'https://hrjqzbhqueleszkvnsen.supabase.co' },
      { name: 'n8n', url: process.env.N8N_API_URL || 'http://localhost:5678' }
    ];

    const results = await Promise.all(
      services.map(async (service) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const response = await fetch(service.url, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          return {
            service: service.name,
            healthy: response.ok,
            status: response.status
          };
        } catch (error) {
          return {
            service: service.name,
            healthy: false,
            error: (error as Error).message
          };
        }
      })
    );

    const healthyServices = results.filter(r => r.healthy).length;
    
    return {
      healthy: healthyServices === services.length,
      services: results,
      healthy_count: healthyServices,
      total_count: services.length
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message
    };
  }
}

async function checkResourceUsage() {
  try {
    // 检查系统资源使用情况
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // 内存使用百分比（假设最大1GB）
    const memoryPercent = (memoryUsage.heapUsed / (1024 * 1024 * 1024)) * 100;
    
    return {
      healthy: memoryPercent < 80, // 内存使用低于80%认为健康
      metrics: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          percent: Math.round(memoryPercent * 100) / 100
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message
    };
  }
}

function calculateUptime(): number {
  // 简化的运行时间计算
  // 实际应该从应用启动时间计算
  return 99.9; // 模拟值
}

// POST 方法用于详细的健康检查
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detailed = false } = body;

    const healthStatus = await checkOverallHealth();

    if (detailed) {
      // 添加详细的诊断信息
      const detailedInfo = await getDetailedDiagnostics();
      return NextResponse.json({
        ...healthStatus,
        diagnostics: detailedInfo
      });
    }

    return NextResponse.json(healthStatus);

  } catch (error) {
    console.error('详细健康检查失败:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: '详细健康检查服务异常'
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
      arch: process.arch
    },
    process: {
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      versions: process.versions
    },
    environment: {
      node_env: process.env.NODE_ENV,
      next_version: process.env.NEXT_VERSION
    }
  };
}