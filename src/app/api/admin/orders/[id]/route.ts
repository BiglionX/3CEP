/**
 * 销售订单详情API
 * GET /api/admin/orders/[id] - 获取订单详情
 * PUT /api/admin/orders/[id] - 更新订单
 * DELETE /api/admin/orders/[id] - 删除/取消订单
 */

import { supabase } from '@/lib/supabase';
import { authenticateUser } from '@/modules/inventory-management/interface-adapters/api/middleware';
import {
  ErrorCodes,
  errorResponse,
  successResponse,
} from '@/modules/inventory-management/interface-adapters/api/response';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/orders/[id] - 获取订单详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证
    const { user, error: authError } = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, authError || '未授权'),
        { status: 401 }
      );
    }

    const orderId = params.id;

    // 查询订单详情
    const { data, error } = await supabase
      .from('sales_orders')
      .select(
        `
        *,
        sales_customers (
          id,
          customer_name,
          contact_person,
          phone,
          email
        ),
        sales_contracts (
          id,
          contract_number,
          contract_name
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, '订单不存在'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(data));
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        '获取订单详情失败',
        error.message
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/orders/[id] - 更新订单
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证
    const { user, error: authError } = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, authError || '未授权'),
        { status: 401 }
      );
    }

    // 权限检查
    if (!['admin', 'sales_manager'].includes(user.role || '')) {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, '没有更新订单的权限'),
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await request.json();

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 允许更新的字段
    const allowedFields = [
      'status',
      'paid_amount',
      'shipping_address',
      'tracking_number',
      'expected_delivery_date',
      'actual_delivery_date',
      'customer_feedback',
      'satisfaction_score',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // 如果状态变更为已发货,记录实际发货时间
    if (body.status === 'shipped' && !updateData.actual_delivery_date) {
      updateData.actual_delivery_date = new Date().toISOString().split('T')[0];
    }

    // 更新订单
    const { data, error } = await supabase
      .from('sales_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, '订单不存在'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(data, '订单更新成功'));
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '更新订单失败', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id] - 取消订单
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 认证
    const { user, error: authError } = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, authError || '未授权'),
        { status: 401 }
      );
    }

    // 权限检查
    if (!['admin', 'sales_manager'].includes(user.role || '')) {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, '没有取消订单的权限'),
        { status: 403 }
      );
    }

    const orderId = params.id;

    // 先查询订单当前状态
    const { data: order, error: fetchError } = await supabase
      .from('sales_orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, '订单不存在'),
        { status: 404 }
      );
    }

    // 已发货或已完成的订单不能取消
    if (['shipped', 'delivered', 'completed'].includes(order.status)) {
      return NextResponse.json(
        errorResponse(ErrorCodes.BAD_REQUEST, '已发货或已完成的订单不能取消'),
        { status: 400 }
      );
    }

    // 更新状态为已取消
    const { data, error } = await supabase
      .from('sales_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO: 如果订单已扣减库存,需要恢复库存
    // 这里应该调用库存服务恢复库存

    return NextResponse.json(successResponse(data, '订单已取消'));
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '取消订单失败', error.message),
      { status: 500 }
    );
  }
}
