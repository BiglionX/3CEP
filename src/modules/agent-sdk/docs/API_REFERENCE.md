# FixCycle Agent SDK API 参考手册

## 目录

- [核心类](#核心类)
- [装饰器](#装饰器)
- [类型定义](#类型定义)
- [客户端](#客户端)
- [工具函数](#工具函数)

## 核心类

### BaseAgent

所有智能体的基类，提供了完整的生命周期管理和事件系统。

```typescript
abstract class BaseAgent extends EventEmitter implements AgentMethods {
  constructor(info: AgentInfo, config: AgentConfig);

  // 生命周期方法
  async initialize(): Promise<void>;
  async process(input: AgentInput): Promise<AgentOutput>;
  async destroy(): Promise<void>;

  // 状态查询
  isInitialized(): boolean;
  isDestroyed(): boolean;
  getInfo(): AgentInfo;
  getConfig(): Partial<AgentConfig>;

  // 健康检查
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }>;
}
```

#### 抽象方法（必须实现）

```typescript
protected abstract onInitialize(): Promise<void>;
protected abstract onProcess(input: AgentInput): Promise<AgentOutput>;
protected abstract onDestroy(): Promise<void>;
```

#### 可选方法（可重写）

```typescript
protected async checkHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details?: any;
}>;

validateConfig?(config: any): boolean;
```

#### 事件系统

```typescript
// 监听事件
agent.on('initialized', payload => {
  console.log('Agent initialized');
});

agent.on('processing', payload => {
  console.log('Processing input:', payload.data.input);
});

agent.on('completed', payload => {
  console.log('Processing completed:', payload.data.output);
});

agent.on('error', payload => {
  console.error('Error occurred:', payload.error);
});

agent.on('destroyed', payload => {
  console.log('Agent destroyed');
});
```

## 装饰器

### @Agent

智能体类装饰器，自动设置元信息。

```typescript
@Agent({
  name: 'My Agent',
  version: '1.0.0',
  description: 'Description of my agent',
  category: 'utility',
  tags: ['tag1', 'tag2'],
})
export class MyAgent extends BaseAgent {
  // 实现抽象方法...
}
```

### @ValidateInput

输入验证装饰器，在处理前验证输入格式。

```typescript
@ValidateInput((input) => {
  if (!input.content) return 'Content is required';
  if (input.content.length > 1000) return 'Content too long';
  return true;
})
protected async onProcess(input: AgentInput): Promise<AgentOutput> {
  // 处理逻辑
}
```

### @FormatOutput

输出格式化装饰器，自动格式化处理结果。

```typescript
@FormatOutput((output) => ({
  ...output,
  content: output.content.trim(),
  metadata: {
    ...output.metadata,
    processedAt: new Date().toISOString()
  }
}))
protected async onProcess(input: AgentInput): Promise<AgentOutput> {
  // 处理逻辑
}
```

### @HandleError

统一错误处理装饰器。

```typescript
@HandleError((error) => {
  console.error('Processing error:', error);
  return {
    content: 'Sorry, an error occurred',
    metadata: { error: error.message }
  };
})
protected async onProcess(input: AgentInput): Promise<AgentOutput> {
  // 处理逻辑
}
```

### @MonitorPerformance

性能监控装饰器，记录执行时间和资源使用。

```typescript
@MonitorPerformance()
protected async onProcess(input: AgentInput): Promise<AgentOutput> {
  // 处理逻辑
}
```

### @Cache

缓存装饰器，缓存方法结果以提高性能。

```typescript
@Cache(300000) // 5分钟缓存
protected async onProcess(input: AgentInput): Promise<AgentOutput> {
  // 处理逻辑
}
```

## 类型定义

### AgentInfo

智能体基本信息。

```typescript
interface AgentInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  author: string;
  homepage?: string;
  repository?: string;
}
```

### AgentConfig

智能体配置。

```typescript
interface AgentConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}
```

### AgentInput

输入数据结构。

```typescript
interface AgentInput {
  content: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}
```

### AgentOutput

输出数据结构。

```typescript
interface AgentOutput {
  content: string;
  tokensUsed?: number;
  processingTime?: number;
  metadata?: Record<string, any>;
}
```

### AgentEvent

生命周期事件类型。

```typescript
type AgentEvent =
  | 'initialized'
  | 'processing'
  | 'completed'
  | 'error'
  | 'destroyed';
```

### 错误类型

```typescript
class AgentError extends Error {
  constructor(message: string, code: string, details?: any);
}

class ValidationError extends AgentError {
  // 验证错误
}

class NetworkError extends AgentError {
  // 网络错误
}
```

## 客户端

### HttpClient

HTTP客户端，用于与FixCycle平台API通信。

```typescript
class HttpClient {
  constructor(config: AgentConfig);

  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>>;
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  async delete<T>(url: string): Promise<ApiResponse<T>>;

  getBaseURL(): string;
  updateConfig(newConfig: Partial<AgentConfig>): void;
}
```

### ApiResponse

API响应格式。

```typescript
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}
```

## 工具函数

### validateConfig

验证智能体配置格式。

```typescript
function validateConfig(config: any): config is AgentConfig;
```

### formatAgentInfo

格式化智能体信息。

```typescript
function formatAgentInfo(info: AgentInfo): string;
```

### validateAgentInfo

验证智能体信息完整性。

```typescript
function validateAgentInfo(info: any): info is AgentInfo;
```

### generateAgentId

生成智能体ID。

```typescript
function generateAgentId(category: string, name: string): string;
```

### 便捷函数

```typescript
// 创建智能体实例
async function createAgent<T extends BaseAgent>(
  AgentClass: new (config: any) => T,
  config: any
): Promise<T>;

// 销毁智能体实例
async function destroyAgent(agent: BaseAgent): Promise<void>;

// 获取SDK信息
function getSdkInfo(): {
  name: string;
  version: string;
  description: string;
  homepage: string;
};
```

## 最佳实践

### 1. 错误处理

```typescript
class MyAgent extends BaseAgent {
  @HandleError(error => {
    this.logError('Processing failed:', error);
    return {
      content: '抱歉，处理失败',
      metadata: { error: error.message },
    };
  })
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 业务逻辑
  }
}
```

### 2. 性能优化

```typescript
class MyAgent extends BaseAgent {
  @Cache(300000) // 5分钟缓存
  @MonitorPerformance()
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 处理逻辑
  }
}
```

### 3. 输入验证

```typescript
class MyAgent extends BaseAgent {
  @ValidateInput(input => {
    if (!input.content?.trim()) {
      return '请输入有效内容';
    }
    if (input.content.length > 1000) {
      return '内容长度不能超过1000字符';
    }
    return true;
  })
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    // 处理逻辑
  }
}
```

### 4. 日志记录

```typescript
class MyAgent extends BaseAgent {
  protected logDebug(...args: any[]): void {
    if (this.config.debug) {
      console.debug(`[${this.info.name}]`, ...args);
    }
  }

  protected logError(...args: any[]): void {
    console.error(`[${this.info.name}]`, ...args);
  }
}
```

## 配置选项详解

### timeout

请求超时时间（毫秒），默认30000ms。

```typescript
const config: AgentConfig = {
  apiKey: 'your-api-key',
  timeout: 60000, // 60秒超时
};
```

### maxRetries

最大重试次数，默认3次。

```typescript
const config: AgentConfig = {
  apiKey: 'your-api-key',
  maxRetries: 5, // 最多重试5次
};
```

### debug

调试模式，启用后会输出详细日志。

```typescript
const config: AgentConfig = {
  apiKey: 'your-api-key',
  debug: true, // 启用调试模式
};
```

## 错误处理指南

### 网络错误

```typescript
try {
  const result = await agent.process(input);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('网络错误:', error.details);
  } else if (error instanceof ValidationError) {
    console.error('验证错误:', error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 重试机制

SDK内置了自动重试机制，对于以下错误会自动重试：

- 网络超时
- 5xx服务器错误
- 429限流错误

重试间隔采用指数退避策略，最大等待时间10秒。
