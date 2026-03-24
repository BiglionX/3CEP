/**
 * 智能体配置验证器
 * 使用 Zod 进行配置 Schema 验证
 */

import { z } from 'zod';

/**
 * 基础配置 Schema
 * 所有智能体配置必须满足此 Schema
 */
export const BaseAgentConfigSchema = z.object({
  // 模型配置
  model: z
    .string({
      required_error: '缺少必填字段：model',
      invalid_type_error: 'model 必须是字符串',
    })
    .min(1, 'model 不能为空'),

  // 温度参数（0-2 之间）
  temperature: z
    .number({
      required_error: '缺少必填字段：temperature',
      invalid_type_error: 'temperature 必须是数字',
    })
    .min(0, 'temperature 最小值为 0')
    .max(2, 'temperature 最大值为 2')
    .default(0.7),

  // 最大 token 数
  max_tokens: z
    .number({
      required_error: '缺少必填字段：max_tokens',
      invalid_type_error: 'max_tokens 必须是数字',
    })
    .int('max_tokens 必须是整数')
    .positive('max_tokens 必须大于 0')
    .max(128000, 'max_tokens 不能超过 128000'),

  // top_p 参数（可选）
  top_p: z
    .number({
      invalid_type_error: 'top_p 必须是数字',
    })
    .min(0, 'top_p 最小值为 0')
    .max(1, 'top_p 最大值为 1')
    .optional(),

  // 频率惩罚（可选）
  frequency_penalty: z
    .number({
      invalid_type_error: 'frequency_penalty 必须是数字',
    })
    .min(-2, 'frequency_penalty 最小值为 -2')
    .max(2, 'frequency_penalty 最大值为 2')
    .optional(),

  // 存在惩罚（可选）
  presence_penalty: z
    .number({
      invalid_type_error: 'presence_penalty 必须是数字',
    })
    .min(-2, 'presence_penalty 最小值为 -2')
    .max(2, 'presence_penalty 最大值为 2')
    .optional(),

  // 能力列表（可选）
  capabilities: z.array(z.string()).optional(),

  // 系统提示词（可选）
  system_prompt: z.string().optional(),
});

/**
 * LLM 专用配置 Schema（继承基础配置）
 */
export const LLMConfigSchema = BaseAgentConfigSchema.extend({
  // LLM 特有配置
  provider: z.enum(['openai', 'anthropic', 'google', 'azure'], {
    required_error: '缺少必填字段：provider',
  }),

  api_version: z.string().optional(),

  // 上下文窗口大小
  context_window: z
    .number()
    .int()
    .positive()
    .max(200000, 'context_window 不能超过 200000')
    .optional(),
});

/**
 * 代码审查专用配置 Schema
 */
export const CodeReviewConfigSchema = BaseAgentConfigSchema.extend({
  // 代码审查特有配置
  languages: z
    .array(
      z.enum([
        'javascript',
        'typescript',
        'python',
        'java',
        'go',
        'rust',
        'cpp',
        'csharp',
      ])
    )
    .optional(),

  check_types: z.boolean().default(true),
  check_security: z.boolean().default(true),
  check_performance: z.boolean().default(true),
  check_style: z.boolean().default(false),

  // 忽略的规则
  ignore_rules: z.array(z.string()).optional(),
});

/**
 * 文案创作专用配置 Schema
 */
export const CopywritingConfigSchema = BaseAgentConfigSchema.extend({
  // 文案创作特有配置
  tone: z
    .enum([
      'professional',
      'casual',
      'friendly',
      'formal',
      'humorous',
      'persuasive',
      'emotional',
    ])
    .default('professional'),

  style: z
    .enum([
      'blog',
      'social_media',
      'email',
      'ad',
      'product_description',
      'press_release',
    ])
    .optional(),

  target_audience: z.string().optional(),

  // SEO 关键词
  seo_keywords: z.array(z.string()).optional(),

  // 输出长度
  output_length: z.enum(['short', 'medium', 'long']).default('medium'),
});

