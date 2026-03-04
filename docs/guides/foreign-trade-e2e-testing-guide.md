# 外贸采购端到端测试指南

## 📋 概述

本文档详细介绍了外贸采购系统的端到端测试方案，涵盖从采购订单创建到最终客户确认下单的完整业务流程。

## 🎯 测试目标

验证以下完整的外贸采购流程：

1. **A外贸公司**创建采购订单
2. **采购智能体**自动分解订单并向1-3家历史供应商询价
3. **供应商外贸公司**接收订单，销售智能体自动生成报价
4. **供应商**可选择修改报价后提交
5. **A采购智能体**接收报价后自动加毛利
6. **A人工审核**后发送给客户（消息或邮件）
7. **客户**收到报价后确认下单，进入正式订单流程

## 🏗️ 测试架构

### 测试组件结构

```
tests/e2e/
├── foreign-trade-procurement.e2e.spec.ts    # 主测试用例文件
├── foreign-trade-test-data.ts              # 测试数据管理模块
└── enterprise/                             # 企业相关测试配置
    └── enterprise.config.ts                # 企业服务测试配置

scripts/
└── run-foreign-trade-e2e.js               # 测试执行脚本

test-results/                               # 测试结果输出目录
├── foreign-trade-e2e-report.json          # JSON格式测试报告
└── foreign-trade-e2e-html-report/         # HTML格式测试报告
```

## 🔧 环境准备

### 必需环境变量

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 测试配置
TEST_BASE_URL=http://localhost:3000
TEST_ENV=test
HEADLESS=true
WORKERS=1
```

### 依赖安装

```bash
# 安装Playwright
npm install -D @playwright/test

# 安装测试依赖
npm install uuid

# 安装浏览器驱动
npx playwright install
```

## 🧪 测试用例详解

### 1. 完整外贸采购流程测试

**测试文件**: `foreign-trade-procurement.e2e.spec.ts`

**测试场景**: 验证完整的端到端业务流程

```typescript
test('完整外贸采购流程测试', async () => {
  // 步骤1: A外贸公司登录并创建采购订单
  await loginAsCompany(buyerPage, TEST_DATA.buyerCompany);
  const orderId = await createProcurementOrder(
    buyerPage,
    TEST_DATA.procurementOrder
  );

  // 步骤2: 采购智能体自动分解订单并向供应商询价
  await executeSmartProcurementAgent(buyerPage, orderId);

  // 步骤3: 供应商接收订单并自动生成报价
  const quotations = [];
  for (let i = 0; i < TEST_DATA.suppliers.length; i++) {
    const supplier = TEST_DATA.suppliers[i];
    const supplierPage = supplierPages[i];
    await supplierReceiveAndQuote(supplierPage, supplier, {
      id: `QT-${orderId}-${i}`,
      orderId: orderId,
    });
    quotations.push({ id: `QT-${orderId}-${i}`, supplier: supplier.name });
  }

  // 步骤4: A采购智能体接收报价并处理
  await buyerReviewAndConfirmOrder(buyerPage, orderId, quotations);

  // 步骤5: 客户确认下单
  await customerConfirmOrder(buyerPage, orderId);
});
```

### 2. 采购智能体功能验证

**测试场景**: 验证采购智能体的核心功能

```typescript
test('采购智能体功能验证', async () => {
  // 验证历史供应商推荐
  await expect(
    page.locator('[data-testid="historical-suppliers-list"]')
  ).toBeVisible();

  // 验证智能询价计划生成
  await page.click('[data-testid="generate-quotation-plan-button"]');
  await expect(
    page.locator('[data-testid="quotation-plan-summary"]')
  ).toBeVisible();
});
```

### 3. 销售智能体功能验证

**测试场景**: 验证销售智能体的报价生成功能

```typescript
test('销售智能体功能验证', async () => {
  // 测试自动生成报价功能
  await page.click('[data-testid="auto-generate-quote-button"]');

  // 验证报价模板应用
  const markupInput = await page.locator('[data-testid="markup-rate-input"]');
  await expect(markupInput).toHaveValue(/[0-9]+/);
});
```

## 📊 测试数据结构

### 测试用户数据

```typescript
const TEST_DATA = {
  // A外贸公司（采购方）
  buyerCompany: {
    name: 'A外贸科技有限公司',
    email: 'buyer@foreign-trade.com',
    password: 'Buyer123456',
    companyId: 'FT-BUYER-XXXXXX',
    role: 'importer',
  },

  // 供应商外贸公司
  suppliers: [
    {
      name: 'B外贸电子有限公司',
      email: 'supplier1@foreign-trade.com',
      password: 'Supplier123456',
      companyId: 'FT-SUPPLIER-001',
      role: 'exporter',
    },
    // ... 更多供应商
  ],

  // 采购订单数据
  procurementOrder: {
    items: [
      {
        productName: '智能手机 Galaxy S24 Ultra',
        quantity: 500,
        unit: '台',
        expectedUnitPrice: 6500,
        category: '消费电子',
      },
    ],
    deliveryRequirement: {
      deliveryDate: '2026-03-30',
      deliveryPort: '上海港',
      shippingMethod: '海运',
    },
  },
};
```

## ⚡ 执行测试

### 命令行执行

```bash
# 执行完整的外贸采购E2E测试
node scripts/run-foreign-trade-e2e.js

