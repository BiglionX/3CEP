# 🎉 数据库迁移完成 - 下一步开发指南

## ✅ 已完成的数据库迁移

恭喜！所有数据库迁移文件已成功执行。现在系统具备以下能力：

### 📊 数据结构（16 个表 + 3 个视图）

#### 核心业务表

1. **profiles** - 用户资料与角色管理
2. **agents** - 智能体信息（含审核、上下架、统计字段）
3. **skills** - Skill 信息
4. **agent_categories** - 智能体分类（8 个默认分类）
5. **skill_categories** - Skill 分类
6. **skill_versions** - Skill 版本管理

#### 订单与评价

7. **agent_orders** - 智能体订单
8. **agent_reviews** - 智能体评价
9. **skill_orders** - Skill 订单
10. **skill_reviews** - Skill 评价

#### 审核与日志

11. **agent_audit_logs** - 智能体审核日志
12. **skill_audit_logs** - Skill 审核日志

#### 权限管理

13. **role_permissions_map** - 角色权限映射（新增）
14. **menu_permissions** - 菜单权限配置
15. **api_route_permissions** - API 路由权限映射

#### 统计视图

1. **user_roles_view** - 用户角色视图
2. **agent_daily_stats** - 智能体每日销售统计
3. **skill_daily_stats** - Skill 每日销售统计

---

## 🚀 下一步开发任务

### 阶段一：API 端点开发（优先级：高）

#### 1️⃣ 完善剩余的管理 API

**已有 API**:

- ✅ `/api/admin/agent-store/list` - 智能体列表
- ✅ `/api/admin/agent-store/approve` - 智能体审核
- ✅ `/api/admin/agent-store/toggle-status` - 上下架切换
- ✅ `/api/admin/agent-store/statistics` - 统计数据

**需要创建**:

```
📁 /api/admin/skill-store/
  ├── list.ts              - Skill 列表查询
  ├── approve.ts           - Skill 审核
  ├── toggle-status.ts     - 上下架切换
  └── statistics.ts        - 统计数据

📁 /api/admin/marketplace/
  ├── overview.ts          - 市场概览
  ├── revenue-stats.ts     - 收入统计
  └── developer-stats.ts   - 开发者统计

📁 /api/admin/developers/
  ├── list.ts              - 开发者列表
  └── manage.ts            - 开发者管理
```

