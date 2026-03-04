'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
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

export default function IntelligenceDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
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
      description: '系统根据需求自动创建了3个采购订?,
      time: '5分钟?,
      status: 'success',
    },
    {
      id: '2',
      type: 'supplier',
      title: '优质供应商推?,
      description: '发现新的优质供应商，评分92�?,
      time: '12分钟?,
      status: 'info',
    },
    {
      id: '3',
      type: 'alert',
      title: '供应链风险预?,
      description: '某主要供应商出现财务风险信号',
      time: '23分钟?,
      status: 'warning',
    },
    {
      id: '4',
      type: 'recommendation',
      title: '价格优化建议',
      description: '建议调整某品类采购时机，预计节省8%',
      time: '35分钟?,
      status: 'info',
    },
  ]);

  const [recommendations] = useState<SmartRecommendation[]>([
    {
      id: '1',
      type: 'supplier',
      title: '新增优质供应?,
      description: '发现符合您需求的新供应商，综合评?2�?,
      confidence: 0.92,
      priority: 'high',
      actionRequired: true,
    },
    {
      id: '2',
      type: 'pricing',
      title: '最佳采购时?,
      description: '内存条价格处于近6个月低位，建议立即采?,
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
    // 模拟刷新数据
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
        return <XCircle className="h-4 w-4 text-red-500" />;
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
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    isCurrency = false,
    badgeVariant = 'default',
  }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isCurrency ? `¥${value.toLocaleString()}` : value}
        </div>
        {change && (
          <div className="flex items-center mt-1">
            <Badge variant={badgeVariant as any}>{change}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 顶部控制?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">智能采购仪表?/h1>
          <p className="text-muted-foreground">基于AI驱动的采购决策支持系?/p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">�?�?/SelectItem>
              <SelectItem value="30d">�?0�?/SelectItem>
              <SelectItem value="90d">�?0�?/SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总供应商?
          value={stats.totalSuppliers}
          icon={Users}
          change="+12%"
          badgeVariant="default"
        />
        <StatCard
          title="活跃订单"
          value={stats.activeSuppliers}
          icon={Package}
          change="+8%"
          badgeVariant="default"
        />
        <StatCard
          title="待处理订?
          value={stats.pendingOrders}
          icon={Clock}
          change="-2%"
          badgeVariant="secondary"
        />
        <StatCard
          title="本月支出"
          value={stats.monthlySpend}
          icon={DollarSign}
          change="+5%"
          isCurrency
          badgeVariant="default"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 智能推荐区域 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                智能推荐与洞?              </CardTitle>
              <CardDescription>基于AI分析的采购优化建?/CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority === 'high'
                            ? '高优先级'
                            : rec.priority === 'medium'
                              ? '中优先级'
                              : '低优先级'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          置信? {(rec.confidence * 100).toFixed(0)}%
                        </span>
                        {rec.actionRequired && (
                          <Badge variant="outline">需要行?/Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      查看详情
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近活?*/}
          <Card>
            <CardHeader>
              <CardTitle>最近活?/CardTitle>
              <CardDescription>系统最新的操作和事?/CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息面板 */}
        <div className="space-y-6">
          {/* 风险监控 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                风险监控
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">高风险供应商</span>
                  <Badge variant="destructive">3�?/Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">价格异常波动</span>
                  <Badge variant="secondary">5�?/Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">交期延误预警</span>
                  <Badge variant="outline">2�?/Badge>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  查看详细报告
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 成本节约 */}
          <Card>
            <CardHeader>
              <CardTitle>成本节约分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.savingsRate}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  通过智能采购节省的成本比?                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>本月节省</span>
                    <span className="font-medium">¥432,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>累计节省</span>
                    <span className="font-medium">¥2,156,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  发起新采?                </Button>
                <Button className="w-full" variant="outline">
                  供应商评?                </Button>
                <Button className="w-full" variant="outline">
                  风险分析报告
                </Button>
                <Button className="w-full" variant="outline">
                  价格趋势分析
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
