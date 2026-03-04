/**
 * SDK功能手动测试脚本
 */

import { BaseAgent, Agent, createAgent, destroyAgent } from './src/index';
import { AgentInput, AgentOutput, AgentConfig, AgentInfo } from './src/types';

// 简单测试智能体（不使用装饰器）
class SimpleTestAgent extends BaseAgent {
  private processCount: number = 0;

  constructor(config: AgentConfig) {
    const info: AgentInfo = {
      id: 'simple-test-agent',
      name: 'Simple Test Agent',
      description: '用于测试的简单智能体',
      version: '1.0.0',
      category: 'test',
      tags: ['test'],
      author: 'test-developer',
    };

    super(info, config);
  }

  protected async onInitialize(): Promise<void> {
    this.processCount = 0;
    this.logDebug('SimpleTestAgent initialized');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    this.processCount++;
    this.logDebug(`Processing input: ${input.content}`);

    return {
      content: `Echo: ${input.content}`,
      tokensUsed: input.content.length,
      metadata: {
        processCount: this.processCount,
        test: true,
        processedAt: new Date().toISOString(),
      },
    };
  }

  protected async onDestroy(): Promise<void> {
    this.processCount = 0;
    this.logDebug('SimpleTestAgent destroyed');
  }

  public getProcessCount(): number {
    return this.processCount;
  }
}

async function runTests() {
  console.log('🧪 开始SDK功能测试...\n');

  try {
    // 测试1: 基本创建和配?    console.log('1. 测试智能体创建和配置验证...');
    const agent = new SimpleTestAgent({
      apiKey: 'test-api-key-12345678901234567890123456789012',
      debug: true,
      timeout: 30000,
    });

    console.log('�?智能体创建成?);
    console.log('📝 智能体信?', agent.getInfo());
    console.log('⚙️  配置信息:', agent.getConfig());

    // 测试2: 生命周期管理
    console.log('\n2. 测试生命周期管理...');

    console.log('🔄 初始化智能体...');
    await agent.initialize();
    console.log('�?初始化完?);
    console.log('📊 初始化状?', {
      isInitialized: agent.isInitialized(),
      isDestroyed: agent.isDestroyed(),
    });

    // 测试3: 处理功能
    console.log('\n3. 测试处理功能...');

    const testInput: AgentInput = {
      content: 'Hello, FixCycle Agent SDK!',
      metadata: { test: true, timestamp: Date.now() },
    };

    console.log('📤 发送测试输?', testInput.content);
    const result = await agent.process(testInput);
    console.log('📥 收到处理结果:', result.content);
    console.log('📊 处理统计:', {
      tokensUsed: result.tokensUsed,
      processingTime: result.processingTime,
      processCount: agent.getProcessCount(),
    });

    // 测试4: 多次处理
    console.log('\n4. 测试多次处理...');
    for (let i = 1; i <= 3; i++) {
      const input: AgentInput = {
        content: `测试消息 ${i}`,
        metadata: { iteration: i },
      };

      const result = await agent.process(input);
      console.log(`  �?{i}次处? ${result.content}`);
    }

    console.log('📊 最终处理计?', agent.getProcessCount());

    // 测试5: 健康检?    console.log('\n5. 测试健康检?..');
    const health = await agent.getHealthStatus();
    console.log('❤️  健康状?', health);

    // 测试6: 销?    console.log('\n6. 测试销毁功?..');
    await agent.destroy();
    console.log('�?销毁完?);
    console.log('📊 销毁后状?', {
      isInitialized: agent.isInitialized(),
      isDestroyed: agent.isDestroyed(),
    });

    // 测试7: 便捷函数
    console.log('\n7. 测试便捷函数...');
    const agent2 = await createAgent(SimpleTestAgent, {
      apiKey: 'test-api-key-12345678901234567890123456789012',
    });
    console.log('�?createAgent函数工作正常');

    await destroyAgent(agent2);
    console.log('�?destroyAgent函数工作正常');

    // 测试8: 错误处理
    console.log('\n8. 测试错误处理...');

    // 测试未初始化处理
    try {
      const uninitializedAgent = new SimpleTestAgent({
        apiKey: 'test-api-key-12345678901234567890123456789012',
      });
      await uninitializedAgent.process({ content: 'test' });
      console.log('�?未初始化处理应该抛出错误');
    } catch (error) {
      console.log('�?未初始化处理正确抛出错误:', (error as Error).message);
    }

    // 测试配置验证
    try {
      new SimpleTestAgent({ apiKey: 'short' });
      console.log('�?无效API密钥应该抛出错误');
    } catch (error) {
      console.log('�?配置验证正确工作:', (error as Error).message);
    }

    console.log('\n🎉 所有测试通过！SDK核心功能正常工作?);
  } catch (error) {
    console.error('\n�?测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(console.error);
