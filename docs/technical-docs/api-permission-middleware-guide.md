# API 权限验证中间件使用指南

**创建日期**: 2026-03-23
**版本**: v1.0.0
**状态**: ✅ 已完成

---

## 📋 概述

API 权限验证中间件为所有管理后台 API 路由提供统一的权限验证和租户隔离功能。

### 核心功能

- ✅ **身份验证** - 自动验证 JWT Token
- ✅ **权限检查** - 基于 RBAC 模型验证用户权限
- ✅ **租户隔离** - 自动注入租户 ID 到响应头
- ✅ **错误处理** - 标准化的错误响应格式
- ✅ **CORS 支持** - 自动处理跨域请求

---

## 🚀 快速开始

### 1. 基本使用

```typescript
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      // 你的业务逻辑
      return NextResponse.json({ data: [] });
    },
    'users_read'
  ); // 需要的权限标识
}
```

### 2. 不需要权限检查

```typescript
// 公开访问的 API（但仍需要认证）
export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(req, async () => {
    return NextResponse.json({ publicData: 'available' });
  }); // 不传权限参数，只验证登录
}
```

### 3. POST/PUT/DELETE方法

```typescript
// 创建资源（需要 users_create 权限）
export async function POST(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const body = await req.json();
      // 创建逻辑
      return NextResponse.json({ success: true });
    },
    'users_create'
  );
}

// 更新资源（需要 users_update 权限）
export async function PUT(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      // 更新逻辑
      return NextResponse.json({ success: true });
    },
    'users_update'
  );
}

// 删除资源（需要 users_delete 权限）
export async function DELETE(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      // 删除逻辑
      return NextResponse.json({ success: true });
    },
    'users_delete'
  );
}
```

---

## 📖 详细用法

### 中间件签名

```typescript
function apiPermissionMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>,
  requiredPermission?: string
): Promise<NextResponse>;
```

**参数说明**:

- `req` - Next.js 请求对象
- `next` - 下一个处理函数（你的业务逻辑）
- `requiredPermission` - 可选的权限标识，例如 `'users_read'`

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    /* 你的数据 */
  }
}
```

#### 未授权 (401)

```json
{
  "success": false,
  "error": "未授权访问",
  "code": "UNAUTHORIZED"
}
```

#### 权限不足 (403)

```json
{
  "success": false,
  "error": "权限不足",
  "code": "FORBIDDEN"
}
```

#### 服务器错误 (500)

```json
{
  "success": false,
  "error": "服务器内部错误",
  "code": "INTERNAL_ERROR"
}
```

---

## 🔧 高级功能

### 1. 获取当前用户信息

```typescript
import { getCurrentUser } from '@/tech/middleware/api-permission.middleware';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  console.log('当前用户:', {
    id: user.id,
    email: user.email,
    roles: user.roles,
    tenantId: user.tenantId,
  });

  // ...业务逻辑
}
```

### 2. 自定义错误处理

```typescript
export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      try {
        // 业务逻辑
      } catch (error) {
        // 自定义错误处理
        return NextResponse.json(
          {
            success: false,
            error: '自定义错误消息',
            details: error.message,
          },
          { status: 400 }
        );
      }
    },
    'resource_read'
  );
}
```

### 3. 多权限检查

```typescript
// 组合多个权限
const requiredPermissions = ['users_read', 'users_export'];

export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      // 中间件会检查任一权限
      // 如需检查所有权限，可在业务逻辑中自行处理
      return NextResponse.json({ data: [] });
    },
    requiredPermissions[0]
  ); // 传入第一个权限
}
```

---

## 🎯 权限标识规范

### 命名规则

```
{资源}_{操作}

示例:
- users_read      - 查看用户
- users_create    - 创建用户
- users_update    - 更新用户
- users_delete    - 删除用户
- shops_approve   - 审批店铺
- reports_export  - 导出报表
```

### 通配符支持

RBAC 配置支持通配符匹配：

```json
{
  "role_permissions": {
    "super_user": ["*_read", "users_*"]
  }
}
```

- `*_read` - 匹配所有读权限（users_read, orders_read, etc.）
- `users_*` - 匹配 users 相关的所有权限（users_read, users_write, etc.）

---

## 📝 完整示例

### 用户管理 API

```typescript
// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

