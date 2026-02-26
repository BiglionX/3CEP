/**
 * 企业用户端E2E测试主入口文件
 * 导出所有测试工具和配置，便于统一使用
 */

// 导出配置文件
export { 
  ENTERPRISE_TEST_CONFIG,
  TEST_ENTERPRISE_USERS,
  TEST_DATA,
  ENTERPRISE_ROUTES,
  PERMISSIONS,
  PERFORMANCE_BENCHMARKS,
  SECURITY_TEST_CONFIG,
  REPORT_CONFIG
} from './enterprise.config';

// 导出工具类
export { 
  EnterpriseTestUtils, 
  createEnterpriseTestUtils 
} from './utils/test-utils';

export { 
  TestDataManager, 
  createTestDataManager,
  type TestEnterprise,
  type TestAgent,
  type TestProcurementOrder
} from './data/test-data-manager';

// 导出测试fixture
export {
  enterpriseTest,
  enterpriseAdminTest,
  procurementManagerTest,
  agentOperatorTest,
  regularUserTest,
  permissionTest,
  apiTest,
  expect
} from './fixtures/enterprise-fixture';

// 导出默认测试对象
import enterpriseTest from './fixtures/enterprise-fixture';
export default enterpriseTest;

// 版本信息
export const ENTERPRISE_E2E_VERSION = '1.0.0';

// 测试套件信息
export const TEST_SUITE_INFO = {
  name: 'Enterprise End-to-End Tests',
  version: ENTERPRISE_E2E_VERSION,
  description: '企业用户端完整功能端到端测试套件',
  author: 'AI Assistant',
  created: '2026-02-26'
};