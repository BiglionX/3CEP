/**
 * 智能体执行和调试 API 端点
 * 提供智能体执行、调试和 Playground 功能
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
    const body = await request.json();

    // 获取智能体信息
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, configuration, status')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    if (agent.status !== 'active') {
      return NextResponse.json({ error: '智能体未激活' }, { status: 400 });
    }

    // 创建执行记录
    const { data: execution, error: executionError } = await supabase
      .from('agent_executions')
      .insert({
        agent_id: agentId,
        status: 'running',
        input_data: body.input_data || {} as any,
        parameters: body.parameters || {},
        started_at: new Date().toISOString(),
        triggered_by: user.id
      })
      .select()
      .single();

    if (executionError) {
      console.error('创建智能体执行记录失败:', executionError);
      return NextResponse.json(
        { error: '创建执行记录失败' }, 
        { status: 500 }
      );
    }

    // 模拟智能体执行（实际项目中这里会调用 LLM 或其他 AI 服务）
    setTimeout(async () => {
      try {
        // 模拟执行结果
        const executionResult = {
          status: Math.random() > 0.1 ? 'completed' : 'failed',
          output_data: {
            result: 'success',
            response: generateMockResponse(agent.name, body.input_data),
            tokens_used: Math.floor(Math.random() * 1000) + 100,
            execution_time: Math.random() * 2 + 0.5
          },
          completed_at: new Date().toISOString(),
          duration_ms: Math.floor(Math.random() * 3000) + 500
        };

        // 更新执行记录
        await supabase
          .from('agent_executions')
          .update(executionResult)
          .eq('id', execution.id);
      } catch (updateError) {
        console.error('更新执行记录失败:', updateError);
      }
    }, 1500);

    return NextResponse.json({
      success: true,
      message: '智能体开始执行',
      data: {
        executionId: execution.id,
        agentId: agent.id,
        agentName: agent.name
      }
    });

  } catch (error: any) {
    console.error('执行智能体错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

// 调试模式执行
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
    const body = await request.json();

    // 获取智能体信息
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, configuration')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    // 创建调试执行记录
    const { data: debugExecution, error: debugError } = await supabase
      .from('agent_executions')
      .insert({
        agent_id: agentId,
        status: 'running',
        input_data: body.input_data || {} as any,
        parameters: { ...body.parameters, debug_mode: true },
        is_debug: true,
        started_at: new Date().toISOString(),
        triggered_by: user.id
      })
      .select()
      .single();

    if (debugError) {
      console.error('创建调试执行记录失败:', debugError);
      return NextResponse.json(
        { error: '创建调试记录失败' }, 
        { status: 500 }
      );
    }

    // 模拟调试执行（提供更多详细信息）
    setTimeout(async () => {
      try {
        const debugResult = {
          status: 'completed',
          output_data: {
            result: 'debug_success',
            response: generateMockResponse(agent.name, body.input_data),
            debug_info: {
              input_processing: '✅ 输入解析成功',
              context_retrieval: '✅ 上下文检索完成',
              reasoning_steps: [
                '步骤1: 理解用户意图',
                '步骤2: 检索相关信息',
                '步骤3: 生成回答',
                '步骤4: 验证回答质量'
              ],
              confidence_score: 0.92,
              tokens_used: Math.floor(Math.random() * 800) + 200,
              execution_time: Math.random() * 1.5 + 0.8
            }
          },
          completed_at: new Date().toISOString(),
          duration_ms: Math.floor(Math.random() * 2500) + 800
        };

        await supabase
          .from('agent_executions')
          .update(debugResult)
          .eq('id', debugExecution.id);
      } catch (updateError) {
        console.error('更新调试执行记录失败:', updateError);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: '智能体调试执行开始',
      data: {
        executionId: debugExecution.id,
        agentName: agent.name,
        debugMode: true
      }
    });

  } catch (error: any) {
    console.error('调试智能体错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

// 生成模拟响应的辅助函数
function generateMockResponse(agentName: string, inputData: any) {
  const responses = [
    `您好！我是${agentName}，我已经收到您的请求。让我来帮您处理这个问题...`,
    `基于您的输入"${inputData?.query || '查询内容'}"，我分析得出以下结论...`,
    `感谢您的咨询。关于${inputData?.topic || '这个话题'}，我的建议是...`,
    `我理解您想要了解${inputData?.subject || '相关信息'}。根据我的知识库...`
  ];
  
  const mockData = [
    { type: 'text', content: responses[Math.floor(Math.random() * responses.length)] },
    { type: 'data', content: { items: 3, processed: true, timestamp: new Date().toISOString() } }
  ];
  
  return mockData;
}