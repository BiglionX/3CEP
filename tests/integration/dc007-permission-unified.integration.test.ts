/**
 * DC007 权限统一集成测试
 * 验证统一权限管理系统的完整功能
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

describe('DC007 权限统一集成测试', () => {
  let supabase: ReturnType<typeof createClient>;

  // 测试用户数据
  const testUsers = {
    admin: {
      email: 'admin@test.com',
      password: 'TestPass123!',
      roles: ['admin'],
    },
    dataCenterAdmin: {
      email: 'dc-admin@test.com',
      password: 'TestPass123!',
      roles: ['data_center_admin'],
    },
    dataAnalyst: {
      email: 'analyst@test.com',
      password: 'TestPass123!',
      roles: ['data_analyst'],
    },
    dataViewer: {
      email: 'viewer@test.com',
      password: 'TestPass123!',
      roles: ['data_viewer'],
    },
  };

  // 测试权限列表
  const testDataCenterPermissions = [
    'data_center_read',
    'data_center_query',
    'data_center_analyze',
    'data_center_manage',
    'data_center_export',
  ];

  beforeAll(async () => {
    // 初始化Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少Supabase配置');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  });

  beforeEach(async () => {
    // 每个测试前清理测试数据
    await cleanupTestData();
  });

  afterEach(async () => {
    // 每个测试后清理测试数据
    await cleanupTestData();
  });

  // 清理测试数据
  async function cleanupTestData() {
    const testEmails = Object.values(testUsers).map(user => user.email);

    // 删除测试用户的角色分配
    await supabase.from('user_roles').delete().in('user_id', testEmails);

    // 删除测试用户
    await supabase.from('auth.users').delete().in('email', testEmails);
  }

  // 创建测试用户
  async function createTestUser(userData: typeof testUsers.admin) {
    // 创建认证用户
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authUser.user) throw new Error('用户创建失败');

    // 分配角色
    const roleAssignments = userData.roles.map(roleId => ({
      user_id: authUser.user!.id,
      role_id: roleId,
      assigned_by: 'test-system',
    }));

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert(roleAssignments as any);

    if (roleError) throw roleError;

    return authUser.user;
  }

  test('TC001: 权限服务基础功能测试', async () => {
    // 验证权限服务API端点可用性
    const response = await fetch(
      '/api/data-center/permissions?action=get_stats',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('stats');
    expect(result.stats).toHaveProperty('totalUsers');
    expect(result.stats).toHaveProperty('totalRoles');
    expect(result.stats).toHaveProperty('totalPermissions');
  });

  test('TC002: 超级管理员权限验证', async () => {
    const adminUser = await createTestUser(testUsers.admin);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.admin.email,
      password: testUsers.admin.password,
    });

    // 测试所有数据中心权限
    for (const permission of testDataCenterPermissions) {
      const response = await fetch(
        `/api/data-center/permissions?permission=${permission}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.allowed).toBe(true);
      expect(result.permission).toBe(permission);
    }
  });

  test('TC003: 数据分析师权限验证', async () => {
    const analystUser = await createTestUser(testUsers.dataAnalyst);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataAnalyst.email,
      password: testUsers.dataAnalyst.password,
    });

    // 测试读取权限（应该有）
    const readResponse = await fetch(
      '/api/data-center/permissions?permission=data_center_read',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(readResponse.status).toBe(200);
    const readResult = await readResponse.json();
    expect(readResult.allowed).toBe(true);

    // 测试管理权限（应该没有）
    const manageResponse = await fetch(
      '/api/data-center/permissions?permission=data_center_manage',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(manageResponse.status).toBe(200);
    const manageResult = await manageResponse.json();
    expect(manageResult.allowed).toBe(false);
  });

  test('TC004: 角色继承机制验证', async () => {
    const adminUser = await createTestUser(testUsers.dataCenterAdmin);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataCenterAdmin.email,
      password: testUsers.dataCenterAdmin.password,
    });

    // 数据中心管理员应该继承数据分析师的权限
    const analystPermissionResponse = await fetch(
      '/api/data-center/permissions?permission=data_center_analyze',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(analystPermissionResponse.status).toBe(200);
    const result = await analystPermissionResponse.json();
    expect(result.allowed).toBe(true);
  });

  test('TC005: 数据访问控制测试', async () => {
    const analystUser = await createTestUser(testUsers.dataAnalyst);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataAnalyst.email,
      password: testUsers.dataAnalyst.password,
    });

    // 测试数据访问权限
    const response = await fetch('/api/data-center/permissions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_resources',
        category: 'data_center',
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('resources');
    expect(result).toHaveProperty('permissions');
    expect(Array.isArray(result.resources)).toBe(true);
    expect(Array.isArray(result.permissions)).toBe(true);
  });

  test('TC006: 批量权限检查测试', async () => {
    const viewerUser = await createTestUser(testUsers.dataViewer);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataViewer.email,
      password: testUsers.dataViewer.password,
    });

    // 批量检查权限
    const response = await fetch('/api/data-center/permissions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'batch_check',
        permissions: testDataCenterPermissions,
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('permissions');

    // 验证结果格式
    for (const permission of testDataCenterPermissions) {
      expect(result.permissions).toHaveProperty(permission);
      expect(typeof result.permissions[permission]).toBe('boolean');
    }
  });

  test('TC007: 权限缓存机制测试', async () => {
    const analystUser = await createTestUser(testUsers.dataAnalyst);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataAnalyst.email,
      password: testUsers.dataAnalyst.password,
    });

    // 第一次检查（应该访问数据库）
    const firstResponse = await fetch(
      '/api/data-center/permissions?permission=data_center_read',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(firstResponse.status).toBe(200);
    const firstResult = await firstResponse.json();

    // 第二次检查（应该命中缓存）
    const secondResponse = await fetch(
      '/api/data-center/permissions?permission=data_center_read',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(secondResponse.status).toBe(200);
    const secondResult = await secondResponse.json();

    // 结果应该一致
    expect(firstResult.allowed).toBe(secondResult.allowed);
  });

  test('TC008: 权限审计日志测试', async () => {
    const viewerUser = await createTestUser(testUsers.dataViewer);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataViewer.email,
      password: testUsers.dataViewer.password,
    });

    // 执行权限检查
    await fetch('/api/data-center/permissions?permission=data_center_manage', {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    // 验证审计日志记录
    const { data: auditLogs, error } = (await supabase
      .from('permission_audit_log')
      .select('*')
      .eq('user_id', viewerUser.id)
      .eq('permission_id', 'data_center_manage')
      .order('created_at', { ascending: false })
      .limit(1)) as { data: any[] | null; error: any };

    expect(error).toBeNull();
    expect(auditLogs).toBeDefined();
    expect(auditLogs).toHaveLength(1);
    if (auditLogs && auditLogs[0]) {
      expect(auditLogs[0]).toHaveProperty('result');
      expect(auditLogs[0]).toHaveProperty('ip_address');
      expect(auditLogs[0]).toHaveProperty('user_agent');
    }
  });

  test('TC009: 无权限访问拒绝测试', async () => {
    // 不登录直接访问
    const response = await fetch(
      '/api/data-center/permissions?permission=data_center_read'
    );

    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result.error).toContain('未认证');
  });

  test('TC010: 权限清除缓存测试', async () => {
    const analystUser = await createTestUser(testUsers.dataAnalyst);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataAnalyst.email,
      password: testUsers.dataAnalyst.password,
    });

    // 清除权限缓存
    const response = await fetch('/api/data-center/permissions', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('清除');
  });

  // 性能测试
  test('TC011: 权限检查性能测试', async () => {
    const analystUser = await createTestUser(testUsers.dataAnalyst);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataAnalyst.email,
      password: testUsers.dataAnalyst.password,
    });

    // 执行多次权限检查测量性能
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      const response = await fetch(
        '/api/data-center/permissions?permission=data_center_read',
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);
    }

    const endTime = Date.now();
    const averageTime = (endTime - startTime) / 10;

    // 平均响应时间应该小于100ms
    expect(averageTime).toBeLessThan(100);
  });

  // 安全测试
  test('TC012: 权限越权访问测试', async () => {
    const viewerUser = await createTestUser(testUsers.dataViewer);

    // 登录获取会话
    const {
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: testUsers.dataViewer.email,
      password: testUsers.dataViewer.password,
    });

    // 尝试访问管理权限
    const response = await fetch(
      '/api/data-center/permissions?permission=data_center_manage',
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.allowed).toBe(false);
  });
});

// 测试报告生成
export async function generatePermissionTestReport() {
  const testResults = {
    timestamp: new Date().toISOString(),
    totalTests: 12,
    passedTests: 0,
    failedTests: 0,
    testCases: [] as any[],
    summary: {
      coverage: '数据中心权限管理核心功能',
      environment: process.env.NODE_ENV || 'test',
      databaseVersion: 'PostgreSQL 15+',
    },
  };

  // 这里应该收集实际的测试结果
  // 在实际执行中，这些数据会从测试运行时收集

  return testResults;
}