# 或者直接使用Playwright
npx playwright test tests/e2e/foreign-trade-procurement.e2e.spec.ts

# 带有可视化界面的测试执行
HEADLESS=false node scripts/run-foreign-trade-e2e.js
```

### CI/CD集成

```yaml
# GitHub Actions 示例
name: Foreign Trade E2E Tests
on: [push, pull_request]

jobs:
  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: node scripts/run-foreign-trade-e2e.js
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SERVICE_ROLE_KEY }}
          TEST_BASE_URL: http://localhost:3000
```

## 📈 测试报告

### 报告格式

测试执行后会在 `test-results/` 目录下生成多种格式的报告：

1. **JSON报告**: `foreign-trade-e2e-report.json`
2. **HTML报告**: `foreign-trade-e2e-html-report/index.html`
3. **控制台输出**: 实时测试进度和结果

### 报告示例

```json
{
  "passed": 3,
  "failed": 0,
  "skipped": 0,
  "total": 3,
  "duration": 125000,
  "failures": [],
  "successRate": 100
}
```

## 🔍 故障排除

### 常见问题

1. **页面加载超时**

   ```bash
   # 增加超时时间
   PLAYWRIGHT_TIMEOUT=60000 node scripts/run-foreign-trade-e2e.js
   ```

2. **浏览器驱动缺失**

   ```bash
   # 重新安装浏览器驱动
   npx playwright install
   ```

3. **测试数据冲突**
   ```bash
   # 清理测试数据
   npm run test:cleanup
   ```

### 调试技巧

```bash
# 启用详细日志
DEBUG=pw:api node scripts/run-foreign-trade-e2e.js

# 可视化调试模式
HEADLESS=false node scripts/run-foreign-trade-e2e.js

# 单个测试用例调试
npx playwright test tests/e2e/foreign-trade-procurement.e2e.spec.ts:120 --debug
```

## 📋 质量门禁

### 通过标准

- ✅ **最低通过率**: 95%
- ✅ **最大失败用例数**: 1个
- ✅ **平均响应时间**: < 5秒
- ✅ **安全性检查**: 0个安全漏洞

### 测试覆盖率

- 🎯 **功能覆盖率**: 100% 核心业务流程
- 🎯 **页面覆盖率**: 90% 主要功能页面
- 🎯 **API覆盖率**: 85% 关键接口

## 🔄 持续改进

### 定期维护任务

1. **每周**: 更新测试数据和场景
2. **每月**: 审查测试覆盖率和质量指标
3. **每季度**: 重构测试框架和优化性能

### 版本兼容性

确保测试脚本与以下版本兼容：

- Node.js: >= 16.x
- Playwright: >= 1.30.0
- TypeScript: >= 4.5.0

---

**最后更新**: 2026年2月27日
**维护者**: 测试团队
**版本**: 1.0.0
