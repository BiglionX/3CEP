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
import {
  Ship,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ProcurementOrder {
  id: string;
  supplier: string;
  product: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  expectedDelivery: string;
}

export default function ImporterDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);

  useEffect(() => {
    // 模拟加载采购订单数据
    const mockOrders: ProcurementOrder[] = [
      {
        id: 'PO-2026-001',
        supplier: 'Samsung Electronics',
        product: 'Galaxy S24 Ultra 手机',
        quantity: 500,
        status: 'confirmed',
        amount: 3500000,
        expectedDelivery: '2026-03-15',
      },
      {
        id: 'PO-2026-002',
        supplier: 'Apple Inc.',
        product: 'iPhone 15 Pro Max',
        quantity: 300,
        status: 'shipped',
        amount: 2850000,
        expectedDelivery: '2026-03-10',
      },
      {
        id: 'PO-2026-003',
        supplier: 'Dell Technologies',
        product: 'XPS 13 笔记本电?,
        quantity: 200,
        status: 'pending',
        amount: 1200000,
        expectedDelivery: '2026-03-20',
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ProcurementOrder['status']) => {
    switch (status) {
      case 'delivered':
        return '已交?;
      case 'shipped':
        return '已发?;
      case 'confirmed':
        return '已确?;
      case 'pending':
        return '待确?;
      case 'cancelled':
        return '已取?;
      default:
        return status;
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
                <Ship className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  进口商工作台
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            欢迎回来，采购经理！
          </h1>
          <p className="text-gray-600">
            今天?{new Date().toLocaleDateString('zh-CN')}
            ，全球采购业务运行正?          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本月采购?/p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥12,500,000
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+15% 同比增长</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">在途订?/p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">合作供应?/p>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待处理询?/p>
                  <p className="text-2xl font-bold text-yellow-600">8</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Globe className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 采购订单列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    采购订单跟踪
                  </CardTitle>
                  <Button onClick={() => router.push('/importer/procurement')}>
                    查看全部
                  </Button>
                </div>
                <CardDescription>跟踪全球采购订单状?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/importer/procurement/${order.id}`)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {order.id}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.supplier} - {order.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            数量: {order.quantity} | 金额: ¥
                            {order.amount.toLocaleString()}
                          </p>
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
          </div>

          {/* 快捷操作和提?*/}
          <div className="space-y-6">
            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  快捷操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/importer/procurement/new')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  创建采购订单
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/importer/suppliers')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  供应商管?                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/importer/logistics')}
                >
                  <Ship className="h-4 w-4 mr-2" />
                  物流跟踪
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/importer/customs')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  报关清关
                </Button>
              </CardContent>
            </Card>

            {/* 今日提醒 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  今日提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        PO-2026-002 预计今日到达上海?                      </p>
                      <p className="text-xs text-gray-500">
                        请及时安排清关手?                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Samsung 供应商询价回复截?                      </p>
                      <p className="text-xs text-gray-500">
                        请在今日17:00前确?                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        新供应商 Apple 认证审核通过
                      </p>
                      <p className="text-xs text-gray-500">
                        可正式开展业务合?                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 市场动?*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  市场动?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">芯片价格稳定</p>
                      <p className="text-xs text-gray-500">Q1供应充足</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">汇率波动提醒</p>
                      <p className="text-xs text-gray-500">
                        美元兑人民币上涨0.3%
                      </p>
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