**实现示例** (`/api/admin/skill-store/list/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (!user || !['admin', 'marketplace_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const reviewStatus = searchParams.get('reviewStatus') || '';

    // 构建查询
    let query = supabase
      .from('skills')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 筛选条件
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (reviewStatus) {
      query = query.eq('review_status', reviewStatus);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Skill 列表查询失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
```

---

### 阶段二：前端管理页面开发（优先级：高）

#### 2️⃣ 创建智能体商店管理页面

**文件结构**:

```
📁 src/app/admin/agent-store/
├── page.tsx               - 智能体列表页（主页面）
├── [id]/
│   └── page.tsx          - 智能体详情页
└── components/
    ├── AgentList.tsx      - 智能体列表组件
    ├── AgentFilters.tsx   - 筛选组件
    ├── AgentTable.tsx     - 表格组件
    ├── ReviewDialog.tsx   - 审核对话框
    └── StatusSwitch.tsx   - 上下架开关
```

**主要功能**:

- ✅ 智能体列表展示（支持搜索、筛选、分页）
- ✅ 审核操作（通过/驳回）
- ✅ 上下架切换
- ✅ 查看详情
- ✅ 数据统计卡片

**实现要点**:

```tsx
// src/app/admin/agent-store/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AgentList } from './components/AgentList';
import { AgentFilters } from './components/AgentFilters';
import { StatsCards } from '@/components/admin/StatsCards';

export default function AgentStorePage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    reviewStatus: '',
    shelfStatus: '',
  });

  const handleApprove = async (
    agentId: string,
    action: 'approve' | 'reject'
  ) => {
    // 调用审核 API
  };

  const handleToggleStatus = async (agentId: string) => {
    // 调用上下架 API
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">智能体商店管理</h1>

      {/* 统计卡片 */}
      <StatsCards />

      {/* 筛选器 */}
      <AgentFilters filters={filters} onChange={setFilters} />

      {/* 列表 */}
      <AgentList
        filters={filters}
        onApprove={handleApprove}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
```

#### 3️⃣ 创建 Skill 商店管理页面

**状态**: ✅ 已完成

**文件路径**: `src/app/admin/skill-store/page.tsx`

---

#### 4️⃣ 创建市场运营管理仪表盘

**状态**: ✅ 已完成

**文件路径**: `src/app/admin/marketplace/page.tsx`

**主要功能**:

- ✅ 统计卡片（总收入、总订单数、活跃开发者数等）
- ✅ 月度收入趋势图表
- ✅ 顶级开发者排行榜
- ✅ 完整的权限控制

---

#### 5️⃣ 创建开发者管理页面

**状态**: ✅ 已完成

**文件路径**: `src/app/admin/developers/page.tsx`

**主要功能**:

- ✅ 统计卡片（总开发者数、活跃/不活跃/已停用开发者）
- ✅ 多功能筛选器（搜索、状态、排序）
- ✅ 开发者列表表格（含头像、产品信息、收入等）
- ✅ 状态切换功能（激活/停用）
- ✅ 分页导航

---

### 阶段三：侧边栏菜单集成（优先级：中）

#### 4️⃣ 更新 RoleAwareSidebar 组件

**文件**: `src/components/layout/RoleAwareSidebar.tsx`

**添加菜单项**:

```typescript
const menuItems = [
  // ... 现有菜单

  // 新增：商店管理模块
  {
    id: 'store-management',
    name: '商店管理',
    icon: 'Store',
    roles: ['admin', 'marketplace_admin'],
    children: [
      {
        id: 'agent-store-manage',
        name: '智能体商店',
        path: '/admin/agent-store',
        icon: 'ShoppingBag',
        roles: ['admin', 'marketplace_admin'],
      },
      {
        id: 'skill-store-manage',
        name: 'Skill 商店',
        path: '/admin/skill-store',
        icon: 'Zap',
        roles: ['admin', 'marketplace_admin'],
      },
      {
        id: 'marketplace-operate',
        name: '市场运营',
        path: '/admin/marketplace',
        icon: 'TrendingUp',
        roles: ['admin', 'marketplace_admin'],
      },
      {
        id: 'developer-manage',
        name: '开发者管理',
        path: '/admin/developers',
        icon: 'Users',
        roles: ['admin', 'marketplace_admin'],
      },
    ],
  },

  // 店铺审核员菜单
  {
    id: 'shop-pending-review',
    name: '待审核店铺',
    icon: 'ClipboardList',
    path: '/admin/shops/pending',
    roles: ['shop_reviewer'],
  },
];
```

---

### 阶段四：权限控制集成（优先级：中）

#### 5️⃣ 实现基于角色的访问控制

**中间件权限检查** (`src/middleware.ts`):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 获取用户角色（从 cookie 或 token）
  const userRole = getUserRoleFromCookie(request);

  // 检查 API 路由权限
  if (pathname.startsWith('/api/admin/')) {
    const requiredRole = getRequiredRoleForRoute(pathname);
    if (requiredRole && !hasPermission(userRole, requiredRole)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }
  }

  // 检查页面访问权限
  if (pathname.startsWith('/admin/')) {
    const allowedRoles = getAllowedRolesForPage(pathname);
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}
```

**权限工具函数** (`src/lib/permissions.ts`):

```typescript
export function hasPermission(userRole: string, requiredRole: string): boolean {
  // admin 拥有所有权限
  if (userRole === 'admin') return true;

  // marketplace_admin 有市场相关权限
  if (userRole === 'marketplace_admin') {
    return ['marketplace_admin', 'viewer'].includes(requiredRole);
  }

  // shop_reviewer 有审核权限
  if (userRole === 'shop_reviewer') {
    return ['shop_reviewer', 'viewer'].includes(requiredRole);
  }

  return userRole === requiredRole;
}
```

---

### 阶段五：测试与优化（优先级：低）

#### 6️⃣ 端到端测试

使用 Playwright 进行测试：

```typescript
// tests/e2e/admin-agent-store.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Agent Store Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录为管理员
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should display agent store management page', async ({ page }) => {
    await page.goto('/admin/agent-store');
    await expect(page.locator('h1')).toContainText('智能体商店管理');
  });

  test('should approve an agent', async ({ page }) => {
    await page.goto('/admin/agent-store');
    // 执行审核操作
    // ...
  });
});
```

---

## 📋 推荐开发顺序

### 第 1 周：API 开发（✅ 已完成）

- [x] 创建 Skill 商店管理 API（4 个端点）
- [x] 创建市场运营管理 API（3 个端点）
- [x] 创建开发者管理 API（3 个端点）
- [ ] 编写 API 文档

### 第 2 周：前端页面开发（✅ 已完成）

- [x] 智能体商店管理页面（主页面 + 组件）
- [x] Skill 商店管理页面（复用组件）
- [x] 市场运营仪表盘
- [x] 开发者管理页面

### 第 3 周：集成与测试

- [x] 更新侧边栏菜单
- [ ] 实现权限控制中间件
- [ ] 端到端测试
- [ ] 性能优化

---

## 🔗 相关文档

- [API 设计规范](./docs/API_DESIGN.md)
- [前端组件规范](./docs/COMPONENT_GUIDE.md)
- [权限控制指南](./docs/PERMISSIONS.md)
- [测试规范](./docs/TESTING.md)

---

**状态**: ✅ 数据库迁移完成 | ✅ 管理页面开发完成
**已完成**:

- 智能体商店管理页面
- Skill 商店管理页面
- 市场运营管理仪表盘
- 开发者管理页面
- 侧边栏菜单集成
- 相关 API 端点

**下一步**: 端到端测试与性能优化
**剩余工作**: 权限控制中间件、E2E 测试、性能优化
