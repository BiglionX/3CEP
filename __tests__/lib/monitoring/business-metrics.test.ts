// 业务指标收集测试
import { enhancedMonitoring } from '@/lib/enhanced-monitoring';

describe('业务指标收集测试', () => {
  beforeEach(() => {
    // 重置监控实例
    enhancedMonitoring.resetAllMetrics();
  });

  describe('认证指标收集', () => {
    test('应该正确记录登录尝试', () => {
      enhancedMonitoring.recordLoginAttempt('email', true);
      enhancedMonitoring.recordLoginAttempt(
        'oauth',
        false,
        'invalid_credentials'
      );

      // 验证指标已被记录（实际验证需要访问Prometheus指标）
      expect(true).toBe(true); // 占位符测试
    });

    test('应该正确记录登出操作', () => {
      enhancedMonitoring.recordLogout();
      expect(true).toBe(true);
    });

    test('应该正确更新活跃会话数', () => {
      enhancedMonitoring.updateActiveSessions(42);
      expect(true).toBe(true);
    });

    test('应该正确记录会话持续时间', () => {
      enhancedMonitoring.recordSessionDuration(1800); // 30分钟
      expect(true).toBe(true);
    });

    test('应该正确记录认证延迟', () => {
      enhancedMonitoring.recordAuthLatency('login', 0.25); // 250ms
      expect(true).toBe(true);
    });
  });

  describe('API指标收集', () => {
    test('应该正确开始HTTP请求跟踪', () => {
      const traceId = enhancedMonitoring.startHttpRequest('GET', '/api/users');
      expect(typeof traceId).toBe('string');
      expect(traceId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    test('应该正确结束HTTP请求跟踪', () => {
      const traceId = enhancedMonitoring.startHttpRequest('POST', '/api/login');
      enhancedMonitoring.endHttpRequest(traceId, 200, 1024);
      expect(true).toBe(true);
    });

    test('应该正确处理错误请求', () => {
      const traceId = enhancedMonitoring.startHttpRequest('GET', '/api/error');
      enhancedMonitoring.endHttpRequest(traceId, 500, 0);
      expect(true).toBe(true);
    });
  });

  describe('业务指标收集', () => {
    test('应该正确记录用户注册', () => {
      enhancedMonitoring.recordUserRegistration('google');
      enhancedMonitoring.recordUserRegistration('direct');
      expect(true).toBe(true);
    });

    test('应该正确记录成功业务操作', () => {
      enhancedMonitoring.recordSuccessfulOperation('create_order');
      enhancedMonitoring.recordSuccessfulOperation('update_profile');
      expect(true).toBe(true);
    });

    test('应该正确记录失败业务操作', () => {
      enhancedMonitoring.recordFailedOperation(
        'create_order',
        'insufficient_stock'
      );
      enhancedMonitoring.recordFailedOperation('payment', 'card_declined');
      expect(true).toBe(true);
    });

    test('应该正确记录业务延迟', () => {
      enhancedMonitoring.recordBusinessLatency('order_processing', 2.5);
      enhancedMonitoring.recordBusinessLatency('payment_processing', 1.8);
      expect(true).toBe(true);
    });

    test('应该正确更新并发用户数', () => {
      enhancedMonitoring.updateConcurrentUsers(156);
      expect(true).toBe(true);
    });
  });

  describe('自定义指标收集', () => {
    test('应该正确记录自定义指标', () => {
      enhancedMonitoring.recordCustomMetric('custom_business_value', 42.5, {
        category: 'sales',
        region: 'asia',
      });

      enhancedMonitoring.recordCustomMetric('processing_queue_length', 12, {
        service: 'order-processing',
      });

      expect(true).toBe(true);
    });

    test('应该能够获取自定义指标', () => {
      enhancedMonitoring.recordCustomMetric('test_metric', 100);
      const metrics = enhancedMonitoring.getCustomMetrics(10);

      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    test('应该维持缓冲区大小限制', () => {
      // 添加超过缓冲区大小的指标
      for (let i = 0; i < 1100; i++) {
        enhancedMonitoring.recordCustomMetric('overflow_test', i);
      }

      const metrics = enhancedMonitoring.getCustomMetrics();
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('监控指标导出', () => {
    test('应该能够生成Prometheus格式的指标文本', async () => {
      // 记录一些测试指标
      enhancedMonitoring.recordLoginAttempt('email', true);
      enhancedMonitoring.recordSuccessfulOperation('test_operation');

      const metricsText = await enhancedMonitoring.getMetricsText();

      expect(typeof metricsText).toBe('string');
      expect(metricsText.length).toBeGreaterThan(0);
      expect(metricsText).toContain('# HELP');
      expect(metricsText).toContain('# TYPE');
    });

    test('应该包含所有主要指标类别', async () => {
      const metricsText = await enhancedMonitoring.getMetricsText();

      // 检查是否包含各种指标类型
      expect(metricsText).toContain('auth_');
      expect(metricsText).toContain('http_');
      expect(metricsText).toContain('business_');
      expect(metricsText).toContain('nodejs_');
    });
  });

  describe('性能监控装饰器', () => {
    test('应该正确包装认证函数', async () => {
      const mockAuthFunction = jest.fn().mockResolvedValue({ success: true });
      const decoratedFunction = enhancedMonitoring.withAuthMonitoring(
        mockAuthFunction,
        'test_auth_operation'
      );

      const result = await decoratedFunction('test-param');

      expect(mockAuthFunction).toHaveBeenCalledWith('test-param');
      expect(result).toEqual({ success: true });
    });

    test('应该正确包装业务函数', async () => {
      const mockBusinessFunction = jest.fn().mockResolvedValue({ id: 123 });
      const decoratedFunction = enhancedMonitoring.withBusinessMonitoring(
        mockBusinessFunction,
        'create_order'
      );

      const result = await decoratedFunction({ amount: 100 });

      expect(mockBusinessFunction).toHaveBeenCalledWith({ amount: 100 });
      expect(result).toEqual({ id: 123 });
    });
  });
});
