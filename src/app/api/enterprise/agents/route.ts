import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '身份验证失败' },
        { status: 401 }
      );
    }

    // 获取企业用户信息
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '非企业用户' },
        { status: 403 }
      );
    }

    // 查询该企业的智能体列表
    const { data: agents, error: agentsError } = await supabase
      .from('enterprise_agents')
      .select(`
        id,
        name,
        description,
        status,
        version,
        deployment_date,
        last_used,
        usage_count,
        configuration
      `)
      .eq('enterprise_id', enterpriseUser.id)
      .order('created_at', { ascending: false });

    if (agentsError) {
      console.error('获取智能体列表失败:', agentsError);
      return NextResponse.json(
        { success: false, error: '获取智能体列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || []
    });

  } catch (error: any) {
    console.error('获取智能体列表错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, configuration } = body;

    // 参数验证
    if (!name || !configuration) {
      return NextResponse.json(
        { success: false, error: '请提供智能体名称和配置信息' },
        { status: 400 }
      );
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '身份验证失败' },
        { status: 401 }
      );
    }

    // 获取企业用户信息
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '非企业用户' },
        { status: 403 }
      );
    }

    // 创建智能体
    const { data: agent, error: createError } = await supabase
      .from('enterprise_agents')
      .insert({
        enterprise_id: enterpriseUser.id,
        name,
        description: description || '',
        configuration,
        status: 'active',
        version: '1.0.0'
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('创建智能体失败:', createError);
      return NextResponse.json(
        { success: false, error: '创建智能体失败' },
        { status: 500 }
      );
    }

    // 记录操作日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_agent',
      resource_type: 'enterprise_agent',
      resource_id: agent.id,
      details: {
        agent_name: name,
        enterprise_id: enterpriseUser.id
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: '智能体创建成功',
      data: agent
    }, { status: 201 });

  } catch (error: any) {
    console.error('创建智能体错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}