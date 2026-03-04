// 订单详情API路由处理器
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/foreign-trade/orders/[id] - 获取订单详情
export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { id } = await params;

    // 查询订单详情及相关信息
    const { data, error } = await supabase
      .from('foreign_trade_orders')
      .select(
        `
        *,
        partner:foreign_trade_partners(
          id,
          name,
          country,
          contact_person,
          email,
          phone,
          website,
          rating,
          cooperation_years
        ),
        created_by_user:users(id, email, full_name),
        order_timeline:foreign_trade_order_timeline(*),
        order_documents:foreign_trade_order_documents(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '订单不存在' },
          { status: 404 }
        );
      }
      throw new Error(error.message);
    }

    // 获取物流信息
    const { data: logistics } = await supabase
      .from('foreign_trade_shipments')
      .select('*')
      .eq('order_id', id)
      .single();

    // 获取合同信息
    const { data: contract } = await supabase
      .from('foreign_trade_contracts')
      .select('*')
      .eq('contract_number', data.contract_number)
      .single();

    const response = {
      success: true,
      data: {
        ...data,
        logistics: logistics || null,
        contract: contract || null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取订单详情错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取订单详情失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/foreign-trade/orders/[id] - 更新订单
export async function PUT(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, expected_delivery, actual_delivery } = body;

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 更新订单
    const { data, error } = await supabase
      .from('foreign_trade_orders')
      .update({
        status,
        notes,
        expected_delivery,
        actual_delivery,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 记录状态变更历史
    if (status) {
      (await supabase.from('foreign_trade_order_timeline').insert({
        order_id: id,
        status,
        description: `订单状态更新为: ${status} as any`,
        location: '系统自动',
        created_by: user.id,
      })) as any;
    }

    // 记录操作日志
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_ORDER',
      table_name: 'foreign_trade_orders',
      record_id: id,
      details: { status, notes } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: '订单更新成功',
    });
  } catch (error) {
    console.error('更新订单错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新订单失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/foreign-trade/orders/[id] - 删除订单
export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { id } = await params;

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 检查订单状态，只有待处理的订单才能删除
    const { data: order } = await supabase
      .from('foreign_trade_orders')
      .select('status, order_number')
      .eq('id', id)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: '无法删除',
          message: '只有待处理状态的订单才能删除',
        },
        { status: 400 }
      );
    }

    // 删除相关数据
    await supabase
      .from('foreign_trade_order_timeline')
      .delete()
      .eq('order_id', id);
    await supabase
      .from('foreign_trade_order_documents')
      .delete()
      .eq('order_id', id);

    // 删除订单
    const { error } = await supabase
      .from('foreign_trade_orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    // 记录操作日志
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'DELETE_ORDER',
      table_name: 'foreign_trade_orders',
      record_id: id,
      details: { order_number: order.order_number } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      message: '订单删除成功',
    });
  } catch (error) {
    console.error('删除订单错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除订单失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
