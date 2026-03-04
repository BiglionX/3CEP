/**
 * 错误处理系统演示页面
 * 展示各种错误处理机制和用户界? */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bug,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  WifiOff,
  Lock,
  Server,
  User,
  Settings,
} from 'lucide-react';
import {
  GlobalErrorBoundary,
  ErrorProvider,
  useErrorHandler,
  ErrorList,
  ErrorType,
  ErrorSeverity,
  withErrorHandling,
} from '@/components/error-handling';

// 演示组件 - 会故意抛出错?function ErrorDemoComponent({ errorType }: { errorType: string }) {
  const { handleError } = useErrorHandler();

  const triggerError = () => {
    switch (errorType) {
      case 'network':
        handleError(new Error('Network connection failed'), {
          component: 'NetworkDemo',
        });
        break;
      case 'auth':
        handleError(new Error('Authentication failed: Invalid credentials'), {
          component: 'AuthDemo',
        });
        break;
      case 'validation':
        handleError(new Error('Validation error: Invalid email format'), {
          component: 'ValidationDemo',
        });
        break;
      case 'server':
        handleError(new Error('Server error 500: Internal server error'), {
          component: 'ServerDemo',
        });
        break;
      case 'client':
        throw new Error('Client-side rendering error occurred');
      default:
        handleError(new Error('Unknown error type'), {
          component: 'UnknownDemo',
        });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-medium mb-3 capitalize">{errorType} Error Demo</h3>
      <Button onClick={triggerError} variant="outline" size="sm">
        Trigger {errorType} Error
      </Button>
    </div>
  );
}

// 异步错误演示
function AsyncErrorDemo() {
  const { handleError } = useErrorHandler();

  const simulateAsyncError = async () => {
    try {
      await withErrorHandling(
        async () => {
          // 模拟API调用失败
          await new Promise((_, reject) => {
            setTimeout(() => reject(new Error('API request timeout')), 1000);
          });
        },
        { operation: 'api-call-demo' }
      );
    } catch (error) {
      handleError(error, {
        component: 'AsyncDemo',
        operation: 'simulated-api-call',
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-medium mb-3">Async Error Handling</h3>
      <Button onClick={simulateAsyncError} variant="outline" size="sm">
        Simulate API Error
      </Button>
    </div>
  );
}

// 错误类型展示卡片
function ErrorTypeCard({
  type,
  title,
  description,
  icon: Icon,
  severity,
}: {
  type: ErrorType;
  title: string;
  description: string;
  icon: any;
  severity: ErrorSeverity;
}) {
  const getSeverityColor = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case ErrorSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ErrorSeverity.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Type: {type}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor()}`}
          >
            {severity}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// 主演示组?function ErrorHandlingDemo() {
  const [showBoundaryError, setShowBoundaryError] = useState(false);

  // 故意触发边界错误的组?  const BoundaryErrorTrigger = () => {
    // @ts-ignore
    if (showBoundaryError) {
      throw new Error(
        'This is a boundary error that will be caught by ErrorBoundary'
      );
    }
    return (
      <div className="p-4 bg-white rounded-lg border">
        <h3 className="font-medium mb-3">Error Boundary Test</h3>
        <Button
          onClick={() => setShowBoundaryError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger Boundary Error
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          错误处理系统演示
        </h1>
        <p className="text-gray-600">展示增强版错误边界和用户友好的错误提?/p>
      </div>

      {/* 错误类型概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ErrorTypeCard
          type={ErrorType.NETWORK}
          title="网络错误"
          description="处理连接超时、断网等网络相关问题"
          icon={WifiOff}
          severity={ErrorSeverity.HIGH}
        />
        <ErrorTypeCard
          type={ErrorType.AUTHENTICATION}
          title="认证错误"
          description="处理登录失败、令牌过期等认证问题"
          icon={Lock}
          severity={ErrorSeverity.HIGH}
        />
        <ErrorTypeCard
          type={ErrorType.VALIDATION}
          title="验证错误"
          description="处理表单验证、输入格式等验证问题"
          icon={User}
          severity={ErrorSeverity.LOW}
        />
        <ErrorTypeCard
          type={ErrorType.SERVER}
          title="服务器错?
          description="处理500错误、服务不可用等服务器问题"
          icon={Server}
          severity={ErrorSeverity.CRITICAL}
        />
        <ErrorTypeCard
          type={ErrorType.CLIENT}
          title="客户端错?
          description="处理前端渲染、JavaScript错误等客户端问题"
          icon={Bug}
          severity={ErrorSeverity.MEDIUM}
        />
        <ErrorTypeCard
          type={ErrorType.UNKNOWN}
          title="未知错误"
          description="处理无法分类的其他类型错?
          icon={AlertTriangle}
          severity={ErrorSeverity.MEDIUM}
        />
      </div>

      {/* 错误触发演示?*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              错误触发演示
            </CardTitle>
            <CardDescription>
              点击按钮触发不同类型的应用程序错?            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorDemoComponent errorType="network" />
            <ErrorDemoComponent errorType="auth" />
            <ErrorDemoComponent errorType="validation" />
            <ErrorDemoComponent errorType="server" />
            <AsyncErrorDemo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              错误边界测试
            </CardTitle>
            <CardDescription>测试全局错误边界捕获未处理的错误</CardDescription>
          </CardHeader>
          <CardContent>
            <GlobalErrorBoundary>
              <BoundaryErrorTrigger />
            </GlobalErrorBoundary>
          </CardContent>
        </Card>
      </div>

      {/* 错误统计和监?*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            错误监控面板
          </CardTitle>
          <CardDescription>实时显示应用程序错误统计和监控信?/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-gray-600">严重错误</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-sm text-gray-600">高优先级</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-sm text-gray-600">中等优先?/div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">低优先级</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">系统健康状?/h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">错误处理系统运行正常</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">监控服务连接正常</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm">最?4小时?个未处理错误</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 包装组件以提供错误上下文
export default function ErrorHandlingDemoPage() {
  return (
    <ErrorProvider>
      <ErrorHandlingDemo />
      <ErrorList />
    </ErrorProvider>
  );
}

