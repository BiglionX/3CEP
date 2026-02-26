/**
 * n8n 工作流权限控制 API
 * 提供工作流访问和执行权限管理接口
 */

import { sanitizeWorkflowExecution } from '@/lib/sanitize';
import { filterReplayParameters } from '@/middleware/workflow-replay-filter';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// n8n 配置
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  apiToken: process.env.N8N_API_TOKEN,
  webhookSecret: process.env.N8N_WEBHOOK_SECRET,
};

export async function GET(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const action = searchParams.get('action') || 'read';

    // 如果指定了工作流ID，检查具体权限
    if (workflowId) {
      const hasAccess = await checkWorkflowPermission(
        user.id,
        workflowId,
        action,
        supabase
      );

      if (!hasAccess) {
        return NextResponse.json(
          {
            error: '无权访问此工作流',
            code: 'WORKFLOW_ACCESS_DENIED',
          },
          { status: 403 }
        );
      }

      // 获取工作流详细信息
      const workflowDetails = await getWorkflowDetails(workflowId);

      // 根据用户角色脱敏数据
      const userProfile = await getUserProfile(user.id, supabase);
      const sanitizedDetails = sanitizeWorkflowExecution(
        workflowDetails,
        userProfile.role,
        userProfile.tenant_id
      );

      return NextResponse.json({
        success: true,
        data: {
          workflow: sanitizedDetails,
          permissions: {
            canRead: await checkWorkflowPermission(
              user.id,
              workflowId,
              'read',
              supabase
            ),
            canExecute: await checkWorkflowPermission(
              user.id,
              workflowId,
              'execute',
              supabase
            ),
            canManage: await checkWorkflowPermission(
              user.id,
              workflowId,
              'manage',
              supabase
            ),
          },
        },
      });
    }

    // 获取用户可访问的工作流列表
    const accessibleWorkflows = await getUserAccessibleWorkflows(
      user.id,
      supabase
    );

    // 根据用户角色脱敏列表数据
    const userProfile = await getUserProfile(user.id, supabase);
    const sanitizedWorkflows = accessibleWorkflows.map((workflow: any) =>
      sanitizeWorkflowExecution(
        workflow,
        userProfile.role,
        userProfile.tenant_id
      )
    );

    return NextResponse.json({
      success: true,
      data: sanitizedWorkflows,
      count: sanitizedWorkflows.length,
    });
  } catch (error) {
    console.error('工作流权限检查错误:', error);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { workflowId, action = 'execute', inputData } = body;

    // 对于回放和回滚操作，应用参数过滤
    let filteredInputData = inputData;
    if (action === 'replay' || action === 'rollback') {
      const userProfile = await getUserProfile(user.id, supabase);
      const filterResult = filterReplayParameters(
        inputData,
        userProfile.role,
        workflowId
      );
      filteredInputData = filterResult.filtered;

      // 记录参数过滤审计
      await logAuditEvent(
        'workflow_parameter_filter',
        user.id,
        'n8n_workflows',
        {
          workflow_id: workflowId,
          action: action,
          original_params: Object.keys(inputData).length,
          filtered_params: Object.keys(filteredInputData).length,
          removed_params: filterResult.removed.length,
        },
        supabase
      );
    }

    // 验证必需参数
    if (!workflowId) {
      return NextResponse.json({ error: '工作流ID为必填项' }, { status: 400 });
    }

    // 检查执行权限
    const canExecute = await checkWorkflowPermission(
      user.id,
      workflowId,
      'execute',
      supabase
    );

    if (!canExecute) {
      return NextResponse.json(
        {
          error: '无权执行此工作流',
          code: 'WORKFLOW_EXECUTE_DENIED',
        },
        { status: 403 }
      );
    }

    // 执行工作流
    const executionResult = await executeN8nWorkflow(
      workflowId,
      inputData,
      user.id
    );

    // 记录审计日志
    await logAuditEvent(
      'workflow_execute',
      user.id,
      'n8n_workflows',
      {
        workflow_id: workflowId,
        action: action,
        input_data: inputData,
        execution_id: executionResult.executionId,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '工作流执行成功',
      data: executionResult,
    });
  } catch (error) {
    console.error('工作流执行错误:', error);
    return NextResponse.json(
      {
        error: '工作流执行失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { workflowId, permissions } = body;

    // 验证必需参数
    if (!workflowId || !permissions) {
      return NextResponse.json(
        { error: '工作流ID和权限配置为必填项' },
        { status: 400 }
      );
    }

    // 检查管理权限
    const canManage = await checkWorkflowPermission(
      user.id,
      workflowId,
      'manage',
      supabase
    );

    if (!canManage) {
      return NextResponse.json(
        {
          error: '无权管理此工作流权限',
          code: 'WORKFLOW_MANAGE_DENIED',
        },
        { status: 403 }
      );
    }

    // 更新工作流权限
    const updateResult = await updateWorkflowPermissions(
      workflowId,
      permissions
    );

    // 记录审计日志
    await logAuditEvent(
      'workflow_permissions_update',
      user.id,
      'n8n_workflows',
      {
        workflow_id: workflowId,
        permissions: permissions,
        changes: updateResult.changes,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '工作流权限更新成功',
      data: updateResult,
    });
  } catch (error) {
    console.error('工作流权限更新错误:', error);
    return NextResponse.json(
      {
        error: '权限更新失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/n8n/workflows/[id] - 删除工作流权限配置
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');
  const workflowId = params.id;

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查管理权限
    const canManage = await checkWorkflowPermission(
      user.id,
      workflowId,
      'manage',
      supabase
    );

    if (!canManage) {
      return NextResponse.json(
        {
          error: '无权删除此工作流权限配置',
          code: 'WORKFLOW_MANAGE_DENIED',
        },
        { status: 403 }
      );
    }

    // 删除权限配置
    const deleteResult = await deleteWorkflowPermissions(workflowId);

    // 记录审计日志
    await logAuditEvent(
      'workflow_permissions_delete',
      user.id,
      'n8n_workflows',
      { workflow_id: workflowId },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '工作流权限配置删除成功',
      data: deleteResult,
    });
  } catch (error) {
    console.error('工作流权限删除错误:', error);
    return NextResponse.json(
      {
        error: '权限配置删除失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 辅助函数

/**
 * 检查工作流权限
 */
async function checkWorkflowPermission(
  userId: string,
  workflowId: string,
  action: string,
  supabase: any
) {
  try {
    // 获取用户角色
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return false;
    }

    const userRole = userProfile.role;

    // 超级管理员拥有所有权限
    if (userRole === 'admin') {
      return true;
    }

    // 获取工作流权限配置
    const workflowPermissions = await getWorkflowPermissionConfig(workflowId);

    if (!workflowPermissions) {
      // 默认权限：只有管理员可以管理，认证用户可以读取
      switch (action) {
        case 'manage':
          return userRole === 'admin';
        case 'execute':
          return ['admin', 'manager', 'agent_operator'].includes(userRole);
        case 'read':
          return true; // 所有认证用户都可以读取
        default:
          return false;
      }
    }

    // 根据配置检查权限
    const allowedRoles = workflowPermissions[`${action}Roles`] || [];
    return allowedRoles.includes(userRole);
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 获取用户可访问的工作流列表
 */
async function getUserAccessibleWorkflows(userId: string, supabase: any) {
  try {
    // 获取用户角色
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const userRole = userProfile?.role || 'viewer';

    // 从 n8n 获取工作流列表
    const n8nWorkflows = await getAllN8nWorkflows();

    // 过滤用户可访问的工作流
    const accessibleWorkflows = n8nWorkflows.filter((workflow: any) => {
      const permissions = workflow.meta?.permissions || {};
      const readRoles = permissions.readRoles || ['admin'];

      // 超级管理员可以看到所有工作流
      if (userRole === 'admin') {
        return true;
      }

      return readRoles.includes(userRole);
    });

    // 添加权限信息
    return accessibleWorkflows.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      permissions: {
        canRead: true,
        canExecute: checkActionPermission(userRole, workflow, 'execute'),
        canManage: checkActionPermission(userRole, workflow, 'manage'),
      },
    }));
  } catch (error) {
    console.error('获取可访问工作流列表失败:', error);
    return [];
  }
}

/**
 * 检查特定操作权限
 */
function checkActionPermission(
  userRole: string,
  workflow: any,
  action: string
) {
  const permissions = workflow.meta?.permissions || {};
  const allowedRoles = permissions[`${action}Roles`] || [];

  if (userRole === 'admin') {
    return true;
  }

  return allowedRoles.includes(userRole);
}

/**
 * 执行 n8n 工作流
 */
async function executeN8nWorkflow(
  workflowId: string,
  inputData: any,
  userId: string
) {
  try {
    const response = await axios.post(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}/run`,
      {
        inputs: inputData || {},
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      executionId: response.data.executionId,
      status: response.data.status,
      data: response.data.data,
    };
  } catch (error) {
    console.error('执行 n8n 工作流失败:', error);
    throw new Error(
      `工作流执行失败: ${
        (error as any).response?.data?.message || (error as Error).message
      }`
    );
  }
}

/**
 * 更新工作流权限
 */
async function updateWorkflowPermissions(workflowId: string, permissions: any) {
  try {
    const response = await axios.patch(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        meta: {
          permissions: permissions,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      workflowId: workflowId,
      updated: true,
      changes: permissions,
    };
  } catch (error) {
    console.error('更新工作流权限失败:', error);
    throw new Error(
      `权限更新失败: ${
        (error as any).response?.data?.message || (error as Error).message
      }`
    );
  }
}

/**
 * 删除工作流权限配置
 */
async function deleteWorkflowPermissions(workflowId: string) {
  try {
    await axios.patch(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        meta: {
          permissions: null,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      workflowId: workflowId,
      deleted: true,
    };
  } catch (error) {
    console.error('删除工作流权限配置失败:', error);
    throw new Error(
      `权限配置删除失败: ${
        (error as any).response?.data?.message || (error as Error).message
      }`
    );
  }
}

/**
 * 获取工作流详细信息
 */
async function getWorkflowDetails(workflowId: string) {
  try {
    const response = await axios.get(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('获取工作流详情失败:', error);
    return null;
  }
}

/**
 * 获取所有 n8n 工作流
 */
async function getAllN8nWorkflows() {
  try {
    const response = await axios.get(`${N8N_CONFIG.baseUrl}/api/workflows`, {
      headers: {
        Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('获取 n8n 工作流列表失败:', error);
    return [];
  }
}

/**
 * 获取工作流权限配置
 */
async function getWorkflowPermissionConfig(workflowId: string) {
  try {
    const workflow = await getWorkflowDetails(workflowId);
    return workflow?.meta?.permissions || null;
  } catch (error) {
    console.error('获取工作流权限配置失败:', error);
    return null;
  }
}

/**
 * 记录审计日志
 */
async function logAuditEvent(
  action: string,
  userId: string,
  resource: string,
  details: any,
  supabase: any
) {
  try {
    // 这里应该调用实际的审计日志系统
    console.log(`审计日志: ${action} by ${userId} on ${resource}`, details);

    // 实际项目中应该写入数据库
    // await supabase.from('audit_logs').insert({
    //   user_id: userId,
    //   action: action,
    //   resource: resource,
    //   details: details,
    //   timestamp: new Date().toISOString()
    // } as any);
  } catch (error) {
    console.error('记录审计日志失败:', error);
  }
}

/**
 * 获取用户档案信息
 */
async function getUserProfile(userId: string, supabase: any) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('获取用户档案失败:', error);
      return { role: 'user', tenant_id: null };
    }

    return profile;
  } catch (error) {
    console.error('获取用户档案错误:', error);
    return { role: 'user', tenant_id: null };
  }
}
