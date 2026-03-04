# 销售智能体模块 (Sales Agent Module)

## 模块概述

销售智能体是面向企业销售场景的 AI 助手，提供客户管理、智能报价、合同谈判和订单跟踪等全流程销售支持。

## 核心功能

### 1. 客户智能管理与分级系统

- 客户信息档案管理
- 客户价值评估与分级
- 客户行为分析
- 客户关系维护提醒

### 2. 自动询价处理与智能报价引擎

- 询价自动接收和解析
- 基于成本、市场、竞争的智能定价
- 个性化报价策略生成
- 报价历史追踪和分析

### 3. 合同智能谈判与电子签署流程

- 合同条款智能审核
- 谈判策略建议
- 风险点识别和预警
- 电子签名集成

### 4. 订单全流程跟踪与履约监控

- 订单状态实时跟踪
- 履约进度监控
- 异常订单预警
- 客户满意度调查

## 技术架构

```
src/modules/sales-agent/
├── components/          # UI组件
│   ├── CustomerCard.tsx
│   ├── QuoteGenerator.tsx
│   ├── ContractViewer.tsx
│   └── OrderTracker.tsx
├── services/           # 业务服务
│   ├── customer.service.ts
│   ├── quotation.service.ts
│   ├── contract.service.ts
│   └── order.service.ts
├── hooks/             # React Hooks
│   ├── useCustomer.ts
│   ├── useQuotation.ts
│   ├── useContract.ts
│   └── useOrder.ts
├── types/             # TypeScript类型定义
│   ├── customer.types.ts
│   ├── quotation.types.ts
│   ├── contract.types.ts
│   └── order.types.ts
├── utils/             # 工具函数
│   ├── pricing-algorithms.ts
│   ├── risk-assessment.ts
│   └── document-parser.ts
└── index.ts           # 模块导出
```

## API接口

### 客户管理API

```typescript
GET    /api/sales/customers          // 获取客户列表
POST   /api/sales/customers          // 创建客户
GET    /api/sales/customers/:id      // 获取客户详情
PUT    /api/sales/customers/:id      // 更新客户
DELETE /api/sales/customers/:id      // 删除客户
POST   /api/sales/customers/:id/grade // 客户分级评估
```

### 报价管理API

```typescript
GET    /api/sales/quotations         // 获取报价列表
POST   /api/sales/quotations         // 创建报价请求
GET    /api/sales/quotations/:id     // 获取报价详情
PUT    /api/sales/quotations/:id     // 更新报价
POST   /api/sales/quotations/:id/send // 发送报价
```

### 合同管理API

```typescript
GET    /api/sales/contracts          // 获取合同列表
POST   /api/sales/contracts          // 创建合同
GET    /api/sales/contracts/:id      // 获取合同详情
PUT    /api/sales/contracts/:id      // 更新合同
POST   /api/sales/contracts/:id/sign // 电子签署
```

### 订单管理API

```typescript
GET    /api/sales/orders             // 获取订单列表
POST   /api/sales/orders             // 创建订单
GET    /api/sales/orders/:id         // 获取订单详情
PUT    /api/sales/orders/:id         // 更新订单状态
GET    /api/sales/orders/:id/track   // 订单跟踪
```

## 数据库表设计

### customers (客户表)

```sql
CREATE TABLE sales_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  industry VARCHAR(100),
  scale VARCHAR(50), -- small, medium, large, enterprise
  grade VARCHAR(20), -- A, B, C, D
  source VARCHAR(50), -- referral, website, cold_call, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, blacklisted
  total_revenue DECIMAL(15,2) DEFAULT 0,
  last_order_date TIMESTAMP,
  credit_score INTEGER,
  payment_terms VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### quotations (报价表)

```sql
CREATE TABLE sales_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES sales_customers(id),
  product_items JSONB NOT NULL, -- [{product_id, quantity, unit_price, discount}]
  subtotal DECIMAL(15,2),
  tax_rate DECIMAL(5,4),
  tax_amount DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### contracts (合同表)

