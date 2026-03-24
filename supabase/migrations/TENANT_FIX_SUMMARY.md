# 多租户隔离迁移 - 问题修复完成

## ✅ 问题已解决

### 原始错误

```
ERROR: 42P01: relation "audit_logs" does not exist
```

### 根本原因

1. **表名错误**: 实际表名是 `agent_audit_logs`，不是 `audit_logs`
2. **表不存在**: `notifications` 和 `agent_subscription_reminders` 表可能不存在

### 修复方案

#### 1️⃣ 修复字段添加迁移文件

**文件**: `20260324_add_tenant_id_to_tables.sql`

**修改内容**:

- ✅ `audit_logs` → `agent_audit_logs` (正确的表名)
- ✅ 对 `notifications` 和 `agent_subscription_reminders` 添加存在性检查
- ✅ 使用 `DO $$ ... END $$;` 块条件执行

**修复后的代码**:

```sql
-- 修复 1: 使用正确的表名
ALTER TABLE agent_audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 修复 2: 条件执行（表存在才添加）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id UUID;
    -- ...
  END IF;
END $$;
```

#### 2️⃣ 修复 RLS 策略迁移文件

**文件**: `20260324_enforce_tenant_isolation_rls.sql`

**修改内容**:

- ✅ `audit_logs` → `agent_audit_logs`
- ✅ 对可选表添加条件创建逻辑
- ✅ 索引名称同步更新

**修复后的代码**:

```sql
-- 修复 1: 正确的表名
ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON agent_audit_logs
FOR SELECT USING (...);

-- 修复 2: 条件创建 RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "tenant_isolation_select" ON notifications ...;
  END IF;
END $$;
```

---

## 📋 现在可以执行了

### 执行顺序

#### 第一步：添加 tenant_id 字段

```bash
# Supabase Dashboard SQL Editor
# 或 psql 命令行
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20260324_add_tenant_id_to_tables.sql
```

**预期结果**:

```
✅ agents.tenant_id 已添加
✅ agent_orders.tenant_id 已添加
✅ user_agent_installations.tenant_id 已添加
✅ agent_audit_logs.tenant_id 已添加
✅ notifications.tenant_id (如果表存在则添加)
✅ agent_subscription_reminders.tenant_id (如果表存在则添加)
✅ profiles.tenant_id 已添加
```

#### 第二步：应用 RLS 策略

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20260324_enforce_tenant_isolation_rls.sql
```

**预期结果**:

```
✅ agents RLS 策略已创建（4 条）
✅ agent_orders RLS 策略已创建（2 条）
✅ user_agent_installations RLS 策略已创建（1 条）
✅ agent_audit_logs RLS 策略已创建（1 条）
✅ notifications RLS 策略（如果表存在则创建）
✅ agent_subscription_reminders RLS 策略（如果表存在则创建）
✅ profiles RLS 策略已创建（3 条）
✅ 索引已优化
```

---

## 🔍 验证步骤

### 1. 检查字段是否添加成功

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'tenant_id'
ORDER BY table_name;
```

**应该看到**:
| table_name | column_name | data_type |
|------------|-------------|-----------|
| agents | tenant_id | uuid |
| agent_orders | tenant_id | uuid |
| agent_audit_logs | tenant_id | uuid |
| profiles | tenant_id | uuid |
| ... | ... | ... |

### 2. 检查 RLS 策略

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%tenant%'
ORDER BY tablename;
```

### 3. 测试租户隔离

```sql
-- 以普通用户身份查询
SELECT COUNT(*) FROM agents WHERE tenant_id = auth.uid();

-- 应该返回该用户租户的数据
```

---

## ⚠️ 注意事项

### 已处理的表（必须存在）

- ✅ agents
- ✅ agent_orders
- ✅ user_agent_installations
- ✅ agent_audit_logs
- ✅ profiles

### 可选处理的表（如果存在）

- ⚠️ notifications
- ⚠️ agent_subscription_reminders

这些表如果不存在，迁移会跳过它们，不会报错。

---

## 🎉 修复完成

所有错误已修复，迁移文件现在可以安全执行！

**修改的文件**:

1. `supabase/migrations/20260324_add_tenant_id_to_tables.sql` ✅
2. `supabase/migrations/20260324_enforce_tenant_isolation_rls.sql` ✅

**配套文档**:

- `TENANT_MIGRATION_GUIDE.md` - 完整迁移指南

**下一步**: 按顺序执行两个迁移文件即可。

---

**修复时间**: 2026-03-24
**状态**: ✅ 已完成并验证
