# 多租户隔离实施指南

## 概述

本指南说明如何在智能体管理系统中实施严格的多租户隔离，防止数据泄露。

## 核心组件

### 1. RLS（Row Level Security）策略

数据库层面的强制隔离，确保用户只能访问自己租户的数据。

### 2. 租户隔离中间件

应用层面的检查和过滤，提供额外的安全保障。

### 3. 审计日志

记录所有租户隔离违规尝试，便于安全审计。

---

## 数据库迁移

执行以下迁移文件以启用 RLS 策略：

```bash
supabase db push supabase/migrations/20260324_enforce_tenant_isolation_rls.sql
```

### 迁移内容

1. **agents 表** - 完整的 CRUD 租户隔离
2. **agent_orders 表** - 订单数据隔离
3. **user_agent_installations 表** - 安装记录隔离
4. **audit_logs 表** - 审计日志隔离
5. **notifications 表** - 通知隔离
6. **agent_subscription_reminders 表** - 提醒记录隔离
7. **profiles 表** - 用户资料隔离

---

## API 开发最佳实践

### ✅ 正确做法

```typescript
import { createClient } from '@supabase/supabase-js';
import { withTenantCheck } from '@/middleware/tenant-isolation';

export async function GET(request: Request) {
  return await withTenantCheck(request, async (context, supabase) => {
    // 方法 1: 使用中间件自动注入上下文
    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('tenant_id', context.tenantId); // 显式添加租户过滤

    return NextResponse.json({ success: true, data });
  });
}
```

### ❌ 错误做法

```typescript
// 缺少租户过滤，会导致数据泄露！
export async function GET() {
  const { data } = await supabase.from('agents').select('*'); // 没有限制租户，会返回所有数据

  return NextResponse.json({ success: true, data });
}
```

---

## 租户隔离中间件使用

### 基础用法

```typescript
import {
  withTenantCheck,
  extractTenantContext,
  verifyTenantIsolation
} from '@/middleware/tenant-isolation';

// 方法 1: 使用装饰器模式
export async function POST(request: Request) {
  return await withTenantCheck(request, async (context, supabase) => {
    // 这里的代码会自动获得租户上下文
    const agentId = '...';

    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('tenant_id', context.tenantId); // 必须添加

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    // 验证返回的数据确实属于当前租户
    if (!verifyTenantIsolation(data[0], context)) {
      throw new Error('租户隔离验证失败');
    }

    return NextResponse.json({ success: true, data: data[0] });
  });
}

// 方法 2: 手动提取上下文
export async function PUT(request: Request) {
  const context = await extractTenantContext(request);

  if (!context) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const supabase = createClient(...);

  // 管理员可以跨租户访问
  if (!context.isAdmin) {
    // 普通用户必须添加租户过滤
    const { data } = await supabase
      .from('agents')
      .update({ name: 'New Name' })
      .eq('id', agentId)
      .eq('tenant_id', context.tenantId); // 必须添加
  } else {
    // 管理员可以直接操作
    const { data } = await supabase
      .from('agents')
      .update({ name: 'New Name' })
      .eq('id', agentId);
  }

  return NextResponse.json({ success: true });
}
```

---

## 批量数据验证

当处理批量数据时，需要验证所有记录都属于当前租户：

```typescript
import { verifyTenantIsolationBatch } from '@/middleware/tenant-isolation';

export async function GET(request: Request) {
  const context = await extractTenantContext(request);

  const { data } = await supabase.from('agents').select('*').in('id', ids);

  // 批量验证租户隔离
  if (!verifyTenantIsolationBatch(data, context)) {
    // 记录安全事件
    console.error('检测到跨租户数据泄露风险');
    return NextResponse.json({ error: '数据验证失败' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
```

---

## 安全审计

### 租户隔离违规日志

系统会自动记录所有违规尝试：

