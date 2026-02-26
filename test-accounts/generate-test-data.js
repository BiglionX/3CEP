#!/usr/bin/env node

/**
 * 测试数据生成器
 * 为不同角色生成对应的测试数据和验证脚本
 */

const fs = require('fs');
const path = require('path');

// 读取角色账户配置
const roleAccounts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'complete-role-accounts.json'), 'utf8')
);

// 读取权限映射配置
const permissionMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'role-permissions-map.json'), 'utf8')
);

/**
 * 生成角色测试数据
 */
function generateRoleTestData() {
  console.log('🔄 开始生成角色测试数据...\n');
  
  const testData = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    environments: roleAccounts.test_environments,
    roles: {}
  };

  // 为每个角色生成测试数据
  Object.entries(roleAccounts.roles).forEach(([roleKey, roleConfig]) => {
    const roleData = {
      role_info: {
        key: roleKey,
        name: roleConfig.name,
        description: roleConfig.description,
        level: roleConfig.level
      },
      test_accounts: [],
      permissions: permissionMap.role_permission_mapping[roleKey] || {},
      test_cases: []
    };

    // 处理每个测试账户
    roleConfig.accounts.forEach((account, index) => {
      const accountData = {
        id: account.id,
        email: account.email,
        password: account.password,
        name: account.name,
        tenant_id: account.tenant_id,
        login_credentials: {
          email: account.email,
          password: account.password
        },
        expected_permissions: account.permissions,
        login_urls: account.login_urls,
        test_scenarios: account.test_scenarios
      };

      roleData.test_accounts.push(accountData);
      
      // 生成具体的测试用例
      const testCases = generateTestCases(roleKey, account, roleConfig);
      roleData.test_cases.push(...testCases);
    });

    testData.roles[roleKey] = roleData;
  });

  // 保存测试数据
  const outputPath = path.join(__dirname, 'generated-test-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
  
  console.log(`✅ 测试数据已生成: ${outputPath}`);
  return testData;
}

/**
 * 生成具体的测试用例
 */
function generateTestCases(roleKey, account, roleConfig) {
  const testCases = [];
  const baseUrl = roleAccounts.test_environments.development.web_url;
  const apiUrl = roleAccounts.test_environments.development.api_url;

  // 登录测试用例
  testCases.push({
    id: `${roleKey}-login-001`,
    name: `${roleConfig.name}登录测试`,
    type: 'authentication',
    priority: 'P0',
    steps: [
      `访问登录页面: ${account.login_urls.web}`,
      `输入邮箱: ${account.email}`,
      `输入密码: ${account.password}`,
      '点击登录按钮',
      '验证登录成功并跳转到正确页面'
    ],
    expected_results: [
      '成功登录系统',
      `跳转到: ${account.login_urls.web.split('?redirect=')[1] || '/dashboard'}`,
      '显示用户姓名和角色信息',
      '菜单项符合权限范围'
    ],
    api_test: {
      endpoint: `${apiUrl}/auth/login`,
      method: 'POST',
      payload: {
        email: account.email,
        password: account.password
      },
      expected_status: 200,
      expected_response_fields: ['success', 'user', 'token']
    }
  });

  // 权限验证测试用例
  if (account.test_scenarios) {
    account.test_scenarios.forEach((scenario, index) => {
      testCases.push({
        id: `${roleKey}-permission-${String(index + 1).padStart(3, '0')}`,
        name: `${scenario}`,
        type: 'authorization',
        priority: 'P1',
        steps: [
          `以${account.name}身份登录`,
          `尝试访问相关功能页面`,
          `执行相关操作`,
          `验证权限控制`
        ],
        expected_results: [
          '能够正常访问授权功能',
          '界面元素显示正确',
          '操作按钮可用',
          '数据展示符合权限范围'
        ]
      });
    });
  }

  // API权限测试用例
  if (account.permissions) {
    account.permissions.slice(0, 5).forEach((permission, index) => {
      testCases.push({
        id: `${roleKey}-api-${String(index + 1).padStart(3, '0')}`,
        name: `${permission} API权限测试`,
        type: 'api_authorization',
        priority: 'P1',
        api_test: {
          endpoint: getApiEndpointFromPermission(permission, roleKey),
          method: getHttpMethodFromPermission(permission),
          headers: {
            'Authorization': 'Bearer {{token}}',
            'Content-Type': 'application/json'
          },
          expected_status: [200, 201],
          expected_error_status: 403
        }
      });
    });
  }

  return testCases;
}

