'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  MapPin,
  Phone,
  User,
  MoreVertical,
  Eye,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  deviceName: string;
  brand: string;
  model: string;
  issue: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createTime: string;
  updateTime: string;
  estimatedCompletion: string;
  actualCompletion: string | null;
  totalPrice: number;
  serviceLocation: string;
  technician: string;
  contactPhone: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // 模拟获取订单数据
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 'ord_001',
          orderNumber: 'ORD202402001',
          deviceName: 'iPhone 14 Pro',
          brand: 'Apple',
          model: 'A2890',
          issue: '屏幕碎裂，无法正常显?,
          status: 'completed',
          priority: 'high',
          createTime: '2024-02-15T10:30:00',
          updateTime: '2024-02-18T15:45:00',
          estimatedCompletion: '2024-02-17T17:00:00',
          actualCompletion: '2024-02-18T15:45:00',
          totalPrice: 899,
          serviceLocation: '北京市朝阳区维修中心',
          technician: '张师?,
          contactPhone: '138****1234',
        },
        {
          id: 'ord_002',
          orderNumber: 'ORD202402002',
          deviceName: 'Samsung Galaxy S23',
          brand: 'Samsung',
          model: 'SM-S9110',
          issue: '电池老化，续航时间短',
          status: 'processing',
          priority: 'medium',
          createTime: '2024-02-18T09:15:00',
          updateTime: '2024-02-20T11:30:00',
          estimatedCompletion: '2024-02-22T18:00:00',
          actualCompletion: null,
          totalPrice: 450,
          serviceLocation: '上海市浦东新区服务中?,
          technician: '李师?,
          contactPhone: '139****5678',
        },
        {
          id: 'ord_003',
          orderNumber: 'ORD202402003',
          deviceName: 'MacBook Pro 14"',
          brand: 'Apple',
          model: 'M2 Pro',
          issue: '键盘按键失灵，部分功能异?,
          status: 'pending',
          priority: 'urgent',
          createTime: '2024-02-20T14:20:00',
          updateTime: '2024-02-20T14:20:00',
          estimatedCompletion: '2024-02-25T17:00:00',
          actualCompletion: null,
          totalPrice: 0,
          serviceLocation: '广州市天河区维修?,
          technician: '待分?,
          contactPhone: '136****9012',
        },
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: '待处?,
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        };
      case 'processing':
        return {
          text: '处理?,
          color: 'bg-blue-100 text-blue-800',
          icon: Truck,
        };
      case 'completed':
        return {
          text: '已完?,
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          text: '已取?,
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
        };
      default:
        return {
          text: '未知',
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
        };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'low':
        return { text: '�?, color: 'text-gray-500' };
      case 'medium':
        return { text: '�?, color: 'text-blue-500' };
      case 'high':
        return { text: '�?, color: 'text-orange-500' };
      case 'urgent':
        return { text: '紧?, color: 'text-red-500' };
      default:
        return { text: '未知', color: 'text-gray-500' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.issue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和筛选栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
          <p className="text-gray-600 mt-1">查看和管理您的维修订单历?/p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索订单号、设备或问题..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状?/option>
            <option value="pending">待处?/option>
            <option value="processing">处理?/option>
            <option value="completed">已完?/option>
            <option value="cancelled">已取?/option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
                <p className="text-sm text-gray-600">总订单数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">待处?/p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
                <p className="text-sm text-gray-600">处理?/p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">已完?/p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          const priorityInfo = getPriorityInfo(order.priority);
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* 订单左侧信息 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{order.orderNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </span>
                          <span
                            className={`text-xs font-medium ${priorityInfo.color}`}
                          >
                            优先? {priorityInfo.text}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {order.deviceName} ({order.brand} {order.model})
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          问题描述: {order.issue}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 时间和地点信?*/}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <div>
                          <p>
                            创建时间:{' '}
                            {new Date(order.createTime).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500">
                            预计完成:{' '}
                            {new Date(
                              order.estimatedCompletion
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{order.serviceLocation}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <div>
                          <p>技? {order.technician}</p>
                          <p className="text-gray-500">{order.contactPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 订单右侧操作 */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ¥{order.totalPrice}
                      </p>
                      <p className="text-sm text-gray-500">总费?/p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                      {order.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          再次维修
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 空状?*/}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无订单</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? '没有找到匹配的订?
              : '您还没有创建任何维修订单'}
          </p>
          <div className="mt-6">
            <Button>
              <Package className="w-4 h-4 mr-2" />
              创建维修订单
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

