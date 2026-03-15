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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Building,
  BarChart3,
} from 'lucide-react';

interface TradeOrder {
  id: string;
  type: 'import' | 'export';
  partner: string;
  product: string;
  quantity: number;
  amount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  expectedDelivery: string;
  country: string;
}

interface CompanyStats {
  totalOrders: number;
  importOrders: number;
  exportOrders: number;
  totalAmount: number;
  partners: number;
  pendingApprovals: number;
}

export default function ForeignTradeCompanyPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'importer' | 'exporter'>(
    'importer'
  );
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [stats, setStats] = useState<CompanyStats>({
    totalOrders: 0,
    importOrders: 0,
    exportOrders: 0,
    totalAmount: 0,
    partners: 0,
    pendingApprovals: 0,
  });

  const handleRoleChange = (role: 'importer' | 'exporter') => {
    setActiveRole(role);
  };

  useEffect(() => {
    loadTradeData();
  }, [activeRole]);

  const loadTradeData = () => {
    // 模拟加载贸易数据
    const mockOrders: TradeOrder[] =
      activeRole === 'importer' ? [

            {
              id: 'PO-2026-001',
              type: 'import',
              partner: 'Samsung Electronics (韩国)',
              product: 'Galaxy S24 Ultra 手机',
              quantity: 500,
              amount: 3500000,
              status: 'confirmed',
              expectedDelivery: '2026-03-15',
              country: '韩国',
            },
            {
              id: 'PO-2026-002',
              type: 'import',
              partner: 'Apple Inc. (美国)',
              product: 'iPhone 15 Pro Max',
              quantity: 300,
              amount: 2850000,
              status: 'shipped',
              expectedDelivery: '2026-03-10',
              country: '美国',
            },
            {
              id: 'PO-2026-003',
              type: 'import',
              partner: 'Sony Corporation (日本)',
              product: 'PlayStation 5',
              quantity: 200,
              amount: 1200000,
              status: 'pending',
              expectedDelivery: '2026-03-20',
              country: '日本',
            },
          ]
        : [
            {
              id: 'SO-2026-001',
              type: 'export',
              partner: 'TechGlobal Ltd. (美国)',
              product: '华为Mate 60 Pro',
              quantity: 1000,
              amount: 8500000,
              status: 'confirmed',
              expectedDelivery: '2026-03-25',
              country: '美国',
            },
            {
              id: 'SO-2026-002',
              type: 'export',
              partner: 'Digital Solutions GmbH (德国)',
              product: '小米14 Ultra',
              quantity: 800,
              amount: 5760000,
              status: 'processing',
              expectedDelivery: '2026-03-20',
              country: '德国',
            },
            {
              id: 'SO-2026-003',
              type: 'export',
              partner: 'Asia Electronics Co. (日本)',
              product: 'OPPO Find X7',
              quantity: 500,
              amount: 2750000,
              status: 'pending',
              expectedDelivery: '2026-03-30',
              country: '日本',
            },
          ];

    setOrders(mockOrders);

    // 更新统计数据
    const importOrders = mockOrders.filter(o => o.type === 'import').length;
    const exportOrders = mockOrders.filter(o => o.type === 'export').length;
    const totalAmount = mockOrders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    setStats({
      totalOrders: mockOrders.length,
      importOrders,
      exportOrders,
      totalAmount,
      partners: 15,
      pendingApprovals: mockOrders.filter(o => o.status === 'pending').length,
    });
  };

  const getStatusColor = (status: TradeOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TradeOrder['status']) => {
    switch (status) {
      case 'delivered':
        return '已交付';
      case 'shipped':
        return '已发货';
      case 'processing':
        return '处理中';
      case 'confirmed':
        return '已确认';
      case 'pending':
        return '待确认';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <ArrowLeft className="h-4 w-4 mr-1" />
    ) : (
      <ArrowLeft className="h-4 w-4 mr-1 rotate-180" />
    );
  };

  const getTypeColor = (type: 'import' | 'export') => {
    return type === 'import' ? 'text-blue-600' : 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ForeignTradeSidebar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />

      <div className="flex-1 lg:ml-0">
        {/* 头部导航 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {activeRole === 'importer'
                     ? '进口商业务中心'
                    : '出口商业务中心'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  返回首页
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 业务模式指示器 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeRole === 'importer' ? '进口商业务模式'
                    : '出口商业务模式'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {activeRole === 'importer'
                     ? '管理全球采购订单和供应商关系'
                    : '管理国际销售订单和客户关系'}
                </p>
              </div>
              <Badge
                variant={activeRole === 'importer' ? 'default' : 'secondary'}
              >
                {activeRole === 'importer' ? '进口商视角' : '出口商视角'}
              </Badge>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => router.push('/foreign-trade/company/orders')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">总订单数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => router.push('/foreign-trade/company/orders')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activeRole === 'importer' ? '采购订单' : '销售订单'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {activeRole === 'importer'
                         ? stats.importOrders
                        : stats.exportOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {activeRole === 'importer' ? (
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Building className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => router.push('/foreign-trade/company/analytics')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">交易总额</p>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{(stats.totalAmount / 10000).toFixed(0)}万元
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => router.push('/foreign-trade/company/approvals')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">待处理事项</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容区域 */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">订单管理</TabsTrigger>
              <TabsTrigger value="partners">合作伙伴</TabsTrigger>
              <TabsTrigger value="analytics">业务分析</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {activeRole === 'importer'
                         ? '采购订单跟踪'
                        : '销售订单管理'}
                    </CardTitle>
                    <Button
                      onClick={() =>
                        router.push('/foreign-trade/company/orders/create')
                      }
                    >
                      {activeRole === 'importer' ? '创建采购订单' : '创建销售订单'}
                    </Button>
                  </div>
                  <CardDescription>
                    {activeRole === 'importer'
                       ? '跟踪全球采购订单状态和供应商交付情况'
                      : '管理国际销售订单和客户交付进度'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.debug('点击订单:', order.id);
                          router.push(
                            `/foreign-trade/company/order/${order.id}`
                          );
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(
                              `/foreign-trade/company/order/${order.id}`
                            );
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`查看订单 ${order.id} 详情`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-900">
                                {order.id}
                              </span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={getTypeColor(order.type)}
                              >
                                {getTypeIcon(order.type)}
                                {order.type === 'import' ? '进口' : '出口'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.partner} - {order.product}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-500">
                                数量: {order.quantity}
                              </span>
                              <span className="text-sm text-gray-500">
                                金额: ¥{order.amount.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                来源: {order.country}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">预计交付</p>
                            <p className="font-medium">
                              {new Date(
                                order.expectedDelivery
                              ).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    合作伙伴管理
                  </CardTitle>
                  <CardDescription>
                    管理您的国际贸易合作伙伴关系
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Samsung Electronics',
                        country: '韩国',
                        type: '供应商',
                        status: 'active',
                      },
                      {
                        name: 'Apple Inc.',
                        country: '美国',
                        type: '供应商',
                        status: 'active',
                      },
                      {
                        name: 'TechGlobal Ltd.',
                        country: '美国',
                        type: '客户',
                        status: 'active',
                      },
                      {
                        name: 'Sony Corporation',
                        country: '日本',
                        type: '供应商',
                        status: 'pending',
                      },
                    ].map((partner, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {partner.name}
                          </h3>
                          <Badge
                            variant={
                              partner.status === 'active' ? 'default' : 'secondary'
                            }
                          >
                            {partner.status === 'active' ? '活跃' : '待审核'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {partner.country}
                        </p>
                        <Badge variant="outline">{partner.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    业务数据分析
                  </CardTitle>
                  <CardDescription>
                    查看您的贸易业务关键指标和趋势分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">
                        ¥{(stats.totalAmount / 10000).toFixed(0)}万元
                      </p>
                      <p className="text-sm text-gray-600">总交易额</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {stats.totalOrders - stats.pendingApprovals}
                      </p>
                      <p className="text-sm text-gray-600">已完成订单</p>
                    </div>
                    <div className="text-center p-6 bg-yellow-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.pendingApprovals}
                      </p>
                      <p className="text-sm text-gray-600">待处理订单</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
