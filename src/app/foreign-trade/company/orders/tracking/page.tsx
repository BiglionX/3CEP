'use client';

import { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrackingInfo {
  trackingNumber: string;
  orderId: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'in_transit'
    | 'customs'
    | 'delivered'
    | 'delayed';
  carrier: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation: string;
  lastUpdate: string;
  timeline: TimelineEvent[];
  orderInfo: {
    partner: string;
    product: string;
    quantity: number;
    amount: number;
  };
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  isCompleted: boolean;
}

export default function OrderTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // 模拟跟踪数据
  const mockTrackingData: Record<string, any> = {
    TN20260226001: {
      trackingNumber: 'TN20260226001',
      orderId: 'PO-2026-001',
      status: 'in_transit',
      carrier: 'DHL International',
      origin: '首尔, 韩国',
      destination: '上海, 中国',
      estimatedDelivery: '2026-03-15',
      currentLocation: '东京转运中心',
      lastUpdate: '2026-02-26 14:30',
      orderInfo: {
        partner: 'Samsung Electronics (韩国)',
        product: 'Galaxy S24 Ultra 手机',
        quantity: 500,
        amount: 3500000,
      },
      timeline: [
        {
          id: '1',
          timestamp: '2026-02-25 09:00',
          status: '订单确认',
          location: '首尔, 韩国',
          description: '订单已确认，准备发货',
          isCompleted: true,
        },
        {
          id: '2',
          timestamp: '2026-02-25 15:30',
          status: '货物揽收',
          location: '首尔, 韩国',
          description: 'DHL已揽收货物',
          isCompleted: true,
        },
        {
          id: '3',
          timestamp: '2026-02-26 08:15',
          status: '离港',
          location: '仁川国际机场',
          description: '货物已离港，航班KE1234',
          isCompleted: true,
        },
        {
          id: '4',
          timestamp: '2026-02-26 14:30',
          status: '在途',
          location: '东京转运中心',
          description: '货物正在转运中心处理',
          isCompleted: true,
        },
        {
          id: '5',
          timestamp: '预计 2026-03-15',
          status: '预计送达',
          location: '上海, 中国',
          description: '预计3月15日送达目的地',
          isCompleted: false,
        },
      ],
    },
    TN20260226002: {
      trackingNumber: 'TN20260226002',
      orderId: 'SO-2026-001',
      status: 'shipped',
      carrier: 'FedEx International',
      origin: '深圳, 中国',
      destination: '洛杉矶, 美国',
      estimatedDelivery: '2026-03-25',
      currentLocation: '已发货',
      lastUpdate: '2026-02-26 10:15',
      orderInfo: {
        partner: 'TechGlobal Ltd. (美国)',
        product: '华为Mate 60 Pro',
        quantity: 1000,
        amount: 8500000,
      },
      timeline: [
        {
          id: '1',
          timestamp: '2026-02-23 11:00',
          status: '订单确认',
          location: '深圳, 中国',
          description: '出口订单已确认',
          isCompleted: true,
        },
        {
          id: '2',
          timestamp: '2026-02-24 14:20',
          status: '货物揽收',
          location: '深圳, 中国',
          description: 'FedEx已揽收货物',
          isCompleted: true,
        },
        {
          id: '3',
          timestamp: '2026-02-26 10:15',
          status: '已发货',
          location: '深圳, 中国',
          description: '货物已从深圳发出',
          isCompleted: true,
        },
        {
          id: '4',
          timestamp: '预计 2026-03-25',
          status: '预计送达',
          location: '洛杉矶, 美国',
          description: '预计3月25日送达',
          isCompleted: false,
        },
      ],
    },
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { text: string; color: string; icon: React.ReactNode }
    > = {
      pending: {
        text: '待处理',
        color: 'bg-gray-100 text-gray-800',
        icon: <Clock className="h-4 w-4" />,
      },
      confirmed: {
        text: '已确认',
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      processing: {
        text: '处理中',
        color: 'bg-purple-100 text-purple-800',
        icon: <Package className="h-4 w-4" />,
      },
      shipped: {
        text: '已发货',
        color: 'bg-indigo-100 text-indigo-800',
        icon: <Truck className="h-4 w-4" />,
      },
      in_transit: {
        text: '运输中',
        color: 'bg-blue-100 text-blue-800',
        icon: <Truck className="h-4 w-4" />,
      },
      customs: {
        text: '清关中',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Package className="h-4 w-4" />,
      },
      delivered: {
        text: '已送达',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      delayed: {
        text: '延误',
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
      },
    };
    return (
      statusMap[status] || {
        text: status,
        color: 'bg-gray-100 text-gray-800',
        icon: <Package className="h-4 w-4" />,
      }
    );
  };

  const handleSearch = () => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setSearchPerformed(true);

    // 模拟API调用
    setTimeout(() => {
      const result = mockTrackingData[trackingNumber.toUpperCase()];
      setTrackingInfo(result || null);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredTimeline =
    trackingInfo?.timeline.filter(event => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'completed'
        ? event.isCompleted
        : !event.isCompleted;
    }) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">订单跟踪</h1>
        <p className="mt-2 text-gray-600">
          输入跟踪号码查询订单物流状态和位置信息
        </p>
      </div>

      {/* 搜索区域 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            查询跟踪信息
          </CardTitle>
          <CardDescription>输入运单号或订单号进行查询</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="请输入跟踪号码(例如: TN20260226001)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-lg py-6"
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={loading || !trackingNumber.trim()}
              className="px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  查询中...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  查询
                </>
              )}
            </Button>
          </div>

          {/* 示例跟踪号码 */}
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">示例跟踪号码:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(mockTrackingData).map(key => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setTrackingNumber(key)}
                  className="font-mono"
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchPerformed && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在查询跟踪信息...</p>
              </div>
            </div>
          ) : trackingInfo ? (
            <div className="space-y-6">
              {/* 订单基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>订单信息</span>
                    <Badge className={getStatusInfo(trackingInfo.status).color}>
                      <span className="mr-1">
                        {getStatusInfo(trackingInfo.status).icon}
                      </span>
                      {getStatusInfo(trackingInfo.status).text}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 ? md :grid-cols-2 ? lg :grid-cols-4 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        跟踪号码
                      </h3>
                      <p className="text-lg font-mono text-gray-900">
                        {trackingInfo.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        订单号
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.orderId}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        承运商
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.carrier}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        预计送达
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.estimatedDelivery}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 ? md :grid-cols-3 gap-6 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">起运地</p>
                        <p className="font-medium">{trackingInfo.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">当前位置</p>
                        <p className="font-medium">
                          {trackingInfo.currentLocation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">目的地</p>
                        <p className="font-medium">
                          {trackingInfo.destination}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 商品信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>商品详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 ? md :grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        合作伙伴
                      </h3>
                      <p className="text-gray-900">
                        {trackingInfo.orderInfo.partner}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        商品
                      </h3>
                      <p className="text-gray-900">
                        {trackingInfo.orderInfo.product}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        数量/金额
                      </h3>
                      <p className="text-gray-900">
                        {trackingInfo.orderInfo.quantity} 台 / ¥
                        {(trackingInfo.orderInfo.amount / 10000).toFixed(1)}{' '}
                        万元
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 时间线 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>物流时间线</CardTitle>
                      <CardDescription>
                        订单处理和运输的详细记录
                      </CardDescription>
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="pending">待完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredTimeline.map((event, index) => (
                      <div key={event.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              event.isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {event.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                          {index < filteredTimeline.length - 1 && (
                            <div
                              className={`h-full w-0.5 ${
                                event.isCompleted
                                  ? 'bg-green-300'
                                  : 'bg-gray-200'
                              }`}
                            ></div>
                          )}
                        </div>

                        <div
                          className={`flex-1 pb-6 ${index === filteredTimeline.length - 1 ? '' : 'border-b border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3
                                className={`font-medium ${
                                  event.isCompleted
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                                }`}
                              >
                                {event.status}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {event.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              </div>
                            </div>

                            {!event.isCompleted && (
                              <Badge variant="secondary" className="self-start">
                                即将到达
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredTimeline.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        没有找到符合条件的时间线记录
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    未找到跟踪信息
                  </h3>
                  <p className="mt-1 text-gray-500">
                    请检查跟踪号码是否正确，或联系客服获取帮助
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setTrackingNumber('')}>
                      重新查询
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 帮助信息 */}
      {!searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 ? md :grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🔍 如何查询</h3>
                <p className="text-sm text-gray-600">
                  在上方输入框中输入运单号或订单号，点击查询按钮即可获取详细的物流跟踪信息。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📋 跟踪内容</h3>
                <p className="text-sm text-gray-600">
                  系统将显示订单状态、当前位置、预计送达时间以及完整的物流时间线。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📱 实时更新</h3>
                <p className="text-sm text-gray-600">
                  物流信息会实时更新，您可以随时查询最新的运输状态和位置信息。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
