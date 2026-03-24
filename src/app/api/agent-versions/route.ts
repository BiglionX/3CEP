/**
 * 智能体版本管理 API
 * POST /api/agent-versions - 创建新版本
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    // 解析请求体
    const body = await request.json();
    const { agent_id, version, configuration, changelog, is_current } = body;

    // 验证必填字段
    if (!agent_id || !version || !configuration) {
      return NextResponse.json(
        { error: '缺少必填字段（agent_id, version, configuration）' },
        { status: 400 }
      );
    }

    // 检查智能体是否存在
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agent_id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    // 如果设置为当前版本，先将其他版本设为非当前
    if (is_current) {
      await supabase
        .from('agent_versions')
        .update({ is_current: false })
        .eq('agent_id', agent_id);
    }

    // 创建版本记录
    const { data: versionRecord, error } = await supabase
      .from('agent_versions')
      .insert({
        agent_id,
        version,
        configuration,
        changelog: changelog || null,
        is_current: is_current || false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('创建版本记录失败:', error);
      return NextResponse.json(
        { error: '创建版本记录失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '版本创建成功',
        data: versionRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('创建版本记录错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
