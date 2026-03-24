# 数据库迁移执行指南

## ⚠️ 重要提示

**不要直接在 Supabase Dashboard 中运行 `20260324_execute_all_migrations.sql`！**

该文件包含 psql 命令行工具特有的命令（`\echo`, `\i`），这些不是标准 SQL 语法。

---

## ✅ 正确的执行方式

### 方式 1: 使用 Supabase Dashboard（推荐）

1. **打开 Supabase Dashboard**
   - 访问 https://app.supabase.com
   - 选择你的项目
   - 进入 SQL Editor

2. **依次执行迁移文件**

   **第一步**: 复制并执行 `20260324_add_subscription_pause_fields.sql`

   ```sql
   -- 复制该文件的全部内容并在 SQL Editor 中执行
   ```

   **第二步**: 复制并执行 `20260324_create_subscription_reminders.sql`

   ```sql
   -- 复制该文件的全部内容并在 SQL Editor 中执行
   ```

   **第三步**: （可选）验证迁移结果

   ```sql
   -- 复制 20260324_execute_all_migrations.sql 中的 SELECT 语句部分
   ```

### 方式 2: 使用命令行工具（本地开发）

如果你使用本地 PostgreSQL 或已安装 psql 工具：

```bash
# 设置数据库连接
export DATABASE_URL="postgresql://postgres:password@localhost:54322/postgres"

# 依次执行迁移
psql $DATABASE_URL -f supabase/migrations/20260324_add_subscription_pause_fields.sql
psql $DATABASE_URL -f supabase/migrations/20260324_create_subscription_reminders.sql

# 验证迁移结果（可选）
psql $DATABASE_URL -f supabase/migrations/20260324_execute_all_migrations.sql
```

### 方式 3: 使用 Supabase CLI

```bash
# 链接到你的 Supabase 项目
supabase link --project-ref your-project-ref

# 应用所有迁移
supabase db push
```

---

## 📋 验证迁移结果

执行以下查询验证迁移是否成功：

### 1. 检查 pause fields

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_agent_installations'
  AND column_name IN (
    'paused_at',
    'resumed_at',
    'pause_reason',
    'max_pause_count',
    'current_pause_count'
  )
ORDER BY ordinal_position;
```

**预期结果**: 应该显示 5 个新字段

### 2. 检查 reminders 表

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'agent_subscription_reminders'
ORDER BY ordinal_position;
```

**预期结果**: 应该显示完整的表结构

### 3. 检查索引

```sql
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_agent_installations', 'agent_subscription_reminders')
  AND (indexname LIKE '%pause%' OR indexname LIKE '%reminder%')
ORDER BY tablename, indexname;
```

**预期结果**: 应该显示所有相关索引

---

## 🔍 故障排查

### 问题 1: 表不存在

**错误**: `relation "user_agent_installations" does not exist`

**解决方案**:

1. 确认基础表已创建
2. 检查是否需要先执行其他迁移文件
3. 查看 `032_create_user_agent_installations.sql` 是否已执行

### 问题 2: 权限不足

**错误**: `permission denied for table`

**解决方案**:

```sql
-- 使用具有 admin 权限的账户执行
-- 或在 Supabase Dashboard 中使用 SQL Editor
```

### 问题 3: 字段已存在

**警告**: `column "paused_at" of relation "user_agent_installations" already exists`

**解决方案**:

- 这是正常的，说明迁移已经执行过
- 可以跳过该步骤继续下一步

---

## 📝 迁移文件说明

### 20260324_add_subscription_pause_fields.sql

**功能**: 为订阅添加暂停/恢复功能

**新增字段**:

- `paused_at` - 订阅暂停时间
- `resumed_at` - 订阅恢复时间
- `pause_reason` - 暂停原因
- `max_pause_count` - 最大允许暂停次数 (默认 3)
- `current_pause_count` - 当前已使用暂停次数 (默认 0)

### 20260324_create_subscription_reminders.sql

**功能**: 创建订阅提醒记录表

**新建表**: `agent_subscription_reminders`

**用途**: 跟踪发送给用户的订阅到期提醒，防止重复发送

### 20260324_execute_all_migrations.sql

**功能**: 验证查询脚本（不包含实际迁移逻辑）

**用途**: 在执行完前两个迁移后，用于验证迁移结果

---

## 🎯 后续步骤

迁移完成后：

1. ✅ 验证所有字段和索引已正确创建
2. ✅ 测试订阅暂停/恢复功能
3. ✅ 配置 SendGrid 和 Twilio 环境变量
4. ✅ 测试订阅提醒调度器
5. ✅ 配置 Vercel Cron 定时任务

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 Supabase Dashboard 的 Logs
2. 检查数据库连接是否正常
3. 确认依赖表已正确创建
4. 参考 IMPLEMENTATION_REPORT_20260324.md 获取更多信息

---

**最后更新**: 2026-03-24
**维护者**: FixCycle Team
