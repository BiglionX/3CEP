# 📋 SQL 目录操作指南

## 🎯 快速开始（必须执行）

### ✅ 第 1 步：创建核心表结构

**文件**: [`multi-type-user-management-simple.sql`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql)
**优先级**: 🔴 **最高 - 必须执行**
**说明**: 创建多类型用户管理的完整数据库结构

#### 执行方式：

**方法 A: Supabase Dashboard（推荐）**

```
1. 打开 https://supabase.com/dashboard/project/hrjqzbhqueleszkvnsen/sql
2. 点击 "New Query"
3. 复制 multi-type-user-management-simple.sql 全部内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行
```

**方法 B: psql 命令行**

```bash
psql postgresql://postgres:your_password@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres < sql/multi-type-user-management-simple.sql
```

**预期结果**:

- ✅ 创建 4 个核心表
- ✅ 创建 1 个统计视图
- ✅ 创建 26+ 个索引
- ✅ 创建 4 个触发器

---

### ✅ 第 2 步：验证表结构

**文件**: [`verify-multi-type-users.sql`](file://d:\BigLionX\3cep\sql\verify-multi-type-users.sql)
**优先级**: 🟡 高 - 建议执行
**说明**: 验证数据库表是否正确创建

#### 执行方式：

在 Supabase Dashboard 中执行此 SQL，查看验证结果。

**预期输出**:

```
用户相关表总数：13
索引总数：26
触发器总数：4
```

---

### ✅ 第 3 步：插入测试数据（可选）

**文件**: [`insert-sample-users.sql`](file://d:\BigLionX\3cep\sql\insert-sample-users.sql)
**优先级**: 🟢 中 - 开发环境推荐
**说明**: 插入 11 个示例用户用于测试

#### 执行后的数据：

- 👤 3 个个人用户（张三、李四、王五）
- 🏪 3 个维修店（诚信手机维修、快速家电、小李快修）
- 🏭 3 个企业（深圳电子科技、上海贸易、北京智能科技）
- 🌐 2 个外贸公司（广州国际贸易、宁波出口贸易）

**⚠️ 警告**: 请勿在生产环境执行！

---

## 📊 完整操作清单

### 阶段一：基础架构（必须完成）

| 步骤 | 文件名                                  | 作用           | 状态      |
| ---- | --------------------------------------- | -------------- | --------- |
| 1    | `multi-type-user-management-simple.sql` | 创建核心表结构 | ⏳ 待执行 |
| 2    | `verify-multi-type-users.sql`           | 验证表结构     | ⏳ 待执行 |
| 3    | `insert-sample-users.sql`               | 添加测试数据   | ⏳ 可选   |

---

### 阶段二：权限配置（如果需要）

| 文件                       | 作用                    | 执行条件     |
| -------------------------- | ----------------------- | ------------ |
| `admin-permission-fix.sql` | 修复管理员权限          | 权限有问题时 |
| `complete-rls-fix.sql`     | 配置行级安全策略        | 需要 RLS 时  |
| `fix-admin-users-rls.sql`  | 修复 admin_users 的 RLS | RLS 报错时   |
| `simple-rls-fix.sql`       | 简单的 RLS 修复         | 快速修复 RLS |

**⚠️ 注意**: 这些是修复脚本，仅在遇到问题时执行。

---

### 阶段三：其他业务模块（按需执行）

#### 企业相关模块

| 文件                                   | 说明             |
| -------------------------------------- | ---------------- |
| `enterprise-module-migration.sql`      | 企业模块迁移     |
| `foreign-trade-schema.sql`             | 外贸公司表结构   |
| `foreign-trade-partners-extended.sql`  | 外贸合作伙伴扩展 |
| `foreign-trade-logistics-extended.sql` | 外贸物流扩展     |

#### 采购与销售

| 文件                        | 说明                   |
| --------------------------- | ---------------------- |
| `procurement-intelligence/` | 采购智能模块（文件夹） |
| `sales-agent-schema.sql`    | 销售代理表结构         |

#### 其他功能

| 文件                             | 说明         |
| -------------------------------- | ------------ |
| `create_batch_qrcode_tables.sql` | 批量二维码表 |
| `tracking-events-schema.sql`     | 追踪事件表   |
| `shop-review-enhancement.sql`    | 店铺审核增强 |

---

### 阶段四：系统管理（谨慎执行）

| 文件                             | 作用           | ⚠️ 警告         |
| -------------------------------- | -------------- | --------------- |
| `create-admin-system-tables.sql` | 创建管理系统表 | 可能影响现有表  |
| `setup-admin-system.sql`         | 设置管理系统   | 会重置配置      |
| `rebuild-admin-tables.sql`       | 重建管理表     | 🔴 会删除旧数据 |
| `init-test-database.sql`         | 初始化测试库   | 仅测试环境使用  |

---

## 🚀 标准操作流程（SOP）

### 新项目实施步骤

#### 1️⃣ 开发环境搭建

```bash
# 1. 执行核心迁移
psql YOUR_DATABASE_URL < sql/multi-type-user-management-simple.sql

# 2. 验证结构
psql YOUR_DATABASE_URL < sql/verify-multi-type-users.sql

# 3. 添加测试数据（可选）
psql YOUR_DATABASE_URL < sql/insert-sample-users.sql
```

#### 2️⃣ 生产环境部署

```bash
# 1. 备份现有数据库
pg_dump YOUR_DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. 执行核心迁移
psql YOUR_DATABASE_URL < sql/multi-type-user-management-simple.sql

# 3. 验证数据完整性
psql YOUR_DATABASE_URL < sql/verify-multi-type-users.sql

# 4. 配置权限（如需要）
psql YOUR_DATABASE_URL < sql/complete-rls-fix.sql
```

---

## ⚠️ 注意事项

### 🔴 禁止操作

❌ **不要**在生产环境执行 `insert-sample-users.sql`
❌ **不要**随意执行 `rebuild-admin-tables.sql`（会删表）
❌ **不要**同时执行多个冲突的迁移脚本
❌ **不要**在没有备份的情况下修改生产数据库

### ✅ 最佳实践

✅ **先备份再执行**任何 SQL 脚本
✅ **先在测试环境验证**后再部署生产
✅ **按顺序执行**迁移脚本
✅ **执行后验证**数据和表结构
✅ **记录执行日志**便于问题排查

---

## 📝 执行记录模板

### 数据库迁移日志

```markdown
## 执行时间

2026-03-22 14:30

## 执行的脚本

- [x] multi-type-user-management-simple.sql
- [x] verify-multi-type-users.sql
- [ ] insert-sample-users.sql (跳过，生产环境)

## 执行结果

✅ 成功创建 4 个核心表
✅ 成功创建 26 个索引
✅ 统计视图可用

## 验证查询

SELECT COUNT(\*) FROM user_accounts;
-- 返回：0 (开发环境) 或 N (生产环境)

## 问题记录

无 / 或详细描述

## 回滚方案

如需回滚，执行：
DROP TABLE IF EXISTS enterprise_users_detail CASCADE;
DROP TABLE IF EXISTS repair_shop_users_detail CASCADE;
DROP TABLE IF EXISTS individual_users CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP VIEW IF EXISTS user_stats_view CASCADE;
```

---

## 🎯 当前推荐操作

### 立即执行（3 个文件）

1. **`multi-type-user-management-simple.sql`**

   ```sql
   -- 在 Supabase Dashboard 执行
   -- 内容见文件全文
   ```

2. **`verify-multi-type-users.sql`**

   ```sql
   -- 验证脚本，确认表已创建
   SELECT * FROM user_stats_view;
   ```

3. **`insert-sample-users.sql`** (仅开发环境)
   ```sql
   -- 插入测试数据
   -- 生产环境请跳过此步骤
   ```

---

## 🔍 故障排查

### 问题 1: 表已存在错误

**错误**: `relation "user_accounts" already exists`
**解决**:

```sql
-- 如果确定要重建，先删除旧表
DROP TABLE IF EXISTS enterprise_users_detail CASCADE;
DROP TABLE IF EXISTS repair_shop_users_detail CASCADE;
DROP TABLE IF EXISTS individual_users CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP VIEW IF EXISTS user_stats_view CASCADE;

-- 然后重新执行迁移脚本
```

### 问题 2: 权限不足

**错误**: `permission denied for table`
**解决**:

```sql
-- 使用有权限的用户执行
-- 通常是 postgres 用户或有 admin 角色的用户
```

### 问题 3: 外键约束失败

**错误**: `insert or update violates foreign-key constraint`
**解决**:

```sql
-- 确保 auth.users 表中存在对应的 user_id
-- 或者先插入主表，再插入关联表
```

---

## 📞 需要帮助？

### 诊断查询

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%user%';

-- 检查索引
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_accounts', 'individual_users', 'repair_shop_users_detail', 'enterprise_users_detail');

-- 检查触发器
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('user_accounts', 'individual_users', 'repair_shop_users_detail', 'enterprise_users_detail');
```

---

## 🎉 完成检查清单

- [ ] 执行 `multi-type-user-management-simple.sql`
- [ ] 执行 `verify-multi-type-users.sql` 验证成功
- [ ] （可选）执行 `insert-sample-users.sql` 添加测试数据
- [ ] 确认前端页面可以访问 `/admin/users`
- [ ] 确认统计数据正确显示
- [ ] 记录执行日志
- [ ] 备份数据库（生产环境）

---

_文档版本：v1.0_
_更新时间：2026-03-22_
_适用环境：开发/测试/生产_
