# RBAC权限管理体系文档

## 📋 系统概述

本系统实现了完整的基于角色的访问控制（RBAC）权限管理体系，支持五种用户角色的精细化权限控制。

## 👥 用户角色定义

### 1. 超级管理员 (admin) - 权限等级: 5
- 拥有系统所有功能的完全访问权限
- 可以管理所有用户和权限配置
- 可以访问所有管理后台页面

### 2. 内容审核员 (content_reviewer) - 权限等级: 3
- 可以查看和审核用户上传的内容
- 管理内容相关的配置和设置
- 访问仪表板和内容管理页面

### 3. 店铺审核员 (shop_reviewer) - 权限等级: 3
- 负责审核和管理店铺信息
- 查看店铺申请和运营数据
- 访问仪表板和店铺管理页面

### 4. 财务人员 (finance) - 权限等级: 3
- 管理订单和支付记录
- 查看财务报表和统计数据
- 访问仪表板和财务管理页面

### 5. 查看者 (viewer) - 权限等级: 1
- 仅能查看基础的仪表板信息
- 无编辑和管理权限
- 最低权限级别

## 🔐 权限控制机制

### 中间件保护
所有 `/admin/*` 路径都受到权限中间件保护：

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 只对管理后台路径进行权限检查
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // 检查用户认证和角色权限
  // ...
}
```

### 角色权限映射
```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'admin': ['dashboard', 'users', 'content', 'shops', 'payments', 'settings', 'profile'],
  'content_reviewer': ['dashboard', 'content'],
  'shop_reviewer': ['dashboard', 'shops'],
  'finance': ['dashboard', 'payments'],
  'viewer': ['dashboard']
}
```

## 🏗️ 系统架构

### 数据库表结构

#### 1. admin_users (管理员用户表)
```sql
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

#### 2. permissions (权限配置表)
```sql
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource varchar(100) NOT NULL,
  action varchar(50) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, resource, action)
);
```

#### 3. user_profiles_ext (用户档案扩展表)
```sql
CREATE TABLE user_profiles_ext (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255),
  role user_role DEFAULT 'viewer',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### API接口

#### 管理API统一入口
```
/api/admin/[...path]
```

支持的操作：
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建新用户
- `PUT /api/admin/users/{id}` - 更新用户信息
- `DELETE /api/admin/users/{id}` - 删除用户
- `GET /api/admin/permissions` - 获取当前用户权限
- `GET /api/admin/dashboard/stats` - 获取仪表板统计数据

## 🖥️ 前端页面

### 1. 管理后台登录页
- 路径：`/admin/login`
- 支持Google OAuth登录
- 自动检测管理员身份
- 未授权用户重定向到未授权页面

### 2. 用户管理页面
- 路径：`/admin/users`
- 功能：
  - 查看所有管理员用户列表
  - 创建新管理员用户
  - 编辑用户角色和状态
  - 删除管理员用户
  - 搜索和筛选功能

### 3. 未授权页面
- 路径：`/unauthorized`
- 显示权限不足提示
- 提供返回首页和重新登录选项
- 3秒后自动跳转

## 🔧 使用指南

### 1. 创建管理员用户
```typescript
// 通过API创建
const newUser = await AdminUserService.createUser({
  email: 'admin@example.com',
  role: 'admin',
  user_id: 'user-uuid' // 可选
});
```

### 2. 检查用户权限
```typescript
// 检查特定权限
const hasPermission = await AuthService.checkPermission(
  userId, 
  'users', 
  'read'
);

// 检查角色
const userRole = await AuthService.getUserRole(userId);
const isAdmin = await AuthService.hasRole(userId, 'admin');
```

### 3. 前端权限控制
```typescript
// 在组件中使用
const currentUser = await AuthService.getCurrentUser();
const userRole = await AuthService.getUserRole(currentUser.id);

// 根据角色显示不同内容
if (userRole === 'admin') {
  // 显示管理员功能
} else if (userRole === 'content_reviewer') {
  // 显示内容审核功能
}
```

## 🛡️ 安全特性

### 1. 行级安全策略(RLS)
所有管理相关表都启用了RLS策略：
- 用户只能查看自己的数据
- 管理员可以查看所有相关数据
- 严格的增删改查权限控制

### 2. 中间件防护
- 自动拦截未认证访问
- 实时权限验证
- 详细的日志记录

### 3. Session管理
- 安全的Cookie存储
- 自动过期机制
- CSRF保护

## 📊 监控和日志

### 权限检查日志
中间件会记录详细的权限检查信息：
```
用户 xxx 的角色: admin, 请求资源: dashboard
超级管理员拥有全部权限
管理员用户 xxx 访问: /admin/users
```

### 错误处理
- 详细的错误信息记录
- 优雅的错误页面展示
- 自动重定向到合适的位置

## 🚀 部署和维护

### 数据库迁移
```bash
# 应用最新的权限表结构
npx supabase migration up
```

### 权限初始化
首次部署时需要创建初始管理员用户：
```sql
INSERT INTO admin_users (email, role, is_active) 
VALUES ('admin@yourdomain.com', 'admin', true);
```

### 系统监控
建议监控以下指标：
- 权限检查失败率
- 管理员登录频率
- 不同角色的活跃度
- 未授权访问尝试次数

## 🔧 故障排除

### 常见问题

1. **用户无法登录管理后台**
   - 检查用户是否在 `admin_users` 表中
   - 确认 `is_active` 字段为 true
   - 验证用户角色配置

2. **权限检查失败**
   - 检查中间件配置
   - 验证 `ROLE_PERMISSIONS` 映射
   - 确认数据库连接正常

3. **页面访问被拒绝**
   - 查看浏览器控制台错误信息
   - 检查网络请求响应
   - 验证API路由配置

### 调试技巧

启用详细日志：
```typescript
// 在 middleware.ts 中增加调试信息
console.log('用户权限检查:', { userId, resource, action });
```

数据库查询调试：
```sql
-- 查看用户权限
SELECT * FROM admin_users WHERE email = 'user@example.com';

-- 查看权限配置
SELECT * FROM permissions WHERE role = 'content_reviewer';
```

## 📈 扩展性考虑

### 添加新角色
1. 在 `user_role` 枚举中添加新角色
2. 更新 `ROLE_PERMISSIONS` 配置
3. 在前端界面添加相应的角色选项
4. 创建对应的新页面和API端点

### 细粒度权限控制
可以通过扩展 `permissions` 表来实现更细粒度的权限控制：
- 添加具体的操作权限（create, read, update, delete）
- 实现基于资源的权限控制
- 支持权限继承和组合

## 📞 技术支持

如有问题，请联系系统管理员或查看相关技术文档。