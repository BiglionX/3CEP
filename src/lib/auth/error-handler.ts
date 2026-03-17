/**
 * 认证错误处理
 * 标准化错误处理机制，避免信息泄露并提供友好的用户反馈
 */

// 认证错误代码枚举
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  ACCOUNT_DISABLED = 'account_disabled',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  SESSION_EXPIRED = 'session_expired',
  TOKEN_INVALID = 'token_invalid',
  PERMISSION_DENIED = 'permission_denied',
  USER_NOT_FOUND = 'user_not_found',
  PASSWORD_TOO_WEAK = 'password_too_weak',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
}

// 错误严重程度等级
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 标准化错误响应接口
export interface StandardizedError {
  code: AuthErrorCode;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  shouldLog: boolean;
  shouldRetry: boolean;
  timestamp: number;
}

// 错误上下文信息
export interface ErrorContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  endpoint?: string;
  operation?: string;
}

/**
 * 认证错误处理
 * 提供统一的错误处理和映射机制
 */
export class AuthErrorHandler {
  // 错误代码到用户友好消息的映射
  private static errorMessages: Record<
    AuthErrorCode,
    {
      userMessage: string;
      severity: ErrorSeverity;
      shouldLog: boolean;
      shouldRetry: boolean;
    }
  > = {
    [AuthErrorCode.INVALID_CREDENTIALS]: {
      userMessage: '邮箱或密码错误',
      severity: ErrorSeverity.MEDIUM,
      shouldLog: false,
      shouldRetry: true,
    },
    [AuthErrorCode.EMAIL_NOT_CONFIRMED]: {
      userMessage: '请先确认您的邮箱地址',
      severity: ErrorSeverity.LOW,
      shouldLog: false,
      shouldRetry: false,
    },
    [AuthErrorCode.ACCOUNT_DISABLED]: {
      userMessage: '账户已被禁用，请联系管理员',
      severity: ErrorSeverity.HIGH,
      shouldLog: true,
      shouldRetry: false,
    },
    [AuthErrorCode.RATE_LIMITED]: {
      userMessage: '请求过于频繁，请稍后再试',
      severity: ErrorSeverity.MEDIUM,
      shouldLog: true,
      shouldRetry: false,
    },
    [AuthErrorCode.NETWORK_ERROR]: {
      userMessage: '网络连接出现问题，请检查网络后重试',
      severity: ErrorSeverity.MEDIUM,
      shouldLog: false,
      shouldRetry: true,
    },
    [AuthErrorCode.SESSION_EXPIRED]: {
      userMessage: '登录会话已过期，请重新登录',
      severity: ErrorSeverity.LOW,
      shouldLog: false,
      shouldRetry: false,
    },
    [AuthErrorCode.TOKEN_INVALID]: {
      userMessage: '身份验证令牌无效，请重新登录',
      severity: ErrorSeverity.MEDIUM,
      shouldLog: true,
      shouldRetry: false,
    },
    [AuthErrorCode.PERMISSION_DENIED]: {
      userMessage: '您没有执行此操作的权限',
      severity: ErrorSeverity.HIGH,
      shouldLog: true,
      shouldRetry: false,
    },
    [AuthErrorCode.USER_NOT_FOUND]: {
      userMessage: '用户不存在',
      severity: ErrorSeverity.MEDIUM,
      shouldLog: false,
      shouldRetry: false,
    },
    [AuthErrorCode.PASSWORD_TOO_WEAK]: {
      userMessage: '密码强度不够，请使用更强的密码',
      severity: ErrorSeverity.LOW,
      shouldLog: false,
      shouldRetry: true,
    },
    [AuthErrorCode.EMAIL_ALREADY_EXISTS]: {
      userMessage: '该邮箱地址已被注册',
      severity: ErrorSeverity.LOW,
      shouldLog: false,
      shouldRetry: false,
    },
  };

