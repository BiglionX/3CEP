# 管理后台权限系统使用说明

## 系统概述

本系统实现了基于RBAC（基于角色的访问控制）的管理后台权限管理体系，支持多种用户角色和细粒度的权限控制。

## 角色权限说明

### 支持的角色类型：
- **超级管理员 (admin)**: 拥有所有权限，可以管理所有功能
- **内容审核员 (content_reviewer)**: 可以查看和审核内容相关功能
- **店铺审核员 (shop_reviewer)**: 可以查看和审核店铺相关功能  
- **财务人员 (finance)**: 可以查看订单和支付相关信息
- **查看者 (viewer)**: 仅能查看仪表板基本信息

## 部署步骤

### 1. 数据库部署
```bash
npm run deploy:admin
```

该命令将：
- 执行数据库迁移，创建必要的表结构
- 创建用户角色枚举类型
- 初始化权限配置数据
- 创建初始管理员账户

### 2. 环境变量配置
在 `.env` 文件中确保以下变量已配置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=admin@example.com  # 初始管理员邮箱
```

### 3. 启动应用
```bash
npm run dev
```

## 使用指南

### 访问管理后台
1. 访问 `/admin/login` 进行管理员登录
2. 使用Google账号登录（需要预先配置为管理员）
3. 登录成功后自动跳转到管理后台仪表板

### 管理员功能

#### 用户管理 (`/admin/users`)
- 查看所有管理员用户列表
- 创建新的管理员账户
- 修改用户角色和状态
- 删除管理员用户

#### 仪表板 (`/admin/dashboard`)
- 查看系统统计信息
- 快速访问常用功能
- 监控系统状态

### 权限控制机制

#### 页面级权限
通过中间件自动拦截 `/admin/*` 路径的访问请求，验证用户角色和权限。

#### API级权限
所有管理API都会进行双重验证：
1. 用户认证状态检查
2. 具体操作权限验证

#### 角色继承
- 超级管理员自动拥有所有权限
- 其他角色只能访问其权限范围内的功能

## 开发指南

### 添加新角色
1. 在数据库迁移文件中扩展 `user_role` 枚举类型
2. 在 `permissions` 表中添加相应的权限配置
3. 更新前端导航菜单的角色过滤逻辑

### 添加新功能模块
1. 在权限表中添加对应的 `resource` 和 `action`
2. 在中间件中配置路径到权限的映射关系
3. 在前端页面中实现相应的功能

### 自定义权限验证
使用 `AuthService` 提供的方法：
```typescript
// 检查用户是否具有特定权限
const hasPermission = await AuthService.checkPermission(userId, 'resource', 'action')

// 获取用户角色
const userRole = await AuthService.getUserRole(userId)

// 检查是否为管理员
const isAdmin = await AuthService.isAdminUser(userId)
```

## 故障排除

### 常见问题

1. **无法访问管理后台**
   - 检查用户是否已被添加到 `admin_users` 表
   - 验证用户角色和状态是否正确

2. **权限不足错误**
   - 确认用户角色具有访问该功能的权限
   - 检查 `permissions` 表中的配置

3. **数据库迁移失败**
   - 确保Supabase连接配置正确
   - 检查服务角色密钥权限

### 日志查看
系统会在控制台输出详细的权限检查和错误信息，便于调试问题。

## 安全注意事项

1. **敏感操作二次确认**
   - 删除用户等危险操作需要二次确认
   - 重要配置修改需要超级管理员权限

2. **会话管理**
   - 管理员会话有效期为7天
   - 支持手动登出清除会话

3. **审计日志**
   - 建议记录重要的管理操作日志
   - 监控异常访问行为

## 测试验证

运行完整测试套件：
```bash
npm run test:admin
```

测试内容包括：
- 数据库结构验证
- 认证服务功能测试
- API路由连通性测试
- 权限验证逻辑测试

---
*本系统基于Next.js 14 + Supabase + TypeScript构建*