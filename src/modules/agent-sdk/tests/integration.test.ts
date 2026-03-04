/**
 * FixCycle Agent SDK 集成测试
 */

import { createAgent, validateConfig, formatAgentInfo } from '../src/index';

describe('FixCycle Agent SDK Integration Tests', () => {
  describe('Core Functionality', () => {
    test('should create agent successfully', async () => {
      const agent = await createAgent({
        name: 'Integration Test Agent',
        version: '1.0.0',
        description: '集成测试智能?,
        category: 'test',
      });

      expect(agent).toBeDefined();
      expect(typeof agent.process).toBe('function');
      expect(typeof agent.initialize).toBe('function');
      expect(typeof agent.destroy).toBe('function');
    });

    test('should validate configuration correctly', () => {
      // 测试有效配置
      const validConfig = {
        name: 'Test Agent',
        version: '1.0.0',
        description: 'A test agent for integration testing',
        category: 'test',
      };

      const validationResult = validateConfig(validConfig);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);

      // 测试无效配置
      const invalidConfig = {
        name: '', // 空名?        version: '1.0', // 版本格式不正?        description: 'Short', // 描述太短
        category: '', // 空分?      };

      const invalidResult = validateConfig(invalidConfig);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    test('should format agent information', () => {
      const agentInfo = {
        name: 'Test Agent',
        version: '1.0.0',
        description: 'Test description for formatting',
        category: 'test',
      };

      const formatted = formatAgentInfo(agentInfo);
      expect(formatted).toContain('Test Agent');
      expect(formatted).toContain('1.0.0');
      expect(formatted).toContain('test');
    });
  });

  describe('Agent Processing', () => {
    test('should process valid input', async () => {
      const agent = await createAgent({
        name: 'Processing Test Agent',
        version: '1.0.0',
        description: '处理测试智能?,
        category: 'test',
      });

      const input = {
        content: 'Hello, World!',
        metadata: { source: 'test' },
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.processed).toBe(true);
      expect(result.metadata.timestamp).toBeDefined();
    });

    test('should handle initialization and destruction', async () => {
      const agent = await createAgent({
        name: 'Lifecycle Test Agent',
        version: '1.0.0',
        description: '生命周期测试智能?,
        category: 'test',
      });

      // 测试初始?      await expect(agent.initialize()).resolves.not.toThrow();

      // 测试处理功能
      const result = await agent.process({ content: 'test' });
      expect(result).toBeDefined();

      // 测试销?      await expect(agent.destroy()).resolves.not.toThrow();
    });
  });

  describe('Plugin System Integration', () => {
    test('should create plugin manager', async () => {
      const { createPluginManager } = await import('../src/plugins');

      const pluginManager = await createPluginManager('./test-plugins');
      expect(pluginManager).toBeDefined();
      expect(typeof pluginManager.installPlugin).toBe('function');
      expect(typeof pluginManager.loadPlugin).toBe('function');
    });

    test('should create security scanner', async () => {
      const { createSecurityScanner } = await import('../src/plugins');

      const scanner = createSecurityScanner({
        maxFileSize: 1024 * 1024,
        timeout: 5000,
      });

      expect(scanner).toBeDefined();
      expect(typeof scanner.scanPlugin).toBe('function');
    });
  });

  describe('Template System Integration', () => {
    test('should create template market', async () => {
      const { createTemplateMarket } = await import('../src/templates');

      const market = await createTemplateMarket(
        'https://test.templates.com/api/v1'
      );
      expect(market).toBeDefined();
      expect(typeof market.uploadTemplate).toBe('function');
      expect(typeof market.searchTemplates).toBe('function');
    });

    test('should create template previewer', async () => {
      const { createTemplatePreviewer } = await import('../src/templates');

      const previewer = createTemplatePreviewer({
        width: 800,
        height: 600,
        theme: 'light',
      });

      expect(previewer).toBeDefined();
      expect(typeof previewer.generatePreview).toBe('function');
      expect(typeof previewer.assessQuality).toBe('function');
    });

    test('should validate template', async () => {
      const { validateTemplate } = await import('../src/templates');

      const templateData = {
        name: 'Test Template',
        description: 'A test template for validation',
        category: 'test',
        version: '1.0.0',
        author: 'Test Author',
        tags: ['test'],
        readme: '# Test Template\n\nThis is a test template',
        sourceCode: 'class TestTemplate {}',
        dependencies: [],
        license: 'MIT',
        price: 0,
      };

      const validationResult = validateTemplate(templateData);
      expect(validationResult.valid).toBe(true);
      expect(Array.isArray(validationResult.errors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid agent creation', async () => {
      await expect(
        createAgent({
          name: '', // 无效名称
          version: 'invalid-version', // 无效版本
          description: 'Too short', // 描述太短
          category: '', // 无效分类
        })
      ).rejects.toThrow();
    });

    test('should handle processing errors gracefully', async () => {
      const agent = await createAgent({
        name: 'Error Handling Test',
        version: '1.0.0',
        description: '错误处理测试',
        category: 'test',
      });

      // 测试无效输入
      await expect(agent.process({} as any)).rejects.toThrow();

      // 测试空内?      await expect(agent.process({ content: '' })).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent processing', async () => {
      const agent = await createAgent({
        name: 'Concurrent Test Agent',
        version: '1.0.0',
        description: '并发处理测试',
        category: 'test',
      });

      const inputs = Array.from({ length: 5 }, (_, i) => ({
        content: `Test input ${i + 1}`,
        metadata: { id: i + 1 },
      }));

      // 并发处理多个请求
      const startTime = Date.now();
      const promises = inputs.map(input => agent.process(input));
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(5000); // 应该?秒内完成

      results.forEach((result, index) => {
        expect(result.metadata.id).toBe(index + 1);
      });
    });

    test('should maintain reasonable response times', async () => {
      const agent = await createAgent({
        name: 'Performance Test Agent',
        version: '1.0.0',
        description: '性能测试智能?,
        category: 'test',
      });

      const input = { content: 'Performance test input' };

      // 多次执行测试平均性能
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await agent.process(input);
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1000); // 平均响应时间应小?�?    });
  });
});
