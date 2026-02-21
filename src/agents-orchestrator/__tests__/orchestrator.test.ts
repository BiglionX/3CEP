/**
 * Agents Orchestrator 主类单元测试
 */

import { AgentOrchestrator } from '../orchestrator';
import { AgentInvokeRequest, ReliabilityConfig } from '../types';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    const testConfig: Partial<ReliabilityConfig> = {
      maxRetries: 2,
      timeoutMs: 3000,
      retryDelayMs: 50,
      maxRetryDelayMs: 500,
      enableIdempotency: true,
      idempotencyExpiryMs: 2000,
    };

    orchestrator = new AgentOrchestrator(testConfig);
  });

  afterEach(async () => {
    await orchestrator.cleanup();
  });

  describe('代理调用测试', () => {
    test('应该成功处理正常的代理请求', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'orchestrator_test_1',
        trace_id: 'trace_orch_1',
        timeout: 10,
        agent_name: 'TestAgent',
        payload: {
          test_data: 'hello world',
          number: 42,
        },
      };

      const response = await orchestrator.invokeAgent(request);

      expect(response.code).toBe(200);
      expect(response.message).toBe('success');
      expect(response.trace_id).toBe(request.trace_id);
      expect(response.processing_time_ms).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.agent_name).toBe(request.agent_name);
    });

    test('应该正确处理失败的代理请求', async () => {
      const request: AgentInvokeRequest = {
        idempotency_key: 'orchestrator_fail_1',
        trace_id: 'trace_orch_2',
        timeout: 1, // 很短的超时时间，确保失败
        agent_name: 'FailingAgent',
        payload: {},
      };

      // 通过修改内部处理器来模拟持续失败
      const originalHandler = (orchestrator as any).invokeAgentHandler;
      (orchestrator as any).invokeAgentHandler = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 超过超时时间
        return {};
      };

      const response = await orchestrator.invokeAgent(request);

      expect(response.code).toBe(500);
      expect(response.message).toContain('超时');
      expect(response.trace_id).toBe(request.trace_id);
      expect(response.processing_time_ms).toBeDefined();

      // 恢复原始处理器
      (orchestrator as any).invokeAgentHandler = originalHandler;
    });
  });

  describe('幂等性测试', () => {
    test('相同的幂等键应该返回相同结果', async () => {
      const idempotencyKey = 'orchestrator_idempotent_1';
      const request1: AgentInvokeRequest = {
        idempotency_key: idempotencyKey,
        trace_id: 'trace_orch_3',
        timeout: 10,
        agent_name: 'IdempotentTestAgent',
        payload: { value: 'first' },
      };

      const request2: AgentInvokeRequest = {
        idempotency_key: idempotencyKey,
        trace_id: 'trace_orch_4',
        timeout: 10,
        agent_name: 'IdempotentTestAgent',
        payload: { value: 'second' }, // 不同的payload
      };

      const response1 = await orchestrator.invokeAgent(request1);
      const response2 = await orchestrator.invokeAgent(request2);

      expect(response1.code).toBe(200);
      expect(response2.code).toBe(200);
      // 由于幂等性，第二次调用应该返回与第一次相同的结果
      expect(response2.data.timestamp).toBe(response1.data.timestamp);
    });
  });

  describe('配置管理测试', () => {
    test('应该能够更新可靠性配置', () => {
      const newConfig: Partial<ReliabilityConfig> = {
        maxRetries: 5,
        timeoutMs: 10000,
      };

      orchestrator.updateReliabilityConfig(newConfig);

      const reliabilityHandler = orchestrator.getReliabilityHandler();
      const currentConfig = reliabilityHandler.getConfig();

      expect(currentConfig.maxRetries).toBe(5);
      expect(currentConfig.timeoutMs).toBe(10000);
    });
  });

  describe('健康检查测试', () => {
    test('应该返回健康的健康检查状态', async () => {
      const health = await orchestrator.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('清理功能测试', () => {
    test('应该能够执行清理操作', async () => {
      // 先执行一些操作产生缓存数据
      const request: AgentInvokeRequest = {
        idempotency_key: 'cleanup_test_1',
        trace_id: 'trace_cleanup_1',
        timeout: 5,
        agent_name: 'CleanupTestAgent',
        payload: {},
      };

      await orchestrator.invokeAgent(request);

      // 执行清理
      await expect(orchestrator.cleanup()).resolves.not.toThrow();
    });
  });
});
