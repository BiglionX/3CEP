# FixCycle Agent SDK

FixCycle智能体开发工具包，帮助开发者快速创建和部署智能体到FixCycle市场。

## 🚀 特性

- **简单易用**: 基于TypeScript的现代化API设计
- **功能完整**: 包含完整的生命周期管理、错误处理和监控
- **装饰器支持**: 提供输入验证、输出格式化、缓存等功能装饰器
- **类型安全**: 完整的TypeScript类型定义
- **性能优化**: 内置缓存、重试机制和性能监控
- **易于测试**: 清晰的接口设计便于单元测试

## 📦 安装

```bash
npm install @fixcycle/agent-sdk
```

## 🎯 快速开始

### 1. 创建你的第一个智能体

```typescript
import { BaseAgent, Agent } from '@fixcycle/agent-sdk';
import {
  AgentInput,
  AgentOutput,
  AgentConfig,
} from '@fixcycle/agent-sdk/types';

@Agent({
  name: 'My First Agent',
  version: '1.0.0',
  description: '一个简单的示例智能体',
  category: 'utility',
  tags: ['示例', '工具'],
})
export class MyFirstAgent extends BaseAgent {
  protected async onInitialize(): Promise<void> {
    // 初始化逻辑
    console.log('Agent initialized');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 处理逻辑
    return {
      content: `收到消息: ${input.content}`,
      metadata: { processed: true },
    };
  }

  protected async onDestroy(): Promise<void> {
    // 清理逻辑
    console.log('Agent destroyed');
  }
}

// 使用智能体
async function main() {
  const agent = new MyFirstAgent({
    apiKey: 'your-api-key-here',
  });

  await agent.initialize();

  const result = await agent.process({
    content: 'Hello, World!',
  });

  console.log(result.content);

  await agent.destroy();
}

main();
```

### 2. 使用装饰器增强功能

```typescript
import {
  BaseAgent,
  Agent,
  ValidateInput,
  FormatOutput,
  Cache,
  MonitorPerformance,
} from '@fixcycle/agent-sdk';

@Agent({
  name: 'Enhanced Agent',
  version: '1.0.0',
  description: '带有装饰器增强功能的智能体',
  category: 'enhanced',
})
export class EnhancedAgent extends BaseAgent {
  @ValidateInput(input => {
    if (!input.content) return 'Content is required';
    if (input.content.length > 1000) return 'Content too long';
    return true;
  })
  @FormatOutput(output => ({
    ...output,
    content: output.content.trim(),
    metadata: {
      ...output.metadata,
      timestamp: new Date().toISOString(),
    },
  }))
  @Cache(300000) // 5分钟缓存
  @MonitorPerformance()
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 你的业务逻辑
    return {
      content: `处理结果: ${input.content}`,
      metadata: { success: true },
    };
  }
}
```

## 📚 核心概念

### 生命周期管理

智能体遵循标准的生命周期：

1. **初始化** (`initialize`) - 准备资源和建立连接
2. **处理** (`process`) - 接收输入并产生输出
3. **销毁** (`destroy`) - 清理资源和关闭连接

### 事件系统

智能体会发射以下事件：

- `initialized` - 初始化完成
- `processing` - 开始处理
- `completed` - 处理完成
- `error` - 发生错误
- `destroyed` - 销毁完成

```typescript
agent.on('completed', payload => {
  console.log('Processing completed:', payload.data);
});

agent.on('error', payload => {
  console.error('Error occurred:', payload.error);
});
```

## 🔧 配置选项

```typescript
interface AgentConfig {
  apiKey: string; // API密钥 (必需)
  apiUrl?: string; // API地址 (可选，默认为官方地址)
  timeout?: number; // 超时时间 (可选，默认30000ms)
  debug?: boolean; // 调试模式 (可选，默认false)
  maxRetries?: number; // 最大重试次数 (可选，默认3次)
}
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并监听变化
npm run test:watch

# 生成测试覆盖率报告
npm run test -- --coverage
```

## 📖 文档资源

- [API参考手册](docs/API_REFERENCE.md) - 完整的API文档
- [开发者指南](docs/DEVELOPER_GUIDE.md) - 详细的开发指导
- [示例项目](examples/) - 实际使用示例

你也可以通过以下命令生成TypeDoc文档：

```bash
npm run docs
```

文档将生成在 `docs/api` 目录下。

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如有问题，请联系：

- 邮箱: developers@fixcycle.com
- 文档: https://docs.fixcycle.com/sdk
- 社区: https://community.fixcycle.com

---

© 2026 FixCycle Team. All rights reserved.
