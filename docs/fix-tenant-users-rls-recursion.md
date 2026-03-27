# RLS 无限递归问题 - 完整修复方案

## 🔴 错误现象

```
infinite recursion detected in policy for relation "tenant_users"
```

## 🔍 根本原因

从 `fix_ris_recursion.md` 的查询结果可以看到问题所在：

### 有问题的策略

| 表               | 策略名                  | 问题                  |
| ---------------- | ----------------------- | --------------------- |
| **tenant_users** | 租户隔离 - 查看租户成员 | ❌ **自引用导致递归** |

**问题策略详情**：

```sql
-- 策略：租户隔离 - 查看租户成员
-- 表：tenant_users
WHERE (tenant_id IN (
    SELECT tenant_users_1.tenant_id
    FROM tenant_users tenant_users_1  -- ❌ 这里引用了自己！
    WHERE (tenant_users_1.user_id = auth.uid())
))
```

**递归过程**：

1. 查询 `tenant_users` 表
2. 触发 RLS 策略检查
3. 策略中的子查询又要查询 `tenant_users_1`（实际是同一张表）
4. 再次触发 RLS 策略检查
5. 无限循环... ♾️

---

## ✅ 修复步骤

### 步骤 1: 在 Supabase SQL Editor 执行修复

打开 [Supabase Dashboard](https://app.supabase.com) → 你的项目 → SQL Editor，然后执行：

```sql
-- ========================================
-- 修复 RLS 无限递归
-- ========================================

-- 1. 删除有问题的递归策略
DROP POLICY IF EXISTS "租户隔离 - 查看租户成员" ON tenant_users;

-- 2. 创建新的、不会递归的策略
-- 选项 A: 简单版本 - 用户只能查看自己的租户信息
CREATE POLICY "允许认证用户查看自己的租户信息" ON tenant_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 选项 B: 管理员可以查看所有和修改租户信息
CREATE POLICY "管理员可管理所有租户信息" ON tenant_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_active = true
    )
);

-- 3. 确保 RLS 已启用
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 验证修复
-- ========================================

-- 检查策略
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'tenant_users';

-- 测试查询
SELECT * FROM tenant_users LIMIT 10;
SELECT * FROM admin_users LIMIT 10;
```

### 步骤 2: 测试 API

修复后，测试以下 API 是否正常：

```bash
# 测试 1: Session 检查
curl http://localhost:3001/api/session/me

# 测试 2: 数据审核统计（之前报错的）
curl http://localhost:3001/api/admin/data-audit/statistics

# 测试 3: 数据源列表
curl http://localhost:3001/api/admin/data-sources/list
```

### 步骤 3: 验证前端页面

访问以下页面，应该不再报错：

- http://localhost:3001/data-center
- http://localhost:3001/data-center/data-sources
- http://localhost:3001/data-center/data-audit

---

## 📊 修复后的策略说明

### tenant_users 表的新策略

| 策略名                         | 作用                       | 适用角色              |
| ------------------------------ | -------------------------- | --------------------- |
| 允许认证用户查看自己的租户信息 | 用户只能看到自己关联的租户 | authenticated         |
| 管理员可管理所有租户信息       | 管理员可以操作所有租户数据 | authenticated + admin |

### 其他相关表的策略（保持不变）

| 表                    | 策略                       | 状态                                     |
| --------------------- | -------------------------- | ---------------------------------------- |
| admin_users           | 仅管理员可修改 admin_users | ✅ 正常                                  |
| admin_users           | 用户可查询自身管理员状态   | ✅ 正常                                  |
| admin_users           | 租户隔离 - 查看管理员      | ✅ 正常（引用 tenant_users，但不会递归） |
| external_data_sources | 仅管理员可管理数据源       | ✅ 正常                                  |
| parts_staging         | 仅管理员可审核临时表数据   | ✅ 正常                                  |

---

## 🎯 为什么这样修复有效？

### ✅ 新策略不会递归

```sql
-- 策略 1: 直接比较 user_id
USING (user_id = auth.uid())
-- 不需要查询其他表，直接比较字段值

-- 策略 2: 只查询 admin_users
USING (
    EXISTS (
        SELECT 1 FROM admin_users  -- ✅ 查询的是 admin_users，不是 tenant_users
        WHERE admin_users.user_id = auth.uid()
    )
)
```

### 🔄 为什么 admin_users 引用 tenant_users 不会递归？

```sql
-- admin_users 表的策略
WHERE (tenant_id IN (
    SELECT tenant_users.tenant_id
    FROM tenant_users  -- 虽然引用了 tenant_users
    WHERE (tenant_users.user_id = auth.uid())
))
```

这个不会递归，因为：

1. 这是在 `admin_users` 表上的策略
2. 查询 `tenant_users` 时，使用的是 `tenant_users` 自己的策略
3. `tenant_users` 的新策略不再引用其他表
4. 形成单向依赖：`admin_users` → `tenant_users` → 结束 ✅

---

## ⚠️ 注意事项

### 开发环境 vs 生产环境

**开发环境**（当前）：

- ✅ 可以使用简单的策略
- ✅ 甚至可以临时禁用 RLS
- ✅ 使用 `SUPABASE_SERVICE_ROLE_KEY` 绕过 RLS

**生产环境**：

- ❌ 需要更严格的租户隔离
- ✅ 但仍需避免递归
- 💡 可以使用 SECURITY DEFINER 函数

### 如果需要租户内协作

如果同一租户的用户需要互相查看数据，可以添加：

```sql
-- 安全的实现方式：使用 CTE 避免递归
CREATE POLICY "同租户用户可查看" ON tenant_users
FOR SELECT TO authenticated
USING (
    WITH my_tenant AS (
        SELECT tenant_id
        FROM tenant_users
        WHERE user_id = auth.uid()
    )
    SELECT tenant_id FROM my_tenant
);
```

---

## 📝 相关文件

- 修复 SQL: [`049_fix_tenant_users_rls.sql`](../supabase/migrations/049_fix_tenant_users_rls.sql)
- 问题诊断：[`fix_ris_recursion.md`](../supabase/migrations/fix_ris_recursion.md)
- 详细指南：[`rls-recursion-fix-guide.md`](../docs/rls-recursion-fix-guide.md)

---

## ✅ 完成检查清单

- [ ] 在 Supabase SQL Editor 执行修复 SQL
- [ ] 验证 `tenant_users` 查询正常
- [ ] 测试 `/api/admin/data-audit/statistics` 返回 200
- [ ] 测试数据中心首页正常加载
- [ ] 确认没有新的 RLS 错误
- [ ] （可选）审查其他表的 RLS 策略是否合理

---

## 🆘 如果还有问题

如果修复后仍有错误，请检查：

1. **是否有其他表也有类似递归**：

```sql
SELECT * FROM pg_policies
WHERE qual::text LIKE '%tenant_users%';
```

2. **策略是否正确应用**：

```sql
SELECT * FROM pg_policies
WHERE tablename = 'tenant_users';
```

3. **查看完整的错误堆栈**：

- 浏览器控制台
- Next.js 服务器日志
- Supabase 数据库日志
