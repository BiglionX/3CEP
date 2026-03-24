/**
 * 智能体订阅续费 API
 *
 * POST /api/agents/[id]/renew
 * 为智能体订阅续费
 */

import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  handleSupabaseError,
} from '@/lib/api/error-handler';
import {
  authenticateAndGetUser,
  PermissionValidator,
} from '@/lib/auth/permissions';
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 续费套餐类型
 */
export interface RenewalPackage {
  period: 'monthly' | 'quarterly' | 'yearly';
  months: number;
  discount: number; // 折扣率，0.9 表示 9 折
  price: number; // 价格（分）
}

/**
 * 续费套餐配置
 */
const RENEWAL_PACKAGES: Record<string, RenewalPackage> = {
  monthly: {
    period: 'monthly',
    months: 1,
    discount: 1.0,
    price: 2500, // ¥25/月
  },
  quarterly: {
    period: 'quarterly',
    months: 3,
    discount: 0.9, // 9 折优惠
    price: 6750, // ¥67.5/季（原价¥75）
  },
  yearly: {
    period: 'yearly',
    months: 12,
    discount: 0.83, // 约 83 折优惠
    price: 25000, // ¥250/年（原价¥300）
  },
};

/**
 * POST /api/agents/[id]/renew
 * 续费智能体订阅
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.url;
  const requestId = crypto.randomUUID();
  const agentId = params.id;

  try {
    // 步骤 1: 验证用户认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any
    );

    if (authResult.error || !authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error || '用户认证失败',
      });
    }

    const user = authResult.user;

    // 步骤 3: 验证订阅所有者权限
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validator = new PermissionValidator(supabase as any);

    // 检查是否为订阅用户（通过 user_agent_installations 表）
    const { data: subscriptionCheck } = await supabase
      .from('user_agent_installations')
      .select('user_id')
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!subscriptionCheck && user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限为此订阅续费，仅订阅所有者或管理员可操作',
      });
    }

    // 步骤 4: 解析请求体
    const body = await request.json();
    const { period, paymentMethod } = body;

    // 验证必填字段
    if (!period || !['monthly', 'quarterly', 'yearly'].includes(period)) {
      return createErrorResponse(ErrorCode.INVALID_REQUEST, {
        path,
        requestId,
        message: '请选择正确的续费套餐',
        details: {
          validPeriods: ['monthly', 'quarterly', 'yearly'],
        },
      });
    }

    // 检查智能体是否存在且属于当前用户
    const { data: installation, error: installError } = await supabase
      .from('user_agent_installations')
      .select(
        `
        *,
        agents (
          id,
          name,
          pricing
        )
      `
      )
      .eq('user_id', user.id) // 使用认证用户的 ID
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single();

    if (installError || !installation) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '未找到有效的订阅记录',
      });
    }

    // 获取续费套餐信息
    const renewalPackage = RENEWAL_PACKAGES[period];
    if (!renewalPackage) {
      return createErrorResponse(ErrorCode.INVALID_REQUEST, {
        path,
        requestId,
        message: '无效的续费套餐',
      });
    }

    // 计算续费价格
    const originalPrice =
      period === 'yearly'
        ? installation.yearly_price || 30000
        : installation.monthly_price! * renewalPackage.months;

    const finalPrice = Math.round(originalPrice * renewalPackage.discount);

    // 创建续费订单
    const orderNumber = `RN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const { data: order, error: orderError } = await supabase
      .from('agent_orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id, // 使用认证用户的 ID
        agent_id: agentId,
        product_name: `${installation.agents.name} - 订阅续费`,
        product_type: 'subscription_renewal',
        amount: finalPrice,
        original_amount: originalPrice,
        discount: renewalPackage.discount,
        status: 'pending_payment',
        payment_method: paymentMethod || 'stripe',
        subscription_period: renewalPackage.period,
        subscription_months: renewalPackage.months,
        metadata: {
          renewalType: 'subscription',
          previousExpiryDate: installation.expiry_date,
          packageDiscount: renewalPackage.discount,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error('创建续费订单失败:', orderError);
      return handleSupabaseError(orderError, { path, requestId });
    }

    // TODO: 集成支付流程
    // 这里可以调用支付网关（Stripe、支付宝、微信支付等）
    // 示例：创建支付会话
    let paymentUrl: string | null = null;

    if (paymentMethod === 'stripe') {
      try {
        const stripeSession = await createStripePaymentSession(
          order.order_number,
          finalPrice,
          session.user.email
        );
        paymentUrl = stripeSession.url;
      } catch (error) {
        console.error('创建 Stripe 支付会话失败:', error);
        // 支付集成失败不影响订单创建，记录日志即可
      }
    }

    // 返回续费订单信息
    return createSuccessResponse(
      {
        order: {
          id: order.id,
          orderNumber: order.order_number,
          productName: order.product_name,
          amount: finalPrice,
          originalAmount: originalPrice,
          discount: renewalPackage.discount,
          currency: 'CNY',
          status: order.status,
          paymentMethod: order.payment_method,
          subscriptionPeriod: renewalPackage.period,
          subscriptionMonths: renewalPackage.months,
          createdAt: order.created_at,
        },
        payment: {
          paymentUrl,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 分钟后过期
        },
        renewalInfo: {
          currentExpiryDate: installation.expiry_date,
          newExpiryDate: calculateNewExpiryDate(
            installation.expiry_date,
            renewalPackage.months
          ),
          extensionMonths: renewalPackage.months,
        },
      },
      {
        message: '续费订单创建成功，请完成支付',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('续费 API 错误:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * GET /api/agents/[id]/renew
 * 获取可用的续费套餐
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const path = request.url;
  const requestId = crypto.randomUUID();

  try {
    // 步骤 1: 验证用户认证
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase as any
    );

    if (authResult.error || !authResult.user) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error || '用户认证失败',
      });
    }

    const user = authResult.user;

    // 步骤 3: 验证订阅所有者权限
    const { data: subscriptionCheck } = await supabase
      .from('user_agent_installations')
      .select('user_id')
      .eq('agent_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!subscriptionCheck && user.role !== 'admin') {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限查看此订阅的续费选项',
      });
    }

    // 步骤 4: 检查订阅状态
    const { data: installation } = await supabase
      .from('user_agent_installations')
      .select('*, expiry_date, monthly_price, yearly_price')
      .eq('user_id', user.id) // 使用认证用户的 ID
      .eq('agent_id', params.id)
      .eq('status', 'active')
      .single();

    if (!installation) {
      return createErrorResponse(ErrorCode.NOT_FOUND, {
        path,
        requestId,
        message: '未找到有效的订阅记录',
      });
    }

    // 计算各套餐的节省金额
    const packages = Object.values(RENEWAL_PACKAGES).map(pkg => {
      const basePrice =
        pkg.period === 'yearly'
          ? installation.yearly_price || 30000
          : installation.monthly_price! * pkg.months;

      const finalPrice = Math.round(basePrice * pkg.discount);
      const savings = basePrice - finalPrice;

      return {
        period: pkg.period,
        months: pkg.months,
        originalPrice: basePrice,
        finalPrice,
        savings,
        discount: pkg.discount,
        description: getPackageDescription(pkg.period),
        recommended: pkg.period === 'yearly', // 推荐年付套餐
      };
    });

    return createSuccessResponse(
      {
        agentId: params.id,
        currentSubscription: {
          expiryDate: installation.expiry_date,
          isExpiringSoon: isExpiringSoon(installation.expiry_date),
          daysUntilExpiry: getDaysUntilExpiry(installation.expiry_date),
        },
        packages,
      },
      {
        message: '获取续费套餐成功',
        path,
        requestId,
      }
    );
  } catch (error: unknown) {
    console.error('获取续费套餐失败:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}

/**
 * 创建 Stripe 支付会话（示例）
 */
