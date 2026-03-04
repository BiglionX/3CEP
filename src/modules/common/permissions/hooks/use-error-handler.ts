/**
 * 错误处理Hook
 * 提供React应用中的错误管理和处理功? */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GlobalErrorHandler,
  ErrorInfo,
  ErrorType,
  ErrorSeverity,
} from '../core/error-handler';

export interface UseErrorHandlerOptions {
  autoCapture?: boolean;
  component?: string;
  userId?: string;
  tenantId?: string;
}

export interface ErrorHandlerHookResult {
  // 错误状?  errors: ErrorInfo[];
  errorStats: any;
  hasCriticalErrors: boolean;

  // 操作函数
  captureError: (error: any, context?: Record<string, any>) => void;
  getFilteredErrors: (filter?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
  }) => ErrorInfo[];
  clearErrors: () => void;
  retryLastOperation: () => void;

  // 状?  isLoading: boolean;
  lastError: ErrorInfo | null;
}

export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): ErrorHandlerHookResult {
  const { autoCapture = true, component, userId, tenantId } = options;

  // 状态管?  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<ErrorInfo | null>(null);

  // 获取错误处理器实?  const errorHandler = useMemo(() => GlobalErrorHandler.getInstance(), []);

  // 捕获错误
  const captureError = useCallback(
    (error: any, context: Record<string, any> = {}) => {
      const errorInfo = errorHandler.handleError({
        type: error.type || ErrorType.UNKNOWN,
        severity: error.severity || ErrorSeverity.MEDIUM,
        message: error.message || String(error),
        stack: error.stack,
        context: {
          ...context,
          component: component || context.component,
          userId: userId || context.userId,
          tenantId: tenantId || context.tenantId,
        },
      });

      setLastError(errorInfo);
      return errorInfo;
    },
    [errorHandler, component, userId, tenantId]
  );

  // 获取过滤后的错误
  const getFilteredErrors = useCallback(
    (filter?: { type?: ErrorType; severity?: ErrorSeverity }) => {
      return errorHandler.getErrors(filter);
    },
    [errorHandler]
  );

  // 清除错误
  const clearErrors = useCallback(() => {
    errorHandler.clearErrors();
    setErrors([]);
    setLastError(null);
  }, [errorHandler]);

  // 重试上次操作
  const retryLastOperation = useCallback(() => {
    // 这里可以实现重试逻辑
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('重试上次操作')}, []);

  // 自动捕获错误
  useEffect(() => {
    if (!autoCapture) return;

    const unsubscribe = errorHandler.subscribe(error => {
      setErrors(prev => [error, ...prev].slice(0, 100)); // 限制错误数量
      setLastError(error);
    });

    return () => {
      unsubscribe();
    };
  }, [autoCapture, errorHandler]);

  // 计算错误统计
  const errorStats = useMemo(() => {
    return errorHandler.getErrorStats();
  }, [errors, errorHandler]);

  // 检查是否有关键错误
  const hasCriticalErrors = useMemo(() => {
    return errors.some(error => error.severity === ErrorSeverity.CRITICAL);
  }, [errors]);

  return {
    // 数据
    errors,
    errorStats,
    hasCriticalErrors,
    lastError,

    // 操作函数
    captureError,
    getFilteredErrors,
    clearErrors,
    retryLastOperation,

    // 状?    isLoading,
  };
}
