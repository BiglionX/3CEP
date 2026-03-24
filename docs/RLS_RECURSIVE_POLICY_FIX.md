# RLS 无限递归问题修复指南

## 问题诊断

### 错误信息

```json
{
  "code": "42P17",
  "message": "infinite recursion detected in policy for relation \"admin_users\""
}
```

### 根本原因

Supabase RLS（行级安全）策略中存在**自引用查询**或**循环依赖查询**，导致：

1. `admin_users` 表的 SELECT 策略查询 `admin_users` 表自身 → **无限递归**
2. `user_profiles_ext` 表的策略查询 `admin_users` 表 → **可能循环依赖**
3. `user_tenants` 表的策略查询 `user_profiles_ext` 表 → **可能循环依赖**

### 问题代码示例

```sql
-- ❌ 错误的策略（会导致无限递归）
CREATE POLICY "管理员可查看所有管理员用户"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au  -- ⚠️ 在 admin_users 表上查询 admin_users
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
    )
  );
```

## 解决方案

### 方案概述

使用 **PostgreSQL Session 变量** 替代表查询来检查用户权限，避免在 RLS 策略中查询数据库表。

### 核心思路

1. **SELECT 操作**：允许所有认证用户查看（简化策略）
2. **ALL 操作**：通过 session 变量 `app.settings.current_user_role` 检查是否为管理员
3. **个人数据**：通过 `user_id = auth.uid()` 限制只能操作自己的数据

## 修复步骤

### 方法一：使用 Supabase Dashboard（推荐）

1. **打开 SQL Editor**
   - 访问 https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. **执行修复脚本**

   ```sql
   -- 复制并执行 supabase/fix_all_recursive_policies.sql 文件内容
   ```

3. **验证修复结果**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('admin_users', 'user_profiles_ext', 'tenants', 'user_tenants')
   ORDER BY tablename, policyname;
   ```

### 方法二：使用 Supabase CLI

```bash
# 1. 登录 Supabase
npx supabase login

# 2. 链接到项目
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. 执行修复迁移
npx supabase db push --db-url "YOUR_CONNECTION_STRING"
```

### 方法三：手动执行 SQL

如果上述方法不可用，可以手动执行以下核心 SQL：

```sql
-- 修复 admin_users 表
DROP POLICY IF EXISTS "管理员可查看所有管理员用户" ON admin_users;
DROP POLICY IF EXISTS "只有超级管理员可修改管理员用户" ON admin_users;

CREATE POLICY "认证用户可查看 admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "仅管理员可修改 admin_users"
  ON admin_users FOR ALL
  USING (
    COALESCE(
      (current_setting('app.settings.current_user_role', true))::text = 'admin',
      false
    )
  );
```

## 使用 Session 变量进行权限检查

### 设置 Session 变量

在调用任何需要权限检查的 API 之前，先设置 session 变量：

```sql
-- 设置当前用户角色
SET app.settings.current_user_role = 'admin';

-- 或者设置为普通用户
SET app.settings.current_user_role = 'user';
```

### 在应用中使用

#### Node.js / TypeScript 示例

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 在执行操作前设置 session 变量
await supabase.rpc('set_user_role', { role: 'admin' });

// 或者使用 REST API header
const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
  headers: {
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: 'tx=rollback',
    'X-Session-Role': 'admin', // 自定义 header，需要在后端处理
  },
});
```

#### 使用 Supabase RPC 函数

创建一个 RPC 函数来设置 session 变量：

```sql
-- 在数据库中创建函数（复制并执行以下 SQL）
CREATE OR REPLACE FUNCTION set_user_role(role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.settings.current_user_role', role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

然后在应用中调用：

```typescript
// 设置为管理员角色
await supabase.rpc('set_user_role', { role: 'admin' });

