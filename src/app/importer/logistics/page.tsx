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
  Ship,
  Search,
  MapPin,
  Clock,
  Package,
  Truck,
  Anchor,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'customs' | 'delivered' | 'delayed';
  currentLocation: string;
  estimatedArrival: string;
  actualArrival: string;
  events: ShipmentEvent[];
  containerNumber: string;
  vesselName: string;
}

interface ShipmentEvent {
  id: string;
  timestamp: string;
  location: string;
  description: string;
  status: string;
}

export default function LogisticsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );

  useEffect(() => {
    // 模拟加载物流数据
    const mockShipments: Shipment[] = [
      {
        id: 'SH-2026-001',
        orderId: 'PO-2026-001',
        carrier: '马士基航运',
        trackingNumber: 'MSKU123456789',
        origin: '韩国釜山港',
        destination: '中国上海港',
        status: 'in_transit',
        currentLocation: '东海海域',
        estimatedArrival: '2026-03-15T08:00:00',
        containerNumber: 'MSKU1234567',
        vesselName: 'MSC Gülsün',
        events: [
          {
            id: 'evt-001',
            timestamp: '2026-02-20T10:00:00',
            location: '韩国釜山港',
            description: '货物装船完毕',
            status: '已装船',
          },
          {
            id: 'evt-002',
            timestamp: '2026-02-21T14:30:00',
            location: '东海海域',
            description: '船舶离港，航程开始',
            status: '航行中',
          },
        ],
      },
      {
        id: 'SH-2026-002',
        orderId: 'SO-2026-001',
        carrier: '联邦快递',
        trackingNumber: 'FX123456789US',
        origin: '中国深圳',
        destination: '美国洛杉矶',
        status: 'customs',
        currentLocation: '美国海关',
        estimatedArrival: '2026-03-10T16:00:00',
        actualArrival: '2026-03-09T14:30:00',
        events: [
          {
            id: 'evt-003',
            timestamp: '2026-02-15T09:00:00',
            location: '中国深圳机场',
            description: '包裹已收寄',
            status: '已收寄',
          },
          {
            id: 'evt-004',
            timestamp: '2026-02-16T03:45:00',
            location: '美国海关',
            description: '包裹正在清关',
            status: '清关中',
          },
        ],
      },
      {
        id: 'SH-2026-003',
        orderId: 'PO-2026-003',
        carrier: '中远海运',
        trackingNumber: 'COSU987654321',
        origin: '新加坡港',
        destination: '中国宁波港',
        status: 'delivered',
        currentLocation: '中国宁波港',
        estimatedArrival: '2026-03-05T12:00:00',
        actualArrival: '2026-03-04T16:30:00',
        containerNumber: 'COSU9876543',
        vesselName: 'COSCO Shipping Universe',
        events: [
          {
            id: 'evt-005',
            timestamp: '2026-02-15T08:00:00',
            location: '新加坡港',
            description: '集装箱装载完毕',
            status: '已装船',
          },
          {
            id: 'evt-006',
            timestamp: '2026-03-04T16:30:00',
            location: '中国宁波港',
            description: '货物已送达目的地港口',
            status: '已送达',
          },
        ],
      },
    ];
    setShipments(mockShipments);
  }, []);

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'customs':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_transit':
        return <Ship className="h-4 w-4 text-blue-500" />;
      case 'customs':
        return <Anchor className="h-4 w-4 text-purple-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredShipments = shipments.filter(
    shipment =>
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrackShipment = (trackingNumber: string) => {
    const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
    if (shipment) {
      setSelectedShipment(shipment);
    }
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
              <h1 className="text-xl font-semibold text-gray-900">物流跟踪</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              物流查询
            </CardTitle>
            <CardDescription>输入运单号或订单号查询物流状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="输入运单号、订单号或承运商..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={() => handleTrackShipment(searchTerm)}>
                <Search className="h-4 w-4 mr-2" />
                查询
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {shipments.length}
              </div>
              <div className="text-sm text-gray-600">总运单数</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {shipments.filter(s => s.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">已送达</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {shipments.filter(s => s.status === 'in_transit').length}
              </div>
              <div className="text-sm text-gray-600">运输中</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {shipments.filter(s => s.status === 'customs').length}
              </div>
              <div className="text-sm text-gray-600">清关中</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {shipments.filter(s => s.status === 'delayed').length}
              </div>
              <div className="text-sm text-gray-600">延误</div>
            </CardContent>
          </Card>
        </div>

        {/* 运单列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  运输列表
                </CardTitle>
                <CardDescription>当前所有运输订单状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredShipments.map(shipment => (
                    <div
                      key={shipment.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedShipment.id === shipment.id
                           'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {shipment.trackingNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            订单: {shipment.orderId}
                          </div>
                        </div>
                        <Badge className={getStatusColor(shipment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(shipment.status)}
                            <span>
                              {shipment.status === 'delivered'
                                 '已送达'
                                : shipment.status === 'in_transit'
                                   '运输中'
                                  : shipment.status === 'customs'
                                     '清关中'
                                    : shipment.status === 'pending'
                                       '待发货'
                                      : '延误'}
                            </span>
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          <span>{shipment.carrier}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{shipment.currentLocation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            预计:{' '}
                            {new Date(
                              shipment.estimatedArrival
                            ).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        {shipment.containerNumber && (
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{shipment.containerNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详细跟踪信息 */}
          <div>
            {selectedShipment  (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(selectedShipment.status)}
                    运输详情 - {selectedShipment.trackingNumber}
                  </CardTitle>
                  <CardDescription>实时物流跟踪信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        基本信息
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">承运商</span>
                          <div className="font-medium">
                            {selectedShipment.carrier}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">订单号</span>
                          <div className="font-medium">
                            {selectedShipment.orderId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">起运地</span>
                          <div className="font-medium">
                            {selectedShipment.origin}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">目的地</span>
                          <div className="font-medium">
                            {selectedShipment.destination}
                          </div>
                        </div>
                        {selectedShipment.vesselName && (
                          <div>
                            <span className="text-gray-500">船舶名称:</span>
                            <div className="font-medium">
                              {selectedShipment.vesselName}
                            </div>
                          </div>
                        )}
                        {selectedShipment.containerNumber && (
                          <div>
                            <span className="text-gray-500">集装箱号:</span>
                            <div className="font-medium">
                              {selectedShipment.containerNumber}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 时间信息 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        时间信息
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">预计到达:</span>
                          <span className="font-medium">
                            {new Date(
                              selectedShipment.estimatedArrival
                            ).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        {selectedShipment.actualArrival && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">实际到达:</span>
                            <span className="font-medium text-green-600">
                              {new Date(
                                selectedShipment.actualArrival
                              ).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 物流事件 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        物流轨迹
                      </h3>
                      <div className="space-y-4">
                        {selectedShipment.events.map((event, index) => (
                          <div key={event.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              ></div>
                              {index < selectedShipment.events.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="font-medium text-gray-900">
                                {event.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                {event.location} •{' '}
                                {new Date(event.timestamp).toLocaleString(
                                  'zh-CN'
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {event.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 mb-4" />
                    <p>请选择一个运单查看详细信息</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
