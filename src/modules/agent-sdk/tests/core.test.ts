/**
 * FixCycle Agent SDK 核心功能单元测试
 */

import {
  BaseAgent,
  Agent,
  ValidateInput,
  FormatOutput,
} from '../src/core/base-agent';
import { validateConfig, formatAgentInfo } from '../src/utils/validation';
import {
  TestDataFactory,
  TestUtils,
  TestAssertions,
  TestLifecycle,
} from './test-utils';

// 模拟测试智能?@Agent({
  name: 'Test Agent',
  version: '1.0.0',
  description: '测试智能?,
  category: 'test',
})
class TestAgent extends BaseAgent {
  protected async onProcess(input: any): Promise<any> {
    return { result: 'success', input };
  }
}

describe('FixCycle Agent SDK Core Tests', () => {
  beforeAll(() => {
    TestLifecycle.beforeAll();
  });

  beforeEach(() => {
    TestLifecycle.beforeEach();
  });

  afterEach(() => {
    TestLifecycle.afterEach();
  });

  afterAll(() => {
    TestLifecycle.afterAll();
  });

  describe('BaseAgent Class', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent();
    });

    test('should create agent instance successfully', () => {
      expect(agent).toBeInstanceOf(BaseAgent);
      expect(agent).toBeInstanceOf(TestAgent);
    });

    test('should have correct initial state', () => {
      expect(agent.getState()).toBe('idle');
    });

    test('should process input correctly', async () => {
      const input = { content: 'test input' };
      const result = await agent.process(input);

      expect(result).toEqual({
        result: 'success',
        input: { content: 'test input' },
      });
      expect(agent.getState()).toBe('idle');
    });

    test('should handle processing errors', async () => {
      // 创建一个会抛出错误的代?      @Agent({
        name: 'Error Agent',
        version: '1.0.0',
        description: '错误测试智能?,
        category: 'test',
      })
      class ErrorAgent extends BaseAgent {
        protected async onProcess(input: any): Promise<any> {
          throw new Error('Test error');
        }
      }

      const errorAgent = new ErrorAgent();
      await expect(errorAgent.process({})).rejects.toThrow('Test error');
      expect(errorAgent.getState()).toBe('error');
    });

    test('should validate input with decorator', async () => {
      @Agent({
        name: 'Validated Agent',
        version: '1.0.0',
        description: '验证测试智能?,
        category: 'test',
      })
      class ValidatedAgent extends BaseAgent {
        @ValidateInput(input => input.requiredField !== undefined)
        protected async onProcess(input: any): Promise<any> {
          return { validated: true };
        }
      }

      const validatedAgent = new ValidatedAgent();

      // 测试有效输入
      await expect(
        validatedAgent.process({ requiredField: 'value' })
      ).resolves.toEqual({ validated: true });

      // 测试无效输入
      await expect(validatedAgent.process({})).rejects.toThrow(
        'Input validation failed'
      );
    });

    test('should format output with decorator', async () => {
      @Agent({
        name: 'Formatted Agent',
        version: '1.0.0',
        description: '格式化测试智能体',
        category: 'test',
      })
      class FormattedAgent extends BaseAgent {
        @FormatOutput(output => ({ ...output, timestamp: Date.now() }))
        protected async onProcess(input: any): Promise<any> {
          return { data: 'test' };
        }
      }

      const formattedAgent = new FormattedAgent();
      const result = await formattedAgent.process({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
    });

    test('should handle lifecycle events', async () => {
      const initializeSpy = jest.spyOn(agent as any, 'initialize');
      const destroySpy = jest.spyOn(agent as any, 'destroy');

      await agent.initialize();
      expect(initializeSpy).toHaveBeenCalled();
      expect(agent.getState()).toBe('ready');

      await agent.destroy();
      expect(destroySpy).toHaveBeenCalled();
      expect(agent.getState()).toBe('destroyed');
    });

    test('should emit events', async () => {
      const eventSpy = jest.fn();
      agent.on('processing', eventSpy);

      await agent.process({ test: 'data' });

      expect(eventSpy).toHaveBeenCalledWith({ test: 'data' });
    });

    test('should get health status', async () => {
      const health = await agent.getHealthStatus();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('lastCheck');
      expect(health).toHaveProperty('details');
      expect(health.status).toBe('healthy');
    });
  });

  describe('Validation Utilities', () => {
    test('should validate agent configuration', () => {
      const validConfig = {
        name: 'Test Agent',
        version: '1.0.0',
        description: 'Test description',
        category: 'test',
      };

      const result = validateConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid configuration', () => {
      const invalidConfig = {
        name: '', // 空名?        version: 'invalid', // 无效版本
        description: 'Test', // 描述太短
        category: '', // 空分?      };

      const result = validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    test('should format agent information', () => {
      const agentInfo = {
        name: 'Test Agent',
        version: '1.0.0',
        description: 'Test description',
        category: 'test',
      };

      const formatted = formatAgentInfo(agentInfo);
      expect(formatted).toContain('Test Agent');
      expect(formatted).toContain('1.0.0');
      expect(formatted).toContain('test');
    });
  });

  describe('Decorators', () => {
    test('should apply Agent decorator correctly', () => {
      @Agent({
        name: 'Decorator Test',
        version: '1.0.0',
        description: '装饰器测?,
        category: 'test',
      })
      class DecoratorTestAgent extends BaseAgent {
        protected async onProcess(input: any): Promise<any> {
          return { decorated: true };
        }
      }

      const agent = new DecoratorTestAgent();
      expect(agent).toBeInstanceOf(BaseAgent);
    });

    test('should chain multiple decorators', async () => {
      @Agent({
        name: 'Chained Agent',
        version: '1.0.0',
        description: '链式装饰器测?,
        category: 'test',
      })
      class ChainedAgent extends BaseAgent {
        @ValidateInput(input => input.value > 0)
        @FormatOutput(output => ({ ...output, processed: true }))
        protected async onProcess(input: any): Promise<any> {
          return { result: input.value * 2 };
        }
      }

      const agent = new ChainedAgent();

      // 测试有效的链式处?      const result = await agent.process({ value: 5 });
      expect(result).toEqual({
        result: 10,
        processed: true,
      });

      // 测试验证失败
      await expect(agent.process({ value: -1 })).rejects.toThrow(
        'Input validation failed'
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle timeout errors', async () => {
      @Agent({
        name: 'Timeout Agent',
        version: '1.0.0',
        description: '超时测试智能?,
        category: 'test',
      })
      class TimeoutAgent extends BaseAgent {
        protected async onProcess(input: any): Promise<any> {
          // 模拟长时间运?          await TestUtils.delay(100);
          return { slow: true };
        }
      }

      const timeoutAgent = new TimeoutAgent();
      await timeoutAgent.initialize();

      // 设置较短的超时时间进行测?      const originalTimeout = (timeoutAgent as any).config.timeout;
      (timeoutAgent as any).config.timeout = 50;

      await expect(timeoutAgent.process({})).rejects.toThrow(
        'Processing timeout'
      );

      (timeoutAgent as any).config.timeout = originalTimeout;
    });

    test('should handle concurrent processing', async () => {
      const agent = new TestAgent();
      const inputs = [{ id: 1 }, { id: 2 }, { id: 3 }];

      // 并发处理多个请求
      const promises = inputs.map(input => agent.process(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.input.id).toBe(inputs[index].id);
      });
    });
  });

  describe('Configuration Management', () => {
    test('should merge default and custom configuration', () => {
      @Agent({
        name: 'Configurable Agent',
        version: '1.0.0',
        description: '可配置智能体',
        category: 'test',
      })
      class ConfigurableAgent extends BaseAgent {
        protected async onProcess(input: any): Promise<any> {
          return { config: (this as any).config };
        }
      }

      const customConfig = { customOption: 'value' };
      const agent = new ConfigurableAgent(customConfig);

      expect((agent as any).config).toMatchObject({
        timeout: 30000,
        retries: 3,
        customOption: 'value',
      });
    });

    test('should validate configuration on initialization', async () => {
      @Agent({
        name: 'Strict Agent',
        version: '1.0.0',
        description: '严格配置智能?,
        category: 'test',
      })
      class StrictAgent extends BaseAgent {
        protected async initialize(): Promise<void> {
          // 自定义初始化逻辑
          if (!(this as any).config.requiredSetting) {
            throw new Error('Missing required setting');
          }
          await super.initialize();
        }

        protected async onProcess(input: any): Promise<any> {
          return { initialized: true };
        }
      }

      // 测试缺少必需配置
      const agentWithoutConfig = new StrictAgent({});
      await expect(agentWithoutConfig.initialize()).rejects.toThrow(
        'Missing required setting'
      );

      // 测试正确配置
      const agentWithConfig = new StrictAgent({ requiredSetting: 'value' });
      await expect(agentWithConfig.initialize()).resolves.not.toThrow();
    });
  });
});
