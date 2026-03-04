import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner'; // 假设使用 sonner 作为 toast �?

// 错误类型枚举
export enum RepairShopErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 错误信息接口
export interface RepairShopError {
  id: string;
  type: RepairShopErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: number;
  retryable: boolean;
  context?: Record<string, any>;
}

// 错误处理配置
interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  showUserNotifications?: boolean;
  logToConsole?: boolean;
}

// Hook返回值接?
interface UseErrorHandlerReturn {
  errors: RepairShopError[];
  addError: (
    error: Error | string | unknown,
    context?: Record<string, any>
  ) => void;
  clearErrors: () => void;
  retryOperation: (operation: () => Promise<any>) => Promise<void>;
  isLoading: boolean;
  hasCriticalError: boolean;
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  autoRetry: true,
  showUserNotifications: true,
  logToConsole: true,
};

export function useRepairShopErrorHandler(
  config: ErrorHandlerConfig = {}
): UseErrorHandlerReturn {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [errors, setErrors] = useState<RepairShopError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 判断是否有严重错?
  const hasCriticalError = errors.some(
    error =>
      error.severity === ErrorSeverity.CRITICAL ||
      error.severity === ErrorSeverity.HIGH
  );

  // 分析错误类型和严重程?
  const analyzeError = (
    error: Error | string | unknown
  ): Omit<RepairShopError, 'id' | 'timestamp'> => {
    let errorMessage =
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : String(error);
    let errorType = RepairShopErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = '操作失败，请稍后重试';
    let retryable = true;

    // 网络相关错误
    if (
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch') ||
      errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('timeout') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_CONNECTION')
    ) {
      errorType = RepairShopErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      userMessage = '网络连接不稳定，请检查网络后重试';
      retryable = true;
    }
    // 服务器错?
    else if (
      errorMessage.toLowerCase().includes('server') ||
      errorMessage.includes('500') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('internal server')
    ) {
      errorType = RepairShopErrorType.SERVER;
      severity = ErrorSeverity.CRITICAL;
      userMessage = '服务器暂时不可用，请稍后再试';
      retryable = true;
    }
    // 客户端错?
    else if (
      errorMessage.toLowerCase().includes('client') ||
      errorMessage.includes('400') ||
      errorMessage.includes('404') ||
      errorMessage.toLowerCase().includes('not found')
    ) {
      errorType = RepairShopErrorType.CLIENT;
      severity = ErrorSeverity.MEDIUM;
      userMessage = '请求的数据不存在或格式错?;
      retryable = false;
    }
    // 验证错误
    else if (
      errorMessage.toLowerCase().includes('validation') ||
      errorMessage.toLowerCase().includes('invalid') ||
      errorMessage.includes('422')
    ) {
      errorType = RepairShopErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      userMessage = '输入信息有误，请检查后重试';
      retryable = false;
    }
    // 超时错误
    else if (
      errorMessage.toLowerCase().includes('timeout') ||
      errorMessage.toLowerCase().includes('exceeded')
    ) {
      errorType = RepairShopErrorType.TIMEOUT;
      severity = ErrorSeverity.HIGH;
      userMessage = '请求超时，请检查网络连?;
      retryable = true;
    }

    return {
      type: errorType,
      severity,
      message: errorMessage,
      userMessage,
      retryable,
    };
  };

  // 添加错误
  const addError = useCallback(
    (error: Error | string | unknown, context?: Record<string, any>) => {
      const analyzedError = analyzeError(error);
      const newError: RepairShopError = {
        ...analyzedError,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        context,
      };

      setErrors(prev => [...prev, newError]);

      // 控制台日?
      if (mergedConfig.logToConsole) {
        console.error('Repair Shop Error:', newError);
      }

      // 用户通知
      if (mergedConfig.showUserNotifications) {
        switch (newError.severity) {
          case ErrorSeverity.CRITICAL:
            toast.error(newError.userMessage, {
              duration: 5000,
              position: 'top-right',
            });
            break;
          case ErrorSeverity.HIGH:
            toast.warning(newError.userMessage, {
              duration: 4000,
              position: 'top-right',
            });
            break;
          case ErrorSeverity.MEDIUM:
            toast.info(newError.userMessage, {
              duration: 3000,
              position: 'bottom-right',
            });
            break;
          default:
            toast(newError.userMessage, {
              duration: 2000,
              position: 'bottom-right',
            });
        }
      }
    },
    [mergedConfig.logToConsole, mergedConfig.showUserNotifications]
  );

  // 清除所有错?
  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
  }, []);

  // 重试操作
  const retryOperation = useCallback(
    async (operation: any: () => Promise<any>) => {
      setIsLoading(true);

      try {
        await operation();
        // 操作成功后清除相关错?
        setErrors(prev => prev.filter(error => error.retryable));
        setRetryCount(0);
      } catch (error) {
        const currentRetryCount = retryCount + 1;
        setRetryCount(currentRetryCount);

        if (
          currentRetryCount < (mergedConfig.maxRetries || 3) &&
          mergedConfig.autoRetry
        ) {
          // 延迟重试
          setTimeout(() => {
            retryOperation(operation);
          }, mergedConfig.retryDelay);
        } else {
          // 达到最大重试次数，添加错误
          addError(error instanceof Error ? error : String(error));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      retryCount,
      mergedConfig.maxRetries,
      mergedConfig.autoRetry,
      mergedConfig.retryDelay,
      addError,
    ]
  );

  // 自动清理旧错误（保留最近的错误?
  useEffect(() => {
    if (errors.length > 10) {
      setErrors(prev => prev.slice(-10)); // 只保留最?0个错?
    }
  }, [errors.length]);

  return {
    errors,
    addError,
    clearErrors,
    retryOperation,
    isLoading,
    hasCriticalError,
  };
}

// 特定场景的错误处理Hook
export function useApiErrorHandler() {
  const errorHandler = useRepairShopErrorHandler({
    maxRetries: 2,
    retryDelay: 1500,
    autoRetry: true,
  });

  const handleApiError = useCallback(
    async (
      apiCall: any: () => Promise<any>,
      onSuccess?: (data: any) => void,
      onError?: (error: RepairShopError) => void
    ) => {
      try {
        const result = await apiCall();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (error) {
        errorHandler.addError(error);
        // 创建一个临时的错误对象用于回调
        const tempError: RepairShopError = {
          id: 'temp-' + Date.now(),
          type: RepairShopErrorType.UNKNOWN,
          severity: ErrorSeverity.MEDIUM,
          message: error instanceof Error ? error.message : String(error),
          userMessage: '操作失败',
          timestamp: Date.now(),
          retryable: true,
        };
        if (onError) onError(tempError);
        throw error;
      }
    },
    [errorHandler]
  );

  return {
    ...errorHandler,
    handleApiError,
  };
}
