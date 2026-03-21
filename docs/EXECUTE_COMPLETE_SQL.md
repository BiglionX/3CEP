# 🚀 一键执行 SQL - 完整步骤

## ✅ 文件位置

**文件**: [`sql/multi-type-user-management-simple.sql`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql)

**内容包含**:

- ✅ 4 个核心表（user_accounts, individual_users, repair_shop_users_detail, enterprise_users_detail）
- ✅ 1 个统计视图（user_stats_view）
- ✅ 26 个索引
- ✅ 4 个触发器
- ✅ 完整的注释和说明

---

## 📝 执行步骤（5 步完成）

### 第 1 步：打开 Supabase Dashboard

访问：https://supabase.com/dashboard/project/hrjqzbhqueleszkvnsen/sql

### 第 2 步：创建新查询

点击 **"New Query"** 按钮

### 第 3 步：复制 SQL 文件内容

打开文件 `sql/multi-type-user-management-simple.sql`，复制**全部内容**

或者直接使用文件中的内容（共 322 行）

### 第 4 步：粘贴并执行

1. 将内容粘贴到 SQL Editor
2. 点击 **"Run"** 按钮
3. 等待执行完成（约 5-10 秒）

### 第 5 步：验证结果

看到以下提示表示成功：

```
✅ 多类型用户管理表结构创建完成！
```

---

## ✔️ 预期输出

执行成功后，您应该看到：

### 消息面板显示

```
SUCCESS: CREATE TABLE
SUCCESS: CREATE INDEX (x9)
SUCCESS: CREATE TABLE
SUCCESS: CREATE INDEX (x2)
SUCCESS: CREATE TABLE
SUCCESS: CREATE INDEX (x3)
SUCCESS: CREATE TABLE
SUCCESS: CREATE INDEX (x4)
SUCCESS: CREATE VIEW
SUCCESS: CREATE FUNCTION
SUCCESS: CREATE TRIGGER (x4)
```

### 验证查询

执行以下 SQL 验证：

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
);

-- 应该返回 4 行结果

-- 检查统计视图
SELECT * FROM user_stats_view;

-- 应该返回一行统计数据（初始都是 0）
```

---

## 🎯 创建的数据库对象

### 表（4 个）

1. **user_accounts** - 统一用户账户表（20+ 字段）
2. **individual_users** - C 端个人用户详情表（15 字段）
3. **repair_shop_users_detail** - 维修店详情表（20 字段）
4. **enterprise_users_detail** - 企业用户详情表（25 字段）

### 索引（26 个）

- user_accounts: 9 个索引
- individual_users: 2 个索引
- repair_shop_users_detail: 3 个索引
- enterprise_users_detail: 4 个索引
- 其他：8 个索引

### 视图（1 个）

- **user_stats_view** - 实时用户统计视图

### 触发器（4 个）

- trg_update_user_account_updated_at
- trg_update_individual_updated_at
- trg_update_repair_shop_updated_at
- trg_update_enterprise_updated_at

---

## ⚠️ 常见问题

### 问题 1: "relation already exists"

**错误**: `relation "user_accounts" already exists`

**原因**: 表已经存在

**解决方案 A**: 如果确认要重建（会丢失数据！）

```sql
-- 先删除旧表（谨慎操作！）
DROP TABLE IF EXISTS enterprise_users_detail CASCADE;
DROP TABLE IF EXISTS repair_shop_users_detail CASCADE;
DROP TABLE IF EXISTS individual_users CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP VIEW IF EXISTS user_stats_view CASCADE;

-- 然后重新执行迁移脚本
```

**解决方案 B**: 跳过已存在的表

- 忽略这些错误，继续执行
- 只执行成功的部分即可

### 问题 2: "permission denied"

**错误**: `permission denied for schema public`

**原因**: 权限不足

**解决**: 使用有足够权限的用户（通常是 postgres）

### 问题 3: 语法错误

**错误**: `syntax error at or near "account_type"`

**原因**: 可能只复制了部分 SQL 语句

**解决**:

- ✅ 确保复制**完整的文件内容**（从第 1 行到第 322 行）
- ✅ 不要只复制片段
- ✅ 从 `CREATE TABLE IF NOT EXISTS user_accounts` 开始

---

## 📊 执行后的下一步

### 1. 验证表结构

```sql
-- 查看表结构
\d user_accounts

-- 或在 Supabase Dashboard 中
-- Table Editor -> user_accounts -> Columns
```

### 2. 添加测试数据（可选）

执行 `sql/insert-sample-users.sql` 插入 11 个测试用户

### 3. 访问前端页面

```
http://localhost:3001/admin/users
```

### 4. 查看统计数据

```sql
SELECT * FROM user_stats_view;
```

---

## 🎉 完成标志

当您看到以下内容时，表示执行成功：

```
✅ 多类型用户管理表结构创建完成！
```

并且在左侧 Table Editor 中能看到：

- ✅ user_accounts
- ✅ individual_users
- ✅ repair_shop_users_detail
- ✅ enterprise_users_detail

---

## 📞 需要帮助？

### 诊断查询

```sql
-- 检查所有创建的对象
SELECT
  'Tables' as type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%user%'

UNION ALL

SELECT
  'Indexes' as type,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_accounts', 'individual_users', 'repair_shop_users_detail', 'enterprise_users_detail')

UNION ALL

SELECT
  'Views' as type,
  COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'user_stats_view';
```

---

_文档版本：v1.0_
_更新时间：2026-03-22_
_适用环境：开发/测试/生产_
