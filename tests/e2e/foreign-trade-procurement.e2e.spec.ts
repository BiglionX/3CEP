/**
 * 外贸采购端到端测试用例
 * 测试场景：A外贸公司 -> 采购智能体 -> 供应商询价 -> 销售智能体报价 -> 加毛利 -> 客户确认下单
 */

import { test, expect, Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// 测试配置
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1920, height: 1080 },
};

// 测试数据
const TEST_DATA = {
  // A外贸公司（采购方）
  buyerCompany: {
    name: 'A外贸科技有限公司',
    email: 'buyer@foreign-trade.com',
    password: 'Buyer123456',
    companyId: `FT-BUYER-${uuidv4().slice(0, 8)}`,
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
    {
      name: 'C外贸科技集团',
      email: 'supplier2@foreign-trade.com',
      password: 'Supplier234567',
      companyId: 'FT-SUPPLIER-002',
      role: 'exporter',
    },
    {
      name: 'D外贸工业有限公司',
      email: 'supplier3@foreign-trade.com',
      password: 'Supplier345678',
      companyId: 'FT-SUPPLIER-003',
      role: 'exporter',
    },
  ],

  // 采购订单数据
  procurementOrder: {
    orderNumber: `PO-${new Date().getFullYear()}${uuidv4().slice(0, 6)}`,
    items: [
      {
        productName: '智能手机 Galaxy S24 Ultra',
        productCode: 'SM-S9280',
        quantity: 500,
        unit: '台',
        specifications: '12GB RAM + 256GB Storage, Phantom Black',
        expectedUnitPrice: 6500,
        category: '消费电子',
      },
      {
        productName: '无线蓝牙耳机',
        productCode: 'Buds-Pro-2',
        quantity: 1000,
        unit: '副',
        specifications: 'ANC主动降噪，IPX4防水',
        expectedUnitPrice: 800,
        category: '音频设备',
      },
    ],
    deliveryRequirement: {
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 30天后
      deliveryPort: '上海港',
      shippingMethod: '海运',
      paymentTerms: '30%预付款，70%货到付款',
    },
    urgencyLevel: 'medium',
    targetCountries: ['韩国', '日本', '越南'],
  },

  // 供应商报价模板
  quotationTemplate: {
    markupRate: 0.15, // 15%毛利率
    leadTime: 25, // 生产周期25天
    minOrderQuantity: 100,
    warrantyPeriod: 12, // 12个月质保
    samplePolicy: '免费提供样品',
  },
};

// 辅助函数
async function loginAsCompany(page: Page, company: any) {
  await page.goto(`${TEST_CONFIG.baseUrl}/login`);
  await page.fill('[data-testid="email-input"]', company.email);
  await page.fill('[data-testid="password-input"]', company.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeout });
}

