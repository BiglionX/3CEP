# 微观类型（账户类型）数据表单详解

## 📊 回答您的问题

**问**: 微观类型有对应的数据表单吗？
**答**: ✅ **有的！** 但不是通过独立的表，而是通过以下方式实现：

---

## 🎯 数据库设计架构

### 1. 统一账户表 + 分类详情表的设计模式

```
┌─────────────────────────────────────┐
│     user_accounts (统一账户表)      │
│  - user_type (宏观类型)            │
│  - account_type (微观类型) ⭐       │
│  - 基本信息、状态、角色等           │
└─────────────────────────────────────┘
              ↓ (1:1 或 1:n)
┌─────────────────────────────────────┐
│   individual_users (个人详情表)     │
│   repair_shop_users_detail (维修店) │
│   enterprise_users_detail (企业)    │
└─────────────────────────────────────┘
```

---

## 📋 微观类型的存储位置

### 方案 A：直接在 `user_accounts` 表中（主要方式）

**位置**: [`multi-type-user-management-simple.sql:21-23`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql#L21-L23)

```sql
account_type VARCHAR(50) NOT NULL CHECK (
  account_type IN (
    'individual',      -- 个人
    'repair_shop',     -- 维修店
    'factory',         -- 工厂 ⭐
    'supplier',        -- 供应商 ⭐
    'enterprise',      -- 企业 ⭐
    'foreign_trade'    -- 外贸 ⭐
  )
)
```

**优点**:

- ✅ 查询效率高（单表查询）
- ✅ 筛选方便（WHERE account_type = 'factory'）
- ✅ 统计简单（GROUP BY account_type）
- ✅ 索引优化容易

**已有索引**:

```sql
CREATE INDEX idx_user_accounts_account_type
ON user_accounts(account_type);
```

---

### 方案 B：在详情表中进一步细分（扩展方式）

#### 1. **企业用户详情表** - 包含所有微观类型

**位置**: [`multi-type-user-management-simple.sql:179-181`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql#L179-L181)

```sql
-- enterprise_users_detail 表
business_type VARCHAR(50) NOT NULL CHECK (
  business_type IN (
    'manufacturer',     -- 制造商 ⭐
    'supplier',         -- 供应商 ⭐
    'distributor',      -- 分销商 ⭐
    'retailer',         -- 零售商 ⭐
    'foreign_trade',    -- 外贸公司 ⭐
    'government'        -- 政府机构
  )
)
```

**作用**: 存储更详细的企业信息

- 行业信息
- 员工数量
- 年营业额
- 采购类别
- 主营产品
- 目标市场

#### 2. **维修店详情表** - 维修店的微观类型

**位置**: [`multi-type-user-management-simple.sql:129-131`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql#L129-L131)

```sql
-- repair_shop_users_detail 表
shop_type VARCHAR(50) NOT NULL CHECK (
  shop_type IN (
    'authorized_dealer',  -- 授权经销商 ⭐
    'independent',        -- 独立维修店 ⭐
    'franchise',          -- 连锁店 ⭐
    'mobile_service'      -- 移动服务 ⭐
  )
)
```

**作用**: 存储维修店的具体类型和详细信息

---

## 🔍 完整的映射关系

### 宏观类型 → 微观类型 → 详情表字段

| 宏观类型 (user_type) | 微观类型 (account_type)           | 详情表细分字段                                                                                                   |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **个人用户**         | individual                        | -                                                                                                                |
| **维修店**           | repair_shop                       | shop_type:<br>- authorized_dealer<br>- independent<br>- franchise<br>- mobile_service                            |
| **企业用户**         | factory<br>supplier<br>enterprise | business_type:<br>- manufacturer<br>- supplier<br>- distributor<br>- retailer<br>- foreign_trade<br>- government |
| **外贸公司**         | foreign_trade                     | business_type: foreign_trade                                                                                     |

---

## 📊 实际使用示例

### 查询所有工厂

```sql
-- 方式 1: 直接查主表（快速）
SELECT * FROM user_accounts
WHERE account_type = 'factory';

-- 方式 2: 关联详情表（获取更多信息）
SELECT
  ua.*,
  eud.company_name,
  eud.industry,
  eud.employee_count
FROM user_accounts ua
JOIN enterprise_users_detail eud ON ua.id = eud.user_account_id
WHERE ua.account_type = 'factory';
```

### 查询所有供应商

```sql
-- 查主表
SELECT * FROM user_accounts
WHERE account_type = 'supplier';

-- 查详情表（带业务类型）
SELECT
  ua.*,
  eud.business_type,
  eud.company_name,
  eud.procurement_categories
FROM user_accounts ua
JOIN enterprise_users_detail eud ON ua.id = eud.user_account_id
WHERE ua.account_type = 'supplier'
  AND eud.business_type = 'supplier';
```

### 查询连锁维修店

```sql
SELECT
  ua.*,
  rsd.shop_name,
  rsd.shop_type,
  rsd.specialties
FROM user_accounts ua
JOIN repair_shop_users_detail rsd ON ua.id = rsd.user_account_id
WHERE ua.user_type = 'repair_shop'
  AND rsd.shop_type = 'franchise';
```

---

## 🎯 前端筛选的实现

### API 层面的筛选

当用户在前端选择"工厂"时：

```typescript
// 前端发送请求
GET /api/admin/user-management?account_type=factory

// 后端 SQL 查询
SELECT * FROM user_accounts
WHERE account_type = 'factory'
ORDER BY created_at DESC;
```

### 双维度筛选逻辑

```typescript
// 用户选择：企业用户 + 工厂
const filters = {
  user_type: 'enterprise',    // 第 2 个筛选框
  account_type: 'factory'     // 第 3 个筛选框
};

// 生成的 SQL
SELECT * FROM user_accounts
WHERE user_type = 'enterprise'
  AND account_type = 'factory';
```

---

## 📈 统计视图中的微观类型

**位置**: [`multi-type-user-management-simple.sql:242-247`](file://d:\BigLionX\3cep\sql\multi-type-user-management-simple.sql#L242-L247)

```sql
CREATE VIEW user_stats_view AS
SELECT
  -- 按账户类型统计
  COUNT(*) FILTER (WHERE account_type = 'individual') as individual_account_count,
  COUNT(*) FILTER (WHERE account_type = 'repair_shop') as repair_shop_account_count,
  COUNT(*) FILTER (WHERE account_type IN ('factory', 'supplier')) as supply_chain_count,
  COUNT(*) FILTER (WHERE account_type = 'enterprise') as enterprise_account_count,
  COUNT(*) FILTER (WHERE account_type = 'foreign_trade') as foreign_trade_account_count,
  -- ... 其他统计
FROM user_accounts;
```

**用途**:

- 实时统计各微观类型的用户数量
- 供应链企业统计（工厂 + 供应商）
- 外贸公司单独统计

---

## ✅ 总结

### 微观类型的数据组织方式

| 层级       | 存储位置                 | 字段名        | 作用              |
| ---------- | ------------------------ | ------------- | ----------------- |
| **主表**   | user_accounts            | account_type  | 快速筛选和统计 ⭐ |
| **详情表** | enterprise_users_detail  | business_type | 详细业务信息      |
| **详情表** | repair_shop_users_detail | shop_type     | 详细店铺信息      |

### 设计优势

✅ **高效查询**: 主表直接筛选，无需 JOIN
✅ **灵活扩展**: 详情表可添加更多细分字段
✅ **数据一致**: CHECK 约束保证数据有效性
✅ **易于维护**: 统一的账户管理逻辑

### 实际应用

**场景 1**: 查找所有工厂进行对账

```sql
SELECT email, phone, created_at
FROM user_accounts
WHERE account_type = 'factory'
  AND status = 'active';
```

**场景 2**: 分析供应商分布

```sql
SELECT
  business_type,
  industry,
  COUNT(*) as count
FROM enterprise_users_detail
GROUP BY business_type, industry;
```

**场景 3**: 前端筛选器

```
用户类型：企业用户
账户类型：工厂
结果：显示所有活跃的工厂用户
```

---

_文档更新时间：2026-03-22_
_版本：v1.0_
