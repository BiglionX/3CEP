/**
 * 外贸采购测试数据管理模块
 * 提供测试所需的各种数据结构和辅助函数
 */

import { v4 as uuidv4 } from 'uuid';

// 测试环境配置
const FOREIGN_TRADE_TEST_ENV = {
  // 数据库连接配置（用于清理测试数据）
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'test_db',
    username: process.env.TEST_DB_USER || 'test_user',
    password: process.env.TEST_DB_PASS || 'test_pass',
  },

  // API端点配置
  apiEndpoints: {
    auth: '/api/auth',
    procurement: '/api/foreign-trade/procurement',
    sales: '/api/foreign-trade/sales',
    suppliers: '/api/foreign-trade/suppliers',
    orders: '/api/foreign-trade/orders',
  },

  // 测试超时设置
  timeouts: {
    pageLoad: 30000,
    apiCall: 10000,
    elementWait: 5000,
    testSuite: 300000, // 5分钟
  },
};

// 测试用户数据工厂
class TestUserFactory {
  static createImporter(userData: Partial<ImporterUser> = {}): ImporterUser {
    return {
      id: `importer_${uuidv4()}`,
      companyName:
        userData.companyName || `进口商${Math.floor(Math.random() * 1000)}`,
      email:
        userData.email ||
        `importer${Math.floor(Math.random() * 10000)}@test.com`,
      password: userData.password || 'Test123456',
      businessLicense: `BL${Math.floor(Math.random() * 100000000)}`,
      contactPerson: userData.contactPerson || '测试联系人',
      phone: `138${Math.floor(Math.random() * 10000000)}`,
      address: '上海市浦东新区测试路123号',
      country: '中国',
      registrationDate: new Date(),
      status: 'active',
      ...userData,
    };
  }

  static createExporter(userData: Partial<ExporterUser> = {}): ExporterUser {
    return {
      id: `exporter_${uuidv4()}`,
      companyName:
        userData.companyName || `出口商${Math.floor(Math.random() * 1000)}`,
      email:
        userData.email ||
        `exporter${Math.floor(Math.random() * 10000)}@test.com`,
      password: userData.password || 'Test123456',
      businessLicense: `BL${Math.floor(Math.random() * 100000000)}`,
      contactPerson: userData.contactPerson || '测试联系人',
      phone: `139${Math.floor(Math.random() * 10000000)}`,
      address: '深圳市南山区测试路456号',
      country: '中国',
      exportLicense: `EL${Math.floor(Math.random() * 100000000)}`,
      registrationDate: new Date(),
      status: 'active',
      ...userData,
    };
  }

  static createMultipleImporters(count: number): ImporterUser[] {
    return Array.from({ length: count }, (_, i) =>
      this.createImporter({ companyName: `进口商${i + 1}号公司` })
    );
  }

  static createMultipleExporters(count: number): ExporterUser[] {
    return Array.from({ length: count }, (_, i) =>
      this.createExporter({ companyName: `出口商${i + 1}号公司` })
    );
  }
}

// 测试订单数据工厂
class TestOrderFactory {
  static createProcurementOrder(
    orderData: Partial<ProcurementOrder> = {}
  ): ProcurementOrder {
    const orderId = `PO${new Date().getFullYear()}${uuidv4().slice(0, 6)}`;

    return {
      id: orderId,
      orderNumber: orderId,
      importerId: orderData.importerId || '',
      title: orderData.title || `外贸采购订单-${orderId}`,
      description: orderData.description || '自动化测试用采购订单',
      items: orderData.items || [
        {
          id: `item_${uuidv4()}`,
          productName: '智能手机 Galaxy S24 Ultra',
          productCode: 'SM-S9280',
          quantity: 500,
          unit: '台',
          specifications: '12GB RAM + 256GB Storage',
          expectedUnitPrice: 6500,
          category: '消费电子',
          hsCode: '85171230',
        },
        {
          id: `item_${uuidv4()}`,
          productName: '无线蓝牙耳机',
          productCode: 'Buds-Pro-2',
          quantity: 1000,
          unit: '副',
          specifications: 'ANC主动降噪',
          expectedUnitPrice: 800,
          category: '音频设备',
          hsCode: '85183000',
        },
      ],
      totalAmount: orderData.totalAmount || 4050000, // 500*6500 + 1000*800
      currency: orderData.currency || 'CNY',
      deliveryRequirement: orderData.deliveryRequirement || {
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deliveryPort: '上海港',
        shippingMethod: '海运',
        incoterms: 'FOB',
        paymentTerms: '30%预付款，70%货到付款',
      },
      targetCountries: orderData.targetCountries || ['韩国', '日本'],
      urgencyLevel: orderData.urgencyLevel || 'medium',
      status: orderData.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...orderData,
    };
  }

