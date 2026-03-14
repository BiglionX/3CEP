/**
 * 前端性能监控仪表板
 * 实时展示和分析应用性能指标
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Gauge,
  Zap,
  Timer,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  performanceScore?: number;
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
  };
  scoreDistribution: {
    excellent: number;
    good: number;
    poor: number;
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

  // 获取当前性能指标
  useEffect(() => {
    const getPerformanceMetrics = () => {
      if (typeof window === 'undefined' || !window.performance) return null;

      const perf = window.performance;
      const navigation = perf.timing as any;
      const paint = perf.getEntriesByType('paint') as any[];

      const metrics: PerformanceMetrics = {
        navigationStart: navigation?.navigationStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadEventEnd: navigation?.loadEventEnd || 0,
        firstPaint:
          paint?.find((p: any) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint?.find((p: any) => p.name === 'first-contentful-paint')
            ?.startTime || 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        interactionToNextPaint: 0,
        dnsLookup:
          navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
        tcpConnection: navigation?.connectEnd - navigation?.connectStart || 0,
        requestDuration:
          navigation?.responseStart - navigation?.requestStart || 0,
        responseDuration:
          navigation?.responseEnd - navigation?.responseStart || 0,
        scriptExecution: 0,
        domParsing: navigation?.domComplete - navigation?.domInteractive || 0,
        timeToInteractive: 0,
        totalBlockingTime: 0,
      };

      // 计算性能分数
      const fcpScore = Math.max(
        0,
        100 - (metrics.firstContentfulPaint / 1800) * 100
      );
      metrics.performanceScore = Math.round(fcpScore);

      return metrics;
    };

    const updateMetrics = () => {
      const currentMetrics = getPerformanceMetrics();
      if (currentMetrics) {
        setMetrics(currentMetrics);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // 指标状态判断
  const getMetricStatus = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value <= thresholds.good)
      return { status: 'good', icon: CheckCircle, color: 'text-green-500' };
    if (value <= thresholds.warning)
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-500',
      };
    return { status: 'poor', icon: AlertTriangle, color: 'text-red-500' };
  };

  // 格式化时间显示
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
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
                前端性能监控仪表板
              </h1>
              <p className="text-gray-600 mt-2">
                实时监控和分析应用性能指标，优化用户体验
              </p>
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
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${metrics.performanceScore || 0}%` }}
                  />
                </div>
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
                  <Activity className="h-4 w-4" />
                  交互延迟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(metrics.firstInputDelay)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: &lt;100ms
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  总阻塞时间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(metrics.totalBlockingTime)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  目标: &lt;300ms
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 详细性能指标 */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 页面加载时序 */}
            <Card>
              <CardHeader>
                <CardTitle>页面加载时序</CardTitle>
                <CardDescription>各个加载阶段的耗时统计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DNS 查询</span>
                  <span className="font-semibold">
                    {formatTime(metrics.dnsLookup)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">TCP 连接</span>
                  <span className="font-semibold">
                    {formatTime(metrics.tcpConnection)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">请求发送</span>
                  <span className="font-semibold">
                    {formatTime(metrics.requestDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">响应接收</span>
                  <span className="font-semibold">
                    {formatTime(metrics.responseDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DOM 解析</span>
                  <span className="font-semibold">
                    {formatTime(metrics.domParsing)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>关键性能指标评估</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      LCP (最大内容绘制)
                    </span>
                    <span className="font-semibold">
                      {formatTime(metrics.largestContentfulPaint)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.largestContentfulPaint < 2500
                          ? 'bg-green-500'
                          : metrics.largestContentfulPaint < 4000
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (metrics.largestContentfulPaint / 4000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      FID (首次输入延迟)
                    </span>
                    <span className="font-semibold">
                      {formatTime(metrics.firstInputDelay)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.firstInputDelay < 100
                          ? 'bg-green-500'
                          : metrics.firstInputDelay < 300
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (metrics.firstInputDelay / 300) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      CLS (累积布局偏移)
                    </span>
                    <span className="font-semibold">
                      {metrics.cumulativeLayoutShift.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metrics.cumulativeLayoutShift < 0.1
                          ? 'bg-green-500'
                          : metrics.cumulativeLayoutShift < 0.25
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (metrics.cumulativeLayoutShift / 0.25) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 历史数据 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>历史性能数据</CardTitle>
                <CardDescription>查看过去的性能趋势</CardDescription>
              </div>
              <div className="flex gap-2">
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
                    <SelectItem value="1h">1小时</SelectItem>
                    <SelectItem value="24h">24小时</SelectItem>
                    <SelectItem value="7d">7天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : historicalData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无历史数据
              </div>
            ) : (
              <div className="space-y-3">
                {historicalData.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {new Date(item.timestamp).toLocaleString('zh-CN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        FCP: {formatTime(item.firstContentfulPaint)} | TTI:{' '}
                        {formatTime(item.timeToInteractive)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          getPerformanceGrade(item.performanceScore).bg
                        }
                      >
                        {item.performanceScore}
                      </Badge>
                      <Badge variant="outline">
                        {getPerformanceGrade(item.performanceScore).grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 性能摘要 */}
        {summary && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>性能摘要</CardTitle>
              <CardDescription>统计概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.scoreDistribution.excellent}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">优秀 (90+)</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {summary.scoreDistribution.good}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">良好 (50-89)</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.scoreDistribution.poor}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    较差 (&lt;50)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
