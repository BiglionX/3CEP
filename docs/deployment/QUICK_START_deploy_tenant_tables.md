# 🚀 快速部署指南 - 租户基础设施

## ⚡ 立即执行（5 分钟搞定）

### 问题说明

当前缺少以下数据库表，导致 AuthProvider 报错：

- ❌ `user_profiles_ext` - 用户档案表
- ❌ `admin_users` - 管理员表
- ❌ `tenants` - 租户表
- ❌ `user_tenants` - 用户租户关联表

### 一键解决方案

#### 步骤 1：打开 Supabase SQL Editor

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New query**

#### 步骤 2：复制并执行完整脚本

复制文件 `033_create_tenant_infrastructure.sql` 的**全部内容**并执行

📁 文件路径：`d:\BigLionX\3cep\supabase\migrations\033_create_tenant_infrastructure.sql`

#### 步骤 3：验证执行成功

```sql
-- 检查所有表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles_ext', 'admin_users', 'tenants', 'user_tenants');
```

**预期结果**：应该返回 4 行记录

### ✅ 执行后的变化

执行成功后，系统将自动拥有：

✅ **4 个核心表**（自动按需创建）：

1. `user_profiles_ext` - 用户角色和权限
2. `admin_users` - 管理员信息
3. `tenants` - 租户信息
4. `user_tenants` - 用户与租户关联

✅ **智能特性**：

- 自动检测：如果表已存在则跳过
- 依赖处理：自动按正确顺序创建
- RLS 安全：行级权限控制已配置
- 性能优化：索引已创建

✅ **默认数据**：

- 默认租户 (`default`)
- 测试租户 (`test`)

### 🔍 故障排除

#### 错误 1：relation "user_profiles_ext" does not exist

**原因**：之前的迁移未执行
**解决**：新脚本已自动包含此表的创建逻辑，直接执行即可

#### 错误 2：type "user_role" already exists

**原因**：枚举类型已存在
**解决**：脚本使用 `CREATE TYPE IF NOT EXISTS`，应该自动跳过

#### 错误 3：permission denied for schema public

**原因**：数据库权限不足
**解决**：使用项目所有者账号或 Service Role Key

### 📊 后续操作

#### 1. 为现有用户分配默认租户

```sql
-- 将所有用户分配到默认租户
INSERT INTO user_tenants (user_id, tenant_id, role, is_primary, is_active)
SELECT
  id as user_id,
  '00000000-0000-0000-0000-000000000001'::uuid as tenant_id,
  'member' as role,
  true as is_primary,
  true as is_active
FROM auth.users
ON CONFLICT (user_id, tenant_id) DO NOTHING;
```

#### 2. 测试登录

- 刷新浏览器
- 重新登录
- 检查 AuthProvider 是否正常工作

#### 3. 验证多租户功能

```sql
-- 查看用户租户关联
SELECT
  u.email,
  t.name as tenant_name,
  ut.role,
  ut.is_primary
FROM user_tenants ut
JOIN tenants t ON ut.tenant_id = t.id
JOIN auth.users u ON ut.user_id = u.id;
```

---

## 📖 详细文档

更详细的说明、故障排除和最佳实践，请查看：
[完整部署指南](./deploy-tenant-infrastructure-guide.md)

---

**更新时间**: 2026-03-23
**执行时间**: ~5 分钟
**影响范围**: 新增表，不影响现有数据
**回滚方案**: 支持安全重试，不会重复创建
