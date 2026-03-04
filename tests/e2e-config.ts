// E2E测试环境配置
export const TEST_CONFIG = {
  // 测试环境URL
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3001',
  ADMIN_URL: process.env.TEST_ADMIN_URL || 'http://localhost:3001/admin',

  // 测试用户凭据
  TEST_USERS: {
    engineer: {
      email: 'engineer@test.com',
      password: 'Test123!@#',
      role: 'engineer',
    },
    consumer: {
      email: 'consumer@test.com',
      password: 'Test123!@#',
      role: 'consumer',
    },
    shopOwner: {
      email: 'shopowner@test.com',
      password: 'Test123!@#',
      role: 'shop_owner',
    },
    admin: {
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
    },
  },

  // 测试数据
  TEST_DATA: {
    devices: [
      { name: 'iPhone 12', brand: 'Apple', category: 'smartphone' },
      { name: 'iPhone 13', brand: 'Apple', category: 'smartphone' },
      { name: 'iPhone 14', brand: 'Apple', category: 'smartphone' },
      { name: 'iPhone 15', brand: 'Apple', category: 'smartphone' },
      { name: '华为 P50', brand: 'Huawei', category: 'smartphone' },
      { name: '华为 Mate 40', brand: 'Huawei', category: 'smartphone' },
      { name: '小米 13', brand: 'Xiaomi', category: 'smartphone' },
      { name: '小米 14', brand: 'Xiaomi', category: 'smartphone' },
      { name: '三星 Galaxy S23', brand: 'Samsung', category: 'smartphone' },
      { name: 'OPPO Reno 8', brand: 'OPPO', category: 'smartphone' },
    ],

    faultTypes: [
      {
        name: '屏幕损坏',
        code: 'screen_broken',
        description: '屏幕碎裂或显示异常',
      },
      {
        name: '电池问题',
        code: 'battery_issue',
        description: '电池不耐用或无法充电',
      },
      {
        name: '进水故障',
        code: 'water_damage',
        description: '设备进水导致功能异常',
      },
      {
        name: '无法开机',
        code: 'power_issue',
        description: '设备无法正常启动',
      },
      {
        name: '声音问题',
        code: 'audio_issue',
        description: '听筒、扬声器无声或杂音',
      },
    ],

    sampleHotLinks: [
      {
        url: 'https://example.com/iphone12-screen-repair',
        title: 'iPhone 12 屏幕更换详细教程',
        device_model: 'iPhone 12',
        fault_type: 'screen_broken',
        description: '详细的iPhone 12屏幕更换步骤，包含所需工具和注意事项',
      },
      {
        url: 'https://example.com/battery-fix-guide',
        title: '手机电池续航优化指南',
        device_model: '通用',
        fault_type: 'battery_issue',
        description: '提升手机电池使用寿命的实用技巧和维修方法',
      },
      {
        url: 'https://example.com/water-damage-solution',
        title: '手机进水应急处理方案',
        device_model: '通用',
        fault_type: 'water_damage',
        description: '手机意外进水后的紧急处理步骤和专业维修建议',
      },
    ],

    sampleParts: [
      {
        name: 'iPhone 12 原装屏幕总成',
        device_model: 'iPhone 12',
        part_type: 'screen',
        price: 280,
        supplier: '苹果官方',
        compatibility: '完美适配',
      },
      {
        name: 'iPhone 13 电池',
        device_model: 'iPhone 13',
        part_type: 'battery',
        price: 120,
        supplier: '德赛电池',
        compatibility: '原厂规格',
      },
      {
        name: '华为 P50 充电IC',
        device_model: '华为 P50',
        part_type: 'ic_chip',
        price: 45,
        supplier: '海思芯片',
        compatibility: '官方认证',
      },
    ],
  },

  // 等待时间配置
  timeouts: {
    pageLoad: 10000,
    elementAppear: 5000,
    apiResponse: 8000,
    animationComplete: 1000,
  },

  // 重试配置
  retry: {
    maxAttempts: 3,
    delay: 1000,
  },
};

// 测试工具函数
export class TestHelpers {
  static async waitForElement(page: any, selector: string, timeout?: number) {
    return await page.waitForSelector(selector, {
      timeout: timeout || TEST_CONFIG.timeouts.elementAppear,
    });
  }

  static async clickAndWait(page: any, selector: string, waitTime?: number) {
    await page.click(selector);
    if (waitTime) {
      await page.waitForTimeout(waitTime);
    }
  }

  static async fillForm(page: any, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await page.fill(selector, value);
    }
  }

  static generateRandomString(length: number = 8): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
}
