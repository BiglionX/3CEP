/**
 * 通用错误处理系统
 * 提供统一的错误捕获、处理和用户友好提示
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  RefreshCw,
  X,
  WifiOff,
  Lock,
  Server,
  Bug,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

// 错误类型枚举
export enum UniversalErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

// 错误严重程度
export enum UniversalErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 错误信息接口
export interface UniversalError {
  id: string;
  type: UniversalErrorType;
  severity: UniversalErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: number;
  stack?: string;
  component?: string;
  context?: Record<string, any>;
  recoveryAction?: () => void;
}

// 错误处理上下?interface UniversalErrorContextType {
  errors: UniversalError[];
  addError: (error: Omit<UniversalError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  handleError: (error: unknown, context?: Record<string, any>) => void;
  hasCriticalErrors: boolean;
}

// 创建错误上下?const UniversalErrorContext = createContext<
  UniversalErrorContextType | undefined
>(undefined);

// 错误提供商组?export function UniversalErrorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [errors, setErrors] = useState<UniversalError[]>([]);

  // 检查是否有严重错误
  const hasCriticalErrors = errors.some(
    error => error.severity === UniversalErrorSeverity.CRITICAL
  );

  // 添加错误
  const addError = useCallback(
    (error: Omit<UniversalError, 'id' | 'timestamp'>) => {
      const newError: UniversalError = {
        ...error,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      setErrors(prev => [newError, ...prev].slice(0, 10)); // 保持最?0个错?
      // 发送错误到监控服务
      reportErrorToService(newError);

      // 对于严重错误，可能需要特殊的处理
      if (error.severity === UniversalErrorSeverity.CRITICAL) {
        console.error('Critical error occurred:', newError);
      }
    },
    []
  );

  // 移除错误
  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // 清除所有错?  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 统一错误处理函数
  const handleError = useCallback(
    (error: unknown, context?: Record<string, any>) => {
      const universalError = normalizeError(error, context);
      addError(universalError);
    },
    [addError]
  );

  // 错误上下文?  const contextValue: UniversalErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
    hasCriticalErrors,
  };

  return (
    <UniversalErrorContext.Provider value={contextValue}>
      {children}
      <UniversalErrorToastContainer />
    </UniversalErrorContext.Provider>
  );
}

// 使用错误上下文的Hook
export function useUniversalErrorHandler() {
  const context = useContext(UniversalErrorContext);
  if (!context) {
    throw new Error(
      'useUniversalErrorHandler must be used within UniversalErrorProvider'
    );
  }
  return context;
}

// 全局错误边界组件
interface UniversalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    errorInfo?: React.ErrorInfo;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export class UniversalErrorBoundary extends React.Component<
  UniversalErrorBoundaryProps,
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: UniversalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    console.error('Universal Error Boundary caught:', error, errorInfo);

    // 调用自定义错误处理函?    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报?    const errorReport = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // 在开发环境中详细输出
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Universal Error Report');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // sendToErrorMonitoringService(errorReport)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent && this.state.error) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      return (
        <UniversalErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// 统一错误显示组件
function UniversalErrorDisplay({
  error,
  errorInfo,
  resetError,
  showDetails = false,
}: {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  showDetails?: boolean;
}) {
  const [showErrorDetails, setShowErrorDetails] = useState(showDetails);

  // 根据错误类型确定图标和消?  const getErrorDisplayInfo = () => {
    if (!error)
      return {
        icon: AlertTriangle,
        title: '未知错误',
        message: '发生了未知错?,
        color: 'red',
      };

    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('连接')
    ) {
      return {
        icon: WifiOff,
        title: '网络连接问题',
        message: '网络连接似乎出现了问题，请检查您的网络连接后重试?,
        color: 'orange',
      };
    }

    if (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('认证')
    ) {
      return {
        icon: Lock,
        title: '认证失败',
        message: '您的登录状态已过期，请重新登录?,
        color: 'orange',
      };
    }

    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('验证')
    ) {
      return {
        icon: AlertCircle,
        title: '输入验证错误',
        message: '请检查您输入的信息是否正确?,
        color: 'yellow',
      };
    }

    if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('internal') ||
      message.includes('服务?)
    ) {
      return {
        icon: Server,
        title: '服务器错?,
        message: '服务器暂时出现问题，我们的技术团队已经收到通知?,
        color: 'red',
      };
    }

    return {
      icon: Bug,
      title: '应用程序错误',
      message: '抱歉，应用程序遇到了意外错误?,
      color: 'red',
    };
  };

  const { icon: Icon, title, message, color } = getErrorDisplayInfo();

  // 获取颜色?  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'orange':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {/* 错误图标 */}
        <div
          className={`mx-auto w-20 h-20 ${getColorClasses()} rounded-full flex items-center justify-center mb-6`}
        >
          <Icon className="w-10 h-10" />
        </div>

        {/* 错误标题和消?*/}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

        {/* 错误详情（可选展开?*/}
        {error && (
          <div className="mb-8">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
            >
              {showErrorDetails ? '隐藏' : '查看'}详细信息
              <svg
                className={`w-4 h-4 transition-transform ${showErrorDetails ? 'rotate-180' : ''}`}
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

            {showErrorDetails && (
              <div className="mt-4 text-left bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                  {error.toString()}
                  {errorInfo?.componentStack &&
                    `\n\nComponent Stack:\n${errorInfo.componentStack}`}
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
            如果问题持续存在，请联系技术支?          </p>
        </div>
      </div>
    </div>
  );
}

// Toast风格的错误提示容?function UniversalErrorToastContainer() {
  const { errors, removeError } = useUniversalErrorHandler();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {errors.slice(0, 3).map(error => (
        <UniversalErrorToast
          key={error.id}
          error={error}
          onClose={() => removeError(error.id)}
        />
      ))}
    </div>
  );
}

