# 数据库表字段映射指南

## 📊 核心表字段结构

### 1. agents (智能体表)

**关键字段**:

- `id` UUID - 主键
- `name` VARCHAR(255) - 智能体名称
- `tenant_id` UUID - **租户 ID** (需要添加)
- `status` VARCHAR(20) - 状态
- `created_by` VARCHAR(100) - 创建者
- `updated_by` VARCHAR(100) - 更新者

**RLS 策略中的用户标识**:

- 使用 `tenant_id` 进行租户隔离
- 管理员通过 `profiles.role` 判断

---

### 2. agent_orders (订单表)

**关键字段**:

- `id` UUID - 主键
- `order_number` VARCHAR(50) - 订单号
- `agent_id` UUID - 智能体 ID (外键)
- `buyer_id` UUID - **购买者 ID** (引用 auth.users)
- `developer_id` UUID - **开发者 ID** (引用 auth.users)
- `tenant_id` UUID - **租户 ID** (需要添加)
- `status` VARCHAR(20) - 订单状态

**❌ 错误**: 没有 `user_id` 字段

**✅ 正确的用户标识字段**:

- `buyer_id` - 购买者
- `developer_id` - 开发者

**RLS 策略**:

```sql
-- 查询条件
WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
   OR buyer_id = auth.uid()           -- 购买者可以查看
   OR developer_id = auth.uid()       -- 开发者可以查看
   OR EXISTS (...)                     -- 管理员可以查看
```

---

### 3. user_agent_installations (安装记录表)

**关键字段**:

- `id` UUID - 主键
- `agent_id` UUID - 智能体 ID
- `user_id` UUID - **用户 ID** (引用 auth.users) ✅
- `tenant_id` UUID - **租户 ID** (需要添加)

**✅ 有 user_id 字段**

**RLS 策略**:

```sql
WHERE user_id = auth.uid()            -- 用户可以查看自己的安装
   OR tenant_id = (...)                -- 租户成员可以查看
   OR EXISTS (...)                     -- 管理员可以查看
```

---

### 4. agent_audit_logs (审计日志表)

**关键字段**:

- `id` UUID - 主键
- `agent_id` UUID - 智能体 ID
- `action_type` VARCHAR(50) - 操作类型
- `action_by` UUID - **操作者 ID** (引用 auth.users)
- `tenant_id` UUID - **租户 ID** (需要添加)

**❌ 错误**: 没有 `user_id` 字段

**✅ 正确的用户标识字段**:

- `action_by` - 执行操作的用户

**RLS 策略**:

```sql
WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
   OR action_by = auth.uid()          -- 操作者可以查看
   OR EXISTS (...)                     -- 管理员可以查看
```

---

### 5. profiles (用户资料表)

**关键字段**:

- `id` UUID - 主键 (引用 auth.users)
- `email` VARCHAR - 邮箱
- `role` VARCHAR - 角色 ('user', 'admin', 'system')
- `tenant_id` UUID - **租户 ID** (需要添加)

**RLS 策略**:

```sql
-- 查看自己的资料
WHERE id = auth.uid()

-- 查看所有资料（管理员）
WHERE EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid() AND p.role IN ('admin', 'system')
)
```

---

## 🔧 RLS 策略字段映射总结

### 用户标识字段对照表

| 表名                     | 用户标识字段           | 说明                    |
| ------------------------ | ---------------------- | ----------------------- |
| agents                   | (无直接字段)           | 通过 tenant_id 间接关联 |
| agent_orders             | buyer_id, developer_id | 购买者和开发者          |
| user_agent_installations | user_id                | 安装用户                |
| agent_audit_logs         | action_by              | 执行操作的用户          |
| profiles                 | id                     | 用户本人                |

### 租户隔离字段

| 表名     | 租户字段  | 获取方式                                               |
| -------- | --------- | ------------------------------------------------------ |
| 所有表   | tenant_id | `SELECT tenant_id FROM profiles WHERE id = auth.uid()` |
| profiles | (自身)    | 直接使用 id                                            |

---

## ⚠️ 常见错误与修复

### 错误 1: 使用 user_id 访问不存在的字段

**错误代码**:

```sql
WHERE user_id = auth.uid()  -- ❌ 错误！很多表没有 user_id
```

**正确代码**:

```sql
-- agent_orders 表
WHERE buyer_id = auth.uid()
   OR developer_id = auth.uid()

-- agent_audit_logs 表
WHERE action_by = auth.uid()

-- user_agent_installations 表
WHERE user_id = auth.uid()  -- ✅ 这个表有 user_id
```

### 错误 2: 忘记管理员权限检查

**错误代码**:

```sql
WHERE tenant_id = (...)  -- 只有租户隔离，没有管理员例外
```

**正确代码**:

```sql
WHERE tenant_id = (...)
   OR EXISTS (
     SELECT 1 FROM profiles
     WHERE id = auth.uid() AND role IN ('admin', 'system')
   )
```

---

## 📝 迁移脚本执行清单

### 步骤 1: 添加 tenant_id 字段

```sql
-- 执行：20260324_add_tenant_id_to_tables.sql
```

**将为以下表添加 tenant_id**:

- ✅ agents
- ✅ agent_orders
- ✅ user_agent_installations
- ✅ agent_audit_logs
- ✅ profiles

### 步骤 2: 应用 RLS 策略

```sql
-- 执行：20260324_enforce_tenant_isolation_rls.sql
```

**注意**: 已修复字段映射错误

- ✅ agent_orders 使用 buyer_id 和 developer_id
- ✅ agent_audit_logs 使用 action_by
- ✅ user_agent_installations 使用 user_id

### 步骤 3: 验证

```sql
-- 检查 tenant_id 字段
SELECT table_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
ORDER BY table_name;

-- 检查 RLS 策略
SELECT tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%tenant%';
```

---

## 🎯 最佳实践

### 1. 始终使用正确的字段名

- ❌ 不要假设所有表都有 `user_id`
- ✅ 检查实际表结构，使用正确的字段名

### 2. 为所有相关表添加 tenant_id

- 确保数据归属清晰
- 支持多租户隔离
- 便于数据权限管理

### 3. RLS 策略要完整

- 包含租户隔离
- 包含用户个人权限
- 包含管理员例外

### 4. 索引优化

```sql
-- 为常用查询条件创建复合索引
CREATE INDEX idx_table_tenant_user ON table_name(tenant_id, user_id_field);
```

---

**文档版本**: v1.0
**更新时间**: 2026-03-24
**状态**: ✅ 已修复所有字段映射错误
