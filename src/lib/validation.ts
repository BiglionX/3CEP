/**
 * 企业服务表单验证和错误处理系统
 * 提供统一的表单验证、错误处理和用户体验
 */

import * as z from 'zod'

// 通用验证规则
export const commonValidations = {
  // 邮箱验证
  email: z.string().email('请输入有效的邮箱地址'),
  
  // 手机号验证（中国手机号）
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  
  // 密码验证（至少8位，包含字母和数字）
  password: z.string()
    .min(8, '密码至少需要8位字符')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, '密码必须包含字母和数字'),
  
  // 用户名验证
  username: z.string()
    .min(3, '用户名至少需要3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文'),
  
  // 企业名称验证
  companyName: z.string()
    .min(2, '企业名称至少需要2个字符')
    .max(50, '企业名称不能超过50个字符'),
  
  // 金额验证
  amount: z.number()
    .positive('金额必须大于0')
    .max(999999999, '金额超出最大限制'),
  
  // 数量验证
  quantity: z.number()
    .int('数量必须是整数')
    .positive('数量必须大于0')
    .max(999999, '数量超出最大限制'),
  
  // 日期验证
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '请输入有效的日期格式(YYYY-MM-DD)'),
  
  // URL验证
  url: z.string().url('请输入有效的网址'),
  
  // 描述文本验证
  description: z.string()
    .max(1000, '描述不能超过1000个字符')
}

// 企业服务特定验证规则
export const enterpriseValidations = {
  // 采购订单验证
  purchaseOrder: z.object({
    orderNumber: z.string()
      .min(1, '订单号不能为空')
      .regex(/^[A-Z0-9\-_]+$/, '订单号只能包含大写字母、数字、连字符和下划线'),
    supplier: commonValidations.companyName,
    items: z.array(z.object({
      name: z.string().min(1, '商品名称不能为空'),
      quantity: commonValidations.quantity,
      unitPrice: commonValidations.amount,
      totalPrice: commonValidations.amount
    })).min(1, '至少需要添加一个商品'),
    totalAmount: commonValidations.amount,
    deliveryDate: commonValidations.date,
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    description: commonValidations.description.optional()
  }),

  // 智能体配置验证
  agentConfig: z.object({
    name: z.string()
      .min(2, '智能体名称至少需要2个字符')
      .max(30, '智能体名称不能超过30个字符'),
    description: commonValidations.description,
    capabilities: z.array(z.string()).min(1, '至少需要选择一个能力'),
    model: z.string().min(1, '请选择AI模型'),
    temperature: z.number()
      .min(0, '温度值不能小于0')
      .max(2, '温度值不能大于2'),
    maxTokens: z.number()
      .int()
      .min(100, '最大token数不能少于100')
      .max(4096, '最大token数不能超过4096')
  }),

  // 企业用户注册验证
  enterpriseRegister: z.object({
    companyName: commonValidations.companyName,
    email: commonValidations.email,
    phone: commonValidations.phone,
    password: commonValidations.password,
    confirmPassword: z.string(),
    industry: z.string().min(1, '请选择所属行业'),
    employeeCount: z.enum(['1-50', '51-200', '201-500', '501-1000', '1000+']),
    website: commonValidations.url.optional(),
    businessLicense: z.string().optional()
  }).refine((data: any) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  }),

  // 供应商信息验证
  supplierInfo: z.object({
    name: commonValidations.companyName,
    contactPerson: z.string()
      .min(2, '联系人姓名至少需要2个字符')
      .max(20, '联系人姓名不能超过20个字符'),
    email: commonValidations.email,
    phone: commonValidations.phone,
    address: z.string().min(5, '地址信息至少需要5个字符'),
    businessScope: z.array(z.string()).min(1, '至少需要选择一个业务范围'),
    qualification: z.array(z.string()).optional(),
    bankAccount: z.string()
      .regex(/^\d{16,19}$/, '请输入有效的银行账号')
      .optional()
  })
}

