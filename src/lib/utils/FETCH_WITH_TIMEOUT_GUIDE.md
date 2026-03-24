# fetch-with-timeout 使用指南

## 概述

`fetch-with-timeout.ts` 提供了带超时控制和重试机制的 fetch 封装，用于防止外部 API 调用时无限制挂起。

## API 接口

### FetchWithTimeoutOptions

```typescript
interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // 超时时间（毫秒），默认 30000ms
  retries?: number; // 重试次数，默认 0
  retryDelay?: number; // 重试延迟（毫秒），默认 1000ms
  errorMessage?: string; // 自定义错误消息
}
```

## 使用示例

### 1. 基本使用（默认 30 秒超时）

```typescript
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

const response = await fetchWithTimeout('https://api.example.com/data');
const data = await response.json();
```

### 2. 自定义超时时间

```typescript
// 5 秒超时，适用于快速响应的 API
const response = await fetchWithTimeout('https://api.example.com/health', {
  timeout: 5000,
});
```

### 3. 带重试机制

```typescript
// 失败后重试 3 次，每次间隔 2 秒
const response = await fetchWithTimeout(
  'https://api.github.com/repos/owner/repo',
  {
    timeout: 10000,
    retries: 3,
    retryDelay: 2000,
  }
);
```

### 4. GET 请求快捷方法

```typescript
import { safeJsonGet } from '@/lib/utils/fetch-with-timeout';

// 类型安全的 GET 请求
const data = await safeJsonGet<{ users: User[] }>(
  'https://api.example.com/users',
  { timeout: 10000 }
);
```

### 5. POST 请求快捷方法

```typescript
import { safeJsonPost } from '@/lib/utils/fetch-with-timeout';

const result = await safeJsonPost<{ success: boolean }>(
  'https://api.example.com/users',
  { name: 'John', email: 'john@example.com' },
  { timeout: 15000 }
);
```

### 6. 服务健康检查

```typescript
import { checkServiceHealth } from '@/lib/utils/fetch-with-timeout';

// 检查服务是否可用（5 秒超时）
const isAvailable = await checkServiceHealth(
  'https://api.example.com/health',
  5000
);

if (!isAvailable) {
  console.log('服务不可用，使用备用方案');
}
```

## 在现有代码中的应用

### GitHub API 调用示例

```typescript
// src/lib/github/api.ts
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

export async function getRepoInfo(owner: string, repo: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MyApp/1.0',
  };

  // 使用超时控制（10 秒超时，失败重试 2 次）
  const response = await fetchWithTimeout(url, {
    headers,
    timeout: 10000,
    retries: 2,
    retryDelay: 1000,
  });

  const data = await response.json();
  return {
    name: data.name,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
  };
}
```

### N8N Webhook 调用示例

```typescript
// src/lib/n8n-integration.ts
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

export async function triggerWebhook(webhookUrl: string, payload: any) {
  try {
    const response = await fetchWithTimeout(webhookUrl, {
      method: 'POST',
      timeout: 30000, // 30 秒超时
      retries: 2, // 失败重试 2 次
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET!,
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    if ((error as Error).name === 'TimeoutError') {
      console.error('Webhook 调用超时:', error);
      throw new Error('操作超时，请稍后重试');
    }
    throw error;
  }
}
```

## 错误处理

### 超时错误

```typescript
try {
  const response = await fetchWithTimeout(url, { timeout: 5000 });
} catch (error) {
  if ((error as Error).name === 'TimeoutError') {
    console.error('请求超时:', error.message);
    // 执行超时处理逻辑
  } else {
    console.error('其他错误:', error);
  }
}
```

### 重试失败

```typescript
try {
  const response = await fetchWithTimeout(url, {
    timeout: 10000,
    retries: 3,
    retryDelay: 2000,
  });
} catch (error) {
  console.error('所有重试都失败了:', error);
  // 执行降级方案
}
```

## 最佳实践

### 1. 根据业务场景设置合理的超时时间

```typescript
// 健康检查：5 秒
await fetchWithTimeout('/health', { timeout: 5000 });

// 普通数据查询：15 秒
await fetchWithTimeout('/api/data', { timeout: 15000 });

// 文件上传/下载：60 秒
await fetchWithTimeout('/api/upload', { timeout: 60000 });
```

### 2. 为关键服务配置重试机制

```typescript
// 支付回调等关键操作，配置重试
await fetchWithTimeout('https://payment.api.com/callback', {
  timeout: 30000,
  retries: 3,
  retryDelay: 3000, // 指数退避更好
});
```

### 3. 使用指数退避策略

```typescript
// 手动实现指数退避
async function fetchWithBackoff(url: string, maxRetries = 5) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetchWithTimeout(url, {
        timeout: 10000,
        retries: 0, // 使用外层循环控制重试
      });
    } catch (error) {
      if (i === maxRetries) throw error;

      // 指数退避：1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

### 4. 监控和日志

```typescript
const startTime = Date.now();
try {
  const response = await fetchWithTimeout(url, { timeout: 10000 });
  const duration = Date.now() - startTime;
  console.log(`请求成功，耗时：${duration}ms`);
} catch (error) {
  const duration = Date.now() - startTime;
  console.error(`请求失败，耗时：${duration}ms`, error);
}
```

## 注意事项

1. **不要滥用重试**：对于幂等性不确定的操作（如创建订单），谨慎使用重试
2. **合理设置超时**：过短可能导致正常请求失败，过长可能占用资源
3. **清理资源**：AbortController 会自动清理，无需手动处理
4. **错误分类**：区分超时错误和网络错误，采取不同处理策略

## 迁移指南

### 从原生 fetch 迁移

**之前：**

```typescript
const response = await fetch(url);
```

**现在：**

```typescript
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

const response = await fetchWithTimeout(url, { timeout: 30000 });
```

### 从 AbortController 迁移

**之前：**

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (error) {
  clearTimeout(timeoutId);
  throw error;
}
```

**现在：**

```typescript
const response = await fetchWithTimeout(url, { timeout: 5000 });
```

## 相关文档

- [MDN: fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [MDN: AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)
- [OPT-012 任务文档](../../docs/project-planning/AGENT_OPTIMIZATION_ATOMIC_TASKS.md#opt-012-添加网络超时处理)