async function createStripePaymentSession(
  orderNumber: string,
  amount: number,
  userEmail?: string | null
): Promise<{ url: string }> {
  // 实际应用中需要集成 Stripe SDK
  // 这里仅作为示例，使用超时控制的 fetch 调用
  const stripeApiUrl = 'https://api.stripe.com/v1/checkout/sessions';

  try {
    const params = new URLSearchParams();
    params.append(
      'line_items',
      JSON.stringify([
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: `智能体订阅续费 - ${orderNumber}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ])
    );
    params.append('mode', 'payment');
    params.append(
      'success_url',
      `${process.env.NEXT_PUBLIC_APP_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`
    );
    params.append(
      'cancel_url',
      `${process.env.NEXT_PUBLIC_APP_URL}/orders/cancel`
    );
    params.append('customer_email', userEmail || '');
    params.append('metadata[order_number]', orderNumber);

    const response = await fetchWithTimeout(stripeApiUrl, {
      timeout: 15000, // 15 秒超时
      retries: 2,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();

    return { url: session.url };
  } catch (error) {
    console.error('Stripe API 调用失败:', error);
    throw new Error('支付服务暂时不可用');
  }
}

/**
 * 计算新的到期日期
 */
function calculateNewExpiryDate(
  currentExpiryDate: string | null,
  months: number
): string {
  const baseDate = currentExpiryDate ? new Date(currentExpiryDate) : new Date();

  // 如果已过期，从今天开始计算；否则从到期日开始计算
  const startDate = baseDate.getTime() < Date.now() ? new Date() : baseDate;

  // 添加月份
  startDate.setMonth(startDate.getMonth() + months);

  return startDate.toISOString();
}

/**
 * 判断是否即将过期（7 天内）
 */
function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays <= 7 && diffDays > 0;
}

/**
 * 获取距离过期的天数
 */
function getDaysUntilExpiry(expiryDate: string | null): number {
  if (!expiryDate) return -1;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  return Math.ceil(diffDays);
}

/**
 * 获取套餐描述
 */
function getPackageDescription(period: string): string {
  const descriptions: Record<string, string> = {
    monthly: '灵活月度订阅，随时取消',
    quarterly: '季度优惠，节省 10%',
    yearly: '年度特惠，最佳性价比',
  };

  return descriptions[period] || '';
}
