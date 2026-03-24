/**
 * 智能体执行验证器
 * 用于验证执行请求、输入输出等
 */

import { z } from 'zod';

/**
 * 执行状态 Schema
 */
export const ExecutionStatusSchema = z.enum(
  ['pending', 'running', 'completed', 'failed', 'timeout', 'cancelled'],
  {
    required_error: '请指定执行状态',
  }
);

/**
 * 执行优先级 Schema
 */
export const ExecutionPrioritySchema = z
  .enum(['low', 'normal', 'high'], {
    required_error: '请指定执行优先级',
  })
  .default('normal');

/**
 * 输入参数 Schema（支持任意 JSON 对象）
 */
export const InputParamsSchema = z.record(z.any()).optional();

/**
 * 输出结果 Schema（支持任意 JSON 对象）
 */
export const OutputResultSchema = z.record(z.any()).optional();

/**
 * 错误信息 Schema
 */
export const ExecutionErrorSchema = z.object({
  code: z.string().min(1, '错误代码不能为空'),
  message: z.string().min(1, '错误信息不能为空'),
  details: z.any().optional(),
  stack: z.string().optional(),
});

/**
 * 使用量统计 Schema
 */
export const UsageStatsSchema = z.object({
  tokens_used: z
    .number({
      invalid_type_error: 'tokens_used 必须是数字',
    })
    .nonnegative('tokens_used 不能为负数')
    .default(0),
  execution_time_ms: z
    .number({
      invalid_type_error: 'execution_time_ms 必须是数字',
    })
    .nonnegative('execution_time_ms 不能为负数')
    .default(0),
  api_calls: z
    .number({
      invalid_type_error: 'api_calls 必须是数字',
    })
    .nonnegative('api_calls 不能为负数')
    .default(1),
});

/**
 * 创建执行请求 Schema
 */
export const CreateExecutionRequestSchema = z.object({
  agent_id: z.string().uuid('agent_id 必须是有效的 UUID 格式'),
  input: InputParamsSchema,
  priority: ExecutionPrioritySchema,
  timeout_seconds: z
    .number({
      invalid_type_error: 'timeout_seconds 必须是数字',
    })
    .int('timeout_seconds 必须是整数')
    .positive('timeout_seconds 必须大于 0')
    .max(3600, '超时时间不能超过 3600 秒')
    .default(300), // 默认 5 分钟
  user_id: z.string().uuid('user_id 必须是有效的 UUID 格式').optional(),
  session_id: z.string().uuid('session_id 必须是有效的 UUID 格式').optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * 更新执行状态请求 Schema
 */
export const UpdateExecutionStatusRequestSchema = z.object({
  status: ExecutionStatusSchema,
  output: OutputResultSchema.optional(),
  error: ExecutionErrorSchema.optional(),
  usage: UsageStatsSchema.optional(),
  completed_at: z
    .string()
    .datetime('completed_at 必须是有效的 ISO 8601 格式')
    .optional(),
});

/**
 * 执行历史记录查询参数 Schema
 */
export const ExecutionQueryParamsSchema = z.object({
  agent_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  status: ExecutionStatusSchema.array().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});

/**
 * 验证创建执行请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateCreateExecutionRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = CreateExecutionRequestSchema.safeParse(data);

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
 * 验证更新执行状态请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateUpdateExecutionStatus(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = UpdateExecutionStatusRequestSchema.safeParse(data);

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
 * 验证执行查询参数
 * @param params - 待验证的查询参数
 * @returns 验证结果
 */
export function validateExecutionQueryParams(params: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = ExecutionQueryParamsSchema.safeParse(params);

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
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
export type ExecutionPriority = z.infer<typeof ExecutionPrioritySchema>;
export type InputParams = z.infer<typeof InputParamsSchema>;
export type OutputResult = z.infer<typeof OutputResultSchema>;
export type ExecutionError = z.infer<typeof ExecutionErrorSchema>;
export type UsageStats = z.infer<typeof UsageStatsSchema>;
export type CreateExecutionRequest = z.infer<
  typeof CreateExecutionRequestSchema
>;
export type UpdateExecutionStatusRequest = z.infer<
  typeof UpdateExecutionStatusRequestSchema
>;
export type ExecutionQueryParams = z.infer<typeof ExecutionQueryParamsSchema>;
