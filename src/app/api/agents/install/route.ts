import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/install
 * 安装/订阅智能体
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, runtimeType = 'desktop' } = body;

    if (!agentId) {
      return NextResponse.json({ error: '缺少智能体ID' }, { status: 400 });
    }

    // 检查智能体是否存在
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: '智能体不存在' }, { status: 404 });
    }

    // 检查是否已安装
    const { data: existingInstall } = await supabase
      .from('user_agent_installations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single();

    if (existingInstall) {
      return NextResponse.json(
        { error: '智能体已安装', installed: true },
        { status: 409 }
      );
    }

    // 根据运行方式设置价格
    const isCloud = runtimeType === 'cloud';
    const subscriptionType = isCloud ? 'cloud' : 'desktop';
    const yearlyPrice = isCloud ? 30000 : 0; // ¥300/年 = 30000分

    // 创建安装记录
    const { data: installation, error: installError } = await supabase
      .from('user_agent_installations')
      .insert({
        user_id: session.user.id,
        agent_id: agentId,
        status: 'active',
        subscription_type: subscriptionType,
        monthly_price: isCloud ? 2500 : 0, // ¥25/月（年付折算）
        yearly_price: isCloud ? 30000 : 0,
        token_balance: isCloud ? 100000 : 0, // 云托管赠送100K tokens
        installed_at: new Date().toISOString(),
        runtime_type: runtimeType,
      })
      .select()
      .single();

    if (installError) {
      console.error('安装智能体失败:', installError);
      return NextResponse.json(
        { error: '安装失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 更新智能体使用次数
    await supabase
      .from('agents')
      .update({ usage_count: (agent.usage_count || 0) + 1 })
      .eq('id', agentId);

    // 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'agent_installed',
      resource_type: 'agent',
      resource_id: agentId,
      details: {
        agent_name: agent.name,
        subscription_type: subscriptionType,
        monthly_price: monthlyPrice,
      },
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          installation,
          agent: {
            id: agent.id,
            name: agent.name,
            category: agent.category,
            configuration: agent.configuration,
          },
        },
        message: '智能体安装成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('安装智能体API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/install
 * 获取用户已安装的智能体列表
 */
export async function GET(request: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const { data: installations, error } = await supabase
      .from('user_agent_installations')
      .select(
        `
        *,
        agent:agents(
          id,
          name,
          description,
          category,
          version,
          configuration,
          icon_url,
          author_name
        )
      `
      )
      .eq('user_id', session.user.id)
      .eq('status', status)
      .order('installed_at', { ascending: false });

    if (error) {
      console.error('获取安装列表失败:', error);
      return NextResponse.json({ error: '获取列表失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: installations || [],
      count: installations?.length || 0,
    });
  } catch (error) {
    console.error('获取安装列表API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/install
 * 卸载/取消安装智能体
 */
export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get('id');

    if (!installationId) {
      return NextResponse.json({ error: '缺少安装记录ID' }, { status: 400 });
    }

    // 检查安装记录是否属于当前用户
    const { data: installation } = await supabase
      .from('user_agent_installations')
      .select('*, agent:agents(name)')
      .eq('id', installationId)
      .eq('user_id', session.user.id)
      .single();

    if (!installation) {
      return NextResponse.json({ error: '安装记录不存在' }, { status: 404 });
    }

    // 更新状态为已取消
    const { error: updateError } = await supabase
      .from('user_agent_installations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', installationId);

    if (updateError) {
      console.error('取消安装失败:', updateError);
      return NextResponse.json({ error: '取消安装失败' }, { status: 500 });
    }

    // 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'agent_uninstalled',
      resource_type: 'agent',
      resource_id: installation.agent_id,
      details: {
        agent_name: installation.agent?.name,
      },
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    });

    return NextResponse.json({
      success: true,
      message: '智能体已卸载',
    });
  } catch (error) {
    console.error('卸载智能体API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '内部服务器错误' },
      { status: 500 }
    );
  }
}
