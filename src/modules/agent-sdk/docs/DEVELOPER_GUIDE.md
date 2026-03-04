# FixCycle Agent SDK 开发者指南

## 🎯 快速入门

### 环境要求

- Node.js 18+
- TypeScript 5.0+
- npm 或 yarn 包管理器

### 安装SDK

```bash
npm install @fixcycle/agent-sdk
```

### 创建第一个智能体

```typescript
import { BaseAgent, Agent } from '@fixcycle/agent-sdk';
import {
  AgentInput,
  AgentOutput,
  AgentConfig,
} from '@fixcycle/agent-sdk/types';

@Agent({
  name: 'Hello World Agent',
  version: '1.0.0',
  description: '最简单的智能体示例',
  category: 'demo',
})
export class HelloWorldAgent extends BaseAgent {
  protected async onInitialize(): Promise<void> {
    console.log('智能体初始化完成');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    return {
      content: `你好！你发送的消息是: ${input.content}`,
      metadata: {
        processed: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  protected async onDestroy(): Promise<void> {
    console.log('智能体清理完成');
  }
}

// 使用示例
async function main() {
  const agent = new HelloWorldAgent({
    apiKey: 'your-api-key-here',
    debug: true,
  });

  try {
    await agent.initialize();

    const result = await agent.process({
      content: 'Hello, FixCycle!',
    });

    console.log('响应:', result.content);
  } finally {
    await agent.destroy();
  }
}

main();
```

## 🏗️ 项目结构最佳实践

### 推荐的项目结构

```
my-agent/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── agents/               # 智能体实现
│   │   ├── base-agent.ts     # 基础智能体
│   │   └── business-agents/  # 业务智能体
│   ├── utils/                # 工具函数
│   ├── types/                # 类型定义
│   └── constants/            # 常量定义
├── tests/
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── fixtures/             # 测试数据
├── docs/                     # 文档
├── examples/                 # 示例代码
├── package.json
├── tsconfig.json
└── README.md
```

### package.json 配置

```json
{
  "name": "my-fixcycle-agent",
  "version": "1.0.0",
  "description": "我的FixCycle智能体",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "docs": "typedoc src/index.ts --out docs/api"
  },
  "dependencies": {
    "@fixcycle/agent-sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

## 🔧 高级功能

### 1. 使用装饰器增强功能

```typescript
import {
  BaseAgent,
  Agent,
  ValidateInput,
  FormatOutput,
  Cache,
  MonitorPerformance,
  HandleError,
} from '@fixcycle/agent-sdk';

@Agent({
  name: 'Advanced Agent',
  version: '1.0.0',
  description: '具备高级功能的智能体',
  category: 'advanced',
})
export class AdvancedAgent extends BaseAgent {
  @ValidateInput(input => {
    if (!input.content?.trim()) {
      return '内容不能为空';
    }
    if (input.content.length > 2000) {
      return '内容长度不能超过2000字符';
    }
    return true;
  })
  @FormatOutput(output => ({
    ...output,
    content: output.content.trim(),
    metadata: {
      ...output.metadata,
      processedAt: new Date().toISOString(),
      agentVersion: '1.0.0',
    },
  }))
  @Cache(300000) // 5分钟缓存
  @MonitorPerformance()
  @HandleError(error => {
    console.error('处理错误:', error);
    return {
      content: '抱歉，处理过程中出现错误',
      metadata: {
        error: error.message,
        recovery: true,
      },
    };
  })
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 复杂的业务逻辑
    const result = await this.complexBusinessLogic(input);

