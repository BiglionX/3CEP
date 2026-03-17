'use client';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner'; // 假设使用 sonner 作为 toast 库

// 错误类型枚举
export enum RepairShopErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
}

interface ErrorContext {
  timestamp: Date;
  component?: string;
  operation?: string;
  additionalInfo?: Record<string, any>;
}

interface ErrorState {
  error: Error | null;
  errorType: RepairShopErrorType | null;
  context: ErrorContext | null;
  hasError: boolean;
}

interface UseRepairShopErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  onError?: (
    error: Error,
    errorType: RepairShopErrorType,
    context: ErrorContext
  ) => void;
}

export const useRepairShopErrorHandler = (
  options: UseRepairShopErrorHandlerOptions = {}
) => {
  const { showToast = true, logToConsole = true, onError } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorType: null,
    context: null,
    hasError: false,
  });

  const handleError = useCallback(
    (
      error: Error,
      errorType: RepairShopErrorType = RepairShopErrorType.CLIENT,
      context: ErrorContext = {}
    ) => {
      const contextWithTimestamp: ErrorContext = {
        timestamp: new Date(),
        ...context,
      };

      setErrorState({
        error,
        errorType,
        context: contextWithTimestamp,
        hasError: true,
      });

      if (onError) {
        onError(error, errorType, contextWithTimestamp);
      }

      if (logToConsole) {
        console.error('[RepairShopErrorHandler]', {
          error,
          errorType,
          context: contextWithTimestamp,
        });
      }

      if (showToast) {
        const message = getErrorMessage(error, errorType);
        toast.error(message);
      }
    },
    [showToast, logToConsole, onError]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorType: null,
      context: null,
      hasError: false,
    });
  }, []);

  return {
    error: errorState.error,
    errorType: errorState.errorType,
    context: errorState.context,
    hasError: errorState.hasError,
    handleError,
    clearError,
  };
};

function getErrorMessage(error: Error, errorType: RepairShopErrorType): string {
  const typeMessages: Record<RepairShopErrorType, string> = {
    [RepairShopErrorType.NETWORK]: '网络连接错误，请检查您的网络连接',
    [RepairShopErrorType.SERVER]: '服务器错误，请稍后重试',
    [RepairShopErrorType.CLIENT]: '操作失败，请检查输入',
    [RepairShopErrorType.VALIDATION]: '输入数据无效，请检查',
    [RepairShopErrorType.TIMEOUT]: '请求超时，请稍后重试',
  };

  const baseMessage = typeMessages[errorType] || '发生未知错误';
  return error.message ? `${baseMessage}: ${error.message}` : baseMessage;
}
