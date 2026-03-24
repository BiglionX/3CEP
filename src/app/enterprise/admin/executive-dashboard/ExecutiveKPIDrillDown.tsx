import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Table,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState } from 'react';

export interface KPIDrillDownData {
  kpiId: string;
  kpiName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  category: string;
  timeSeriesData: Array<{
    period: string;
    value: number;
    target: number;
    variance: number;
  }>;
  dimensionBreakdown: Array<{
    dimension: string;
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topPerformers: Array<{
    name: string;
    value: number;
    rank: number;
    change: number;
  }>;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
  }>;
}

interface ExecutiveKPIDrillDownProps {
  data: KPIDrillDownData;
  onClose: () => void;
}

export function ExecutiveKPIDrillDown({
  data,
  onClose,
}: ExecutiveKPIDrillDownProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDimension, setSelectedDimension] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [expandedSection, setExpandedSection] = useState<
    'trend' | 'dimensions' | 'performers'
  >('trend');

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <span className="h-4 w-4">-</span>;
    }
  };

  // 获取趋势颜色
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {data.kpiName} - 深度分析
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* KPI 概览卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">核心指标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">当前值</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.currentValue.toLocaleString()}
                    <span className="text-base text-gray-500 ml-1">
                      {data.unit}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">目标值</p>
                  <p className="text-3xl font-bold text-gray-700">
                    {data.targetValue.toLocaleString()}
                    <span className="text-base text-gray-500 ml-1">
                      {data.unit}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">达成率</p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      data.currentValue / data.targetValue >= 1
                        ? 'text-green-600'
                        : 'text-blue-600'
                    )}
                  >
                    {((data.currentValue / data.targetValue) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">变化趋势</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(data.trend)}
                    <span
                      className={cn(
                        'text-2xl font-bold',
                        getTrendColor(data.trend)
                      )}
                    >
                      {data.changePercentage > 0 ? '+' : ''}
                      {data.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>目标完成进度</span>
                  <span className="text-gray-600">
                    {data.currentValue.toLocaleString()} /{' '}
                    {data.targetValue.toLocaleString()} {data.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all',
                      data.currentValue / data.targetValue >= 1
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    )}
                    style={{
                      width: `${Math.min((data.currentValue / data.targetValue) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 筛选控制 */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">最近 7 天</SelectItem>
                <SelectItem value="30d">最近 30 天</SelectItem>
                <SelectItem value="90d">最近 90 天</SelectItem>
                <SelectItem value="1y">最近 1 年</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDimension}
              onValueChange={setSelectedDimension}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="选择维度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部维度</SelectItem>
                <SelectItem value="region">按地区</SelectItem>
                <SelectItem value="product">按产品</SelectItem>
                <SelectItem value="channel">按渠道</SelectItem>
                <SelectItem value="team">按团队</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="搜索..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-[200px]"
            />

            <div className="flex-1" />

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>

          {/* 标签页切换 */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                趋势分析
              </TabsTrigger>
              <TabsTrigger value="dimensions">
                <Table className="h-4 w-4 mr-2" />
                维度分解
              </TabsTrigger>
              <TabsTrigger value="performers">
                <BarChart3 className="h-4 w-4 mr-2" />
                表现排行
              </TabsTrigger>
            </TabsList>

            {/* 趋势分析 */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>时间序列趋势</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'trend' ? 'dimensions' : 'trend'
                        )
                      }
                    >
                      {expandedSection === 'trend' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.timeSeriesData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.period}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                              实际：{item.value.toLocaleString()}
                              {data.unit}
                            </span>
                            <span className="text-gray-400">
                              目标：{item.target.toLocaleString()}
                              {data.unit}
                            </span>
                            <Badge
                              variant={
                                item.variance >= 0 ? 'default' : 'destructive'
                              }
                            >
                              {item.variance >= 0 ? '+' : ''}
                              {item.variance.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{
                              width: `${(item.value / Math.max(...data.timeSeriesData.map(d => d.target))) * 100}%`,
                            }}
                          />
                          <div
                            className="absolute left-0 top-0 h-0.5 bg-gray-800 opacity-30"
                            style={{
                              width: `${(item.target / Math.max(...data.timeSeriesData.map(d => d.target))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 维度分解 */}
            <TabsContent value="dimensions">
              <Card>
                <CardHeader>
                  <CardTitle>维度分解分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.dimensionBreakdown
                      .filter(item =>
                        item.dimension
                          .toLowerCase()
                          .includes(filterText.toLowerCase())
                      )
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-32 font-medium">
                            {item.dimension}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">
                                {item.value.toLocaleString()}
                                {data.unit}
                              </span>
                              <span className="text-sm font-medium">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 w-24 justify-end">
                            {getTrendIcon(item.trend)}
                            <span
                              className={cn(
                                'text-sm',
                                getTrendColor(item.trend)
                              )}
                            >
                              {item.trend === 'up'
                                ? '↑'
                                : item.trend === 'down'
                                  ? '↓'
                                  : '→'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 表现排行 */}
            <TabsContent value="performers">
              <Card>
                <CardHeader>
                  <CardTitle>TOP 表现排行榜</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topPerformers
                      .filter(item =>
                        item.name
                          .toLowerCase()
                          .includes(filterText.toLowerCase())
                      )
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 10)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">
                            {item.rank}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {item.value.toLocaleString()}
                              {data.unit}
                            </div>
                            <div
                              className={cn(
                                'text-sm',
                                item.change >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              )}
                            >
                              {item.change >= 0 ? '+' : ''}
                              {item.change.toFixed(1)}% vs 上期
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 智能洞察 */}
          <Card>
            <CardHeader>
              <CardTitle>AI 智能洞察</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-lg border-l-4',
                      insight.type === 'positive' &&
                        'bg-green-50 border-green-600',
                      insight.type === 'negative' && 'bg-red-50 border-red-600',
                      insight.type === 'neutral' && 'bg-blue-50 border-blue-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