  /**
   * 将原始错误映射为标准化错误
   */
  static mapError(error: any, context?: ErrorContext): StandardizedError {
    const timestamp = Date.now();

    // 处理不同类型的错误输出
    if (typeof error === 'string') {
      return this.handleStringError(error, timestamp, context);
    }

    if (error instanceof Error) {
      return this.handleErrorInstance(error, timestamp, context);
    }

    if (typeof error === 'object' && error !== null) {
      return this.handleObjectError(error, timestamp, context);
    }

    // 默认处理
    return this.createStandardError(
      AuthErrorCode.NETWORK_ERROR,
      '未知错误',
      timestamp,
      context
    );
  }

  /**
   * 处理字符串错误
   */
  private static handleStringError(
    error: string,
    timestamp: number,
    context?: ErrorContext
  ): StandardizedError {
    // 尝试匹配已知的错误模式
    const lowerError = error.toLowerCase();

    if (
      lowerError.includes('invalid credentials') ||
      lowerError.includes('incorrect')
    ) {
      return this.createStandardError(
        AuthErrorCode.INVALID_CREDENTIALS,
        error,
        timestamp,
        context
      );
    }

    if (
      lowerError.includes('email not confirmed') ||
      lowerError.includes('confirm')
    ) {
      return this.createStandardError(
        AuthErrorCode.EMAIL_NOT_CONFIRMED,
        error,
        timestamp,
        context
      );
    }

    if (
      lowerError.includes('rate limit') ||
      lowerError.includes('too many requests')
    ) {
      return this.createStandardError(
        AuthErrorCode.RATE_LIMITED,
        error,
        timestamp,
        context
      );
    }

    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return this.createStandardError(
        AuthErrorCode.NETWORK_ERROR,
        error,
        timestamp,
        context
      );
    }

