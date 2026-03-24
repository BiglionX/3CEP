#!/usr/bin/env node

/**
 * OPT-008 库存管理功能测试脚本
 *
 * 用于验证 /api/agents/[id]/inventory 端点的功能
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 模拟登录并获取认证 token
 */
async function login(): Promise<{ cookie: string; userId: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123',
      }),
    });

    if (!response.ok) {
      console.error('登录失败:', await response.text());
      return null;
    }

    const data = await response.json();
    const cookie = response.headers.get('set-cookie') || '';

    return {
      cookie,
      userId: data.user?.id,
    };
  } catch (error) {
    console.error('登录异常:', error);
    return null;
  }
}

/**
 * 测试用例 1: 获取库存信息成功
 */
async function testGetInventory(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/inventory`,
      {
        headers: {
          Cookie: auth.cookie,
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        name: '获取库存信息成功',
        success: true,
        message: `库存状态：${data.data.status}, 可用：${data.data.availableStock || '无限'}`,
      };
    } else {
      return {
        name: '获取库存信息成功',
        success: false,
        error: data.error?.details || data.error?.message || '未知错误',
      };
    }
  } catch (error) {
    return {
      name: '获取库存信息成功',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 2: 扣减库存成功（下单）
 */
async function testDecreaseInventory(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/inventory`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          quantity: 1,
          orderId: `test_order_${Date.now()}`,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        name: '扣减库存成功（下单）',
        success: true,
        message: `扣减成功，已用：${data.data.currentUsed}, 可用：${data.data.availableStock || '无限'}`,
      };
    } else {
      return {
        name: '扣减库存成功（下单）',
        success: false,
        error: data.error?.details || data.error?.message || '未知错误',
      };
    }
  } catch (error) {
    return {
      name: '扣减库存成功（下单）',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 3: 恢复库存成功（取消订单）
 */
async function testIncreaseInventory(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/inventory`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          quantity: 1,
          orderId: `test_order_${Date.now()}`,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        name: '恢复库存成功（取消订单）',
        success: true,
        message: `恢复成功，已用：${data.data.currentUsed}, 可用：${data.data.availableStock || '无限'}`,
      };
    } else {
      return {
        name: '恢复库存成功（取消订单）',
        success: false,
        error: data.error?.details || data.error?.message || '未知错误',
      };
    }
  } catch (error) {
    return {
      name: '恢复库存成功（取消订单）',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 4: 库存不足时扣减失败
 */
async function testInsufficientStock(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/inventory`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          quantity: 999999, // 超大数量
        }),
      }
    );

    const data = await response.json();

    // 应该返回 400 错误
    if (response.status === 400 && data.error) {
      return {
        name: '库存不足时扣减失败',
        success: true,
        message: '库存检查通过，拒绝超额扣减',
      };
    } else {
      return {
        name: '库存不足时扣减失败',
        success: false,
        error: `期望 400 错误，实际状态：${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: '库存不足时扣减失败',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 5: 未授权用户访问失败
 */
async function testUnauthorizedAccess(agentId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}/inventory`);

    // 应该返回 401 未授权
    if (response.status === 401) {
      return {
        name: '未授权用户访问失败',
        success: true,
        message: '权限验证通过，拒绝未授权访问',
      };
    } else {
      return {
        name: '未授权用户访问失败',
        success: false,
        error: `期望 401 错误，实际状态：${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: '未授权用户访问失败',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 6: 智能体不存在
 */
async function testAgentNotFound(auth: {
  cookie: string;
  userId: string;
}): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/00000000-0000-0000-0000-000000000000/inventory`
    );

    const data = await response.json();

    // 应该返回 404 未找到
    if (response.status === 404 && data.error) {
      return {
        name: '智能体不存在',
        success: true,
        message: '智能体存在性检查通过',
      };
    } else {
      return {
        name: '智能体不存在',
        success: false,
        error: `期望 404 错误，实际状态：${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: '智能体不存在',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 OPT-008 库存管理功能测试');
  console.log('========================================\n');

  const results: TestResult[] = [];

  // 登录获取管理员权限
  console.log('📝 正在登录管理员账户...');
  const adminAuth = await login();

  if (!adminAuth) {
    console.error('❌ 管理员登录失败，请确保存在管理员账户 admin@example.com');
    return;
  }

  console.log('✅ 管理员登录成功\n');

  // 获取一个测试智能体 ID
  console.log('📋 正在获取测试智能体...');
  const agentsResponse = await fetch(`${BASE_URL}/api/agents?limit=1`, {
    headers: {
      Cookie: adminAuth.cookie,
    },
  });

  let testAgentId = '';

  if (agentsResponse.ok) {
    const agentsData = await agentsResponse.json();
    if (agentsData.data && agentsData.data.length > 0) {
      testAgentId = agentsData.data[0].id;
      console.log(`✅ 找到测试智能体：${testAgentId}\n`);
    }
  }

  if (!testAgentId) {
    console.error('❌ 未找到测试智能体，请先创建至少一个智能体');
    return;
  }

  // 执行所有测试用例
  console.log('🚀 开始执行测试用例...\n');

  results.push(await testGetInventory(adminAuth, testAgentId));
  results.push(await testDecreaseInventory(adminAuth, testAgentId));
  results.push(await testIncreaseInventory(adminAuth, testAgentId));
  results.push(await testInsufficientStock(adminAuth, testAgentId));
  results.push(await testUnauthorizedAccess(testAgentId));
  results.push(await testAgentNotFound(adminAuth));

  // 输出测试结果
  console.log('\n========================================');
  console.log('📊 测试结果汇总');
  console.log('========================================\n');

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} 测试 ${index + 1}: ${result.name}`);

    if (result.success) {
      console.log(`   ✓ ${result.message || '测试通过'}`);
    } else {
      console.log(`   ✗ ${result.error || '测试失败'}`);
    }
    console.log('');
  });

  // 统计通过率
  const passedCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log('========================================');
  console.log(`📈 总计：${passedCount}/${totalCount} 通过 (${passRate}%)`);
  console.log('========================================\n');

  if (passRate === '100.0') {
    console.log('🎉 所有测试通过！OPT-008 功能正常！\n');
  } else {
    console.log('⚠️  部分测试失败，请检查实现代码\n');
  }
}

// 运行测试
runTests().catch(console.error);