async function createProcurementOrder(page: Page, orderData: any) {
  await page.click('[data-testid="create-order-button"]');
  await page.fill(
    '[data-testid="order-title"]',
    `外贸采购订单 - ${orderData.orderNumber}`
  );

  // 添加商品项
  for (const item of orderData.items) {
    await page.click('[data-testid="add-item-button"]');
    await page.fill('[data-testid="product-name"]', item.productName);
    await page.fill('[data-testid="quantity"]', item.quantity.toString());
    await page.fill(
      '[data-testid="expected-price"]',
      item.expectedUnitPrice.toString()
    );
    await page.selectOption('[data-testid="category"]', item.category);
  }

  // 设置交货要求
  await page.fill(
    '[data-testid="delivery-date"]',
    orderData.deliveryRequirement.deliveryDate
  );
  await page.fill(
    '[data-testid="delivery-port"]',
    orderData.deliveryRequirement.deliveryPort
  );
  await page.selectOption(
    '[data-testid="shipping-method"]',
    orderData.deliveryRequirement.shippingMethod
  );

  await page.click('[data-testid="submit-order-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

  return orderData.orderNumber;
}

async function executeSmartProcurementAgent(page: Page, orderId: string) {
  await page.click(`[data-testid="order-${orderId}"]`);
  await page.click('[data-testid="smart-procurement-agent-button"]');

  // 选择历史供应商选项
  await page.click('[data-testid="use-historical-suppliers-checkbox"]');

  // 生成智能询价计划
  await page.click('[data-testid="generate-quotation-plan-button"]');
  await page.waitForSelector('[data-testid="quotation-plan-result"]', {
    timeout: TEST_CONFIG.timeout,
  });

  // 执行询价
  await page.click('[data-testid="execute-quotation-button"]');
  await expect(
    page.locator('[data-testid="quotation-executed-success"]')
  ).toBeVisible();

  return true;
}

async function supplierReceiveAndQuote(
  page: Page,
  supplier: any,
  quotationRequest: any
) {
  // 供应商登录
  await loginAsCompany(page, supplier);

  // 进入销售订单页面
  await page.click('[data-testid="sales-orders-menu"]');

  // 查找询价请求
  const requestElement = await page.locator(
    `[data-testid="quotation-request-${quotationRequest.id}"]`
  );
  await expect(requestElement).toBeVisible();
  await requestElement.click();

  // 销售智能体自动生成报价
  await page.click('[data-testid="auto-generate-quote-button"]');
  await page.waitForSelector('[data-testid="generated-quote-form"]', {
    timeout: TEST_CONFIG.timeout,
  });

  // 供应商可以修改报价
  const markupRate = TEST_DATA.quotationTemplate.markupRate;
  await page.fill(
    '[data-testid="markup-rate-input"]',
    (markupRate * 100).toString()
  );

  // 提交报价
  await page.click('[data-testid="submit-quote-button"]');
  await expect(
    page.locator('[data-testid="quote-submitted-success"]')
  ).toBeVisible();

  return true;
}

async function buyerReviewAndConfirmOrder(
  page: Page,
  orderId: string,
  quotations: any[]
) {
  // 返回买家视角
  await loginAsCompany(page, TEST_DATA.buyerCompany);
  await page.click(`[data-testid="order-${orderId}"]`);

  // 查看供应商报价
  await page.click('[data-testid="view-quotations-tab"]');

  // 验证收到的报价数量
  await expect(page.locator('[data-testid="quotation-item"]')).toHaveCount(
    quotations.length
  );

  // 选择最优报价（假设第一个是最优的）
  const bestQuote = quotations[0];
  await page.click(`[data-testid="select-quote-${bestQuote.id}"]`);

  // 加毛利处理
  await page.fill('[data-testid="profit-margin-input"]', '8'); // 8%毛利

  // 人工审核并发送给客户
  await page.click('[data-testid="manual-review-button"]');
  await page.click('[data-testid="send-to-customer-button"]');

  // 等待客户确认
  await page.click('[data-testid="wait-for-customer-confirmation"]');

  return true;
}

async function customerConfirmOrder(page: Page, orderId: string) {
  // 客户收到报价通知
  await page.click('[data-testid="notifications-bell"]');
  const notification = await page.locator(
    `[data-testid="order-notification-${orderId}"]`
  );
  await expect(notification).toBeVisible();
  await notification.click();

  // 查看详细报价
  await expect(
    page.locator('[data-testid="final-quote-details"]')
  ).toBeVisible();

  // 确认下单
  await page.click('[data-testid="confirm-order-button"]');
  await page.click('[data-testid="place-order-confirm"]');

  // 验证订单状态更新
  await expect(
    page.locator('[data-testid="order-status-confirmed"]')
  ).toBeVisible();

  return true;
}

// 主测试用例
test.describe('外贸采购端到端流程测试', () => {
  let buyerPage: Page;
  let supplierPages: Page[];

  test.beforeAll(async ({ browser }) => {
    // 创建多个浏览器上下文用于不同角色
    buyerPage = await browser.newPage();
    supplierPages = [];

    for (let i = 0; i < TEST_DATA.suppliers.length; i++) {
      const supplierPage = await browser.newPage();
      supplierPages.push(supplierPage);
    }
  });

  test.afterAll(async () => {
    await buyerPage.close();
    for (const page of supplierPages) {
      await page.close();
    }
  });

  test('完整外贸采购流程测试', async () => {
    console.log('🚀 开始外贸采购端到端测试...');

    // 步骤1: A外贸公司登录并创建采购订单
    console.log('📝 步骤1: 创建采购订单');
    await loginAsCompany(buyerPage, TEST_DATA.buyerCompany);
    const orderId = await createProcurementOrder(
      buyerPage,
      TEST_DATA.procurementOrder
    );
    console.log(`✅ 订单创建成功: ${orderId}`);

    // 步骤2: 采购智能体自动分解订单并向供应商询价
    console.log('🤖 步骤2: 执行智能采购代理');
    await executeSmartProcurementAgent(buyerPage, orderId);
    console.log('✅ 智能询价执行完成');

    // 步骤3: 供应商接收订单并自动生成报价
    console.log('📋 步骤3: 供应商报价处理');
    const quotations = [];

    for (let i = 0; i < TEST_DATA.suppliers.length; i++) {
      const supplier = TEST_DATA.suppliers[i];
      const supplierPage = supplierPages[i];

      const quotationSuccess = await supplierReceiveAndQuote(
        supplierPage,
        supplier,
        {
          id: `QT-${orderId}-${i}`,
          orderId: orderId,
        }
      );

      if (quotationSuccess) {
        quotations.push({
          id: `QT-${orderId}-${i}`,
          supplier: supplier.name,
          status: 'submitted',
        });
        console.log(`✅ ${supplier.name} 报价提交成功`);
      }
    }

    // 步骤4: A采购智能体接收报价并处理
    console.log('📊 步骤4: 买家报价评审');
    await buyerReviewAndConfirmOrder(buyerPage, orderId, quotations);
    console.log('✅ 报价评审和处理完成');

    // 步骤5: 客户确认下单
    console.log('✅ 步骤5: 客户确认订单');
    await customerConfirmOrder(buyerPage, orderId);
    console.log('✅ 客户确认下单完成');

    // 验证整个流程成功
    console.log('🎉 外贸采购端到端流程测试完成!');

    // 最终验证
    await expect(
      buyerPage.locator(
        `[data-testid="order-${orderId}"] [data-testid="status"]`
      )
    ).toContainText('已确认');
  });

  // 单独测试用例：验证采购智能体功能
  test('采购智能体功能验证', async () => {
    await loginAsCompany(buyerPage, TEST_DATA.buyerCompany);

    // 创建简单订单用于测试
    const testOrder = {
      ...TEST_DATA.procurementOrder,
      items: [TEST_DATA.procurementOrder.items[0]], // 只测试一个商品
      orderNumber: `TEST-PO-${uuidv4().slice(0, 6)}`,
    };

    const orderId = await createProcurementOrder(buyerPage, testOrder);

    // 测试智能分解功能
    await buyerPage.click(`[data-testid="order-${orderId}"]`);
    await buyerPage.click('[data-testid="smart-procurement-agent-button"]');

    // 验证历史供应商推荐
    await expect(
      buyerPage.locator('[data-testid="historical-suppliers-list"]')
    ).toBeVisible();

    // 验证智能询价计划生成
    await buyerPage.click('[data-testid="generate-quotation-plan-button"]');
    await expect(
      buyerPage.locator('[data-testid="quotation-plan-summary"]')
    ).toBeVisible();

    console.log('✅ 采购智能体功能验证通过');
  });

  // 单独测试用例：验证销售智能体功能
  test('销售智能体功能验证', async () => {
    const supplierPage = supplierPages[0];
    await loginAsCompany(supplierPage, TEST_DATA.suppliers[0]);

    // 模拟接收到询价请求
    await supplierPage.click('[data-testid="sales-orders-menu"]');
    await supplierPage.click('[data-testid="quotation-requests-tab"]');

    // 测试自动生成报价功能
    await supplierPage.click('[data-testid="auto-generate-quote-button"]');

    // 验证报价模板应用
    const markupInput = await supplierPage.locator(
      '[data-testid="markup-rate-input"]'
    );
    await expect(markupInput).toHaveValue(/[0-9]+/); // 应该有默认值

    console.log('✅ 销售智能体功能验证通过');
  });
});

export { TEST_CONFIG, TEST_DATA };
