/**
 * 初始化智能体使用计数器
 * POST /api/agents/[id]/initialize-usage
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // 检查智能体是否存在
    const { data: agent } = await supabase
      .from('agents')
      .select('id, usage_count')
      .eq('id', agentId)
      .single();

    if (!agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    // 初始化使用计数器为 0（实际上创建时已经是 0，这里只是确保）
    const { error } = await supabase
      .from('agents')
      .update({ usage_count: 0 })
      .eq('id', agentId);

    if (error) {
      console.error('初始化使用计数器失败:', error);
      return NextResponse.json(
        { error: '初始化失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '使用计数器初始化成功',
      data: { agent_id: agentId, usage_count: 0 },
    });
  } catch (error: any) {
    console.error('初始化使用计数器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
