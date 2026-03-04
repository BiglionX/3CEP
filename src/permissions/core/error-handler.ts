/**
 * 全局错误处理? * 统一管理系统中各种类型的错误和异? */

export interface ErrorInfo {
  id: string;
  timestamp: number;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  tenantId?: string;
  component?: string;
  requestId?: string;
}

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW', // 低优先级，不影响主要功能
  MEDIUM = 'MEDIUM', // 中等优先级，影响部分功能
  HIGH = 'HIGH', // 高优先级，严重影响用户体?  CRITICAL = 'CRITICAL', // 关键错误，系统无法正常运?}

export interface ErrorHandlerConfig {
  captureConsoleErrors?: boolean;
  captureUnhandledRejections?: boolean;
  captureUnhandledExceptions?: boolean;
  sendToMonitoring?: boolean;
  logToFile?: boolean;
  maxErrorHistory?: number;
  ignorePatterns?: RegExp[];
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errors: ErrorInfo[] = [];
  private config: ErrorHandlerConfig;
  private subscribers: Array<(error: ErrorInfo) => void> = [];
  private readonly DEFAULT_CONFIG: ErrorHandlerConfig = {
    captureConsoleErrors: true,
    captureUnhandledRejections: true,
    captureUnhandledExceptions: true,
    sendToMonitoring: false,
    logToFile: false,
    maxErrorHistory: 1000,
    ignorePatterns: [],
  };

  private constructor(config: ErrorHandlerConfig = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.setupGlobalHandlers();
  }

  static getInstance(config?: ErrorHandlerConfig): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler(config);
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * 设置全局错误处理?   */
  private setupGlobalHandlers(): void {
    // 捕获未处理的Promise拒绝
    if (this.config.captureUnhandledRejections) {
      process.on('unhandledRejection', (reason, promise) => {
        this.handleError({
          type: ErrorType.SYSTEM,
          severity: ErrorSeverity.HIGH,
          message: `未处理的Promise拒绝: ${reason}`,
          stack: reason instanceof Error ? reason.stack : undefined,
          context: { promise },
        });
      });
    }

    // 捕获未捕获的异常
    if (this.config.captureUnhandledExceptions) {
      process.on('uncaughtException', error => {
        this.handleError({
          type: ErrorType.SYSTEM,
          severity: ErrorSeverity.CRITICAL,
          message: `未捕获的异常: ${error.message}`,
          stack: error.stack,
          context: { process: 'main' },
        });

        // 在生产环境中，可能需要优雅关?        if (process.env.NODE_ENV === 'production') {
          setTimeout(() => process.exit(1), 1000);
        }
      });
    }

