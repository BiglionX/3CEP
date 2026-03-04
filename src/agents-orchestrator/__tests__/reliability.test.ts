/**
 * Agents Orchestrator 可靠性模块单元测? */

import {
  ReliabilityHandler,
  createReliabilityHandler,
} from '../lib/reliability';
import {
  AgentInvokeRequest,
  ReliabilityConfig,
  ReliabilityMiddlewareOptions,
} from '../types';

describe('ReliabilityHandler', () => {
  let reliabilityHandler: ReliabilityHandler;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    // 创建测试配置
    const testConfig: Partial<ReliabilityConfig> = {
      maxRetries: 3,
      timeoutMs: 5000,
      retryDelayMs: 100,
      maxRetryDelayMs: 1000,
      enableIdempotency: true,
      idempotencyExpiryMs: 5000,
    };

    reliabilityHandler = createReliabilityHandler(testConfig);
    mockHandler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('超时控制测试', () => {
    test('应该在指定超时时间内触发超时错误', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_timeout_1',
        trace_id: 'trace_1',
        timeout: 1, // 1 秒
        agent_name: 'TestAgent',
        payload: {},
      };

      // 模拟一个长时间运行的处理器
      mockHandler.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 秒延迟
        return { success: true };
      });

      await expect(
        reliabilityHandler.executeWithReliability(request, mockHandler)
      ).rejects.toThrow(/超时/);

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    test('应该在合理时间内完成正常请求', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_normal_1',
        trace_id: 'trace_2',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      mockHandler.mockResolvedValue({ success: true, data: 'test result' });

      const result = await reliabilityHandler.executeWithReliability(
        request,
        mockHandler
      );

      expect(result).toEqual({ success: true, data: 'test result' });
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('重试机制测试', () => {
    test('应该在可重试错误时触发重试', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_retry_1',
        trace_id: 'trace_3',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      // 模拟前两次失败，第三次成功的场景
      mockHandler
        .mockRejectedValueOnce(new Error('500 Internal Server Error'))
        .mockRejectedValueOnce(new Error('503 Service Unavailable'))
        .mockResolvedValueOnce({ success: true, data: 'retry success' });

      const result = await reliabilityHandler.executeWithReliability(
        request,
        mockHandler
      );

      expect(result).toEqual({ success: true, data: 'retry success' });
      expect(mockHandler).toHaveBeenCalledTimes(3);
    });

    test('不应该对不可重试错误进行重试', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_no_retry_1',
        trace_id: 'trace_4',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      mockHandler.mockRejectedValue(new Error('400 Bad Request'));

      await expect(
        reliabilityHandler.executeWithReliability(request, mockHandler)
      ).rejects.toThrow('400 Bad Request');

      expect(mockHandler).toHaveBeenCalledTimes(1); // 应该只调用一次，不重试
    });

    test('应该遵守最大重试次数限制', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_max_retry_1',
        trace_id: 'trace_5',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      // 模拟连续失败
      mockHandler.mockRejectedValue(new Error('500 Internal Server Error'));

      await expect(
        reliabilityHandler.executeWithReliability(request, mockHandler)
      ).rejects.toThrow('500 Internal Server Error');

      expect(mockHandler).toHaveBeenCalledTimes(4); // 1 次初始 + 3 次重试
    });
  });

  describe('幂等性测试', () => {
    test('相同幂等键应该只处理一次', async () => {
      const idempotencyKey = 'test_idempotent_1';
      const request1: AgentInvokeRequest = {
        idempotency_key: idempotencyKey,
        trace_id: 'trace_6',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: { data: 'first request' },
      };

      const request2: AgentInvokeRequest = {
        idempotency_key: idempotencyKey,
        trace_id: 'trace_7',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: { data: 'second request' },
      };

      // 第一次调用应该执行处理器
      mockHandler.mockResolvedValueOnce({ result: 'first execution' });

      const result1 = await reliabilityHandler.executeWithReliability(
        request1,
        mockHandler
      );

      // 第二次调用应该返回缓存的结果，而不是再次执行处理器
      const result2 = await reliabilityHandler.executeWithReliability(
        request2,
        mockHandler
      );

      expect(result1).toEqual({ result: 'first execution' });
      expect(result2).toEqual({ result: 'first execution' });
      expect(mockHandler).toHaveBeenCalledTimes(1); // 处理器只被调用一次
    });

    test('不同的幂等键应该分别处理', async () => {
      const request1: AgentInvokeRequest = {
        idempotency_key: 'test_different_1',
        trace_id: 'trace_8',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: { data: 'request 1' },
      };

      const request2: AgentInvokeRequest = {
        idempotency_key: 'test_different_2',
        trace_id: 'trace_9',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: { data: 'request 2' },
      };

      mockHandler
        .mockResolvedValueOnce({ result: 'execution 1' })
        .mockResolvedValueOnce({ result: 'execution 2' });

      const result1 = await reliabilityHandler.executeWithReliability(
        request1,
        mockHandler
      );

      const result2 = await reliabilityHandler.executeWithReliability(
        request2,
        mockHandler
      );

      expect(result1).toEqual({ result: 'execution 1' });
      expect(result2).toEqual({ result: 'execution 2' });
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    test('幂等性键过期后应该重新处理', async () => {
      // 创建短过期时间的处理器用于测试
      const shortExpiryHandler = createReliabilityHandler({
        maxRetries: 1,
        timeoutMs: 5000,
        retryDelayMs: 10,
        maxRetryDelayMs: 100,
        enableIdempotency: true,
        idempotencyExpiryMs: 100, // 100ms过期
      });

      const idempotencyKey = 'test_expiry_1';
      const request: AgentInvokeRequest = {
        idempotency_key: idempotencyKey,
        trace_id: 'trace_10',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      mockHandler
        .mockResolvedValueOnce({ result: 'first execution' })
        .mockResolvedValueOnce({ result: 'second execution' });

      // 第一次执行
      const result1 = await shortExpiryHandler.executeWithReliability(
        request,
        mockHandler
      );

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 第二次执行（键已过期）
      const result2 = await shortExpiryHandler.executeWithReliability(
        request,
        mockHandler
      );

      expect(result1).toEqual({ result: 'first execution' });
      expect(result2).toEqual({ result: 'second execution' });
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('指数退避测试', () => {
    test('应该实现指数退避延迟', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'test_backoff_1',
        trace_id: 'trace_11',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      // 记录每次调用的时间
      const callTimes: number[] = [];
      mockHandler.mockImplementation(async () => {
        callTimes.push(Date.now());
        if (callTimes.length < 3) {
          throw new Error('500 Internal Server Error');
        }
        return { success: true };
      });

      await reliabilityHandler.executeWithReliability(request, mockHandler);

      // 验证调用间隔符合指数退避
      expect(callTimes.length).toBe(3);

      const firstInterval = callTimes[1] - callTimes[0];
      const secondInterval = callTimes[2] - callTimes[1];

      // 第二次间隔应该比第一次长（考虑抖动，使用近似比较）
      expect(secondInterval).toBeGreaterThan(firstInterval * 0.8);
    });
  });

  describe('回调函数测试', () => {
    test('应该正确触发重试回调', async () => {
      const retryStartMock = jest.fn();
      const retryEndMock = jest.fn();

      const options: ReliabilityMiddlewareOptions = {
        onRetryStart: retryStartMock,
        onRetryEnd: retryEndMock,
      };

      const handlerWithCallbacks = createReliabilityHandler(
        { maxRetries: 2 },
        options
      );

      const request: AgentInvokeRequest = {
        idempotency_key: 'test_callbacks_1',
        trace_id: 'trace_12',
        timeout: 5,
        agent_name: 'TestAgent',
        payload: {},
      };

      mockHandler
        .mockRejectedValueOnce(new Error('500 First Error'))
        .mockResolvedValueOnce({ success: true });

      await handlerWithCallbacks.executeWithReliability(request, mockHandler);

      expect(retryStartMock).toHaveBeenCalledTimes(1);
      expect(retryEndMock).toHaveBeenCalledTimes(1);
      expect(retryEndMock).toHaveBeenCalledWith(
        true,
        expect.any(Object),
        request
      );
    });
  });

  describe('配置管理测试', () => {
    test('应该能够获取和更新配置', async () => {
      const initialConfig = reliabilityHandler.getConfig();
      expect(initialConfig.maxRetries).toBe(3);

      reliabilityHandler.updateConfig({ maxRetries: 5 });
      const updatedConfig = reliabilityHandler.getConfig();
      expect(updatedConfig.maxRetries).toBe(5);
    });
  });
});
