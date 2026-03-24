/**
 * 智能体库存管理 API
 *
 * 提供库存查询、扣减、恢复等功能
 * 支持限量销售和库存预警
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
import { requireAuth } from '@/lib/auth/server-auth';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * GET /api/agents/[id]/inventory
 *
 * 获取智能体库存信息
 */
export async function GET(
  request: NextRequest,
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
    await requireAuth();

    // 步骤 2: 获取 session 用于后续权限验证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    let userRole = 'user';
    if (sessionCookie) {
      const authResult = await authenticateAndGetUser(
        sessionCookie.value,
        supabase as any
      );
      if (authResult.user) {
        userRole = authResult.user.role;
      }
    }

    const agentId = params.id;

    // 步骤 3: 验证权限（需要 AGENT_UPDATE 权限或是所有者）
    const validator = new PermissionValidator(supabase as any);
    const hasBasePermission = validator.hasPermission(
      userRole as 'user' | 'admin' | 'owner',
      AgentPermission.AGENT_UPDATE
    );

    // 如果不是管理员或 owner，需要检查是否为所有者
    if (!hasBasePermission || (userRole !== 'admin' && userRole !== 'owner')) {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        return createErrorResponse(ErrorCode.UNAUTHORIZED, {
          path,
          requestId,
          message: '用户未登录',
        });
      }
      const isOwner = await validator.isAgentOwner(agentId, userId);
      if (!isOwner) {
        return createErrorResponse(ErrorCode.FORBIDDEN, {
          path,
          requestId,
          message: '您没有权限查看此智能体的库存',
        });
      }
    }

    // 获取智能体库存信息
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, name, inventory_limit, inventory_used, shelf_status')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        details: '智能体不存在',
      });
    }

    // 计算可用库存
    const availableStock = agent.inventory_limit
      ? agent.inventory_limit - (agent.inventory_used || 0)
      : null; // null 表示无限制

    return createSuccessResponse(
      {
        agentId: agent.id,
        agentName: agent.name,
        inventoryLimit: agent.inventory_limit || null,
        inventoryUsed: agent.inventory_used || 0,
        availableStock,
        isUnlimited: !agent.inventory_limit,
        status: getStockStatus(availableStock, agent.inventory_limit),
      },
      {
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('获取库存信息失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * POST /api/agents/[id]/inventory
 *
 * 扣减库存（下单时调用）
 */
export async function POST(
  request: NextRequest,
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
    await requireAuth();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    const authResult = await authenticateAndGetUser(
      sessionCookie?.value || '',
      supabase as any
    );

    if (!authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '用户认证失败',
      });
    }

    const user = authResult.user;
    const agentId = params.id;

    // 步骤 2: 验证权限
    const validator = new PermissionValidator(supabase as any);
    const hasBasePermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_UPDATE
    );

    if (
      !hasBasePermission ||
      (user.role !== 'admin' && user.role !== 'owner')
    ) {
      const isOwner = await validator.isAgentOwner(agentId, user.id);
      if (!isOwner) {
        return createErrorResponse(ErrorCode.FORBIDDEN, {
          path,
          requestId,
          message: '您没有权限操作此智能体的库存',
        });
      }
    }

    const body = await request.json();
    const { quantity = 1, orderId } = body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return createErrorResponse(ErrorCode.INVALID_REQUEST, {
        path,
        requestId,
        message: '扣减数量必须大于等于 1',
        details: { quantity },
      });
    }

    // 开启事务处理
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('inventory_limit, inventory_used, shelf_status')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        details: '智能体不存在',
      });
    }

    // 检查是否已下架
    if (agent.shelf_status !== 'on_shelf') {
      return createErrorResponse(ErrorCode.INVALID_OPERATION, {
        path,
        requestId,
        message: '智能体已下架，无法购买',
        details: { shelfStatus: agent.shelf_status },
      });
    }

    // 检查库存限制
    if (agent.inventory_limit !== null && agent.inventory_limit !== undefined) {
      const availableStock =
        agent.inventory_limit - (agent.inventory_used || 0);

      if (availableStock < quantity) {
        return createErrorResponse(ErrorCode.QUOTA_EXCEEDED, {
          path,
          requestId,
          message: '库存不足',
          details: {
            required: quantity,
            available: availableStock,
            inventoryLimit: agent.inventory_limit,
            inventoryUsed: agent.inventory_used,
          },
        });
      }
    }

    // 扣减库存（使用乐观锁防止并发问题）
    const currentUsed = agent.inventory_used || 0;

    const { data: updatedAgent, error: updateError } = (await supabase
      .from('agents')
      .update({
        inventory_used: currentUsed + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .eq('inventory_used', currentUsed) // 乐观锁条件
      .select('inventory_limit, inventory_used')
      .single()) as any;

    if (updateError) {
      if (updateError.code === 'PGRST119') {
        // 乐观锁冲突，数据已被其他请求修改
        return createErrorResponse(ErrorCode.INVALID_OPERATION, {
          path,
          requestId,
          message: '库存数据已被修改，请重试',
          details: {
            currentInventoryUsed: currentUsed,
            newInventoryUsed: currentUsed + quantity,
          },
        });
      }
      return handleSupabaseError(updateError, { path, requestId });
    }

    // 记录库存流水
    await supabase.from('agent_inventory_logs').insert({
      agent_id: agentId,
      order_id: orderId || null,
      change_type: 'decrease',
      change_quantity: quantity,
      previous_stock: agent.inventory_used || 0,
      current_stock: updatedAgent.inventory_used || 0,
      created_by: 'system', // 系统自动扣减
      remark: `下单扣减库存 - 订单 ${orderId || '未指定'}`,
    } as any);

    // 检查是否需要发送预警
    await checkAndSendAlert(
      supabase as any,
      agentId,
      updatedAgent.inventory_limit,
      updatedAgent.inventory_used
    );

    // 返回成功响应
    const availableStock = updatedAgent.inventory_limit
      ? updatedAgent.inventory_limit - updatedAgent.inventory_used
      : null;

    return createSuccessResponse(
      {
        agentId,
        previousUsed: currentUsed,
        currentUsed: updatedAgent.inventory_used,
        availableStock,
        isUnlimited: !updatedAgent.inventory_limit,
      },
      {
        message: '库存扣减成功',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('扣减库存失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * PUT /api/agents/[id]/inventory
 *
 * 恢复库存（取消订单时调用）
 *
 * 请求体：
 * {
 *   quantity: number,  // 恢复数量，默认为 1
 *   orderId: string,   // 订单 ID
 * }
 */
export async function PUT(
  request: NextRequest,
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
    await requireAuth();

    // 步骤 2: 获取用户信息
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    const authResult = await authenticateAndGetUser(
      sessionCookie.value,
      supabase as any
    );

    if (!authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '用户认证失败',
      });
    }

    const user = authResult.user;
    const agentId = params.id;

    // 步骤 3: 验证权限
    const validator = new PermissionValidator(supabase as any);
    const hasBasePermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_UPDATE
    );

    if (
      !hasBasePermission ||
      (user.role !== 'admin' && user.role !== 'owner')
    ) {
      const isOwner = await validator.isAgentOwner(agentId, user.id);
      if (!isOwner) {
        return createErrorResponse(ErrorCode.FORBIDDEN, {
          path,
          requestId,
          message: '您没有权限操作此智能体的库存',
        });
      }
    }

    const body = await request.json();
    const { quantity = 1, orderId } = body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return createErrorResponse(ErrorCode.INVALID_REQUEST, {
        path,
        requestId,
        message: '恢复数量必须大于等于 1',
        details: { quantity },
      });
    }

    // 获取当前库存
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('inventory_used')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        details: '智能体不存在',
      });
    }

    // 恢复库存
    const currentUsed = agent.inventory_used || 0;
    const newUsed = Math.max(0, currentUsed - quantity); // 确保不为负数

    const { data: updatedAgent, error: updateError } = (await supabase
      .from('agents')
      .update({
        inventory_used: newUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .select('inventory_limit, inventory_used')
      .single()) as any;

    if (updateError) {
      return handleSupabaseError(updateError, { path, requestId });
    }

    // 记录库存流水
    await supabase.from('agent_inventory_logs').insert({
      agent_id: agentId,
      order_id: orderId || null,
      change_type: 'increase',
      change_quantity: quantity,
      previous_stock: currentUsed,
      current_stock: newUsed,
      created_by: user.id,
      remark: `取消订单恢复库存 - 订单 ${orderId || '未指定'}`,
    } as any);

    // 返回成功响应
    const availableStock = updatedAgent.inventory_limit
      ? updatedAgent.inventory_limit - updatedAgent.inventory_used
      : null;

    return createSuccessResponse(
      {
        agentId,
        previousUsed: currentUsed,
        currentUsed: updatedAgent.inventory_used,
        availableStock,
        isUnlimited: !updatedAgent.inventory_limit,
      },
      {
        message: '库存恢复成功',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('恢复库存失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * 获取库存状态
 */
function getStockStatus(
  availableStock: number | null,
  inventoryLimit: number | null
): 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited' {
  if (availableStock === null) {
    return 'unlimited'; // 无限制
  }

  if (availableStock <= 0) {
    return 'out_of_stock';
  }

  if (inventoryLimit && availableStock <= inventoryLimit * 0.1) {
    return 'low_stock'; // 低于 10% 视为低库存
  }

  return 'in_stock';
}

/**
 * 检查并发送库存预警
 */
async function checkAndSendAlert(
  supabase: ReturnType<typeof createClient>,
  agentId: string,
  inventoryLimit: number | null,
  inventoryUsed: number | null
) {
  if (!inventoryLimit || !inventoryUsed) {
    return;
  }

  const availableStock = inventoryLimit - inventoryUsed;
  const threshold = inventoryLimit * 0.2; // 20% 阈值

  if (availableStock <= threshold) {
    // 获取智能体所有者
    const { data: agent } = (await supabase
      .from('agents')
      .select('created_by, name')
      .eq('id', agentId)
      .single()) as any;

    if (agent && agent.created_by) {
      // 插入预警记录
      await supabase.from('inventory_alerts').insert({
        agent_id: agentId,
        alert_type: 'low_stock',
        alert_level: availableStock <= 0 ? 'critical' : 'warning',
        message: `智能体库存紧张，剩余：${availableStock}/${inventoryLimit}`,
        metadata: {
          availableStock,
          inventoryLimit,
          threshold,
        },
        user_id: agent.created_by,
        is_read: false,
      } as any);

      // TODO: 发送邮件通知
      // eslint-disable-next-line no-console
      console.log(
        `[库存预警] 智能体库存紧张：${availableStock}/${inventoryLimit}`
      );
    }
  }
}
