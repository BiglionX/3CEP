/**
 * 企业用户端测试数据管理工具
 * 负责测试数据的创建、清理和管理
 */

import { APIRequestContext } from '@playwright/test';
import {
  TEST_DATA,
  ENTERPRISE_ROUTES,
  TEST_ENTERPRISE_USERS,
} from '../enterprise.config';

export interface TestEnterprise {
  id: string;
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  phone: string;
  email: string;
  userId?: string;
}

export interface TestAgent {
  id: string;
  name: string;
  description: string;
  modelConfig: any;
  status: string;
  enterpriseId: string;
}

export interface TestProcurementOrder {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  itemsCount: number;
  enterpriseId: string;
}

export class TestDataManager {
  private apiContext: APIRequestContext;
  private cleanupQueue: Array<() => Promise<void>> = [];

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  /**
   * 创建测试企业用户
   */
  async createTestEnterprise(
    data: Partial<TestEnterprise> = {}
  ): Promise<TestEnterprise> {
    const enterpriseData = {
      ...TEST_DATA.enterpriseInfo,
      ...data,
      email: data.email || `test_${Date.now()}@enterprise.com`,
    };

    const response = await this.apiContext.post(
      ENTERPRISE_ROUTES.api.register,
      {
        data: {
          companyName: enterpriseData.companyName,
          businessLicense: enterpriseData.businessLicense,
          contactPerson: enterpriseData.contactPerson,
          phone: enterpriseData.phone,
          email: enterpriseData.email,
          password: 'Test123456',
        },
      }
    );

    const result = await response.json();

    const testEnterprise: TestEnterprise = {
      id: result.data?.id || result.id,
      companyName: enterpriseData.companyName,
      businessLicense: enterpriseData.businessLicense,
      contactPerson: enterpriseData.contactPerson,
      phone: enterpriseData.phone,
      email: enterpriseData.email,
      userId: result.data?.userId || result.userId,
    };

    // 添加到清理队列
    this.cleanupQueue.push(() => this.deleteTestEnterprise(testEnterprise.id));

    return testEnterprise;
  }

  /**
   * 删除测试企业用户
   */
  async deleteTestEnterprise(enterpriseId: string): Promise<void> {
    try {
      await this.apiContext.delete(
        `${ENTERPRISE_ROUTES.api.users}/${enterpriseId}`
      );
    } catch (error) {
      console.warn(`Failed to delete test enterprise ${enterpriseId}:`, error);
    }
  }

  /**
   * 创建测试智能体
   */
  async createTestAgent(
    enterpriseId: string,
    data: Partial<TestAgent> = {}
  ): Promise<TestAgent> {
    const agentData = {
      ...TEST_DATA.agentData,
      ...data,
    };

    const response = await this.apiContext.post(ENTERPRISE_ROUTES.api.agents, {
      data: {
        enterpriseId,
        name: agentData.name,
        description: agentData.description,
        modelConfig: {
          model: agentData.modelConfig?.model || 'gpt-4',
          temperature: agentData.modelConfig?.temperature || 0.7,
        },
        status: agentData.status || 'active',
      },
    });

    const result = await response.json();

    const testAgent: TestAgent = {
      id: result.data?.id || result.id,
      name: agentData.name,
      description: agentData.description,
      modelConfig: agentData.modelConfig,
      status: agentData.status || 'active',
      enterpriseId,
    };

    // 添加到清理队列
    this.cleanupQueue.push(() => this.deleteTestAgent(testAgent.id));

    return testAgent;
  }

  /**
   * 删除测试智能体
   */
  async deleteTestAgent(agentId: string): Promise<void> {
    try {
      await this.apiContext.delete(
        `${ENTERPRISE_ROUTES.api.agents}/${agentId}`
      );
    } catch (error) {
      console.warn(`Failed to delete test agent ${agentId}:`, error);
    }
  }

  /**
   * 创建测试采购订单
   */
  async createTestProcurementOrder(
    enterpriseId: string,
    data: Partial<TestProcurementOrder> = {}
  ): Promise<TestProcurementOrder> {
    const orderData = {
      ...TEST_DATA.procurementOrder,
      ...data,
    };

    const response = await this.apiContext.post(
      ENTERPRISE_ROUTES.api.procurement,
      {
        data: {
          enterpriseId,
          title: orderData.title,
          description: orderData.description,
          status: orderData.status || 'pending',
          priority: orderData.priority || 'medium',
          items: orderData.items || [],
        },
      }
    );

    const result = await response.json();

    const testOrder: TestProcurementOrder = {
      id: result.data?.id || result.id,
      title: orderData.title,
      description: orderData.description,
      status: orderData.status || 'pending',
      priority: orderData.priority || 'medium',
      itemsCount: orderData.items?.length || 0,
      enterpriseId,
    };

    // 添加到清理队列
    this.cleanupQueue.push(() => this.deleteTestProcurementOrder(testOrder.id));

    return testOrder;
  }

  /**
   * 删除测试采购订单
   */
  async deleteTestProcurementOrder(orderId: string): Promise<void> {
    try {
      await this.apiContext.delete(
        `${ENTERPRISE_ROUTES.api.procurement}/${orderId}`
      );
    } catch (error) {
      console.warn(
        `Failed to delete test procurement order ${orderId}:`,
        error
      );
    }
  }

  /**
   * 创建完整的测试数据集
   */
  async createFullTestDataset(): Promise<{
    enterprise: TestEnterprise;
    agent: TestAgent;
    order: TestProcurementOrder;
  }> {
    // 创建企业
    const enterprise = await this.createTestEnterprise();

    // 创建智能体
    const agent = await this.createTestAgent(enterprise.id);

    // 创建采购订单
    const order = await this.createTestProcurementOrder(enterprise.id);

    return { enterprise, agent, order };
  }

  /**
   * 清理所有测试数据
   */
  async cleanupAllTestData(): Promise<void> {
    console.log(`Cleaning up ${this.cleanupQueue.length} test data items...`);

    // 执行清理操作
    for (const cleanupFn of this.cleanupQueue) {
      try {
        await cleanupFn();
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    }

    // 清空队列
    this.cleanupQueue = [];
    console.log('Test data cleanup completed');
  }

  /**
   * 获取测试用户认证Token
   */
  async getTestUserToken(email: string, password: string): Promise<string> {
    const response = await this.apiContext.post(ENTERPRISE_ROUTES.api.login, {
      data: { email, password },
    });

    const result = await response.json();
    return result.token || result.data?.token || '';
  }

  /**
   * 创建多个测试用户（不同角色）
   */
  async createMultipleTestUsers(): Promise<Record<string, TestEnterprise>> {
    const testUsers: Record<string, TestEnterprise> = {};

    for (const [role, userData] of Object.entries(TEST_ENTERPRISE_USERS)) {
      const enterprise = await this.createTestEnterprise({
        companyName: userData.companyName,
        email: userData.email,
        contactPerson: `联系人_${role}`,
      });

      testUsers[role] = enterprise;
    }

    return testUsers;
  }

  /**
   * 重置测试环境
   */
  async resetTestEnvironment(): Promise<void> {
    // 清理现有测试数据
    await this.cleanupAllTestData();

    // 可以添加其他重置逻辑
    console.log('Test environment reset completed');
  }
}

// 导出工厂函数
export function createTestDataManager(
  apiContext: APIRequestContext
): TestDataManager {
  return new TestDataManager(apiContext);
}

export default TestDataManager;
