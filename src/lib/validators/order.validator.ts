/**
 * 智能体订单验证器
 * 用于验证订单创建、更新、支付等操作
 */

import { z } from 'zod';

/**
 * 订单状态 Schema
 */
export const OrderStatusSchema = z.enum(
  [
    'pending',
    'paid',
    'activated',
    'cancelled',
    'refunded',
    'expired',
    'failed',
  ],
  {
    required_error: '请指定订单状态',
  }
);

/**
 * 支付方式 Schema
 */
export const PaymentMethodSchema = z.enum(
  ['stripe', 'alipay', 'wechat_pay', 'bank_transfer', 'balance'],
  {
    required_error: '请选择支付方式',
  }
);

/**
 * 订阅周期 Schema
 */
export const SubscriptionPeriodSchema = z.enum(
  ['monthly', 'yearly', 'lifetime'],
  {
    required_error: '请选择订阅周期',
  }
);

/**
 * 订单项 Schema
 */
export const OrderItemSchema = z.object({
  agent_id: z.string().uuid('agent_id 必须是有效的 UUID 格式'),
  agent_name: z.string().min(1, '商品名称不能为空'),
  quantity: z
    .number({
      invalid_type_error: '数量必须是数字',
    })
    .int('数量必须是整数')
    .positive('数量必须大于 0')
    .default(1),
  unit_price: z
    .number({
      invalid_type_error: '单价必须是数字',
    })
    .nonnegative('单价不能为负数'),
  original_price: z
    .number({
      invalid_type_error: '原价必须是数字',
    })
    .nonnegative('原价不能为负数')
    .optional(),
  discount: z
    .number({
      invalid_type_error: '折扣必须是数字',
    })
    .min(0, '折扣最小值为 0')
    .max(100, '折扣最大值为 100')
    .optional(),
});

/**
 * 订单金额 Schema
 */
export const OrderAmountSchema = z.object({
  subtotal: z
    .number({
      invalid_type_error: '小计必须是数字',
    })
    .nonnegative('小计不能为负数'),
  discount: z
    .number({
      invalid_type_error: '折扣金额必须是数字',
    })
    .nonnegative('折扣金额不能为负数')
    .default(0),
  tax: z
    .number({
      invalid_type_error: '税费必须是数字',
    })
    .nonnegative('税费不能为负数')
    .default(0),
  total: z
    .number({
      invalid_type_error: '总金额必须是数字',
    })
    .nonnegative('总金额不能为负数'),
  currency: z.enum(['CNY', 'USD']).default('CNY'),
});

/**
 * 创建订单请求 Schema
 */
export const CreateOrderRequestSchema = z.object({
  agent_id: z.string().uuid('agent_id 必须是有效的 UUID 格式'),
  period: SubscriptionPeriodSchema.optional(),
  payment_method: PaymentMethodSchema.optional(),
  items: z.array(OrderItemSchema).min(1, '订单至少需要包含一个商品').optional(),
  amount: OrderAmountSchema,
  coupon_code: z.string().max(50, '优惠券码长度不能超过 50 个字符').optional(),
  notes: z.string().max(500, '备注不能超过 500 个字符').optional(),
  user_id: z.string().uuid('user_id 必须是有效的 UUID 格式').optional(),
});

/**
 * 支付请求 Schema
 */
export const PaymentRequestSchema = z.object({
  order_id: z.string().uuid('order_id 必须是有效的 UUID 格式'),
  payment_method: PaymentMethodSchema,
  payment_token: z.string().min(1, '支付令牌不能为空').optional(),
  save_payment_method: z.boolean().default(false).optional(),
});

/**
 * 退款请求 Schema
 */
export const RefundRequestSchema = z.object({
  order_id: z.string().uuid('order_id 必须是有效的 UUID 格式'),
  refund_amount: z
    .number({
      invalid_type_error: '退款金额必须是数字',
    })
    .positive('退款金额必须大于 0'),
  reason: z
    .string()
    .min(1, '退款原因不能为空')
    .max(500, '原因不能超过 500 个字符'),
  refund_type: z.enum(['full', 'partial']).default('full'),
});

/**
 * 验证创建订单请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateCreateOrderRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = CreateOrderRequestSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code || 'invalid',
        })),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: error.message || '验证过程出错',
          code: 'validation_error',
        },
      ],
    };
  }
}

/**
 * 验证支付请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validatePaymentRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = PaymentRequestSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code || 'invalid',
        })),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: error.message || '验证过程出错',
          code: 'validation_error',
        },
      ],
    };
  }
}

/**
 * 验证退款请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateRefundRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = RefundRequestSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code || 'invalid',
        })),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: error.message || '验证过程出错',
          code: 'validation_error',
        },
      ],
    };
  }
}

// 导出类型定义
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type SubscriptionPeriod = z.infer<typeof SubscriptionPeriodSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderAmount = z.infer<typeof OrderAmountSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type RefundRequest = z.infer<typeof RefundRequestSchema>;
