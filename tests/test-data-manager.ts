import fs from 'fs';
import path from 'path';
import { TEST_DATA_PATHS } from './test-config';

/**
 * 测试数据管理器
 */
export class TestDataManager {
  private testData: any;

  constructor() {
    this.loadTestData();
  }

  /**
   * 加载测试数据
   */
  private loadTestData() {
    try {
      const dataPath = path.resolve(TEST_DATA_PATHS.users);
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.testData = JSON.parse(rawData);
    } catch (error) {
      console.error('Failed to load test data:', error);
      this.testData = { users: [], devices: [], parts: [], shops: [] };
    }
  }

  /**
   * 获取测试用户
   */
  getUserByRole(role: string) {
    return this.testData.users.find((user: any) => user.role === role);
  }

  /**
   * 获取所有测试用户
   */
  getAllUsers() {
    return this.testData.users;
  }

  /**
   * 获取测试设备
   */
  getDeviceById(id: string) {
    return this.testData.devices.find((device: any) => device.id === id);
  }

  /**
   * 获取测试配件
   */
  getPartBySKU(sku: string) {
    return this.testData.parts.find((part: any) => part.sku === sku);
  }

  /**
   * 获取测试店铺
   */
  getShopById(id: string) {
    return this.testData.shops.find((shop: any) => shop.id === id);
  }

  /**
   * 生成唯一的测试ID
   */
  generateTestId(prefix: string = 'TEST'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * 创建测试订单数据
   */
  createTestOrder(options: {
    deviceId: string;
    faultType: string;
    shopId: string;
    customerId: string;
  }) {
    return {
      id: this.generateTestId('ORDER'),
      deviceId: options.deviceId,
      faultType: options.faultType,
      shopId: options.shopId,
      customerId: options.customerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * 创建测试维修工单
   */
  createTestWorkOrder(options: {
    orderId: string;
    technicianId: string;
    parts: Array<{ sku: string; quantity: number }>;
  }) {
    return {
      id: this.generateTestId('WO'),
      orderId: options.orderId,
      technicianId: options.technicianId,
      parts: options.parts,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      estimatedHours: 2
    };
  }
}

/**
 * 测试环境准备器
 */
export class TestEnvironmentSetup {
  private dataManager: TestDataManager;

  constructor() {
    this.dataManager = new TestDataManager();
  }

  /**
   * 准备测试用户会话
   */
  async prepareUserSessions() {
    console.log('Preparing user sessions...');
    
    // 这里应该实际创建用户的浏览器存储状态
    // 由于这是演示，我们创建空的存储文件
    
    const storageDir = path.resolve(TEST_DATA_PATHS.storage);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // 为每个角色创建空的存储状态文件
    const roles = ['admin', 'consumer', 'engineer', 'shopowner'];
    roles.forEach(role => {
      const storagePath = path.join(storageDir, `${role}-storage.json`);
      if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, JSON.stringify({
          cookies: [],
          origins: []
        }));
      }
    });

    console.log('User sessions prepared successfully');
  }

  /**
   * 准备测试数据
   */
  async prepareTestData() {
    console.log('Preparing test data...');
    
    // 确保必要的目录存在
    const dirs = [
      'test-results/screenshots',
      'test-results/videos', 
      'test-results/traces'
    ];

    dirs.forEach(dir => {
      const fullPath = path.resolve(dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    console.log('Test data directories created');
  }

  /**
   * 完整的测试环境初始化
   */
  async initializeEnvironment() {
    console.log('Initializing test environment...');
    
    try {
      await this.prepareTestData();
      await this.prepareUserSessions();
      
      console.log('✅ Test environment initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize test environment:', error);
      return false;
    }
  }

  /**
   * 清理测试环境
   */
  async cleanupEnvironment() {
    console.log('Cleaning up test environment...');
    
    try {
      // 清理临时文件
      const tempDirs = ['test-results/temp', 'test-data/temp'];
      tempDirs.forEach(dir => {
        const fullPath = path.resolve(dir);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      });

      console.log('✅ Test environment cleaned up successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clean up test environment:', error);
      return false;
    }
  }
}

// 导出单例实例
export const testDataManager = new TestDataManager();
export const testEnvironment = new TestEnvironmentSetup();

// 如果直接运行此文件，则执行环境初始化
if (require.main === module) {
  testEnvironment.initializeEnvironment().then(success => {
    process.exit(success ? 0 : 1);
  });
}