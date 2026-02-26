'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Calendar, 
  FileText, 
  MessageSquare, 
  BarChart3,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp
} from 'lucide-react';

interface WorkOrder {
  id: string;
  customerName: string;
  deviceModel: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  estimatedCompletion: string;
}

export default function RepairShopDashboard() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 12,
    pendingOrders: 5,
    completedToday: 8,
    monthlyRevenue: 45000
  });

  useEffect(() => {
    // 模拟加载工单数据
    const mockOrders: WorkOrder[] = [
      {
        id: 'WO-001',
        customerName: '张三',
        deviceModel: 'iPhone 14 Pro',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2026-02-21T09:30:00',
        estimatedCompletion: '2026-02-21T15:00:00'
      },
      {
        id: 'WO-002',
        customerName: '李四',
        deviceModel: 'Samsung Galaxy S23',
        status: 'pending',
        priority: 'medium',
        createdAt: '2026-02-21T10:15:00',
        estimatedCompletion: '2026-02-22T14:00:00'
      },
      {
        id: 'WO-003',
        customerName: '王五',
        deviceModel: 'iPad Air 5',
        status: 'completed',
        priority: 'low',
        createdAt: '2026-02-21T08:45:00',
        estimatedCompletion: '2026-02-21T12:30:00'
      }
    ];
    setWorkOrders(mockOrders);
  }, []);

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Wrench className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">维修店工作台</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来，维修师傅！</h1>
          <p className="text-gray-600">今天是 {new Date().toLocaleDateString('zh-CN')}，祝您工作顺利</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今日工单</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待处理</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">今日完成</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本月收入</p>
                  <p className="text-2xl font-bold text-purple-600">¥{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 工单列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    最近工单
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      搜索
                    </Button>
                    <Button size="sm" onClick={() => router.push('/repair-shop/work-orders/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      新建工单
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  查看和管理您的维修工单
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/repair-shop/work-orders/${order.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{order.customerName}</span>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority === 'high' ? '紧急' : order.priority === 'medium' ? '中等' : '普通'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{order.deviceModel}</p>
                          <p className="text-xs text-gray-500">
                            创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === 'in_progress' ? '进行中' : 
                           order.status === 'pending' ? '待处理' :
                           order.status === 'completed' ? '已完成' : '已取消'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快捷操作和通知 */}
          <div className="space-y-6">
            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  快捷操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/repair-shop/work-orders/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建新工单
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/repair-shop/diagnostics')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  设备诊断
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/repair-shop/pricing')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  报价计算器
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/repair-shop/customers')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  客户管理
                </Button>
              </CardContent>
            </Card>

            {/* 今日提醒 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  今日提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">工单 WO-001 需要跟进</p>
                      <p className="text-xs text-gray-500">预计完成时间: 15:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">新客户咨询待回复</p>
                      <p className="text-xs text-gray-500">来自官网表单</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}