    // 默认映射
    return this.createStandardError(
      AuthErrorCode.NETWORK_ERROR,
      error,
      timestamp,
      context
    );
  }

  /**
   * 处理Error实例
   */
  private static handleErrorInstance(
    error: Error,
    timestamp: number,
    context?: ErrorContext
  ): StandardizedError {
    return this.handleStringError(error.message, timestamp, context);
  }

  /**
   * 处理对象形式的错误
   */
  private static handleObjectError(
    error: any,
    timestamp: number,
    context?: ErrorContext
  ): StandardizedError {
    // 处理Supabase错误
    if (error.code) {
      const mappedCode = this.mapSupabaseErrorCode(error.code);
      if (mappedCode) {
        return this.createStandardError(
          mappedCode,
          error.message || error.code,
          timestamp,
          context
        );
      }
    }

    // 处理HTTP错误
    if (error.status) {
      const mappedCode = this.mapHttpStatusCode(error.status);
      if (mappedCode) {
        return this.createStandardError(
          mappedCode,
          error.message || `HTTP ${error.status}`,
          timestamp,
          context
        );
      }
    }

    // 处理自定义错误对象
    if (error.code && typeof error.code === 'string') {
      const errorCode = error.code as AuthErrorCode;
      if (Object.values(AuthErrorCode).includes(errorCode)) {
        return this.createStandardError(
          errorCode,
          error.message || error.code,
          timestamp,
          context
        );
      }
    }

    // 默认处理
    return this.createStandardError(
      AuthErrorCode.NETWORK_ERROR,
      JSON.stringify(error),
      timestamp,
      context
    );
  }

  /**
   * 映射Supabase错误代码
   */
  private static mapSupabaseErrorCode(code: string): AuthErrorCode | null {
    const supabaseMapping: Record<string, AuthErrorCode> = {
      invalid_credentials: AuthErrorCode.INVALID_CREDENTIALS,
      email_not_confirmed: AuthErrorCode.EMAIL_NOT_CONFIRMED,
      user_disabled: AuthErrorCode.ACCOUNT_DISABLED,
      over_email_send_rate_limit: AuthErrorCode.RATE_LIMITED,
      weak_password: AuthErrorCode.PASSWORD_TOO_WEAK,
      user_already_exists: AuthErrorCode.EMAIL_ALREADY_EXISTS,
    };

    return supabaseMapping[code] || null;
  }

  /**
   * 映射HTTP状态码
   */
  private static mapHttpStatusCode(status: number): AuthErrorCode | null {
    const statusMapping: Record<number, AuthErrorCode> = {
      401: AuthErrorCode.INVALID_CREDENTIALS,
      403: AuthErrorCode.PERMISSION_DENIED,
      429: AuthErrorCode.RATE_LIMITED,
      500: AuthErrorCode.NETWORK_ERROR,
      502: AuthErrorCode.NETWORK_ERROR,
      503: AuthErrorCode.NETWORK_ERROR,
      504: AuthErrorCode.NETWORK_ERROR,
    };

    return statusMapping[status] || null;
  }

  /**
   * 创建标准化错误对象
   */
  private static createStandardError(
    code: AuthErrorCode,
    originalMessage: string,
    timestamp: number,
    _context?: ErrorContext
  ): StandardizedError {
    const errorConfig = this.errorMessages[code];

    return {
      code,
      message: originalMessage,
      userMessage: errorConfig.userMessage,
      severity: errorConfig.severity,
      shouldLog: errorConfig.shouldLog,
      shouldRetry: errorConfig.shouldRetry,
      timestamp,
    };
  }

  /**
   * 格式化错误用于日志记录
   */
  static formatForLogging(
    error: StandardizedError,
    context?: ErrorContext
  ): string {
    const logData = {
      timestamp: new Date(error.timestamp).toISOString(),
      errorCode: error.code,
      severity: error.severity,
      originalMessage: error.message,
      userMessage: error.userMessage,
      shouldRetry: error.shouldRetry,
      context: context || {},
    };

    return JSON.stringify(logData, null, 2);
  }

  /**
   * 判断错误是否应该重试
   */
  static shouldRetry(error: StandardizedError): boolean {
    return error.shouldRetry;
  }

  /**
   * 获取错误的延迟重试时间（毫秒）
   */
  static getRetryDelay(error: StandardizedError, attempt: number): number {
    if (!this.shouldRetry(error)) {
      return 0;
    }

    // 指数退避算法
    const baseDelay = 1000; // 1秒基础延迟
    const maxDelay = 30000; // 最大30秒
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

    // 添加随机抖动避免惊群效应
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * 批量处理错误
   */
  static handleBatchErrors(errors: any[]): StandardizedError[] {
    return errors.map((error, index) =>
      this.mapError(error, {
        timestamp: Date.now(),
        operation: `batch_operation_${index}`,
      })
    );
  }
}

/**
 * 认证错误边界组件
 * React组件级别的错误处理
 */
export class AuthErrorBoundary {
  private static errorCounts: Map<string, number> = new Map();
  private static readonly MAX_ERRORS_PER_MINUTE = 10;

  /**
   * 记录错误并判断是否应该阻止进一步的错误处理
   */
  static shouldHandleError(errorCode: AuthErrorCode, userId?: string): boolean {
    const key = userId ? `${userId}:${errorCode}` : errorCode;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 清理过期的错误计数
    this.cleanupOldErrors(oneMinuteAgo);

    // 获取当前错误计数
    const currentCount = this.errorCounts.get(key) || 0;

    // 如果超过限制，暂时停止处理此类错误
    if (currentCount >= this.MAX_ERRORS_PER_MINUTE) {
      console.warn(`错误处理频率过高，暂时忽略错误 ${key}`);
      return false;
    }

    // 更新错误计数
    this.errorCounts.set(key, currentCount + 1);
    return true;
  }

  /**
   * 清理过期的错误记录
   */
  private static cleanupOldErrors(_cutoffTime: number) {
    // 在实际实现中，这里应该基于时间戳清理旧记录
    // 简化实现：定期清空所有记录
    if (Math.random() < 0.1) {
      // 10%概率清理
      this.errorCounts.clear();
    }
  }
}
