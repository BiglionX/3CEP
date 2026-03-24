# 多租户隔离迁移 - 快速执行指南

## ✅ 问题已最终解决

### 本次修复

**移除了 audit_logs 依赖** - 之前的错误是因为尝试插入到不存在的 `audit_logs` 表

**修复内容**:

```sql
-- 移除前（错误）
INSERT INTO audit_logs (user_id, action, resource_type, details) VALUES (...);

-- 移除后（正确）
-- 审计日志记录功能已禁用，因为 audit_logs 表可能不存在
```

---

## 📋 执行步骤（简单版）

### 第 1 步：添加 tenant_id 字段

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 文件：supabase/migrations/20260324_add_tenant_id_to_tables.sql
```

**预期输出**:

```
NOTICE: ✅ tenant_id 字段添加完成！
NOTICE: 📋 已处理的表:
   - agents
   - agent_orders
   - user_agent_installations
   - agent_audit_logs
   - profiles
```

---

### 第 2 步：应用 RLS 策略

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 文件：supabase/migrations/20260324_enforce_tenant_isolation_rls.sql
```

**将创建的内容**:

- ✅ 7 个表启用 RLS
- ✅ 13 条 RLS 策略
- ✅ 2 个函数（check_tenant_access, detect_tenant_violation）
- ✅ 4 个索引

**预期输出**: 无错误，成功执行所有 CREATE POLICY 和 CREATE FUNCTION 语句

---

## ✅ 验证是否成功

### 验证 1: 检查 tenant_id 字段

```sql
SELECT table_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
ORDER BY table_name;
```

**应该看到**:

```
agents
agent_audit_logs
agent_orders
profiles
user_agent_installations
```

### 验证 2: 检查 RLS 策略

```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%tenant%';
```

**应该返回**: `13`

### 验证 3: 检查函数

```sql
SELECT proname
FROM pg_proc
WHERE proname IN ('check_tenant_access', 'detect_tenant_violation');
```

**应该返回**: 2 行

---

## ⚠️ 如果还有错误

### 错误 1: "relation does not exist"

**原因**: 基础表还没创建

**解决**: 确认已执行过以下迁移文件：

- `030_create_agents_tables.sql`
- `033_add_agent_store_management.sql`
- `036_create_profiles_table.sql`

### 错误 2: "column does not exist"

**原因**: 字段名拼写错误或字段不存在

**解决**: 运行以下命令检查表结构：

```sql
\d agents
\d agent_orders
\d profiles
```

---

## 🎉 测试权限

### 测试 1: 普通用户查询

```sql
-- 以普通用户身份登录
SELECT * FROM agents;
-- 应该只返回自己租户的智能体
```

### 测试 2: 管理员查询

```sql
-- 临时设置为管理员
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- 查询所有智能体
SELECT * FROM agents;
-- 应该返回所有智能体

-- 恢复原角色
UPDATE profiles SET role = 'user' WHERE id = auth.uid();
```

---

## 📞 需要帮助？

如果执行过程中遇到任何问题，请提供：

1. 完整的错误信息（包括行号）
2. 正在执行的 SQL 文件名
3. 已经执行过的步骤

---

**文档版本**: v8.0 (最终简化版)
**更新时间**: 2026-03-24
**状态**: ✅ 可以立即执行
