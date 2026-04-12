/**
 * 销售订单API - 列表和创建
 * GET /api/admin/orders - 获取订单列表
 * POST /api/admin/orders - 创建新订单
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
 * GET /api/admin/orders - 获取销售订单列表
 */
export async function GET(request: NextRequest) {
  try {
    // 认证
    const { user, error: authError } = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, authError || '未授权'),
        { status: 401 }
      );
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const search = searchParams.get('search') || undefined;

    const offset = (page - 1) * pageSize;

    // 构建查询
    let query = supabase.from('sales_orders').select(
      `
        *,
        sales_customers (
          id,
          customer_name,
          contact_person,
          phone
        )
      `,
      { count: 'exact' }
    );

    // 应用筛选条件
    if (status) {
      query = query.eq('status', status);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    if (search) {
      query = query.or(`order_number.ilike.%${search}%`);
    }

    // 分页和排序
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      successResponse({
        orders: data || [],
        total: count || 0,
        page,
        pageSize,
      })
    );
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        '获取订单列表失败',
        error.message
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/orders - 创建新销售订单
 */
export async function POST(request: NextRequest) {
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
        errorResponse(ErrorCodes.FORBIDDEN, '没有创建订单的权限'),
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();

    // 验证必填字段
    if (
      !body.customerId ||
      !body.items ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          '缺少必填字段: customerId, items'
        ),
        { status: 400 }
      );
    }

    // 生成订单号
    const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 计算总金额
    const totalAmount = body.items.reduce((sum: number, item: any) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    // 创建订单
    const { data, error } = await supabase
      .from('sales_orders')
      .insert({
        order_number: orderNumber,
        customer_id: body.customerId,
        contract_id: body.contractId,
        items: body.items,
        total_amount: totalAmount,
        paid_amount: body.paidAmount || 0,
        status: body.status || 'pending',
        shipping_address: body.shippingAddress,
        expected_delivery_date: body.expectedDeliveryDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // TODO: 如果订单包含商品,需要扣减库存
    // 这里应该调用库存服务进行库存扣减

    return NextResponse.json(successResponse(data, '订单创建成功'), {
      status: 201,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, '创建订单失败', error.message),
      { status: 500 }
    );
  }
}
