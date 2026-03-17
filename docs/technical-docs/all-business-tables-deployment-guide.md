# 所有商业用户管理中心数据表部署指南

## 📋 概述

本文档说明如何部署所有商业用户管理中心（企业、外贸、维修店、采购）所需的完整数据表结构。

## 🗄️ 数据表清单

### 1. 企业管理中心 (Enterprise)

- **`enterprise-core-tables.sql`** - 企业管理核心表
  - `enterprise_users` - 企业用户表
  - `enterprise_team_members` - 企业团队成员表
  - `enterprise_permissions` - 企业权限定义表
  - `enterprise_audit_logs` - 企业操作日志表
  - `enterprise_token_accounts` - 企业Token账户表
  - `enterprise_agents` - 企业智能体配置表

- **`enterprise-devices-tables.sql`** - 企业设备管理表（可选）
  - `enterprise_devices` - 企业设备表
  - 相关视图和函数

### 2. 外贸管理中心 (Foreign Trade)

- **`foreign-trade-core-tables.sql`** - 外贸管理核心表
  - `foreign_trade_users` - 外贸用户表
  - `foreign_trade_team_members` - 外贸团队成员表
  - `foreign_trade_audit_logs` - 外贸操作日志表
  - `foreign_trade_token_accounts` - 外贸Token账户表
  - `foreign_trade_agents` - 外贸智能体配置表

### 3. 维修店管理中心 (Repair Shop)

- **`repair-shop-core-tables.sql`** - 维修店管理核心表
  - `repair_shop_users` - 维修店用户表
  - `repair_shop_team_members` - 维修店团队成员表
  - `repair_shop_audit_logs` - 维修店操作日志表
  - `repair_shop_token_accounts` - 维修店Token账户表
  - `repair_shop_agents` - 维修店智能体配置表

### 4. 采购管理中心 (Procurement)

- **`procurement-core-tables.sql`** - 采购管理核心表
  - `procurement_users` - 采购用户表
  - `procurement_team_members` - 采购团队成员表
  - `procurement_audit_logs` - 采购操作日志表
  - `procurement_token_accounts` - 采购Token账户表
  - `procurement_agents` - 采购智能体配置表

### 5. 功能模块表（已有）

- **`026_enterprise_documents_management.sql`** - 企业文档管理表
- **`crowdfunding-tables.sql`** - 新品众筹表
- **`reward-qa-tables.sql`** - 有奖问答表
- **`foreign-trade-schema.sql`** - 外贸业务特定表
- **`foreign-trade-partners-extended.sql`** - 外贸合作伙伴扩展表
- **`foreign-trade-logistics-extended.sql`** - 外贸物流扩展表
- **`V1.4__create_repair_shops_table.sql`** - 维修店基础表
- **`022_create_repair_tutorials_table.sql`** - 维修教程表
- **`010_create_procurement_tables.sql`** - 采购业务特定表

## 🚀 部署步骤

### 方法一：在 Supabase 控制台执行

#### 步骤 1: 执行所有核心表（按任意顺序）

每个业务线的核心表是独立的，可以按任意顺序执行：

```bash
# 1. 企业管理中心核心表（必须）
执行 enterprise-core-tables.sql

# 2. 企业设备管理表（可选，如果需要设备管理功能）
执行 enterprise-devices-tables.sql

# 3. 外贸管理中心核心表（如果需要外贸管理功能）
执行 foreign-trade-core-tables.sql

# 4. 维修店管理中心核心表（如果需要维修店管理功能）
执行 repair-shop-core-tables.sql

# 5. 采购管理中心核心表（如果需要采购管理功能）
执行 procurement-core-tables.sql
```

#### 步骤 2: 执行业务特定表（如需要）

如果需要特定业务功能，执行对应的业务表：

```bash
# 外贸业务特定表
执行 sql/foreign-trade-schema.sql
执行 sql/foreign-trade-partners-extended.sql
执行 sql/foreign-trade-logistics-extended.sql

# 维修店业务特定表
执行 supabase/migrations/V1.4__create_repair_shops_table.sql
执行 supabase/migrations/022_create_repair_tutorials_table.sql

# 采购业务特定表
执行 supabase/migrations/010_create_procurement_tables.sql
```

### 方法二：使用 psql 命令行

