/**
 * 分级错误处理Hook
 * 提供React应用中的分级错误处理功能
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TieredErrorHandler,
  ErrorHandlingResult,
  RetryPolicy,
  EscalationPolicy,
} from '../core/tiered-error-handler';
import { ErrorInfo, ErrorType, ErrorSeverity } from '../core/error-handler';

export interface UseTieredErrorHandlerOptions {
  autoHandle?: boolean;
  component?: string;
  userId?: string;
  tenantId?: string;
}

export interface TieredErrorHandlerHookResult {
  // 状?  isProcessing: boolean;
  strategyStats: any;
  pendingErrors: ErrorInfo[];

  // 操作函数
  handleCustomError: (
    error: any,
    strategyName: string,
    context?: Record<string, any>
  ) => Promise<ErrorHandlingResult>;

  registerCustomStrategy: (
    name: string,
    handler: (error: ErrorInfo) => Promise<ErrorHandlingResult>,
    errorTypes?: ErrorType[],
    severities?: ErrorSeverity[]
  ) => void;

  setCustomRetryPolicy: (errorType: ErrorType, policy: RetryPolicy) => void;
  setCustomEscalationPolicy: (
    severity: ErrorSeverity,
    policy: EscalationPolicy
  ) => void;

  getPendingErrorsByType: (type: ErrorType) => ErrorInfo[];
  clearProcessingQueue: () => void;

  // 预定义处理函?  handleNetworkError: (error: any) => Promise<ErrorHandlingResult>;
  handleAuthError: (error: any) => Promise<ErrorHandlingResult>;
  handleBusinessError: (error: any) => Promise<ErrorHandlingResult>;
}

export function useTieredErrorHandler(
  options: UseTieredErrorHandlerOptions = {}
): TieredErrorHandlerHookResult {
  const { autoHandle = true, component, userId, tenantId } = options;

  // 状态管?  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingErrors, setPendingErrors] = useState<ErrorInfo[]>([]);

  // 获取处理器实?  const tieredHandler = useMemo(() => TieredErrorHandler.getInstance(), []);

  // 处理自定义错?  const handleCustomError = useCallback(
    async (
      error: any,
      strategyName: string,
      context: Record<string, any> = {}
    ): Promise<ErrorHandlingResult> => {
      setIsProcessing(true);

      try {
        const errorInfo: ErrorInfo = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: error.type || ErrorType.UNKNOWN,
          severity: error.severity || ErrorSeverity.MEDIUM,
          message: error.message || String(error),
          stack: error.stack,
          context: {
            ...context,
            component: component || context.component,
            userId: userId || context.userId,
            tenantId: tenantId || context.tenantId,
            strategy: strategyName,
          },
        };

        const result: ErrorHandlingResult = {
          status: 'handled',
          message: `使用策略 ${strategyName} 处理错误`,
        };

        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [component, userId, tenantId]
  );

  // 注册自定义策?  const registerCustomStrategy = useCallback(
    (
      name: string,
      handler: (error: ErrorInfo) => Promise<ErrorHandlingResult>,
      errorTypes: ErrorType[] = [],
      severities: ErrorSeverity[] = []
    ) => {
      tieredHandler['registerStrategy']({
        name,
        errorTypes,
        severities,
        handler,
        enabled: true,
        priority: 50,
      });
    },
    [tieredHandler]
  );

  // 设置自定义重试策?  const setCustomRetryPolicy = useCallback(
    (errorType: ErrorType, policy: RetryPolicy) => {
      tieredHandler['setRetryPolicy'](errorType, policy);
    },
    [tieredHandler]
  );

  // 设置自定义升级策?  const setCustomEscalationPolicy = useCallback(
    (severity: ErrorSeverity, policy: EscalationPolicy) => {
      tieredHandler['setEscalationPolicy'](severity, policy);
    },
    [tieredHandler]
  );

  // 按类型获取待处理错误
  const getPendingErrorsByType = useCallback(
    (type: ErrorType): ErrorInfo[] => {
      return pendingErrors.filter(error => error.type === type);
    },
    [pendingErrors]
  );

  // 清理处理队列
  const clearProcessingQueue = useCallback(() => {
    setPendingErrors([]);
  }, []);

  // 预定义处理函?  const handleNetworkError = useCallback(
    async (error: any): Promise<ErrorHandlingResult> => {
      return handleCustomError(error, 'network-retry-handler', {
        category: 'network',
      });
    },
    [handleCustomError]
  );

  const handleAuthError = useCallback(
    async (error: any): Promise<ErrorHandlingResult> => {
      return handleCustomError(error, 'authentication-handler', {
        category: 'auth',
      });
    },
    [handleCustomError]
  );

  const handleBusinessError = useCallback(
    async (error: any): Promise<ErrorHandlingResult> => {
      return handleCustomError(error, 'business-logic-handler', {
        category: 'business',
      });
    },
    [handleCustomError]
  );

  // 监控处理队列
  useEffect(() => {
    if (!autoHandle) return;

    const interval = setInterval(() => {
      const stats = tieredHandler.getStrategyStats();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [autoHandle, tieredHandler]);

  // 获取策略统计
  const strategyStats = useMemo(() => {
    return tieredHandler.getStrategyStats();
  }, [tieredHandler]);

  return {
    // 状?    isProcessing,
    strategyStats,
    pendingErrors,

    // 操作函数
    handleCustomError,
    registerCustomStrategy,
    setCustomRetryPolicy,
    setCustomEscalationPolicy,
    getPendingErrorsByType,
    clearProcessingQueue,

    // 预定义处理函?    handleNetworkError,
    handleAuthError,
    handleBusinessError,
  };
}
