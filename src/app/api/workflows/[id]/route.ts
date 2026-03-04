/**
 * 单个工作流操作 API 端点
 * 提供工作流详情、执行、更新等功能
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

    const workflowId = params.id;

    // 获取工作流详情
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select(
        `
        *,
        executions:workflow_executions(*)
      `
      )
      .eq('id', workflowId)
      .single();

    if (error) {
      console.error('获取工作流详情失败:', error);
      return NextResponse.json({ error: '工作流不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    console.error('工作流详情 API 错误:', error);
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

    const workflowId = params.id;
    const body = await request.json();

    // 更新工作流
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined)
      updateData.description = body?.trim() || null;
    if (body.workflow_data !== undefined)
      updateData.workflow_data = body.workflow_data;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: workflow, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      console.error('更新工作流失败:', error);
      return NextResponse.json(
        { error: '更新工作流失败', details: error.message },
        { status: 500 }
      );
    }

    if (!workflow) {
      return NextResponse.json({ error: '工作流不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '工作流更新成功',
      data: workflow,
    });
  } catch (error: any) {
    console.error('更新工作流错误:', error);
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

    const workflowId = params.id;

    // 删除工作流
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId);

    if (error) {
      console.error('删除工作流失败:', error);
      return NextResponse.json(
        { error: '删除工作流失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '工作流删除成功',
    });
  } catch (error: any) {
    console.error('删除工作流错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
