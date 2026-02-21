# 数据库字段业务含义文档

## 概述

本文档详细说明 FixCycle 项目各数据库表的业务含义、字段用途以及数据来源。特别需要注意的是，部分核心数据来源于外部 lionfix 数据库系统。

## 数据源说明

### 外部数据集成
FixCycle 项目采用**混合数据架构**：
- **本地数据**：用户生成内容、订单信息、系统配置等业务数据
- **外部数据**：设备信息、配件规格、供应商信息等基础数据来自 lionfix 系统
- **集成方式**：通过数据库直连实现，FixCycle 作为只读使用者

### 数据同步策略
- **实时查询**：核心业务数据通过 API 实时查询 lionfix 数据库
- **本地缓存**：高频访问数据在 Redis 中缓存，减少外部依赖
- **数据一致性**：通过定期同步机制保证数据新鲜度

## 核心表结构说明

### devices 表（设备信息表）
```sql
-- 表注释更新
COMMENT ON TABLE devices IS '设备基本信息表 - 数据源自 lionfix 设备库，FixCycle 只读使用';
```

**业务含义**：
- 存储各种电子设备的基础信息（手机、平板、笔记本等）
- 包含品牌、型号、规格参数等标准化数据
- **数据来源**：完全来自 lionfix 设备数据库，FixCycle 不维护原始数据
- **使用方式**：通过内部 API `/api/internal/devices` 实时查询

**关键字段**：
- `id`: 设备唯一标识符（lionfix 系统主键）
- `brand`: 品牌名称（如 Apple、Samsung、华为等）
- `model`: 具体型号（如 iPhone 15 Pro、Galaxy S24等）
- `category`: 设备分类（智能手机、平板电脑、笔记本等）
- `specifications`: 规格参数（JSON格式存储）
- `release_date`: 发布日期
- `status`: 设备状态（active/inactive/discontinued）

**业务规则**：
- 状态为 "active" 的设备才可在前端展示
- 设备信息变更需在 lionfix 系统中进行
- FixCycle 通过定期同步保持数据一致性

### parts 表（配件信息表）
```sql
-- 表注释更新
COMMENT ON TABLE parts IS '配件基本信息表 - 数据实时查询 lionfix 零部件库，本地仅缓存核心关联信息';
```

**业务含义**：
- 存储各类电子设备配件的基础信息
- 与 devices 表建立多对多关联关系
- **数据策略**：实时查询 lionfix，本地存储关联关系和业务状态
- **缓存机制**：高频配件信息在 Redis 中缓存 1-2 小时

**关键字段**：
- `id`: 配件唯一标识符（lionfix 系统主键）
- `name`: 配件名称（如 "iPhone 15 Pro 屏幕总成"）
- `category`: 配件分类（屏幕、电池、摄像头等）
- `brand`: 品牌信息
- `part_number`: 配件型号编码
- `specifications`: 技术规格参数
- `compatible_devices`: 兼容设备列表（JSON数组）
- `status`: 配件状态（active/inactive）

**业务规则**：
- 配件必须关联至少一个设备才能生效
- 配件价格信息单独存储在 part_prices 表中
- 配件库存信息在本地 part_inventory 表中维护

### part_prices 表（配件价格信息表）
```sql
-- 表注释更新
COMMENT ON TABLE part_prices IS '配件价格信息表 - 数据实时查询 lionfix 零部件库，本地不持久化，仅缓存最新报价';
```

**业务含义**：
- 存储各配件在不同供应商处的实时报价
- 支持价格历史追踪和趋势分析
- **数据策略**：每次查询都直接访问 lionfix 价格库
- **缓存策略**：Redis 缓存最新价格，过期时间 30-60 分钟

**关键字段**：
- `id`: 价格记录唯一标识
- `part_id`: 关联的配件ID
- `supplier_id`: 供应商ID（lionfix 系统）
- `price`: 当前报价（元）
- `currency`: 货币单位（默认 CNY）
- `stock_status`: 库存状态（充足/现货/缺货）
- `delivery_time`: 预计送达时间
- `last_updated`: 最后更新时间

**业务规则**：
- 价格每30分钟从 lionfix 系统刷新一次
- 同一配件同一供应商的价格记录保持唯一
- 历史价格通过时间戳自动归档

### part_devices 表（配件设备关联表）
```sql
-- 表注释
COMMENT ON TABLE part_devices IS '配件与设备兼容关系表 - 维护配件适用设备的关联信息';
```

**业务含义**：
- 建立配件与设备之间的兼容关系
- 支持一对多的配件适配关系
- **数据维护**：由 FixCycle 本地维护，基于 lionfix 数据建立

**关键字段**：
- `part_id`: 配件ID（关联 parts 表）
- `device_id`: 设备ID（关联 devices 表）
- `compatibility_level`: 兼容级别（完全兼容/部分兼容/需改装）
- `compatibility_notes`: 兼容性说明

### suppliers 表（供应商信息表）
```sql
-- 表注释更新
COMMENT ON TABLE suppliers IS '供应商信息表 - 数据源自 lionfix 供应商库，FixCycle 只读使用';
```

**业务含义**：
- 存储合格供应商的基本信息
- 包含供应商资质、服务能力等信息
- **数据来源**：lionfix 供应商管理系统
- **使用方式**：通过 `/api/internal/suppliers` 接口查询

**关键字段**：
- `id`: 供应商唯一标识符
- `name`: 供应商名称
- `company_name`: 公司全称
- `contact_info`: 联系方式
- `service_areas`: 服务区域
- `certifications`: 资质认证
- `rating`: 供应商评分
- `status`: 合作状态

## 本地业务表

### users 表（用户信息表）
```sql
-- 表注释
COMMENT ON TABLE users IS '用户基本信息表 - FixCycle 本地维护';
```

**业务含义**：
- 存储注册用户的基本信息
- 包含认证、权限等相关数据
- **数据维护**：完全由 FixCycle 本地管理

### orders 表（订单信息表）
```sql
-- 表注释
COMMENT ON TABLE orders IS '订单信息表 - FixCycle 本地维护';
```

**业务含义**：
- 存储用户下单的完整订单信息
- 包含订单状态、支付信息等
- **数据维护**：完全由 FixCycle 本地管理

### appointments 表（预约信息表）
```sql
-- 表注释已在现有文件中定义
COMMENT ON TABLE appointments IS '预约时间表';
```

## 数据访问策略

### 读取策略
1. **本地数据**：直接从 Supabase 数据库读取
2. **外部数据**：通过连接池查询 lionfix 数据库
3. **缓存数据**：优先从 Redis 读取，缓存未命中则查询源数据库

### 写入策略
1. **业务数据**：直接写入本地 Supabase 数据库
2. **基础数据**：只读访问，不允许写入
3. **缓存更新**：数据变更时主动更新 Redis 缓存

### 安全控制
- 外部数据库连接使用只读账号
- 实施 IP 白名单限制
- 连接池最大连接数限制
- 查询超时和重试机制

## 性能优化说明

### 缓存策略
```
设备信息: Redis 缓存 2小时
配件信息: Redis 缓存 1小时  
价格信息: Redis 缓存 30分钟
供应商信息: Redis 缓存 2小时
```

### 索引优化
- 外部数据表建立复合索引提升查询效率
- 本地关联表建立外键索引
- 常用查询字段建立单独索引

### 查询优化
- 实施分页查询避免大数据集传输
- 使用连接池减少连接建立开销
- 异步查询提升响应速度

---

*文档版本：v1.0*
*最后更新：2026年2月14日*
*数据架构：混合模式（本地 + 外部lionfix集成）*