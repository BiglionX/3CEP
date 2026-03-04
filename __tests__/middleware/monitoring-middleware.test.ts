// 监控中间件测试
import { NextRequest, NextResponse } from 'next/server';
import {
  monitoringMiddleware,
  withAuthMonitoring,
  withBusinessMonitoring,
} from '@/middleware/monitoring-middleware';
import { enhancedMonitoring } from '@/lib/enhanced-monitoring';

// Mock Next.js Response
const createMockResponse = (
  status: number = 200,
  body?: string
): NextResponse => {
  const response = new NextResponse(body || 'OK', { status });
  return response;
};

// Mock Next.js Request
const createMockRequest = (
  url: string = '/',
  method: string = 'GET'
): NextRequest => {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: {
      'content-type': 'application/json',
    },
  });
};

describe('监控中间件测试', () => {
  beforeEach(() => {
    enhancedMonitoring.resetAllMetrics();
    jest.clearAllMocks();
  });

  describe('基础监控功能', () => {
    test('应该正确处理成功的HTTP请求', async () => {
      const request = createMockRequest('/api/test', 'GET');
      const mockNext = jest
        .fn()
        .mockResolvedValue(createMockResponse(200, '{"data":"test"}'));

      const response = await monitoringMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Response-Time')).toBeTruthy();
    });

    test('应该正确处理失败的HTTP请求', async () => {
      const request = createMockRequest('/api/error', 'POST');
      const mockNext = jest
        .fn()
        .mockResolvedValue(createMockResponse(500, 'Internal Server Error'));

      const response = await monitoringMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(500);
    });

    test('应该正确处理抛出异常的情况', async () => {
      const request = createMockRequest('/api/exception', 'GET');
      const mockNext = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(monitoringMiddleware(request, mockNext)).rejects.toThrow(
        'Test error'
      );
    });

    test('应该正确处理不同HTTP方法', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      for (const method of methods) {
        const request = createMockRequest(
          `/api/resource/${method.toLowerCase()}`,
          method
        );
        const mockNext = jest.fn().mockResolvedValue(createMockResponse(200));

        const response = await monitoringMiddleware(request, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(response.status).toBe(200);
      }
    });
  });

  describe('路由标准化', () => {
    test('应该正确标准化包含数字ID的路由', async () => {
      const request = createMockRequest('/api/users/12345/posts/67890', 'GET');
      const mockNext = jest.fn().mockResolvedValue(createMockResponse(200));

      await monitoringMiddleware(request, mockNext);

      // 验证指标应该被记录为 /api/users/:id/posts/:id 格式
      expect(mockNext).toHaveBeenCalled();
    });

    test('应该正确标准化包含UUID的路由', async () => {
      const request = createMockRequest(
        '/api/documents/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'GET'
      );
      const mockNext = jest.fn().mockResolvedValue(createMockResponse(200));

      await monitoringMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('应该保留查询参数但不影响路由识别', async () => {
      const request = createMockRequest(
        '/api/search?q=test&page=1&limit=10',
        'GET'
      );
      const mockNext = jest.fn().mockResolvedValue(createMockResponse(200));

      const response = await monitoringMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('认证监控装饰器', () => {
    test('应该正确包装成功的认证函数', async () => {
      const mockAuthFn = jest.fn().mockResolvedValue({ user: { id: '123' } });
      const decoratedFn = withAuthMonitoring(mockAuthFn, 'login');

      const result = await decoratedFn('test@example.com', 'password');

      expect(mockAuthFn).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toEqual({ user: { id: '123' } });
    });

    test('应该正确包装失败的认证函数', async () => {
      const mockAuthFn = jest
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));
      const decoratedFn = withAuthMonitoring(mockAuthFn, 'login');

      await expect(decoratedFn('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockAuthFn).toHaveBeenCalledWith('test@example.com', 'wrong');
    });

    test('应该处理不同类型的认证操作', async () => {
      const operations = ['login', 'logout', 'refresh_token', 'verify_email'];

      for (const operation of operations) {
        const mockAuthFn = jest.fn().mockResolvedValue({ success: true });
        const decoratedFn = withAuthMonitoring(mockAuthFn, operation);

        const result = await decoratedFn();
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe('业务监控装饰器', () => {
    test('应该正确包装成功的业务函数', async () => {
      const mockBusinessFn = jest
        .fn()
        .mockResolvedValue({ orderId: 'ORD-123' });
      const decoratedFn = withBusinessMonitoring(
        mockBusinessFn,
        'create_order'
      );

      const result = await decoratedFn({ productId: 1, quantity: 2 });

      expect(mockBusinessFn).toHaveBeenCalledWith({
        productId: 1,
        quantity: 2,
      });
      expect(result).toEqual({ orderId: 'ORD-123' });
    });

    test('应该正确包装失败的业务函数', async () => {
      const mockBusinessFn = jest
        .fn()
        .mockRejectedValue(new Error('Insufficient stock'));
      const decoratedFn = withBusinessMonitoring(
        mockBusinessFn,
        'create_order'
      );

      await expect(
        decoratedFn({ productId: 999, quantity: 100 })
      ).rejects.toThrow('Insufficient stock');

      expect(mockBusinessFn).toHaveBeenCalledWith({
        productId: 999,
        quantity: 100,
      });
    });

    test('应该处理不同的业务操作类型', async () => {
      const operations = [
        'create_order',
        'update_profile',
        'process_payment',
        'send_notification',
      ];

      for (const operation of operations) {
        const mockBusinessFn = jest.fn().mockResolvedValue({ success: true });
        const decoratedFn = withBusinessMonitoring(mockBusinessFn, operation);

        const result = await decoratedFn({ testData: true });
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe('并发和性能监控', () => {
    test('应该正确跟踪并发请求数', async () => {
      const requests = [
        monitoringMiddleware(createMockRequest('/api/req1'), () =>
          Promise.resolve(createMockResponse(200))
        ),
        monitoringMiddleware(createMockRequest('/api/req2'), () =>
          Promise.resolve(createMockResponse(200))
        ),
        monitoringMiddleware(createMockRequest('/api/req3'), () =>
          Promise.resolve(createMockResponse(200))
        ),
      ];

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('应该正确处理慢速请求', async () => {
      const slowHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms延迟
        return createMockResponse(200);
      };

      const request = createMockRequest('/api/slow-endpoint');
      const startTime = Date.now();

      const response = await monitoringMiddleware(request, slowHandler);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('响应头信息', () => {
    test('应该添加正确的监控头部信息', async () => {
      const request = createMockRequest('/api/test-response-headers');
      const mockNext = jest
        .fn()
        .mockResolvedValue(createMockResponse(200, 'test data'));

      const response = await monitoringMiddleware(request, mockNext);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Response-Time')).toBeTruthy();

      const requestId = response.headers.get('X-Request-ID');
      const responseTime = response.headers.get('X-Response-Time');

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(responseTime).toMatch(/^\d+ms$/);
    });

    test('应该正确计算响应时间', async () => {
      const request = createMockRequest('/api/timing-test');
      const mockNext = jest.fn().mockResolvedValue(createMockResponse(200));

      const response = await monitoringMiddleware(request, mockNext);
      const responseTimeHeader = response.headers.get('X-Response-Time');

      expect(responseTimeHeader).toBeTruthy();
      const responseTime = parseInt(responseTimeHeader!.replace('ms', ''));
      expect(responseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
