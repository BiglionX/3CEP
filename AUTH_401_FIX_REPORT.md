# 401 认证错误排查与修复报告

## 问题描述

访问 `http://localhost:3001/admin/agents/execute` 时出现 401 Unauthorized 错误，`/api/session/me` 接口也返回 401。

## 根本原因分析

### 1. Cookie 名称生成逻辑

当前系统使用动态生成的 Cookie 名称：

- **Cookie 名称**: `sb-hrjqzbhqueleszkvnsen-auth-token`
- **生成逻辑**: `sb-{projectName}-auth-token`
- **项目名称来源**: 从 Supabase URL 的 hostname 提取

### 2. 可能的原因

#### 原因 1: 端口配置不一致 ✅ 已修复

- **问题**: `.env` 中 `NEXT_PUBLIC_SITE_URL` 配置为 `http://localhost:3000`
- **实际访问**: `http://localhost:3001`
- **影响**: Cookie 的 domain/path 可能不匹配
- **修复**: 已将 `NEXT_PUBLIC_SITE_URL` 更新为 `http://localhost:3001`

#### 原因 2: Cookie 未正确设置

**检查步骤**:

1. 打开浏览器开发者工具
2. 进入 Application → Cookies → http://localhost:3001
3. 查找是否存在 `sb-hrjqzbhqueleszkvnsen-auth-token`
4. 如果不存在，说明登录时 Cookie 未正确设置

#### 原因 3: Cookie 名称不匹配

**检查步骤**:

1. 在浏览器控制台运行:

```javascript
// 检查所有 cookie
document.cookie.split(';').forEach(cookie => {
  console.log(cookie.trim());
});

// 检查 localStorage
console.log('localStorage keys:', Object.keys(localStorage));
```

2. 查看是否有以下名称之一:
   - `sb-hrjqzbhqueleszkvnsen-auth-token` (正确)
   - `sb-access-token` (旧版本)
   - `mock-token` (测试用)

#### 原因 4: Session 过期

**检查步骤**:

1. 在浏览器控制台运行:

```javascript
const cookie = document.cookie.match(
  /sb-hrjqzbhqueleszkvnsen-auth-token=([^;]+)/
);
if (cookie) {
  const sessionData = JSON.parse(decodeURIComponent(cookie[1]));
  console.log('Access Token:', sessionData.access_token);
  console.log('Expires At:', new Date(sessionData.expires_at * 1000));
  console.log('是否过期:', Date.now() > sessionData.expires_at * 1000);
}
```

## 解决方案

### 方案 1: 清除旧 Cookie 并重新登录（推荐）

**步骤**:

1. 打开浏览器开发者工具
2. Application → Cookies → 删除所有 `localhost:3001` 的 cookie
3. LocalStorage → 删除所有相关数据
4. 刷新页面
5. 重新登录

### 方案 2: 手动设置正确的 Cookie（调试用）

在浏览器控制台运行:

```javascript
// 导入 cookie 工具函数
const projectName = 'hrjqzbhqueleszkvnsen';
const cookieName = `sb-${projectName}-auth-token`;

// 从 localStorage 获取 token（如果有）
const storedToken = localStorage.getItem('sb-access-token');
if (storedToken) {
  document.cookie = `${cookieName}=${encodeURIComponent(storedToken)}; path=/; max-age=86400`;
  console.log('✅ Cookie 已设置:', cookieName);
} else {
  console.log('❌ localStorage 中没有找到 token');
}
```

### 方案 3: 修改代码使用固定 Cookie 名称（备选）

如果动态 Cookie 名称导致问题，可以修改为固定名称：

**修改文件**: `/src/lib/utils/cookie-utils.ts`

```typescript
export function getAuthCookieName(supabaseUrl?: string): string {
  // 使用固定名称，避免动态生成导致的不一致
  return 'sb-access-token';
}
```

**优点**:

- 简单直接
- 避免项目名称提取错误
- 与旧版本兼容

**缺点**:

- 如果同一域名下有多个项目会冲突

### 方案 4: 添加 Cookie 兼容性支持

同时支持新旧两种 Cookie 名称：

**修改文件**: `/src/app/api/session/me/route.ts`

```typescript
// 尝试多种 Cookie 名称
const cookieNames = [
  getAuthCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL), // 新名称
  'sb-access-token', // 旧名称
  'sb-procyc-auth-token', // 可能的其他名称
];

let sessionCookie = null;
for (const name of cookieNames) {
  sessionCookie = cookieStore.get(name);
  if (sessionCookie?.value) {
    console.log('[Session API] 找到 Cookie:', name);
    break;
  }
}
```

## 验证步骤

### 1. 检查 Cookie 是否正确设置

```bash
# 重启开发服务器
npm run dev

# 访问登录页面
http://localhost:3001/login

# 登录后检查 cookie
# 开发者工具 → Application → Cookies
# 应该看到：sb-hrjqzbhqueleszkvnsen-auth-token
```

### 2. 测试 /api/session/me 接口

```bash
# 在浏览器控制台
fetch('/api/session/me', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log('Session data:', data))
.catch(err => console.error('Error:', err));
```

### 3. 访问管理页面

```
http://localhost:3001/admin/agents/execute
```

## 常见问题

### Q1: 为什么 Cookie 名称要动态生成？

**A**:

- Supabase 默认使用动态 Cookie 名称避免多项目冲突
- 格式：`sb-{projectName}-auth-token`
- 项目名称从 Supabase URL 自动提取

### Q2: 可以使用固定的 Cookie 名称吗？

**A**:
可以！修改 `/src/lib/utils/cookie-utils.ts`:

```typescript
export function getAuthCookieName(): string {
  return 'sb-access-token'; // 固定名称
}
```

### Q3: 为什么设置了 Cookie 还是 401？

**A**: 可能的原因:

1. Cookie 名称不匹配
2. Cookie 的 domain/path 设置不正确
3. Token 已过期
4. Supabase 认证状态不同步

### Q4: 如何处理 Token 过期？

**A**:

```typescript
// 在 AuthProvider 中添加 token 刷新逻辑
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Token 刷新失败:', error);
    // 跳转到登录页
    window.location.href = '/login';
  }
  return data.session;
};
```

## 下一步行动

1. ✅ **已完成**: 更新 `.env` 中的 `NEXT_PUBLIC_SITE_URL` 为 `http://localhost:3001`
2. **建议执行**: 清除浏览器所有相关 Cookie 和 LocalStorage
3. **建议执行**: 重新登录并验证 Cookie 是否正确设置
4. **如仍存在问题**: 考虑使用固定 Cookie 名称方案

## 联系支持

如果以上方案都无法解决问题，请提供以下信息:

1. 浏览器 Console 中的所有错误信息
2. Application → Cookies 的完整列表
3. LocalStorage 中的所有键值对
4. `/api/session/me` 接口的完整响应内容
