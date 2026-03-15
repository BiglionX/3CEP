import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鏅鸿兘浣撴敞鍐屼俊鎭帴interface AgentRegistration {
  id: string;
  name: string;
  domain: string;
  type: 'n8n' | 'service';
  endpoint: string;
  version: string;
  description: string;
  metadata: {
    latency_sensitive: boolean;
    security_level: 'low' | 'medium' | 'high';
    traffic_level: 'low' | 'medium' | 'high';
    status_complexity: 'low' | 'medium' | 'high';
  };
  health_check_endpoint: string;
  supported_operations: string[];
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/agents/registry
 * 鑾峰彇鎵€鏈夊凡娉ㄥ唽鐨勬櫤鑳戒綋
 */
export async function GET(request: NextRequest) {
  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妫€鏌ユ潈    const userRoles = session.user_metadata.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('agent_operator')) {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 鏌ヨ鏅鸿兘浣撴敞鍐屼俊    const { data: agents, error } = await supabase
      .from('agent_registry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('鏌ヨ鏅鸿兘浣撴敞鍐屼俊鎭け', error);
      return NextResponse.json(
        { error: '鑾峰彇鏅鸿兘浣撳垪琛ㄥけ },'
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('鏅鸿兘浣撴敞鍐孉PI閿欒:', error);
    return NextResponse.json(
      { error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊 },'
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/registry
 * 娉ㄥ唽鏂版櫤鑳戒綋
 */
export async function POST(request: NextRequest) {
  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const userRoles = session.user_metadata.roles || [];
    if (!userRoles.includes('admin')) {
      return NextResponse.json(
        { error: '鍙湁绠＄悊鍛樺彲ユ敞鍐屾櫤鑳戒綋' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const registrationData: AgentRegistration = {
      name: body.name,
      domain: body.domain,
      type: body.type,
      endpoint: body.endpoint,
      version: body.version,
      description: body.description,
      metadata: {
        latency_sensitive: body.latency_sensitive || false,
        security_level: body.security_level || 'medium',
        traffic_level: body.traffic_level || 'medium',
        status_complexity: body.status_complexity || 'medium',
      },
      health_check_endpoint: body.health_check_endpoint,
      supported_operations: body.supported_operations || [],
    };

    // 楠岃瘉蹇呭～瀛楁
    if (
      !registrationData.name ||
      !registrationData.domain ||
      !registrationData.endpoint
    ) {
      return NextResponse.json(
        { error: '缂哄皯蹇呭～瀛楁: name, domain, endpoint' },
        { status: 400 }
      );
    }

    // 妫€鏌ユ櫤鑳戒綋鍚嶇О鏄惁宸插    const { data: existingAgent } = await supabase
      .from('agent_registry')
      .select('id')
      .eq('name', registrationData.name)
      .single();

    if (existingAgent) {
      return NextResponse.json({ error: '鏅鸿兘浣撳悕绉板凡瀛樺湪' }, { status: 409 });
    }

    // 鎻掑叆鏂版櫤鑳戒綋娉ㄥ唽淇℃伅
    const { data: newAgent, error } = await supabase
      .from('agent_registry')
      .insert(registrationData)
      .select()
      .single();

    if (error) {
      console.error('鎻掑叆鏅鸿兘浣撴敞鍐屼俊鎭け', error);
      return NextResponse.json({ error: '娉ㄥ唽鏅鸿兘浣撳け }, { status: 500 });
    }

    // 璁板綍瀹¤ュ織
    (await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'agent_registered',
      resource_type: 'agent',
      resource_id: newAgent.id,
      details: {
        agent_name: newAgent.name,
        domain: newAgent.domain,
        type: newAgent.type,
      } as any,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    })) as any;

    return NextResponse.json(
      {
        success: true,
        data: newAgent,
        message: '鏅鸿兘浣撴敞鍐屾垚,'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('鏅鸿兘浣撴敞鍐岄敊', error);
    return NextResponse.json(
      { error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊 },'
      { status: 500 }
    );
  }
}


