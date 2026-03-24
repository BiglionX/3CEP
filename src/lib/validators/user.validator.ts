/**
 * 用户和用户资料验证器
 * 用于验证用户注册、登录、资料更新等操作
 */

import { z } from 'zod';

/**
 * 用户角色 Schema
 */
export const UserRoleSchema = z.enum(
  [
    'user',
    'admin',
    'developer',
    'enterprise',
    'content_reviewer',
    'marketplace_admin',
  ],
  {
    required_error: '请指定用户角色',
  }
);

/**
 * 用户状态 Schema
 */
export const UserStatusSchema = z.enum(
  ['active', 'inactive', 'banned', 'pending'],
  {
    required_error: '请指定用户状态',
  }
);

/**
 * 邮箱验证 Schema
 */
export const EmailSchema = z
  .string({
    required_error: '缺少必填字段：email',
  })
  .email('请输入有效的邮箱地址')
  .max(255, '邮箱地址不能超过 255 个字符');

/**
 * 密码验证 Schema
 */
export const PasswordSchema = z
  .string({
    required_error: '缺少必填字段：password',
  })
  .min(8, '密码至少需要 8 个字符')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, '密码必须包含字母和数字')
  .max(128, '密码不能超过 128 个字符');

/**
 * 用户名验证 Schema
 */
export const UsernameSchema = z
  .string({
    required_error: '缺少必填字段：username',
  })
  .min(3, '用户名至少需要 3 个字符')
  .max(30, '用户名不能超过 30 个字符')
  .regex(
    /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
    '用户名只能包含字母、数字、下划线和中文字符'
  );

/**
 * 手机号验证 Schema（中国）
 */
export const PhoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码')
  .optional();

/**
 * 用户资料 Schema
 */
export const UserProfileSchema = z.object({
  username: UsernameSchema.optional(),
  avatar_url: z.string().url('avatar_url 必须是有效的 URL 格式').optional(),
  bio: z.string().max(500, '个人简介不能超过 500 个字符').optional(),
  company: z.string().max(100, '公司名称不能超过 100 个字符').optional(),
  website: z.string().url('website 必须是有效的 URL 格式').optional(),
  location: z.string().max(100, '所在地不能超过 100 个字符').optional(),
  phone: PhoneSchema,
});

/**
 * 用户注册请求 Schema
 */
export const UserRegisterRequestSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string(),
    username: UsernameSchema.optional(),
    role: UserRoleSchema.default('user'),
    profile: UserProfileSchema.optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

/**
 * 用户登录请求 Schema
 */
export const UserLoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string({
    required_error: '缺少必填字段：password',
  }),
  remember_me: z.boolean().default(false).optional(),
});

/**
 * 更新用户资料请求 Schema
 */
export const UpdateUserProfileRequestSchema = z.object({
  username: UsernameSchema.optional(),
  avatar_url: z.string().url('avatar_url 必须是有效的 URL 格式').optional(),
  bio: z.string().max(500, '个人简介不能超过 500 个字符').optional(),
  company: z.string().max(100, '公司名称不能超过 100 个字符').optional(),
  website: z.string().url('website 必须是有效的 URL 格式').optional(),
  location: z.string().max(100, '所在地不能超过 100 个字符').optional(),
  phone: PhoneSchema,
});

/**
 * 修改密码请求 Schema
 */
export const ChangePasswordRequestSchema = z
  .object({
    current_password: z.string({
      required_error: '缺少必填字段：current_password',
    }),
    new_password: PasswordSchema,
    confirm_new_password: z.string(),
  })
  .refine(data => data.new_password === data.confirm_new_password, {
    message: '两次输入的新密码不一致',
    path: ['confirm_new_password'],
  });

/**
 * 验证用户注册请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateUserRegisterRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = UserRegisterRequestSchema.safeParse(data);

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
 * 验证用户登录请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateUserLoginRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = UserLoginRequestSchema.safeParse(data);

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
 * 验证更新用户资料请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateUpdateUserProfileRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = UpdateUserProfileRequestSchema.safeParse(data);

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
 * 验证修改密码请求
 * @param data - 待验证的请求数据
 * @returns 验证结果
 */
export function validateChangePasswordRequest(data: any): {
  success: boolean;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  try {
    const result = ChangePasswordRequestSchema.safeParse(data);

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
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserRegisterRequest = z.infer<typeof UserRegisterRequestSchema>;
export type UserLoginRequest = z.infer<typeof UserLoginRequestSchema>;
export type UpdateUserProfileRequest = z.infer<
  typeof UpdateUserProfileRequestSchema
>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