```bash
# 设置数据库连接参数
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

# 1. 企业管理中心核心表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/enterprise-core-tables.sql

# 2. 企业设备管理表（可选）
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/enterprise-devices-tables.sql

# 3. 外贸管理中心核心表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/foreign-trade-core-tables.sql

# 4. 维修店管理中心核心表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/repair-shop-core-tables.sql

# 5. 采购管理中心核心表
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/procurement-core-tables.sql
```

### 方法三：一键执行所有核心表

创建一个批处理脚本执行所有核心表：

**Windows (deploy-all-tables.bat)**:

```batch
@echo off
set DB_HOST=your-project.supabase.co
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres

echo 正在部署企业核心表...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f docs\technical-docs\enterprise-core-tables.sql

echo 正在部署企业设备表...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f docs\technical-docs\enterprise-devices-tables.sql

echo 正在部署外贸核心表...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f docs\technical-docs\foreign-trade-core-tables.sql

echo 正在部署维修店核心表...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f docs\technical-docs\repair-shop-core-tables.sql

echo 正在部署采购核心表...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f docs\technical-docs\procurement-core-tables.sql

echo 所有核心表部署完成！
pause
```

**Linux/Mac (deploy-all-tables.sh)**:

```bash
#!/bin/bash

DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

echo "正在部署企业核心表..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/enterprise-core-tables.sql

echo "正在部署企业设备表..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/enterprise-devices-tables.sql

echo "正在部署外贸核心表..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/foreign-trade-core-tables.sql

echo "正在部署维修店核心表..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/repair-shop-core-tables.sql

echo "正在部署采购核心表..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f docs/technical-docs/procurement-core-tables.sql

echo "所有核心表部署完成！"
```

## ⚠️ 注意事项

### 执行顺序

1. **各业务线的核心表可以并行执行**
   - `enterprise-core-tables.sql`
   - `foreign-trade-core-tables.sql`
   - `repair-shop-core-tables.sql`
   - `procurement-core-tables.sql`

2. **企业设备管理表必须在企业核心表之后执行**
   - 先执行 `enterprise-core-tables.sql`
   - 再执行 `enterprise-devices-tables.sql`

3. **业务特定表建议在对应核心表之后执行**

### 表冲突检查

在执行前，可以检查表是否已存在：

```sql
-- 检查企业管理表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'enterprise_%';

-- 检查外贸管理表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'foreign_trade_%';

-- 检查维修店管理表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'repair_shop_%';

-- 检查采购管理表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'procurement_%';
```

### 现有数据处理

如果已有数据存在，建议：

1. **备份数据**

```sql
-- 备份关键表
CREATE TABLE enterprise_users_backup AS SELECT * FROM enterprise_users;
CREATE TABLE repair_shops_backup AS SELECT * FROM repair_shops;
```

2. **数据迁移**

- 检查现有表与新表的结构差异
- 编写数据迁移脚本
- 测试迁移脚本

3. **验证数据**

- 检查数据完整性
- 验证外键关系
- 测试应用功能

## 📊 数据表关系图

```
企业用户 (Enterprise)
├── enterprise_users (企业用户表)
│   ├── enterprise_team_members (团队成员)
│   ├── enterprise_token_accounts (Token账户)
│   ├── enterprise_agents (智能体)
│   ├── enterprise_devices (设备) ← 可选
│   ├── enterprise_audit_logs (操作日志)
│   └── enterprise_documents (文档)

外贸用户 (Foreign Trade)
├── foreign_trade_users (外贸用户表)
│   ├── foreign_trade_team_members (团队成员)
│   ├── foreign_trade_token_accounts (Token账户)
│   ├── foreign_trade_agents (智能体)
│   ├── foreign_trade_audit_logs (操作日志)
│   └── foreign_trade_partners (合作伙伴)

维修店用户 (Repair Shop)
├── repair_shop_users (维修店用户表)
│   ├── repair_shop_team_members (团队成员)
│   ├── repair_shop_token_accounts (Token账户)
│   ├── repair_shop_agents (智能体)
│   ├── repair_shop_audit_logs (操作日志)
│   └── repair_tutorials (维修教程)

采购用户 (Procurement)
├── procurement_users (采购用户表)
│   ├── procurement_team_members (团队成员)
│   ├── procurement_token_accounts (Token账户)
│   ├── procurement_agents (智能体)
│   ├── procurement_audit_logs (操作日志)
│   └── procurement_requests (采购请求)
```

## ✅ 验证部署

### 检查所有表是否创建成功

