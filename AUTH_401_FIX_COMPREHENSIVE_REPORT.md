# 🔧 认证 401 错误综合修复报告

## 📋 问题描述

**错误现象**:

```
GET http://localhost:3001/api/session/me 401 (Unauthorized)
GET http://localhost:3001/api/admin/dashboard/stats 401 (Unauthorized)
```

**影响范围**:

- 所有管理页面无法加载用户信息
- Dashboard 统计数据无法获取
- 权限验证失败

---

## 🔍 根本原因

### 问题 1: Cookie 名称不匹配

**原代码**:

```typescript
// src/app/api/session/me/route.ts
const cookieStore = cookies(); // ❌ 缺少 await
// 未指定 cookie 名称，使用默认名称
```

**实际情况**:

- 前端设置的 cookie 名称：`sb-procyc-auth-token`
- API 尝试读取的 cookie：默认名称（不匹配）

### 问题 2: Cookie 解析逻辑缺失

**原代码问题**:

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
// ❌ getSession() 在 Server Component 中可能无法正确读取 cookie
```

**正确方式**:

```typescript
// ✅ 手动从 cookie 读取并解析 token
const sessionCookie = cookieStore.get(cookieName);
const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
const accessToken = sessionData.access_token;
```

---

## ✅ 已完成修复

### 修复 1: `/api/session/me/route.ts`

**文件位置**: `src/app/api/session/me/route.ts`

**修改内容**:

#### 1. 添加 await 到 cookies()

```typescript
// 修复前
const cookieStore = cookies();

// 修复后
const cookieStore = await cookies();
```

#### 2. 动态计算 cookie 名称

```typescript
// 新增代码
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectName = supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc';
const cookieName = `sb-${projectName}-auth-token`;
```

#### 3. 手动解析 cookie 获取 token

```typescript
// 新增代码
const sessionCookie = cookieStore.get(cookieName);
if (!sessionCookie?.value) {
  console.warn('[Session API] Cookie 不存在:', cookieName);
  return NextResponse.json({...}, { status: 401 });
}

let accessToken: string | null = null;
try {
  const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
  accessToken = sessionData.access_token;
} catch (parseError) {
  console.warn('[Session API] Cookie 解析失败');
  return NextResponse.json({...}, { status: 401 });
}
```

#### 4. 使用 token 获取用户信息

```typescript
// 修复前
const {
  data: { session },
} = await supabase.auth.getSession();
if (!session) return error;

// 修复后
const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser(accessToken);
if (userError || !user) return error;
```

#### 5. 增强错误日志

```typescript
console.warn('[Session API] Cookie 不存在:', cookieName);
console.warn('[Session API] Cookie 解析失败');
console.warn('[Session API] Token 无效:', userError?.message);
```

---

### 修复 2: 管理页面错误处理

**已修复文件**:

- `src/app/admin/marketplace/page.tsx`
- `src/app/admin/developers/page.tsx`

**修改内容**:

```typescript
// 新增 401/403 错误处理
if (response.status === 401 || response.status === 403) {
  console.warn('权限不足，请重新登录');
  return;
}
```

**新增延迟机制**:

```typescript
useEffect(() => {
  if (!isLoading && isAuthenticated && is_admin) {
    const timer = setTimeout(() => {
      loadStats();
    }, 500);
    return () => clearTimeout(timer);
  }
}, [isLoading, isAuthenticated, is_admin]);
```

---

## 📊 修复对比

| 项目           | 修复前 ❌      | 修复后 ✅            |
| -------------- | -------------- | -------------------- |
| cookies() 调用 | 缺少 await     | 正确使用 await       |
| cookie 名称    | 默认（不匹配） | 动态计算（匹配）     |
| token 获取     | getSession()   | 手动解析 + getUser() |
| 错误日志       | 无             | 详细的警告日志       |
| 错误处理       | 无             | 完善的 401/403 处理  |
| API 调用时机   | 立即调用       | 延迟 500ms           |

---

## 🧪 验证步骤

### 步骤 1: 清除浏览器缓存

```
按 F12 → Application → Storage → Clear site data
或 Ctrl+Shift+Delete 清除所有缓存
```

### 步骤 2: 重新登录

```
1. 访问：http://localhost:3001/login
2. 输入账号密码
   - 邮箱：admin@example.com
   - 密码：password
3. 点击登录
```

### 步骤 3: 检查 Cookie

```javascript
// 在浏览器控制台执行
document.cookie;
// 应该看到 sb-procyc-auth-token=...
```

### 步骤 4: 测试 Session API

```javascript
// 在浏览器控制台执行
fetch('/api/session/me')
  .then(r => r.json())
  .then(d => console.log('Session:', d));
// 应该返回用户信息，isAuthenticated: true
```

### 步骤 5: 访问管理页面

```
1. http://localhost:3001/admin/marketplace
2. http://localhost:3001/admin/developers
3. http://localhost:3001/admin/dashboard
```

### 步骤 6: 检查控制台

```
应该看到:
✅ 无 401 错误
✅ 无 403 错误
✅ Session API 返回用户信息
✅ 统计数据正常显示
```

---

## 🔍 调试技巧

### 检查 Cookie 是否设置成功

```javascript
// Chrome DevTools → Application → Cookies → /
// 查看是否有以下 cookie:
// - sb-procyc-auth-token
// - sb-refresh-token
```

### 检查 API 响应

```javascript
// Network 标签
1. 找到 /api/session/me 请求
2. 查看 Response
3. 应该包含 user 信息和 isAuthenticated: true
```

### 检查认证状态

```javascript
// 在页面控制台执行
fetch('/api/session/me').then(async r => {
  console.log('Status:', r.status);
  const data = await r.json();
  console.log('Data:', data);
});
```

---

## 🐛 可能的其他问题

### 问题 1: Supabase URL 配置错误

**症状**:

```
[Session API] Cookie 不存在：sb-undefined-auth-token
```

**解决**:

```bash
# 检查 .env.local
cat .env.local | grep SUPABASE

