/**
 * 前端性能监控演示页面
 * 展示页面加载、API响应时间和用户交互性能监控
 */

'use client';

import { useState } from 'react';
import {
  Gauge,
  Timer,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Wifi,
  HardDrive,
  BarChart3,
  LineChart,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
}

interface RecentMetric {
  type: string;
  value: number;
  timestamp: number;
}

interface PerformanceData {
  currentScore: number;
  metrics: PerformanceMetric[];
  recentMetrics: RecentMetric[];
}

// 模拟性能数据
const mockPerformanceData: PerformanceData = {
  currentScore: 87,
  metrics: [
    { name: '首次内容绘制', value: 1200, unit: 'ms', status: 'good' },
    {
      name: '最大内容绘制',
      value: 1800,
      unit: 'ms',
      status: 'needs-improvement',
    },
    { name: '首次输入延迟', value: 80, unit: 'ms', status: 'good' },
    { name: '累积布局偏移', value: 0.08, unit: '', status: 'good' },
    {
      name: '可交互时间',
      value: 3200,
      unit: 'ms',
      status: 'needs-improvement',
    },
  ],
  recentMetrics: [
    { type: 'api_response_time', value: 150, timestamp: Date.now() - 1000 },
    { type: 'api_response_time', value: 280, timestamp: Date.now() - 2000 },
    { type: 'api_response_time', value: 95, timestamp: Date.now() - 3000 },
    { type: 'api_response_time', value: 420, timestamp: Date.now() - 4000 },
    { type: 'api_response_time', value: 110, timestamp: Date.now() - 5000 },
  ],
};

