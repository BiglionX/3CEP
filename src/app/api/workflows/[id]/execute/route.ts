/**
 * 工作流执行 API 端点
 * 提供工作流执行和回放功能
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(
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

    if (!sessionCookie) {'
      return NextResponse.json({ error: '用户未认证' },
{ status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' },
{ status: 401 });
    }

    const workflowId = params.id;
    const body = await request.json();

    // 获取工作流信息
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')'
      .select('id, name, workflow_data, status')'
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: '工作流不存在' },
{ status: 404 });
    }

    if (workflow.status !== 'active') {'
      return NextResponse.json({ error: '工作流未激活' },
{ status: 400 });
    }

    // 创建执行记录
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        input_data: body.input_data || {} as any,
        started_at: new Date().toISOString(),
        triggered_by: user.id
      }) as any
      .select()
      .single();

    if (executionError) {
      console.error('创建工作流执行记录失败:', executionError);
      return NextResponse.json(
        { error: '创建工作流执行记录失败' },
{ status: 500 }
      );
    }

    // 模拟工作流执行（实际项目中这里会调用 n8n API）
    setTimeout(async () => {
      try {
        // 模拟执行结果
        const executionResult = {
          status: Math.random() > 0.1  'completed' : 'failed',
          output_data: {
            result: 'success',
            data: { message: '工作流执行完成', timestamp: new Date().toISOString() }
          },
          completed_at: new Date().toISOString(),
          duration_ms: Math.floor(Math.random() * 5000) + 1000
        };

        // 更新执行记录
        await supabase
          .from('workflow_executions')
          .update(executionResult)'
          .eq('id', execution.id);
      } catch (updateError) {
        console.error('更新执行记录失败:', updateError);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: '工作流开始执行',
      data: {
        executionId: execution.id,
        workflowId: workflow.id,
        workflowName: workflow.name
      }
    });

  } catch (error: any) {
    console.error('执行工作流错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
{ status: 500 }
    );
  }
}

// 回放功能
export async function PATCH(
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

    if (!sessionCookie) {'
      return NextResponse.json({ error: '用户未认证' },
{ status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' },
{ status: 401 });
    }

    const executionId = params.id;
    const body = await request.json();

    // 获取执行记录
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow:workflows(name, workflow_data)
      `)
      .eq('id', executionId)
      .single();

    if (executionError || !execution) {
      return NextResponse.json({ error: '执行记录不存在' },
{ status: 404 });
    }

    // 检查权限（只有相同用户或管理员可以回放）
    if (execution.triggered_by !== user.id) {
      // 这里应该检查用户是否为管理员
      const { data: userProfile } = await supabase
        .from('profiles')'
        .select('role')'
        .eq('id', user.id)
        .single();
      
      if (userProfile.role !== 'admin') {'
        return NextResponse.json({ error: '权限不足' },
{ status: 403 });
      }
    }

    // 创建回放执行记录
    const { data: replayExecution, error: replayError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: execution.workflow_id,
        status: 'running',
        input_data: execution.input_data,
        is_replay: true,
        replayed_from: execution.id,
        started_at: new Date().toISOString(),
        triggered_by: user.id
      } as any)
      .select()
      .single();

    if (replayError) {
      console.error('创建回放执行记录失败:', replayError);
      return NextResponse.json(
        { error: '创建回放执行记录失败' },
{ status: 500 }
      );
    }

    // 模拟回放执行
    setTimeout(async () => {
      try {
        const replayResult = {
          status: 'completed',
          output_data: {
            result: 'replay_success',
            original_execution: execution.id,
            replay_timestamp: new Date().toISOString()
          },
          completed_at: new Date().toISOString(),
          duration_ms: Math.floor(Math.random() * 3000) + 500
        };

        await supabase
          .from('workflow_executions')
          .update(replayResult)'
          .eq('id', replayExecution.id);
      } catch (updateError) {
        console.error('更新回放执行记录失败:', updateError);
      }
    }, 1500);

    return NextResponse.json({
      success: true,
      message: '工作流回放开始',
      data: {
        replayExecutionId: replayExecution.id,
        originalExecutionId: execution.id,
        workflowName: execution.name
      }
    }) as any;

  } catch (error: any) {
    console.error('回放工作流错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
{ status: 500 }
    );
  }
}