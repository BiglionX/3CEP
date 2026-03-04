'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarketDataPoint {
  date: string;
  commodity: string;
  price: number;
  volume: number;
  change: number;
  region: string;
}

interface MarketAnalysis {
  commodity: string;
  currentPrice: number;
  priceChange: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
  forecast: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
  seasonalPattern: string;
  supplyDemand: {
    supply: 'adequate' | 'shortage' | 'surplus';
    demand: 'strong' | 'moderate' | 'weak';
  };
}

interface RegionalData {
  region: string;
  priceIndex: number;
  change: number;
  volume: number;
}

export default function MarketAnalyticsView() {
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([]);
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('semiconductors');
  const [timeRange, setTimeRange] = useState('3m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMarketData: MarketDataPoint[] = [
        {
          date: '2024-01',
          commodity: '半导?,
          price: 125.5,
          volume: 1250000,
          change: 2.3,
          region: '亚太',
        },
        {
          date: '2024-02',
          commodity: '半导?,
          price: 128.2,
          volume: 1320000,
          change: 2.1,
          region: '亚太',
        },
        {
          date: '2024-03',
          commodity: '半导?,
          price: 126.8,
          volume: 1180000,
          change: -1.1,
          region: '亚太',
        },
        {
          date: '2024-01',
          commodity: '稀土材?,
          price: 85.3,
          volume: 850000,
          change: -1.5,
          region: '亚太',
        },
        {
          date: '2024-02',
          commodity: '稀土材?,
          price: 83.9,
          volume: 920000,
          change: -1.6,
          region: '亚太',
        },
        {
          date: '2024-03',
          commodity: '稀土材?,
          price: 86.7,
          volume: 790000,
          change: 3.3,
          region: '亚太',
        },
      ];

      const mockAnalyses: MarketAnalysis[] = [
        {
          commodity: '半导体芯?,
          currentPrice: 126.8,
          priceChange: 1.3,
          volatility: 12.5,
          trend: 'up',
          forecast: {
            shortTerm: 2.1,
            mediumTerm: 5.8,
            longTerm: 8.3,
          },
          seasonalPattern: 'Q2传统淡季，Q3需求回?,
          supplyDemand: {
            supply: 'adequate',
            demand: 'strong',
          },
        },
        {
          commodity: '稀土永磁材?,
          currentPrice: 86.7,
          priceChange: 1.6,
          volatility: 18.2,
          trend: 'up',
          forecast: {
            shortTerm: 3.2,
            mediumTerm: -2.1,
            longTerm: 4.7,
          },
          seasonalPattern: '新能源汽车需求带动价格上?,
          supplyDemand: {
            supply: 'shortage',
            demand: 'strong',
          },
        },
        {
          commodity: '工业传感?,
          currentPrice: 45.2,
          priceChange: -0.8,
          volatility: 8.7,
          trend: 'stable',
          forecast: {
            shortTerm: 0.5,
            mediumTerm: 2.3,
            longTerm: 1.8,
          },
          seasonalPattern: '全年需求相对平?,
          supplyDemand: {
            supply: 'adequate',
            demand: 'moderate',
          },
        },
      ];

      const mockRegionalData: RegionalData[] = [
        { region: '亚太地区', priceIndex: 105.2, change: 2.3, volume: 2560000 },
        { region: '北美地区', priceIndex: 98.7, change: -1.2, volume: 1890000 },
        { region: '欧洲地区', priceIndex: 92.4, change: 0.8, volume: 1450000 },
        { region: '其他地区', priceIndex: 88.9, change: -0.5, volume: 980000 },
      ];

      setMarketData(mockMarketData);
      setAnalyses(mockAnalyses);
      setRegionalData(mockRegionalData);
      setLoading(false);
    };

    loadData();
  }, [selectedCommodity, timeRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSupplyDemandColor = (status: string) => {
    switch (status) {
      case 'shortage':
        return 'text-red-600';
      case 'surplus':
        return 'text-green-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility > 20) return { level: '高波?, color: 'text-red-600' };
    if (volatility > 10) return { level: '中等波动', color: 'text-yellow-600' };
    return { level: '低波?, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部控制?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">国际市场分析</h1>
          <p className="text-muted-foreground">
            全球采购市场的实时洞察与趋势分析
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedCommodity}
            onValueChange={setSelectedCommodity}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semiconductors">半导?/SelectItem>
              <SelectItem value="rare-earth">稀土材?/SelectItem>
              <SelectItem value="sensors">传感?/SelectItem>
              <SelectItem value="all">全部商品</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1个月</SelectItem>
              <SelectItem value="3m">3个月</SelectItem>
              <SelectItem value="6m">6个月</SelectItem>
              <SelectItem value="1y">1�?/SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 市场概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              市场活跃?            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">高度活跃</div>
            <p className="text-xs text-muted-foreground">交易量同比增?5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">价格波动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">中等偏高</div>
            <p className="text-xs text-muted-foreground">平均波动?5.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">供需平衡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">基本平衡</div>
            <p className="text-xs text-muted-foreground">局部短缺风?/p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">风险指数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">68/100</div>
            <p className="text-xs text-muted-foreground">地缘政治影响加剧</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">价格趋势</TabsTrigger>
          <TabsTrigger value="analysis">深度分析</TabsTrigger>
          <TabsTrigger value="regional">区域对比</TabsTrigger>
        </TabsList>

        {/* 价格趋势标签?*/}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 价格走势?*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  {selectedCommodity === 'all'
                    ? '综合价格指数'
                    : `${selectedCommodity}价格走势`}
                </CardTitle>
                <CardDescription>过去{timeRange}的价格变化趋?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">价格趋势图表</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      实时数据更新?..
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      +2.1%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      短期趋势
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      +5.8%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      中期预测
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      +8.3%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      长期展望
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 波动性分?*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  市场波动性分?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyses.slice(0, 3).map(analysis => {
                    const volatilityInfo = getVolatilityLevel(
                      analysis.volatility
                    );
                    return (
                      <div
                        key={analysis.commodity}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{analysis.commodity}</h4>
                          <Badge
                            variant={
                              analysis.trend === 'up'
                                ? 'default'
                                : analysis.trend === 'down'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {analysis.trend === 'up'
                              ? '上涨'
                              : analysis.trend === 'down'
                                ? '下跌'
                                : '平稳'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              当前价格:
                            </span>
                            <span className="font-medium ml-1">
                              ${analysis.currentPrice}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">变化:</span>
                            <span
                              className={`font-medium ml-1 ${
                                analysis.priceChange >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {analysis.priceChange >= 0 ? '+' : ''}
                              {analysis.priceChange}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              波动?
                            </span>
                            <span
                              className={`font-medium ml-1 ${volatilityInfo.color}`}
                            >
                              {volatilityInfo.level}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">供需:</span>
                            <span
                              className={`font-medium ml-1 ${getSupplyDemandColor(analysis.supplyDemand.supply)}`}
                            >
                              {analysis.supplyDemand.supply === 'shortage'
                                ? '供应短缺'
                                : analysis.supplyDemand.supply === 'surplus'
                                  ? '供过于求'
                                  : '供需平衡'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 深度分析标签?*/}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analyses.map(analysis => (
              <Card key={analysis.commodity}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{analysis.commodity}</span>
                    {getTrendIcon(analysis.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ${analysis.currentPrice}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        当前价格
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${
                          analysis.priceChange >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {analysis.priceChange >= 0 ? '+' : ''}
                        {analysis.priceChange}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        价格变化
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">预测分析</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          短期(1�?:
                        </span>
                        <span
                          className={
                            analysis.forecast.shortTerm >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {analysis.forecast.shortTerm >= 0 ? '+' : ''}
                          {analysis.forecast.shortTerm}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          中期(3�?:
                        </span>
                        <span
                          className={
                            analysis.forecast.mediumTerm >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {analysis.forecast.mediumTerm >= 0 ? '+' : ''}
                          {analysis.forecast.mediumTerm}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          长期(6�?:
                        </span>
                        <span
                          className={
                            analysis.forecast.longTerm >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {analysis.forecast.longTerm >= 0 ? '+' : ''}
                          {analysis.forecast.longTerm}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">季节性特?/h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.seasonalPattern}
                    </p>
                  </div>

                  <Button className="w-full" variant="outline" size="sm">
                    详细分析报告
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 区域对比标签?*/}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                全球区域价格对比
              </CardTitle>
              <CardDescription>不同地区的市场价格指数比?/CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">地区</th>
                      <th className="text-right py-3">价格指数</th>
                      <th className="text-right py-3">变化?/th>
                      <th className="text-right py-3">交易?/th>
                      <th className="text-right py-3">趋势</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalData.map(region => (
                      <tr
                        key={region.region}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 font-medium">{region.region}</td>
                        <td className="py-3 text-right">{region.priceIndex}</td>
                        <td
                          className={`py-3 text-right font-medium ${
                            region.change >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {region.change >= 0 ? '+' : ''}
                          {region.change}%
                        </td>
                        <td className="py-3 text-right">
                          {(region.volume / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-3 text-right">
                          {region.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">风险提示</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      亚太地区价格指数持续上涨，建议关注汇率波动对采购成本的影响?                      欧洲市场需求疲软，可能存在进一步降价空间?                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
