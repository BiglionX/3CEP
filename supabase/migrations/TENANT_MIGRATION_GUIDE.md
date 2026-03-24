# 多租户隔离迁移指南

## 问题说明

在执行 `20260324_enforce_tenant_isolation_rls.sql` 时遇到错误：

```
ERROR: 42703: column "tenant_id" does not exist
```

**原因**: 相关表中还没有 `tenant_id` 字段，RLS 策略无法引用不存在的列。

## 解决方案

需要按顺序执行两个迁移文件：

### 1️⃣ 第一步：添加 tenant_id 字段

**文件**: `20260324_add_tenant_id_to_tables.sql`

**作用**: 为所有相关表添加 `tenant_id` 字段

**执行的表**:

- ✅ agents
- ✅ agent_orders
- ✅ user_agent_installations
- ✅ audit_logs
- ✅ notifications
- ✅ agent_subscription_reminders
- ✅ profiles

**内容**:

```sql
-- 为每个表添加 tenant_id 字段
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE agent_orders ADD COLUMN IF NOT EXISTS tenant_id UUID;
-- ... 其他表

-- 为现有数据设置默认租户 ID
UPDATE agents SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
```

### 2️⃣ 第二步：应用 RLS 策略

**文件**: `20260324_enforce_tenant_isolation_rls.sql`

**作用**: 在已有 `tenant_id` 字段的基础上，创建行级安全策略

**内容**:

```sql
-- 启用 RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 创建策略（现在 tenant_id 字段已存在）
CREATE POLICY "tenant_isolation_select" ON agents
FOR SELECT USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'system'))
);
```

## 执行顺序

### Supabase Dashboard

1. 打开 Supabase Dashboard → SQL Editor
2. **先执行**: `20260324_add_tenant_id_to_tables.sql`
   - 等待执行完成
   - 确认所有表都添加了 `tenant_id` 字段
3. **再执行**: `20260324_enforce_tenant_isolation_rls.sql`
   - 等待执行完成
   - 确认所有 RLS 策略创建成功

### 命令行（psql）

```bash
# 1. 添加字段
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20260324_add_tenant_id_to_tables.sql

# 2. 应用 RLS 策略
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20260324_enforce_tenant_isolation_rls.sql
```

### Supabase CLI

```bash
# 推送到远程数据库
supabase db push
```

## 验证步骤

### 1. 检查字段是否添加成功

```sql
-- 检查 agents 表是否有 tenant_id
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents' AND column_name = 'tenant_id';

-- 应该返回一行：tenant_id | uuid
```

### 2. 检查 RLS 策略是否创建

```sql
-- 查看 agents 表的 RLS 策略
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'agents';

-- 应该看到 4 条策略：select, insert, update, delete
```

### 3. 测试租户隔离

```sql
-- 以普通用户身份查询（应该只返回自己租户的数据）
SELECT * FROM agents;

-- 以管理员身份查询（应该返回所有数据）
-- 需要先设置角色
```

## 注意事项

### ⚠️ 数据备份

在执行迁移前，建议备份重要数据：

```sql
-- 备份 agents 表
CREATE TABLE agents_backup AS SELECT * FROM agents;

-- 备份其他表
CREATE TABLE agent_orders_backup AS SELECT * FROM agent_orders;
-- ... 其他表
```

### ⚠️ 执行时机

- **低峰期执行**: 避免在业务高峰期执行
- **测试环境先测**: 先在测试环境验证
- **监控性能**: 执行后观察数据库性能

### ⚠️ 回滚方案

如果执行失败，可以回滚：

```sql
-- 删除 RLS 策略
DROP POLICY IF EXISTS "tenant_isolation_select" ON agents;
-- ... 其他策略

-- 禁用 RLS
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;

-- 删除 tenant_id 字段（谨慎操作，会丢失数据）
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
```

## 常见问题

### Q1: 为什么要分成两个文件？

**A**: 因为 RLS 策略中引用了 `tenant_id` 字段，必须先有字段才能创建策略。分开执行确保依赖关系正确。

### Q2: 默认租户 ID 是什么？

**A**: 使用 `'00000000-0000-0000-0000-000000000001'` 作为系统租户 ID。后续可以根据业务需求分配真实的租户 ID。

### Q3: 执行失败怎么办？

**A**:

1. 检查错误信息
2. 查看数据库日志
3. 确认表结构是否正确
4. 逐步执行 SQL 语句定位问题

### Q4: 会影响现有业务吗？

**A**:

- 添加字段不会影响现有数据
- RLS 策略启用后，查询会自动加上过滤条件
- 管理员账号不受影响（可以访问所有数据）
- 普通用户只能看到自己租户的数据

## 迁移完成后

### 更新代码

确保所有 API 调用都包含 `tenant_id` 过滤：

```typescript
// ✅ 正确
const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('tenant_id', context.tenantId);

// ❌ 错误（会被 RLS 拦截）
const { data } = await supabase.from('agents').select('*'); // 没有限制租户
```

### 测试验证

- [ ] 普通用户只能查看自己租户的数据
- [ ] 管理员可以查看所有数据
- [ ] 跨租户访问被拒绝
- [ ] 审计日志正常记录

---

**创建时间**: 2026-03-24
**版本**: v1.0
**状态**: 待执行
