'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';
import {
  ArrowLeft,
  Globe,
  Ship,
  DollarSign,
  Package,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

interface OrderDetail {
  id: string;
  type: 'import' | 'export';
  partner: {
    name: string;
    country: string;
    contact: string;
    email: string;
    phone: string;
  };
  product: {
    name: string;
    sku: string;
    category: string;
    specifications: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  timeline: TimelineEvent[];
  documents: Document[];
  logistics: LogisticsInfo;
  payment: PaymentInfo;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  actor: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface LogisticsInfo {
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation: string;
  status: string;
}

interface PaymentInfo {
  method: string;
  status: 'pending' | 'partial' | 'paid' | 'refunded';
  amount: number;
  currency: string;
  dueDate: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'importer' | 'exporter'>(
    'importer'
  );

  const handleRoleChange = (role: 'importer' | 'exporter') => {
    setActiveRole(role);
  };

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = () => {
    // 模拟加载订单详情
    const mockOrder: OrderDetail = {
      id: orderId,
      type: orderId.startsWith('PO') ? 'import' : 'export',
      partner: {
        name: orderId.startsWith('PO')
          ? 'Samsung Electronics'
          : 'TechGlobal Ltd.',
        country: orderId.startsWith('PO') ? '韩国' : '美国',
        contact: '张经理',
        email: 'zhang@samsung.com',
        phone: '+82-2-1234-5678',
      },
      product: {
        name: orderId.startsWith('PO')
          ? 'Galaxy S24 Ultra 手机'
          : '华为Mate 60 Pro',
        sku: orderId.startsWith('PO') ? 'SM-S9280' : 'HUAWEI-MATE60-PRO',
        category: '智能手机',
        specifications: '12GB RAM + 256GB Storage, Phantom Black',
      },
      quantity: 500,
      unitPrice: 7000,
      totalPrice: 3500000,
      status: 'confirmed',
      timeline: [
        {
          id: '1',
          timestamp: '2026-02-20T09:15:00',
          status: '订单创建',
          description: '采购订单已创建并提交审批',
          actor: '采购经理',
        },
        {
          id: '2',
          timestamp: '2026-02-20T14:30:00',
          status: '审批通过',
          description: '部门经理审批通过',
          actor: '部门经理',
        },
        {
          id: '3',
          timestamp: '2026-02-21T10:00:00',
          status: '供应商确认',
          description: '供应商确认订单并安排生产',
          actor: '供应商',
        },
        {
          id: '4',
          timestamp: '2026-02-25T16:45:00',
          status: '生产中',
          description: '产品正在生产线制造',
          actor: '生产部门',
        },
      ],
      documents: [
        {
          id: '1',
          name: '采购合同.pdf',
          type: 'contract',
          url: '#',
          uploadedAt: '2026-02-20T09:15:00',
        },
        {
          id: '2',
          name: '技术规格书.docx',
          type: 'specification',
          url: '#',
          uploadedAt: '2026-02-20T09:15:00',
        },
      ],
      logistics: {
        trackingNumber: 'SGL20260220001',
        carrier: '顺丰国际',
        origin: orderId.startsWith('PO') ? '韩国仁川' : '中国深圳',
        destination: orderId.startsWith('PO') ? '中国上海' : '美国洛杉矶',
        estimatedDelivery: '2026-03-15',
        currentLocation: '正在运输途中',
        status: 'in_transit',
      },
      payment: {
        method: '信用证',
        status: 'partial',
        amount: 3500000,
        currency: 'CNY',
        dueDate: '2026-03-10',
      },
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载订单详情...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            订单未找到
          </h2>
          <p className="text-gray-600 mb-4">无法找到指定的订单信息</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLogisticsStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      pending: '待发货',
      in_transit: '运输中',
      customs: '海关清关',
      delivered: '已送达',
    };
    return statusText[status] || status;
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
                <Button
                  variant="ghost"
                  onClick={() => router.push('/foreign-trade/company')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div className="ml-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      {order.id}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {order.type === 'import'
                        ? '进口采购订单'
                        : '出口销售订单'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(order.status)}>
                  {order.status === 'pending'
                    ? '待确认'
                    : order.status === 'confirmed'
                      ? '已确认'
                      : order.status === 'processing'
                        ? '处理中'
                        : order.status === 'shipped'
                          ? '已发货'
                          : '已完成'}
                </Badge>
                <Button>操作</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 订单基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    订单信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      产品名称
                    </h3>
                    <p className="text-gray-900">{order.product.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      产品编码
                    </h3>
                    <p className="text-gray-900">{order.product.sku}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      数量
                    </h3>
                    <p className="text-gray-900">{order.quantity} 台</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      单价
                    </h3>
                    <p className="text-gray-900">
                      ¥{order.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      总金额
                    </h3>
                    <p className="text-xl font-bold text-green-600">
                      ¥{order.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      分类
                    </h3>
                    <p className="text-gray-900">{order.product.category}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 合作伙伴信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {order.type === 'import' ? '供应商信息' : '客户信息'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      公司名称
                    </h3>
                    <p className="text-gray-900">{order.partner.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      所在国家
                    </h3>
                    <p className="text-gray-900">{order.partner.country}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      联系人
                    </h3>
                    <p className="text-gray-900">{order.partner.contact}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      联系电话
                    </h3>
                    <p className="text-gray-900">{order.partner.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      邮箱
                    </h3>
                    <p className="text-gray-900">{order.partner.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 物流信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    物流信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      承运商
                    </h3>
                    <p className="text-gray-900">{order.logistics.carrier}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      追踪号码
                    </h3>
                    <p className="text-gray-900 font-mono">
                      {order.logistics.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      起运地
                    </h3>
                    <p className="text-gray-900">{order.logistics.origin}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      目的地
                    </h3>
                    <p className="text-gray-900">
                      {order.logistics.destination}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      当前状态
                    </h3>
                    <Badge className={getStatusColor(order.logistics.status)}>
                      {getLogisticsStatusText(order.logistics.status)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      当前位置
                    </h3>
                    <p className="text-gray-900">
                      {order.logistics.currentLocation}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      预计送达
                    </h3>
                    <p className="text-gray-900">
                      {new Date(
                        order.logistics.estimatedDelivery
                      ).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 时间线 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    订单时间线
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={event.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          {index < order.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {event.status}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            操作人: {event.actor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧侧边栏 */}
            <div className="space-y-6">
              {/* 支付信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    支付信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      支付方式
                    </h3>
                    <p className="text-gray-900">{order.payment.method}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      支付状态
                    </h3>
                    <Badge className={getStatusColor(order.payment.status)}>
                      {order.payment.status === 'pending'
                        ? '待支付'
                        : order.payment.status === 'partial'
                          ? '部分支付'
                          : order.payment.status === 'paid'
                            ? '已支付'
                            : '已退款'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      应付金额
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      ¥{order.payment.amount.toLocaleString()}{' '}
                      {order.payment.currency}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      截止日期
                    </h3>
                    <p className="text-gray-900">
                      {new Date(order.payment.dueDate).toLocaleDateString(
                        'zh-CN'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 文档管理 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    相关文档
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              'zh-CN'
                            )}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    上传新文档
                  </Button>
                </CardContent>
              </Card>

              {/* 快捷操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快捷操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    确认收货
                  </Button>
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    申请退款
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    联系对方
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    发送消息
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