    // 捕获控制台错误（浏览器环境）
    if (typeof window !== 'undefined' && this.config.captureConsoleErrors) {
      const originalError = console.error;
      console.error = (...args) => {
        this.handleConsoleError(args);
        originalError.apply(console, args);
      };
    }
  }

  /**
   * 处理控制台错?   */
  private handleConsoleError(args: any[]): void {
    const message = args
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');

    // 忽略特定模式的错?    if (this.shouldIgnoreError(message)) {
      return;
    }

    this.handleError({
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: `控制台错? ${message}`,
      context: { consoleArgs: args },
    });
  }

  /**
   * 主要错误处理方法
   */
  handleError(errorOptions: {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    stack?: string;
    context?: Record<string, any>;
    userId?: string;
    tenantId?: string;
    component?: string;
    requestId?: string;
  }): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      ...errorOptions,
    };

    // 检查是否应该忽略此错误
    if (this.shouldIgnoreError(errorInfo.message)) {
      return errorInfo;
    }

    // 添加到错误历?    this.errors.unshift(errorInfo);

    // 保持历史记录大小限制
    if (this.errors.length > this.config.maxErrorHistory!) {
      this.errors = this.errors.slice(0, this.config.maxErrorHistory!);
    }

    // 通知订阅?    this.notifySubscribers(errorInfo);

    // 记录到日?    this.logError(errorInfo);

    // 发送到监控系统
    if (this.config.sendToMonitoring) {
      this.sendToMonitoring(errorInfo);
    }

    return errorInfo;
  }

  /**
   * 包装异步函数以捕获错?   */
  async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: { component?: string; userId?: string; tenantId?: string }
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError({
        type: this.determineErrorType(error),
        severity: this.determineErrorSeverity(error),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
      });
      throw error;
    }
  }

  /**
   * 包装同步函数以捕获错?   */
  wrapSync<T>(
    fn: () => T,
    context?: { component?: string; userId?: string; tenantId?: string }
  ): T {
    try {
      return fn();
    } catch (error) {
      this.handleError({
        type: this.determineErrorType(error),
        severity: this.determineErrorSeverity(error),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
      });
      throw error;
    }
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(error: any): ErrorType {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') return ErrorType.VALIDATION;
      if (error.name === 'AuthenticationError') return ErrorType.AUTHENTICATION;
      if (error.name === 'AuthorizationError') return ErrorType.AUTHORIZATION;
      if (error.message.includes('database') || error.message.includes('db')) {
        return ErrorType.DATABASE;
      }
      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return ErrorType.NETWORK;
      }
    }
    return ErrorType.UNKNOWN;
  }

  /**
   * 确定错误严重程度
   */
  private determineErrorSeverity(error: any): ErrorSeverity {
    if (error instanceof Error) {
      if (
        error.message.includes('critical') ||
        error.message.includes('fatal')
      ) {
        return ErrorSeverity.CRITICAL;
      }
      if (
        error.message.includes('validation') ||
        error.message.includes('auth')
      ) {
        return ErrorSeverity.HIGH;
      }
    }
    return ErrorSeverity.MEDIUM;
  }

  /**
   * 检查是否应该忽略错?   */
  private shouldIgnoreError(message: string): boolean {
    return this.config?.some(pattern => pattern.test(message)) || false;
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录错误到日?   */
  private logError(error: ErrorInfo): void {
    const logMessage =
      `[${new Date(error.timestamp).toISOString()}] ` +
      `[${error.severity}] ` +
      `[${error.type}] ` +
      `${error.message}`;

    if (process.env.NODE_ENV === 'development') {
      console.error(logMessage);
      if (error.stack) {
        console.error(error.stack);
      }
    }

    // 如果配置了文件日?    if (this.config.logToFile) {
      // 这里可以实现文件日志记录
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('文件日志记录:', logMessage)}
  }

  /**
   * 发送错误到监控系统
   */
  private sendToMonitoring(error: ErrorInfo): void {
    // 这里可以集成具体的监控系统如 Sentry, DataDog �?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('发送到监控系统:', {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      message: error.message,
    })}

  /**
   * 通知订阅?   */
  private notifySubscribers(error: ErrorInfo): void {
    this.subscribers.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('错误订阅者回调执行失?', callbackError);
      }
    });
  }

  /**
   * 公共API方法
   */

  subscribe(callback: (error: ErrorInfo) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  getErrors(filter?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    since?: number;
  }): ErrorInfo[] {
    let filteredErrors = [...this.errors];

    if (filter?.type) {
      filteredErrors = filteredErrors.filter(e => e.type === filter.type);
    }

    if (filter?.severity) {
      filteredErrors = filteredErrors.filter(
        e => e.severity === filter.severity
      );
    }

    if (filter?.since) {
      filteredErrors = filteredErrors.filter(e => e.timestamp >= filter.since!);
    }

    return filteredErrors;
  }

  getErrorStats(): any {
    const stats: any = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.errors.filter(
        e => e.timestamp > Date.now() - 3600000 // 最?小时
      ).length,
    };

    // 按类型统?    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    // 按严重程度统?    this.errors.forEach(error => {
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  clearErrors(): void {
    this.errors = [];
  }

  destroy(): void {
    this.subscribers = [];
    this.errors = [];
    // 移除全局处理?    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
  }
}
