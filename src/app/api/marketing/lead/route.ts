import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role,
      name,
      company,
      email,
      phone,
      useCase,
      source,
      utmSource,
      utmMedium,
      utmCampaign
    } = body;

    // 参数验证
    if (!email || !name) {
      return NextResponse.json(
        { error: '姓名和邮箱为必填项' },
        { status: 400 }
      );
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 检查是否已存在相同邮箱的线索
    const { data: existingLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('检查重复线索失败:', checkError);
    } else if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json(
        { 
          error: '该邮箱已经提交过申请，请勿重复提交',
          existing: true
        },
        { status: 409 }
      );
    }

    // 插入线索数据
    const { data, error } = await supabase
      .from('leads')
      .insert({
        role: role || 'other',
        name,
        company: company || null,
        email,
        phone: phone || null,
        use_case: useCase || null,
        source: source || 'landing_page',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        status: 'new'
      } as any)
      .select();

    if (error) {
      console.error('插入线索失败:', error);
      return NextResponse.json(
        { error: '提交失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 触发n8n工作流
    const n8nIntegration = await import('@/lib/n8n-integration');
    await n8nIntegration.processLead(data[0]);

    // 记录成功事件
    await trackMarketingEvent('lead_submit', {
      role: role || 'other',
      source: source || 'landing_page',
      utm_source: utmSource
    });

    return NextResponse.json({
      success: true,
      message: '感谢您的关注！我们会尽快联系您。',
      leadId: data[0].id
    });

  } catch (error) {
    console.error('处理线索提交错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'new';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 构建查询
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    // 分页
    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询线索失败:', error);
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('处理线索查询错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}



async function trackMarketingEvent(
  eventType: string, 
  properties: Record<string, any> = {}
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('marketing_events')
      .insert({
        event_type: eventType,
        role: properties.role,
        source: properties.source,
        utm_source: properties.utm_source,
        created_at: new Date().toISOString()
      } as any);

    if (error) {
      console.error('记录营销事件失败:', error);
    }
  } catch (error) {
    console.error('记录营销事件异常:', error);
  }
}