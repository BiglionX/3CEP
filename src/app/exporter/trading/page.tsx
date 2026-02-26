'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Globe
} from 'lucide-react';

interface SalesOrder {
  id: string;
  customer: string;
  country: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expectedDelivery: string;
  actualDelivery?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  shippingMethod: string;
}

export default function TradingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟加载销售订单数据
    const mockOrders: SalesOrder[] = [
      {
        id: 'SO-2026-001',
        customer: 'TechGlobal Ltd.',
        country: '美国',
        product: 'iPhone 15 Pro',
        category: '智能手机',
        quantity: 1000,
        unitPrice: 8500,
        totalPrice: 8500000,
        status: 'confirmed',
        priority: 'high',
        createdAt: '2026-02-20T09:15:00',
        expectedDelivery: '2026-03-25T00:00:00',
        paymentStatus: 'paid',
        shippingMethod: '海运'
      },
      {
        id: 'SO-2026-002',
        customer: 'Digital Solutions GmbH',
        country: '德国',
        product: 'Samsung Galaxy S24',
        category: '智能手机',
        quantity: 800,
        unitPrice: 7200,
        totalPrice: 5760000,
        status: 'processing',
        priority: 'medium',
        createdAt: '2026-02-18T13:30:00',
        expectedDelivery: '2026-03-20T00:00:00',
        paymentStatus: 'paid',
        shippingMethod: '空运'
      },
      {
        id: 'SO-2026-003',
        customer: 'Asia Electronics Co.',
        country: '日本',
        product: 'iPad Air 6',
        category: '平板电脑',
        quantity: 500,
        unitPrice: 5500,
        totalPrice: 2750000,
        status: 'pending',
        priority: 'medium',
        createdAt: '2026-02-21T11:45:00',
        expectedDelivery: '2026-03-30T00:00:00',
        paymentStatus: 'partial',
        shippingMethod: '海运'
      },
      {
        id: 'SO-2026-004',
        customer: 'Mobile World Inc.',
        country: '英国',
        product: 'MacBook Air M2',
        category: '笔记本电脑',
        quantity: 300,
        unitPrice: 9800,
        totalPrice: 2940000,
        status: 'shipped',
        priority: 'high',
        createdAt: '2026-02-15T16:20:00',
        expectedDelivery: '2026-03-10T00:00:00',
        actualDelivery: '2026-03-09T14:30:00',
        paymentStatus: 'paid',
        shippingMethod: '快递'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status: SalesOrder['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: SalesOrder['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SalesOrder['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || order.country === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const handleCreateOrder = () => {
    router.push('/exporter/trading/new');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/exporter/trading/${orderId}`);
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
              <h1 className="text-xl font-semibold text-gray-900">销售订单管理</h1>
            </div>
            <Button onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              新建订单
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选区域 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索订单号、客户或产品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待确认</option>
                  <option value="confirmed">已确认</option>
                  <option value="processing">处理中</option>
                  <option value="shipped">已发货</option>
                  <option value="delivered">已交付</option>
                  <option value="cancelled">已取消</option>
                </select>
                
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部国家</option>
                  <option value="美国">美国</option>
                  <option value="德国">德国</option>
                  <option value="日本">日本</option>
                  <option value="英国">英国</option>
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
              <div className="text-2xl font-bold text-purple-600">
                ¥{(orders.reduce((sum, order) => sum + order.totalPrice, 0) / 10000).toFixed(1)}万
              </div>
              <div className="text-sm text-gray-600">总销售额</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">已收款</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {new Set(orders.map(o => o.country)).size}
              </div>
              <div className="text-sm text-gray-600">出口国家</div>
            </CardContent>
          </Card>
        </div>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              销售订单列表 ({filteredOrders.length})
            </CardTitle>
            <CardDescription>
              管理所有出口销售订单的状态和进度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无订单</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || countryFilter !== 'all' 
                      ? '没有找到匹配的订单' 
                      : '开始创建第一个销售订单吧'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && countryFilter === 'all' && (
                    <div className="mt-6">
                      <Button onClick={handleCreateOrder}>
                        <Plus className="h-4 w-4 mr-2" />
                        创建新订单
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">#{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'confirmed' ? '已确认' :
                             order.status === 'pending' ? '待确认' :
                             order.status === 'processing' ? '处理中' :
                             order.status === 'shipped' ? '已发货' :
                             order.status === 'delivered' ? '已交付' : '已取消'}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority === 'high' ? '紧急' : 
                             order.priority === 'medium' ? '中等' : '普通'}
                          </Badge>
                          <Badge className={getPaymentColor(order.paymentStatus)}>
                            {order.paymentStatus === 'paid' ? '已收款' :
                             order.paymentStatus === 'partial' ? '部分收款' : '未收款'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Users className="h-4 w-4" />
                              <span>客户: {order.customer}</span>
                              <Globe className="h-4 w-4 ml-2" />
                              <span>{order.country}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ShoppingCart className="h-4 w-4" />
                              <span>{order.product}</span>
                              <span className="text-gray-400">|</span>
                              <span>{order.category}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <span>数量: {order.quantity} 台</span>
                              <span>|</span>
                              <span>运输: {order.shippingMethod}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span>单价: ¥{order.unitPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>创建: {new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>预计交付: {new Date(order.expectedDelivery).toLocaleDateString('zh-CN')}</span>
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