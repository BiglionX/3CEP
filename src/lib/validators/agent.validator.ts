/**
 * 智能体基础数据验证器
 * 用于验证智能体的基本信息、定价、标签等字段
 */

import { z } from 'zod';

/**
 * 智能体名称 Schema
 */
export const AgentNameSchema = z
  .string({
    required_error: '缺少必填字段：name',
    invalid_type_error: 'name 必须是字符串',
  })
  .min(2, '智能体名称至少需要 2 个字符')
  .max(50, '智能体名称不能超过 50 个字符')
  .regex(
    /^[\u4e00-\u9fa5 a-zA-Z0-9_-]+$/,
    '智能体名称只能包含中文、英文、数字、下划线和连字符'
  );

/**
 * 智能体描述 Schema
 */
export const AgentDescriptionSchema = z
  .string({
    invalid_type_error: 'description 必须是字符串',
  })
  .max(500, '描述不能超过 500 个字符')
  .optional()
  .or(z.literal(''));

/**
 * 智能体类别 Schema
 */
export const AgentCategorySchema = z.enum(
  [
    'general',
    'productivity',
    'education',
    'entertainment',
    'business',
    'development',
    'design',
    'marketing',
    'customer_service',
    'data_analysis',
    'health',
    'finance',
    'other',
  ],
  {
    required_error: '请选择智能体类别',
    invalid_type_error: 'category 必须是有效的类别值',
  }
);

/**
 * 智能体标签 Schema
 */
export const AgentTagsSchema = z
  .array(
    z
      .string()
      .min(1, '标签不能为空')
      .max(20, '每个标签不能超过 20 个字符')
      .regex(
        /^[\u4e00-\u9fa5 a-zA-Z0-9_-]+$/,
        '标签只能包含中文、英文、数字、下划线和连字符'
      )
  )
  .max(10, '最多只能添加 10 个标签')
  .default([]);

/**
 * 定价模式 Schema
 */
export const PricingSchema = z.object(
  {
    type: z.enum(['free', 'paid', 'freemium'], {
      required_error: '请选择定价类型',
    }),
    price: z
      .number({
        invalid_type_error: '价格必须是数字',
      })
      .nonnegative('价格不能为负数')
      .max(999999, '价格超出最大限制')
      .default(0),
    currency: z.enum(['CNY', 'USD']).default('CNY'),
    billing_cycle: z
      .enum(['onetime', 'monthly', 'yearly'])
      .default('onetime')
      .optional(),
  },
  {
    invalid_type_error: 'pricing 必须是对象格式',
  }
);

/**
 * 智能体状态 Schema
 */
export const AgentStatusSchema = z.enum(
  ['draft', 'pending_review', 'approved', 'rejected', 'inactive', 'active'],
  {
    required_error: '请指定智能体状态',
  }
);

/**
 * 版本号 Schema
 */
export const VersionSchema = z
  .string({
    required_error: '缺少必填字段：version',
  })
  .regex(
    /^\d+\.\d+\.\d+$/,
    '版本号必须符合 semantic versioning 格式 (如：1.0.0)'
  );

/**
 * 智能体创建请求完整 Schema
 */
export const CreateAgentRequestSchema = z.object({
  name: AgentNameSchema,
  description: AgentDescriptionSchema,
  configuration: z
    .object(
      {},
      {
        required_error: '缺少必填字段：configuration',
        invalid_type_error: 'configuration 必须是对象格式',
      }
    )
    .passthrough(), // 允许额外字段，由 agent-config.validator 进一步验证
  category: AgentCategorySchema.default('general'),
  status: AgentStatusSchema.default('draft'),
  version: VersionSchema.default('1.0.0'),
  tags: AgentTagsSchema,
  pricing: PricingSchema.optional(),
  userId: z.string().uuid('userId 必须是有效的 UUID 格式').optional(),
});

/**
 * 智能体更新请求 Schema
 */
export const UpdateAgentRequestSchema = z.object({
  name: AgentNameSchema.optional(),
  description: AgentDescriptionSchema,
  configuration: z.object({}, {}).passthrough().optional(),
  category: AgentCategorySchema.optional(),
  status: AgentStatusSchema.optional(),
  version: VersionSchema.optional(),
  tags: AgentTagsSchema.optional(),
  pricing: PricingSchema.optional(),
});

/**
 * 验证智能体创建请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateCreateAgentRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = CreateAgentRequestSchema.safeParse(data);

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
 * 验证智能体更新请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateUpdateAgentRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = UpdateAgentRequestSchema.safeParse(data);

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
export type AgentName = z.infer<typeof AgentNameSchema>;
export type AgentDescription = z.infer<typeof AgentDescriptionSchema>;
export type AgentCategory = z.infer<typeof AgentCategorySchema>;
export type AgentTags = z.infer<typeof AgentTagsSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type CreateAgentRequest = z.infer<typeof CreateAgentRequestSchema>;
export type UpdateAgentRequest = z.infer<typeof UpdateAgentRequestSchema>;
