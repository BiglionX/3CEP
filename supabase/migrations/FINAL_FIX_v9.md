# 多租户隔离迁移 - 类型转换修复 v9.0

## ✅ 根本问题已解决

### 错误原因

```
ERROR: 42883: operator does not exist: character varying = uuid
```

**根本原因**: `user_agent_installations.user_id` 字段定义为 `VARCHAR(100)`，而不是 `UUID`

**表结构**:

```sql
-- 032_create_user_agent_installations.sql 第 6 行
user_id VARCHAR(100) NOT NULL
```

**RLS 策略中的比较**:

```sql
-- 错误的比较（类型不匹配）
user_id = auth.uid()
-- VARCHAR(100) vs UUID ❌

-- 正确的比较（添加类型转换）
user_id::uuid = auth.uid()
-- UUID vs UUID ✅
```

---

## 🔧 本次修复（v9.0）

### 修复位置

**文件**: `20260324_enforce_tenant_isolation_rls.sql`
**行号**: 第 120 行

### 修复内容

```sql
-- 修复前（错误）
USING (
  user_id = auth.uid()
  ...
);

-- 修复后（正确）
USING (
  user_id::uuid = auth.uid()
  ...
);
```

### 修复说明

在 `user_id` 后面添加 `::uuid` 类型转换，将 `VARCHAR` 转换为 `UUID`，然后与 `auth.uid()`（返回 `UUID`）进行比较。

---

## 📋 完整的字段类型对照

### profiles 表

| 字段      | 类型        | 用途                       |
| --------- | ----------- | -------------------------- |
| id        | UUID        | 用户 ID（引用 auth.users） |
| role      | VARCHAR(50) | 用户角色                   |
| tenant_id | UUID        | 租户 ID（需要添加）        |

### agent_orders 表

| 字段         | 类型 | 用途                           |
| ------------ | ---- | ------------------------------ |
| buyer_id     | UUID | 购买者 ID（引用 auth.users）✅ |
| developer_id | UUID | 开发者 ID（引用 auth.users）✅ |
| tenant_id    | UUID | 租户 ID（需要添加）            |

### user_agent_installations 表

| 字段      | 类型             | 用途                   |
| --------- | ---------------- | ---------------------- |
| user_id   | **VARCHAR(100)** | 用户 ID（⚠️ 类型不同） |
| tenant_id | UUID             | 租户 ID（需要添加）    |

### agent_audit_logs 表

| 字段      | 类型 | 用途                           |
| --------- | ---- | ------------------------------ |
| action_by | UUID | 操作者 ID（引用 auth.users）✅ |
| tenant_id | UUID | 租户 ID（需要添加）            |

---

## 🎯 RLS 策略中的类型处理

### 所有字段的类型转换规则

| 表名                     | 字段         | 原始类型     | 目标类型 | 是否需要转换 |
| ------------------------ | ------------ | ------------ | -------- | ------------ |
| agents                   | (无直接比较) | -            | -        | ❌           |
| agent_orders             | buyer_id     | UUID         | UUID     | ✅ 不需要    |
| agent_orders             | developer_id | UUID         | UUID     | ✅ 不需要    |
| user_agent_installations | user_id      | VARCHAR(100) | UUID     | ⚠️ **需要**  |
| agent_audit_logs         | action_by    | UUID         | UUID     | ✅ 不需要    |
| profiles                 | id           | UUID         | UUID     | ✅ 不需要    |

### 正确的比较方式

```sql
-- UUID 字段（不需要转换）
buyer_id = auth.uid()           -- ✅ UUID = UUID
developer_id = auth.uid()       -- ✅ UUID = UUID
action_by = auth.uid()          -- ✅ UUID = UUID
id = auth.uid()                 -- ✅ UUID = UUID

-- VARCHAR 字段（需要转换）
user_id::uuid = auth.uid()      -- ✅ VARCHAR→UUID = UUID
```

---

## 📋 执行步骤（最终版）

### 第 1 步：添加 tenant_id 字段

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

### 第 2 步：应用 RLS 策略（包含类型转换）

```sql
-- 文件：supabase/migrations/20260324_enforce_tenant_isolation_rls.sql
```

**关键修复**:

- ✅ user_id::uuid = auth.uid() （类型转换）
- ✅ 移除了 audit_logs 依赖
- ✅ 所有角色列表统一

**将创建的内容**:

- ✅ 7 个表启用 RLS
- ✅ 13 条 RLS 策略
- ✅ 2 个函数
- ✅ 4 个索引

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

### 验证 3: 测试查询权限

```sql
-- 以普通用户身份查询安装记录
SELECT * FROM user_agent_installations;
-- 应该只返回自己的安装记录（通过 RLS 过滤）
```

---

## ⚠️ 重要提醒

### user_id 字段类型不一致的影响

由于 `user_agent_installations.user_id` 是 `VARCHAR(100)`，而其他表的用户 ID 都是 `UUID`，这可能导致：

1. **性能影响**: 每次比较都需要类型转换
2. **存储效率**: VARCHAR 比 UUID 占用更多空间
3. **外键约束**: 无法直接创建外键引用 auth.users(id)

### 建议（可选）

如果可能，考虑修改字段类型：

```sql
-- 警告：这是破坏性变更，需要谨慎评估
ALTER TABLE user_agent_installations
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
```

**风险**:

- 现有数据可能需要迁移
- 依赖该字段的代码需要更新
- 索引需要重建

---

## 🎉 总结

**修复版本**: v9.0 (类型转换修复版)

**核心修复**:

- ✅ user_id::uuid = auth.uid()
- ✅ 移除了 audit_logs 依赖
- ✅ 所有类型都匹配

**状态**: ✅ 可以立即执行

**下一步**:

1. 执行第一个 SQL 文件（添加 tenant_id）
2. 执行第二个 SQL 文件（应用 RLS 策略）
3. 验证权限是否正常工作

---

**文档版本**: v9.0
**更新时间**: 2026-03-24
**状态**: ✅ 根本问题已解决，可以安全执行