/**
 * 数据分析专用配置 Schema
 */
export const DataAnalysisConfigSchema = BaseAgentConfigSchema.extend({
  // 数据分析特有配置
  data_sources: z.array(z.string()).optional(),

  visualization_types: z
    .array(
      z.enum([
        'chart',
        'graph',
        'table',
        'heatmap',
        'scatter_plot',
        'bar_chart',
        'line_chart',
      ])
    )
    .optional(),

  statistical_methods: z.array(z.string()).optional(),

  // 自动洞察
  auto_insights: z.boolean().default(true),
});

/**
 * 联合 Schema（支持多种配置类型）
 */
export const AgentConfigUnionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('llm'),
    config: LLMConfigSchema,
  }),
  z.object({
    type: z.literal('code_review'),
    config: CodeReviewConfigSchema,
  }),
  z.object({
    type: z.literal('copywriting'),
    config: CopywritingConfigSchema,
  }),
  z.object({
    type: z.literal('data_analysis'),
    config: DataAnalysisConfigSchema,
  }),
]);

/**
 * 通用配置验证函数
 * @param config - 待验证的配置对象
 * @returns 验证结果
 */
export function validateAgentConfig(config: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    // 首先验证基础配置
    const baseResult = BaseAgentConfigSchema.safeParse(config);

    if (!baseResult.success) {
      return {
        success: false,
        errors: baseResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code || 'invalid',
        })),
      };
    }

    return {
      success: true,
      data: baseResult.data,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: error.message || '未知错误',
          code: 'validation_error',
        },
      ],
    };
  }
}

/**
 * 特定类型配置验证函数
 * @param type - 配置类型
 * @param config - 待验证的配置对象
 * @returns 验证结果
 */
export function validateTypedConfig(
  type: 'llm' | 'code_review' | 'copywriting' | 'data_analysis',
  config: any
): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    let schema;

    switch (type) {
      case 'llm':
        schema = LLMConfigSchema;
        break;
      case 'code_review':
        schema = CodeReviewConfigSchema;
        break;
      case 'copywriting':
        schema = CopywritingConfigSchema;
        break;
      case 'data_analysis':
        schema = DataAnalysisConfigSchema;
        break;
      default:
        return {
          success: false,
          errors: [
            {
              field: 'type',
              message: `不支持的配置类型：${type}`,
              code: 'invalid_type',
            },
          ],
        };
    }

    const result = schema.safeParse(config);

    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(err => ({
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
 * 配置验证中间件
 * 用于 API路由中自动验证请求体
 */
export function createConfigValidator(options?: {
  strict?: boolean;
  allowUnknownFields?: boolean;
}) {
  return async function validateConfig(requestBody: any) {
    const { configuration } = requestBody;

    if (!configuration) {
      return {
        valid: false,
        errors: [
          {
            field: 'configuration',
            message: '缺少必填字段：configuration',
            code: 'required',
          },
        ],
      };
    }

    // 如果是字符串，先解析为 JSON
    let configObj;
    if (typeof configuration === 'string') {
      try {
        configObj = JSON.parse(configuration);
      } catch (error) {
        return {
          valid: false,
          errors: [
            {
              field: 'configuration',
              message: 'configuration 必须是有效的 JSON 格式',
              code: 'invalid_json',
            },
          ],
        };
      }
    } else {
      configObj = configuration;
    }

    // 验证配置
    const result = validateAgentConfig(configObj);

    if (!result.success) {
      return {
        valid: false,
        errors: result.errors,
      };
    }

    return {
      valid: true,
      data: {
        ...requestBody,
        configuration: result.data,
      },
    };
  };
}

// 导出类型定义
export type AgentConfig = z.infer<typeof BaseAgentConfigSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type CodeReviewConfig = z.infer<typeof CodeReviewConfigSchema>;
export type CopywritingConfig = z.infer<typeof CopywritingConfigSchema>;
export type DataAnalysisConfig = z.infer<typeof DataAnalysisConfigSchema>;
