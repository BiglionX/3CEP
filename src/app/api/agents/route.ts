/**
 * 智能体API路由
 * 提供智能体列表、创建、更新、删除等功能
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
  handleValidationError,
} from '@/lib/api/error-handler';
import {
  AgentPermission,
  authenticateAndGetUser,
  PermissionValidator,
} from '@/lib/auth/permissions';
import { agentCache } from '@/lib/cache/agent.cache';
import {
  validateAgentConfig,
  validateCreateAgentRequest,
} from '@/lib/validators';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const includeDeleted = searchParams.get('include_deleted') === 'true'; // 是否包含已删除的记录

  try {
    // 使用缓存获取列表
    const agents = await agentCache.getAgentList(
      { page, limit, status, search, category },
      async () => {
        // 构建查询
        let query = supabase.from('agents').select('*', { count: 'exact' });

        // 默认过滤已软删除的记录（除非明确请求包含）
        if (!includeDeleted) {
          query = query.is('deleted_at', null);
        }

        // 应用过滤条件
        if (status) {
          query = query.eq('status', status);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        // 分页
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const {
          data: agentsData,
          error,
          count,
        } = await query.order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        return {
          agents: agentsData || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        };
      }
    );

    return NextResponse.json({
      success: true,
      ...agents,
    });
  } catch (error: unknown) {
    console.error('智能体API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any // 类型转换以匹配权限验证器的类型要求
    );

    if (authResult.error) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error,
      });
    }

    const user = authResult.user!;

    // 步骤 3: 验证创建智能体权限
    const validator = new PermissionValidator(supabase as any);
    const hasPermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_CREATE
    );

    if (!hasPermission) {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message:
          '您没有权限创建智能体，需要 admin、marketplace_admin 或 owner 角色',
      });
    }

    // 步骤 4: 解析请求体
    const body = await request.json();

    // 步骤 5: 验证基础请求数据
    const baseValidation = validateCreateAgentRequest(body);

    if (!baseValidation.success) {
      return handleValidationError(baseValidation.errors || [], {
        path,
        requestId,
      });
    }

    // 步骤 6: 验证配置数据
    const configValidation = validateAgentConfig(body.configuration);

    if (!configValidation.success) {
      return handleValidationError(configValidation.errors || [], {
        path,
        requestId,
      });
    }

    // 步骤 7: 使用验证通过的数据创建智能体
    const validatedData = baseValidation.data;

    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
        configuration: configValidation.data, // 使用验证后的配置数据
        category: validatedData.category || 'general',
        status: validatedData.status || 'draft',
        version: validatedData.version || '1.0.0',
        tags: validatedData.tags || [],
        pricing: validatedData.pricing || { type: 'free', price: 0 },
        created_by: user.id, // 使用认证用户的 ID
        updated_by: user.id, // 使用认证用户的 ID
      } as any)
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error, { path, requestId });
    }

    // 步骤 8: 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'agent_created',
      resource_type: 'agent',
      resource_id: agent.id,
      details: {
        agent_name: agent.name,
        agent_category: agent.category,
      },
    });

    return createSuccessResponse(agent, {
      message: '智能体创建成功',
      path,
      requestId,
    });
  } catch (error: unknown) {
    console.error('创建智能体出错:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}
