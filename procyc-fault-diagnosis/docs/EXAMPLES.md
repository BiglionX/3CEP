# {{SKILL_NAME}} - 使用示例

## 基础示例

### 1. 最简单的调用方式

```typescript
import skill from './src/index';

async function main() {
  const result = await skill.execute({
    // 输入参数
  });

  console.log('执行结果:', result);
}

main();
```

## 进阶示例

### 2. 带错误处理的调用

```typescript
import skill from './src/index';

async function safeExecute() {
  try {
    const result = await skill.execute({
      param1: 'value',
      param2: 42,
    });

    if (result.success) {
      console.log('成功:', result.data);
      console.log('执行时间:', result.metadata.executionTimeMs, 'ms');
    } else {
      console.error('失败:', result.error?.message);
      console.error('错误码:', result.error?.code);
    }
  } catch (error) {
    console.error('异常:', error.message);
  }
}

safeExecute();
```

### 3. 批量调用示例

```typescript
import skill from './src/index';

async function batchExecute(inputs: Array<any>) {
  const results = await Promise.all(inputs.map(input => skill.execute(input)));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`成功：${successCount}, 失败：${failCount}`);

  return results;
}

// 使用示例
const inputs = [
  { param1: 'value1', param2: 10 },
  { param1: 'value2', param2: 20 },
  { param1: 'value3', param2: 30 },
];

batchExecute(inputs);
```

## 实际应用场景

### 4. 在 Express 中使用

```typescript
import express from 'express';
import skill from './src/index';

const app = express();
app.use(express.json());

app.post('/api/execute', async (req, res) => {
  try {
    const result = await skill.execute(req.body);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SKILL_006',
        message: error.message,
      },
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 5. 在 Next.js API Route 中使用

```typescript
// app/api/skill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import skill from '@/lib/skills/your-skill';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await skill.execute(body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SKILL_006',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
```

### 6. 定时任务示例

```typescript
import cron from 'node-cron';
import skill from './src/index';

// 每天凌晨 2 点执行
cron.schedule('0 2 * * *', async () => {
  console.log('开始执行定时任务...');

  const result = await skill.execute({
    // 定时任务参数
  });

  if (result.success) {
    console.log('定时任务执行成功');
  } else {
    console.error('定时任务执行失败:', result.error);
  }
});
```

## 测试示例

### 7. 单元测试示例 (Jest)

```typescript
// tests/unit/skill.test.ts
import skill from '../../src/index';

describe('Skill Tests', () => {
  it('应该成功执行基本技能', async () => {
    const result = await skill.execute({
      param1: 'test',
      param2: 100,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata.executionTimeMs).toBeGreaterThan(0);
  });

  it('应该处理无效输入', async () => {
    const result = await skill.execute({
      param1: '', // 空字符串应该验证失败
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('SKILL_001');
  });

  it('应该包含正确的元数据', async () => {
    const result = await skill.execute({
      param1: 'valid',
    });

    expect(result.metadata).toEqual({
      executionTimeMs: expect.any(Number),
      timestamp: expect.any(String),
      version: '1.0.0',
    });
  });
});
```

### 8. 集成测试示例

```typescript
// tests/integration/skill.integration.test.ts
import skill from '../../src/index';

describe('Integration Tests', () => {
  it('应该在真实场景下工作', async () => {
    // 准备测试数据
    const testData = {
      param1: 'integration-test',
      param2: Math.floor(Math.random() * 100),
    };

    // 执行技能
    const result = await skill.execute(testData);

    // 验证结果
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      // 预期的数据结构
    });

    // 验证性能（应该在 2 秒内完成）
    expect(result.metadata.executionTimeMs).toBeLessThan(2000);
  });
});
```

## 最佳实践

### 9. 重试机制

```typescript
import skill from './src/index';

async function executeWithRetry(input: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await skill.execute(input);

      if (result.success) {
        return result;
      }

      // 如果是临时错误，重试
      if (['SKILL_002', 'SKILL_003'].includes(result.error?.code || '')) {
        console.log(`第 ${i + 1} 次重试...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      // 其他错误直接返回
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error('超过最大重试次数');
}

// 使用
executeWithRetry({ param1: 'value' });
```

## 常见问题

### Q1: 如何处理超时？

建议在调用时设置超时：

```typescript
import { Promise } from 'bluebird';

const timeout = 30000; // 30 秒
const result = await Promise.resolve(skill.execute(input)).timeout(timeout);
```

### Q2: 如何监控技能性能？

添加性能监控：

```typescript
import metrics from './metrics';

async function monitoredExecute(input: any) {
  const start = Date.now();

  try {
    const result = await skill.execute(input);

    metrics.histogram('skill.execution_time', Date.now() - start);
    metrics.increment('skill.success');

    return result;
  } catch (error) {
    metrics.increment('skill.failure');
    throw error;
  }
}
```

---

更多示例请参考官方文档和 GitHub 仓库。
