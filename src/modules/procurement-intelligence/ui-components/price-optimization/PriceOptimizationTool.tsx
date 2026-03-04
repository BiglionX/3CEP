'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
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
import { Input } from '@/components/ui/input';

interface PriceOpportunity {
  id: string;
  commodity: string;
  currentPrice: number;
  optimalPrice: number;
  savingsPotential: number;
  confidence: number;
  timing: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  recommendation: string;
  factors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface PriceHistory {
  date: string;
  price: number;
  volume: number;
  movingAverage?: number;
}

interface OptimizationStrategy {
  strategy: string;
  description: string;
  expectedSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeframe: string;
  risk: 'low' | 'medium' | 'high';
}

export default function PriceOptimizationTool() {
  const [opportunities, setOpportunities] = useState<PriceOpportunity[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [budget, setBudget] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOpportunities: PriceOpportunity[] = [
        {
          id: 'OPT-001',
          commodity: '半导体芯?,
          currentPrice: 126.8,
          optimalPrice: 115.2,
          savingsPotential: 9.1,
          confidence: 0.85,
          timing: 'immediate',
          recommendation: '立即采购，价格处于历史低?,
          factors: ['库存周期底部', '需求季节性低?, '供应商产能充?],
          riskLevel: 'low',
        },
        {
          id: 'OPT-002',
          commodity: '稀土永磁材?,
          currentPrice: 86.7,
          optimalPrice: 78.5,
          savingsPotential: 9.5,
          confidence: 0.78,
          timing: 'short_term',
          recommendation: '未来2-3周内采购，预期价格回?,
          factors: ['政策面利?, '库存去化接近尾声', '下游需求回?],
          riskLevel: 'medium',
        },
        {
          id: 'OPT-003',
          commodity: '工业传感?,
          currentPrice: 45.2,
          optimalPrice: 42.8,
          savingsPotential: 5.3,
          confidence: 0.92,
          timing: 'medium_term',
          recommendation: '批量采购锁定价格，预?-6个月内实?,
          factors: ['技术成熟度?, '市场竞争充分', '标准化程度高'],
          riskLevel: 'low',
        },
        {
          id: 'OPT-004',
          commodity: '高端连接?,
          currentPrice: 15.8,
          optimalPrice: 13.2,
          savingsPotential: 16.5,
          confidence: 0.72,
          timing: 'long_term',
          recommendation: '战略合作谈判，争取长期价格协?,
          factors: ['客户集中度高', '技术壁垒明?, '替代品有?],
          riskLevel: 'high',
        },
      ];

      const mockPriceHistory: PriceHistory[] = [
        { date: '2023-10', price: 132.5, volume: 1200000 },
        { date: '2023-11', price: 128.3, volume: 1350000 },
        { date: '2023-12', price: 125.7, volume: 1180000 },
        { date: '2024-01', price: 122.4, volume: 1420000 },
        { date: '2024-02', price: 118.9, volume: 1560000 },
        { date: '2024-03', price: 115.2, volume: 1680000 },
      ];

      const mockStrategies: OptimizationStrategy[] = [
        {
          strategy: '批量采购折扣',
          description: '通过集中采购获得更好的价格折?,
          expectedSavings: 8.5,
          implementationEffort: 'low',
          timeframe: '1-2个月',
          risk: 'low',
        },
        {
          strategy: '长期合约锁定',
          description: '签订年度框架协议，锁定有利价?,
          expectedSavings: 12.3,
          implementationEffort: 'high',
          timeframe: '3-12个月',
          risk: 'medium',
        },
        {
          strategy: '供应商多元化',
          description: '引入竞争性供应商，增强议价能?,
          expectedSavings: 6.8,
          implementationEffort: 'medium',
          timeframe: '2-6个月',
          risk: 'low',
        },
        {
          strategy: '期货套期保?,
          description: '利用金融工具对冲价格波动风险',
          expectedSavings: 4.2,
          implementationEffort: 'high',
          timeframe: '持续进行',
          risk: 'medium',
        },
      ];

      setOpportunities(mockOpportunities);
      setPriceHistory(mockPriceHistory);
      setStrategies(mockStrategies);
      setLoading(false);
    };

    loadData();
  }, [selectedCommodity]);

