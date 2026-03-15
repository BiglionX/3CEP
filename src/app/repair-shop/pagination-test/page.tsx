/**
 * 分页功能测试页面
 * 用于验证分页组件的各种功能和性能表现
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Activity,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useWorkOrdersPaginated } from '@/hooks/use-repair-shop';
import { WorkOrder } from '@/types/repair-shop.types';

export default function PaginationTestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [testScenario, setTestScenario] = useState<'normal' | 'slow' | 'error'>(
    'normal'
  );

  // 使用分页Hook
  const { data, isLoading, isError, error, isFetching } =
    useWorkOrdersPaginated(
      testScenario === 'error'  { status: 'invalid' as any } : undefined,
      currentPage,
      pageSize
    );

  const workOrders: WorkOrder[] = data.data || [];
  const pagination = data.pagination || {
    currentPage,
    pageSize,
    total: workOrders.length,
    totalPages: Math.ceil(workOrders.length / pageSize),
  };

  // 模拟不同测试场景
  const getTestScenarioConfig = () => {
    switch (testScenario) {
      case 'slow':
        return { delay: 2000, label: '慢速网络', color: 'yellow' };
      case 'error':
        return { delay: 0, label: '错误状态', color: 'red' };
      default:
        return { delay: 500, label: '正常速度', color: 'green' };
    }
  };

  const scenarioConfig = getTestScenarioConfig();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">分页功能测试</h1>
        <p className="text-gray-600">验证分页组件的性能、交互和用户体验</p>
      </div>

      {/* 测试控制面板 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            测试控制面板
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 场景选择 */}
            <div>
              <h3 className="font-medium mb-3">测试场景</h3>
              <div className="space-y-2">
                <Button
                  variant={testScenario === 'normal'  'default' : 'outline'}
                  onClick={() => setTestScenario('normal')}
                  className="w-full justify-start"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  正常响应
                </Button>
                <Button
                  variant={testScenario === 'slow'  'default' : 'outline'}
                  onClick={() => setTestScenario('slow')}
                  className="w-full justify-start"
                >
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  慢速网络
                </Button>
                <Button
                  variant={testScenario === 'error'  'default' : 'outline'}
                  onClick={() => setTestScenario('error')}
                  className="w-full justify-start"
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  模拟错误
                </Button>
              </div>
            </div>

            {/* 分页设置 */}
            <div>
              <h3 className="font-medium mb-3">分页配置</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    每页条数
                  </label>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5 条/页</option>
                    <option value={10}>10 条/页</option>
                    <option value={20}>20 条/页</option>
                    <option value={50}>50 条/页</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    当前页
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={pagination.totalPages}
                    value={currentPage}
                    onChange={e =>
                      setCurrentPage(
                        Math.max(
                          1,
                          Math.min(
                            Number(e.target.value),
                            pagination.totalPages
                          )
                        )
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 状态信息 */}
            <div>
              <h3 className="font-medium mb-3">当前状态</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">响应速度:</span>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      scenarioConfig.color === 'green'
                         'text-green-600 border-green-200'
                        : scenarioConfig.color === 'yellow'
                           'text-yellow-600 border-yellow-200'
                          : 'text-red-600 border-red-200'
                    }`}
                  >
                    {scenarioConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">数据状态:</span>
                  <Badge
                    variant={
                      isLoading
                         'secondary'
                        : isError
                           'destructive'
                          : 'default'
                    }
                  >
                    {isLoading  '加载中' : isError  '错误' : '就绪'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">获取时间:</span>
                  <span className="text-sm">
                    {isFetching  '正在获取...' : '已缓存'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据展示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 工单列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  工单数据 ({workOrders.length} 条)
                </span>
                {isFetching && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Activity className="h-4 w-4 animate-spin" />
                    获取中...
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                当前第 {pagination.currentPage} 页，共 {pagination.totalPages}{' '}
                页
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading  (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : isError  (
                <div className="text-center py-8">
                  <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    数据加载失败
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {(error as Error).message || '未知错误'}
                  </p>
                  <Button variant="outline" size="sm">
                    重试
                  </Button>
                </div>
              ) : workOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    暂无数据
                  </h3>
                  <p className="text-gray-500">
                    {testScenario === 'error'
                       '模拟错误场景下无数据'
                      : '当前筛选条件下无匹配数据'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            #{order.orderNumber || `TEST-${index + 1}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            客户: {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            设备: {order.deviceInfo.brand} {order.deviceInfo.model}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              order.status === 'completed'
                                 'default'
                                : order.status === 'in_progress'
                                   'secondary'
                                  : 'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            ¥{(order.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 性能统计 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                性能统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总记录数</span>
                  <span className="font-medium">{pagination.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总页数</span>
                  <span className="font-medium">{pagination.totalPages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">当前页记录</span>
                  <span className="font-medium">
                    {Math.min(
                      pageSize,
                      pagination.total - (currentPage - 1) * pageSize
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">缓存状态</span>
                  <Badge variant="outline">
                    {isFetching  '刷新中' : '已缓存'}
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">分页特点</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 平滑的页面切换</li>
                    <li>• 智能的页码显示</li>
                    <li>• 响应式布局适配</li>
                    <li>• 键盘导航支持</li>
                    <li>• 加载状态指示</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分页控件展示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            分页控件演示
          </CardTitle>
          <CardDescription>展示不同配置下的分页组件表现</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* 标准分页 */}
            <div>
              <h3 className="font-medium mb-3">标准分页控件</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  showTotal={true}
                  showPageSizeSelector={true}
                />
              </div>
            </div>

            {/* 简化分页 */}
            <div>
              <h3 className="font-medium mb-3">简化分页控件</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={setCurrentPage}
                  showTotal={false}
                  showPageSizeSelector={false}
                  showPageNumbers={true}
                />
              </div>
            </div>

            {/* 移动端优化分页 */}
            <div>
              <h3 className="font-medium mb-3">移动端优化分页</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
                <Pagination
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={setCurrentPage}
                  showTotal={true}
                  showPageSizeSelector={false}
                  className="flex-col gap-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