# 确保包含:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### 问题 2: Cookie 未设置

**症状**:

```
[Session API] Cookie 不存在：sb-procyc-auth-token
```

**解决**:

```
1. 退出登录
2. 清除浏览器缓存
3. 重新登录
4. 检查 Network 标签中登录 API 的响应头
   - 应该包含 Set-Cookie: sb-procyc-auth-token=...
```

### 问题 3: Token 过期

**症状**:

```
[Session API] Token 无效：Invalid JWT
```

**解决**:

```
1. 退出登录
2. 清除缓存
3. 重新登录获取新 token
```

### 问题 4: 开发环境热重载导致 cookie 丢失

**症状**:

```
登录后刷新页面又回到登录页
```

**解决**:

```typescript
// 在 AuthProvider 中添加重试机制
const loadUserInfo = async () => {
  try {
    const response = await fetch('/api/session/me', {
      credentials: 'same-origin', // 确保发送 cookie
    });
    // ...
  } catch (error) {
    // 重试逻辑
    setTimeout(() => loadUserInfo(), 1000);
  }
};
```

---

## 📈 性能优化建议

### 1. 添加缓存机制

```typescript
// 使用 React Query 缓存用户信息
import { useQuery } from '@tanstack/react-query';

const { data: session } = useQuery({
  queryKey: ['session'],
  queryFn: () => fetch('/api/session/me').then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 分钟
  retry: 2,
});
```

### 2. 优化 Cookie 设置

```typescript
// 在登录 API 中设置更长的过期时间
cookieStore.set('sb-procyc-auth-token', sessionValue, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
  sameSite: 'lax',
});
```

### 3. 实现 Token 自动刷新

```typescript
// 在 AuthProvider 中监听 token 过期
useEffect(() => {
  const interval = setInterval(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.expires_at && session.expires_at < Date.now() / 1000 + 300) {
      // Token 将在 5 分钟内过期，刷新它
      await supabase.auth.refreshSession();
    }
  }, 60000); // 每分钟检查一次

  return () => clearInterval(interval);
}, []);
```

---

## ✅ 修复清单

### 代码修复

- [x] 修复 `/api/session/me/route.ts` - 添加 await
- [x] 修复 `/api/session/me/route.ts` - 动态计算 cookie 名称
- [x] 修复 `/api/session/me/route.ts` - 手动解析 cookie
- [x] 修复 `/api/session/me/route.ts` - 使用 getUser() 获取用户
- [x] 修复 `/api/session/me/route.ts` - 增强错误日志
- [x] 修复市场运营页面 - 添加错误处理
- [x] 修复开发者管理页面 - 添加错误处理
- [x] 修复市场运营页面 - 添加延迟调用
- [x] 修复开发者管理页面 - 添加延迟调用

### 测试验证

- [ ] 清除缓存并重新登录
- [ ] 检查 cookie 是否正确设置
- [ ] 测试 `/api/session/me` 返回用户信息
- [ ] 访问市场运营页面无报错
- [ ] 访问开发者管理页面无报错
- [ ] 访问 Dashboard 无报错
- [ ] 检查控制台无 401/403 错误

### 文档更新

- [x] 编写综合修复报告
- [x] 记录调试步骤
- [x] 提供验证方法
- [x] 列出可能的问题和解决方案

---

## 🎯 下一步建议

### 短期（优先级高）

1. ✅ **验证修复效果** - 清除缓存并重新登录测试
2. ⏳ **检查所有管理页面** - 确保所有页面都正常
3. ⏳ **添加监控** - 收集前端认证错误

### 中期（优先级中）

1. 实施 React Query 缓存用户信息
2. 统一错误处理和重试机制
3. 添加 Token 自动刷新功能

### 长期（优先级低）

1. 实现离线支持和乐观更新
2. 添加性能监控和告警
3. 优化首屏加载速度

---

## 📞 支持和反馈

### 如果问题仍然存在

请按以下顺序检查：

1. **检查环境变量**

   ```bash
   cat .env.local | grep SUPABASE
   # 确保 NEXT_PUBLIC_SUPABASE_URL 正确配置
   ```

2. **检查浏览器 Cookie**

   ```
   F12 → Application → Cookies → /
   查看是否有 sb-procyc-auth-token
   ```

3. **检查 Network 标签**

   ```
   查看 /api/session/me 的：
   - Request Headers (是否包含 Cookie)
   - Response (返回的用户信息)
   ```

4. **查看完整日志**
   ```javascript
   // 在控制台执行
   fetch('/api/session/me')
     .then(r => r.json())
     .then(d => console.table(d));
   ```

### 联系支持

如遇问题，请提供以下信息：

- 浏览器类型和版本
- 完整的错误堆栈
- Network 标签中的 API 响应
- Console 标签中的所有日志
- Cookie 列表截图

---

**修复时间**: 2026-03-23 23:45
**修复状态**: ✅ 已完成
**待验证**: ⏳ 需要清除缓存并重新登录测试
**修复人**: AI Assistant
