import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '鏈巿鏉冭? },
        { status: 401 }
      );
    }

    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '韬唤楠岃瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇浼佷笟鐢ㄦ埛淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '闈炰紒涓氱敤? },
        { status: 403 }
      );
    }

    // 鏌ヨ璇ヤ紒涓氱殑鏅鸿兘浣撳垪?    const { data: agents, error: agentsError } = await supabase
      .from('enterprise_agents')
      .select(
        `
        id,
        name,
        description,
        status,
        version,
        deployment_date,
        last_used,
        usage_count,
        configuration
      `
      )
      .eq('enterprise_id', enterpriseUser.id)
      .order('created_at', { ascending: false });

    if (agentsError) {
      console.error('鑾峰彇鏅鸿兘浣撳垪琛ㄥけ?', agentsError);
      return NextResponse.json(
        { success: false, error: '鑾峰彇鏅鸿兘浣撳垪琛ㄥけ? },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
    });
  } catch (error: any) {
    console.error('鑾峰彇鏅鸿兘浣撳垪琛ㄩ敊?', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
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
        { success: false, error: '鏈巿鏉冭? },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, configuration } = body;

    // 鍙傛暟楠岃瘉
    if (!name || !configuration) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涙櫤鑳戒綋鍚嶇О鍜岄厤缃俊? },
        { status: 400 }
      );
    }

    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '韬唤楠岃瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇浼佷笟鐢ㄦ埛淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '闈炰紒涓氱敤? },
        { status: 403 }
      );
    }

    // 鍒涘缓鏅鸿兘?    const { data: agent, error: createError } = await supabase
      .from('enterprise_agents')
      .insert({
        enterprise_id: enterpriseUser.id,
        name,
        description: description || '',
        configuration,
        status: 'active',
        version: '1.0.0',
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('鍒涘缓鏅鸿兘浣撳け?', createError);
      return NextResponse.json(
        { success: false, error: '鍒涘缓鏅鸿兘浣撳け? },
        { status: 500 }
      );
    }

    // 璁板綍鎿嶄綔鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_agent',
      resource_type: 'enterprise_agent',
      resource_id: agent.id,
      details: {
        agent_name: name,
        enterprise_id: enterpriseUser.id,
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })) as any;

    return NextResponse.json(
      {
        success: true,
        message: '鏅鸿兘浣撳垱寤烘垚?,
        data: agent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('鍒涘缓鏅鸿兘浣撻敊?', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

