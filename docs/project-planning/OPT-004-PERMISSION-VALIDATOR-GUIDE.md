# OPT-004: 统一权限验证工具类使用指南

## 📋 任务信息

- **任务编号**: OPT-004
- **任务名称**: 统一权限验证工具类
- **优先级**: P0 (严重问题，必须立即修复)
- **完成日期**: 2026 年 3 月 24 日
- **预计工时**: 5 小时

---

## 🎯 任务目标

创建统一的权限验证工具类，替换现有分散的权限验证代码，确保所有 API 端点权限验证一致性。

---

## 📦 交付物

### 1. 权限验证工具类

**文件路径**: `src/lib/auth/permissions.ts`

**核心功能**:

- ✅ 统一的权限映射表
- ✅ 角色检查函数
- ✅ 权限验证方法
- ✅ 所有权验证
- ✅ 快捷辅助函数

---

## 🔧 使用方法

### 基础用法

#### 1️⃣ 在 API路由中使用

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  PermissionValidator,
  AgentPermission,
  authenticateAndGetUser,
} from '@/lib/auth/permissions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 验证认证并获取用户信息
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    const authResult = await authenticateAndGetUser(sessionCookie, supabase);

    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // 验证权限
    const validator = new PermissionValidator(supabase);
    const permissionResult = await validator.verifyPermission(
      user.id,
      params.id,
      AgentPermission.AGENT_VIEW
    );

    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        { error: '权限不足', reason: permissionResult.reason },
        { status: 403 }
      );
    }

    // 执行实际操作
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (error: any) {
    console.error('API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
```

#### 2️⃣ 检查特定权限

```typescript
const validator = new PermissionValidator(supabase);

// 检查单个权限
if (!validator.hasPermission(user.role, AgentPermission.AGENT_CREATE)) {
  return NextResponse.json({ error: '无创建权限' }, { status: 403 });
}

// 检查多个权限（任意一个）
if (
  !validator.hasAnyPermission(user.role, [
    AgentPermission.AGENT_UPDATE,
    AgentPermission.AGENT_DELETE,
  ])
) {
  return NextResponse.json({ error: '无操作权限' }, { status: 403 });
}

// 检查多个权限（全部）
if (
  !validator.hasAllPermissions(user.role, [
    AgentPermission.AGENT_APPROVE,
    AgentPermission.AGENT_SHELF,
  ])
) {
  return NextResponse.json({ error: '无审核权限' }, { status: 403 });
}
```

#### 3️⃣ 检查管理员角色

```typescript
import { isAdmin, hasReviewPermission } from '@/lib/auth/permissions';

// 检查是否为管理员
if (!isAdmin(user.role)) {
  return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
}

// 检查是否有审核权限
if (!hasReviewPermission(user.role)) {
  return NextResponse.json({ error: '需要审核权限' }, { status: 403 });
}
```

---

## 📊 权限映射表

| 角色                  | 查看 | 创建 | 更新 | 删除 | 审核 | 上下架 | 执行 |
| --------------------- | ---- | ---- | ---- | ---- | ---- | ------ | ---- |
| **admin**             | ✅   | ✅   | ✅   | ✅   | ✅   | ✅     | ✅   |
| **marketplace_admin** | ✅   | ✅   | ✅   | ❌   | ✅   | ✅     | ✅   |
| **content_reviewer**  | ✅   | ❌   | ❌   | ❌   | ✅   | ❌     | ❌   |
| **owner**             | ✅   | ✅   | ✅   | ✅   | ❌   | ❌     | ✅   |
| **user**              | ✅   | ❌   | ❌   | ❌   | ❌   | ❌     | ✅   |

---

## 🔄 迁移现有代码

### 之前的分散实现

```typescript
// ❌ 旧代码：分散在各 API 文件中

// 示例 1: registry/route.ts
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return NextResponse.json({ error: '权限不足' }, { status: 403 });
}

// 示例 2: restore/route.ts
if (!profile || !['admin', 'marketplace_admin'].includes(profile.role)) {
  return NextResponse.json({ error: '权限不足' }, { status: 403 });
}

// 示例 3: invoke/route.ts
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (!adminUser) {
  return NextResponse.json({ error: '未授权' }, { status: 401 });
}
```

### 现在的统一实现

```typescript
// ✅ 新代码：使用统一的权限验证工具

import {
  PermissionValidator,
  AgentPermission,
  authenticateAndGetUser,
} from '@/lib/auth/permissions';

const validator = new PermissionValidator(supabase);

// 验证权限
const result = await validator.verifyPermission(
  user.id,
  agentId,
  AgentPermission.AGENT_CREATE
);

if (!result.hasPermission) {
  return NextResponse.json(
    { error: result.reason || '权限不足' },
    { status: 403 }
  );
}
```

---

## 🛡️ 安全最佳实践

### 1. 始终验证认证

```typescript
// ✅ 正确做法
const authResult = await authenticateAndGetUser(sessionCookie, supabase);
if (authResult.error) {
  return NextResponse.json({ error: authResult.error }, { status: 401 });
}
```

### 2. 最小权限原则

```typescript
// ✅ 只请求需要的权限
await validator.verifyPermission(userId, agentId, AgentPermission.AGENT_VIEW);

// ❌ 避免过度授权
await validator.verifyPermission(userId, agentId, AgentPermission.AGENT_ADMIN);
```

### 3. 记录权限验证失败

```typescript
const result = await validator.verifyPermission(userId, agentId, permission);

if (!result.hasPermission) {
  console.warn(`权限验证失败：用户 ${userId} 尝试访问 ${agentId}`, {
    role: user.role,
    requiredPermission: permission,
    reason: result.reason,
  });

  // 可选：记录到审计日志
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'permission_denied',
    details: { resource: agentId, permission },
  });
}
```

---

## 📝 完整示例

### 创建智能体API

```typescript
/**
 * POST /api/agents
 * 创建新的智能体
 */
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. 验证认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    const authResult = await authenticateAndGetUser(sessionCookie, supabase);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // 2. 验证创建权限
    const validator = new PermissionValidator(supabase);
    const permissionResult = await validator.verifyPermission(
      user.id,
      null, // 创建时还没有 agentId
      AgentPermission.AGENT_CREATE
    );

    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        { error: '权限不足', reason: permissionResult.reason },
        { status: 403 }
      );
    }

    // 3. 解析并验证请求体
    const body = await request.json();
    if (!body.name || !body.configuration) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 4. 创建智能体
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: body.name,
        description: body.description,
        configuration: body.configuration,
        category: body.category,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: '智能体创建成功',
        data: agent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('创建智能体失败:', error);
    return NextResponse.json(
      { error: '创建失败', details: error.message },
      { status: 500 }
    );
  }
}
```

### 审核智能体API

```typescript
/**
 * POST /api/admin/agents/:id/approve
 * 审核智能体（管理员专用）
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. 验证认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    const authResult = await authenticateAndGetUser(sessionCookie, supabase);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // 2. 验证审核权限
    const validator = new PermissionValidator(supabase);
    const permissionResult = await validator.verifyPermission(
      user.id,
      params.id,
      AgentPermission.AGENT_APPROVE
    );

    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        { error: '需要审核权限', reason: permissionResult.reason },
        { status: 403 }
      );
    }

    // 3. 解析请求体
    const body = await request.json();
    const { action, reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }

    // 4. 执行审核操作
    const updateData: any = {
      review_status: action === 'approve' ? 'approved' : 'rejected',
      review_comments: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    };

    if (action === 'approve') {
      updateData.shelf_status = 'on_shelf';
      updateData.on_shelf_at = new Date().toISOString();
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 5. 记录审计日志
    await supabase.from('agent_audit_logs').insert({
      agent_id: params.id,
      action_type: action === 'approve' ? 'approved' : 'rejected',
      performed_by: user.id,
      details: { reason },
    });

    return NextResponse.json({
      success: true,
      message: `智能体已${action === 'approve' ? '通过审核' : '拒绝'}`,
      data: agent,
    });
  } catch (error: any) {
    console.error('审核失败:', error);
    return NextResponse.json(
      { error: '审核失败', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## ✅ 验收标准

### 1. 所有 API 端点使用统一权限验证 ✓

- [x] GET /api/agents - 使用 `AGENT_VIEW`
- [x] POST /api/agents - 使用 `AGENT_CREATE`
- [x] PUT /api/agents/[id] - 使用 `AGENT_UPDATE`
- [x] DELETE /api/agents/[id] - 使用 `AGENT_DELETE`
- [x] POST /api/agents/[id]/restore - 使用 `AGENT_ADMIN`

### 2. 权限定义集中管理 ✓

- [x] 权限映射表集中在 `PERMISSIONS` 常量
- [x] 易于维护和扩展
- [x] 支持动态添加新权限

### 3. 权限验证错误返回统一格式 ✓

```typescript
{
  error: "权限不足",
  reason: "角色 user 没有 agent:create 权限"
}
```

### 4. 通过单元测试验证所有权限场景 ⏳

待后续补充单元测试

---

## 🚀 性能优化建议

### 1. 缓存用户信息

```typescript
// 使用内存缓存减少数据库查询
const userCache = new Map<string, UserInfo>();

async function getCachedUserInfo(userId: string): Promise<UserInfo | null> {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  const userInfo = await validator.getUserInfo(userId);
  if (userInfo) {
    userCache.set(userId, userInfo);
    // 5 分钟后清除缓存
    setTimeout(() => userCache.delete(userId), 5 * 60 * 1000);
  }

  return userInfo;
}
```

### 2. 批量权限验证

```typescript
// 批量验证多个权限（减少数据库往返）
const permissions = [AgentPermission.AGENT_VIEW, AgentPermission.AGENT_UPDATE];

const results = await Promise.all(
  permissions.map(perm => validator.verifyPermission(userId, agentId, perm))
);
```

---

## 📈 后续改进

1. **添加权限缓存层**（Redis）
2. **实现基于资源的权限验证**
3. **支持自定义权限策略**
4. **添加权限审计日志**
5. **实现权限继承机制**

---

## 🔗 相关文档

- [权限枚举定义](../../src/lib/auth/permissions.ts#L10-L24)
- [权限映射表](../../src/lib/auth/permissions.ts#L47-L92)
- [PermissionValidator 类](../../src/lib/auth/permissions.ts#L108-L300)

---

**实施状态**: ✅ 已完成
**测试状态**: ⏳ 待测试
**部署状态**: ⏳ 待部署

**最后更新**: 2026 年 3 月 24 日
