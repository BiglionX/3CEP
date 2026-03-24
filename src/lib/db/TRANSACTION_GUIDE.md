# 事务处理使用指南

## 概述

`transaction.ts` 提供了 Supabase 事务处理的封装，确保多个相关操作的原子性、一致性、隔离性和持久性（ACID）。

## 核心功能

### 1. 基础事务执行

```typescript
import { runInTransaction } from '@/lib/db/transaction';

const result = await runInTransaction(async tx => {
  // 所有操作要么全部成功，要么全部失败
  const { data: agent } = await tx
    .from('agents')
    .update({ status: 'active' })
    .eq('id', agentId);

  await tx
    .from('audit_logs')
    .insert({ action: 'agent_activated', resource_id: agentId });

  return agent;
});

if (result.success) {
  console.log('事务成功:', result.data);
} else {
  console.error('事务失败:', result.error);
}
```

### 2. 批量操作事务

```typescript
import { runBatchTransaction } from '@/lib/db/transaction';

const result = await runBatchTransaction([
  {
    table: 'agents',
    operation: 'update',
    data: { status: 'active' },
    filter: { id: ['id1', 'id2', 'id3'] },
  },
  {
    table: 'audit_logs',
    operation: 'insert',
    data: [
      { action: 'agent_activated', resource_id: 'id1' },
      { action: 'agent_activated', resource_id: 'id2' },
      { action: 'agent_activated', resource_id: 'id3' },
    ],
  },
]);
```

### 3. 预定义事务模板

```typescript
// 审核通过事务
import { approveAgentWithTransaction } from '@/lib/db/transaction';

const result = await approveAgentWithTransaction(
  agentId,
  adminUserId,
  '符合规范'
);

// 删除智能体事务
import { deleteAgentWithTransaction } from '@/lib/db/transaction';

const result = await deleteAgentWithTransaction(agentId, adminUserId);
```

## 典型应用场景

### 场景 1: 智能体审核通过

**需求**: 审核通过时需要同时更新状态、记录日志、上架智能体。

```typescript
import { approveAgentWithTransaction } from '@/lib/db/transaction';

export async function handleAgentApproval(
  agentId: string,
  adminUserId: string,
  reason: string
) {
  const result = await approveAgentWithTransaction(
    agentId,
    adminUserId,
    reason
  );

  if (result.success) {
    // 审核成功，返回成功响应
    return NextResponse.json({
      success: true,
      message: '智能体已审核通过并上架',
      data: result.data,
    });
  } else {
    // 审核失败，回滚所有操作
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 500 }
    );
  }
}
```

### 场景 2: 删除智能体（带关联检查）

**需求**: 删除前检查订单和执行记录，确保数据一致性。

```typescript
import { deleteAgentWithTransaction } from '@/lib/db/transaction';

export async function handleAgentDeletion(
  agentId: string,
  adminUserId: string
) {
  const result = await deleteAgentWithTransaction(agentId, adminUserId);

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: '智能体已删除',
      data: result.data,
    });
  } else {
    const statusCode = result.error?.message?.includes('存在') ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: statusCode }
    );
  }
}
```

### 场景 3: 自定义复杂事务

**需求**: 用户购买智能体时，需要扣减库存、创建订单、更新统计数据。

```typescript
import { runInTransaction } from '@/lib/db/transaction';

export async function purchaseAgent(
  userId: string,
  agentId: string,
  packageType: string
) {
  const result = await runInTransaction(
    async tx => {
      // 步骤 1: 检查库存
      const { data: agent } = await tx
        .from('agents')
        .select('inventory_count, stock_limit')
        .eq('id', agentId)
        .single();

      if (
        !agent ||
        (agent.stock_limit !== null && agent.inventory_count <= 0)
      ) {
        throw new Error('库存不足');
      }

      // 步骤 2: 扣减库存
      const { error: stockError } = await tx
        .from('agents')
        .update({ inventory_count: agent.inventory_count - 1 })
        .eq('id', agentId);

      if (stockError) throw stockError;

      // 步骤 3: 创建订单
      const { data: order } = await tx
        .from('agent_orders')
        .insert({
          user_id: userId,
          agent_id: agentId,
          product_type: 'subscription',
          subscription_period: packageType,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      // 步骤 4: 更新销售统计
      const { error: statsError } = await tx
        .from('agents')
        .update({
          purchase_count: (agent.purchase_count || 0) + 1,
          revenue: (agent.revenue || 0) + order.amount,
        })
        .eq('id', agentId);

      if (statsError) throw statsError;

      // 步骤 5: 创建安装记录
      await tx.from('user_agent_installations').insert({
        user_id: userId,
        agent_id: agentId,
        order_id: order.id,
        status: 'active',
        started_at: new Date().toISOString(),
      });

      return { orderId: order.id, agentId };
    },
    {
      maxRetries: 3,
      retryDelay: 200,
      timeout: 30000,
    }
  );

  return result;
}
```

