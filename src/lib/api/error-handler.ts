/**
 * 统一 API 错误处理器
 *
 * 提供标准化的错误响应格式，包含错误码、追踪 ID 和友好提示
 */

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string; // 错误码（如 AGENT_NOT_FOUND）
    message: string; // 友好提示
    details?: any; // 详细错误信息
    timestamp: string; // 时间戳
    path: string; // 请求路径
    requestId: string; // 请求 ID（用于追踪）
  };
}

/**
 * 成功响应接口
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // 智能体相关错误
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_INVALID_CONFIG = 'AGENT_INVALID_CONFIG',
  AGENT_CANNOT_DELETE = 'AGENT_CANNOT_DELETE',
  AGENT_OFFLINE = 'AGENT_OFFLINE',

  // 权限相关错误
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_NOT_ALLOWED = 'ROLE_NOT_ALLOWED',
  TENANT_ISOLATION_VIOLATION = 'TENANT_ISOLATION_VIOLATION',

  // 验证相关错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_VALUE = 'INVALID_FIELD_VALUE',
  INVALID_JSON_FORMAT = 'INVALID_JSON_FORMAT',

  // 数据库相关错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

  // 业务逻辑错误
  ASSOCIATED_DATA_EXISTS = 'ASSOCIATED_DATA_EXISTS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // 外部服务错误
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * HTTP 状态码映射
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.AGENT_NOT_FOUND]: 404,
  [ErrorCode.AGENT_ALREADY_EXISTS]: 409,
  [ErrorCode.AGENT_INVALID_CONFIG]: 400,
  [ErrorCode.AGENT_CANNOT_DELETE]: 400,
  [ErrorCode.AGENT_OFFLINE]: 503,
  [ErrorCode.PERMISSION_DENIED]: 403,
  [ErrorCode.ROLE_NOT_ALLOWED]: 403,
  [ErrorCode.TENANT_ISOLATION_VIOLATION]: 403,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FIELD_VALUE]: 400,
  [ErrorCode.INVALID_JSON_FORMAT]: 400,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.DUPLICATE_KEY]: 409,
  [ErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  [ErrorCode.CONSTRAINT_VIOLATION]: 400,
  [ErrorCode.ASSOCIATED_DATA_EXISTS]: 400,
  [ErrorCode.INVALID_OPERATION]: 400,
  [ErrorCode.RESOURCE_EXHAUSTED]: 429,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.REQUEST_TIMEOUT]: 408,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * 错误消息映射（中文）
 */
const ERROR_MESSAGE_MAP: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.INVALID_REQUEST]: '请求参数无效',
  [ErrorCode.UNAUTHORIZED]: '用户未认证',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.AGENT_NOT_FOUND]: '智能体不存在',
  [ErrorCode.AGENT_ALREADY_EXISTS]: '智能体已存在',
  [ErrorCode.AGENT_INVALID_CONFIG]: '智能体配置无效',
  [ErrorCode.AGENT_CANNOT_DELETE]: '无法删除智能体',
  [ErrorCode.AGENT_OFFLINE]: '智能体离线',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.ROLE_NOT_ALLOWED]: '角色不允许此操作',
  [ErrorCode.TENANT_ISOLATION_VIOLATION]: '跨租户访问被拒绝',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.MISSING_REQUIRED_FIELD]: '缺少必填字段',
  [ErrorCode.INVALID_FIELD_VALUE]: '字段值无效',
  [ErrorCode.INVALID_JSON_FORMAT]: 'JSON 格式无效',
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.DUPLICATE_KEY]: '键值重复',
  [ErrorCode.FOREIGN_KEY_VIOLATION]: '外键约束冲突',
  [ErrorCode.CONSTRAINT_VIOLATION]: '约束条件违反',
  [ErrorCode.ASSOCIATED_DATA_EXISTS]: '存在关联数据',
  [ErrorCode.INVALID_OPERATION]: '无效的操作',
  [ErrorCode.RESOURCE_EXHAUSTED]: '资源已耗尽',
  [ErrorCode.QUOTA_EXCEEDED]: '配额已超出',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部服务错误',
  [ErrorCode.REQUEST_TIMEOUT]: '请求超时',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务不可用',
};

