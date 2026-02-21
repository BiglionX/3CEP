// 测试租户API修复 - 重现TypeScript模块导入问题
import type { Database } from './src/lib/database.types';

// 测试数据库类型的使用
interface TenantAPITest {
  id: string;
  name: string;
  tenant_id: string;
  created_at: string;
}

// 模拟API响应类型
type TenantAPIResponse = {
  success: boolean;
  data?: TenantAPITest[];
  error?: string;
};

// 测试函数
async function testTenantAPI(): Promise<TenantAPIResponse> {
  try {
    // 这里应该是实际的API调用
    const mockData: TenantAPITest[] = [
      {
        id: '1',
        name: '测试租户',
        tenant_id: 'test-tenant-123',
        created_at: new Date().toISOString()
      }
    ];

    return {
      success: true,
      data: mockData
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// 导出测试函数
export { testTenantAPI, type TenantAPIResponse, type TenantAPITest };

// 运行测试
if (require.main === module) {
  testTenantAPI().then(result => {
    console.log('API测试结果:', result);
  });
}