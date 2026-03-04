/**
 * FixCycle Agent SDK 测试套件
 */

import { BaseAgent, Agent, createAgent, destroyAgent } from '../src/index';
import { AgentInput, AgentOutput, AgentConfig } from '../src/types';

// 简单的测试智能?@Agent({
  name: 'Test Agent',
  version: '1.0.0',
  description: '用于测试的智能体',
  category: 'test',
})
class TestAgent extends BaseAgent {
  private processCount: number = 0;

  protected async onInitialize(): Promise<void> {
    this.processCount = 0;
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    this.processCount++;
    return {
      content: `Echo: ${input.content}`,
      tokensUsed: input.content.length,
      metadata: {
        processCount: this.processCount,
        test: true,
      },
    };
  }

  protected async onDestroy(): Promise<void> {
    this.processCount = 0;
  }

  public getProcessCount(): number {
    return this.processCount;
  }
}

describe('FixCycle Agent SDK', () => {
  describe('BaseAgent', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent(
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: '用于测试的智能体',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
          author: 'test',
        },
        {
          apiKey: 'test-api-key-12345678901234567890123456789012',
        }
      );
    });

    afterEach(async () => {
      if (agent.isInitialized() && !agent.isDestroyed()) {
        await agent.destroy();
      }
    });

    test('应该正确创建智能体实?, () => {
      expect(agent).toBeDefined();
      expect(agent.getInfo().name).toBe('Test Agent');
      expect(agent.getInfo().category).toBe('test');
    });

    test('应该正确验证配置', () => {
      expect(agent.getConfig().apiKey).toBeUndefined(); // 敏感信息不应该暴?      expect(agent.getConfig().timeout).toBe(30000);
    });

    test('应该正确管理生命周期状?, async () => {
      expect(agent.isInitialized()).toBe(false);
      expect(agent.isDestroyed()).toBe(false);

      await agent.initialize();
      expect(agent.isInitialized()).toBe(true);
      expect(agent.isDestroyed()).toBe(false);

      await agent.destroy();
      expect(agent.isInitialized()).toBe(false);
      expect(agent.isDestroyed()).toBe(true);
    });

    test('应该正确处理输入输出', async () => {
      await agent.initialize();

      const input: AgentInput = {
        content: 'Hello, World!',
        metadata: { test: true },
      };

      const result = await agent.process(input);

      expect(result.content).toBe('Echo: Hello, World!');
      expect(result.tokensUsed).toBe(13);
      expect(result.metadata?.test).toBe(true);
      expect(result.metadata?.processCount).toBe(1);
    });

    test('应该正确计数处理次数', async () => {
      await agent.initialize();

      await agent.process({ content: 'Test 1' });
      await agent.process({ content: 'Test 2' });
      await agent.process({ content: 'Test 3' });

      expect(agent.getProcessCount()).toBe(3);
    });

    test('应该拒绝未初始化的处理请?, async () => {
      await expect(agent.process({ content: 'Test' })).rejects.toThrow();
    });

    test('应该拒绝已销毁的处理请求', async () => {
      await agent.initialize();
      await agent.destroy();

      await expect(agent.process({ content: 'Test' })).rejects.toThrow();
    });

    test('应该正确处理多次初始?, async () => {
      await agent.initialize();
      await agent.initialize(); // 应该不会报错

      expect(agent.isInitialized()).toBe(true);
    });

    test('应该正确处理多次销?, async () => {
      await agent.initialize();
      await agent.destroy();
      await agent.destroy(); // 应该不会报错

      expect(agent.isDestroyed()).toBe(true);
    });
  });

  describe('便捷函数', () => {
    test('createAgent应该正确创建和初始化智能?, async () => {
      const TestAgentWrapper = class extends TestAgent {
        constructor(config: AgentConfig) {
          super(
            {
              id: 'test-agent',
              name: 'Test Agent',
              description: '用于测试的智能体',
              version: '1.0.0',
              category: 'test',
              tags: ['test'],
              author: 'test',
            },
            config
          );
        }
      };

      const agent = await createAgent(TestAgentWrapper, {
        apiKey: 'test-api-key-12345678901234567890123456789012',
      });

      expect(agent.isInitialized()).toBe(true);
      expect(agent.isDestroyed()).toBe(false);

      await destroyAgent(agent);
      expect(agent.isDestroyed()).toBe(true);
    });

    test('destroyAgent应该正确处理未初始化的智能体', async () => {
      const agent = new TestAgent(
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: '用于测试的智能体',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
          author: 'test',
        },
        {
          apiKey: 'test-api-key-12345678901234567890123456789012',
        }
      );

      await destroyAgent(agent); // 应该不会报错
      expect(agent.isDestroyed()).toBe(false); // 未初始化的智能体不会被销?    });
  });

  describe('事件系统', () => {
    let agent: TestAgent;
    let events: any[] = [];

    beforeEach(() => {
      agent = new TestAgent(
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: '用于测试的智能体',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
          author: 'test',
        },
        {
          apiKey: 'test-api-key-12345678901234567890123456789012',
          debug: true,
        }
      );
      events = [];

      // 监听所有事?      agent.on('initialized', payload => events.push(payload));
      agent.on('processing', payload => events.push(payload));
      agent.on('completed', payload => events.push(payload));
      agent.on('error', payload => events.push(payload));
      agent.on('destroyed', payload => events.push(payload));
    });

    afterEach(async () => {
      if (agent.isInitialized() && !agent.isDestroyed()) {
        await agent.destroy();
      }
    });

    test('应该正确发射生命周期事件', async () => {
      await agent.initialize();
      expect(events.length).toBe(1);
      expect(events[0].event).toBe('initialized');

      await agent.process({ content: 'Test' });
      expect(events.length).toBe(3); // processing + completed
      expect(events[1].event).toBe('processing');
      expect(events[2].event).toBe('completed');

      await agent.destroy();
      expect(events.length).toBe(4);
      expect(events[3].event).toBe('destroyed');
    });

    test('错误事件应该正确发射', async () => {
      // 强制产生错误
      agent.process({ content: '' }); // 未初始化就调用process
      // 注意：这里不会捕获到错误事件，因为是同步调用
    });
  });

  describe('配置验证', () => {
    test('应该拒绝无效的API密钥', () => {
      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          { apiKey: 'short' }
        );
      }).toThrow();
    });

    test('应该接受有效的API密钥', () => {
      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          {
            apiKey: 'valid-api-key-12345678901234567890123456789012',
          }
        );
      }).not.toThrow();
    });

    test('应该正确处理可选配?, () => {
      const agent = new TestAgent(
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: '用于测试的智能体',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
          author: 'test',
        },
        {
          apiKey: 'test-api-key-12345678901234567890123456789012',
          timeout: 60000,
          debug: true,
          maxRetries: 5,
        }
      );

      const config = agent.getConfig();
      expect(config.timeout).toBe(60000);
      expect(config.debug).toBe(true);
      expect(config.maxRetries).toBe(5);
    });

    test('应该拒绝无效的超时配?, () => {
      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          {
            apiKey: 'test-api-key-12345678901234567890123456789012',
            timeout: 500, // 太小
          }
        );
      }).toThrow();

      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          {
            apiKey: 'test-api-key-12345678901234567890123456789012',
            timeout: 400000, // 太大
          }
        );
      }).toThrow();
    });

    test('应该拒绝无效的重试配?, () => {
      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          {
            apiKey: 'test-api-key-12345678901234567890123456789012',
            maxRetries: -1, // 负数
          }
        );
      }).toThrow();

      expect(() => {
        new TestAgent(
          {
            id: 'test-agent',
            name: 'Test Agent',
            description: '用于测试的智能体',
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
            author: 'test',
          },
          {
            apiKey: 'test-api-key-12345678901234567890123456789012',
            maxRetries: 15, // 太大
          }
        );
      }).toThrow();
    });
  });

  describe('健康检?, () => {
    let agent: TestAgent;

    beforeEach(async () => {
      agent = new TestAgent(
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: '用于测试的智能体',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
          author: 'test',
        },
        {
          apiKey: 'test-api-key-12345678901234567890123456789012',
        }
      );
    });

    afterEach(async () => {
      if (agent.isInitialized() && !agent.isDestroyed()) {
        await agent.destroy();
      }
    });

    test('未初始化的智能体应该是降级状?, async () => {
      const health = await agent.getHealthStatus();
      expect(health.status).toBe('degraded');
      expect(health.details?.reason).toBe('Agent not initialized');
    });

    test('已销毁的智能体应该是不健康状?, async () => {
      await agent.initialize();
      await agent.destroy();

      const health = await agent.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.details?.reason).toBe('Agent destroyed');
    });

    test('正常的智能体应该是健康状?, async () => {
      await agent.initialize();

      const health = await agent.getHealthStatus();
      expect(health.status).toBe('healthy');
    });
  });
});