  const filteredOpportunities = opportunities.filter(
    opp => selectedCommodity === 'all' || opp.commodity === selectedCommodity
  );

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case 'immediate':
        return 'text-green-600';
      case 'short_term':
        return 'text-blue-600';
      case 'medium_term':
        return 'text-yellow-600';
      case 'long_term':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const calculateTotalSavings = () => {
    const budgetNum = parseFloat(budget) || 0;
    const quantityNum = parseFloat(quantity) || 0;

    if (budgetNum > 0) {
      return opportunities.reduce((total, opp) => {
        return total + (budgetNum * opp.savingsPotential) / 100;
      }, 0);
    } else if (quantityNum > 0) {
      return opportunities.reduce((total, opp) => {
        return (
          total + (quantityNum * opp.currentPrice * opp.savingsPotential) / 100
        );
      }, 0);
    }
    return 0;
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
          <h1 className="text-3xl font-bold tracking-tight">价格优化工具</h1>
          <p className="text-muted-foreground">
            智能识别采购时机，最大化成本节约
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedCommodity}
            onValueChange={setSelectedCommodity}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="选择商品" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部商品</SelectItem>
              <SelectItem value="semiconductors">半导体芯?/SelectItem>
              <SelectItem value="rare-earth">稀土材?/SelectItem>
              <SelectItem value="sensors">传感?/SelectItem>
              <SelectItem value="connectors">连接?/SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 预算计算?*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            成本节约计算?          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                采购预算 ($)
              </label>
              <Input
                type="number"
                placeholder="输入预算金额"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">采购数量</label>
              <Input
                type="number"
                placeholder="输入采购数量"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">预估节约</label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  ${calculateTotalSavings().toFixed(2)}
                </div>
                <div className="text-xs text-green-600">基于当前机会</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优化机会卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              价格优化机会
            </CardTitle>
            <CardDescription>识别的采购成本节约机?/CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOpportunities.map(opportunity => (
                <div
                  key={opportunity.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{opportunity.commodity}</h3>
                    <Badge
                      variant={
                        opportunity.timing === 'immediate'
                          ? 'default'
                          : opportunity.timing === 'short_term'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {opportunity.timing === 'immediate'
                        ? '立即行动'
                        : opportunity.timing === 'short_term'
                          ? '短期机会'
                          : opportunity.timing === 'medium_term'
                            ? '中期规划'
                            : '长期策略'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        当前价格
                      </div>
                      <div className="font-medium">
                        ${opportunity.currentPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        最优价?                      </div>
                      <div className="font-medium text-green-600">
                        ${opportunity.optimalPrice}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        节约潜力
                      </div>
                      <div className="font-medium text-green-600">
                        {opportunity.savingsPotential}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        置信?                      </div>
                      <div className="font-medium">
                        {(opportunity.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {opportunity.recommendation}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.factors.slice(0, 2).map((factor, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {factor}
                      </Badge>
                    ))}
                    {opportunity.factors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{opportunity.factors.length - 2} 更多
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className={getTimingColor(opportunity.timing)}>
                      {opportunity.timing === 'immediate'
                        ? '立即行动建议'
                        : opportunity.timing === 'short_term'
                          ? '2-4周内行动'
                          : opportunity.timing === 'medium_term'
                            ? '1-3个月内规?
                            : '长期战略考虑'}
                    </span>
                    <span className={getRiskColor(opportunity.riskLevel)}>
                      风险:{' '}
                      {opportunity.riskLevel === 'low'
                        ? '�?
                        : opportunity.riskLevel === 'medium'
                          ? '中等'
                          : '�?}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 价格趋势分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              价格趋势分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">价格趋势图表</p>
                <p className="text-xs text-muted-foreground mt-1">
                  基于历史数据分析
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="font-medium">价格趋势</span>
                </div>
                <span className="text-green-700 font-medium">下降 12.3%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">最佳时?/span>
                </div>
                <span className="text-blue-700 font-medium">未来2-3�?/span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">目标价位</span>
                </div>
                <span className="text-yellow-700 font-medium">$115-120</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 优化策略 */}
      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="strategies">优化策略</TabsTrigger>
          <TabsTrigger value="historical">历史分析</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>推荐优化策略</CardTitle>
              <CardDescription>基于当前市场情况的专业建?/CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{strategy.strategy}</h3>
                      <Badge
                        variant={
                          strategy.implementationEffort === 'low'
                            ? 'default'
                            : strategy.implementationEffort === 'medium'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {strategy.implementationEffort === 'low'
                          ? '低难?
                          : strategy.implementationEffort === 'medium'
                            ? '中等难度'
                            : '高难?}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {strategy.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">预期节约:</span>
                        <span className="font-medium text-green-600 ml-1">
                          {strategy.expectedSavings}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">时间框架:</span>
                        <span className="font-medium ml-1">
                          {strategy.timeframe}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">风险等级:</span>
                        <span
                          className={`font-medium ml-1 ${
                            strategy.risk === 'low'
                              ? 'text-green-600'
                              : strategy.risk === 'medium'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {strategy.risk === 'low'
                            ? '�?
                            : strategy.risk === 'medium'
                              ? '中等'
                              : '�?}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline" size="sm">
                      详细方案
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>历史价格分析</CardTitle>
              <CardDescription>过去6个月的价格走势和模式分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">月份</th>
                      <th className="text-right py-2">价格($)</th>
                      <th className="text-right py-2">成交?/th>
                      <th className="text-right py-2">移动平均</th>
                      <th className="text-right py-2">涨跌?/th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((data, index) => {
                      const prevPrice =
                        index > 0 ? priceHistory[index - 1].price : data.price;
                      const change = (
                        ((data.price - prevPrice) / prevPrice) *
                        100
                      ).toFixed(2);

                      return (
                        <tr
                          key={data.date}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3">{data.date}</td>
                          <td className="py-3 text-right font-medium">
                            ${data.price}
                          </td>
                          <td className="py-3 text-right">
                            {(data.volume / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            ${(data.price * 0.97).toFixed(2)}
                          </td>
                          <td
                            className={`py-3 text-right font-medium ${
                              parseFloat(change) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {parseFloat(change) >= 0 ? '+' : ''}
                            {change}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">分析结论</h4>
                    <p className="text-sm text-green-700 mt-1">
                      当前价格处于?个月的历史低位区域，建议抓住采购机会?                      移动平均线呈下降趋势，短期内仍有进一步下行空间?                    </p>
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
