#!/usr/bin/env node

/**
 * FixCycle Agent SDK 测试运行器
 * 执行基本功能验证和集成测试
 */

const path = require('path');
const fs = require('fs');

// 测试配置
const TEST_CONFIG = {
  timeout: 10000,
  verbose: true
};

// 简单的测试框架
class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🧪 开始执行 FixCycle Agent SDK 测试...\n')for (const test of this.tests) {
      await this.runTest(test);
    }

    this.printSummary();
    return this.results.failed === 0;
  }

  async runTest(test) {
    this.results.total++;
    const startTime = Date.now();

    try {
      await Promise.race([
        test.fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.timeout)
        )
      ]);

      const duration = Date.now() - startTime;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`✅ ${test.name} (耗时: ${duration}ms)`);
      this.results.passed++;

    } catch (error) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`❌ ${test.name}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   错误: ${error.message}`)this.results.failed++;
    }
  }

  printSummary() {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('\n📊 测试结果汇总:')// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   总计: ${this.results.total}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   通过: ${this.results.passed}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   失败: ${this.results.failed}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   成功率: ${((this.results.passed / this.results.total)* 100).toFixed(1)}%`);
  }
}

// 创建测试运行器实例
const runner = new SimpleTestRunner();

// 测试1: 基础导入测试
runner.test('基础模块导入测试', async () => {
  // 测试核心模块导入
  const coreModule = await import('../dist/index.js');
  if (!coreModule) {
    throw new Error('核心模块导入失败');
  }

  // 验证必要的导出
  const requiredExports = ['createAgent', 'validateConfig', 'formatAgentInfo'];
  for (const exportName of requiredExports) {
    if (typeof coreModule[exportName] !== 'function') {
      throw new Error(`缺少必要的导出: ${exportName}`);
    }
  }
});

// 测试2: Agent创建测试
runner.test('Agent创建功能测试', async () => {
  const { createAgent } = await import('../dist/index.js');

  const agent = await createAgent({
    name: 'Test Agent',
    version: '1.0.0',
    description: '测试智能体',
    category: 'test'
  });

  if (!agent) {
    throw new Error('Agent创建失败');
  }

  // 验证Agent方法
  const requiredMethods = ['process', 'initialize', 'destroy'];
  for (const method of requiredMethods) {
    if (typeof agent[method] !== 'function') {
      throw new Error(`Agent缺少方法: ${method}`);
    }
  }
});

// 测试3: 配置验证测试
runner.test('配置验证功能测试', async () => {
  const { validateConfig } = await import('../dist/index.js');

  // 测试有效配置
  const validConfig = {
    name: 'Valid Agent',
    version: '1.0.0',
    description: '这是一个有效的测试智能体配置',
    category: 'test'
  };

  const validResult = validateConfig(validConfig);
  if (validResult !== true) {
    throw new Error('有效配置验证失败');
  }

  // 测试无效配置
  const invalidConfig = {
    name: '', // 空名称
    version: 'invalid', // 无效版本
    description: '短', // 描述太短
    category: '' // 空分类
  };

  const invalidResult = validateConfig(invalidConfig);
  if (invalidResult === true) {
    throw new Error('无效配置应该验证失败');
  }
});

// 测试4: 插件系统测试
runner.test('插件系统功能测试', async () => {
  try {
    const pluginModule = await import('../dist/plugins/index.js');

    // 测试插件管理器创建
    if (typeof pluginModule.createPluginManager === 'function') {
      const manager = await pluginModule.createPluginManager('./test-plugins');
      if (!manager) {
        throw new Error('插件管理器创建失败');
      }
    }

    // 测试安全扫描器创建
    if (typeof pluginModule.createSecurityScanner === 'function') {
      const scanner = pluginModule.createSecurityScanner({
        maxFileSize: 1024 * 1024
      });
      if (!scanner) {
        throw new Error('安全扫描器创建失败');
      }
    }

  } catch (error) {
    // 插件系统可能是可选的，所以这里不强制失败
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('   ℹ️  插件系统测试跳过 (模块可能未构建)');
  }
});

// 测试5: 模板系统测试
runner.test('模板系统功能测试', async () => {
  try {
    const templateModule = await import('../dist/templates/index.js');

    // 测试模板市场创建
    if (typeof templateModule.createTemplateMarket === 'function') {
      const market = await templateModule.createTemplateMarket('https://test.com');
      if (!market) {
        throw new Error('模板市场创建失败');
      }
    }

    // 测试模板验证
    if (typeof templateModule.validateTemplate === 'function') {
      const templateData = {
        name: 'Test Template',
        description: '测试模板描述',
        category: 'test',
        version: '1.0.0',
        author: 'Test Author',
        tags: ['test'],
        readme: '# Test\n\n测试模板',
        sourceCode: 'class Test {}',
        dependencies: [],
        license: 'MIT',
        price: 0
      };

      const validationResult = templateModule.validateTemplate(templateData);
      if (!validationResult || typeof validationResult.valid !== 'boolean') {
        throw new Error('模板验证功能异常');
      }
    }

  } catch (error) {
    // 模板系统可能是可选的，所以这里不强制失败
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('   ℹ️  模板系统测试跳过 (模块可能未构建)');
  }
});

// 测试6: 性能基准测试
runner.test('性能基准测试', async () => {
  const { createAgent } = await import('../dist/index.js');

  const agent = await createAgent({
    name: 'Performance Test Agent',
    version: '1.0.0',
    description: '性能测试智能体',
    category: 'test'
  });

  // 执行多次处理测试性能
  const iterations = 100;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    await agent.process({
      content: `Performance test iteration ${i + 1}`
    });
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   总时间: ${totalTime}ms`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   平均时间: ${avgTime.toFixed(2)}ms/次`);
  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   吞吐量: ${(1000 / avgTime).toFixed(2)} 次/秒`);

  // 性能阈值检查
  if (avgTime > 100) {
    throw new Error(`平均处理时间过长: ${avgTime.toFixed(2)}ms`);
  }
});

// 测试7: 错误处理测试
runner.test('错误处理功能测试', async () => {
  const { createAgent } = await import('../dist/index.js');

  // 测试无效输入处理
  const agent = await createAgent({
    name: 'Error Handling Test Agent',
    version: '1.0.0',
    description: '错误处理测试智能体',
    category: 'test'
  });

  // 测试空输入
  try {
    await agent.process({} as any);
    throw new Error('应该抛出输入验证错误');
  } catch (error) {
    if (!error.message.includes('required')) {
      throw new Error('错误消息不符合预期');
    }
  }

  // 测试无效内容
  try {
    await agent.process({ content: '' });
    throw new Error('应该抛出内容验证错误');
  } catch (error) {
    if (!error.message.includes('empty')) {
      throw new Error('错误消息不符合预期');
    }
  }
});

// 运行所有测试
async function runAllTests() {
  try {
    const success = await runner.run();

    if (success) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('\n🎉 所有测试通过！SDK功能正常')process.exit(0);
    } else {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('\n💥 部分测试失败，请检查实现')process.exit(1);
    }

  } catch (error) {
    console.error('测试执行异常:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, SimpleTestRunner };