// 错误处理类型定义
export interface FormError {
  field: string
  message: string
  code?: string
}

export interface ApiError {
  message: string
  code: string
  details?: any
  fieldErrors?: Record<string, string[]>
}

// 错误处理类
export class ErrorHandler {
  // 处理表单验证错误
  static handleFormErrors(error: any): FormError[] {
    const errors: FormError[] = []
    
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue: any) => {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          code: 'VALIDATION_ERROR'
        })
      })
    } else if (error.fieldErrors) {
      // 处理API返回的字段错误
      Object.entries(error.fieldErrors as Record<string, string[]>).forEach(([field, messages]) => {
        messages.forEach((message: string) => {
          errors.push({
            field,
            message,
            code: 'FIELD_ERROR'
          })
        })
      })
    } else {
      errors.push({
        field: 'general',
        message: error.message || '表单验证失败',
        code: 'FORM_ERROR'
      })
    }
    
    return errors
  }

  // 处理API错误
  static handleApiError(error: any): ApiError {
    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          return {
            message: data.message || '请求参数错误',
            code: data.code || 'BAD_REQUEST',
            details: data.details,
            fieldErrors: data.fieldErrors
          }
        case 401:
          return {
            message: '未授权访问，请重新登录',
            code: 'UNAUTHORIZED',
            details: data
          }
        case 403:
          return {
            message: data.message || '权限不足',
            code: data.code || 'FORBIDDEN',
            details: data
          }
        case 404:
          return {
            message: '请求的资源不存在',
            code: 'NOT_FOUND',
            details: data
          }
        case 422:
          return {
            message: '数据验证失败',
            code: 'VALIDATION_FAILED',
            fieldErrors: data.fieldErrors,
            details: data
          }
        case 500:
          return {
            message: '服务器内部错误，请稍后重试',
            code: 'INTERNAL_ERROR',
            details: data
          }
        default:
          return {
            message: data.message || `HTTP错误 ${status}`,
            code: `HTTP_${status}`,
            details: data
          }
      }
    } else if (error.request) {
      // 网络错误
      return {
        message: '网络连接失败，请检查网络设置',
        code: 'NETWORK_ERROR',
        details: error
      }
    } else {
      // 其他错误
      return {
        message: error.message || '未知错误',
        code: 'UNKNOWN_ERROR',
        details: error
      }
    }
  }

  // 处理并返回错误信息
  static processError(error: any, context?: string): ApiError {
    const apiError = this.handleApiError(error)
    const displayMessage = context ? `${context}：${apiError.message}` : apiError.message
    
    // 记录错误到控制台
    console.error('API Error:', {
      message: apiError.message,
      code: apiError.code,
      details: apiError.details,
      timestamp: new Date().toISOString()
    })
    
    return {
      ...apiError,
      message: displayMessage
    }
  }
}

// 自定义验证钩子
export function useValidation() {
  // 验证表单数据
  const validateForm = async <T>(
    schema: z.ZodSchema<T>, 
    data: unknown
  ): Promise<{ success: true; data: T } | { success: false; errors: FormError[] }> => {
    try {
      const result = schema.safeParse(data)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        const errors = ErrorHandler.handleFormErrors(result.error)
        return { success: false, errors }
      }
    } catch (error) {
      const errors = ErrorHandler.handleFormErrors(error)
      return { success: false, errors }
    }
  }

  // 验证单个字段
  const validateField = <T>(
    schema: z.ZodSchema<T>,
    fieldName: string,
    value: unknown
  ): string | null => {
    try {
      schema.parse({ [fieldName]: value })
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find((issue: any) => issue.path[0] === fieldName)
        return fieldError?.message || null
      }
      return null
    }
  }

  return {
    validateForm,
    validateField
  }
}

// 导出常用的验证组合
export const validationSchemas = {
  ...commonValidations,
  ...enterpriseValidations
}

export { z }