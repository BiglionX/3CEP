/**
 * 前端性能监控仪表? * 实时展示和分析应用性能指标
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Gauge,
  Zap,
  Timer,
  Wifi,
  Cpu,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePerformanceMonitor } from '@/tech/api/services/performance-monitor';

interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadEventEnd: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
  dnsLookup: number;
  tcpConnection: number;
  requestDuration: number;
  responseDuration: number;
  scriptExecution: number;
  domParsing: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  apiResponseTimes: Record<string, number[]>;
  componentRenderTimes: Record<string, number[]>;
  userInteractionDelays: number[];
}

interface PerformanceSummary {
  totals: number;
  averages: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
    performanceScore: number;
    avgApiResponseTime: number;
    avgComponentRenderTime: number;
  };
  scoreDistribution: {
    excellent: number;
    good: number;
    poor: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
}

export default function PerformanceMonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timeRange: '24h',
    sortBy: 'timestamp',
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // 初始化性能监控
  const { getMetrics, getPerformanceScore, recordComponentRender, flush } =
    usePerformanceMonitor({
      sampleRate: 1.0,
      monitorApiCalls: true,
      monitorComponentRenders: true,
      monitorUserInteractions: true,
      maxEntries: 100,
    });

  // 获取性能数据
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // 根据时间范围设置日期
      const now = new Date();
      let startDate: Date;

      switch (filters.timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      params.append('startDate', startDate.toISOString());
      params.append('limit', '50');
      params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/performance/metrics?${params}`);
      const data = await response.json();

      if (data.success) {
        setHistoricalData(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 实时更新当前指标
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = getMetrics();
      const score = getPerformanceScore();

      if (currentMetrics) {
        setMetrics({
          ...currentMetrics,
          performanceScore: score,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getMetrics, getPerformanceScore]);

  // 获取历史数据
  useEffect(() => {
    fetchPerformanceData();

    if (realTimeEnabled) {
      const interval = setInterval(fetchPerformanceData, 10000);
      return () => clearInterval(interval);
    }
  }, [filters, realTimeEnabled]);

  // 性能等级判断
  const getPerformanceGrade = (score: number) => {
    if (score >= 90)
      return {
        grade: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-100',
      };
    if (score >= 50)
      return { grade: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // 指标状态判?  const getMetricStatus = (value: number, thresholds: number[]) => {
    if (value <= thresholds[0])
      return { status: 'good', icon: CheckCircle, color: 'text-green-500' };
    if (value <= thresholds[1])
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-500',
      };
    return { status: 'poor', icon: AlertTriangle, color: 'text-red-500' };
  };

  // 格式化时间显?  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 格式化百分比
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Gauge className="h-8 w-8 text-emerald-600" />
                前端性能监控仪表?              </h1>
              <p className="text-gray-600 mt-2">
                实时监控和分析应用性能指标，优化用户体?              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={realTimeEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              >
                <Activity
                  className={`h-4 w-4 mr-2 ${realTimeEnabled ? 'animate-pulse' : ''}`}
                />
                {realTimeEnabled ? '实时监控' : '手动刷新'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchPerformanceData}
                disabled={loading}
              >
                <Zap
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                刷新数据
              </Button>
            </div>
          </div>
        </div>

        {/* 实时性能概览 */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  性能分数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-emerald-600">
                    {metrics.performanceScore || 0}
                  </div>
                  <Badge
                    className={
                      getPerformanceGrade(metrics.performanceScore || 0).bg
                    }
                  >
                    {getPerformanceGrade(metrics.performanceScore || 0).grade}
                  </Badge>
                </div>
                <Progress
                  value={metrics.performanceScore || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  首屏绘制
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(metrics.firstContentfulPaint)}
                </div>
                <div className="text-xs text-gray-500 mt-1">目标: &lt;1.8s</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  最大内容绘?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(metrics.largestContentfulPaint)}
                </div>
                <div className="text-xs text-gray-500 mt-1">目标: &lt;2.5s</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  累积布局偏移
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatPercentage(metrics.cumulativeLayoutShift)}
                </div>
                <div className="text-xs text-gray-500 mt-1">目标: &lt;0.1</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Core Web Vitals 详细展示 */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* First Contentful Paint */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  首屏绘制时间 (FCP)
                </CardTitle>
                <CardDescription>页面首次内容绘制的时?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatTime(metrics.firstContentfulPaint)}
                  </div>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = getMetricStatus(
                        metrics.firstContentfulPaint,
                        [1800, 3000]
                      );
                      const Icon = status.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${status.color}`} />
                          <span className={status.color}>
                            {status.status === 'good'
                              ? '良好'
                              : status.status === 'warning'
                                ? '需要优?
                                : '较差'}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <Progress
                    value={Math.min(
                      100,
                      (metrics.firstContentfulPaint / 5000) * 100
                    )}
                    className="h-2"
                  />

                  <div className="text-sm text-gray-600">
                    <div>
                      DOMContentLoaded: {formatTime(metrics.domContentLoaded)}
                    </div>
                    <div>Load Event: {formatTime(metrics.loadEventEnd)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Largest Contentful Paint */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  最大内容绘?(LCP)
                </CardTitle>
                <CardDescription>页面最大内容元素的绘制时间</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTime(metrics.largestContentfulPaint)}
                  </div>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = getMetricStatus(
                        metrics.largestContentfulPaint,
                        [2500, 4000]
                      );
                      const Icon = status.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${status.color}`} />
                          <span className={status.color}>
                            {status.status === 'good'
                              ? '良好'
                              : status.status === 'warning'
                                ? '需要优?
                                : '较差'}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <Progress
                    value={Math.min(
                      100,
                      (metrics.largestContentfulPaint / 6000) * 100
                    )}
                    className="h-2"
                  />

                  <div className="text-sm text-gray-600">
                    <div>首屏绘制: {formatTime(metrics.firstPaint)}</div>
                    <div>
                      可交互时? {formatTime(metrics.timeToInteractive)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cumulative Layout Shift */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  累积布局偏移 (CLS)
                </CardTitle>
                <CardDescription>页面布局稳定的程?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatPercentage(metrics.cumulativeLayoutShift)}
                  </div>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = getMetricStatus(
                        metrics.cumulativeLayoutShift,
                        [0.1, 0.25]
                      );
                      const Icon = status.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${status.color}`} />
                          <span className={status.color}>
                            {status.status === 'good'
                              ? '良好'
                              : status.status === 'warning'
                                ? '需要优?
                                : '较差'}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <Progress
                    value={Math.min(
                      100,
                      (metrics.cumulativeLayoutShift / 0.5) * 100
                    )}
                    className="h-2"
                  />

                  <div className="text-sm text-gray-600">
                    <div>
                      首次输入延迟: {metrics.firstInputDelay.toFixed(1)}ms
                    </div>
                    <div>
                      总阻塞时? {formatTime(metrics.totalBlockingTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 网络和JavaScript性能 */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  网络性能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DNS查询</span>
                    <span className="font-medium">
                      {formatTime(metrics.dnsLookup)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">TCP连接</span>
                    <span className="font-medium">
                      {formatTime(metrics.tcpConnection)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">请求时间</span>
                    <span className="font-medium">
                      {formatTime(metrics.requestDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">响应时间</span>
                    <span className="font-medium">
                      {formatTime(metrics.responseDuration)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  JavaScript执行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DOM解析</span>
                    <span className="font-medium">
                      {formatTime(metrics.domParsing)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">脚本执行</span>
                    <span className="font-medium">
                      {formatTime(metrics.scriptExecution)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">可交互时?/span>
                    <span className="font-medium">
                      {formatTime(metrics.timeToInteractive)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">总阻塞时?/span>
                    <span className="font-medium">
                      {formatTime(metrics.totalBlockingTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 历史性能数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              历史性能数据
              {loading && (
                <Zap className="h-4 w-4 animate-spin text-emerald-500" />
              )}
            </CardTitle>
            <CardDescription>过去一段时间内的性能指标趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    时间范围
                  </label>
                  <Select
                    value={filters.timeRange}
                    onValueChange={value =>
                      setFilters({ ...filters, timeRange: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">最?小时</SelectItem>
                      <SelectItem value="24h">最?4小时</SelectItem>
                      <SelectItem value="7d">最?�?/SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    排序方式
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={value =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp">时间倒序</SelectItem>
                      <SelectItem value="performance_score">
                        性能分数
                      </SelectItem>
                      <SelectItem value="first_contentful_paint">
                        FCP
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={fetchPerformanceData}
                size="sm"
                disabled={loading}
              >
                <Zap
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                刷新
              </Button>
            </div>

            {historicalData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无历史性能数据</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historicalData.map(record => (
                  <div
                    key={record.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <Badge
                            className={
                              record.performance_score >= 90
                                ? 'bg-green-100 text-green-800'
                                : record.performance_score >= 50
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {record.performance_score}�?                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">FCP:</span>
                            <span className="ml-1 font-medium">
                              {formatTime(record.first_contentful_paint)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">LCP:</span>
                            <span className="ml-1 font-medium">
                              {formatTime(record.largest_contentful_paint)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">CLS:</span>
                            <span className="ml-1 font-medium">
                              {formatPercentage(record.cumulative_layout_shift)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">FID:</span>
                            <span className="ml-1 font-medium">
                              {record.first_input_delay.toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <div>会话: {record?.substr(0, 8) || 'N/A'}</div>
                        <div>用户: {record?.substr(0, 8) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 性能优化建议 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              性能优化建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">当前优化机会</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>优化图片加载策略，使用WebP格式</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>减少第三方脚本的影响</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>实现代码分割和懒加载</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>使用CDN加速静态资?/span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">监控配置</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>采样?/span>
                    <Badge variant="secondary">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>API监控</span>
                    <Badge variant="default">已启?/Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>组件渲染监控</span>
                    <Badge variant="default">已启?/Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>用户交互监控</span>
                    <Badge variant="default">已启?/Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

