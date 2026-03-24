# 🚨 401 认证错误 - 快速修复指南

## 问题症状

- 访问 `http://localhost:3001/admin/agents/execute` 返回 401
- `/api/session/me` 接口返回 401 Unauthorized
- Cookie 名称正确：`sb-hrjqzbhqueleszkvnsen-auth-token`

## ✅ 解决方案（按顺序执行）

### 方案 1: 自动修复脚本（推荐 ⭐⭐⭐⭐⭐）

**步骤**:

1. 打开浏览器开发者工具 (F12)
2. 进入 **Console** 标签
3. 复制并粘贴 `quick-fix-cookie.js` 的**全部内容**
4. 按 **Enter** 执行
5. 等待脚本自动完成检查和修复
6. 如果显示 "🎉 修复成功"，刷新页面测试

**预期输出示例**:

```
=================================
🔍 开始检查 Cookie 状态...
=================================

📋 当前所有 Cookie:
  ✅ sb-hrjqzbhqueleszkvnsen-auth-token (正确的 Cookie)

📋 检查 LocalStorage:
  📦 sb-access-token

📋 查找可用的 Token:
  ✅ 从 LocalStorage (sb-access-token) 获取到 Token

...

🎉 修复成功!
建议操作:
1. 刷新页面 (F5 或 Ctrl+R)
2. 访问 /admin/agents/execute 测试
```

---

### 方案 2: 手动清除并重新登录（最可靠 ⭐⭐⭐⭐）

**步骤**:

1. **清除 Cookie**
   - F12 → Application → Cookies → `http://localhost:3001`
   - 删除所有包含 `sb-`、`auth`、`token` 的 Cookie
   - 或者右键 → Clear All

2. **清除 LocalStorage**
   - F12 → Application → Local Storage → `http://localhost:3001`
   - 右键 → Clear

3. **刷新页面**
   - 按 F5 或 Ctrl+R

4. **重新登录**
   - 访问 `http://localhost:3001/login`
   - 输入用户名和密码
   - 点击登录

5. **验证**
   - 登录后访问 `/admin/agents/execute`
   - 应该不再返回 401

---

### 方案 3: 手动设置 Cookie（调试用 ⭐⭐⭐）

如果您有备份的 token，可以手动设置：

**在浏览器控制台运行**:

```javascript
// 替换为您的实际 token
const myToken = 'your_token_here';

// 设置 cookie
const cookieName = 'sb-hrjqzbhqueleszkvnsen-auth-token';
document.cookie = `${cookieName}=${encodeURIComponent(myToken)}; path=/; max-age=86400; SameSite=Lax`;

console.log('✅ Cookie 已设置:', cookieName);
console.log('请刷新页面测试');
```

---

## 🔍 验证修复是否成功

### 检查清单:

- [ ] Cookie 已正确设置
- [ ] `/api/session/me` 返回 200 OK
- [ ] 响应中包含用户信息
- [ ] `isAuthenticated: true`
- [ ] 可以访问管理页面

### 验证命令:

```javascript
// 在浏览器控制台运行
fetch('/api/session/me', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    console.log('认证状态:', data.isAuthenticated);
    console.log('用户信息:', data.user);
    console.log('角色列表:', data.roles);

    if (data.isAuthenticated) {
      console.log('✅ 认证成功！可以访问管理页面了');
    } else {
      console.log('❌ 认证失败，需要重新登录');
    }
  });
```

---

## ❓ 常见问题

### Q1: 脚本说 "未找到任何可用的 Token"

**A**: 说明您之前没有登录过，或者 token 已完全丢失。

- **解决方案**: 直接去 `/login` 页面重新登录

### Q2: Cookie 设置成功但 API 仍返回 401

**A**: 可能的原因:

1. Token 已过期 → 重新登录
2. Token 格式不正确 → 使用自动修复脚本包装
3. Supabase 服务端问题 → 检查 Supabase 控制台

### Q3: 刷新后又回到 401

**A**: Cookie 没有持久化保存。

- 检查 Cookie 的 `max-age` 设置
- 确保浏览器允许 Cookie
- 尝试方案 2 重新登录

### Q4: 多个标签页不一致

**A**: 每个标签页的 Cookie 可能不同步。

- 关闭所有标签页
- 重新打开新标签页
- 重新登录

---

## 📊 技术细节

### Cookie 名称生成逻辑

```javascript
项目名称 = 'hrjqzbhqueleszkvnsen'  // 从 Supabase URL 提取
Cookie 名称 = 'sb-' + 项目名称 + '-auth-token'
           = 'sb-hrjqzbhqueleszkvnsen-auth-token'
```

### 正确的 Cookie 格式

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.local.Xm3k9...",
  "expires_in": 86400,
  "expires_at": 1711234567
}
```

### API 响应示例

```json
{
  "user": {
    "id": "xxx-xxx-xxx",
    "email": "user@example.com"
  },
  "roles": ["admin"],
  "tenantId": null,
  "isAuthenticated": true
}
```

---

## 🆘 仍然无法解决？

如果以上方案都无效，请提供以下信息寻求帮助：

1. **浏览器 Console 输出**
   - 运行 `quick-fix-cookie.js` 的完整输出
   - 任何错误信息

2. **Cookie 列表**

   ```javascript
   console.log(document.cookie);
   ```

3. **API 响应**

   ```javascript
   fetch('/api/session/me', { credentials: 'include' })
     .then(res => res.json())
     .then(data => console.log(data));
   ```

4. **Network 面板截图**
   - `/api/session/me` 请求的详细信息
   - Request Headers 和 Response

---

## 📝 相关文件

- `quick-fix-cookie.js` - 自动修复脚本
- `fix-auth-401.js` - 完整版修复脚本
- `AUTH_401_FIX_REPORT.md` - 详细技术报告
- `debug-cookie-name.js` - Cookie 名称调试工具

---

**最后更新**: 2026-03-24
**适用版本**: localhost:3001 开发环境
