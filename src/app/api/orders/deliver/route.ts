/**
 * 手动触发订单交付 API
 *
 * POST /api/orders/deliver - 手动触发交付（用于修复或测试）
 * GET /api/orders/pending - 获取待交付订单列表
 */

import { OrderDeliveryService } from '@/services/orders/order-delivery.service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：获取待交付订单列表
 */
export async function GET() {
  try {
    const { data: pendingOrders, error } = await supabase
      .from('agent_orders')
      .select(
        `
        id,
        user_id,
        agent_id,
        agent_name,
        license_type,
        total_amount,
        status,
        payment_status,
        is_delivered,
        created_at,
        profiles (
          email,
          full_name
        )
      `
      )
      .eq('status', 'completed')
      .eq('payment_status', 'paid')
      .eq('is_delivered', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: pendingOrders || [],
      count: pendingOrders?.length || 0,
    });
  } catch (error) {
    console.error('获取待交付订单失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：手动触发订单交付
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, batchMode = false } = body;

    if (batchMode) {
      // 批量处理所有待交付订单
      const result = await OrderDeliveryService.processPendingOrders();

      return NextResponse.json({
        success: true,
        message: `批量处理完成，共 ${result.total} 个订单，成功 ${result.success} 个，失败 ${result.failed} 个`,
        data: result,
      });
    } else {
      // 处理单个订单
      if (!orderId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ORDER_ID',
              message: '请提供订单 ID',
            },
          },
          { status: 400 }
        );
      }

      const deliveryResult = await OrderDeliveryService.processOrder(orderId);

      if (deliveryResult.success) {
        return NextResponse.json({
          success: true,
          message: '订单交付成功',
          data: deliveryResult,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DELIVERY_FAILED',
              message: '订单交付失败',
              details: deliveryResult.errors,
            },
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('手动触发交付失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELIVERY_ERROR',
          message: error instanceof Error ? error.message : '操作失败',
        },
      },
      { status: 500 }
    );
  }
}
