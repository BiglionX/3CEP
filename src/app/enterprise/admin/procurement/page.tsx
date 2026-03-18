'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  Bot,
  Coins,
  Globe,
  CreditCard,
  HelpCircle,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Headphones,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';

interface ProcurementOrder {
  id: string;
  title: string;
  status:
    | 'pending'
    | 'approved'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  supplier: string;
  amount: number;
  items: number;
  createdAt: string;
  expectedDelivery: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function EnterpriseProcurementPage() {
  const [orders] = useState<ProcurementOrder[]>([
    {
      id: 'PO-2024-001',
      title: '电子元器件采购',
      status: 'processing',
      supplier: '华强北电子科技有限公司',
      amount: 125000,
      items: 45,
      createdAt: '2024-01-18',
      expectedDelivery: '2024-01-25',
      priority: 'high',
    },
    {
      id: 'PO-2024-002',
      title: '机械零部件订单',
      status: 'approved',
      supplier: '长三角精密制造集团',
      amount: 89000,
      items: 23,
      createdAt: '2024-01-19',
      expectedDelivery: '2024-01-30',
      priority: 'medium',
    },
    {
      id: 'PO-2024-003',
      title: '包装材料采购',
      status: 'delivered',
      supplier: '珠三角新材料有限公司',
      amount: 45000,
      items: 12,
      createdAt: '2024-01-15',
      expectedDelivery: '2024-01-22',
      priority: 'low',
    },
    {
      id: 'PO-2024-004',
      title: '办公设备采购',
      status: 'pending',
      supplier: '待确认',
      amount: 156000,
      items: 8,
      createdAt: '2024-01-20',
      expectedDelivery: '2024-02-05',
      priority: 'urgent',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || order.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || order.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: '待审核',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        };
      case 'approved':
        return {
          label: '已批准',
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
        };
      case 'processing':
        return {
          label: '处理中',
          color: 'bg-purple-100 text-purple-800',
          icon: Package,
        };
      case 'shipped':
        return {
          label: '已发货',
          color: 'bg-indigo-100 text-indigo-800',
          icon: Truck,
        };
      case 'delivered':
        return {
          label: '已送达',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          label: '已取消',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { label: '低', color: 'bg-gray-100 text-gray-800' };
      case 'medium':
        return { label: '中', color: 'bg-blue-100 text-blue-800' };
      case 'high':
        return { label: '高', color: 'bg-orange-100 text-orange-800' };
      case 'urgent':
        return { label: '紧急', color: 'bg-red-100 text-red-800' };
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      counts[order.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            {/* 页面标题和操作按钮 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">采购管理</h1>
                <p className="mt-1 text-sm text-gray-600">
                  管理企业采购订单和供应商关系
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  采购分析
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建采购
                </Button>
              </div>
            </div>

            {/* 搜索和过*/}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="搜索采购单号、标题或供应.."
                      className="pl-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all">所有状态</option>
                      <option value="pending">待审核</option>
                      <option value="approved">已批准</option>
                      <option value="processing">处理中</option>
                      <option value="shipped">已发货</option>
                      <option value="delivered">已送达</option>
                      <option value="cancelled">已取消</option>
                    </select>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterPriority}
                      onChange={e => setFilterPriority(e.target.value)}
                    >
                      <option value="all">所有优先级</option>
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 统计概览 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.pending}
                  </p>
                  <p className="text-xs text-gray-600">待审核</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.approved}
                  </p>
                  <p className="text-xs text-gray-600">已批准</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.processing}
                  </p>
                  <p className="text-xs text-gray-600">处理中</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.shipped}
                  </p>
                  <p className="text-xs text-gray-600">已发货</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.delivered}
                  </p>
                  <p className="text-xs text-gray-600">已送达</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥
                    {(
                      orders.reduce((sum, order) => sum + order.amount, 0) /
                      10000
                    ).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">总金额(万元)</p>
                </CardContent>
              </Card>
            </div>

            {/* 采购订单列表 */}
            <div className="space-y-6">
              {filteredOrders.map(order => {
                const statusConfig = getStatusConfig(order.status);
                const priorityConfig = getPriorityConfig(order.priority);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {order.title}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  #{order.id}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}
                                >
                                  {priorityConfig.label}优先{' '}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2">
                                供应 {order.supplier}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    商品数量:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {order.items}{' '}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    订单金额:
                                  </span>
                                  <span className="ml-2 font-medium text-green-600">
                                    ¥{order.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    创建时间:
                                  </span>
                                  <span className="ml-2">
                                    {order.createdAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>预计交付: {order.expectedDelivery}</span>
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-0 flex space-x-3">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>

                          {(order.status === 'pending' ||
                            order.status === 'approved') && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              编辑订单
                            </Button>
                          )}

                          {order.status === 'processing' && (
                            <Button variant="outline" size="sm">
                              <Truck className="w-4 h-4 mr-2" />
                              跟踪物流
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredOrders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      未找到匹配的采购订单
                    </h3>
                    <p className="text-gray-500 mb-4">
                      尝试调整搜索条件或创建新的采购订{' '}
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      新建采购{' '}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
