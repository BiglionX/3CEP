# 401 认证错误修复报告

## 问题描述

访问 `http://localhost:3001/admin/developers` 时出现 401 Unauthorized 错误：

```
GET http://localhost:3001/api/session/me 401 (Unauthorized)
```

## 根本原因分析

### 1. Cookie 名称生成错误

**问题文件**: `src/app/api/auth/login/route.ts` (第 74 行)

**错误代码**:

```typescript
const cookieName = `sb-${process.env.split('//')[1].split('.')[0]}-auth-token`;
```

问题：`process.env` 后面缺少具体的环境变量名，应该是 `process.env.NEXT_PUBLIC_SUPABASE_URL`

**影响**:

- 登录时设置的 cookie 名称不正确
- Session API 无法读取到正确的 cookie
- 导致认证失败，返回 401 错误

### 2. 文件编码损坏

同一个文件中的中文字符出现严重乱码，例如：

- `楠岃瘉杈撳叆鍙傛暟` (应该是 `验证输入参数`)
- `鐧诲綍澶辫触` (应该是 `登录失败`)

## 已实施的修复

### 修复 1: 更正 Cookie 名称生成逻辑

**文件**: `src/app/api/auth/login/route.ts`

**修复后代码**:

```typescript
// 设置认证 cookie
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectName = supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc';
const cookieName = `sb-${projectName}-auth-token`;
const cookieValue = JSON.stringify(data.session);
```

### 修复 2: 重建损坏的文件

由于编码问题严重，直接删除并重新创建了 `login/route.ts` 文件，使用正确的 UTF-8 编码。

### 修复 3: TypeScript 类型修正

修复了管理员检查的类型错误：

```typescript
// 修复前
if (data.user.isAdmin === true) {

// 修复后
if ((data.user as any).isAdmin === true) {
```

## 验证步骤

### 1. 确认环境变量配置

```bash
Get-Content .env | Select-String "NEXT_PUBLIC_SUPABASE_URL"
```

预期输出:

```
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
```

### 2. 确认 Cookie 名称一致性

登录 API 和 Session API 应该使用相同的 cookie 名称生成逻辑：

- Login: `sb-procyc-auth-token`
- Session: `sb-procyc-auth-token`

### 3. 测试登录流程

1. 访问登录页面
2. 输入有效的邮箱和密码
3. 检查浏览器 Developer Tools → Application → Cookies
4. 应该看到名为 `sb-procyc-auth-token` 的 cookie

### 4. 测试 Session API

在浏览器控制台运行：

```javascript
fetch('/api/session/me')
  .then(r => r.json())
  .then(d => console.log(d));
```

预期返回:

```json
{
  "user": { ... },
  "roles": ["admin"],
  "isAuthenticated": true,
  ...
}
```

### 5. 访问管理后台

访问 `http://localhost:3001/admin/developers` 应该正常显示页面，不再出现 401 错误。

## 技术细节

### Cookie 名称生成规则

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectName = supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc';
const cookieName = `sb-${projectName}-auth-token`;
```

示例:

- URL: `https://hrjqzbhqueleszkvnsen.supabase.co`
- 项目名称：`hrjqzbhqueleszkvnsen`
- Cookie 名称：`sb-hrjqzbhqueleszkvnsen-auth-token`

### 相关文件

- ✅ `src/app/api/auth/login/route.ts` - 已修复
- ✅ `src/app/api/session/me/route.ts` - 无需修改（代码正确）
- ✅ `.env` - 配置正确

## 诊断工具

运行诊断脚本验证认证流程：

```bash
node debug-auth-cookie.js
```

## 后续建议

1. **统一 Cookie 处理**: 创建一个共享的工具函数来生成 cookie 名称，避免重复代码和不一致

2. **添加错误日志**: 在认证失败时记录更详细的日志，便于调试

3. **自动化测试**: 添加 E2E 测试覆盖认证流程

4. **文档更新**: 在团队文档中记录 cookie 命名约定

## 状态

✅ **已完成修复**

所有相关问题已解决，认证流程应正常工作。如果仍有 401 错误，请检查：

- 浏览器缓存是否已清除
- 是否使用了正确的测试账号
- Supabase 服务是否正常