/**
 * 创建错误响应
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  options?: {
    message?: string;
    details?: any;
    path?: string;
    requestId?: string;
  }
): NextResponse<ErrorResponse> {
  const requestId = options?.requestId || uuidv4();
  const statusCode = ERROR_STATUS_MAP[errorCode] || 500;
  const defaultMessage = ERROR_MESSAGE_MAP[errorCode];

  const response: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: options?.message || defaultMessage,
      details: options?.details,
      timestamp: new Date().toISOString(),
      path: options?.path || 'unknown',
      requestId,
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data?: T,
  options?: {
    message?: string;
    path?: string;
    requestId?: string;
  }
): NextResponse<SuccessResponse<T>> {
  const requestId = options?.requestId || uuidv4();

  const response: SuccessResponse<T> = {
    success: true,
    data,
    message: options?.message,
    timestamp: new Date().toISOString(),
    path: options?.path || 'unknown',
    requestId,
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * 从 Supabase 错误创建标准错误响应
 */
export function handleSupabaseError(
  error: any,
  options?: {
    path?: string;
    requestId?: string;
    customMessages?: Partial<Record<ErrorCode, string>>;
  }
): NextResponse<ErrorResponse> {
  console.error('Supabase 错误:', error);

  // 解析 Supabase 错误
  if (error?.code) {
    // PostgreSQL 错误码映射
    const pgErrorCodeMap: Record<string, ErrorCode> = {
      '23505': ErrorCode.DUPLICATE_KEY,
      '23503': ErrorCode.FOREIGN_KEY_VIOLATION,
      '23502': ErrorCode.MISSING_REQUIRED_FIELD,
      '23514': ErrorCode.CONSTRAINT_VIOLATION,
      '40001': ErrorCode.DATABASE_ERROR,
      '57014': ErrorCode.REQUEST_TIMEOUT,
    };

    const errorCode = pgErrorCodeMap[error.code] || ErrorCode.DATABASE_ERROR;

    return createErrorResponse(errorCode, {
      path: options?.path,
      requestId: options?.requestId,
      details: {
        postgresCode: error.code,
        postgresDetail: error.detail,
        postgresHint: error.hint,
      },
    });
  }

  // 默认内部错误
  return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
    path: options?.path,
    requestId: options?.requestId,
    details: error?.message || '未知数据库错误',
  });
}

/**
 * 从验证错误创建标准错误响应
 */
export function handleValidationError(
  errors: Array<{ field: string; message: string; code?: string }>,
  options?: {
    path?: string;
    requestId?: string;
  }
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorCode.VALIDATION_ERROR, {
    path: options?.path,
    requestId: options?.requestId,
    details: {
      fields: errors,
      count: errors.length,
    },
  });
}

/**
 * 中间件：自动添加请求 ID 和路径信息
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  errorHandler?: (error: any) => NextResponse
): T {
  return (async (...args: any[]) => {
    const request = args.find(arg => arg instanceof Request);
    const path = request?.url || 'unknown';
    const requestId = uuidv4();

    try {
      const result = await handler(...args);

      // 如果是成功响应，添加 requestId 和 path
      if (result && typeof result === 'object' && 'json' in result) {
        const body = await result.clone().json();
        if (
          body &&
          typeof body === 'object' &&
          'success' in body &&
          body.success
        ) {
          body.requestId = requestId;
          body.path = path;
          return NextResponse.json(body, result.status);
        }
      }

      return result;
    } catch (error: any) {
      console.error(`API 错误 [${requestId}]:`, error);

      // 使用自定义错误处理器或默认处理
      if (errorHandler) {
        return errorHandler(error);
      }

      // 如果已经是标准错误响应，直接返回
      if (error instanceof NextResponse) {
        return error;
      }

      // 默认错误处理
      return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
        path,
        requestId,
        details: error?.message || '服务器内部错误',
      });
    }
  }) as T;
}

/**
 * 工具函数：生成错误追踪信息
 */
export function getErrorTrace(error: any): {
  name: string;
  message: string;
  stack?: string;
  cause?: string;
} {
  return {
    name: error?.name || 'UnknownError',
    message: error?.message || '未知错误',
    stack: error?.stack,
    cause: error?.cause?.toString(),
  };
}

// 导出常用错误码快捷创建函数
export const errors = {
  notFound: (resource?: string) =>
    createErrorResponse(ErrorCode.NOT_FOUND, {
      message: resource ? `${resource}不存在` : undefined,
    }),

  unauthorized: (message?: string) =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, {
      message: message || '请先登录',
    }),

  forbidden: (message?: string) =>
    createErrorResponse(ErrorCode.FORBIDDEN, {
      message: message || '权限不足',
    }),

  badRequest: (details?: any, message?: string) =>
    createErrorResponse(ErrorCode.INVALID_REQUEST, {
      message,
      details,
    }),

  validation: (fieldErrors: Array<{ field: string; message: string }>) =>
    handleValidationError(fieldErrors),

  internal: (details?: any) =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, { details }),
};
