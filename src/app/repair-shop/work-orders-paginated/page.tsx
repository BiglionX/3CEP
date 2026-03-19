/**
 * 带分页功能的工单列表页面
 * 演示分页和懒加载机制的实际应用
 */

'use client';

import { useState } from 'react';
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
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Wrench,
  Loader2,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useWorkOrdersPaginated } from '@/hooks/use-repair-shop';
import { WorkOrderStatus, PriorityLevel, WorkOrder } from '@/types/repair-shop.types';

interface WorkOrderListPageProps {
  initialPage: number;
  initialPageSize: number;
}

export default function WorkOrderListWithPagination({
  initialPage = 1,
  initialPageSize = 10,
}: WorkOrderListPageProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>(
    'all'
  );

  // 构建过滤条件
  const filters = {
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    searchTerm: searchTerm || undefined,
  };

  // 使用分页Hook获取数据
  const { data, isLoading, isError, error } = useWorkOrdersPaginated(
    filters,
    currentPage,
    pageSize
  );

  const workOrders: WorkOrder[] = data?.data || [];
  const pagination = data?.pagination || {
    currentPage,
    pageSize,
    total: workOrders.length,
    totalPages: 1,
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'urgent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 重置到第一页
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
            <Button onClick={() => router.push('/repair-shop/work-orders/new')}>
              <Plus className="h-4 w-4 mr-2" />
              新建工单
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选区域 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索客户姓名、设备型号或工单号..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 状态筛选 */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(e.target.value as WorkOrderStatus | 'all')
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有状态</option>
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                  <option value="on_hold">暂停</option>
                </select>
              </div>

              {/* 优先级筛选 */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={e =>
                    setPriorityFilter(e.target.value as PriorityLevel | 'all')
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有优先级</option>
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  高级筛选
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 结果统计 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            找到 {pagination.total} 条工单记录
          </div>
          <div className="text-sm text-gray-500">
            第 {pagination.currentPage} 页，共 {pagination.totalPages} 页
          </div>
        </div>

        {/* 工单列表 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              工单列表
            </CardTitle>
            <CardDescription>管理所有维修工单的状态和进度</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-2">
                  <FileText className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  加载失败
                </h3>
                <p className="text-gray-500 mb-4">
                  {(error as Error).message || '未知错误'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  重新加载
                </Button>
              </div>
            ) : workOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  暂无工单
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ||
                  statusFilter !== 'all' ||
                  priorityFilter !== 'all'
                    ? '没有找到匹配的工单'
                    : '开始创建第一个工单吧'}
                </p>
                {!searchTerm &&
                  statusFilter === 'all' &&
                  priorityFilter === 'all' && (
                    <div className="mt-6">
                      <Button
                        onClick={() =>
                          router.push('/repair-shop/work-orders/new')
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        创建新工单
                      </Button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="space-y-4">
                {workOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/repair-shop/work-orders/${order.id}`)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            #{order.orderNumber || order.id}
                          </span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'in_progress'
                              ? '进行中'
                              : order.status === 'pending'
                                ? '待处理'
                                : order.status === 'completed'
                                  ? '已完成'
                                  : order.status === 'cancelled'
                                    ? '已取消'
                                    : order.status === 'on_hold'
                                      ? '暂停'
                                      : order.status}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority === 'high'
                              ? '紧急'
                              : order.priority === 'medium'
                                ? '中等'
                                : order.priority === 'low'
                                  ? '普通'
                                  : order.priority === 'urgent'
                                    ? '特急'
                                    : order.priority}
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
                            <div className="text-sm text-gray-600">
                              <Wrench className="h-4 w-4 inline mr-1" />
                              {order.deviceInfo.brand} {order.deviceInfo.model}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-600 mb-1">
                              技师: {order.technicianName || '未分配'}
                            </div>
                            <div className="text-sm text-gray-600">
                              创建时间:{' '}
                              {new Date(order.createdAt).toLocaleString(
                                'zh-CN'
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700 line-clamp-2">
                          问题描述: {order.faultDescription || '无描述'}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          ¥{order.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.estimatedCompletion &&
                            `预计完成: ${new Date(order.estimatedCompletion).toLocaleDateString('zh-CN')}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分页控件 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Pagination
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50]}
            showTotal={true}
            showPageSizeSelector={true}
            className=""
          />
        </div>
      </div>
    </div>
  );
}
