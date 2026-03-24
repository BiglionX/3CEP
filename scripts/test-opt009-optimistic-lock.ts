#!/usr/bin/env node

/**
 * OPT-009 乐观锁并发控制测试脚本
 *
 * 用于验证 version 字段和乐观锁机制是否正常工作
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
 * 测试用例 1: 检查智能体是否有 version 字段
 */
async function testVersionFieldExists(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}`);

    const data = await response.json();

    if (data.data && 'version' in data.data) {
      return {
        name: '检查智能体是否有 version 字段',
        success: true,
        message: `version 字段存在，当前版本：${data.data.version}`,
      };
    } else {
      return {
        name: '检查智能体是否有 version 字段',
        success: false,
        error: '智能体数据中未找到 version 字段',
      };
    }
  } catch (error) {
    return {
      name: '检查智能体是否有 version 字段',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 2: 正常更新智能体（无并发冲突）
 */
async function testNormalUpdate(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    // 先获取当前版本
    const getResponse = await fetch(`${BASE_URL}/api/agents/${agentId}`);
    const getData = await getResponse.json();
    const currentVersion = getData.data.version;

    // 执行更新
    const updateResponse = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: auth.cookie,
      },
      body: JSON.stringify({
        name: `测试智能体_${Date.now()}`,
      }),
    });

    const updateData = await updateResponse.json();

    if (updateResponse.ok && updateData.success) {
      const newVersion = updateData.version || updateData.data.version;
      if (newVersion > currentVersion) {
        return {
          name: '正常更新智能体（无并发冲突）',
          success: true,
          message: `更新成功，版本号从 ${currentVersion} 递增到 ${newVersion}`,
        };
      } else {
        return {
          name: '正常更新智能体（无并发冲突）',
          success: false,
          error: `版本号未递增：${currentVersion} -> ${newVersion}`,
        };
      }
    } else {
      return {
        name: '正常更新智能体（无并发冲突）',
        success: false,
        error: updateData.error?.message || '更新失败',
      };
    }
  } catch (error) {
    return {
      name: '正常更新智能体（无并发冲突）',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 3: 模拟并发冲突（使用旧版本号更新）
 */
async function testConcurrentConflict(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    // 获取当前版本
    const getResponse = await fetch(`${BASE_URL}/api/agents/${agentId}`);
    const getData = await getResponse.json();
    const oldVersion = getData.data.version;

    // 第一次更新（使用正确版本号）
    const update1Response = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: auth.cookie,
      },
      body: JSON.stringify({
        name: `并发测试_第一次_${Date.now()}`,
      }),
    });

    const update1Data = await update1Response.json();

    if (!update1Response.ok || !update1Data.success) {
      return {
        name: '模拟并发冲突（使用旧版本号更新）',
        success: false,
        error: '第一次更新失败，无法继续测试',
      };
    }

    // 第二次更新（使用旧的版本号，应该失败）
    const update2Response = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: auth.cookie,
      },
      body: JSON.stringify({
        name: `并发测试_第二次_${Date.now()}`,
        version: oldVersion, // 使用旧版本号
      }),
    });

    const update2Data = await update2Response.json();

    // 应该返回 409 Conflict
    if (update2Response.status === 409 && update2Data.error) {
      if (update2Data.error.code === 'OPTIMISTIC_LOCK_CONFLICT') {
        return {
          name: '模拟并发冲突（使用旧版本号更新）',
          success: true,
          message: '并发冲突检测成功，返回了正确的错误码和提示',
        };
      } else {
        return {
          name: '模拟并发冲突（使用旧版本号更新）',
          success: false,
          error: `错误码不正确：期望 OPTIMISTIC_LOCK_CONFLICT，实际：${update2Data.error.code}`,
        };
      }
    } else {
      return {
        name: '模拟并发冲突（使用旧版本号更新）',
        success: false,
        error: `期望 409 Conflict，实际状态：${update2Response.status}`,
      };
    }
  } catch (error) {
    return {
      name: '模拟并发冲突（使用旧版本号更新）',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 4: 未授权用户访问失败
 */
async function testUnauthorizedAccess(agentId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '非法更新',
      }),
    });

    // 应该返回 401 Unauthorized
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
 * 测试用例 5: 智能体不存在
 */
async function testAgentNotFound(auth: {
  cookie: string;
  userId: string;
}): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/00000000-0000-0000-0000-000000000000`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          name: '不存在的智能体',
        }),
      }
    );

    // 应该返回 404 Not Found
    if (response.status === 404) {
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
  console.log('🧪 OPT-009 乐观锁并发控制测试');
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
  const agentsResponse = await fetch(`${BASE_URL}/api/agents?limit=1`);

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

  results.push(await testVersionFieldExists(adminAuth, testAgentId));
  results.push(await testNormalUpdate(adminAuth, testAgentId));
  results.push(await testConcurrentConflict(adminAuth, testAgentId));
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
    console.log('🎉 所有测试通过！OPT-009 功能正常！\n');
  } else {
    console.log('⚠️  部分测试失败，请检查实现代码\n');
  }
}

// 运行测试
runTests().catch(console.error);
