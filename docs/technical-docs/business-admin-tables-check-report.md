# 商业用户管理中心数据表检查报告

## 📋 概述

本文档记录各个商业用户管理中心的数据表创建情况。

## 🔍 各管理中心数据表状态

### 1. 企业管理中心 (Enterprise)

**路由**: `/enterprise/admin`

**页面**:

- ✅ Dashboard - 仪表板
- ✅ Documents - 文档管理
- ✅ Tokens - Token管理
- ✅ Agents - 智能体管理
- ✅ Crowdfunding - 众筹管理
- ✅ RewardQA - 有奖问答
- ✅ Settings - 系统设置 (已创建页面)
- ✅ Devices - 设备管理 (已创建页面)

**数据表**:

- ✅ `enterprise_users` - 企业用户表 (在 `enterprise-core-tables.sql` 中创建)
- ✅ `enterprise_team_members` - 团队成员表
- ✅ `enterprise_permissions` - 权限定义表
- ✅ `enterprise_audit_logs` - 操作日志表
- ✅ `enterprise_token_accounts` - Token账户表
- ✅ `enterprise_agents` - 智能体配置表
- ✅ `enterprise_devices` - 设备管理表 (在 `enterprise-devices-tables.sql` 中创建)
- ✅ `enterprise_documents` - 文档管理表 (已存在 `026_enterprise_documents_management.sql`)
- ✅ `crowdfunding_projects` - 众筹项目表 (已存在)
- ✅ `reward_qa_*` - 有奖问答表 (已存在)

**状态**: ✅ **完整** - 所有数据表已创建，页面已完善

---

### 2. 外贸管理中心 (Foreign Trade)

**路由**: `/foreign-trade/admin`

**页面**:

- ✅ Agents - 智能体管理
- ✅ Tokens - Token管理
- ✅ FXC - FXC管理
- ✅ Portal - 门户管理

**数据表**:

- ✅ `foreign_trade_partners` - 外贸合作伙伴表 (存在 `sql/foreign-trade-partners-extended.sql`)
- ✅ `foreign_trade_logistics` - 外贸物流表 (存在 `sql/foreign-trade-logistics-extended.sql`)
- ✅ `foreign_trade_schema` - 外贸基础架构 (存在 `sql/foreign-trade-schema.sql`)
- ✅ `fxc_*` - FXC相关表 (存在 `009_create_fcx_system_tables.sql`, `017_create_fcx_exchange_tables.sql`)
- ✅ `agents_*` - 智能体相关表 (存在 `030_create_agents_tables.sql`)

**状态**: ⚠️ **需要统一** - 数据表分散，需要整合到统一的核心表结构中

---

### 3. 维修店管理中心 (Repair Shop)

**路由**: `/repair-shop/admin`

**页面**:

- ✅ Agents - 智能体管理
- ✅ Tokens - Token管理
- ✅ FXC - FXC管理
- ✅ Portal - 门户管理

**数据表**:

- ✅ `repair_shops` - 维修店表 (存在 `V1.4__create_repair_shops_table.sql`)
- ✅ `repair_tutorials` - 维修教程表 (存在 `022_create_repair_tutorials_table.sql`)
- ✅ `fxc_*` - FXC相关表 (与外贸共享)
- ✅ `agents_*` - 智能体相关表 (共享)

**状态**: ⚠️ **需要统一** - 缺少核心用户表和Token账户表

---

### 4. 采购管理中心 (Procurement Intelligence)

**路由**: `/procurement-intelligence`

**页面**:

- ✅ Requests - 采购需求

**数据表**:

- ✅ `procurement_*` - 采购相关表 (存在 `010_create_procurement_tables.sql`)
- ⚠️ 缺少用户管理、Token管理、智能体管理等核心表

**状态**: ⚠️ **不完整** - 缺少管理后台页面和核心表

---

## 📊 数据表对比分析

### 核心表需求对比

| 表名            | Enterprise                   | Foreign Trade | Repair Shop | Procurement |
| --------------- | ---------------------------- | ------------- | ----------- | ----------- |
| 用户/企业主体表 | ✅ enterprise_users          | ❌ 缺失       | ❌ 缺失     | ❌ 缺失     |
| 团队成员表      | ✅ enterprise_team_members   | ❌ 缺失       | ❌ 缺失     | ❌ 缺失     |
| Token账户表     | ✅ enterprise_token_accounts | ❌ 缺失       | ❌ 缺失     | ❌ 缺失     |
| 智能体配置表    | ✅ enterprise_agents         | ⚠️ 共享       | ⚠️ 共享     | ⚠️ 共享     |
| 操作日志表      | ✅ enterprise_audit_logs     | ❌ 缺失       | ❌ 缺失     | ❌ 缺失     |
| 权限管理表      | ✅ enterprise_permissions    | ❌ 缺失       | ❌ 缺失     | ❌ 缺失     |

## 🎯 建议方案

### 方案一：为每个业务线独立创建核心表

**优点**:

- 数据隔离性好
- 可以针对不同业务线定制

**缺点**:

- 代码重复度高
- 维护成本大
- 数据表数量多

### 方案二：创建统一的核心表结构，使用类型字段区分业务线

**优点**:

- 减少数据表数量
- 便于统一管理
- 减少代码重复

**缺点**:

- 需要重新设计现有表结构
- 迁移成本高

### 方案三：混合方案（推荐）

- 创建统一的核心表（用户、团队、Token、权限、日志）
- 业务特定表保持独立
- 通过外键关联

**实施步骤**:

1. 创建 `business_users` 表（包含 enterprise, foreign_trade, repair_shop 等类型）
2. 创建 `business_team_members` 表
3. 创建 `business_token_accounts` 表
4. 创建 `business_audit_logs` 表
5. 创建 `business_permissions` 表
6. 创建 `business_agents` 表（关联到业务用户）
7. 各业务特定表保持不变

## 📝 待创建数据表清单

### 1. 外贸管理中心核心表

- ❌ `foreign_trade_users` - 外贸用户表
- ❌ `foreign_trade_team_members` - 外贸团队成员表
- ❌ `foreign_trade_token_accounts` - 外贸Token账户表
- ❌ `foreign_trade_audit_logs` - 外贸操作日志表

### 2. 维修店管理中心核心表

- ❌ `repair_shop_users` - 维修店用户表
- ❌ `repair_shop_team_members` - 维修店团队成员表
- ❌ `repair_shop_token_accounts` - 维修店Token账户表
- ❌ `repair_shop_audit_logs` - 维修店操作日志表

### 3. 采购管理中心核心表

- ❌ `procurement_users` - 采购用户表
- ❌ `procurement_team_members` - 采购团队成员表
- ❌ `procurement_token_accounts` - 采购Token账户表
- ❌ `procurement_audit_logs` - 采购操作日志表

## 🚀 下一步行动

1. **选择方案**: 确定使用方案三（混合方案）
2. **创建统一表**: 创建 `business_users` 等统一核心表
3. **迁移数据**: 将现有数据迁移到新表结构
4. **更新API**: 更新相关API接口
5. **测试验证**: 确保所有功能正常

---

**报告生成时间**: 2026年3月17日
**版本**: v1.0
