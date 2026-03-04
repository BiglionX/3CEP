// 监控中间?- 自动收集HTTP请求指标和性能数据
import { NextRequest, NextResponse } from 'next/server';
import { enhancedMonitoring } from '@/lib/enhanced-monitoring';

// 请求上下文接?interface RequestContext {
  traceId: string;
  startTime: number;
  route: string;
  method: string;
}

// 存储请求上下文的Map
const requestContexts = new Map<string, RequestContext>();

// 生成唯一的请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 获取路由标识?function getRouteIdentifier(url: string): string {
  // 移除查询参数和具体ID
  const cleanUrl = url.split('?')[0];

  // 标准化动态路由参?  return cleanUrl
    .replace(/\/\d+/g, '/:id') // 替换数字ID
    .replace(/\/[a-f0-9-]{36}/gi, '/:uuid') // 替换UUID
    .replace(/\/users\/[^\/]+/g, '/users/:userId') // 用户相关路由
    .replace(/\/api\/[^\/]+/g, '/api/:service'); // API服务路由
}

// 监控中间件处理器
export async function monitoringMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const route = getRouteIdentifier(request.nextUrl.pathname);
  const method = request.method;

  // 记录请求开?  const traceId = enhancedMonitoring.startHttpRequest(method, route);

  // 存储请求上下?  requestContexts.set(requestId, {
    traceId,
    startTime,
    route,
    method,
  });

  try {
    // 执行下一个中间件或路由处理器
    const response = await next();

    // 计算响应大小
    const responseBody = response.body;
    let responseSize = 0;
    if (responseBody) {
      const clonedResponse = response.clone();
      const bodyText = await clonedResponse.text();
      responseSize = Buffer.byteLength(bodyText, 'utf8');
    }

    // 记录请求结束
    enhancedMonitoring.endHttpRequest(traceId, response.status, responseSize);

    // 添加监控头部信息
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    // 清理请求上下?    requestContexts.delete(requestId);

    return response;
  } catch (error) {
    // 记录错误
    enhancedMonitoring.endHttpRequest(traceId, 500, 0);

    // 清理请求上下?    requestContexts.delete(requestId);

    // 重新抛出错误
    throw error;
  }
}

// 认证监控装饰?export function withAuthMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async function (
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    const startTime = Date.now();

    try {
      const result = await fn(...args);

      // 记录成功的认证操?      const duration = (Date.now() - startTime) / 1000;
      enhancedMonitoring.recordAuthLatency(operationName, duration);

      return result;
    } catch (error) {
      // 记录失败的认证操?      const duration = (Date.now() - startTime) / 1000;
      enhancedMonitoring.recordAuthLatency(operationName, duration);

      throw error;
    }
  };
}

// 业务操作监控装饰?export function withBusinessMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationType: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async function (
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    const startTime = Date.now();

    try {
      const result = await fn(...args);

      // 记录成功的业务操?      const duration = (Date.now() - startTime) / 1000;
      enhancedMonitoring.recordBusinessLatency(operationType, duration);
      enhancedMonitoring.recordSuccessfulOperation(operationType);

      return result;
    } catch (error) {
      // 记录失败的业务操?      const duration = (Date.now() - startTime) / 1000;
      enhancedMonitoring.recordBusinessLatency(operationType, duration);
      enhancedMonitoring.recordFailedOperation(
        operationType,
        error instanceof Error ? error.message : 'unknown'
      );

      throw error;
    }
  };
}

// 获取当前活跃请求?export function getActiveRequestCount(): number {
  return requestContexts.size;
}

// 获取请求上下文信?export function getRequestContext(
  requestId: string
): RequestContext | undefined {
  return requestContexts.get(requestId);
}

// 清理过期的请求上下文
function cleanupStaleContexts(): void {
  const now = Date.now();
  const staleThreshold = 30000; // 30�?
  for (const [requestId, context] of requestContexts.entries()) {
    if (now - context.startTime > staleThreshold) {
      requestContexts.delete(requestId);
      console.warn(`清理过期请求上下? ${requestId}`);
    }
  }
}

// 定期清理过期上下?setInterval(cleanupStaleContexts, 10000); // �?0秒清理一?
// 导出默认中间件包装器
export function createMonitoringWrapper(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return monitoringMiddleware(request, () => handler(request));
  };
}

// 默认导出
export default monitoringMiddleware;
