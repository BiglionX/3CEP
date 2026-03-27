# DataCenter 用户卡片显示修复

## 📋 问题描述

**现象**：虽然 `/api/session/me` 接口成功返回用户信息，但 Data Center 页面的用户卡片仍然显示"未登录用户"。

**终端日志**：

```
[Session API] ✅ 从 Authorization Header 获取到 token
[Session API] Supabase auth.getUser result: {
  hasUser: true,
  error: undefined,
  userId: '6c83c463-bd84-4f3a-9e61-383b00bc3cfb'
}
GET /api/session/me 200 in 796ms
```

## 🔍 根本原因

### 问题分析

在 [`src/components/data-center/DataCenterUserMenu.tsx`](d:\BigLionX\3cep\src\components\data-center\DataCenterUserMenu.tsx) 中：

**修改前**（第 23-45 行）：

```typescript
interface DataCenterUserMenuProps {
  userEmail?: string;  // ❌ 依赖外部传入的 prop
}

export function DataCenterUserMenu({ userEmail }: DataCenterUserMenuProps) {
  // ...组件逻辑
  return (
    <span>{userEmail || '未登录用户'}</span>  // ❌ userEmail 是 undefined
  );
}
```

**使用方式**（在 `DataCenterLayout.tsx` 第 78 行）：

```tsx
<DataCenterUserMenu /> // ❌ 没有传递 userEmail prop
```

### 核心问题

1. **组件设计问题**：`DataCenterUserMenu` 被设计为接收 `userEmail` prop，但实际上从未有人传递这个值
2. **认证状态不同步**：组件自身不获取用户信息，完全依赖外部传入
3. **缺少降级处理**：当 `userEmail` 为 `undefined` 时，显示"未登录用户"

## ✅ 修复方案

### 修改文件

`src/components/data-center/DataCenterUserMenu.tsx`

### 修改内容

#### 1. 添加 `useUnifiedAuth` Hook 导入

```typescript
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
```

#### 2. 移除 Props 接口，改为内部获取用户信息

```typescript
// ❌ 修改前 - 依赖外部 prop
interface DataCenterUserMenuProps {
  userEmail?: string;
}

export function DataCenterUserMenu({ userEmail }: DataCenterUserMenuProps) {
  // ...
}

// ✅ 修改后 - 自己获取用户信息
export function DataCenterUserMenu() {
  const { user } = useUnifiedAuth();
  const userEmail = user?.email || undefined;
  // ...
}
```

### 完整代码对比

**修改前**（部分）：

```typescript
interface DataCenterUserMenuProps {
  userEmail?: string;
}

export function DataCenterUserMenu({ userEmail }: DataCenterUserMenuProps) {
  const router = useRouter();
  const { hasPermission, roles } = useRbacPermission() as unknown as RbacPermissionResult;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <User className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">
            {userEmail || '用户'}  // ❌ userEmail 永远是 undefined
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-medium truncate">
            {userEmail || '未登录用户'}  // ❌ 显示"未登录用户"
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**修改后**（部分）：

```typescript
export function DataCenterUserMenu() {
  const router = useRouter();
  const { user } = useUnifiedAuth();  // ✅ 自己获取用户信息
  const { hasPermission, roles } = useRbacPermission() as unknown as RbacPermissionResult;
  const [isOpen, setIsOpen] = useState(false);

  // ✅ 从 user 对象提取 email
  const userEmail = user?.email || undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <User className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">
            {userEmail || '用户'}  // ✅ 显示真实邮箱
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-medium truncate">
            {userEmail || '未登录用户'}  // ✅ 显示真实邮箱或"未登录用户"
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 🧪 测试验证

### 修复前

- ❌ 用户卡片显示："未登录用户"
- ❌ 即使 `/api/session/me` 返回 200 且包含正确的用户信息
- ❌ 控制台无错误，但 UI 显示不正确

### 修复后

- ✅ 用户卡片显示真实的邮箱地址：`1055603323@qq.com`
- ✅ 管理员角色正确显示："系统管理员"
- ✅ 管理后台入口正确显示（仅管理员可见）
- ✅ 所有功能正常工作

## 📊 影响范围

### 受影响的功能

1. ✅ Data Center 用户菜单显示
2. ✅ 用户角色标识（管理员/普通用户）
3. ✅ 基于角色的菜单项显示/隐藏

### 相关文件

- `src/components/data-center/DataCenterUserMenu.tsx` - 已修复
- `src/hooks/use-unified-auth.ts` - 提供用户信息
- `src/app/data-center/layout.tsx` - 使用用户菜单组件

## 🎯 技术要点

### 为什么选择 `useUnifiedAuth`

项目中存在两种认证方式：

1. **`useUnifiedAuth`** - 统一认证 Hook
   - ✅ 支持多种认证来源（Supabase/Cookie/LocalStorage）
   - ✅ 自动缓存和状态管理
   - ✅ Admin 和 Data Center 都使用此 Hook
   - ✅ 推荐使用

2. **`AuthProvider` + `useUser`** - Context 方式
   - ❌ 需要 Provider 包裹
   - ❌ 可能存在上下文缺失问题
   - ⚠️ 之前出现过 `getSession is not a function` 错误

### 最佳实践

**组件获取用户信息的推荐方式**：

```typescript
// ✅ 推荐：直接使用 Hook
export function UserProfile() {
  const { user, isAuthenticated } = useUnifiedAuth();

  if (!isAuthenticated) {
    return <div>未登录</div>;
  }

  return <div>{user.email}</div>;
}

// ❌ 不推荐：依赖 Props 传递
export function UserProfile({ userEmail }: Props) {
  // 如果父组件忘记传递 userEmail，就会显示错误
  return <div>{userEmail || '未登录'}</div>;
}
```

## ⚠️ 注意事项

1. **确保 Hook 在 Client Component 中使用**
   - `useUnifiedAuth` 包含 `'use client'` 指令
   - 只能在客户端组件中使用

2. **处理加载中状态**
   - 认证信息可能需要异步加载
   - 建议在加载完成前显示 loading 状态

3. **避免重复获取**
   - `useUnifiedAuth` 内部有状态管理
   - 多个组件使用同一个 Hook 不会导致重复请求

---

**修复完成时间**: 2026-03-27
**修复状态**: ✅ 已完成并验证
**严重程度**: 🟡 中（影响用户体验但不影响功能）
**修复难度**: 🟢 简单（单组件修改）
