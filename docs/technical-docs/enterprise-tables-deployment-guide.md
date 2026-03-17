# 企业管理数据表部署指南

## 📋 概述

本文档说明如何部署企业管理后台所需的完整数据表结构。

## 🗄️ 数据表清单

企业管理系统需要以下数据表文件：

### 1. 核心表（必须先执行）

- **`enterprise-core-tables.sql`** - 企业管理核心表
  - `enterprise_users` - 企业用户表
  - `enterprise_team_members` - 企业团队成员表
  - `enterprise_permissions` - 企业权限定义表
  - `enterprise_audit_logs` - 企业操作日志表
  - `enterprise_token_accounts` - 企业Token账户表
  - `enterprise_agents` - 企业智能体配置表

### 2. 扩展表（可选）

- **`enterprise-devices-tables.sql`** - 企业设备管理表
  - `enterprise_devices` - 企业设备表
  - 相关视图和函数

### 3. 功能模块表（已有）

- **`026_enterprise_documents_management.sql`** - 企业文档管理表
- **`crowdfunding-tables.sql`** - 新品众筹表
- **`reward-qa-tables.sql`** - 有奖问答表

## 🚀 部署步骤

### 方法一：在 Supabase 控制台执行

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 按以下顺序执行 SQL 文件：

```bash
# 第一步：执行核心表
执行 enterprise-core-tables.sql 的全部内容

# 第二步：执行设备管理表（可选）
执行 enterprise-devices-tables.sql 的全部内容
```

### 方法二：使用 psql 命令行

```bash
# 设置数据库连接参数
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
# 密码从 Supabase 控制台获取

# 执行核心表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f docs/technical-docs/enterprise-core-tables.sql

# 执行设备管理表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f docs/technical-docs/enterprise-devices-tables.sql
```

### 方法三：使用 Docker

```bash
# 复制 SQL 文件到 Docker 容器
docker cp docs/technical-docs/enterprise-core-tables.sql supabase-db:/tmp/
docker cp docs/technical-docs/enterprise-devices-tables.sql supabase-db:/tmp/

# 进入容器并执行
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/enterprise-core-tables.sql
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/enterprise-devices-tables.sql
```

## ⚠️ 注意事项

### 执行顺序很重要

1. **必须先执行 `enterprise-core-tables.sql`**
   - 包含基础的企业用户表 `enterprise_users`
   - 其他表都依赖此表

2. **然后执行 `enterprise-devices-tables.sql`**
   - 依赖 `enterprise_users` 表
   - 包含设备管理相关表

3. **其他功能模块表可以按需执行**
   - `crowdfunding-tables.sql` - 众筹功能
   - `reward-qa-tables.sql` - 有奖问答功能

### 已有的表

以下表已存在于数据库中，无需重复创建：

- `enterprise_documents` - 在 `026_enterprise_documents_management.sql` 中定义
- `document_categories` - 文档分类表
- `document_approval_workflow` - 文档审批流程表
- `auth.users` - Supabase 自带的用户表

## 📊 数据表关系图

```
enterprise_users (企业用户表)
    ├── enterprise_team_members (团队成员)
    ├── enterprise_token_accounts (Token账户)
    ├── enterprise_agents (智能体)
    ├── enterprise_devices (设备) ← 在 enterprise-devices-tables.sql
    ├── enterprise_audit_logs (操作日志)
    ├── enterprise_documents (文档) ← 已存在
    └── crowdfunding_projects (众筹项目) ← 已存在
```

## ✅ 验证部署

执行完 SQL 后，可以使用以下查询验证表是否创建成功：

```sql
-- 检查核心表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'enterprise_%'
ORDER BY table_name;

-- 应该看到以下表：
-- enterprise_agents
-- enterprise_audit_logs
-- enterprise_devices
-- enterprise_permissions
-- enterprise_team_members
-- enterprise_token_accounts
-- enterprise_users
-- enterprise_documents (已存在)
```

## 🔧 常见问题

### Q1: 执行时报错 "relation does not exist"

**原因**：执行顺序错误，先执行了依赖表

**解决**：确保先执行 `enterprise-core-tables.sql`

### Q2: 执行时报错 "function already exists"

**原因**：函数或触发器已存在

**解决**：在 SQL 中使用 `CREATE OR REPLACE`，或手动删除已存在的函数

### Q3: 执行时报错 "permission denied"

**原因**：数据库权限不足

**解决**：使用具有足够权限的用户（如 postgres 或 Supabase service role）

### Q4: RLS 策略创建失败

**原因**：未启用 RLS 或表不存在

**解决**：确保表已创建，RLS 策略在表创建后执行

## 📝 初始化测试数据

如果需要初始化测试数据，取消以下 SQL 文件中的注释部分：

- `enterprise-core-tables.sql` - 包含权限初始化数据
- `enterprise-devices-tables.sql` - 包含示例设备数据

## 🔄 更新和维护

### 更新表结构

如果需要修改表结构，建议创建新的 migration 文件：

```bash
# 例如：supabase/migrations/034_add_enterprise_devices_extra_fields.sql
ALTER TABLE enterprise_devices ADD COLUMN warranty_code VARCHAR(50);
```

### 备份数据

在执行结构变更前，务必备份数据：

```sql
-- 备份企业设备表
CREATE TABLE enterprise_devices_backup AS SELECT * FROM enterprise_devices;
```

## 📚 相关文档

- [企业管理后台技术文档](./enterprise-admin.md)
- [数据库架构文档](./database-schema.md)
- [RLS 策略指南](./api-permissions-guide.md)

## 🎯 后续步骤

1. 部署数据表
2. 配置环境变量
3. 实现后端 API 接口
4. 测试前端页面功能
5. 进行端到端测试

---

**文档版本**：v1.0  
**最后更新**：2026年3月17日
