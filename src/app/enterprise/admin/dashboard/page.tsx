'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Bot,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Package,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
  Headphones,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalOrders: number;
  pendingOrders: number;
  monthlySpend: number;
  savingsRate: number;
}

interface RecentActivity {
  id: string;
  type: 'agent' | 'order' | 'alert';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

export default function EnterpriseDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 12,
    activeAgents: 8,
    totalOrders: 156,
    pendingOrders: 23,
    monthlySpend: 45800,
    savingsRate: 18,
  });
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 更新统计数据（模拟数据变化）
    setStats({
      totalAgents: 12,
      activeAgents: 9,
      totalOrders: 160,
      pendingOrders: 20,
      monthlySpend: 46200,
      savingsRate: 19,
    });
    setLoading(false);
  };

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'agent',
      title: '智能客服机器人部署成功',
      description: '新的客服AI助手已上线运行',
      time: '2小时前',
      status: 'success',
    },
    {
      id: '2',
      type: 'order',
      title: '采购订单待审核',
      description: '3个采购订单等待您的审核',
      time: '4小时前',
      status: 'warning',
    },
    {
      id: '3',
      type: 'alert',
      title: '系统维护通知',
      description: '今晚23:00-24:00将进行系统维护',
      time: '1天前',
      status: 'info',
    },
  ]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    isCurrency = false,
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
          <p className="text-xs text-muted-foreground">
            <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
              {change > 0 ? '+' : ''}
              {change}%
            </span>{' '}
            本月对比
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">仪表板概览</h1>
                <p className="mt-1 text-sm text-gray-600">
                  欢迎回来！这里是您企业AI服务的管理中心
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                {loading ? '刷新中...' : '刷新数据'}
              </Button>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="智能体总数"
                value={stats.totalAgents}
                icon={Bot}
                change={12}
              />
              <StatCard
                title="活跃订单"
                value={stats.activeAgents}
                icon={CheckCircle}
                change={5}
              />
              <StatCard
                title="采购订单"
                value={stats.totalOrders}
                icon={ShoppingCart}
                change={-3}
              />
              <StatCard
                title="本月支出"
                value={stats.monthlySpend}
                icon={DollarSign}
                change={8}
                isCurrency
              />
            </div>

            {/* 图表和活动区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* 近期活动 */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    近期活动
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            activity.status === 'success'
                              ? 'bg-green-500'
                              : activity.status === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
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
                  <Button variant="outline" className="w-full mt-4">
                    查看全部活动
                  </Button>
                </CardContent>
              </Card>

              {/* 快捷操作 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>快捷操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/enterprise/agents/customize">
                      <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                        <Bot className="h-6 w-6" />
                        <span>创建智能体</span>
                      </Button>
                    </Link>
                    <Link href="/enterprise/procurement">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <ShoppingCart className="h-6 w-6" />
                        <span>发起采购</span>
                      </Button>
                    </Link>
                    <Link href="/enterprise/admin/agents">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Settings className="h-6 w-6" />
                        <span>管理智能体</span>
                      </Button>
                    </Link>
                    <Link href="/enterprise/admin/procurement">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Package className="h-6 w-6" />
                        <span>查看订单</span>
                      </Button>
                    </Link>
                    <Link href="/enterprise/admin/analytics">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span>数据分析</span>
                      </Button>
                    </Link>
                    <Link href="/enterprise/admin/settings">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Users className="h-6 w-6" />
                        <span>团队设置</span>
                      </Button>
                    </Link>
                  </div>

                  {/* APP下载区域 */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                      <Smartphone className="h-4 w-4 mr-2 inline" />
                      移动端应用
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-16 flex items-center justify-center gap-2"
                      >
                        <Download className="h-5 w-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">
                            桌面端下载
                          </div>
                          <div className="text-xs text-gray-500">
                            Windows / Mac
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex items-center justify-center gap-2"
                      >
                        <Smartphone className="h-5 w-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">
                            手机APP下载
                          </div>
                          <div className="text-xs text-gray-500">
                            iOS / Android
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 详细统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 智能体状态 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    智能体运行状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">总计</span>
                      <span className="font-semibold">{stats.totalAgents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">运行中</span>
                      <span className="font-semibold text-green-600">
                        {stats.activeAgents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-600">待启动</span>
                      <span className="font-semibold text-yellow-600">
                        {stats.totalAgents - stats.activeAgents}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">运行率</span>
                        <span className="font-semibold text-green-600">
                          {Math.round(
                            (stats.activeAgents / stats.totalAgents) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 采购统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    采购订单统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">总订单数</span>
                      <span className="font-semibold">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600">处理中</span>
                      <span className="font-semibold text-blue-600">
                        {stats.pendingOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">已完成</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalOrders - stats.pendingOrders}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">成本节约率</span>
                        <span className="font-semibold text-green-600">
                          {stats.savingsRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
    </div>
  );
}
