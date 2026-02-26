import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 智能体注册信息接口
interface AgentRegistration {
  id?: string;
  name: string;
  domain: string;
  type: 'n8n' | 'service';
  endpoint: string;
  version: string;
  description?: string;
  metadata: {
    latency_sensitive: boolean;
    security_level: 'low' | 'medium' | 'high';
    traffic_level: 'low' | 'medium' | 'high';
    status_complexity: 'low' | 'medium' | 'high';
  };
  health_check_endpoint?: string;
  supported_operations: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/agents/registry
 * 获取所有已注册的智能体
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 检查权限
    const userRoles = session.user?.user_metadata?.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('agent_operator')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 查询智能体注册信息
    const { data: agents, error } = await supabase
      .from('agent_registry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询智能体注册信息失败:', error);
      return NextResponse.json(
        { error: '获取智能体列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents,
      count: agents?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('智能体注册API错误:', error);
    return NextResponse.json(
      { error: error.message || '内部服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/registry
 * 注册新智能体
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userRoles = session.user?.user_metadata?.roles || [];
    if (!userRoles.includes('admin')) {
      return NextResponse.json(
        { error: '只有管理员可以注册智能体' },
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
        latency_sensitive: body.metadata?.latency_sensitive || false,
        security_level: body.metadata?.security_level || 'medium',
        traffic_level: body.metadata?.traffic_level || 'medium',
        status_complexity: body.metadata?.status_complexity || 'medium'
      },
      health_check_endpoint: body.health_check_endpoint,
      supported_operations: body.supported_operations || [],
    };

    // 验证必填字段
    if (!registrationData.name || !registrationData.domain || !registrationData.endpoint) {
      return NextResponse.json(
        { error: '缺少必填字段: name, domain, endpoint' },
        { status: 400 }
      );
    }

    // 检查智能体名称是否已存在
    const { data: existingAgent } = await supabase
      .from('agent_registry')
      .select('id')
      .eq('name', registrationData.name)
      .single();

    if (existingAgent) {
      return NextResponse.json(
        { error: '智能体名称已存在' },
        { status: 409 }
      );
    }

    // 插入新智能体注册信息
    const { data: newAgent, error } = await supabase
      .from('agent_registry')
      .insert(registrationData)
      .select()
      .single();

    if (error) {
      console.error('插入智能体注册信息失败:', error);
      return NextResponse.json(
        { error: '注册智能体失败' },
        { status: 500 }
      );
    }

    // 记录审计日志
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'agent_registered',
      resource_type: 'agent',
      resource_id: newAgent.id,
      details: {
        agent_name: newAgent.name,
        domain: newAgent.domain,
        type: newAgent.type
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: newAgent,
      message: '智能体注册成功'
    }, { status: 201 });

  } catch (error: any) {
    console.error('智能体注册错误:', error);
    return NextResponse.json(
      { error: error.message || '内部服务器错误' },
      { status: 500 }
    );
  }
}