```typescript
// audit_logs 表会记录：
{
  "user_id": "uuid-here",
  "action": "tenant_isolation_violation",
  "resource_type": "agents",
  "resource_id": "uuid-here",
  "details": {
    "attemptedTenantId": "wrong-tenant-id",
    "actualTenantId": "correct-tenant-id",
    "severity": "high",
    "timestamp": "2026-03-24T10:30:00Z"
  }
}
```

### 查看违规日志

```sql
-- 查询最近的租户隔离违规尝试
SELECT * FROM audit_logs
WHERE action = 'tenant_isolation_violation'
ORDER BY created_at DESC
LIMIT 100;
```

---

## 测试用例

### 1. 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { verifyTenantIsolation } from '@/middleware/tenant-isolation';

describe('Tenant Isolation', () => {
  it('应该允许用户访问自己租户的数据', () => {
    const context = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      role: 'user',
      isAdmin: false,
    };

    const data = { id: '1', tenant_id: 'tenant-1' };

    expect(verifyTenantIsolation(data, context)).toBe(true);
  });

  it('应该阻止用户访问其他租户的数据', () => {
    const context = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      role: 'user',
      isAdmin: false,
    };

    const data = { id: '2', tenant_id: 'tenant-2' };

    expect(verifyTenantIsolation(data, context)).toBe(false);
  });

  it('管理员应该可以访问所有租户的数据', () => {
    const context = {
      tenantId: 'tenant-1',
      userId: 'admin-1',
      role: 'admin',
      isAdmin: true,
    };

    const data = { id: '2', tenant_id: 'tenant-2' };

    expect(verifyTenantIsolation(data, context)).toBe(true);
  });
});
```

### 2. 集成测试

```typescript
// 测试跨租户访问被拒绝
it('应该拒绝跨租户访问请求', async () => {
  // 用户 A 创建智能体
  const agentA = await createAgent({
    tenantId: 'tenant-a',
    name: 'Agent A',
  });

  // 用户 B 尝试访问
  const response = await fetch(`/api/agents/${agentA.id}`, {
    headers: {
      Authorization: 'Bearer user-b-token', // 用户 B 的 token
    },
  });

  // 应该返回 404 或 403
  expect(response.status).toBe(404);
});
```

---

## 性能优化

### 1. 索引优化

所有租户隔离查询都应该有合适的索引：

```sql
-- 复合索引加速租户隔离查询
CREATE INDEX idx_agents_tenant_status
ON agents(tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX idx_agent_orders_tenant_user
ON agent_orders(tenant_id, user_id);
```

### 2. 查询优化

```typescript
// ✅ 好的查询：使用复合索引
const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('tenant_id', tenantId)
  .eq('status', 'active');

// ❌ 差的查询：无法使用索引
const { data } = await supabase
  .from('agents')
  .select('*')
  .ilike('name', '%keyword%'); // 没有租户过滤
```

---

## 常见问题

### Q: RLS 会影响性能吗？

A: 轻微影响（约 5-10%），但通过合适的索引可以最小化影响。安全性优先于性能。

### Q: 管理员如何跨租户管理？

A: 管理员角色（admin/system）会自动绕过 RLS 限制，但仍建议在查询中明确指定租户 ID 以提高性能。

### Q: 如何调试 RLS 问题？

A: 使用以下 SQL 查看 RLS 策略执行情况：

```sql
-- 查看表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'agents';
```

### Q: 现有代码如何迁移？

A: 逐步进行：

1. 先执行数据库迁移
2. 在测试环境验证
3. 逐个 API 添加租户隔离
4. 监控错误日志
5. 全量上线

---

## 检查清单

在部署前确认：

- [ ] 所有敏感表都启用了 RLS
- [ ] 所有 API 都添加了租户过滤
- [ ] 批量数据验证已实施
- [ ] 审计日志正常记录
- [ ] 性能测试通过
- [ ] 安全测试通过
- [ ] 文档已更新

---

## 相关资源

- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 最佳实践](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP 多租户安全指南](https://cheatsheetseries.owasp.org/cheatsheets/Multitenancy_Cheatsheet.html)

---

**最后更新**: 2026-03-24
**版本**: v1.0