export default function PerformanceMonitoringDemoPage() {
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);
  const [performanceData, setPerformanceData] =
    useState<PerformanceData>(mockPerformanceData);

  // 切换监控状态
  const toggleMonitoring = () => {
    setIsMonitoringEnabled(!isMonitoringEnabled);
  };

  // 模拟API调用测试
  const simulateApiCall = async () => {
    const duration = Math.round(Math.random() * 500 + 100);

    setPerformanceData(prev => ({
      ...prev,
      recentMetrics: [
        { type: 'api_response_time', value: duration, timestamp: Date.now() },
        ...prev.recentMetrics.slice(0, 9),
      ],
    }));
  };

  // 刷新性能数据
  const refreshData = () => {
    setPerformanceData({
      currentScore: Math.floor(Math.random() * 20) + 80,
      metrics: mockPerformanceData.metrics.map(m => ({
        ...m,
        value: Math.floor(m.value * (0.8 + Math.random() * 0.4)),
      })),
      recentMetrics: performanceData.recentMetrics,
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 计算平均响应时间
  const calculateAvgResponseTime = () => {
    if (performanceData.recentMetrics.length === 0) return 0;
    const total = performanceData.recentMetrics.reduce(
      (sum, metric) => sum + metric.value,
      0
    );
    return Math.round(total / performanceData.recentMetrics.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            前端性能监控
          </h1>
          <p className="text-gray-600">
            实时监控页面加载、API响应和用户交互性能
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoringEnabled ? 'default' : 'outline'}
          >
            {isMonitoringEnabled ? '停止监控' : '开始监控'}
          </Button>
          <Button onClick={simulateApiCall} variant="secondary">
            <Timer className="h-4 w-4 mr-2" />
            模拟API调用
          </Button>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>

          <Badge variant={isMonitoringEnabled ? 'default' : 'secondary'}>
            {isMonitoringEnabled ? '监控中' : '已暂停'}
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="webvitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="api">API性能</TabsTrigger>
            <TabsTrigger value="resources">资源加载</TabsTrigger>
          </TabsList>

          {/* 概览 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    性能评分
                  </CardTitle>
                  <Gauge className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {performanceData.currentScore}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {performanceData.currentScore >= 90
                      ? '优秀'
                      : performanceData.currentScore >= 70
                        ? '良好'
                        : '需改进'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    平均响应时间
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateAvgResponseTime()}ms
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculateAvgResponseTime() < 200
                      ? '优秀'
                      : calculateAvgResponseTime() < 500
                        ? '良好'
                        : '较慢'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    页面加载
                  </CardTitle>
                  <Zap className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {performanceData.metrics[1]?.value || 0}ms
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    最大内容绘制
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    监控状态
                  </CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {performanceData.recentMetrics.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    最近记录数
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>性能指标概览</CardTitle>
                <CardDescription>关键性能指标的实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(metric.status)}
                        <div>
                          <h3 className="font-medium">{metric.name}</h3>
                          <p className="text-sm text-gray-500">
                            {metric.value} {metric.unit}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          metric.status === 'good'
                            ? 'default'
                            : metric.status === 'needs-improvement'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className={getStatusColor(metric.status)}
                      >
                        {metric.status === 'good'
                          ? '良好'
                          : metric.status === 'needs-improvement'
                            ? '需改进'
                            : '较差'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Vitals */}
          <TabsContent value="webvitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Google推荐的核心网页性能指标</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      首次内容绘制 (FCP)
                    </h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {performanceData.metrics[0]?.value || 0}ms
                    </div>
                    <p className="text-sm text-blue-800">目标: &lt; 1.8s</p>
                    <div className="mt-2 h-2 bg-blue-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (performanceData.metrics[0]?.value || 0) / 18)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      最大内容绘制 (LCP)
                    </h4>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {performanceData.metrics[1]?.value || 0}ms
                    </div>
                    <p className="text-sm text-green-800">目标: &lt; 2.5s</p>
                    <div className="mt-2 h-2 bg-green-200 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (performanceData.metrics[1]?.value || 0) / 25)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">
                      首次输入延迟 (FID)
                    </h4>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {performanceData.metrics[2]?.value || 0}ms
                    </div>
                    <p className="text-sm text-purple-800">目标: &lt; 100ms</p>
                    <div className="mt-2 h-2 bg-purple-200 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, performanceData.metrics[2]?.value || 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">
                      累积布局偏移 (CLS)
                    </h4>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {performanceData.metrics[3]?.value || 0}
                    </div>
                    <p className="text-sm text-orange-800">目标: &lt; 0.1</p>
                    <div className="mt-2 h-2 bg-orange-200 rounded-full">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (performanceData.metrics[3]?.value || 0) * 1000)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API性能 */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API响应时间统计</CardTitle>
                  <CardDescription>最近API调用的性能数据</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">平均响应时间</span>
                      <span className="text-lg font-bold">
                        {calculateAvgResponseTime()}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">最快响应</span>
                      <span className="text-lg font-bold text-green-600">
                        {Math.min(
                          ...performanceData.recentMetrics.map(m => m.value)
                        )}
                        ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">最慢响应</span>
                      <span className="text-lg font-bold text-red-600">
                        {Math.max(
                          ...performanceData.recentMetrics.map(m => m.value)
                        )}
                        ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">总请求数</span>
                      <span className="text-lg font-bold">
                        {performanceData.recentMetrics.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最近API调用</CardTitle>
                  <CardDescription>最近的API请求响应时间</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.recentMetrics
                      .slice(0, 8)
                      .map((metric, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {formatTime(metric.timestamp)}
                          </span>
                          <span className="font-mono">
                            {metric.value.toFixed(0)}ms
                          </span>
                          <Badge
                            variant={
                              metric.value < 200
                                ? 'default'
                                : metric.value < 500
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="text-xs"
                          >
                            {metric.value < 200
                              ? '快'
                              : metric.value < 500
                                ? '正常'
                                : '慢'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 资源加载 */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    内存使用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.floor(Math.random() * 30 + 40)}MB
                  </div>
                  <p className="text-sm text-gray-600">当前内存占用</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.floor(Math.random() * 30 + 40)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    网络请求
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.floor(Math.random() * 10 + 5)}
                  </div>
                  <p className="text-sm text-gray-600">并发请求数</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.floor(Math.random() * 40 + 20)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    网络延迟
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.floor(Math.random() * 50 + 20)}ms
                  </div>
                  <p className="text-sm text-gray-600">当前网络延迟</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.floor(Math.random() * 30 + 10)}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>资源加载建议</CardTitle>
                <CardDescription>优化资源加载性能的建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">实施懒加载</h4>
                      <p className="text-sm text-gray-600">
                        对图片和非关键资源实施懒加载,减少初始加载时间
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">启用压缩</h4>
                      <p className="text-sm text-gray-600">
                        使用Gzip或Brotli压缩文本资源,减少传输大小
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">优化API调用</h4>
                      <p className="text-sm text-gray-600">
                        合并请求,使用缓存,减少不必要的API调用
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">代码分割</h4>
                      <p className="text-sm text-gray-600">
                        将代码分割成更小的块,实现按需加载
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
