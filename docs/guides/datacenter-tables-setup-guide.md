# 数据中心核心表创建指南

## 📋 缺失表清单

根据检测结果，数据中心模块**缺失 5 张核心表**:

### 需要创建的表

| 序号 | 表名                 | 用途                                  | 优先级 |
| ---- | -------------------- | ------------------------------------- | ------ |
| 1    | `data_sources`       | 数据源表 - 存储各种数据源的连接信息   | 🔴 高  |
| 2    | `data_assets`        | 数据资产表 - 存储企业数据资产的元数据 | 🔴 高  |
| 3    | `metadata_registry`  | 元数据注册表 - 字段级元数据管理       | 🔴 高  |
| 4    | `data_quality_rules` | 数据质量规则表 - 质量检查规则         | 🟡 中  |
| 5    | `data_lineage`       | 数据血缘表 - 追踪数据流转关系         | 🟡 中  |

## 🚀 执行步骤

### 步骤 1: 创建核心表

**文件:** [`sql/create-datacenter-core-tables.sql`](../sql/create-datacenter-core-tables.sql)

```bash
# Windows PowerShell
psql -U screw_reborn -d screw_reborn -f sql/create-datacenter-core-tables.sql

# 或在 SQL 客户端工具中直接执行此文件
```

**执行内容:**

- ✅ 创建 `data_sources` 表
- ✅ 创建 `data_assets` 表
- ✅ 创建 `metadata_registry` 表
- ✅ 创建 `data_quality_rules` 表
- ✅ 创建 `data_lineage` 表
- ✅ 为所有表创建索引和注释

### 步骤 2: 配置 RLS 策略

**文件:** [`sql/setup-datacenter-rls.sql`](../sql/setup-datacenter-rls.sql)

```bash
# Windows PowerShell
psql -U screw_reborn -d screw_reborn -f sql/setup-datacenter-rls.sql
```

**执行内容:**

- ✅ 为 5 张表启用行级安全 (RLS)
- ✅ 创建管理员查看和管理策略
- ✅ 根据敏感级别控制访问权限

### 步骤 3: 验证创建结果

```bash
# 运行检测脚本
node scripts/check-datacenter-tables.js
```

或

```bash
# 使用纯 SQL 版本
psql -U screw_reborn -d screw_reborn -f sql/check-datacenter-tables-pure.sql
```

## 📊 表结构说明

### 1. data_sources (数据源表)

**核心字段:**

- `id` - UUID 主键
- `name` - 数据源名称 (唯一)
- `source_type` - 类型：database, api, file, stream
- `connection_config` - 连接配置 (JSONB)
- `status` - 状态：active, inactive, error
- `credentials_id` - 关联凭证 ID

**用途:** 统一管理所有数据源的连接信息

### 2. data_assets (数据资产表)

**核心字段:**

- `asset_code` - 资产编码 (唯一)
- `asset_type` - 类型：table, view, api, file, stream
- `sensitivity_level` - 敏感级别：public, internal, confidential, restricted
- `quality_score` - 质量评分 (0-100)
- `business_owner` - 业务负责人
- `technical_owner` - 技术负责人

**用途:** 建立企业数据资产目录

### 3. metadata_registry (元数据注册表)

**核心字段:**

- `registry_code` - 注册编码 (唯一)
- `asset_id` - 关联资产 ID
- `field_name` - 字段名
- `field_type` - 字段类型
- `business_definition` - 业务定义
- `transformation_rule` - 转换规则

**用途:** 管理每个数据资产的字段级元数据

### 4. data_quality_rules (数据质量规则表)

**核心字段:**

- `rule_code` - 规则编码 (唯一)
- `rule_type` - 规则类型：completeness, accuracy, consistency 等
- `severity` - 严重程度：low, medium, high, critical
- `rule_expression` - 规则表达式
- `threshold_value` - 阈值

**用途:** 定义和执行数据质量检查规则

### 5. data_lineage (数据血缘表)

**核心字段:**

- `lineage_code` - 血缘编码 (唯一)
- `source_asset_id` - 源资产 ID
- `target_asset_id` - 目标资产 ID
- `transformation_type` - 转换类型
- `process_name` - 处理过程名称
- `dependency_order` - 依赖顺序

**用途:** 追踪数据的来源、转换和流向

## 🔒 RLS 策略说明

所有表都配置了统一的访问控制策略:

### 查看权限

- ✅ **所有活跃的管理员用户**可以查看所有数据
- ✅ 根据敏感级别自动过滤 (`data_assets` 表)

### 管理权限 (增删改)

- 🔐 **仅限以下角色**:
  - `super_admin` - 超级管理员
  - `admin` - 管理员
  - `data_admin` - 数据管理员

### 实现方式

通过 PostgreSQL 的 `current_setting('app.current_user_email')` 获取当前用户，并在 `admin_users` 表中验证角色。

## ⚠️ 注意事项

1. **执行顺序**: 必须先创建表，再配置 RLS 策略
2. **依赖关系**: 部分表有外键依赖，必须按顺序创建
3. **权限要求**: 需要使用具有 DDL 权限的用户执行
4. **备份建议**: 执行前建议先备份数据库

## 📝 相关文件

- [`create-datacenter-core-tables.sql`](../sql/create-datacenter-core-tables.sql) - 创建表结构
- [`setup-datacenter-rls.sql`](../sql/setup-datacenter-rls.sql) - 配置 RLS 策略
- [`check-datacenter-tables-pure.sql`](../sql/check-datacenter-tables-pure.sql) - 验证工具
- [`scripts/check-datacenter-tables.js`](../scripts/check-datacenter-tables.js) - Node.js 检测工具

## 🎯 后续工作

表创建完成后，建议:

1. ✅ **插入测试数据** - 验证表结构完整性
2. ✅ **配置数据源连接** - 在 `data_sources` 中添加实际数据源
3. ✅ **注册数据资产** - 在 `data_assets` 中登记现有数据表
4. ✅ **设置质量规则** - 定义关键数据的质量检查规则
5. ✅ **建立血缘关系** - 追踪重要数据的流转路径

---

**创建日期**: 2026-03-25
**维护者**: 开发团队
