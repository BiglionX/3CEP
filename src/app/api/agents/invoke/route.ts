/**
 * 智能体调用API
 * 提供直接调用智能体执行特定任务的功能，带权限验证
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/tech/middleware/permissions';
import { audit } from '@/lib/audit';

export async function POST(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // cookies 获取会话信息
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

    // 获取用户角色信息
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: '用户权限不足' }, { status: 403 });
    }

    // 构建用户上下文用于权限检查
    const userContext = {
      id: user.id,
      roles: [adminUser.role],
      tenant_id: null,
    };

    // 模拟 Express 请求对象用于权限中间件
    const mockReq = {
      user: userContext,
      body: await request.json(),
    };

    const mockRes = {
      status: (code: number) => ({
        json: (data: unknown) =>
          NextResponse.json(data as any, { status: code }),
      }),
    };

    // 检查 agents_invoke 权限
    const permissionCheck = requirePermission('agents_invoke');
    let permissionGranted = true;
    let permissionError: unknown = null;

    permissionCheck(
      mockReq,
      {
        status: (_code: number) => ({
          json: (data: unknown) => {
            permissionGranted = false;
            permissionError = data;
            return mockRes;
          },
        }),
      },
      () => {}
    );

    if (!permissionGranted) {
      return NextResponse.json(permissionError, { status: 403 });
    }

    // 解析请求参数
    const { agentName, taskId, parameters } = mockReq.body;

    // 验证必填参数
    if (!agentName) {
      return NextResponse.json(
        { error: '缺少智能体名称参数' },
        { status: 400 }
      );
    }

    // 记录审计日志 - 开始调用
    await audit(
      'agent_invoke_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null,
      },
      'agents',
      {
        agent_name: agentName,
        task_id: taskId,
        parameters: parameters || {},
      },
      `invoke_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // 模拟智能体调用（实际应该调用具体的智能体服务）
    try {
      // 这里应该是实际的智能体调用逻辑
      // 例如调用 LangChain、OpenAI 或自定义智能体服务
      const invokeResult = {
        success: true,
        agentName,
        taskId: taskId || `task_${Date.now()}`,
        invokeId: `invoke_${Date.now()}`,
        status: 'executing',
        timestamp: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30秒后
      };

      // 记录审计日志 - 调用成功启动
      await audit(
        'agent_invoke_started',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'agents',
        invokeResult,
        `invoke_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(invokeResult);
    } catch (agentError) {
      // 记录审计日志 - 调用失败
      await audit(
        'agent_invoke_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'agents',
        {
          agentName,
          error: agentError instanceof Error ? agentError.message : '未知错误',
          timestamp: new Date().toISOString(),
        },
        `invoke_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(
        {
          error: '智能体调用失败',
          details:
            agentError instanceof Error ? agentError.message : '未知错误',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('智能体调用API 错误:', error);

    // 记录审计日志 - 系统错误
    await audit(
      'agent_invoke_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null,
      },
      'agents',
      {
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      },
      `invoke_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// GET 方法用于查询调用状态
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invokeId = searchParams.get('invokeId');

  if (!invokeId) {
    return NextResponse.json({ error: '缺少调用ID参数' }, { status: 400 });
  }

  // 这里应该查询实际的调用状态
  // 暂时返回模拟数据
  return NextResponse.json({
    invokeId,
    status: 'completed',
    result: {
      success: true,
      output: '智能体执行完成',
      data: {
        processedItems: 10,
        successRate: '95%',
      },
    },
    timestamp: new Date().toISOString(),
  });
}
