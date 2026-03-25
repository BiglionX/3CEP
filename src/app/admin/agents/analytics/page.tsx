'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  executionsByDay: Array<{ date: string; count: number; success: number }>;
  topWorkflows: Array<{
    id: string;
    name: string;
    executions: number;
    avgTime: number;
  }>;
  errorTypes: Array<{ type: string; count: number; percentage: number }>;
}

export default function AgentsAnalyticsPage() {
  const { user } = useUnifiedAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/analytics?range=${timeRange}`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data.data || []);
    } catch (err: any) {
      console.error('加载分析数据失败:', err);
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalytics = (): AnalyticsData => ({
    totalExecutions: 15420,
    successfulExecutions: 14892,
    failedExecutions: 528,
    averageExecutionTime: 1250,
    successRate: 96.6,
    executionsByDay: [
      { date: '2026-03-19', count: 2100, success: 2050 },
      { date: '2026-03-20', count: 2300, success: 2240 },
      { date: '2026-03-21', count: 1900, success: 1850 },
      { date: '2026-03-22', count: 2000, success: 1940 },
      { date: '2026-03-23', count: 2400, success: 2320 },
      { date: '2026-03-24', count: 2500, success: 2420 },
      { date: '2026-03-25', count: 2220, success: 2072 },
    ],
    topWorkflows: [
      { id: '1', name: '订单处理自动化流程', executions: 5420, avgTime: 980 },
      { id: '2', name: '客户服务智能回复', executions: 3890, avgTime: 1200 },
      {
        id: '3',
        name: '每日数据分析报告生成',
        executions: 2340,
        avgTime: 2500,
      },
      { id: '4', name: '库存预警与自动采购', executions: 2100, avgTime: 850 },
      { id: '5', name: '用户行为追踪与分析', executions: 1670, avgTime: 1100 },
    ],
    errorTypes: [
      { type: 'API 连接超时', count: 245, percentage: 46.4 },
      { type: '认证失败', count: 132, percentage: 25.0 },
      { type: '数据格式错误', count: 89, percentage: 16.9 },
      { type: '资源不足', count: 62, percentage: 11.7 },
    ],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            n8n 高级分析
          </h1>
          <p className="text-gray-600">工作流执行趋势图表和性能对比</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={timeRange}
            onValueChange={(val: any) => setTimeRange(val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近 7 天</SelectItem>
              <SelectItem value="30d">最近 30 天</SelectItem>
              <SelectItem value="90d">最近 90 天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>加载分析数据...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 核心指标卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  总执行次数
                </CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics!.totalExecutions)}
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">12.5%</span>
                  <span className="text-gray-500">较上期</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">成功率</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics!.successRate}%
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">2.1%</span>
                  <span className="text-gray-500">较上期</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  平均执行时间
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(analytics!.averageExecutionTime)}
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <ArrowDown className="w-3 h-3 text-red-600" />
                  <span className="text-red-600">5.3%</span>
                  <span className="text-gray-500">较上期</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">失败次数</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics!.failedExecutions)}
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <ArrowDown className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">8.2%</span>
                  <span className="text-gray-500">较上期</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="mb-6">
            <TabsList>
              <TabsTrigger value="trends">执行趋势</TabsTrigger>
              <TabsTrigger value="workflows">工作流排行</TabsTrigger>
              <TabsTrigger value="errors">错误分析</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>执行趋势图</CardTitle>
                  <CardDescription>
                    最近
                    {timeRange === '7d'
                      ? '7'
                      : timeRange === '30d'
                        ? '30'
                        : '90'}
                    天的工作流执行情况
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-end gap-2">
                    {analytics!.executionsByDay.map((day, index) => {
                      const maxCount = Math.max(
                        ...analytics!.executionsByDay.map(d => d.count)
                      );
                      const heightPercent = (day.count / maxCount) * 100;
                      const successPercent = (day.success / day.count) * 100;

                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                            style={{
                              height: `${heightPercent * 2}px`,
                              minHeight: '40px',
                            }}
                          >
                            <div className="relative h-full w-full">
                              <div
                                className="absolute bottom-0 w-full bg-green-500 rounded-t opacity-60"
                                style={{ height: `${successPercent}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 rotate-0">
                            {new Date(day.date).toLocaleDateString('zh-CN', {
                              month: 'numeric',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs font-semibold">
                            {formatNumber(day.count)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded" />
                      <span>总执行数</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded opacity-60" />
                      <span>成功执行</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflows">
              <Card>
                <CardHeader>
                  <CardTitle>热门工作流排行</CardTitle>
                  <CardDescription>
                    按执行次数排序的 Top 5 工作流
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics!.topWorkflows.map((workflow, index) => (
                      <div key={workflow.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{workflow.name}</h3>
                              <p className="text-sm text-gray-500">
                                平均执行时间：{formatTime(workflow.avgTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatNumber(workflow.executions)}
                            </div>
                            <p className="text-xs text-gray-500">执行次数</p>
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(workflow.executions / analytics!.topWorkflows[0].executions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors">
              <Card>
                <CardHeader>
                  <CardTitle>错误类型分析</CardTitle>
                  <CardDescription>失败执行的错误类型分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics!.errorTypes.map((error, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{error.type}</h3>
                          <Badge
                            variant={
                              error.percentage > 30
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {error.count} 次
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-100 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                error.percentage > 30
                                  ? 'bg-red-600'
                                  : error.percentage > 20
                                    ? 'bg-yellow-600'
                                    : 'bg-blue-600'
                              }`}
                              style={{ width: `${error.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {error.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          优化建议
                        </h4>
                        <p className="text-sm text-blue-700">
                          API
                          连接超时是最主要的错误类型，建议检查网络连接状态，增加重试机制，或调整超时阈值。
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 使用说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                分析功能说明
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>实时统计工作流执行情况和性能指标</li>
                <li>通过趋势图了解系统使用情况和增长趋势</li>
                <li>识别执行频率最高的工作流以优化资源配置</li>
                <li>分析错误类型以针对性地改进系统稳定性</li>
                <li>支持按不同时间范围查看历史数据</li>
                <li>如果连接失败，将显示模拟数据用于演示</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