  static createSalesOrder(orderData: Partial<SalesOrder> = {}): SalesOrder {
    const orderId = `SO${new Date().getFullYear()}${uuidv4().slice(0, 6)}`;

    return {
      id: orderId,
      orderNumber: orderId,
      exporterId: orderData.exporterId || '',
      procurementOrderId: orderData.procurementOrderId || '',
      title: orderData.title || `外贸销售订单-${orderId}`,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || 'USD',
      quotation: orderData.quotation || {
        unitPrices: [],
        totalPrice: 0,
        markupRate: 0.15,
        leadTime: 25,
        warrantyPeriod: 12,
        validityPeriod: 30,
      },
      deliveryTerms: orderData.deliveryTerms || {
        deliveryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        shippingMethod: '海运',
        portOfLoading: '釜山港',
        portOfDestination: '上海港',
      },
      paymentTerms: orderData.paymentTerms || '30%预付款，70%见提单副本付款',
      status: orderData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...orderData,
    };
  }
}

// 测试报价数据工厂
class TestQuotationFactory {
  static createQuotation(quotationData: Partial<Quotation> = {}): Quotation {
    const quotationId = `QT${new Date().getFullYear()}${uuidv4().slice(0, 6)}`;

    return {
      id: quotationId,
      procurementOrderId: quotationData.procurementOrderId || '',
      exporterId: quotationData.exporterId || '',
      items: quotationData.items || [],
      unitPrices: quotationData.unitPrices || [],
      subtotal: quotationData.subtotal || 0,
      markupRate: quotationData.markupRate || 0.15,
      taxRate: quotationData.taxRate || 0.13,
      totalAmount: quotationData.totalAmount || 0,
      currency: quotationData.currency || 'USD',
      leadTime: quotationData.leadTime || 25,
      warrantyPeriod: quotationData.warrantyPeriod || 12,
      validityPeriod: quotationData.validityPeriod || 30,
      termsAndConditions: quotationData.termsAndConditions || '标准贸易条款',
      status: quotationData.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...quotationData,
    };
  }

  static generateQuotationsForOrder(
    procurementOrder: ProcurementOrder,
    exporters: ExporterUser[]
  ): Quotation[] {
    return exporters.map(exporter => {
      const itemsWithPrices = procurementOrder.items.map(item => ({
        itemId: item.id,
        productName: item.productName,
        quantity: item.quantity,
        basePrice: item.expectedUnitPrice * 0.85, // 基础价格打85折
        quotedPrice: item.expectedUnitPrice * 0.85 * 1.15, // 加15%利润
        unit: item.unit,
      }));

      const subtotal = itemsWithPrices.reduce(
        (sum, item) => sum + item.quotedPrice * item.quantity,
        0
      );
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      return this.createQuotation({
        procurementOrderId: procurementOrder.id,
        exporterId: exporter.id,
        items: procurementOrder.items,
        unitPrices: itemsWithPrices,
        subtotal,
        totalAmount: total,
        currency: 'USD',
      });
    });
  }
}

// 测试产品目录数据
const TEST_PRODUCT_CATALOG = {
  electronics: [
    {
      id: 'prod_001',
      name: '智能手机 Galaxy S24 Ultra',
      code: 'SM-S9280',
      category: '消费电子',
      hsCode: '85171230',
      unit: '台',
      standardPrice: 6500,
      moq: 100,
      leadTime: 25,
    },
    {
      id: 'prod_002',
      name: '无线蓝牙耳机',
      code: 'Buds-Pro-2',
      category: '音频设备',
      hsCode: '85183000',
      unit: '副',
      standardPrice: 800,
      moq: 50,
      leadTime: 15,
    },
  ],
  industrial: [
    {
      id: 'prod_003',
      name: '工业传感器',
      code: 'SENSOR-IND-001',
      category: '工业设备',
      hsCode: '90318090',
      unit: '个',
      standardPrice: 1200,
      moq: 50,
      leadTime: 30,
    },
  ],
};

