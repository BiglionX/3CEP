'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';

interface DashboardStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  pendingOrders: number;
  monthlySpend: number;
  savingsRate: number;
  riskAlerts: number;
  opportunities: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'supplier' | 'alert' | 'recommendation';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface SmartRecommendation {
  id: string;
  type: 'supplier' | 'pricing' | 'contract' | 'risk';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

export default function ProcurementIntelligencePage() {
  const [stats] = useState<DashboardStats>({
    totalSuppliers: 156,
    activeSuppliers: 134,
    totalOrders: 247,
    pendingOrders: 12,
    monthlySpend: 2345000,
    savingsRate: 18.5,
    riskAlerts: 3,
    opportunities: 8,
  });

  const [activities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'order',
      title: '智能采购订单创建',
      description: '系统根据需求自动创建了3个采购订单',
      time: '5分钟前',
      status: 'success',
    },
    {
      id: '2',
      type: 'supplier',
      title: '优质供应商推荐',
      description: '发现新的优质供应商，评分92分',
      time: '12分钟前',
      status: 'info',
    },
    {
      id: '3',
      type: 'alert',
      title: '供应链风险预警',
      description: '某主要供应商出现财务风险信号',
      time: '23分钟前',
      status: 'warning',
    },
    {
      id: '4',
      type: 'recommendation',
      title: '价格优化建议',
      description: '建议调整某品类采购时机，预计节省8%',
      time: '35分钟前',
      status: 'info',
    },
  ]);

  const [recommendations] = useState<SmartRecommendation[]>([
    {
      id: '1',
      type: 'supplier',
      title: '新增优质供应商',
      description: '发现符合您需求的新供应商，综合评分92分',
      confidence: 0.92,
      priority: 'high',
      actionRequired: true,
    },
    {
      id: '2',
      type: 'pricing',
      title: '最佳采购时机',
      description: '内存条价格处于近6个月低位，建议立即采购',
      confidence: 0.87,
      priority: 'high',
      actionRequired: true,
    },
    {
      id: '3',
      type: 'contract',
      title: '合同条款优化',
      description: '建议增加质量保证金条款，降低风险',
      confidence: 0.78,
      priority: 'medium',
      actionRequired: false,
    },
  ]);

  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-3 h-8 w-8 text-blue-600" />
            采购智能体控制台
          </h1>
          <p className="mt-2 text-gray-600">
            基于AI的智能采购决策与风险管理平台
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">今天</option>
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center"
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            刷新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">供应商总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              活跃 {stats.activeSuppliers} 家
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">采购订单</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              待处理 {stats.pendingOrders} 单
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月度支出</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlySpend)}
            </div>
            <p className="text-xs text-muted-foreground">
              节省率 {stats.savingsRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">风险预警</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.riskAlerts}
            </div>
            <p className="text-xs text-muted-foreground">待处理风险事件</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            仪表盘
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            供应商管理
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            智能决策
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            数据分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  最近活动
                </CardTitle>
                <CardDescription>系统最近的重要活动和通知</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="mt-1">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  智能推荐
                </CardTitle>
                <CardDescription>基于AI分析的优化建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority === 'high'
                            ? '高优先级'
                            : rec.priority === 'medium'
                              ? '中优先级'
                              : '低优先级'}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          置信度 {(rec.confidence * 100).toFixed(0)}%
                        </span>
                        {rec.actionRequired && (
                          <Button size="sm" variant="outline">
                            立即处理
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>供应商智能管理</CardTitle>
              <CardDescription>基于AI的供应商画像和风险管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  供应商管理模块
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  正在加载供应商画像和风险评估数据...
                </p>
                <div className="mt-6">
                  <Button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新数据
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle>智能决策中心</CardTitle>
              <CardDescription>AI驱动的采购决策和优化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  决策引擎
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  正在分析采购需求并生成智能决策...
                </p>
                <div className="mt-6">
                  <Button>
                    <Brain className="mr-2 h-4 w-4" />
                    开始智能决策
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>数据分析洞察</CardTitle>
              <CardDescription>价格趋势、市场情报和绩效分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  数据分析
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  正在生成数据洞察和可视化报告...
                </p>
                <div className="mt-6">
                  <Button>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    查看分析报告
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-16 flex flex-col items-center justify-center">
                <Target className="h-5 w-5 mb-1" />
                <span>创建采购需求</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center"
              >
                <Users className="h-5 w-5 mb-1" />
                <span>评估供应商</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center"
              >
                <Zap className="h-5 w-5 mb-1" />
                <span>智能决策</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center"
              >
                <TrendingUp className="h-5 w-5 mb-1" />
                <span>分析报告</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