## 配置选项

### TransactionOptions

```typescript
interface TransactionOptions {
  /**
   * 最大重试次数
   * @default 3
   */
  maxRetries?: number;

  /**
   * 重试延迟（毫秒）
   * @default 100
   */
  retryDelay?: number;

  /**
   * 是否记录事务日志
   * @default true
   */
  logTransaction?: boolean;

  /**
   * 事务超时时间（毫秒）
   * @default 30000
   */
  timeout?: number;
}
```

### 使用示例

```typescript
// 自定义配置
const result = await runInTransaction(
  async tx => {
    // 事务逻辑
  },
  {
    maxRetries: 5, // 最多重试 5 次
    retryDelay: 500, // 每次间隔 500ms
    timeout: 60000, // 60 秒超时
    logTransaction: true, // 记录日志
  }
);
```

## 错误处理

### 可重试的错误

系统会自动重试以下类型的错误：

- **序列化失败** (40001)
- **死锁检测** (40P01)
- **查询取消** (57014)
- **连接异常** (08xxx)
- **网络超时**

### 不可重试的错误

以下错误会立即失败，不重试：

- **业务逻辑错误**（如库存不足）
- **验证失败**
- **权限不足**

### 错误响应格式

```typescript
{
  success: false,
  error: {
    code: '40001',              // PostgreSQL 错误码
    message: 'serialization_failure',
    details: '详细错误信息',
    hint: '修复建议'
  }
}
```

## 最佳实践

### ✅ 推荐做法

```typescript
// 1. 保持事务简短
await runInTransaction(async (tx) => {
  // 只包含必要的数据库操作
  await tx.from('table1').update(...);
  await tx.from('table2').insert(...);
});

// 2. 在事务内抛出明确的错误
await runInTransaction(async (tx) => {
  const { data } = await tx.from('agents').select().eq('id', id).single();

  if (!data) {
    throw new Error('智能体不存在'); // 明确的错误消息
  }

  // 继续操作...
});

// 3. 使用预定义的事务模板
await approveAgentWithTransaction(agentId, userId);

// 4. 设置合理的超时时间
await runInTransaction(async (tx) => {
  // 复杂操作
}, { timeout: 60000 });
```

### ❌ 避免做法

```typescript
// 1. 事务中包含外部 API 调用
await runInTransaction(async (tx) => {
  await tx.from('table').insert(...);

  // ❌ 不要这样做
  await fetch('https://external-api.com/...');
});

// 2. 事务过长
await runInTransaction(async (tx) => {
  // 几十个操作...
  // 增加了超时和死锁风险
});

// 3. 吞掉错误
await runInTransaction(async (tx) => {
  try {
    await tx.from('table').insert(...);
  } catch (e) {
    console.error(e);
    // ❌ 不抛出错误，导致事务被认为成功
  }
});
```

## 性能优化

### 1. 索引优化

确保事务中使用的字段有合适的索引：

```sql
-- 为常用查询添加索引
CREATE INDEX idx_agents_review_status ON agents(review_status);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
```

### 2. 减少锁竞争

```typescript
// 避免长时间持有锁
await runInTransaction(async (tx) => {
  // 快速完成写操作
  await tx.from('agents').update(...).eq('id', id);

  // 不要在事务中做耗时操作
});
```

### 3. 批量操作

```typescript
// 批量插入优于循环插入
await runInTransaction(async tx => {
  // ✅ 好
  await tx.from('logs').insert(logArray);

  // ❌ 差
  for (const log of logs) {
    await tx.from('logs').insert(log);
  }
});
```

## 监控和调试

### 日志输出

```typescript
// 启用事务日志
await runInTransaction(
  async tx => {
    // ...
  },
  { logTransaction: true }
);

// 控制台输出:
// ✅ 事务执行成功（尝试 1/3）
// 或
// ❌ 事务执行失败（尝试 2/3）: serialization_failure
```

### 性能监控

```typescript
const startTime = Date.now();
const result = await runInTransaction(async tx => {
  // 事务逻辑
});
const duration = Date.now() - startTime;

console.log(`事务耗时：${duration}ms`);
```

## 测试用例

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { runInTransaction } from '@/lib/db/transaction';

describe('Transaction', () => {
  it('应该成功执行事务', async () => {
    const result = await runInTransaction(async tx => {
      return { test: 'data' };
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ test: 'data' });
  });

  it('应该在失败时回滚', async () => {
    const result = await runInTransaction(async tx => {
      await tx.from('test').insert({ id: 1 });
      throw new Error('故意失败');
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('故意失败');
  });
});
```

## 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 事务](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [ACID 原则](https://en.wikipedia.org/wiki/ACID)

---

**最后更新**: 2026-03-24
**版本**: v1.0
