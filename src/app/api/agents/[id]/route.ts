/**
 * 单个智能体操作 API 端点
 * 提供智能体详情、更新、删除和执行功能
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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

    // 获取智能体详情
    const { data: agent, error } = await supabase
      .from('agents')
      .select(
        `
        *,
        executions:agent_executions(*)
      `
      )
      .eq('id', agentId)
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

    // 更新智能体
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined)
      updateData.description = body?.trim() || null;
    if (body.configuration !== undefined)
      updateData.configuration = body.configuration;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: agent, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('更新智能体失败:', error);
      return NextResponse.json(
        { error: '更新智能体失败', details: error.message },
        { status: 500 }
      );
    }

    if (!agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '智能体更新成功',
      data: agent,
    });
  } catch (error: any) {
    console.error('更新智能体错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function DELETE(
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

    // 删除智能体
    const { error } = await supabase.from('agents').delete().eq('id', agentId);

    if (error) {
      console.error('删除智能体失败:', error);
      return NextResponse.json(
        { error: '删除智能体失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '智能体删除成功',
    });
  } catch (error: any) {
    console.error('删除智能体错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
