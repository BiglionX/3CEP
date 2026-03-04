'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  User,
  Phone,
  Mail,
  Navigation,
  Anchor,
  Plane,
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
  shipmentNumber: string;
  orderId: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'in_transit'
    | 'customs'
    | 'delivered'
    | 'delayed';
  carrier: string;
  transportMode: 'sea' | 'air' | 'land' | 'rail';
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation: string;
  lastUpdate: string;
  timeline: TimelineEvent[];
  shipmentInfo: {
    weight: number;
    volume: number;
    packages: number;
    containerNumber?: string;
    vesselName?: string;
    flightNumber?: string;
  };
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  isCompleted: boolean;
  coordinates?: { lat: number; lng: number };
}

export default function LogisticsTrackingPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // 模拟跟踪数据
  const mockTrackingData: Record<string, TrackingInfo> = {
    DHL123456789CN: {
      trackingNumber: 'DHL123456789CN',
      shipmentNumber: 'SHP20260226001',
      orderId: 'PO-2026-001',
      status: 'in_transit',
      carrier: 'DHL International',
      transportMode: 'air',
      origin: '首尔, 韩国',
      destination: '上海, 中国',
      estimatedDelivery: '2026-02-26 18:00',
      currentLocation: '上海浦东国际机场',
      lastUpdate: '2026-02-26 14:30',
      shipmentInfo: {
        weight: 1250,
        volume: 8.5,
        packages: 50,
        flightNumber: 'KE1234',
      },
      timeline: [
        {
          id: '1',
          timestamp: '2026-02-25 08:00',
          status: '订单确认',
          location: '首尔, 韩国',
          description: '发货订单已确?,
          isCompleted: true,
        },
        {
          id: '2',
          timestamp: '2026-02-25 08:15',
          status: '货物揽收',
          location: '首尔中央仓库',
          description: 'DHL已揽收货?,
          isCompleted: true,
        },
        {
          id: '3',
          timestamp: '2026-02-25 12:30',
          status: '离港',
          location: '仁川国际机场',
          description: '货物已离港，航班KE1234',
          isCompleted: true,
        },
        {
          id: '4',
          timestamp: '2026-02-26 09:45',
          status: '抵达',
          location: '上海浦东国际机场',
          description: '货物已抵达目的地机场',
          isCompleted: true,
        },
        {
          id: '5',
          timestamp: '2026-02-26 14:30',
          status: '清关?,
          location: '上海海关',
          description: '货物正在海关清关处理',
          isCompleted: true,
        },
        {
          id: '6',
          timestamp: '预计 2026-02-26 18:00',
          status: '预计送达',
          location: '上海配送中?,
          description: '预计今日18:00前送达',
          isCompleted: false,
        },
      ],
    },
    FXE987654321US: {
      trackingNumber: 'FXE987654321US',
      shipmentNumber: 'SHP20260226002',
      orderId: 'SO-2026-001',
      status: 'in_transit',
      carrier: 'FedEx International',
      transportMode: 'sea',
      origin: '深圳, 中国',
      destination: '洛杉? 美国',
      estimatedDelivery: '2026-03-20 09:00',
      currentLocation: '太平洋海?,
      lastUpdate: '2026-02-26 10:15',
      shipmentInfo: {
        weight: 8500,
        volume: 45.2,
        packages: 200,
        containerNumber: 'COSU1234567',
        vesselName: 'MSC Europa',
      },
      timeline: [
        {
          id: '1',
          timestamp: '2026-02-24 14:00',
          status: '订单确认',
          location: '深圳, 中国',
          description: '出口订单已确?,
          isCompleted: true,
        },
        {
          id: '2',
          timestamp: '2026-02-24 16:30',
          status: '货物入库',
          location: '深圳盐田?,
          description: '货物已入库等待装?,
          isCompleted: true,
        },
        {
          id: '3',
          timestamp: '2026-02-25 09:00',
          status: '装船完成',
          location: '深圳盐田?,
          description: '货物已装载至MSC Europa轮船',
          isCompleted: true,
        },
        {
          id: '4',
          timestamp: '2026-02-25 18:00',
          status: '离港',
          location: '深圳盐田?,
          description: '轮船已离港前往洛杉?,
          isCompleted: true,
        },
        {
          id: '5',
          timestamp: '2026-02-26 10:15',
          status: '航行?,
          location: '太平洋海?,
          description: '货物正在海上运输途中',
          isCompleted: true,
        },
        {
          id: '6',
          timestamp: '预计 2026-03-20',
          status: '预计抵达',
          location: '洛杉矶港',
          description: '预计3�?0日抵达洛杉矶?,
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
        text: '待处?,
        color: 'bg-gray-100 text-gray-800',
        icon: <Clock className="h-4 w-4" />,
      },
      confirmed: {
        text: '已确?,
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      in_transit: {
        text: '运输?,
        color: 'bg-purple-100 text-purple-800',
        icon: <Truck className="h-4 w-4" />,
      },
      customs: {
        text: '清关?,
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

  const getTransportIcon = (mode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      sea: <Anchor className="h-5 w-5" />,
      air: <Plane className="h-5 w-5" />,
      land: <Truck className="h-5 w-5" />,
      rail: <Truck className="h-5 w-5" />,
    };
    return iconMap[mode] || <Package className="h-5 w-5" />;
  };

  const getTransportText = (mode: string) => {
    const textMap: Record<string, string> = {
      sea: '海运',
      air: '空运',
      land: '陆运',
      rail: '铁路',
    };
    return textMap[mode] || mode;
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
        <h1 className="text-3xl font-bold text-gray-900">物流跟踪</h1>
        <p className="mt-2 text-gray-600">实时跟踪货物运输状态和位置信息</p>
      </div>

      {/* 搜索区域 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            查询物流信息
          </CardTitle>
          <CardDescription>输入追踪号码查询货物实时位置和状?/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="请输入追踪号?(例如: DHL123456789CN)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
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
                  查询?..
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  查询
                </>
              )}
            </Button>
          </div>

          {/* 示例追踪?*/}
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">示例追踪?</p>
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
                <p className="text-gray-600">正在查询物流信息...</p>
              </div>
            </div>
          ) : trackingInfo ? (
            <div className="space-y-6">
              {/* 运输基本信息 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {getTransportIcon(trackingInfo.transportMode)}
                      <span>运输详情</span>
                    </CardTitle>
                    <Badge className={getStatusInfo(trackingInfo.status).color}>
                      <span className="mr-1">
                        {getStatusInfo(trackingInfo.status).icon}
                      </span>
                      {getStatusInfo(trackingInfo.status).text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        追踪号码
                      </h3>
                      <p className="text-lg font-mono text-gray-900">
                        {trackingInfo.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        发货单号
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.shipmentNumber}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        承运?                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.carrier}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        运输方式
                      </h3>
                      <p className="text-lg text-gray-900">
                        {getTransportText(trackingInfo.transportMode)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500">起运?/p>
                        <p className="font-medium">{trackingInfo.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">当前位置</p>
                        <p className="font-medium">
                          {trackingInfo.currentLocation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">目的?/p>
                        <p className="font-medium">
                          {trackingInfo.destination}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 货物信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>货物详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        重量
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.shipmentInfo.weight} kg
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        体积
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.shipmentInfo.volume} m³
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        件数
                      </h3>
                      <p className="text-lg text-gray-900">
                        {trackingInfo.shipmentInfo.packages} �?                      </p>
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

                  {(trackingInfo.shipmentInfo.containerNumber ||
                    trackingInfo.shipmentInfo.vesselName ||
                    trackingInfo.shipmentInfo.flightNumber) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                      {trackingInfo.shipmentInfo.containerNumber && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            集装箱号
                          </h3>
                          <p className="text-gray-900 font-mono">
                            {trackingInfo.shipmentInfo.containerNumber}
                          </p>
                        </div>
                      )}
                      {trackingInfo.shipmentInfo.vesselName && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            船名/航班
                          </h3>
                          <p className="text-gray-900">
                            {trackingInfo.shipmentInfo.vesselName}
                          </p>
                        </div>
                      )}
                      {trackingInfo.shipmentInfo.flightNumber && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            航班?                          </h3>
                          <p className="text-gray-900 font-mono">
                            {trackingInfo.shipmentInfo.flightNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 物流时间?*/}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>物流时间?/CardTitle>
                      <CardDescription>
                        货物运输的详细记录和状态更?                      </CardDescription>
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
                        <SelectItem value="completed">已完?/SelectItem>
                        <SelectItem value="pending">待完?/SelectItem>
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
                    未找到物流信?                  </h3>
                  <p className="mt-1 text-gray-500">
                    请检查追踪号码是否正确，或联系客服获取帮?                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🔍 如何查询</h3>
                <p className="text-sm text-gray-600">
                  在上方输入框中输入承运商提供的追踪号码，点击查询按钮即可获取详细的物流跟踪信息?                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📋 跟踪内容</h3>
                <p className="text-sm text-gray-600">
                  系统将显示货物当前位置、运输状态、预计送达时间以及完整的物流时间线?                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">📱 实时更新</h3>
                <p className="text-sm text-gray-600">
                  物流信息会根据承运商系统实时更新，建议定期查询最新状态?                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