```sql
-- 检查企业相关表
SELECT 'enterprise_' || table_name as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'enterprise_%'
ORDER BY table_name;

-- 检查外贸相关表
SELECT 'foreign_trade_' || table_name as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'foreign_trade_%'
ORDER BY table_name;

-- 检查维修店相关表
SELECT 'repair_shop_' || table_name as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'repair_shop_%'
ORDER BY table_name;

-- 检查采购相关表
SELECT 'procurement_' || table_name as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'procurement_%'
ORDER BY table_name;
```

### 验证视图和函数

```sql
-- 检查视图
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND (
  table_name LIKE '%overview%' OR
  table_name LIKE '%active%'
)
ORDER BY table_name;

-- 检查函数
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
  routine_name LIKE 'get_%_stats%' OR
  routine_name LIKE 'update%'
)
ORDER BY routine_name;
```

### 测试统计函数

```sql
-- 测试企业统计函数（需要传入企业ID）
SELECT * FROM get_enterprise_stats('some-enterprise-id');

-- 测试外贸统计函数
SELECT * FROM get_foreign_trade_stats('some-foreign-trade-id');

-- 测试维修店统计函数
SELECT * FROM get_repair_shop_stats('some-repair-shop-id');

-- 测试采购统计函数
SELECT * FROM get_procurement_stats('some-procurement-id');
```

## 🔧 常见问题

### Q1: 执行时报错 "relation already exists"

**原因**: 表已经存在

**解决**:

- 如果是旧表，可以先删除：`DROP TABLE IF EXISTS table_name CASCADE;`
- 或者修改 SQL 文件，使用 `CREATE TABLE IF NOT EXISTS`

### Q2: 执行时报错 "function already exists"

**原因**: 函数已经存在

**解决**:

- SQL 文件中已使用 `CREATE OR REPLACE FUNCTION`，应该不会出现此错误
- 如果仍然出现，先手动删除函数：`DROP FUNCTION IF EXISTS function_name();`

### Q3: RLS 策略创建失败

**原因**: 表不存在或未启用 RLS

**解决**:

- 确保表已创建
- 检查 `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` 是否执行成功

### Q4: 触发器创建失败

**原因**: 表不存在或触发器函数不存在

**解决**:

- 确保表已创建
- 确保触发器函数已定义

### Q5: 外键约束错误

**原因**: 引用的表不存在

**解决**:

- 按正确顺序执行 SQL 文件
- 先执行核心表，再执行依赖表

## 📝 初始化测试数据

如果需要初始化测试数据，可以手动插入示例数据：

```sql
-- 示例：创建企业用户
INSERT INTO enterprise_users (
  user_id,
  company_name,
  business_type,
  status,
  subscription_plan
) VALUES (
  auth.uid(),
  '示例企业',
  'technology',
  'active',
  'professional'
);

-- 示例：创建外贸用户
INSERT INTO foreign_trade_users (
  user_id,
  company_name,
  business_type,
  status,
  subscription_plan,
  country
) VALUES (
  auth.uid(),
  '示例外贸公司',
  'trading_company',
  'active',
  'professional',
  'China'
);
```

## 🔄 更新和维护

### 更新表结构

如果需要修改表结构，建议创建新的 migration 文件：

```sql
-- 例如：034_add_enterprise_devices_extra_fields.sql
ALTER TABLE enterprise_devices ADD COLUMN warranty_code VARCHAR(50);
```

### 备份数据

在执行结构变更前，务必备份数据：

```sql
-- 备份企业设备表
CREATE TABLE enterprise_devices_backup AS SELECT * FROM enterprise_devices;

-- 备份外贸合作伙伴表
CREATE TABLE foreign_trade_partners_backup AS SELECT * FROM foreign_trade_partners;
```

## 📚 相关文档

- [企业管理后台技术文档](./enterprise-admin.md)
- [数据库架构文档](./database-schema.md)
- [RLS 策略指南](./api-permissions-guide.md)
- [商业用户管理中心数据表检查报告](./business-admin-tables-check-report.md)

## 🎯 后续步骤

1. ✅ 部署数据表
2. ⏳ 配置环境变量
3. ⏳ 实现后端 API 接口
4. ⏳ 测试前端页面功能
5. ⏳ 进行端到端测试
6. ⏳ 上线部署

---

**文档版本**：v1.0  
**最后更新**：2026年3月17日
