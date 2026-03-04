const { BaseAgent } = require('./dist/index.js');

// 简单测试智能体实现
class SimpleTestAgent extends BaseAgent {
  constructor(config) {
    const info = {
      id: 'simple-test-agent',
      name: 'Simple Test Agent',
      description: '用于测试的简单智能体',
      version: '1.0.0',
      category: 'test',
      tags: ['test'],
      author: 'test-developer',
    };

    super(info, config);
    this.processCount = 0;
  }

  async onInitialize() {
    this.processCount = 0;
    console.log('SimpleTestAgent initialized');
  }

  async onProcess(input) {
    this.processCount++;
    console.log(`Processing input: ${input.content}`);

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

  async onDestroy() {
    this.processCount = 0;
    console.log('SimpleTestAgent destroyed');
  }

  getProcessCount() {
    return this.processCount;
  }
}

async function runTests() {
  console.log('🧪 开始SDK功能测试...\n');

  try {
    // 测试1: 基本创建和配置
    console.log('1. 测试智能体创建和配置验证...');
    const agent = new SimpleTestAgent({
      apiKey: 'test-api-key-12345678901234567890123456789012',
      debug: true,
      timeout: 30000,
    });

    console.log('✅ 智能体创建成功');
    console.log('📝 智能体信息:', agent.getInfo());
    console.log('⚙️  配置信息:', agent.getConfig());

    // 测试2: 生命周期管理
    console.log('\n2. 测试生命周期管理...');

    console.log('🔄 初始化智能体...');
    await agent.initialize();
    console.log('✅ 初始化完成');
    console.log('📊 初始化状态:', {
      isInitialized: agent.isInitialized(),
      isDestroyed: agent.isDestroyed(),
    });

    // 测试3: 处理功能
    console.log('\n3. 测试处理功能...');

    const testInput = {
      content: 'Hello, FixCycle Agent SDK!',
      metadata: { test: true, timestamp: Date.now() },
    };

    console.log('📤 发送测试输入:', testInput.content);
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
      const input = {
        content: `测试消息 ${i}`,
        metadata: { iteration: i },
      };

      const result = await agent.process(input);
      console.log(`  第${i}次处理: ${result.content}`);
    }

    console.log('📊 最终处理计数:', agent.getProcessCount());

    // 测试5: 健康检查
    console.log('\n5. 测试健康检查...');
    const health = await agent.getHealthStatus();
    console.log('❤️  健康状态:', health);

    // 测试6: 销毁
    console.log('\n6. 测试销毁功能...');
    await agent.destroy();
    console.log('✅ 销毁完成');
    console.log('📊 销毁后状态:', {
      isInitialized: agent.isInitialized(),
      isDestroyed: agent.isDestroyed(),
    });

    console.log('\n🎉 所有测试通过！SDK核心功能正常工作。');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(console.error);
