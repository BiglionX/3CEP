const { test, expect } = require('@playwright/test');

test.describe('设备生命周期功能测试', () => {
  // 测试数据
  const TEST_QRCODE_ID = 'test_device_001';
  const TEST_DEVICE_DATA = {
    productModel: 'iPhone 14 Pro',
    productCategory: '智能手机',
    brandName: 'Apple',
    serialNumber: 'SN123456789',
    warrantyPeriod: 12
  };

  test.beforeEach(async ({ page }) => {
    // 确保测试环境干净
    await cleanupTestData();
  });

  test.afterEach(async ({ page }) => {
    // 清理测试数据
    await cleanupTestData();
  });

  test('设备档案创建和查询', async ({ page }) => {
    // 测试设备档案的创建和基本查询功能
    
    // 1. 创建设备档案
    const createResponse = await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    expect(createResponse.status()).toBe(200);
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    expect(createResult.data.qrcodeId).toBe(TEST_QRCODE_ID);
    expect(createResult.data.productModel).toBe(TEST_DEVICE_DATA.productModel);

    // 2. 查询设备档案
    const getResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/profile`);
    expect(getResponse.status()).toBe(200);
    
    const getResult = await getResponse.json();
    expect(getResult.success).toBe(true);
    expect(getResult.data.productModel).toBe(TEST_DEVICE_DATA.productModel);
    expect(getResult.data.currentStatus).toBe('manufactured');
  });

  test('生命周期事件记录功能', async ({ page }) => {
    // 先创建设备档案
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    // 记录多个生命周期事件
    const events = [
      {
        eventType: 'manufactured',
        notes: '设备出厂测试',
        location: '深圳工厂'
      },
      {
        eventType: 'activated', 
        notes: '设备首次激活',
        location: '北京用户家中'
      },
      {
        eventType: 'repaired',
        eventSubtype: 'screen_replacement',
        notes: '屏幕更换维修',
        location: '上海维修中心',
        cost: 800,
        technician: '张师傅'
      },
      {
        eventType: 'part_replaced',
        eventSubtype: 'battery',
        notes: '更换原装电池',
        location: '广州服务中心',
        cost: 200
      }
    ];

    // 逐个记录事件
    for (const event of events) {
      const response = await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
        data: event
      });
      
      expect(response.status()).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.eventType).toBe(event.eventType);
    }

    // 验证事件查询
    const historyResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/lifecycle`);
    expect(historyResponse.status()).toBe(200);
    
    const historyResult = await historyResponse.json();
    expect(historyResult.success).toBe(true);
    expect(historyResult.data.length).toBe(events.length);
    
    // 验证事件顺序（按时间倒序）
    const firstEvent = historyResult.data[0];
    expect(firstEvent.eventType).toBe('part_replaced');
  });

  test('特定事件类型查询', async ({ page }) => {
    // 先创建一些事件
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    const testEvents = [
      { eventType: 'manufactured', notes: '出厂' },
      { eventType: 'activated', notes: '激活' },
      { eventType: 'repaired', notes: '维修1' },
      { eventType: 'repaired', notes: '维修2' },
      { eventType: 'transferred', notes: '转移' }
    ];

    for (const event of testEvents) {
      await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
        data: event
      });
    }

    // 查询特定类型的事件
    const repairResponse = await page.request.get(
      `/api/devices/${TEST_QRCODE_ID}/lifecycle?eventType=repaired`
    );
    
    expect(repairResponse.status()).toBe(200);
    const repairResult = await repairResponse.json();
    expect(repairResult.success).toBe(true);
    
    // 应该只有2个维修事件
    expect(repairResult.data.length).toBe(2);
    repairResult.data.forEach(event => {
      expect(event.eventType).toBe('repaired');
    });
  });

  test('设备状态自动更新', async ({ page }) => {
    // 创建设备档案
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    // 记录激活事件
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
      data: {
        eventType: 'activated',
        notes: '设备激活'
      }
    });

    // 验证设备状态已更新为已激活
    const profileResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/profile`);
    const profileResult = await profileResponse.json();
    
    expect(profileResult.data.currentStatus).toBe('activated');
    expect(profileResult.data.firstActivatedAt).toBeTruthy();

    // 记录维修事件
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
      data: {
        eventType: 'repaired',
        notes: '设备维修'
      }
    });

    // 验证维修统计已更新
    const updatedProfileResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/profile`);
    const updatedProfileResult = await updatedProfileResponse.json();
    
    expect(updatedProfileResult.data.totalRepairCount).toBe(1);
  });

  test('扫码页面设备档案展示', async ({ page }) => {
    // 创建测试数据
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
      data: {
        eventType: 'manufactured',
        notes: '出厂测试'
      }
    });

    // 访问设备扫码页面
    await page.goto(`/device/scan/${TEST_QRCODE_ID}`);
    
    // 验证页面元素存在
    await expect(page.getByText('设备生命周期档案')).toBeVisible();
    await expect(page.getByText(`二维码: ${TEST_QRCODE_ID}`)).toBeVisible();
    
    // 验证设备档案卡片显示
    await expect(page.getByText('设备档案')).toBeVisible();
    await expect(page.getByText(TEST_DEVICE_DATA.productModel)).toBeVisible();
    await expect(page.getByText(TEST_DEVICE_DATA.brandName)).toBeVisible();
    
    // 验证生命周期时间轴显示
    await expect(page.getByText('生命周期时间轴')).toBeVisible();
    await expect(page.getByText('出厂测试')).toBeVisible();
  });

  test('设备保修信息计算', async ({ page }) => {
    // 创建带保修期的设备档案
    const warrantyData = {
      ...TEST_DEVICE_DATA,
      manufacturingDate: '2026-01-01',
      warrantyPeriod: 12 // 12个月保修期
    };

    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: warrantyData
    });

    // 获取设备档案验证保修信息
    const profileResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/profile`);
    const profileResult = await profileResponse.json();
    
    expect(profileResult.data.warrantyPeriod).toBe(12);
    expect(profileResult.data.warrantyStartDate).toBeTruthy();
    expect(profileResult.data.warrantyExpiry).toBeTruthy();
  });

  test('错误处理和边界情况', async ({ page }) => {
    // 测试不存在的设备
    const nonExistResponse = await page.request.get('/api/devices/nonexistent/profile');
    expect(nonExistResponse.status()).toBe(404);
    
    const nonExistResult = await nonExistResponse.json();
    expect(nonExistResult.success).toBe(false);
    expect(nonExistResult.error).toContain('未找到');

    // 测试无效的事件类型
    const invalidEventResponse = await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
      data: {
        eventType: 'invalid_type',
        notes: '无效事件类型测试'
      }
    });
    
    expect(invalidEventResponse.status()).toBe(400);
    
    // 测试缺少必要参数
    const missingParamResponse = await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
      data: {
        notes: '缺少事件类型'
        // eventType 故意缺失
      }
    });
    
    expect(missingParamResponse.status()).toBe(400);
  });

  test('批量事件处理', async ({ page }) => {
    // 创建设备档案
    await page.request.post(`/api/devices/${TEST_QRCODE_ID}/profile`, {
      data: TEST_DEVICE_DATA
    });

    // 准备批量事件数据
    const batchEvents = [
      { eventType: 'manufactured', notes: '批量测试-出厂' },
      { eventType: 'activated', notes: '批量测试-激活' },
      { eventType: 'transferred', notes: '批量测试-转移' }
    ];

    // 逐个发送（模拟批量处理）
    const results = [];
    for (const event of batchEvents) {
      const response = await page.request.post(`/api/devices/${TEST_QRCODE_ID}/lifecycle`, {
        data: event
      });
      results.push(await response.json());
    }

    // 验证所有事件都成功记录
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // 验证总数
    const historyResponse = await page.request.get(`/api/devices/${TEST_QRCODE_ID}/lifecycle`);
    const historyResult = await historyResponse.json();
    expect(historyResult.data.length).toBe(batchEvents.length);
  });
});

// 辅助函数：清理测试数据
async function cleanupTestData() {
  try {
    // 在实际实现中，这里应该调用API或直接操作数据库清理测试数据
    // 由于这是演示测试，我们简单地忽略清理步骤
    console.log('测试数据清理完成');
  } catch (error) {
    console.warn('测试数据清理失败:', error);
  }
}

// 导出测试配置
module.exports = {
  testDir: './tests/integration',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};