    return {
      content: result.response,
      tokensUsed: result.tokens,
      metadata: {
        confidence: result.confidence,
        model: result.model,
      },
    };
  }

  private async complexBusinessLogic(input: AgentInput) {
    // 实现具体的业务逻辑
    return {
      response: `处理结果: ${input.content}`,
      tokens: Math.ceil(input.content.length / 4),
      confidence: 0.95,
      model: 'gpt-4',
    };
  }
}
```

### 2. 自定义配置验证

```typescript
export class CustomAgent extends BaseAgent {
  validateConfig(config: any): boolean {
    // 自定义配置验证逻辑
    if (!config.customField) {
      throw new Error('缺少必需的customField配置');
    }

    if (config.timeout && config.timeout < 5000) {
      throw new Error('timeout不能小于5000ms');
    }

    return true;
  }

  protected async onInitialize(): Promise<void> {
    // 验证通过后的初始化逻辑
  }
}
```

### 3. 健康检查实现

```typescript
export class HealthCheckAgent extends BaseAgent {
  protected async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }> {
    try {
      // 检查外部依赖
      await this.checkExternalServices();

      // 检查资源使用情况
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 100 * 1024 * 1024) {
        // 100MB
        return {
          status: 'degraded',
          details: {
            reason: '高内存使用',
            memory: memoryUsage,
          },
        };
      }

      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          reason: '依赖服务不可用',
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async checkExternalServices() {
    // 实现外部服务检查逻辑
  }
}
```

### 4. 事件驱动编程

```typescript
export class EventDrivenAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(getAgentInfo(), config);

    // 监听自身事件
    this.on('processing', payload => {
      this.logProcessingStart(payload.data.input);
    });

    this.on('completed', payload => {
      this.logProcessingComplete(payload.data);
    });

    this.on('error', payload => {
      this.handleProcessingError(payload.error);
    });
  }

  private logProcessingStart(input: AgentInput) {
    console.log(`开始处理: ${input.content.substring(0, 50)}...`);
  }

  private logProcessingComplete(data: any) {
    console.log(`处理完成，耗时: ${data.processingTime}ms`);
  }

  private handleProcessingError(error: Error) {
    console.error('处理错误:', error.message);
    // 可以在这里实现错误上报、告警等逻辑
  }
}
```

## 🧪 测试最佳实践

### 单元测试示例

```typescript
// tests/unit/agent.test.ts
import { MyAgent } from '../../src/agents/my-agent';

