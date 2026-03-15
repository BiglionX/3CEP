/**
 * API拦截器管理面板
 * 提供拦截器配置、监控和调试功能
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Server,
  Network,
  RefreshCw,
  // Pause, // 未使用
  // Eye, // 未使用
  // EyeOff, // 未使用
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useApiInterceptor,
  createAuthInterceptor,
  createSecurityInterceptor,
  createLoggingInterceptor,
  createRetryInterceptor,
  createCacheInterceptor,
} from './ApiInterceptorManager';

interface InterceptorManagementPanelProps {
  className?: string;
}

export function InterceptorManagementPanel({
  className = '',
}: InterceptorManagementPanelProps) {
  const {
    config: _config,
    updateConfig: _updateConfig,
    registerInterceptor,
    unregisterInterceptor,
    getInterceptors,
    setAuthToken,
    getAuthToken,
    clearAuthToken,
    isAuthenticated,
    activeRequests,
    stats,
  } = useApiInterceptor();

  const [newInterceptor, setNewInterceptor] = useState({
    name: '',
    type: 'auth',
    enabled: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testUrl, setTestUrl] = useState(
    'https://jsonplaceholder.typicode.com/posts/1'
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [securityEnabled, setSecurityEnabled] = useState(true);
  const [retryEnabled, setRetryEnabled] = useState(true);

  // 初始化默认拦截器
  useEffect(() => {
    // 认证拦截器
    const authInterceptor = createAuthInterceptor({
      tokenGetter: getAuthToken,
      tokenSetter: setAuthToken,
      unauthorizedRedirect: '/login',
    });
    registerInterceptor('auth', authInterceptor);

    // 安全拦截器
    const securityInterceptor = createSecurityInterceptor({
      enableCSRF: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
    });
    registerInterceptor('security', securityInterceptor);

    // 日志拦截器
    const loggingInterceptor = createLoggingInterceptor({
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
      logLevel: 'debug',
    });
    registerInterceptor('logging', loggingInterceptor);

    // 重试拦截器
    const retryInterceptor = createRetryInterceptor(3, 1000);
    registerInterceptor('retry', retryInterceptor);

    // 缓存拦截器
    const cacheInterceptor = createCacheInterceptor();
    registerInterceptor('cache', cacheInterceptor);
  }, []);

  // 测试API请求
  const testApiRequest = async () => {
    try {
      setTestResult({ status: 'loading' });

      const response = await fetch(testUrl);
      const data = await response.json();

      setTestResult({
        status: 'success',
        data,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        error: (error as Error).message,
      });
    }
  };

  // 添加新拦截器
  const handleAddInterceptor = () => {
    const interceptorCreators: Record<string, Function> = {
      auth: () =>
        createAuthInterceptor({
          tokenGetter: getAuthToken,
          tokenSetter: setAuthToken,
        }),
      security: () =>
        createSecurityInterceptor({
          enableCSRF: true,
          enableRateLimiting: true,
        }),
      logging: () =>
        createLoggingInterceptor({
          enableRequestLogging: true,
          enableResponseLogging: true,
        }),
      retry: () => createRetryInterceptor(3, 1000),
      cache: () => createCacheInterceptor(),
    };

    const creator = interceptorCreators[newInterceptor.type];
    if (creator) {
      const interceptor = creator();
      registerInterceptor(newInterceptor.name, interceptor);
      setDialogOpen(false);
      setNewInterceptor({ name: '', type: 'auth', enabled: true });
    }
  };

  // 切换拦截器状态
  const toggleInterceptor = (name: string) => {
    const interceptors = getInterceptors();
    if (interceptors[name]) {
      unregisterInterceptor(name);
    } else {
      // 重新注册拦截器的逻辑需要在这里实现
      // TODO: 移除调试日志 - console.log(`重新注册拦截器 ${name}`);
    }
  };

  // 重置统计
  const resetStats = () => {
    // 这里应该重置统计信息
    // TODO: 移除调试日志 - console.log('重置统计信息');
  };

  const interceptors = getInterceptors();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            API拦截器管理          </h2>
          <p className="text-gray-600 mt-1">配置和监控API请求拦截器</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            添加拦截器          </Button>
          <Button variant="outline" onClick={resetStats}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置统计
          </Button>
        </div>
      </div>

      {/* 状态概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">活跃请求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeRequests}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总请求数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
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
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.averageResponseTime)}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 认证管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            认证管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="输入JWT Token"
              onChange={e => setAuthToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={clearAuthToken} variant="outline">
              清除Token
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">认证状态</span>
            {isAuthenticated ? (
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                已认?              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                未认?              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 拦截器开关控制 */}
      <Card>
        <CardHeader>
          <CardTitle>拦截器控制</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>日志拦截器</span>
            </div>
            <Button
              variant={loggingEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoggingEnabled(!loggingEnabled)}
            >
              {loggingEnabled ? '启用' : '禁用'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>安全拦截器</span>
            </div>
            <Button
              variant={securityEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSecurityEnabled(!securityEnabled)}
            >
              {securityEnabled ? '启用' : '禁用'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>重试拦截器</span>
            </div>
            <Button
              variant={retryEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRetryEnabled(!retryEnabled)}
            >
              {retryEnabled ? '启用' : '禁用'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 拦截器列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            拦截器列表          </CardTitle>
          <CardDescription>
            当前注册了 {Object.keys(interceptors).length} 个拦截器
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>功能</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(interceptors).map(([name, _interceptor]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {name === 'auth'
                          ? '认证'
                          : name === 'security'
                            ? '安全'
                            : name === 'logging'
                              ? '日志'
                              : name === 'retry'
                                ? '重试'
                                : name === 'cache'
                                  ? '缓存'
                                  : '自定义'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">运行中</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {name === 'auth'
                        ? 'JWT认证和刷新'
                        : name === 'security'
                          ? 'CSRF保护和速率限制'
                          : name === 'logging'
                            ? '请求响应日志'
                            : name === 'retry'
                              ? '自动重试机制'
                              : name === 'cache'
                                ? '响应缓存'
                                : '自定义功能'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleInterceptor(name)}
                      >
                        {interceptors[name] ? '禁用' : '启用'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* API测试 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            API测试
          </CardTitle>
          <CardDescription>测试拦截器效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              placeholder="输入测试URL"
              className="flex-1"
            />
            <Button onClick={testApiRequest}>
              <Play className="w-4 h-4 mr-2" />
              发送请求            </Button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              {testResult.status === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>请求中...</span>
                </div>
              ) : testResult.status === 'success' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">请求成功</span>
                  </div>
                  <div className="text-sm">
                    <div>
                      状态码: {testResult.response.status}{' '}
                      {testResult.response.statusText}
                    </div>
                    <div>响应数据:</div>
                    <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>请求失败: {testResult.error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加拦截器对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新拦截器</DialogTitle>
            <DialogDescription>配置新的API请求拦截器</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">拦截器名称</label>
              <Input
                value={newInterceptor.name}
                onChange={e =>
                  setNewInterceptor({ ...newInterceptor, name: e.target.value })
                }
                placeholder="例如: custom-auth"
              />
            </div>

            <div>
              <label className="text-sm font-medium">拦截器类型</label>
              <Select
                value={newInterceptor.type}
                onValueChange={value =>
                  setNewInterceptor({ ...newInterceptor, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auth">认证拦截器</SelectItem>
                  <SelectItem value="security">安全拦截器</SelectItem>
                  <SelectItem value="logging">日志拦截器</SelectItem>
                  <SelectItem value="retry">重试拦截器</SelectItem>
                  <SelectItem value="cache">缓存拦截器</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddInterceptor}
              disabled={!newInterceptor.name}
            >
              添加拦截器            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