/**
 * 根据权限名称推断API端点
 */
function getApiEndpointFromPermission(permission, roleKey) {
  const resource = permission.split('_')[0];
  const baseUrl = roleAccounts.test_environments.development.api_url;
  
  const endpointMap = {
    'dashboard': `${baseUrl}/dashboard`,
    'users': `${baseUrl}/users`,
    'content': `${baseUrl}/content`,
    'shops': `${baseUrl}/shops`,
    'payments': `${baseUrl}/payments`,
    'reports': `${baseUrl}/reports`,
    'settings': `${baseUrl}/settings`,
    'procurement': `${baseUrl}/procurement`,
    'inventory': `${baseUrl}/inventory`,
    'agents': `${baseUrl}/agents`,
    'enterprise': roleKey.includes('enterprise') ? 
      `${roleAccounts.test_environments.development.enterprise_api_url}/enterprise` : 
      `${baseUrl}/enterprise`
  };

  return endpointMap[resource] || `${baseUrl}/${resource}`;
}

/**
 * 根据权限动作推断HTTP方法
 */
function getHttpMethodFromPermission(permission) {
  const action = permission.split('_')[1] || 'read';
  
  const methodMap = {
    'read': 'GET',
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'approve': 'PATCH',
    'refund': 'POST',
    'export': 'GET',
    'manage': 'POST',
    'execute': 'POST',
    'monitor': 'GET',
    'invoke': 'POST',
    'debug': 'POST'
  };

  return methodMap[action] || 'GET';
}

/**
 * 生成Playwright测试脚本
 */
function generatePlaywrightTests(testData) {
  console.log('\n🔄 生成Playwright测试脚本...');
  
  const testDir = path.join(__dirname, '..', 'tests', 'e2e', 'roles');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // 为每个角色生成测试文件
  Object.entries(testData.roles).forEach(([roleKey, roleData]) => {
    const testContent = generateRoleTestFile(roleKey, roleData);
    const fileName = `role-${roleKey}-e2e.spec.ts`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, testContent);
    console.log(`   📝 ${fileName}`);
  });

  console.log('✅ Playwright测试脚本生成完成');
}

/**
 * 生成单个角色的测试文件内容
 */
function generateRoleTestFile(roleKey, roleData) {
  const account = roleData.test_accounts[0]; // 使用第一个账户
  
  return `import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../../../e2e-config';

test.describe('${roleData.role_info.name}权限测试 (${roleKey.toUpperCase()})', () => {
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * ${roleData.test_cases[0]?.name || '基础登录测试'}
   */
  test('${roleData.test_cases[0]?.id || 'basic-login'}: ${roleData.test_cases[0]?.name || '基础登录功能'}', async () => {
    // 访问登录页面
    await page.goto('${account.login_urls.web}');
    
    // 输入登录凭据
    await page.fill('[data-testid="email-input"]', '${account.email}');
    await page.fill('[data-testid="password-input"]', '${account.password}');
    
    // 提交登录
    await page.click('[data-testid="login-button"]');
    
    // 验证登录成功
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
    
    // 验证用户信息显示
    const userName = await page.textContent('[data-testid="user-name"]');
    expect(userName).toContain('${account.name.split('')[0]}');
    
    // 验证角色信息
    const roleDisplay = await page.textContent('[data-testid="user-role"]');
    expect(roleDisplay.toLowerCase()).toContain('${roleKey}');
  });

  ${
    roleData.test_cases.slice(1, 4).map(testCase => `
  /**
   * ${testCase.name}
   */
  test('${testCase.id}: ${testCase.name}', async () => {
    // 先登录
    await page.goto('${account.login_urls.web}');
    await page.fill('[data-testid="email-input"]', '${account.email}');
    await page.fill('[data-testid="password-input"]', '${account.password}');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
    
    // TODO: 实现具体的测试逻辑
    // 根据权限范围验证可访问的功能
    console.log('执行${testCase.name}测试');
  });`).join('')
  }
});

export const ROLE_${roleKey.toUpperCase()}_TEST_DATA = {
  role: '${roleKey}',
  roleName: '${roleData.role_info.name}',
  account: {
    email: '${account.email}',
    password: '${account.password}',
    name: '${account.name}'
  },
  permissions: ${JSON.stringify(account.expected_permissions, null, 2)},
  expectedMenuItems: ${JSON.stringify(roleData.permissions.menu_items || [], null, 2)}
};`;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 FixCycle 角色测试数据生成器');
  console.log('=====================================\n');
  
  try {
    // 生成测试数据
    const testData = generateRoleTestData();
    
    // 生成测试脚本
    generatePlaywrightTests(testData);
    
    // 生成使用文档
    generateDocumentation(testData);
    
    console.log('\n🎉 所有测试数据和脚本生成完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 运行 npm run test:e2e:roles 测试所有角色权限');
    console.log('2. 检查生成的测试文件是否符合预期');
    console.log('3. 根据需要调整测试用例细节');
    console.log('4. 执行测试验证权限配置正确性');
    
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error.message);
    process.exit(1);
  }
}

