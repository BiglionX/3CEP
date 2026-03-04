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
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';

interface ProcurementOrder {
  id: string;
  supplier: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status:
    | 'draft'
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expectedDelivery: string;
  actualDelivery?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

export default function ProcurementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟加载采购订单数据
    const mockOrders: ProcurementOrder[] = [
      {
        id: 'PO-2026-001',
        supplier: 'Samsung Electronics',
        product: 'Galaxy S24 Ultra 手机',
        category: '智能手机',
        quantity: 500,
        unitPrice: 7000,
        totalPrice: 3500000,
        status: 'confirmed',
        priority: 'high',
        createdAt: '2026-02-20T10:30:00',
        expectedDelivery: '2026-03-15T00:00:00',
        paymentStatus: 'paid',
      },
      {
        id: 'PO-2026-002',
        supplier: 'Apple Inc.',
        product: 'iPhone 15 Pro Max',
        category: '智能手机',
        quantity: 300,
        unitPrice: 9500,
        totalPrice: 2850000,
        status: 'shipped',
        priority: 'medium',
        createdAt: '2026-02-18T14:15:00',
        expectedDelivery: '2026-03-10T00:00:00',
        paymentStatus: 'paid',
      },
      {
        id: 'PO-2026-003',
        supplier: 'Dell Technologies',
        product: 'XPS 13 笔记本电?,
        category: '笔记本电?,
        quantity: 200,
        unitPrice: 6000,
        totalPrice: 1200000,
        status: 'pending',
        priority: 'medium',
        createdAt: '2026-02-21T09:45:00',
        expectedDelivery: '2026-03-20T00:00:00',
        paymentStatus: 'unpaid',
      },
      {
        id: 'PO-2026-004',
        supplier: '华为技?,
        product: 'MatePad Pro 平板',
        category: '平板电脑',
        quantity: 150,
        unitPrice: 4500,
        totalPrice: 675000,
        status: 'delivered',
        priority: 'low',
        createdAt: '2026-02-15T11:20:00',
        expectedDelivery: '2026-03-05T00:00:00',
        actualDelivery: '2026-03-04T16:30:00',
        paymentStatus: 'paid',
      },
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status: ProcurementOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: ProcurementOrder['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProcurementOrder['priority']) => {
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || order.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateOrder = () => {
    router.push('/importer/procurement/new');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/importer/procurement/${orderId}`);
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
                �?返回
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                采购订单管理
              </h1>
            </div>
            <Button onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              新建订单
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选区?*/}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索订单号、供应商或产?.."
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
                  <option value="all">全部状?/option>
                  <option value="draft">草稿</option>
                  <option value="pending">待确?/option>
                  <option value="confirmed">已确?/option>
                  <option value="shipped">已发?/option>
                  <option value="delivered">已交?/option>
                  <option value="cancelled">已取?/option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部类别</option>
                  <option value="智能手机">智能手机</option>
                  <option value="笔记本电?>笔记本电?/option>
                  <option value="平板电脑">平板电脑</option>
                  <option value="配件">配件</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.length}
              </div>
              <div className="text-sm text-gray-600">总订单数</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">待确?/div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ¥
                {(
                  orders.reduce((sum, order) => sum + order.totalPrice, 0) /
                  10000
                ).toFixed(1)}
                �?              </div>
              <div className="text-sm text-gray-600">总采购额</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">已付?/div>
            </CardContent>
          </Card>
        </div>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              采购订单列表 ({filteredOrders.length})
            </CardTitle>
            <CardDescription>管理所有采购订单的状态和进度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无订单
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ||
                    statusFilter !== 'all' ||
                    categoryFilter !== 'all'
                      ? '没有找到匹配的订?
                      : '开始创建第一个采购订单吧'}
                  </p>
                  {!searchTerm &&
                    statusFilter === 'all' &&
                    categoryFilter === 'all' && (
                      <div className="mt-6">
                        <Button onClick={handleCreateOrder}>
                          <Plus className="h-4 w-4 mr-2" />
                          创建新订?                        </Button>
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
                            {order.status === 'confirmed'
                              ? '已确?
                              : order.status === 'pending'
                                ? '待确?
                                : order.status === 'shipped'
                                  ? '已发?
                                  : order.status === 'delivered'
                                    ? '已交?
                                    : order.status === 'draft'
                                      ? '草稿'
                                      : '已取?}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority === 'high'
                              ? '紧?
                              : order.priority === 'medium'
                                ? '中等'
                                : '普?}
                          </Badge>
                          <Badge
                            className={getPaymentColor(order.paymentStatus)}
                          >
                            {order.paymentStatus === 'paid'
                              ? '已付?
                              : order.paymentStatus === 'partial'
                                ? '部分付款'
                                : '未付?}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Truck className="h-4 w-4" />
                              <span>供应? {order.supplier}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="h-4 w-4" />
                              <span>{order.product}</span>
                              <span className="text-gray-400">|</span>
                              <span>{order.category}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <span>数量: {order.quantity} �?/span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                单价: ¥{order.unitPrice.toLocaleString()}
                              </span>
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
                              <Calendar className="h-4 w-4" />
                              <span>
                                预计交付:{' '}
                                {new Date(
                                  order.expectedDelivery
                                ).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900">
                            ¥{order.totalPrice.toLocaleString()}
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
