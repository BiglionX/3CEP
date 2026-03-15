'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Calendar,
  Download,
  Eye,
  MousePointerClick,
  BarChart,
  PieChart,
} from 'lucide-react';

interface BehaviorAnalyticsData {
  visitFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: { date: string; visits: number }[];
  };
  featureUsage: {
    topFeatures: { name: string; usage: number; percentage: number }[];
    categoryDistribution: {
      category: string;
      count: number;
      percentage: number;
    }[];
  };
  activePatterns: {
    hourlyHeatmap: number[][];
    dailyActivity: { day: string; activity: number }[];
    peakHours: number[];
  };
  userSegments: {
    segmentId: string;
    segmentName: string;
    userCount: number;
    percentage: number;
    characteristics: string[];
  }[];
}

interface BehaviorAnalyticsPanelProps {
  userId?: string;
  className?: string;
  onDataUpdate?: (data: BehaviorAnalyticsData) => void;
}

export function BehaviorAnalyticsPanel({
  userId,
  className = '',
  onDataUpdate,
}: BehaviorAnalyticsPanelProps) {
  const [analyticsData, setAnalyticsData] =
    useState<BehaviorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // 加载分析数据
  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  // 生成模拟趋势数据
  const generateMockTrendData = (
    days: number
  ): { date: string; visits: number }[] => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 模拟访问量波动
      const baseVisits = 50;
      const randomFactor = Math.random() * 30 - 15; // -15到+15的随机波动
      const weekendFactor = [0, 6].includes(date.getDay()) ? 0.7 : 1; // 周末访问量较低
      data.push({
        date: date.toISOString().split('T')[0],
        visits: Math.max(
          10,
          Math.round(baseVisits * weekendFactor + randomFactor)
        ),
      });
    }

    return data;
  };

  // 生成模拟热力图数据
  const generateMockHeatmap = (): number[][] => {
    const heatmap: number[][] = [];

    for (let day = 0; day < 7; day++) {
      const dayRow: number[] = [];
      for (let hour = 0; hour < 24; hour++) {
        // 工作日工作时间活跃度较高
        const isWorkday = day >= 1 && day <= 5;
        const isWorkHour = hour >= 9 && hour <= 18;
        const isPeakHour = hour >= 14 && hour <= 16;

        let activity = Math.random() * 20;
        if (isWorkday && isWorkHour) activity += 30;
        if (isPeakHour) activity += 20;
        if (!isWorkday) activity *= 0.6;

        dayRow.push(Math.round(activity));
      }
      heatmap.push(dayRow);
    }

    return heatmap;
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // 模拟API调用 - 实际项目中应该调用真实API
      const mockData: BehaviorAnalyticsData = {
        visitFrequency: {
          daily: 2.3,
          weekly: 16.1,
          monthly: 69.0,
          trend: generateMockTrendData(30),
        },
        featureUsage: {
          topFeatures: [
            { name: '用户管理', usage: 1247, percentage: 28.5 },
            { name: '内容审核', usage: 982, percentage: 22.4 },
            { name: '数据统计', usage: 756, percentage: 17.3 },
            { name: '系统设置', usage: 523, percentage: 11.9 },
            { name: '店铺审核', usage: 345, percentage: 7.9 },
          ],
          categoryDistribution: [
            { category: '用户管理', count: 1247, percentage: 28.5 },
            { category: '内容管理', count: 1128, percentage: 25.8 },
            { category: '数据分析', count: 756, percentage: 17.3 },
            { category: '系统配置', count: 678, percentage: 15.5 },
            { category: '其他功能', count: 564, percentage: 12.9 },
          ],
        },
        activePatterns: {
          hourlyHeatmap: generateMockHeatmap(),
          dailyActivity: [
            { day: '周一', activity: 85 },
            { day: '周二', activity: 78 },
            { day: '周三', activity: 82 },
            { day: '周四', activity: 91 },
            { day: '周五', activity: 88 },
            { day: '周六', activity: 65 },
            { day: '周日', activity: 52 },
          ],
          peakHours: [9, 10, 14, 15, 16],
        },
        userSegments: [
          {
            segmentId: 'high_engagement',
            segmentName: '高参与度用户',
            userCount: 15,
            percentage: 18.3,
            characteristics: ['日均访问>2次', '功能采用率>70%', '粘性高'],
          },
          {
            segmentId: 'medium_engagement',
            segmentName: '中等参与度用户',
            userCount: 45,
            percentage: 54.9,
            characteristics: ['定期使用', '核心功能熟悉', '有待提升'],
          },
          {
            segmentId: 'low_engagement',
            segmentName: '低参与度用户',
            userCount: 22,
            percentage: 26.8,
            characteristics: ['使用较少', '需要引导', '潜在流失风险'],
          },
        ],
      };

      setAnalyticsData(mockData);
      onDataUpdate?.(mockData);
    } catch (error) {
      console.error('加载行为分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-100 rounded"></div>
            <div className="h-80 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无分析数据</h3>
        <p className="mt-1 text-sm text-gray-500">
          还没有足够的用户行为数据进行分析
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">行为分析仪表板</h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">日均访问</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.visitFrequency.daily.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">次/天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">热门功能</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.featureUsage.topFeatures[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              使用 {analyticsData.featureUsage.topFeatures[0]?.usage || 0} 次
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃高峰</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.activePatterns.peakHours.slice(0, 2).join(':00, ')}
              :00
            </div>
            <p className="text-xs text-muted-foreground">最活跃时段</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户分群</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.userSegments.length}
            </div>
            <p className="text-xs text-muted-foreground">个用户群组</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 访问趋势图表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              访问趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analyticsData.visitFrequency.trend.map((point, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${(point.visits / 80) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {new Date(point.date).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 功能使用分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              功能使用Top5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.featureUsage.topFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 text-sm font-medium text-gray-500">
                    #{index + 1}
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{feature.name}</span>
                      <span>{feature.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${feature.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃时段热力图 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              活跃时段热力图
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* 时间标签 */}
                <div className="flex mb-2 pl-16">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="w-8 text-center text-xs text-gray-500"
                    >
                      {i}
                    </div>
                  ))}
                </div>

                {/* 热力图 */}
                <div className="space-y-1">
                  {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(
                    (day, dayIndex) => (
                      <div key={dayIndex} className="flex items-center">
                        <div className="w-16 text-sm text-gray-600">{day}</div>
                        <div className="flex">
                          {analyticsData.activePatterns.hourlyHeatmap[
                            dayIndex
                          ].map((activity, hourIndex) => (
                            <div
                              key={hourIndex}
                              className="w-8 h-8 border border-gray-100 flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${Math.min(activity / 50, 1)})`,
                              }}
                            >
                              {activity > 0 ? activity : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户分群分析 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            用户分群分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.userSegments.map(segment => (
              <div
                key={segment.segmentId}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSegment === segment.segmentId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSegment(segment.segmentId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {segment.segmentName}
                  </h3>
                  <Badge variant="secondary">{segment.percentage}%</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {segment.userCount}
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">特征描述</div>
                  <ul className="space-y-1">
                    {segment.characteristics.map((char, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