/**
 * 生成使用文档
 */
function generateDocumentation(testData) {
  console.log('\n🔄 生成使用文档...');
  
  const docContent = `# 角色测试账户使用指南

## 概述
本文档描述了FixCycle项目中不同角色测试账户的使用方法和测试验证流程。

## 测试账户列表

${Object.entries(testData.roles).map(([roleKey, roleData]) => `
### ${roleData.role_info.name} (${roleKey})
- **描述**: ${roleData.role_info.description}
- **权限等级**: ${roleData.role_info.level}
- **测试账户**:
${roleData.test_accounts.map(acc => `  - ${acc.name}: ${acc.email} (${acc.password})`).join('\n')}

**预期权限**:
${(roleData.permissions.can_access || []).map(item => `  - ${item}`).join('\n')}

**限制访问**:
${(roleData.permissions.restricted_from || []).map(item => `  - ${item}`).join('\n')}
`).join('\n')}

## 测试环境配置

### 开发环境
- Web地址: ${testData.environments.development.web_url}
- API地址: ${testData.environments.development.api_url}
- 企业版地址: ${testData.environments.development.enterprise_url}

### 测试环境
- Web地址: ${testData.environments.staging.web_url}
- API地址: ${testData.environments.staging.api_url}
- 企业版地址: ${testData.environments.staging.enterprise_url}

## 运行测试

### 运行所有角色测试
\`\`\`bash
npm run test:e2e:roles
\`\`\`

### 运行特定角色测试
\`\`\`bash
npx playwright test tests/e2e/roles/role-${Object.keys(testData.roles)[0]}-e2e.spec.ts
\`\`\`

## 验证清单

${Object.entries(testData.roles).map(([roleKey, roleData]) => `
### ${roleData.role_info.name}验证点
${(roleData.test_cases || []).slice(0, 3).map(tc => `- [ ] ${tc.name}`).join('\n')}
`).join('\n')}

## 安全注意事项

1. **仅限测试环境使用** - 这些账户仅供测试使用，严禁在生产环境使用
2. **定期轮换密码** - 建议每月更新一次测试密码
3. **数据清理** - 测试完成后及时清理产生的测试数据
4. **权限最小化** - 每个角色只分配必要的最小权限

## 故障排除

如果遇到权限验证问题，请检查：
1. 用户角色是否正确分配
2. RBAC配置文件是否最新
3. 数据库中的权限记录是否同步
4. 缓存是否需要清除

---
*文档生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

  const docPath = path.join(__dirname, 'ROLE_TESTING_GUIDE.md');
  fs.writeFileSync(docPath, docContent);
  console.log(`   📄 使用文档: ${docPath}`);
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generateRoleTestData,
  generatePlaywrightTests,
  generateDocumentation
};