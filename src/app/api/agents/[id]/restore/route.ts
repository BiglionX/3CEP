/**
 * 恢复已删除的智能体API 端点
 * POST /api/agents/[id]/restore
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

    // 检查是否为管理员（只有管理员可以恢复）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'marketplace_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: '权限不足：只有管理员可以恢复智能体' },
        { status: 403 }
      );
    }

    const agentId = params.id;

    // 检查智能体是否存在且已被软删除
    const { data: existingAgent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .not('deleted_at', 'is', null)
      .single();

    if (fetchError || !existingAgent) {
      return NextResponse.json(
        { error: '智能体不存在或未被删除' },
        { status: 404 }
      );
    }

    // 恢复智能体：清空 deleted_at 和 deleted_by 字段
    const { data: restoredAgent, error } = await supabase
      .from('agents')
      .update({
        deleted_at: null,
        deleted_by: null,
        restored_at: new Date().toISOString(),
        restored_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('恢复智能体失败:', error);
      return NextResponse.json(
        { error: '恢复智能体失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '智能体已恢复',
      data: restoredAgent,
    });
  } catch (error: any) {
    console.error('恢复智能体错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
