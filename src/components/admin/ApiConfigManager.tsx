'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ApiConfigService,
  type ApiConfig,
  type ApiTestResult,
} from '@/services/api-config-service';
import {
  Activity,
  BarChart3,
  CheckCircle,
  Cloud,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Key,
  MessageSquare,
  Play,
  RefreshCw,
  Shield,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ApiConfigManager() {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState({
    total: 0,
    configured: 0,
    required: 0,
    required_configured: 0,
    healthy: 0,
  });

  // 加载API配置数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configData, statusData] = await Promise.all([
        ApiConfigService.getAllApiConfigs(),
        (ApiConfigService as any).getConfigStatus(),
      ]);

      setConfigs(configData);
      setStatus(statusData);
    } catch (error) {
      console.error('加载API配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const saveConfig = async (provider: string, value: string) => {
    try {
      const success = await ApiConfigService.updateApiConfig(
        provider as any,
        value
      );
      if (success) {
        toast.success('配置保存成功');
        loadData(); // 重新加载数据
      } else {
        toast.error('配置保存失败');
      }
    } catch (error) {
      console.error('保存配置错误:', error);
      toast.error('保存配置时发生错误');
    }
  };

  // 测试所有API连接
  const testAllApis = async () => {
    setTesting(true);
    try {
      const results = await ApiConfigService.testAllApis();
      setTestResults(results);

      // 更新配置状态
      const updatedConfigs = configs.map(config => {
        const result = results.find(r => r.provider === config.provider);
        if (result) {
          return {
            ...config,
            status: (result.success ? 'active' : 'error') as
              | 'active'
              | 'error'
              | 'inactive',
            last_tested: result.timestamp,
            test_result: result.success,
          };
        }
        return config;
      });
      setConfigs(updatedConfigs);

      const successCount = results.filter(r => r.success).length;
      toast.success(
        `API测试完成：${successCount}/${results.length} 个API连接成功`
      );
    } catch (error) {
      console.error('API测试失败:', error);
      toast.error('API测试失败');
    } finally {
      setTesting(false);
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'authentication':
        return <Shield className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'ai':
        return <Key className="w-4 h-4" />;
      case 'ecommerce':
        return <ShoppingCart className="w-4 h-4" />;
      case 'monitoring':
        return <Activity className="w-4 h-4" />;
      case 'messaging':
        return <MessageSquare className="w-4 h-4" />;
      case 'storage':
        return <Cloud className="w-4 h-4" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 按分类分组配置
  const groupedConfigs = configs.reduce(
    (acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    },
    {} as Record<string, ApiConfig[]>
  );

  const categoryNames: Record<string, string> = {
    database: '数据库',
    authentication: '认证服务',
    payment: '支付服务',
    ai: 'AI服务',
    ecommerce: '电商服务',
    monitoring: '监控服务',
    messaging: '消息服务',
    storage: '存储服务',
    analytics: '分析服务',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        加载API配置?..
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按?*/}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API配置管理</h1>
          <p className="text-muted-foreground">
            管理项目所需的所有第三方API和服务配置
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={testAllApis} disabled={testing} variant="outline">
            <Play className="w-4 h-4 mr-2" />
            {testing ? '测试?..' : '测试所有API'}
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 配置状态概览 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总计配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {status.configured}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">必需配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.required}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">必需已配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {status.required_configured}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">健康API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {status.healthy}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 测试结果展示 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              最近测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium capitalize">
                      {result.provider}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.message}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {result.response_time && (
                      <Badge variant="secondary">
                        {result.response_time}ms
                      </Badge>
                    )}
                    <Badge
                      className={
                        result.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {result.success ? '成功' : '失败'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API配置标签?*/}
      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          {Object.keys(groupedConfigs).map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center"
            >
              {getCategoryIcon(category)}
              <span className="ml-2 hidden sm:inline">
                {categoryNames[category]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 md:grid-cols-2">
              {categoryConfigs.map(config => (
                <Card
                  key={config.provider}
                  className={config.is_required ? 'border-primary' : ''}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {getCategoryIcon(config.category)}
                        <span className="ml-2">{config.name}</span>
                        {config.is_required && (
                          <Badge variant="destructive" className="ml-2">
                            必需
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge className={getStatusColor(config.status)}>
                        {config.status === 'active'
                          ? '正常'
                          : config.status === 'error'
                            ? '错误'
                            : '未配置'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`config-${config.provider}`}>
                          配置?
                        </Label>
                        <div className="relative">
                          <Input
                            id={`config-${config.provider}`}
                            type={
                              showPassword[config.provider]
                                ? 'text'
                                : 'password'
                            }
                            value={config.value || ''}
                            onChange={e => {
                              const updatedConfigs = configs.map(c =>
                                c.provider === config.provider
                                  ? { ...c, value: e.target.value }
                                  : c
                              );
                              setConfigs(updatedConfigs);
                            }}
                            placeholder={`请输入${config.name}配置值`}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowPassword(prev => ({
                                ...prev,
                                [config.provider]: !prev[config.provider],
                              }))
                            }
                          >
                            {showPassword[config.provider] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          最后更新{' '}
                          {config.updated_at
                            ? new Date(config.updated_at).toLocaleString()
                            : '从未'}
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            saveConfig(config.provider, config.value || '')
                          }
                        >
                          保存
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
