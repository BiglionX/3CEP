/**
 * API拦截器系统演示页? * 展示完整的API请求拦截、认证和安全功能
 */

'use client';

import { useState } from 'react';
import {
  Shield,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Network,
  Lock,
  Globe,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ApiInterceptorProvider,
  useApiInterceptor,
  createAuthInterceptor,
  createSecurityInterceptor,
  createLoggingInterceptor,
} from '@/components/api-interceptor/ApiInterceptorManager';
import { InterceptorManagementPanel } from '@/components/api-interceptor/InterceptorManagementPanel';

// 演示组件
function ApiInterceptorDemo() {
  const {
    config,
    updateConfig,
    registerInterceptor,
    setAuthToken,
    getAuthToken,
    clearAuthToken,
    isAuthenticated,
    activeRequests,
    stats,
  } = useApiInterceptor();

  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState(0);

  // 初始化演示拦截器
  const initializeDemo = () => {
    // 认证拦截?    const authInterceptor = createAuthInterceptor({
      tokenGetter: getAuthToken,
      tokenSetter: setAuthToken,
      unauthorizedRedirect: '/login',
    });
    registerInterceptor('demo-auth', authInterceptor);

    // 安全拦截?    const securityInterceptor = createSecurityInterceptor({
      enableCSRF: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 30,
    });
    registerInterceptor('demo-security', securityInterceptor);

    // 日志拦截?    const loggingInterceptor = createLoggingInterceptor({
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
    });
    registerInterceptor('demo-logging', loggingInterceptor);
  };

  // 运行测试套件
  const runTestSuite = async () => {
    const tests = [
      {
        name: '公共API测试',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        description: '测试基本的GET请求拦截',
      },
      {
        name: '认证API测试',
        url: 'https://httpbin.org/bearer',
        description: '测试JWT认证拦截',
        headers: { Authorization: 'Bearer demo-token-123' },
      },
      {
        name: 'POST请求测试',
        url: 'https://httpbin.org/post',
        method: 'POST',
        description: '测试POST请求和安全头',
        body: JSON.stringify({ test: 'data' }),
      },
      {
        name: '错误处理测试',
        url: 'https://httpbin.org/status/404',
        description: '测试错误拦截和日?,
      },
    ];

    setTestResults([]);
    setCurrentTest(0);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setCurrentTest(i + 1);

      try {
        const startTime = Date.now();

        const response = await fetch(test.url, {
          method: test.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...test.headers,
          },
          body: test.body,
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const result = {
          ...test,
          status: 'success',
          response: {
            status: response.status,
            statusText: response.statusText,
            responseTime,
          },
          timestamp: new Date().toISOString(),
        };

        setTestResults(prev => [...prev, result]);
      } catch (error) {
        const result = {
          ...test,
          status: 'error',
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        };

        setTestResults(prev => [...prev, result]);
      }
    }

    setCurrentTest(0);
  };

  // 设置演示token
  const setDemoToken = () => {
    setAuthToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            API拦截器演?          </h1>
          <p className="text-gray-600">
            展示企业级API请求拦截、认证和安全保护功能
          </p>
        </div>

        {/* 系统状态概?*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                活跃请求
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeRequests}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                成功?              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalRequests > 0
                  ? `${Math.round((stats.successfulRequests / stats.totalRequests) * 100)}%`
                  : '0%'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4" />
                总请求数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                平均响应时间
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.averageResponseTime)}ms
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要功能区域 */}
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">功能演示</TabsTrigger>
            <TabsTrigger value="management">拦截器管?/TabsTrigger>
            <TabsTrigger value="monitoring">监控分析</TabsTrigger>
          </TabsList>

          <TabsContent value="demo">
            <div className="space-y-6">
              {/* 认证演示 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    认证功能演示
                  </CardTitle>
                  <CardDescription>展示JWT认证拦截和Token管理</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button onClick={setDemoToken}>
                      <Key className="w-4 h-4 mr-2" />
                      设置演示Token
                    </Button>
                    <Button onClick={clearAuthToken} variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      清除Token
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">认证状?</span>
                    {isAuthenticated ? (
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已认?                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        未认?                      </Badge>
                    )}
                  </div>

                  {isAuthenticated && (
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-blue-800">
                        <strong>当前Token:</strong>{' '}
                        {getAuthToken()?.substring(0, 20)}...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 测试套件 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    API测试套件
                  </CardTitle>
                  <CardDescription>运行综合测试验证拦截器功?/CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button onClick={initializeDemo} variant="secondary">
                      <Shield className="w-4 h-4 mr-2" />
                      初始化演?                    </Button>
                    <Button onClick={runTestSuite}>
                      <Zap className="w-4 h-4 mr-2" />
                      运行测试套件
                    </Button>
                  </div>

                  {currentTest > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      <span>正在运行测试 {currentTest}/4...</span>
                    </div>
                  )}

                  {testResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">测试结果:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded border ${
                              result.status === 'success'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{result.name}</span>
                              {result.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>{result.description}</div>
                              {result.response && (
                                <div>
                                  状? {result.response.status} (
                                  {result.response.statusText})
                                </div>
                              )}
                              {result?.responseTime && (
                                <div>
                                  耗时: {result.response.responseTime}ms
                                </div>
                              )}
                              {result.error && (
                                <div className="text-red-600">
                                  错误: {result.error}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 功能特性展?*/}
              <Card>
                <CardHeader>
                  <CardTitle>核心功能特?/CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">统一认证</h3>
                      </div>
                      <p className="text-sm text-blue-600">
                        自动添加JWT Token，支持Token刷新和过期处?                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-green-600" />
                        <h3 className="font-medium text-green-800">安全保护</h3>
                      </div>
                      <p className="text-sm text-green-600">
                        CSRF防护、速率限制、请求验证等安全机制
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <h3 className="font-medium text-purple-800">
                          智能重试
                        </h3>
                      </div>
                      <p className="text-sm text-purple-600">
                        网络错误自动重试，指数退避算法优?                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Network className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-800">
                          请求监控
                        </h3>
                      </div>
                      <p className="text-sm text-yellow-600">
                        完整的请求日志、性能统计和错误追?                      </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-medium text-red-800">错误处理</h3>
                      </div>
                      <p className="text-sm text-red-600">
                        统一错误处理机制，友好的错误提示
                      </p>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Server className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-medium text-indigo-800">
                          缓存优化
                        </h3>
                      </div>
                      <p className="text-sm text-indigo-600">
                        智能响应缓存，减少重复请求提高性能
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <InterceptorManagementPanel />
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>实时监控面板</CardTitle>
                <CardDescription>API请求的实时监控和性能分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>监控面板功能正在开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 页面导出
export default function ApiInterceptorDemoPage() {
  return (
    <ApiInterceptorProvider>
      <ApiInterceptorDemo />
    </ApiInterceptorProvider>
  );
}

