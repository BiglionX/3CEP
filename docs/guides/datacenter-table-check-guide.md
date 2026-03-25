# 数据中心表依赖检测工具

## 概述

本工具用于检测数据中心功能所需的数据库表是否已创建，包括：

- ✅ 设备管理相关表
- ✅ 用户与权限相关表
- ✅ 数据源与元数据相关表

## 使用方法

### 方法一：Node.js 脚本（推荐）

**执行命令：**

```bash
node scripts/check-datacenter-tables.js
```

**输出示例：**

```
✅ 数据库连接成功

📊 当前数据库中共有 45 张表

============================================================
📦 设备管理模块
============================================================
  ✓ devices                             ✅ 正常 (1,247 行)
  ✓ device_profiles                     ✅ 正常 (856 行)
  ✗ data_sources                        ❌ 不存在

============================================================
📈 统计信息
============================================================
总需表数：21
已存在：18 (85.7%)
缺失：3 (14.3%)

⚠️ 缺失或需要创建的表

数据中心模块:
  - data_sources
  - data_assets
  - metadata_registry
```

### 方法二：纯 SQL 脚本（通用版本）

**适用场景：** 可在任何 SQL 客户端工具中执行（如 DBeaver、pgAdmin、Navicat 等）

**执行方式：**

```bash
# psql 命令行
psql -U your_username -d your_database -f sql/check-datacenter-tables-pure.sql

# 或在 SQL 客户端中直接打开并执行
```

### 方法三：PSQL 增强版脚本

**适用场景：** 仅支持在 psql 命令行环境中执行，提供更好的格式化输出

**执行命令：**

```bash
psql -U your_username -d your_database -f sql/check-datacenter-tables.sql
```

**注意：** 此版本包含 psql 元命令（`\echo`, `\pset`），不能在普通 SQL 客户端中运行

## 检测的表清单

### 设备管理模块 (8 张表)

- `devices` - 设备信息表
- `device_profiles` - 设备档案表
- `device_lifecycle_events` - 设备生命周期事件表
- `crowdfunding_pledges` - 众筹承诺表
- `repair_orders` - 维修订单表
- `parts` - 配件库表
- `fault_types` - 故障类型表
- `repair_shops` - 维修店铺表

### 用户与权限模块 (8 张表)

- `admin_users` - 管理员用户表
- `user_profiles` - 用户档案表
- `tenants` - 租户表
- `user_tenants` - 用户租户关联表
- `roles` - 角色表
- `permissions` - 权限表
- `user_roles` - 用户角色关联表
- `role_permissions` - 角色权限关联表

### 数据中心模块 (5 张表)

- `data_sources` - 数据源表
- `data_assets` - 数据资产表
- `metadata_registry` - 元数据注册表
- `data_quality_rules` - 数据质量规则表
- `data_lineage` - 数据血缘表

## 检测结果说明

### 状态标识

- ✅ **正常** - 表存在且有数据
- ⚠️ **空表** - 表存在但无数据
- ❌ **不存在** - 表未创建

### 其他检测项

脚本还会检测：

- 🔒 **RLS 策略** - 行级安全策略配置
- 📇 **索引情况** - 表的索引使用情况
- 🔑 **主键检查** - 表是否有主键

## 环境要求

### Node.js 脚本

- Node.js 14+
- `pg` 包：`npm install pg`
- `.env` 文件中配置 `DATABASE_URL`

### SQL 脚本

- PostgreSQL 9.6+
- psql 命令行工具

## 常见问题

### Q: 如何修复缺失的表？

A: 运行相关的数据库迁移脚本：

```bash
# 示例：运行设备生命周期迁移
.\deploy-device-lifecycle-migrations.bat  # Windows
./deploy-device-lifecycle-migrations.sh   # Linux/Mac
```

### Q: RLS 策略是什么？

A: RLS (Row-Level Security) 是 PostgreSQL 的行级安全策略，用于控制不同用户对数据的访问权限。

### Q: 如何查看表的详细结构？

A: 在 psql 中执行：

```sql
\d table_name  -- 查看表结构
\d+ table_name -- 查看详细信息（包括索引、约束等）
```

## 相关文件

- `scripts/check-datacenter-tables.js` - Node.js 检测脚本（推荐）
- `sql/check-datacenter-tables-pure.sql` - 纯 SQL 检测脚本（通用版本）
- `sql/check-datacenter-tables.sql` - PSQL 增强版检测脚本（仅 psql 支持）
- `docs/technical-docs/database-migration-guide.md` - 数据库迁移指南

## 维护说明

如需添加新的检测表，请编辑：

- `scripts/check-datacenter-tables.js` 中的 `REQUIRED_TABLES` 对象
- `sql/check-datacenter-tables.sql` 中的表名列表

---

**最后更新**: 2026-03-25
**维护者**: 开发团队