// GET /api/admin/users
export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';

      let query = supabase.from('users').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`email.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: users, error, count } = await query.range(from, to);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    },
    'users_read'
  );
}

// POST /api/admin/users
export async function POST(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const body = await req.json();
      const { email, password, name, roles = ['user'] } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: '邮箱和密码为必填项' },
          { status: 400 }
        );
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 创建用户
      const { data: authData } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, roles },
      });

      // 创建档案
      const { data: profile } = await supabase
        .from('user_profiles')
        .insert({ user_id: authData.user.id, name })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        data: { user: authData.user, profile },
        message: '用户创建成功',
      });
    },
    'users_create'
  );
}
```

---

## 🧪 测试

### 单元测试

运行测试：

```bash
npm test -- api-permission.middleware
```

### 集成测试

使用提供的验证脚本：

```bash
# 启动开发服务器
npm run dev

# 在另一个终端运行测试
node scripts/verify-api-middleware.js
```

### Postman 测试

**请求示例**:

```
GET http://localhost:3000/api/admin/users
Authorization: Bearer YOUR_JWT_TOKEN
```

**预期响应**:

- 无 Token → 401 UNAUTHORIZED
- 无效 Token → 401 UNAUTHORIZED
- 有效 Token 但无权限 → 403 FORBIDDEN
- 有效 Token 且有权限 → 200 OK

---

## 🔐 安全最佳实践

### 1. 始终验证用户输入

```typescript
export async function POST(req: NextRequest) {
  return apiPermissionMiddleware(req, async () => {
    const body = await req.json();

    // 验证输入
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json({ error: '无效的邮箱格式' }, { status: 400 });
    }

    // ...业务逻辑
  });
}
```

### 2. 记录敏感操作

```typescript
export async function DELETE(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const user = await getCurrentUser(req);

      // 记录审计日志
      await logAuditEvent({
        userId: user!.id,
        action: 'DELETE_USER',
        timestamp: new Date().toISOString(),
      });

      // ...删除逻辑
    },
    'users_delete'
  );
}
```

### 3. 实施 Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(req, async () => {
    // 限流检查
    const limited = await rateLimit({
      limit: 100,
      windowMs: 60 * 1000, // 1 分钟
    });

    if (limited) {
      return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
    }

    // ...业务逻辑
  });
}
```

---

## 📊 性能优化

### 1. 缓存 RBAC 配置

中间件已自动实现 RBAC 配置缓存（TTL: 5 分钟），无需额外配置。

### 2. 减少数据库查询

```typescript
// 好的做法：批量查询
const { data } = await supabase.from('users').select('*').in('id', userIds);

// 避免的做法：循环查询
for (const id of userIds) {
  const { data } = await supabase.from('users').select('*').eq('id', id);
}
```

---

## ❓ 常见问题

### Q: 如何处理超级管理员权限？

A: 超级管理员 (`admin` 角色) 自动拥有所有权限，无需额外配置。

### Q: 如何在中间件中获取租户信息？

A: 使用 `getCurrentUser(req)` 函数，返回的用户信息包含 `tenantId` 字段。

### Q: 如何处理跨域请求？

A: 中间件自动添加 CORS 头，无需额外配置。

### Q: 如何禁用某个路由的权限检查？

A: 不传第三个参数即可：

```typescript
apiPermissionMiddleware(req, async () => {
  // 只验证登录，不检查具体权限
});
```

---

## 🔗 相关文档

- [RBAC 权限配置](../../config/rbac.json)
- [权限管理器文档](../../src/modules/common/permissions/core/permission-manager.ts)
- [数据权限过滤器](./data-permission.filter.md)
- [操作反馈组件](./operation-feedback.component.md)

---

## 📝 更新历史

| 版本   | 日期       | 更新内容 | 作者         |
| ------ | ---------- | -------- | ------------ |
| v1.0.0 | 2026-03-23 | 初始版本 | 专项优化小组 |

---

**文档状态**: ✅ 完成
**最后更新**: 2026-03-23
**维护者**: 后端开发团队
