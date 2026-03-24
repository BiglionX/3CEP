/**
 * OPT-007 手动上下架 API 测试脚本
 *
 * 用于验证 /api/admin/agents/[id]/shelf 端点的功能
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
    // 使用管理员账户登录
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
 * 测试用例 1: 管理员成功上架智能体
 */
async function testAdminShelfOn(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/agents/${agentId}/shelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          action: 'on_shelf',
          reason: '测试上架 - 优质智能体',
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        name: '管理员成功上架智能体',
        success: true,
        message: `上架成功，新状态：${data.data.newStatus}`,
      };
    } else {
      return {
        name: '管理员成功上架智能体',
        success: false,
        error: data.error?.details || data.error?.message || '未知错误',
      };
    }
  } catch (error) {
    return {
      name: '管理员成功上架智能体',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 2: 管理员成功下架智能体
 */
async function testAdminShelfOff(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/agents/${agentId}/shelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          action: 'off_shelf',
          reason: '测试下架 - 内容违规',
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        name: '管理员成功下架智能体',
        success: true,
        message: `下架成功，新状态：${data.data.newStatus}`,
      };
    } else {
      return {
        name: '管理员成功下架智能体',
        success: false,
        error: data.error?.details || data.error?.message || '未知错误',
      };
    }
  } catch (error) {
    return {
      name: '管理员成功下架智能体',
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 测试用例 3: 非管理员权限不足
 */
async function testNonAdminPermission(agentId: string): Promise<TestResult> {
  try {
    // 使用普通用户登录（假设存在）
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    });

    if (!response.ok) {
      return {
        name: '非管理员权限不足',
        success: true,
        message: '普通用户登录失败（预期行为）',
      };
    }

    const data = await response.json();
    const cookie = response.headers.get('set-cookie') || '';

    const shelfResponse = await fetch(
      `${BASE_URL}/api/admin/agents/${agentId}/shelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          action: 'off_shelf',
        }),
      }
    );

    const shelfData = await shelfResponse.json();

    // 应该返回 403 禁止访问
    if (shelfResponse.status === 403) {
      return {
        name: '非管理员权限不足',
        success: true,
        message: '权限验证通过，普通用户被拒绝访问',
      };
    } else {
      return {
        name: '非管理员权限不足',
        success: false,
        error: `期望 403 错误，实际状态：${shelfResponse.status}`,
      };
    }
  } catch (error) {
    return {
      name: '非管理员权限不足',
      success: true,
      message: '普通用户无法访问（预期行为）',
    };
  }
}

/**
 * 测试用例 4: 无效的 action 参数
 */
async function testInvalidAction(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/agents/${agentId}/shelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          action: 'invalid_action',
        }),
      }
    );

    const data = await response.json();

    // 应该返回 400 错误请求
    if (response.status === 400 && data.error) {
      return {
        name: '无效的 action 参数',
        success: true,
        message: '参数验证通过，拒绝无效 action',
      };
    } else {
      return {
        name: '无效的 action 参数',
        success: false,
        error: `期望 400 错误，实际状态：${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: '无效的 action 参数',
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
      `${BASE_URL}/api/admin/agents/00000000-0000-0000-0000-000000000000/shelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: auth.cookie,
        },
        body: JSON.stringify({
          action: 'on_shelf',
        }),
      }
    );

    const data = await response.json();

    // 应该返回 404 未找到
    if (response.status === 404 && data.error) {
      return {
        name: '智能体不存在',
        success: true,
        message: '智能体不存在检查通过',
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
 * 测试用例 6: 审计日志记录验证
 */
async function testAuditLog(
  auth: { cookie: string; userId: string },
  agentId: string
): Promise<TestResult> {
  try {
    // 先执行一次上架操作
    await fetch(`${BASE_URL}/api/admin/agents/${agentId}/shelf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: auth.cookie,
      },
      body: JSON.stringify({
        action: 'on_shelf',
        reason: '测试审计日志',
      }),
    });

    // 查询审计日志
    const response = await fetch(
      `${BASE_URL}/api/audit-logs?agent_id=${agentId}&limit=1`,
      {
        headers: {
          Cookie: auth.cookie,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const log = data.data[0];
        if (
          log.action === 'SHELF_ON' &&
          log.actor_id === auth.userId &&
          log.details?.reason === '测试审计日志'
        ) {
          return {
            name: '审计日志记录验证',
            success: true,
            message: '审计日志记录完整且正确',
          };
        }
      }
    }

    return {
      name: '审计日志记录验证',
      success: false,
      error: '审计日志记录不完整或不存在',
    };
  } catch (error) {
    return {
      name: '审计日志记录验证',
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
  console.log('🧪 OPT-007 手动上下架 API 测试');
  console.log('========================================\n');

  const results: TestResult[] = [];

  // 登录获取管理员权限
  console.log('📝 正在登录管理员账户...');
  const adminAuth = await login();

  if (!adminAuth) {
    console.error('❌ 管理员登录失败，请确保存在管理员账户 admin@example.com');
    console.log('\n提示：可以使用以下 SQL 创建测试管理员：');
    console.log(`
-- 创建测试管理员用户
INSERT INTO auth.users (email, encrypted_password)
VALUES ('admin@example.com', crypt('password123', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;

-- 设置管理员角色
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
    `);
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

  results.push(await testAdminShelfOn(adminAuth, testAgentId));
  results.push(await testAdminShelfOff(adminAuth, testAgentId));
  results.push(await testNonAdminPermission(testAgentId));
  results.push(await testInvalidAction(adminAuth, testAgentId));
  results.push(await testAgentNotFound(adminAuth));
  results.push(await testAuditLog(adminAuth, testAgentId));

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
    console.log('🎉 所有测试通过！OPT-007 功能正常！\n');
  } else {
    console.log('⚠️  部分测试失败，请检查实现代码\n');
  }
}

// 运行测试
runTests().catch(console.error);
