# 测试规范与质量保障

## 📋 测试策略总览

采用分层测试策略，确保软件质量的全方位覆盖：

```
测试金字塔
    ┌─────────────────┐
    │   E2E Tests     │  ← 端到端测试 (10%)
    ├─────────────────┤
    │ Integration     │  ← 集成测试 (20%)
    │    Tests        │
    ├─────────────────┤
    │   Unit Tests    │  ← 单元测试 (70%)
    └─────────────────┘
```

## 🧪 测试分类与规范

### 单元测试规范

#### 测试文件组织

```
src/
├── modules/
│   └── repair-service/
│       ├── services/
│       │   ├── workOrderService.ts
│       │   └── __tests__/
│       │       └── workOrderService.test.ts
│       └── components/
│           ├── WorkOrderCard.tsx
│           └── __tests__/
│               └── WorkOrderCard.test.tsx
└── tech/
    └── utils/
        ├── validationUtils.ts
        └── __tests__/
            └── validationUtils.test.ts
```

#### 测试用例模板

```typescript
// ✅ 推荐的测试结构
describe('WorkOrderService', () => {
  let workOrderService: WorkOrderService;
  let mockRepository: jest.Mocked<WorkOrderRepository>;

  // 测试环境设置
  beforeEach(() => {
    mockRepository = createMockRepository();
    workOrderService = new WorkOrderService(mockRepository);
  });

  // 清理工作
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkOrder', () => {
    it('should create work order successfully with valid data', async () => {
      // Arrange - 准备测试数据
      const validInput = {
        customerId: 'customer-123',
        deviceId: 'device-456',
        description: 'Screen replacement needed',
      };

      const expectedOrder = {
        id: 'order-789',
        ...validInput,
        status: 'created',
        createdAt: expect.any(Date),
      };

      mockRepository.create.mockResolvedValue(expectedOrder);

      // Act - 执行被测试函数
      const result = await workOrderService.createWorkOrder(validInput);

      // Assert - 验证结果
      expect(result).toEqual(expectedOrder);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(validInput)
      );
    });

    it('should throw error for invalid input', async () => {
      // Arrange
      const invalidInput = {
        customerId: '', // 无效的客户ID
        deviceId: 'device-456',
        description: 'Test',
      };

      // Act & Assert
      await expect(
        workOrderService.createWorkOrder(invalidInput)
      ).rejects.toThrow('Invalid customer ID');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const validInput = {
        /* ... */
      };
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        workOrderService.createWorkOrder(validInput)
      ).rejects.toThrow('Failed to create work order');
    });
  });
});
```

#### 测试覆盖率要求

```typescript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/modules/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/tech/api/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### 集成测试规范

#### API 集成测试

```typescript
// tests/integration/api/workOrder.integration.test.ts
describe('Work Order API Integration', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getAuthToken();
  });

  describe('POST /api/work-orders', () => {
    it('should create work order successfully', async () => {
      const requestBody = {
        customerId: 'cust-123',
        deviceId: 'dev-456',
        description: 'Battery replacement',
      };

      const response = await request(app)
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        orderNumber: expect.stringMatching(/^WO-\d+$/),
        customerId: 'cust-123',
        status: 'created',
      });

      // 验证数据库状态
      const createdOrder = await db.workOrders.findById(response.body.id);
      expect(createdOrder).toBeDefined();
      expect(createdOrder.description).toBe('Battery replacement');
    });

    it('should reject invalid authorization', async () => {
      await request(app)
        .post('/api/work-orders')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);
    });
  });
});
```

#### 数据库集成测试

```typescript
// tests/integration/database/workOrder.db.test.ts
describe('Work Order Database Operations', () => {
  let db: Database;

  beforeAll(async () => {
    db = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await db.clean(); // 清理测试数据
  });

  describe('findWorkOrdersByStatus', () => {
    it('should return work orders with specified status', async () => {
      // 准备测试数据
      await db.workOrders.create({
        id: 'wo-1',
        status: 'assigned',
        customerId: 'cust-1',
      });

      await db.workOrders.create({
        id: 'wo-2',
        status: 'completed',
        customerId: 'cust-1',
      });

      // 执行测试
      const result = await db.workOrders.findByStatus('assigned');

      // 验证结果
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('wo-1');
      expect(result[0].status).toBe('assigned');
    });
  });
});
```

### 端到端测试规范

#### Playwright E2E 测试

```typescript
// tests/e2e/workOrder.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Work Order Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录准备
    await page.goto('/login');
    await page.fill('[data-testid=username]', 'test-user');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('should create and manage work order successfully', async ({ page }) => {
    // 导航到工单页面
    await page.click('[data-testid=navigation-work-orders]');
    await page.waitForURL('/work-orders');

    // 创建新工单
    await page.click('[data-testid=create-work-order]');
    await page.waitForSelector('[data-testid=work-order-form]');

    // 填写表单
    await page.fill('[data-testid=customer-select]', 'Test Customer');
    await page.fill('[data-testid=device-input]', 'iPhone 14');
    await page.fill(
      '[data-testid=description-textarea]',
      'Screen replacement needed'
    );

    // 提交表单
    await page.click('[data-testid=submit-button]');
    await page.waitForSelector('[data-testid=success-message]');

    // 验证创建成功
    await expect(page.locator('[data-testid=work-order-list]')).toContainText(
      'Test Customer'
    );

    // 验证工单详情
    await page.click('[data-testid=work-order-item]:first-child');
    await expect(
      page.locator('[data-testid=work-order-details]')
    ).toContainText('Screen replacement needed');
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.click('[data-testid=navigation-work-orders]');
    await page.click('[data-testid=create-work-order]');

    // 尝试提交空表单
    await page.click('[data-testid=submit-button]');

    // 验证错误提示
    await expect(page.locator('[data-testid=error-message]')).toBeVisible();
    await expect(page.locator('[data-testid=error-message]')).toContainText(
      'Required field'
    );
  });
});
```

## 🔧 测试工具配置

### Jest 配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@tech/(.*)$': '<rootDir>/src/tech/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
};
```

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/e2e-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 测试执行策略

