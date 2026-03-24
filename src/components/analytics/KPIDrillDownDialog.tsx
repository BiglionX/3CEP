'use client';

/**
 * KPI 深度分析钻取组件 (Task 6.2)
 * 实现战略层指标钻取功能
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  X,
  BarChart3,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { LineChartComponent } from '@/lib/analytics/components/charts';

interface TimeSeriesData {
  period: string;
  value: number;
  target: number;
  variance: number;
}

interface DimensionBreakdown {
  dimension: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopPerformer {
  name: string;
  value: number;
  rank: number;
  change: number;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

export interface KPIDrillDownData {
  kpiId: string;
  kpiName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  category: string;
  timeSeriesData: TimeSeriesData[];
  dimensionBreakdown: DimensionBreakdown[];
  topPerformers: TopPerformer[];
  insights: Insight[];
}

interface KPIDrillDownDialogProps {
  kpiId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIDrillDownDialog({ kpiId, open, onOpenChange }: KPIDrillDownDialogProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(false);
  const [drillDownData, setDrillDownData] = useState<KPIDrillDownData | null>(null);

  // 模拟加载数据
  useState(() => {
    if (open) {
      setLoading(true);
      // 模拟数据获取
      setTimeout(() => {
        setDrillDownData({
          kpiId,
          kpiName: '月度收入',
          currentValue: 458200,
          targetValue: 500000,
          unit: '元',
          trend: 'up',
          changePercentage: 12.5,
          category: 'financial',
          timeSeriesData: [
            { period: '第 1 周', value: 98000, target: 110000, variance: -10.9 },
            { period: '第 2 周', value: 115000, target: 115000, variance: 0 },
            { period: '第 3 周', value: 122000, target: 120000, variance: 1.7 },
            { period: '第 4 周', value: 123200, target: 155000, variance: -20.5 },
          ],
          dimensionBreakdown: [
            { dimension: '智能体服务', value: 185000, percentage: 40.4, trend: 'up' },
            { dimension: '采购管理', value: 142000, percentage: 31.0, trend: 'stable' },
            { dimension: '供应链金融', value: 98000, percentage: 21.4, trend: 'down' },
            { dimension: '其他业务', value: 33200, percentage: 7.2, trend: 'up' },
          ],
          topPerformers: [
            { name: '销售一部', value: 125000, rank: 1, change: 15.2 },
            { name: '销售二部', value: 118000, rank: 2, change: 12.8 },
            { name: '销售三部', value: 95000, rank: 3, change: -3.5 },
            { name: '线上渠道', value: 88000, rank: 4, change: 22.1 },
          ],
          insights: [
            {
              type: 'positive',
              title: '收入持续增长',
              description: '本月收入同比增长 12.5%，主要得益于智能体服务业务的强劲表现',
            },
            {
              type: 'negative',
              title: '供应链金融表现不佳',
              description: '供应链金融业务收入环比下降 8.3%，需关注市场变化',
            },
            {
              type: 'neutral',
              title: '目标完成压力',
              description: '当前完成率为 91.6%，建议制定冲刺计划确保目标达成',
            },
          ],
        });
        setLoading(false);
      }, 500);
    }
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'user':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'business':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-3">
              {drillDownData && getCategoryIcon(drillDownData.category)}
              {drillDownData?.kpiName || 'KPI 深度分析'} - 钻取视图
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : drillDownData ? (
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
                      {drillDownData.currentValue.toLocaleString()}
                      <span className="text-base text-gray-500 ml-1">
                        {drillDownData.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">目标值</p>
                    <p className="text-3xl font-bold text-gray-700">
                      {drillDownData.targetValue.toLocaleString()}
                      <span className="text-base text-gray-500 ml-1">
                        {drillDownData.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">达成率</p>
                    <p
                      className={`text-3xl font-bold ${
                        drillDownData.currentValue / drillDownData.targetValue >= 1
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {Math.round(
                        (drillDownData.currentValue / drillDownData.targetValue) * 100
                      )}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">趋势</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTrendIcon(drillDownData.trend)}
                      <span
                        className={`text-2xl font-bold ${
                          drillDownData.changePercentage >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {drillDownData.changePercentage > 0 ? '+' : ''}
                        {drillDownData.changePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 时间序列趋势图表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    趋势分析
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeRange('week')}
                    >
                      周
                    </Button>
                    <Button
                      variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeRange('month')}
                    >
                      月
                    </Button>
                    <Button
                      variant={selectedTimeRange === 'quarter' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeRange('quarter')}
                    >
                      季
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LineChartComponent
                    data={drillDownData.timeSeriesData.map(item => ({
                      name: item.period,
                      实际值：item.value,
                      目标值：item.target,
                    }))}
                    height={320}
                    showLegend={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 维度分解 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  维度分解
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drillDownData.dimensionBreakdown.map((dimension, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(dimension.trend)}
                          <span className="font-medium">{dimension.dimension}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            占比：{dimension.percentage.toFixed(1)}%
                          </span>
                          <span className="font-semibold">
                            {dimension.value.toLocaleString()}
                            {drillDownData.unit}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dimension.trend === 'up'
                              ? 'bg-green-500'
                              : dimension.trend === 'down'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                          }`}
                          style={{ width: `${dimension.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top  performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  优秀排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drillDownData.topPerformers.map((performer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            performer.rank === 1
                              ? 'bg-yellow-500 text-white'
                              : performer.rank === 2
                              ? 'bg-gray-400 text-white'
                              : performer.rank === 3
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {performer.rank}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-xs text-gray-500">
                            贡献：{performer.value.toLocaleString()}
                            {drillDownData.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={performer.change >= 0 ? 'default' : 'secondary'}
                        >
                          {performer.change >= 0 ? '+' : ''}
                          {performer.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 智能洞察 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI 智能洞察
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drillDownData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive'
                          ? 'bg-green-50 border-green-500'
                          : insight.type === 'negative'
                          ? 'bg-red-50 border-red-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{insight.title}</p>
                          <p className="text-sm text-gray-700">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无数据
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
