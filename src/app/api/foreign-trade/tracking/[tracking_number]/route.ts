// 物流跟踪API路由处理器
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

interface RouteParams {
  params: Promise<{ tracking_number: string }>;
}

// GET /api/foreign-trade/tracking/[tracking_number] - 获取物流跟踪信息
export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { tracking_number } = await params;

    // 查询发货单及其相关信息
    const { data: shipment, error: shipmentError } = await supabase
      .from('foreign_trade_shipments')
      .select(
        `
        *,
        order:foreign_trade_orders(
          id,
          order_number,
          type,
          product_details,
          amount,
          currency
        ),
        partner:foreign_trade_partners(
          name,
          country,
          contact_person,
          email,
          phone
        )
      `
      )
      .eq('tracking_number', tracking_number)
      .single();

    if (shipmentError) {
      if (shipmentError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '未找到对应的物流信息' },
          { status: 404 }
        );
      }
      throw new Error(shipmentError.message);
    }

    // 查询物流时间线
    const { data: timeline, error: timelineError } = await supabase
      .from('foreign_trade_shipment_timeline')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('timestamp', { ascending: true });

    if (timelineError) {
      throw new Error(timelineError.message);
    }

    // 查询相关文档
    const { data: documents, error: documentsError } = await supabase
      .from('foreign_trade_shipment_documents')
      .select('*')
      .eq('shipment_id', shipment.id);

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    // 计算运输进度
    const progress = calculateShippingProgress(shipment.status);

    // 整合响应数据
    const response = {
      success: true,
      data: {
        shipment: {
          ...shipment,
          progress,
        },
        timeline: timeline || [],
        documents: documents || [],
        estimated_delivery_days: calculateEstimatedDays(
          shipment.planned_departure,
          shipment.estimated_arrival
        ),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取物流跟踪信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取物流跟踪信息失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST /api/foreign-trade/tracking - 创建物流跟踪记录
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();
    const { shipment_id, status, location, description, coordinates } = body;

    // 验证必需字段
    if (!shipment_id || !status || !location || !description) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需字段',
          message: '发货单ID、状态、位置和描述为必填项',
        },
        { status: 400 }
      );
    }

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

    // 验证发货单是否存在
    const { data: shipment } = await supabase
      .from('foreign_trade_shipments')
      .select('id, status, tracking_number')
      .eq('id', shipment_id)
      .single();

    if (!shipment) {
      return NextResponse.json(
        {
          success: false,
          error: '发货单不存在',
        },
        { status: 404 }
      );
    }

    // 插入时间线记录
    const { data, error } = await supabase
      .from('foreign_trade_shipment_timeline')
      .insert({
        shipment_id,
        status,
        location,
        description,
        coordinates: coordinates || null,
        timestamp: new Date().toISOString(),
        created_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 如果状态发生变化，更新发货单状态
    if (status !== shipment.status) {
      await supabase
        .from('foreign_trade_shipments')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...((status === 'in_transit' && !shipment.actual_departure
             ({ actual_departure: new Date().toISOString() } as any)
            : {}) as any),
          ...(status === 'delivered' && !shipment.actual_arrival
             { actual_arrival: new Date().toISOString() }
            : {}),
        })
        .eq('id', shipment_id);
    }

    // 记录操作日志
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'ADD_TRACKING_RECORD',
      table_name: 'foreign_trade_shipment_timeline',
      record_id: data.id,
      details: {
        tracking_number: shipment.tracking_number,
        status,
        location,
      } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: '物流跟踪记录添加成功',
    });
  } catch (error) {
    console.error('创建物流跟踪记录错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建物流跟踪记录失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/foreign-trade/tracking/[tracking_number] - 批量更新物流状态
export async function PUT(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { tracking_number } = await params;
    const body = await request.json();
    const {
      status,
      location,
      description,
      coordinates,
      actual_departure,
      actual_arrival,
    } = body;

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

    // 查找对应的发货单
    const { data: shipment } = await supabase
      .from('foreign_trade_shipments')
      .select('id')
      .eq('tracking_number', tracking_number)
      .single();

    if (!shipment) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到对应的发货单',
        },
        { status: 404 }
      );
    }

    // 更新发货单状态
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (actual_departure) updateData.actual_departure = actual_departure;
    if (actual_arrival) updateData.actual_arrival = actual_arrival;

    const { error: updateError } = await supabase
      .from('foreign_trade_shipments')
      .update(updateData)
      .eq('id', shipment.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 添加时间线记录（如果有状态更新）
    if (status && location && description) {
      await supabase.from('foreign_trade_shipment_timeline').insert({
        shipment_id: shipment.id,
        status,
        location,
        description,
        coordinates: coordinates || null,
        timestamp: new Date().toISOString(),
        created_by: user.id,
      } as any);
    }

    // 记录操作日志
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_SHIPMENT_TRACKING',
      table_name: 'foreign_trade_shipments',
      record_id: shipment.id,
      details: { tracking_number, status } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      message: '物流跟踪信息更新成功',
    });
  } catch (error) {
    console.error('更新物流跟踪信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新物流跟踪信息失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/foreign-trade/tracking/[tracking_number] - 删除物流跟踪记录
export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { tracking_number } = await params;

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

    // 查找对应的发货单
    const { data: shipment } = await supabase
      .from('foreign_trade_shipments')
      .select('id')
      .eq('tracking_number', tracking_number)
      .single();

    if (!shipment) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到对应的发货单',
        },
        { status: 404 }
      );
    }

    // 删除相关的时间线记录
    await supabase
      .from('foreign_trade_shipment_timeline')
      .delete()
      .eq('shipment_id', shipment.id);

    // 删除相关的文档记录
    await supabase
      .from('foreign_trade_shipment_documents')
      .delete()
      .eq('shipment_id', shipment.id);

    // 记录操作日志
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'DELETE_SHIPMENT_TRACKING',
      table_name: 'foreign_trade_shipments',
      record_id: shipment.id,
      details: { tracking_number } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      message: '物流跟踪记录删除成功',
    });
  } catch (error) {
    console.error('删除物流跟踪记录错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除物流跟踪记录失败',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 计算运输进度百分比
function calculateShippingProgress(status: string): number {
  const progressMap: Record<string, number> = {
    pending: 10,
    confirmed: 20,
    in_transit: 60,
    customs: 80,
    delivered: 100,
    delayed: 40,
  };
  return progressMap[status] || 0;
}

// 计算预计运输天数
function calculateEstimatedDays(
  plannedDeparture: string,
  estimatedArrival: string
): number {
  const departure = new Date(plannedDeparture);
  const arrival = new Date(estimatedArrival);
  const diffTime = arrival.getTime() - departure.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