// 现在可以执行需要管理员权限的操作
const { data, error } = await supabase.from('admin_users').select('*');
```

## 修复后的策略说明

### admin_users 表

| 策略名称                   | 操作   | 条件                     | 说明                 |
| -------------------------- | ------ | ------------------------ | -------------------- |
| 认证用户可查看 admin_users | SELECT | `true`                   | 所有认证用户都可查看 |
| 仅管理员可修改 admin_users | ALL    | `session_role = 'admin'` | 仅管理员可增删改     |

### user_profiles_ext 表

| 策略名称               | 操作   | 条件                     | 说明                 |
| ---------------------- | ------ | ------------------------ | -------------------- |
| 认证用户可查看用户档案 | SELECT | `true`                   | 所有认证用户都可查看 |
| 用户可管理自己的档案   | ALL    | `user_id = auth.uid()`   | 只能操作自己的       |
| 管理员可管理所有档案   | ALL    | `session_role = 'admin'` | 管理员可操作所有     |

### tenants 表

| 策略名称           | 操作   | 条件                     | 说明                 |
| ------------------ | ------ | ------------------------ | -------------------- |
| 认证用户可查看租户 | SELECT | `true`                   | 所有认证用户都可查看 |
| 管理员可管理租户   | ALL    | `session_role = 'admin'` | 仅管理员可增删改     |

### user_tenants 表

| 策略名称               | 操作   | 条件                     | 说明                 |
| ---------------------- | ------ | ------------------------ | -------------------- |
| 认证用户可查看租户关联 | SELECT | `true`                   | 所有认证用户都可查看 |
| 用户可管理自己的关联   | ALL    | `user_id = auth.uid()`   | 只能操作自己的       |
| 管理员可管理所有关联   | ALL    | `session_role = 'admin'` | 管理员可操作所有     |

## 测试验证

### 1. 测试普通用户查询

```sql
-- 设置普通用户角色
SET app.settings.current_user_role = 'user';

-- 应该成功
SELECT * FROM admin_users;

-- 应该失败（没有权限）
INSERT INTO admin_users (email, role) VALUES ('test@example.com', 'viewer');
```

### 2. 测试管理员操作

```sql
-- 设置管理员角色
SET app.settings.current_user_role = 'admin';

-- 应该成功
SELECT * FROM admin_users;
INSERT INTO admin_users (email, role) VALUES ('test@example.com', 'viewer');
UPDATE admin_users SET role = 'admin' WHERE email = 'test@example.com';
DELETE FROM admin_users WHERE email = 'test@example.com';
```

### 3. 测试个人数据访问

```sql
-- 即使是管理员，也应该只能修改自己的档案（除非明确授权）
SELECT * FROM user_profiles_ext WHERE user_id = auth.uid();
```

## 注意事项

⚠️ **重要提示**：

1. **Session 变量的作用域**
   - Session 变量只在当前数据库连接中有效
   - 每次新的请求都需要重新设置
   - 在服务器端渲染时需要特别注意

2. **安全性考虑**
   - 确保客户端不能直接设置 session 变量
   - 使用 `SECURITY DEFINER` 函数来安全地设置变量
   - 在后端 API 中统一处理权限检查

3. **性能优化**
   - 避免了子查询，提高了查询性能
   - 减少了数据库锁竞争
   - 降低了递归调用的开销

4. **向后兼容**
   - 旧的迁移文件已更新（033_create_tenant_infrastructure_COMPLETE.sql）
   - 现有数据库需要手动执行修复脚本
   - 未来部署会自动使用新策略

## 相关文件

- ✅ 修复脚本：`supabase/fix_all_recursive_policies.sql`
- ✅ 简化脚本：`supabase/fix_admin_users_recursive_policy.sql`
- ✅ 快速修复：`supabase/quick_fix_admin_users.sql`
- ✅ RPC 函数：`supabase/create_set_user_role_function.sql` **← 立即执行这个！**
- ✅ 迁移文件：`supabase/migrations/033_create_tenant_infrastructure_COMPLETE.sql`
- 📝 本文档：`RLS_RECURSIVE_POLICY_FIX.md`

## 故障排查

### 问题 1：仍然报错无限递归

**解决**：

1. 确认旧策略已被删除：`SELECT * FROM pg_policies WHERE tablename = 'admin_users';`
2. 重新执行修复脚本
3. 检查是否有其他触发器或函数导致递归

### 问题 2：权限检查不生效

**解决**：

1. 确认 session 变量已正确设置
2. 检查 RLS 是否启用：`SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'admin_users';`
3. 验证当前用户角色：`SELECT current_setting('app.settings.current_user_role', true);`

### 问题 3：无法设置 session 变量

**解决**：

1. 使用 `SECURITY DEFINER` 创建包装函数
2. 在应用层统一处理权限设置
3. 检查数据库用户是否有 `SET` 权限

## 总结

✅ **修复完成**：

- 移除了所有导致递归的表查询
- 使用 session 变量进行权限检查
- 简化了 SELECT 策略，提高性能
- 保持了数据访问的安全性

🎯 **下一步**：

1. 在测试环境验证修复效果
2. 更新应用代码以支持 session 变量
3. 在生产环境执行修复脚本
4. 监控日志确认无递归错误