// 测试国家和地区数据
const TEST_COUNTRIES = [
  { code: 'CN', name: '中国', currency: 'CNY', language: 'zh' },
  { code: 'KR', name: '韩国', currency: 'KRW', language: 'ko' },
  { code: 'JP', name: '日本', currency: 'JPY', language: 'ja' },
  { code: 'VN', name: '越南', currency: 'VND', language: 'vi' },
  { code: 'US', name: '美国', currency: 'USD', language: 'en' },
];

// 测试港口数据
const TEST_PORTS = {
  china: [
    { code: 'SHANGHAI', name: '上海港', country: 'CN' },
    { code: 'NINGBO', name: '宁波港', country: 'CN' },
    { code: 'SHENZHEN', name: '深圳港', country: 'CN' },
  ],
  korea: [
    { code: 'BUSAN', name: '釜山港', country: 'KR' },
    { code: 'INCHEON', name: '仁川港', country: 'KR' },
  ],
  japan: [
    { code: 'YOKOHAMA', name: '横滨港', country: 'JP' },
    { code: 'KOBE', name: '神户港', country: 'JP' },
  ],
};

// 测试数据清理函数
async function cleanupTestData(database: any) {
  try {
    // 清理测试订单
    await database.query(
      'DELETE FROM foreign_trade_orders WHERE order_number LIKE $1',
      ['TEST-%']
    );

    // 清理测试报价
    await database.query(
      'DELETE FROM foreign_trade_quotations WHERE id LIKE $1',
      ['QT202%']
    );

    // 清理测试用户
    await database.query(
      'DELETE FROM foreign_trade_users WHERE email LIKE $1',
      ['%test.com']
    );

    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('❌ 测试数据清理失败:', error);
  }
}

// 类型定义
interface ImporterUser {
  id: string;
  companyName: string;
  email: string;
  password: string;
  businessLicense: string;
  contactPerson: string;
  phone: string;
  address: string;
  country: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended';
}

interface ExporterUser {
  id: string;
  companyName: string;
  email: string;
  password: string;
  businessLicense: string;
  exportLicense: string;
  contactPerson: string;
  phone: string;
  address: string;
  country: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended';
}

interface ProcurementOrder {
  id: string;
  orderNumber: string;
  importerId: string;
  title: string;
  description: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  deliveryRequirement: DeliveryRequirement;
  targetCountries: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'quoted' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  exporterId: string;
  procurementOrderId: string;
  title: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  quotation: QuotationDetails;
  deliveryTerms: DeliveryTerms;
  paymentTerms: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  specifications: string;
  expectedUnitPrice: number;
  category: string;
  hsCode: string;
}

interface DeliveryRequirement {
  deliveryDate: Date;
  deliveryPort: string;
  shippingMethod: '海运' | '空运' | '陆运';
  incoterms: string;
  paymentTerms: string;
}

interface Quotation {
  id: string;
  procurementOrderId: string;
  exporterId: string;
  items: OrderItem[];
  unitPrices: QuotedItem[];
  subtotal: number;
  markupRate: number;
  taxRate: number;
  totalAmount: number;
  currency: string;
  leadTime: number;
  warrantyPeriod: number;
  validityPeriod: number;
  termsAndConditions: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface QuotedItem {
  itemId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  quotedPrice: number;
  unit: string;
}

interface QuotationDetails {
  unitPrices: QuotedItem[];
  totalPrice: number;
  markupRate: number;
  leadTime: number;
  warrantyPeriod: number;
  validityPeriod: number;
}

interface DeliveryTerms {
  deliveryDate: Date;
  shippingMethod: '海运' | '空运' | '陆运';
  portOfLoading: string;
  portOfDestination: string;
}

// 导出所有类和常量
export {
  TestUserFactory,
  TestOrderFactory,
  TestQuotationFactory,
  FOREIGN_TRADE_TEST_ENV,
  TEST_PRODUCT_CATALOG,
  TEST_COUNTRIES,
  TEST_PORTS,
  cleanupTestData,
};