### CI/CD 集成

```yaml
# .github/workflows/test-suite.yml
name: Test Suite

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-report
          path: test-results/
```

### 测试命令脚本

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:ci": "npm run test:all -- --ci --maxWorkers=2"
  }
}
```

## 🎯 测试质量指标

### 质量门禁

```typescript
interface TestQualityGate {
  // 覆盖率阈值
  coverageThresholds: {
    lines: number; // 行覆盖率 ≥ 90%
    functions: number; // 函数覆盖率 ≥ 90%
    branches: number; // 分支覆盖率 ≥ 85%
    statements: number; // 语句覆盖率 ≥ 90%
  };

  // 执行指标
  executionMetrics: {
    testDuration: number; // 单个测试 ≤ 100ms
    suiteDuration: number; // 测试套件 ≤ 10分钟
    flakyTestRate: number; // 不稳定测试率 ≤ 2%
  };

  // 质量指标
  qualityMetrics: {
    codeToTestRatio: number; // 代码与测试比例 1:1
    assertionDensity: number; // 断言密度 ≥ 3个/测试
    testIndependence: number; // 测试独立性 100%
  };
}
```

### 测试报告模板

```typescript
interface TestReport {
  timestamp: string;
  environment: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  coverage: CoverageReport;
  failures: TestFailure[];
  performance: PerformanceMetrics;
}

interface CoverageReport {
  lines: CoverageDetail;
  functions: CoverageDetail;
  branches: CoverageDetail;
  statements: CoverageDetail;
}

interface TestFailure {
  testName: string;
  errorMessage: string;
  stackTrace: string;
  duration: number;
}
```

## 🛡️ 测试安全规范

### 测试数据安全

```typescript
// tests/test-data-factory.ts
class TestDataFactory {
  static createUser(userData: Partial<User> = {}): User {
    return {
      id: `test-user-${crypto.randomUUID()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      password: '$2b$10$...', // 预哈希的测试密码
      ...userData,
    };
  }

  static createWorkOrder(orderData: Partial<WorkOrder> = {}): WorkOrder {
    return {
      id: `test-order-${crypto.randomUUID()}`,
      orderNumber: `WO-${Date.now()}`,
      customerId: `test-customer-${crypto.randomUUID()}`,
      status: 'created',
      createdAt: new Date(),
      ...orderData,
    };
  }

  // 确保测试数据隔离
  static async cleanupTestData(): Promise<void> {
    const testPrefixes = ['test-', 'temp-', 'tmp-'];

    for (const prefix of testPrefixes) {
      await db.users.deleteMany({ id: { $regex: `^${prefix}` } });
      await db.workOrders.deleteMany({ id: { $regex: `^${prefix}` } });
    }
  }
}
```

### 敏感信息保护

```typescript
// tests/setup.ts
beforeEach(() => {
  // Mock 环境变量
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

  // Mock 外部服务
  jest.mock('@/services/email.service', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
  }));

  jest.mock('@/services/sms.service', () => ({
    sendSMS: jest.fn().mockResolvedValue({ success: true }),
  }));
});

afterEach(async () => {
  // 清理模拟
  jest.clearAllMocks();

  // 清理测试数据
  await TestDataFactory.cleanupTestData();

  // 重置数据库状态
  if (db) {
    await db.reset();
  }
});
```

## 📈 持续改进机制

### 测试成熟度评估

```typescript
interface TestMaturityModel {
  levels: {
    level1_basic: {
      criteria: ['基本单元测试覆盖', '手动测试为主', '有限的自动化'];
      metrics: {
        coverage: '30-50%';
        automation: '20-40%';
      };
    };
    level2_standard: {
      criteria: ['结构化测试策略', '持续集成集成', '测试驱动开发实践'];
      metrics: {
        coverage: '70-85%';
        automation: '70-85%';
      };
    };
    level3_advanced: {
      criteria: ['全面的测试覆盖', '智能测试执行', '质量左移实践'];
      metrics: {
        coverage: '90-95%';
        automation: '95-100%';
      };
    };
  };
}
```

### 改进行动计划

```typescript
const QuarterlyImprovementPlan = {
  Q1: {
    goals: [
      '提升单元测试覆盖率至85%',
      '建立测试数据管理机制',
      '完善E2E测试场景',
    ],
    actions: [
      {
        task: '为遗留代码补充单元测试',
        owner: 'Senior Developers',
        timeline: '2 months',
      },
      {
        task: '建立测试数据工厂',
        owner: 'QA Team',
        timeline: '1 month',
      },
    ],
  },
  Q2: {
    goals: ['实现测试并行执行', '建立测试性能监控', '完善测试文档'],
  },
};
```

---

_规范版本: v1.2_
_最后更新: 2026年2月21日_
_维护团队: QA团队_
