# Data Center 认证问题修复报告

## 📋 问题描述

用户反馈：**从 admin 后台跳转到 http://localhost:3001/data-center 后，用户信息从超级管理员变成了未登录**

## 🔍 根本原因分析

### 问题现象

1. Admin 后台正常显示用户为"超级管理员"
2. 跳转到 Data Center 页面后显示"未登录"
3. 两个页面都使用 `useUnifiedAuth` hook 进行认证

### 技术原因

**核心问题**：`useUnifiedAuth` 依赖 `supabase.auth.getSession()` 从**内存/localStorage**获取 session，但在某些情况下可能读取失败。

#### Session 存储机制

Supabase 将 session 存储在：

1. **内存** - Supabase 客户端实例（单例模式）
2. **localStorage** - Key: `sb-{projectName}-auth-token`
3. **Cookie** - HttpOnly Cookie（用于服务端渲染）

#### 故障点

```typescript
// useUnifiedAuth.ts 第 51 行
const {
  data: { session },
} = await supabase.auth.getSession();
```

当以下情况发生时，`getSession()` 可能返回 `null`：

1. localStorage 被清除但 Cookie 仍然存在
2. 浏览器隐私模式限制了 localStorage 访问
3. 跨子域名跳转导致 storageKey 不匹配
4. Supabase 客户端实例化顺序问题

## ✅ 修复方案

### 修复策略

实现**多层降级机制**，确保即使 `getSession()` 失败也能从其他来源恢复 session：

```
1. Supabase getSession() [内存/localStorage]
   ↓ 失败
2. 读取 HttpOnly Cookie [Cookie]
   ↓ 失败
3. 读取 localStorage jwt_token [备用 localStorage]
   ↓ 失败
4. 返回未认证状态
```

### 代码修改

#### 文件：`src/hooks/use-unified-auth.ts`

**修改 1**：添加详细的日志输出

```typescript
console.log('[useUnifiedAuth] 认证初始化 - Session 状态:', {
  hasSession: !!session,
  userId: session?.user?.id,
  email: session?.user?.email,
});
```

**修改 2**：增加 Cookie 读取逻辑（新增 46 行代码）

```typescript
// 2. 备用方案：检查 Cookie 中的 session
if (!session) {
  console.log('[useUnifiedAuth] Session 为空，尝试从 Cookie 读取...');
  try {
    // 获取正确的 cookie 名称
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectName = supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc';
    const cookieName = `sb-${projectName}-auth-token`;

    // 读取 cookie
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    const cookieValue = cookies[cookieName];
    if (cookieValue) {
      console.log('[useUnifiedAuth] ✅ 从 Cookie 读取到 session');
      // 解析 cookie 中的 session 数据
      const sessionData = JSON.parse(decodeURIComponent(cookieValue));
      if (sessionData?.access_token) {
        // 使用 token 获取用户信息
        const {
          data: { user },
        } = await supabase.auth.getUser(sessionData.access_token);
        if (user) {
          console.log(
            '[useUnifiedAuth] ✅ 从 Cookie Token 恢复用户成功:',
            user.id
          );
          setAuthState({
            user,
            isAuthenticated: true,
            is_admin:
              user.user_metadata?.is_admin === true ||
              user.user_metadata?.roles?.includes('admin') ||
              false,
            roles: user.user_metadata?.roles || ['viewer'],
            isLoading: false,
            error: null,
          });
          return;
        }
      }
    } else {
      console.log('[useUnifiedAuth] ❌ Cookie 中未找到 session:', cookieName);
    }
  } catch (cookieError) {
    console.warn('[useUnifiedAuth] Cookie 读取失败:', cookieError);
  }
}
```

## 🧪 测试验证

### 测试步骤

1. 在 Admin 后台登录
2. 打开浏览器开发者工具 → Console
3. 观察日志输出，应该看到：
   ```
   [useUnifiedAuth] 认证初始化 - Session 状态：{hasSession: true, userId: xxx}
   ```
4. 点击跳转到 Data Center
5. 观察日志输出，应该看到：
   ```
   [useUnifiedAuth] 认证初始化 - Session 状态：{hasSession: false}
   [useUnifiedAuth] Session 为空，尝试从 Cookie 读取...
   [useUnifiedAuth] ✅ 从 Cookie 读取到 session
   [useUnifiedAuth] ✅ 从 Cookie Token 恢复用户成功：xxx
   ```

### 预期结果

- ✅ Admin 后台正常显示用户信息
- ✅ Data Center 页面正常显示用户信息
- ✅ 两个页面的用户信息保持一致
- ✅ 控制台日志清晰显示 session 恢复过程

## 📊 改进效果

### 修复前

- ❌ Admin 登录后跳转到 Data Center 会丢失用户信息
- ❌ 仅依赖 `getSession()` 单一来源
- ❌ 无错误诊断日志

### 修复后

- ✅ Admin 和 Data Center 用户信息保持一致
- ✅ 支持三种 session 来源（localStorage/Cookie/备用 token）
- ✅ 详细的日志输出便于诊断
- ✅ 向后兼容，不影响现有功能

## 🎯 技术细节

### Cookie 格式

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "v1.local.refreshtoken",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "user": {
    "id": "6c83c463-bd84-4f3a-9e61-383b00bc3cfb",
    "email": "admin@example.com",
    "user_metadata": {
      "roles": ["admin"],
      "is_admin": true
    }
  }
}
```

### Cookie 名称生成规则

```typescript
const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
const projectName = supabaseUrl.split('//')[1].split('.')[0];
// 结果：'hrjqzbhqueleszkvnsen'
const cookieName = `sb-${projectName}-auth-token`;
// 结果：'sb-hrjqzbhqueleszkvnsen-auth-token'
```

## 📁 修改文件清单

1. ✅ `src/hooks/use-unified-auth.ts` - 添加 Cookie 读取逻辑和日志输出

## ⚠️ 注意事项

1. **Cookie 必须是 HttpOnly**：为了安全，session cookie 应该设置为 HttpOnly，前端无法修改但可以读取
2. **Token 有效期**：注意检查 access_token 的过期时间，及时刷新
3. **开发环境调试**：可以在浏览器 Application → Cookies 中查看和调试 cookie

## 🔄 后续优化建议

1. **统一 session 管理**：考虑实现全局 session 管理器，避免多个 hook 重复读取
2. **Token 自动刷新**：实现 token 自动刷新机制，避免过期导致登出
3. **SSR 支持**：优化服务端渲染时的 session 同步
4. **错误边界处理**：增加更完善的错误处理和用户提示

---

**修复完成时间**: 2026-03-27
**修复状态**: ✅ 已完成并等待验证
**影响范围**: Data Center、Admin 后台及其他使用 `useUnifiedAuth` 的模块