describe('MyAgent', () => {
  let agent: MyAgent;

  beforeEach(async () => {
    agent = new MyAgent({
      apiKey: 'test-key',
      debug: true,
    });
    await agent.initialize();
  });

  afterEach(async () => {
    await agent.destroy();
  });

  describe('onProcess', () => {
    test('应该正确处理有效输入', async () => {
      const input = { content: 'Hello World' };
      const result = await agent.process(input);

      expect(result.content).toContain('Hello World');
      expect(result.metadata?.processed).toBe(true);
    });

    test('应该处理空输入', async () => {
      const input = { content: '' };
      const result = await agent.process(input);

      expect(result.content).toBeDefined();
    });

    test('应该包含处理时间', async () => {
      const input = { content: 'Test message' };
      const result = await agent.process(input);

      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('配置验证', () => {
    test('应该拒绝无效API密钥', () => {
      expect(() => {
        new MyAgent({ apiKey: 'short' });
      }).toThrow();
    });
  });
});
```

### 集成测试示例

```typescript
// tests/integration/agent.integration.test.ts
import { MyAgent } from '../../src/agents/my-agent';

describe('MyAgent Integration', () => {
  let agent: MyAgent;

  beforeAll(async () => {
    agent = new MyAgent({
      apiKey: process.env.TEST_API_KEY || 'test-key',
      timeout: 10000,
      debug: true,
    });
    await agent.initialize();
  });

  afterAll(async () => {
    await agent.destroy();
  });

  test('应该与真实API交互', async () => {
    const result = await agent.process({
      content: 'Integration test message',
      context: { userId: 'test-user' },
    });

    expect(result.content).toBeDefined();
    expect(result.metadata).toBeDefined();
  }, 30000); // 30秒超时
});
```

### 测试配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

## 🚀 部署和发布

### 1. 构建配置

```json
{
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "tsc",
    "postbuild": "cpy package.json dist/ && cpy README.md dist/",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

### 2. 发布到NPM

```bash
# 登录NPM
npm login

# 发布包
npm publish --access public
```

### 3. 发布到FixCycle市场

```typescript
// 使用CLI工具
fixcycle-agent deploy --api-key YOUR_API_KEY

// 或者编程方式
import { deployToMarketplace } from '@fixcycle/agent-sdk/deploy';

await deployToMarketplace({
  agentPath: './dist',
  apiKey: 'your-api-key',
  metadata: {
    name: 'My Agent',
    description: 'Description of my agent',
    category: 'utility',
    version: '1.0.0'
  }
});
```

## 🔒 安全最佳实践

### 1. 敏感信息处理

```typescript
export class SecureAgent extends BaseAgent {
  private maskSensitiveData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      // 掩盖敏感字段
      if (masked.apiKey) masked.apiKey = '***MASKED***';
      if (masked.password) masked.password = '***MASKED***';
      return masked;
    }
    return data;
  }

  protected logDebug(...args: any[]): void {
    if (this.config.debug) {
      // 对日志中的敏感信息进行掩码处理
      const maskedArgs = args.map(arg => this.maskSensitiveData(arg));
      console.debug(`[${this.info.name}]`, ...maskedArgs);
    }
  }
}
```

### 2. 输入验证和清理

```typescript
export class SanitizedAgent extends BaseAgent {
  @ValidateInput(input => {
    // 清理和验证输入
    if (typeof input.content !== 'string') {
      return 'Content must be a string';
    }

    // 移除潜在的恶意内容
    const sanitizedContent = input.content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();

    if (sanitizedContent.length === 0) {
      return 'Content cannot be empty after sanitization';
    }

    // 更新输入内容
    input.content = sanitizedContent;
    return true;
  })
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 处理已清理的输入
    return {
      content: `处理结果: ${input.content}`,
      metadata: { sanitized: true },
    };
  }
}
```

## 📊 监控和日志

### 1. 自定义日志系统

```typescript
export class MonitoredAgent extends BaseAgent {
  private logger: Logger;

  constructor(config: AgentConfig) {
    super(getAgentInfo(), config);
    this.logger = new Logger(this.info.name);
  }

  protected async onInitialize(): Promise<void> {
    this.logger.info('Agent initializing');
    // 初始化逻辑
    this.logger.info('Agent initialized successfully');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.logger.debug('Processing input', {
      inputLength: input.content.length,
    });

    try {
      const result = await this.businessLogic(input);

      this.logger.info('Processing completed', {
        processingTime: Date.now() - startTime,
        tokensUsed: result.tokensUsed,
      });

      return result;
    } catch (error) {
      this.logger.error('Processing failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

### 2. 性能指标收集

```typescript
export class InstrumentedAgent extends BaseAgent {
  private metrics: MetricsCollector;

  constructor(config: AgentConfig) {
    super(getAgentInfo(), config);
    this.metrics = new MetricsCollector(this.info.id);
  }

  @MonitorPerformance()
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    const result = await this.businessLogic(input);

    // 收集指标
    this.metrics.recordProcessingTime(result.processingTime || 0);
    this.metrics.incrementProcessedRequests();
    this.metrics.recordTokensUsed(result.tokensUsed || 0);

    return result;
  }

  async getMetrics(): Promise<AgentMetrics> {
    return this.metrics.getMetrics();
  }
}
```

## 🤝 社区和贡献

### 问题报告

如果遇到问题，请提供以下信息：

- SDK版本
- Node.js版本
- 操作系统
- 错误信息和堆栈跟踪
- 重现步骤

### 功能请求

欢迎提出新功能建议：

- 描述用例场景
- 解释解决的问题
- 提供API设计建议

### 贡献指南

1. Fork仓库
2. 创建特性分支
3. 编写测试
4. 更新文档
5. 提交Pull Request

---

**Happy Coding with FixCycle Agent SDK!** 🚀
