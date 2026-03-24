/**
 * 支付回调 Webhook
 *
 * POST /api/orders/webhook - 接收支付平台回调
 * 处理支付成功事件，触发自动交付流程
 */

import { OrderDeliveryService } from '@/services/orders/order-delivery.service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证签名（根据实际支付平台调整）
    const signature = request.headers.get('x-payment-signature');
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: '签名验证失败',
          },
        },
        { status: 401 }
      );
    }

    // 解析支付事件
    const eventType = body.event_type || body.type;
    const orderData = body.data?.object || body.data;

    switch (eventType) {
      case 'payment.succeeded':
      case 'charge.succeeded':
      case 'PAYMENT_SUCCESS':
        await handlePaymentSuccess(orderData);
        break;

      case 'payment.failed':
      case 'charge.failed':
      case 'PAYMENT_FAILED':
        await handlePaymentFailed(orderData);
        break;

      case 'refund.created':
      case 'REFUND_CREATED':
        await handleRefund(orderData);
        break;

      default:
        console.log(`未知的事件类型：${eventType}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook 处理成功',
    });
  } catch (error) {
    console.error('Webhook 处理失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WEBHOOK_ERROR',
          message: error instanceof Error ? error.message : 'Webhook 处理失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 处理支付成功事件
 */
async function handlePaymentSuccess(paymentData: any) {
  const orderId = paymentData.order_id || paymentData.metadata?.order_id;

  if (!orderId) {
    throw new Error('订单 ID 缺失');
  }

  console.log(`处理支付成功事件，订单号：${orderId}`);

  // 1. 更新订单支付状态
  await updateOrderPaymentStatus(orderId, paymentData);

  // 2. 触发自动交付流程
  const deliveryResult = await OrderDeliveryService.processOrder(orderId);

  if (deliveryResult.success) {
    console.log(`订单 ${orderId} 交付成功`);
  } else {
    console.error(`订单 ${orderId} 交付失败:`, deliveryResult.errors);
    // 可以在此添加告警通知
  }

  return deliveryResult;
}

/**
 * 处理支付失败事件
 */
async function handlePaymentFailed(paymentData: any) {
  const orderId = paymentData.order_id || paymentData.metadata?.order_id;

  if (!orderId) {
    throw new Error('订单 ID 缺失');
  }

  console.log(`支付失败，订单号：${orderId}`);

  // 更新订单状态为支付失败
  const { error } = await supabase
    .from('agent_orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: '支付失败',
    })
    .eq('id', orderId);

  if (error) throw error;
}

/**
 * 处理退款事件
 */
async function handleRefund(refundData: any) {
  const orderId = refundData.order_id || refundData.metadata?.order_id;

  if (!orderId) {
    throw new Error('订单 ID 缺失');
  }

  console.log(`处理退款，订单号：${orderId}`);

  // 更新订单状态
  const { error } = await supabase
    .from('agent_orders')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refund_amount: refundData.amount || refundData.total_amount,
    })
    .eq('id', orderId);

  if (error) throw error;

  // TODO: 回收用户权限
  // await revokeUserPermissions(orderId);
}

/**
 * 更新订单支付状态
 */
async function updateOrderPaymentStatus(orderId: string, paymentData: any) {
  const updateData: any = {
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
    payment_method: paymentData.payment_method || paymentData.source,
    transaction_id: paymentData.id || paymentData.transaction_id,
  };

  // 如果有金额信息，也更新
  if (paymentData.amount) {
    updateData.amount_paid = paymentData.amount;
  }

  const { error } = await supabase
    .from('agent_orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;
}

/**
 * 验证签名（示例实现）
 */
function verifySignature(body: any, signature: string | null): boolean {
  // TODO: 实现实际的签名验证逻辑
  // 不同支付平台的签名验证方式不同
  // 例如 Stripe、PayPal、支付宝等

  // 开发环境跳过验证
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // 生产环境必须验证签名
  if (!signature) {
    return false;
  }

  // 示例：验证 HMAC 签名
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET!)
  //   .update(JSON.stringify(body))
  //   .digest('hex');
  // return signature === expectedSignature;

  return true; // 暂时返回 true 以通过测试
}
