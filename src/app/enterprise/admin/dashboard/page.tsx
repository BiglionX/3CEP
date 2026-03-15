'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
  FileText,
} from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 12,
    activeAgents: 8,
    totalOrders: 156,
    pendingOrders: 23,
    monthlySpend: 45800,
    savingsRate: 18,
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'agent',
      title: '智能客服机器人部署成,
      description: '新的客服AI助手已上线运,
      time: '2小时,
      status: 'success',
    },
    {
      id: '2',
      type: 'order',
      title: '采购订单待审,
      description: '个采购订单等待您的审,
      time: '4小时,
      status: 'warning',
    },
    {
      id: '3',
      type: 'alert',
      title: '系统维护通知',
      description: '今晚23:00-24:00将进行系统维,
      time: '1天前',
      status: 'info',
    },
  ]);

  const menuItems = [
    { name: '仪表, href: '/enterprise/admin/dashboard', icon: BarChart3 },
    { name: '智能体管, href: '/enterprise/admin/agents', icon: Bot },
    {
      name: '采购管理',
      href: '/enterprise/admin/procurement',
      icon: ShoppingCart,
    },
    { name: '有奖问答', href: '/enterprise/admin/reward-qa', icon: HelpCircle },
    {
      name: '新品众筹',
      href: '/enterprise/admin/crowdfunding',
      icon: DollarSign,
    },
    { name: '企业资料', href: '/enterprise/admin/documents', icon: FileText },
    { name: '设备管理', href: '/enterprise/admin/devices', icon: Package },
    { name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },
    { name: '团队管理', href: '/enterprise/admin/team', icon: Users },
    { name: '系统设置', href: '/enterprise/admin/settings', icon: Settings },
  ];

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
          {isCurrency  `¥${value.toLocaleString()}` : value}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={change > 0  'text-green-600' : 'text-red-600'}>
              {change > 0  '+' : ''}
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
      {/* 顶部导航*/}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                企业管理中心
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边*/}
        <aside
          className={`${sidebarOpen  'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理菜单</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">仪表板概/h1>
              <p className="mt-1 text-sm text-gray-600">
                欢迎回来！这里是您企业AI服务的管理中心              </p>
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

            {/* 图表和活动区*/}
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
                               'bg-green-500'
                              : activity.status === 'warning'
                                 'bg-yellow-500'
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
                        <span>创建智能/span>
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
                        <span>管理智能/span>
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
                </CardContent>
              </Card>
            </div>

            {/* 详细统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 智能体状*/}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    智能体运行状态                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">总计</span>
                      <span className="font-semibold">
                        {stats.totalAgents}                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">运行/span>
                      <span className="font-semibold text-green-600">
                        {stats.activeAgents}                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-600">待启/span>
                      <span className="font-semibold text-yellow-600">
                        {stats.totalAgents - stats.activeAgents}                       </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">运行/span>
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
                      <span className="font-semibold">
                        {stats.totalOrders}                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600">处理/span>
                      <span className="font-semibold text-blue-600">
                        {stats.pendingOrders}                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">已完/span>
                      <span className="font-semibold text-green-600">
                        {stats.totalOrders - stats.pendingOrders}                       </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">成本节约/span>
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

      {/* 遮罩层（移动端） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

