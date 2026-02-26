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

    // 查询该企业的采购订单
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('enterprise_procurement_orders')
      .select(`
        id,
        title,
        status,
        supplier,
        amount,
        items,
        created_at,
        expected_delivery,
        priority,
        description
      `)
      .eq('enterprise_id', enterpriseUser.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('获取采购订单失败:', ordersError);
      return NextResponse.json(
        { success: false, error: '获取采购订单失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || []
    });

  } catch (error: any) {
    console.error('获取采购订单错误:', error);
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
    const { title, description, items, expected_delivery, priority, supplier } = body;

    // 参数验证
    if (!title) {
      return NextResponse.json(
        { success: false, error: '请提供采购订单标题' },
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

    // 创建采购订单
    const { data: order, error: createError } = await supabase
      .from('enterprise_procurement_orders')
      .insert({
        enterprise_id: enterpriseUser.id,
        title,
        description: description || '',
        items: items || 1,
        expected_delivery: expected_delivery || null,
        priority: priority || 'medium',
        supplier: supplier || '待确定',
        status: 'pending',
        amount: 0 // 初始金额为0，待报价后更新
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('创建采购订单失败:', createError);
      return NextResponse.json(
        { success: false, error: '创建采购订单失败' },
        { status: 500 }
      );
    }

    // 记录操作日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_procurement_order',
      resource_type: 'enterprise_procurement_order',
      resource_id: order.id,
      details: {
        order_title: title,
        enterprise_id: enterpriseUser.id
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: '采购订单创建成功',
      data: order
    }, { status: 201 });

  } catch (error: any) {
    console.error('创建采购订单错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}