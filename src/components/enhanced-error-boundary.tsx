'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    errorInfo?: ErrorInfo;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Error Boundary caught:', error, errorInfo);

    // 调用外部错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 发送错误报告到监控服务
    this.reportError(error, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 在生产环境中发送到监控服务
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            errorInfo: {
              componentStack: errorInfo.componentStack,
            },
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, showDetails = false } = this.props;

      // 如果提供了自定义fallback组件
      if (FallbackComponent && this.state.error) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleReset}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      // 默认错误界面
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                抱歉，出现了一些问?
              </CardTitle>
              <p className="text-gray-600 mt-2">
                我们的技术团队已经收到通知，正在紧急处理中?
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 错误详情（可选） */}
              {showDetails && this.state.error && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Bug className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        错误详情
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-mono break-words">
                          {this.state.error.message}
                        </p>
                        {this.state?.componentStack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              组件堆栈信息
                            </summary>
                            <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 可能的原?*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">可能的原因</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 网络连接不稳定</li>
                    <li>• 服务器临时故障</li>
                    <li>• 浏览器兼容性问题</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    您可以尝?
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• 刷新当前页面</li>
                    <li>• 检查网络连接</li>
                    <li>• 稍后再试</li>
                  </ul>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新页面
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 自定义错误Fallback组件示例
export const ErrorFallback = ({
  error,
  resetError,
  errorInfo,
}: {
  error: Error;
  resetError: () => void;
  errorInfo?: ErrorInfo;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          应用程序错误
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{error.message || '发生未知错误'}</p>
        {errorInfo?.componentStack && (
          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600">查看详情</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={resetError} className="w-full">
          重试
        </Button>
      </CardFooter>
    </Card>
  </div>
);
