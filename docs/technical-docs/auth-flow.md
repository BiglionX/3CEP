# 认证流程文档

## 📋 概述

本文档描述系统的 JWT 认证流程和会话管理机制。

**版本**: 1.0.0  
**最后更新**: 2026-02-21

---

## 🔐 认证流程

### 1. 登录获取令牌

**端点**: `POST /api/auth/login`

**请求示例**:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**成功响应**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-user-id",
    "email": "admin@example.com",
    "roles": ["admin"],
    "tenant_id": "main-tenant"
  }
}
```

**错误响应**:

```json
{
  "success": false,
  "error": "用户名或密码错误"
}
```

### 2. 使用令牌访问受保护资源

**请求头格式**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**测试认证端点**:

```bash
curl -X GET http://localhost:3001/api/auth/test-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功响应**:

```json
{
  "success": true,
  "message": "认证成功",
  "user": {
    "id": "admin-user-id",
    "roles": ["admin"],
    "tenant_id": "main-tenant",
    "email": "admin@example.com",
    "exp": 1789012345
  }
}
```

---

## 🎟️ JWT 令牌结构

### Payload 示例

```json
{
  "userId": "admin-user-id",
  "email": "admin@example.com",
  "roles": ["admin"],
  "tenantId": "main-tenant",
  "iss": "3cep-auth-service",
  "exp": 1789012345,
  "iat": 1788925945
}
```

### 字段说明

- `userId`: 用户唯一标识符
- `email`: 用户邮箱地址
- `roles`: 用户角色数组
- `tenantId`: 租户标识符（多租户模式下）
- `iss`: 令牌签发者
- `exp`: 过期时间戳
- `iat`: 签发时间戳

---

## ⚙️ 环境配置

### 必需配置项

```env
# JWT 密钥（生产环境务必更换）
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# 令牌有效期
JWT_EXPIRES_IN=24h

# 租户模式
TENANCY_MODE=multi

# RBAC 配置路径
RBAC_CONFIG_PATH=./config/rbac.json
```

---

## 🛡️ 安全最佳实践

### 1. 密钥管理

```bash
# 生成强随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 令牌存储

- **前端**: 存储在 HttpOnly Cookie 中
- **移动端**: 存储在安全的本地存储中
- **避免**: localStorage（容易受到 XSS 攻击）

### 3. 令牌刷新

```javascript
// 检查令牌即将过期时自动刷新
const shouldRefresh = exp => {
  const now = Date.now() / 1000;
  return exp - now < 300; // 5分钟内过期
};
```

---

## 🧪 本地调试

### 1. 启动服务

```bash
# 设置环境变量
export JWT_SECRET=my-dev-secret-key

# 启动服务
node deploy-simple/server.js
```

### 2. 获取测试令牌

```bash
# 使用默认凭据获取令牌
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

echo "获得的令牌: $TOKEN"
```

### 3. 测试认证

```bash
# 测试受保护的端点
curl -X GET http://localhost:3001/api/auth/test-token \
  -H "Authorization: Bearer $TOKEN"
```

### 4. 测试无令牌访问

```bash
# 应该返回 401 错误
curl -X GET http://localhost:3001/api/auth/test-token
```

---

## 🔧 开发集成

### Express.js 中间件使用

```javascript
// 在路由中使用认证中间件
app.get('/protected-route', authMiddleware, (req, res) => {
  res.json({
    message: '访问成功',
    user: req.user,
  });
});
```

### 前端集成示例

```javascript
// Axios 拦截器配置
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理认证错误
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 重定向到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 错误处理

### 常见错误码

- `MISSING_AUTH_TOKEN`: 缺少认证令牌
- `INVALID_AUTH_FORMAT`: 令牌格式无效
- `INVALID_TOKEN`: 令牌无效或已过期

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述",
  "code": "错误码",
  "details": "详细信息（可选）"
}
```

---

## 🔄 会话管理

### 自动续期策略

```javascript
// 前端自动续期逻辑
setInterval(async () => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 - Date.now() < 5 * 60 * 1000) {
      // 5分钟内过期，刷新令牌
      await refreshToken();
    }
  }
}, 60000); // 每分钟检查一次
```

### 注销处理

```javascript
function logout() {
  localStorage.removeItem('jwt_token');
  sessionStorage.clear();
  // 重定向到登录页
  window.location.href = '/login';
}
```

---

## 📞 支持与维护

如需修改认证配置或遇到认证相关问题，请联系：

- 系统管理员
- 安全负责人

**注意**：生产环境部署前必须更换默认密钥！
