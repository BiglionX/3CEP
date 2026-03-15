'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { SimpleSearch } from '@/components/search/SimpleSearch';

interface WorkOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  deviceIssue: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  technician: string;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion: string;
  actualCompletion: string;
  price: number;
}

export default function WorkOrdersPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [advancedSearchMode, setAdvancedSearchMode] = useState(false);

  useEffect(() => {
    // 模拟加载工单数据
    const mockOrders: WorkOrder[] = [
      {
        id: 'WO-001',
        customerName: '张三',
        customerPhone: '138****1234',
        deviceModel: 'iPhone 14 Pro',
        deviceIssue: '屏幕碎裂，无法开机',
        status: 'in_progress',
        priority: 'high',
        technician: '李师傅',
        createdAt: '2026-02-21T09:30:00',
        updatedAt: '2026-02-21T14:20:00',
        estimatedCompletion: '2026-02-21T15:00:00',
        price: 880,
      },
      {
        id: 'WO-002',
        customerName: '李四',
        customerPhone: '139****5678',
        deviceModel: 'Samsung Galaxy S23',
        deviceIssue: '电池鼓包，充电异常',
        status: 'pending',
        priority: 'medium',
        technician: '王师傅',
        createdAt: '2026-02-21T10:15:00',
        updatedAt: '2026-02-21T10:15:00',
        estimatedCompletion: '2026-02-22T14:00:00',
        price: 450,
      },
      {
        id: 'WO-003',
        customerName: '王五',
        customerPhone: '137****9012',
        deviceModel: 'iPad Air 5',
        deviceIssue: 'WiFi连接不稳定',
        status: 'completed',
        priority: 'low',
        technician: '张师傅',
        createdAt: '2026-02-21T08:45:00',
        updatedAt: '2026-02-21T12:30:00',
        estimatedCompletion: '2026-02-21T12:30:00',
        actualCompletion: '2026-02-21T12:25:00',
        price: 280,
      },
      {
        id: 'WO-004',
        customerName: '赵六',
        customerPhone: '136****3456',
        deviceModel: 'MacBook Pro 14"',
        deviceIssue: '键盘按键失灵',
        status: 'cancelled',
        priority: 'medium',
        technician: '陈师傅',
        createdAt: '2026-02-20T16:20:00',
        updatedAt: '2026-02-21T09:15:00',
        estimatedCompletion: '2026-02-22T16:00:00',
        price: 0,
      },
    ];
    setWorkOrders(mockOrders);
  }, []);

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'pending':
        return '待处理';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'high':
        return '紧急';
      case 'medium':
        return '中等';
      case 'low':
        return '普通';
      default:
        return priority;
    }
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateOrder = () => {
    router.push('/repair-shop/work-orders/new');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/repair-shop/work-orders/${orderId}`);
  };

  // 处理高级搜索
  const handleAdvancedSearch = (query: string) => {
    setSearchTerm(query);
    // 这里可以添加更复杂的搜索逻辑
  };

  // 处理搜索结果选择
  const handleSearchResultSelect = (result: any) => {
    // 可以直接跳转到选中的工单详情页
    if (result.id) {
      router.push(`/repair-shop/work-orders/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                ← 返回
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">工单管理</h1>
            </div>
            <Button onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              新建工单
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选区域 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                工单搜索
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdvancedSearchMode(!advancedSearchMode)}
              >
                {advancedSearchMode  '基础搜索' : '高级搜索'}
              </Button>
            </div>
            <CardDescription>
              {advancedSearchMode
                 '使用高级搜索功能进行精准查找'
                : '快速搜索工单信息'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {advancedSearchMode  (
              <SimpleSearch
                placeholder="搜索工单号、客户姓名或设备型号..."
                onSearch={handleAdvancedSearch}
                onResultSelect={handleSearchResultSelect}
                className="max-w-2xl"
              />
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索客户姓名、设备型号或工单号..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">全部优先级</option>
                    <option value="high">紧急</option>
                    <option value="medium">中等</option>
                    <option value="low">普通</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workOrders.length}
              </div>
              <div className="text-sm text-gray-600">总工单数</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {workOrders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">待处理</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {workOrders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ¥
                {workOrders
                  .filter(o => o.status === 'completed')
                  .reduce((sum, order) => sum + order.price, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">总收入</div>
            </CardContent>
          </Card>
        </div>

        {/* 工单列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              工单列表 ({filteredOrders.length})
            </CardTitle>
            <CardDescription>管理所有维修工单的状态和进度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无工单
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ||
                    statusFilter !== 'all' ||
                    priorityFilter !== 'all'
                       '没有找到匹配的工单'
                      : '开始创建第一个工单吧'}
                  </p>
                  {!searchTerm &&
                    statusFilter === 'all' &&
                    priorityFilter === 'all' && (
                      <div className="mt-6">
                        <Button onClick={handleCreateOrder}>
                          <Plus className="h-4 w-4 mr-2" />
                          创建新工单
                        </Button>
                      </div>
                    )}
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            #{order.id}
                          </span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {getPriorityText(order.priority)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <User className="h-4 w-4" />
                              <span>{order.customerName}</span>
                              <Phone className="h-4 w-4 ml-2" />
                              <span>{order.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Wrench className="h-4 w-4" />
                              <span>{order.deviceModel}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-700 mb-2">
                              {order.deviceIssue}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>技师: {order.technician}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                创建:{' '}
                                {new Date(order.createdAt).toLocaleDateString(
                                  'zh-CN'
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                预计完成:{' '}
                                {new Date(
                                  order.estimatedCompletion
                                ).toLocaleString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900">
                            ¥{order.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
