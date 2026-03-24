# 数据库表结构检查报告

## 📊 profiles 表结构分析

### 当前状态

✅ **profiles 表存在** - 包含 17 个字段

### 字段列表

| 序号 | 字段名        | 类型        | 可空 | 默认值          |
| ---- | ------------- | ----------- | ---- | --------------- |
| 1    | id            | uuid        | NO   | -               |
| 2    | email         | varchar     | NO   | -               |
| 3    | full_name     | varchar     | YES  | -               |
| 4    | avatar_url    | text        | YES  | -               |
| 5    | phone         | varchar     | YES  | -               |
| 6    | role          | varchar     | YES  | 'user'          |
| 7    | company_name  | varchar     | YES  | -               |
| 8    | company_role  | varchar     | YES  | -               |
| 9    | department    | varchar     | YES  | -               |
| 10   | language      | varchar     | YES  | 'zh-CN'         |
| 11   | timezone      | varchar     | YES  | 'Asia/Shanghai' |
| 12   | is_active     | boolean     | YES  | true            |
| 13   | is_verified   | boolean     | YES  | false           |
| 14   | last_login_at | timestamptz | YES  | -               |
| 15   | metadata      | jsonb       | YES  | '{}'            |
| 16   | created_at    | timestamptz | YES  | now()           |
| 17   | updated_at    | timestamptz | YES  | now()           |

### ⚠️ 缺失字段

- ❌ **tenant_id** (uuid) - 用于多租户隔离

---

## 🎯 下一步操作

### 需要执行的迁移脚本

#### 1️⃣ 添加 tenant_id 字段到所有表

```sql
-- 执行文件：20260324_add_tenant_id_to_tables.sql
```

**将为以下表添加 tenant_id 字段**:

- ✅ agents
- ✅ agent_orders
- ✅ user_agent_installations
- ✅ agent_audit_logs
- ✅ profiles (当前缺少此字段)
- ⚠️ notifications (如果存在)
- ⚠️ agent_subscription_reminders (如果存在)

#### 2️⃣ 应用 RLS 策略

```sql
-- 执行文件：20260324_enforce_tenant_isolation_rls.sql
```

**将为以下表创建 RLS 策略**:

- ✅ agents (4 条策略)
- ✅ agent_orders (2 条策略)
- ✅ user_agent_installations (1 条策略)
- ✅ agent_audit_logs (1 条策略)
- ✅ profiles (3 条策略)
- ⚠️ notifications (如果存在)
- ⚠️ agent_subscription_reminders (如果存在)

---

## 📋 完整验证步骤

### 步骤 1: 运行完整检查脚本

```sql
-- 执行：CHECK_ALL_TABLES.sql
-- 目的：查看所有表的结构和 tenant_id 字段状态
```

### 步骤 2: 添加 tenant_id 字段

```sql
-- 执行：20260324_add_tenant_id_to_tables.sql
-- 预期输出:
-- NOTICE:  ✅ tenant_id 字段添加完成！
-- NOTICE:  📋 已处理的表: ...
```

### 步骤 3: 验证字段已添加

```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'tenant_id'
ORDER BY table_name;
```

**预期结果**:
| table_name | column_name | data_type |
|------------|-------------|-----------|
| agents | tenant_id | uuid |
| agent_audit_logs | tenant_id | uuid |
| agent_orders | tenant_id | uuid |
| profiles | tenant_id | uuid |
| user_agent_installations | tenant_id | uuid |

### 步骤 4: 应用 RLS 策略

```sql
-- 执行：20260324_enforce_tenant_isolation_rls.sql
```

### 步骤 5: 验证 RLS 策略

```sql
SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%tenant%'
ORDER BY tablename, policyname;
```

**预期结果**: 应该看到至少 11 条 RLS 策略

---

## ⚠️ 重要说明

### profiles 表特殊性

根据检查结果，`profiles` 表目前没有 `tenant_id` 字段。这是正常的，因为：

1. **profiles 表存储用户基本信息** - 不属于特定租户
2. **用户可能属于多个租户** - 需要通过其他方式关联
3. **RLS 策略会特殊处理** - 基于用户角色而非 tenant_id

### 解决方案

在 RLS 策略中，我们使用以下方式：

```sql
-- 查询用户的租户 ID
tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
```

或者对于管理员：

```sql
OR EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid() AND role IN ('admin', 'system')
)
```

---

## ✅ 执行清单

- [ ] 运行 `CHECK_ALL_TABLES.sql` 查看完整表结构
- [ ] 执行 `20260324_add_tenant_id_to_tables.sql` 添加字段
- [ ] 验证所有核心表都有 `tenant_id` 字段
- [ ] 执行 `20260324_enforce_tenant_isolation_rls.sql` 应用 RLS
- [ ] 验证所有 RLS 策略已创建
- [ ] 测试普通用户只能访问自己租户的数据
- [ ] 测试管理员可以访问所有数据

---

## 📞 故障排查

### 如果遇到问题

1. **表不存在错误**
   - 运行 `CHECK_ALL_TABLES.sql` 确认表状态
   - 检查是否有拼写错误

2. **字段已存在错误**
   - 迁移脚本使用了 `IF NOT EXISTS`，可以安全重跑

3. **RLS 策略创建失败**
   - 确认 `tenant_id` 字段已添加
   - 检查是否有同名策略已存在

---

**报告生成时间**: 2026-03-24
**profiles 表状态**: ✅ 存在，但缺少 tenant_id 字段
**建议操作**: 立即执行迁移脚本添加 tenant_id
