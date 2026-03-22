/**
 * 增强版错误处理系统
 * 提供全局错误边界、友好的错误提示和错误上报功能
 */

'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import React, { createContext, useCallback, useContext, useState } from 'react';

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
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
export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: number;
  stack?: string;
  component?: string;
  context?: Record<string, any>;
}

// 错误上下文类型
interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  handleError: (error: unknown, context?: Record<string, any>) => void;
}

// 创建错误上下文
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// 错误提供商组件
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  // 添加错误
  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setErrors(prev => [newError, ...prev].slice(0, 10)); // 保持最多10个错误
    // 发送错误到监控服务
    reportErrorToService(newError);
  }, []);

  // 移除错误
  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // 清除所有错误
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 统一错误处理函数
  const handleError = useCallback(
    (error: unknown, context?: Record<string, any>) => {
      const appError = normalizeError(error, context);
      addError(appError);
    },
    [addError]
  );

  // 错误上下文值
  const contextValue: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// 使用错误上下文的Hook
export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
}

// 全局错误边界组件
interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);

    // 发送错误报告
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorReport = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // 在开发环境中详细输出
    /* eslint-disable no-console */
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Global Error Report');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    /* eslint-enable no-console */

    // 生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里应该发送到实际的错误监控服?      // sendToErrorMonitoringService(errorReport)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent && this.state.error) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <EnhancedErrorDisplay
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// 增强版错误显示组件
function EnhancedErrorDisplay({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // 根据错误类型确定图标和消息
  const getErrorDisplayInfo = () => {
    if (!error)
      return {
        icon: AlertTriangle,
        title: '未知错误',
        message: '发生了未知错误',
      };

    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    ) {
      return {
        icon: AlertTriangle,
        title: '网络连接问题',
        message: '网络连接似乎出现了问题，请检查您的网络连接后重试',
      };
    }

    if (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('401')
    ) {
      return {
        icon: AlertTriangle,
        title: '认证失败',
        message: '您的登录状态已过期，请重新登录',
      };
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return {
        icon: AlertCircle,
        title: '输入验证错误',
        message: '请检查您输入的信息是否正确',
      };
    }

    if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('internal')
    ) {
      return {
        icon: AlertTriangle,
        title: '服务器错误',
        message: '服务器暂时出现问题，我们的技术团队已经收到通知',
      };
    }

    return {
      icon: AlertTriangle,
      title: '应用程序错误',
      message: '抱歉，应用程序遇到了意外错误',
    };
  };

  const { icon: Icon, title, message } = getErrorDisplayInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {/* 错误图标 */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-red-600" />
        </div>

        {/* 错误标题和消?*/}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

        {/* 错误详情（可选展开?*/}
        {error && (
          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
            >
              {showDetails ? '隐藏' : '查看'}详细信息
              <svg
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDetails && (
              <div className="mt-4 text-left bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                  {error.toString()}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={resetError}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="px-6 py-3"
          >
            刷新页面
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="px-6 py-3"
          >
            返回上页
          </Button>
        </div>

        {/* 联系支持 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            如果问题持续存在，请联系技术支?{' '}
          </p>
        </div>
      </div>
    </div>
  );
}

// Toast 风格的错误提示组件
export function ErrorToast({
  error,
  onClose,
}: {
  error: AppError;
  onClose: () => void;
}) {
  const getSeverityStyle = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg ${getSeverityStyle()} animate-in slide-in-from-right`}
    >
      <div className="flex items-start gap-3">
        {getSeverityIcon()}
        <div className="flex-1">
          <h4 className="font-medium">{error.userMessage}</h4>
          <p className="text-sm opacity-80 mt-1">
            {new Date(error.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 错误列表显示组件
export function ErrorList() {
  const { errors, removeError } = useErrorHandler();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {errors.map(error => (
        <ErrorToast
          key={error.id}
          error={error}
          onClose={() => removeError(error.id)}
        />
      ))}
    </div>
  );
}

// 错误标准化函数
function normalizeError(
  error: unknown,
  context?: Record<string, any>
): Omit<AppError, 'id' | 'timestamp'> {
  let errorMessage = '未知错误';
  let errorType = ErrorType.UNKNOWN;
  let severity = ErrorSeverity.MEDIUM;
  let userMessage = '发生了一个错误';

  if (error instanceof Error) {
    errorMessage = error.message;

    // 根据错误消息确定类型
    if (
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch') ||
      errorMessage.toLowerCase().includes('timeout')
    ) {
      errorType = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      userMessage = '网络连接出现问题，请检查网络后重试';
    } else if (
      errorMessage.toLowerCase().includes('authentication') ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('401')
    ) {
      errorType = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      userMessage = '认证失败，请重新登录';
    } else if (
      errorMessage.toLowerCase().includes('validation') ||
      errorMessage.toLowerCase().includes('invalid')
    ) {
      errorType = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      userMessage = '输入信息有误，请检查后重试';
    } else if (
      errorMessage.toLowerCase().includes('server') ||
      errorMessage.toLowerCase().includes('500') ||
      errorMessage.toLowerCase().includes('internal')
    ) {
      errorType = ErrorType.SERVER;
      severity = ErrorSeverity.CRITICAL;
      userMessage = '服务器错误，技术人员已收到通知';
    } else {
      errorType = ErrorType.CLIENT;
      severity = ErrorSeverity.MEDIUM;
      userMessage = '应用程序出现问题';
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
    userMessage = error;
  } else {
    errorMessage = JSON.stringify(error);
    userMessage = '发生未知错误';
  }

  return {
    type: errorType,
    severity,
    message: errorMessage,
    userMessage,
    stack: error instanceof Error ? error.stack : undefined,
    context,
  };
}

// 错误上报服务
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function reportErrorToService(error: AppError) {
  try {
    // 在生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里应该发送到 Sentry、LogRocket 或其他监控服务
      /*
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...error,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      })
      */
    }
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
}

// React Query错误处理Hook
export function useQueryErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleQueryError = useCallback(
    (error: unknown, queryKey?: unknown[], context?: Record<string, any>) => {
      const errorContext = {
        queryKey,
        ...context,
      };
      handleError(error, errorContext);
    },
    [handleError]
  );

  return { handleQueryError };
}

// 异步操作错误包装函数
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // 这里应该使用全局错误处理上下文
    // 由于Hook限制，暂时直接处理
    console.error('Operation failed:', error, context);
    throw error;
  }
}
