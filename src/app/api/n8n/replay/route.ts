/**
 * n8n 工作流回放 API
 * 提供工作流历史执行回放功能，带权限验证和审计日志
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/middleware/permissions';
import { audit } from '@/lib/audit';

// n8n 配置
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  apiToken: process.env.N8N_API_TOKEN,
};

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

    // 构造用户上下文用于权限检查
    const userContext = {
      id: user.id,
      roles: [adminUser.role],
      tenant_id: null // 简化处理，实际应从 user_tenants 表获取
    };

    // 模拟 Express 请求对象用于权限中间件
    const mockReq = {
      user: userContext,
      body: await request.json()
    };

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };

    // 检查 n8n_workflows_replay 权限
    const permissionCheck = requirePermission('n8n_workflows_replay');
    let permissionGranted = true;
    let permissionError = null;

    permissionCheck(mockReq, {
      status: (code: number) => ({
        json: (data: any) => {
          permissionGranted = false;
          permissionError = data;
          return mockRes;
        }
      })
    }, () => {});

    if (!permissionGranted) {
      return NextResponse.json(permissionError, { status: 403 });
    }

    // 解析请求体
    const { workflowId, executionId, parameters } = mockReq.body;

    // 验证必要参数
    if (!workflowId) {
      return NextResponse.json(
        { error: '缺少工作流ID参数' }, 
        { status: 400 }
      );
    }

    // 记录审计日志 - 开始回放
    await audit(
      'n8n_workflow_replay_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null
      },
      'n8n_workflows',
      {
        workflow_id: workflowId,
        execution_id: executionId,
        parameters: parameters || {}
      },
      `replay_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    );

    // 调用 n8n API 执行回放（模拟）
    try {
      // 这里应该是实际的 n8n API 调用
      // const n8nResponse = await axios.post(
      //   `${N8N_CONFIG.baseUrl}/workflows/${workflowId}/replay`,
      //   { executionId, parameters },
      //   { headers: { 'Authorization': `Bearer ${N8N_CONFIG.apiToken}` } }
      // );

      // 模拟成功响应
      const replayResult = {
        success: true,
        workflowId,
        executionId: executionId || 'latest',
        replayId: `replay_${Date.now()}`,
        status: 'started',
        timestamp: new Date().toISOString()
      };

      // 记录审计日志 - 回放成功
      await audit(
        'n8n_workflow_replay_success',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null
        },
        'n8n_workflows',
        replayResult,
        `replay_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      );

      return NextResponse.json(replayResult);

    } catch (n8nError: any) {
      // 记录审计日志 - 回放失败
      await audit(
        'n8n_workflow_replay_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null
        },
        'n8n_workflows',
        {
          workflowId,
          error: n8nError.message,
          timestamp: new Date().toISOString()
        },
        `replay_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      );

      return NextResponse.json(
        { 
          error: '工作流回放失败',
          details: n8nError.message 
        }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('工作流回放 API 错误:', error);
    
    // 记录审计日志 - 系统错误
    await audit(
      'n8n_workflow_replay_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null
      },
      'n8n_workflows',
      {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      `replay_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    );

    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

// GET 方法用于查询回放状态
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const replayId = searchParams.get('replayId');

  if (!replayId) {
    return NextResponse.json(
      { error: '缺少回放ID参数' }, 
      { status: 400 }
    );
  }

  // 这里应该查询实际的回放状态
  // 暂时返回模拟数据
  return NextResponse.json({
    replayId,
    status: 'completed',
    result: {
      success: true,
      output: '回放完成'
    },
    timestamp: new Date().toISOString()
  });
}