```sql
CREATE TABLE sales_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES sales_quotations(id),
  customer_id UUID REFERENCES sales_customers(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  payment_terms JSONB,
  delivery_terms JSONB,
  status VARCHAR(20) DEFAULT 'draft', -- draft, negotiating, signed, completed, terminated
  signed_at TIMESTAMP,
  signed_by_customer VARCHAR(100),
  signed_by_company VARCHAR(100),
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### orders (订单表)

```sql
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  contract_id UUID REFERENCES sales_contracts(id),
  customer_id UUID REFERENCES sales_customers(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(15,2),
  paid_amount DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, shipped, delivered, completed, cancelled
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  customer_feedback TEXT,
  satisfaction_score INTEGER, -- 1-5
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 核心算法

### 智能定价算法

```typescript
interface PricingFactors {
  baseCost: number; // 基础成本
  marketPrice: number; // 市场价格
  competitorPrice: number; // 竞争对手价格
  customerGrade: string; // 客户等级
  orderVolume: number; // 订单量
  profitMargin: number; // 目标利润率
}

function calculateOptimalPrice(factors: PricingFactors): number {
  const {
    baseCost,
    marketPrice,
    competitorPrice,
    customerGrade,
    orderVolume,
    profitMargin,
  } = factors;

  // 基础价格 = 成本 * (1 + 目标利润率)
  let basePrice = baseCost * (1 + profitMargin);

  // 客户等级折扣
  const gradeDiscounts = { A: 0.95, B: 0.98, C: 1.0, D: 1.05 };
  const gradeFactor = gradeDiscounts[customerGrade] || 1.0;

  // 批量折扣
  const volumeDiscount =
    orderVolume > 1000 ? 0.9 : orderVolume > 500 ? 0.95 : 1.0;

  // 竞争调整
  const competitiveFactor = competitorPrice < marketPrice ? 0.98 : 1.0;

  const finalPrice =
    basePrice * gradeFactor * volumeDiscount * competitiveFactor;

  // 确保不低于成本
  return Math.max(finalPrice, baseCost * 1.05); // 至少 5% 利润
}
```

### 客户价值评估算法

```typescript
interface CustomerMetrics {
  totalRevenue: number; // 总消费金额
  orderFrequency: number; // 下单频率 (次/年)
  avgOrderValue: number; // 平均订单金额
  paymentSpeed: number; // 回款速度 (天)
  growthRate: number; // 业务增长率
  cooperationYears: number; // 合作年限
}

function evaluateCustomerGrade(metrics: CustomerMetrics): string {
  const score =
    metrics.totalRevenue * 0.3 +
    metrics.orderFrequency * 0.2 +
    metrics.avgOrderValue * 0.2 +
    (365 / metrics.paymentSpeed) * 0.1 +
    metrics.growthRate * 0.1 +
    metrics.cooperationYears * 0.1;

  if (score >= 85) return 'A'; // 战略客户
  if (score >= 70) return 'B'; // 重要客户
  if (score >= 55) return 'C'; // 普通客户
  return 'D'; // 潜力客户
}
```

## 验收标准

- ✅ 客户询价响应时间 < 30 秒
- ✅ 报价准确率 ≥ 95%
- ✅ 合同电子签署率 100%
- ✅ 订单履约跟踪完整度 100%
- ✅ 客户分级准确率 ≥ 90%
- ✅ 智能定价采纳率 ≥ 80%

## 依赖关系

- 用户认证系统 (auth module)
- 产品数据管理 (product module)
- 库存管理系统 (inventory module)
- 财务收款系统 (finance module)
- 电子签名服务 (第三方集成)

## 开发计划

- **Day 1-2**: 客户管理功能开发
- **Day 3-4**: 报价引擎开发
- **Day 5-6**: 合同管理系统开发
- **Day 7-8**: 订单跟踪系统开发
- **Day 9-10**: 集成测试和优化

## 注意事项

1. 所有敏感数据需要加密存储
2. 合同签署需要符合电子签名法规定
3. 客户数据访问需要严格的权限控制
4. 报价和订单数据需要审计日志
5. 与现有系统的接口需要保持一致性
