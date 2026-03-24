/**
 * 单个智能体操作 API 端点
 * 提供智能体详情、更新、删除和执行功能
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
} from '@/lib/api/error-handler';
import {
  AgentPermission,
  authenticateAndGetUser,
  PermissionValidator,
} from '@/lib/auth/permissions';
import {
  getConflictMessage,
  isOptimisticLockConflict,
  OptimisticLockManager,
} from '@/lib/db/optimistic-lock';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 验证用户认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 });
    }

    const agentId = params.id;

    // 获取智能体详情（自动过滤已软删除的记录，管理员除外）
    const { data: agent, error } = await supabase
      .from('agents')
      .select(
        `
        *,
        executions:agent_executions(*)
      `
      )
      .eq('id', agentId)
      .is('deleted_at', null) // 默认只查询未删除的
      .single();

    if (error) {
      console.error('获取智能体详情失败:', error);
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    console.error('智能体详情 API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      sessionCookie.value,
      supabase as any
    );

    if (authResult.error) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error,
      });
    }

    const user = authResult.user!;
    const agentId = params.id;

    // 步骤 3: 验证更新权限（需要 AGENT_UPDATE 权限或是所有者）
    const validator = new PermissionValidator(supabase as any);

    // 检查基础权限
    const hasBasePermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_UPDATE
    );

    // 如果不是管理员，需要检查是否为所有者
    if (!hasBasePermission || user.role !== 'admin') {
      const isOwner = await validator.isAgentOwner(agentId, user.id);
      if (!isOwner) {
        return createErrorResponse(ErrorCode.FORBIDDEN, {
          path,
          requestId,
          message: '您没有权限修改此智能体，仅所有者或管理员可操作',
        });
      }
    }

    // 步骤 4: 解析请求体
    const body = await request.json();

    // 步骤 5: 获取当前版本号和智能体信息
    const { data: currentAgent, error: fetchError } = await supabase
      .from('agents')
      .select('version')
      .eq('id', agentId)
      .single();

    if (fetchError || !currentAgent) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '智能体不存在',
      });
    }

    const currentVersion = currentAgent.version;

    // 步骤 6: 准备更新数据
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined)
      updateData.description = body.description.trim() || null; // 修复：应该是 body.description.trim()
    if (body.configuration !== undefined)
      updateData.configuration = body.configuration;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.shelf_status !== undefined)
      updateData.shelf_status = body.shelf_status;
    if (body.review_status !== undefined)
      updateData.review_status = body.review_status;

    // 步骤 7: 使用乐观锁执行更新
    const lockManager = new OptimisticLockManager(supabase);
    const result = await lockManager.updateWithOptimisticLock(
      'agents',
      agentId,
      updateData,
      currentVersion
    );

    // 步骤 8: 检查是否发生并发冲突
    if (!result.success && result.conflict) {
      return createErrorResponse(ErrorCode.INVALID_OPERATION, {
        path,
        requestId,
        message: '数据已被其他用户修改，请刷新后重试',
        details: {
          expectedVersion: result.conflict.expectedVersion,
          currentVersion: result.conflict.currentVersion,
          hint: '请刷新页面获取最新数据后重试',
        },
      });
    }

    if (!result.data) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '智能体不存在',
      });
    }

    // 步骤 9: 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'agent_updated',
      resource_type: 'agent',
      resource_id: agentId,
      details: {
        agent_name: result.data.name,
        updated_fields: Object.keys(updateData).filter(
          k => k !== 'updated_by' && k !== 'updated_at'
        ),
      },
    });

    return createSuccessResponse(result.data, {
      message: '智能体更新成功',
      path,
      requestId,
    });
  } catch (error: any) {
    console.error('更新智能体错误:', error);

    // 检查是否为乐观锁冲突
    if (isOptimisticLockConflict(error)) {
      return createErrorResponse(ErrorCode.INVALID_OPERATION, {
        path,
        requestId,
        message: getConflictMessage(error),
        details: {
          hint: '请刷新页面获取最新数据后重试',
        },
      });
    }

    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error.message || '服务器内部错误',
    });
  }
}

// 检查智能体关联数据的辅助函数
async function checkAssociations(agentId: string, supabase: any) {
  // 检查活跃订单（agent_orders 表）
  const { count: activeOrdersCount, error: ordersError } = await supabase
    .from('agent_orders')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .in('status', ['pending', 'paid', 'activated']); // 活跃订单状态

  if (ordersError) {
    console.error('检查关联订单时出错:', ordersError);
    throw new Error(`检查关联订单时出错：${ordersError.message}`);
  }

  // 检查进行中的执行（agent_executions 表）
  const { count: runningExecutionsCount, error: executionsError } =
    await supabase
      .from('agent_executions')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .in('status', ['running']); // 进行中的执行状态

  if (executionsError) {
    console.error('检查关联执行时出错:', executionsError);
    throw new Error(`检查关联执行时出错：${executionsError.message}`);
  }

  // 检查未完成的订单（除了活跃订单外，可能还有其他未完成的订单）
  const { count: unfinishedOrdersCount, error: unfinishedOrdersError } =
    await supabase
      .from('agent_orders')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .in('status', ['pending', 'paid', 'activated', 'refunded']); // 未完成订单状态

  if (unfinishedOrdersError) {
    console.error('检查未完成订单时出错:', unfinishedOrdersError);
    throw new Error(`检查未完成订单时出错：${unfinishedOrdersError.message}`);
  }

  return {
    activeOrders: activeOrdersCount,
    runningExecutions: runningExecutionsCount,
    relatedOrders: unfinishedOrdersCount,
  };
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      sessionCookie.value,
      supabase as any
    );

    if (authResult.error) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error,
      });
    }

    const user = authResult.user!;
    const agentId = params.id;

    // 步骤 3: 验证删除权限（仅 admin 可删除）
    const validator = new PermissionValidator(supabase as any);
    const hasPermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_DELETE
    );

    if (!hasPermission || user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限删除智能体，仅管理员可执行此操作',
      });
    }

    // 步骤 4: 检查关联数据
    const associations = await checkAssociations(agentId, supabase);

    // 步骤 5: 如果有关联数据，则不允许删除并返回详细信息
    if (
      associations.activeOrders > 0 ||
      associations.runningExecutions > 0 ||
      associations.relatedOrders > 0
    ) {
      return createErrorResponse(ErrorCode.AGENT_CANNOT_DELETE, {
        path,
        requestId,
        message: '无法删除：存在关联数据',
        details: {
          activeOrders: associations.activeOrders,
          runningExecutions: associations.runningExecutions,
          relatedOrders: associations.relatedOrders,
        },
      });
    }

    // 步骤 6: 软删除智能体
    const { error } = await supabase
      .from('agents')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId);

    if (error) {
      console.error('软删除智能体失败:', error);
      return handleSupabaseError(error, { path, requestId });
    }

    // 步骤 7: 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'agent_deleted',
      resource_type: 'agent',
      resource_id: agentId,
      details: {
        reason: 'admin_deletion',
        associations_checked: true,
      },
    });

    return createSuccessResponse(
      { agentId, message: '智能体已删除（软删除）' },
      { path, requestId }
    );
  } catch (error: any) {
    console.error('删除智能体错误:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error.message || '服务器内部错误',
    });
  }
}