// Toast风格的错误提示组?function UniversalErrorToast({
  error,
  onClose,
}: {
  error: UniversalError;
  onClose: () => void;
}) {
  const getSeverityStyle = () => {
    switch (error.severity) {
      case UniversalErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case UniversalErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case UniversalErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case UniversalErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case UniversalErrorSeverity.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case UniversalErrorSeverity.MEDIUM:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-lg ${getSeverityStyle()} animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start gap-3">
        {getSeverityIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{error.userMessage}</h4>
          <p className="text-xs opacity-80 mt-1">
            {new Date(error.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 错误标准化函?function normalizeError(
  error: unknown,
  context?: Record<string, any>
): Omit<UniversalError, 'id' | 'timestamp'> {
  let errorMessage = '未知错误';
  let errorType = UniversalErrorType.UNKNOWN;
  let severity = UniversalErrorSeverity.MEDIUM;
  let userMessage = '发生了一个错?;

  if (error instanceof Error) {
    errorMessage = error.message;

    // 根据错误消息确定类型和严重程?    const lowerMsg = errorMessage.toLowerCase();

    if (
      lowerMsg.includes('network') ||
      lowerMsg.includes('fetch') ||
      lowerMsg.includes('timeout') ||
      lowerMsg.includes('连接超时') ||
      lowerMsg.includes('网络')
    ) {
      errorType = UniversalErrorType.NETWORK;
      severity = UniversalErrorSeverity.HIGH;
      userMessage = '网络连接出现问题，请检查网络后重试';
    } else if (
      lowerMsg.includes('authentication') ||
      lowerMsg.includes('unauthorized') ||
      lowerMsg.includes('401') ||
      lowerMsg.includes('认证') ||
      lowerMsg.includes('登录')
    ) {
      errorType = UniversalErrorType.AUTHENTICATION;
      severity = UniversalErrorSeverity.HIGH;
      userMessage = '认证失败，请重新登录';
    } else if (
      lowerMsg.includes('validation') ||
      lowerMsg.includes('invalid') ||
      lowerMsg.includes('验证')
    ) {
      errorType = UniversalErrorType.VALIDATION;
      severity = UniversalErrorSeverity.LOW;
      userMessage = '输入信息有误，请检查后重试';
    } else if (
      lowerMsg.includes('server') ||
      lowerMsg.includes('500') ||
      lowerMsg.includes('internal') ||
      lowerMsg.includes('服务?)
    ) {
      errorType = UniversalErrorType.SERVER;
      severity = UniversalErrorSeverity.CRITICAL;
      userMessage = '服务器错误，技术人员已收到通知';
    } else if (lowerMsg.includes('timeout') || lowerMsg.includes('超时')) {
      errorType = UniversalErrorType.TIMEOUT;
      severity = UniversalErrorSeverity.HIGH;
      userMessage = '请求超时，请稍后重试';
    } else {
      errorType = UniversalErrorType.CLIENT;
      severity = UniversalErrorSeverity.MEDIUM;
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
async function reportErrorToService(error: UniversalError) {
  try {
    // 在生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里应该发送到 Sentry、LogRocket 或其他监控服?      /*
      await fetch('/api/errors/report', {
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
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Error reported to monitoring service:', error)} else {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Development mode - Error would be reported:', error)}
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
}

// React Query错误处理Hook
export function useQueryErrorHandler() {
  const { handleError } = useUniversalErrorHandler();

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

// 异步操作错误包装?export async function withUniversalErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // 这里应该使用全局错误处理上下?    console.error('Operation failed:', error, context);
    throw error;
  }
}

// 错误边界兜底组件
export const UniversalErrorFallback = ({
  error,
  resetError,
  errorInfo,
}: {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Bug className="w-8 h-8 text-red-600" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">组件渲染出错</h2>
      <p className="text-gray-600 mb-4">{error.message || '未知错误'}</p>

      <div className="space-y-2">
        <Button
          onClick={resetError}
          className="bg-blue-600 hover:bg-blue-700 w-full"
        >
          重试
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          刷新页面
        </Button>
      </div>
    </div>
  </div>
);
