'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Ship,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  carrier: string;
  transportMode: 'sea' | 'air' | 'land' | 'rail';
  origin: string;
  destination: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'in_transit'
    | 'customs'
    | 'delivered'
    | 'delayed';
  plannedDeparture: string;
  actualDeparture: string;
  estimatedArrival: string;
  actualArrival: string;
  weight: number;
  volume: number;
  packages: number;
  trackingNumber: string;
  containerNumber?: string;
  vesselName?: string;
  flightNumber?: string;
  driverInfo?: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');

  // 模拟数据
  useEffect(() => {
    const loadShipments = () => {
      setLoading(true);

      setTimeout(() => {
        const mockShipments: Shipment[] = [
          {
            id: '1',
            shipmentNumber: 'SHP20260226001',
            orderId: 'PO-2026-001',
            carrier: 'DHL International',
            transportMode: 'air',
            origin: '首尔, 韩国',
            destination: '上海, 中国',
            status: 'in_transit',
            plannedDeparture: '2026-02-25 08:00',
            actualDeparture: '2026-02-25 08:15',
            estimatedArrival: '2026-02-26 18:00',
            actualArrival: '',
            weight: 1250,
            volume: 8.5,
            packages: 50,
            trackingNumber: 'DHL123456789CN',
            flightNumber: 'KE1234',
          },
          {
            id: '2',
            shipmentNumber: 'SHP20260226002',
            orderId: 'SO-2026-001',
            carrier: 'FedEx International',
            transportMode: 'sea',
            origin: '深圳, 中国',
            destination: '洛杉? 美国',
            status: 'confirmed',
            plannedDeparture: '2026-02-28 14:00',
            actualDeparture: '',
            estimatedArrival: '2026-03-20 09:00',
            actualArrival: '',
            weight: 8500,
            volume: 45.2,
            packages: 200,
            trackingNumber: 'FXE987654321US',
            containerNumber: 'COSU1234567',
            vesselName: 'MSC Europa',
          },
          {
            id: '3',
            shipmentNumber: 'SHP20260226003',
            orderId: 'PO-2026-002',
            carrier: 'UPS Global',
            transportMode: 'land',
            origin: '东京, 日本',
            destination: '北京, 中国',
            status: 'pending',
            plannedDeparture: '2026-03-01 10:00',
            actualDeparture: '',
            estimatedArrival: '2026-03-03 16:00',
            actualArrival: '',
            weight: 680,
            volume: 4.2,
            packages: 25,
            trackingNumber: 'UPS456789123CN',
            driverInfo: '张师?- 138****1234',
          },
          {
            id: '4',
            shipmentNumber: 'SHP20260226004',
            orderId: 'SO-2026-002',
            carrier: 'Maersk Line',
            transportMode: 'sea',
            origin: '青岛, 中国',
            destination: '汉堡, 德国',
            status: 'customs',
            plannedDeparture: '2026-02-20 07:00',
            actualDeparture: '2026-02-20 07:30',
            estimatedArrival: '2026-03-15 12:00',
            actualArrival: '',
            weight: 15200,
            volume: 85.6,
            packages: 450,
            trackingNumber: 'MSK789456123DE',
            containerNumber: 'MAEU2345678',
            vesselName: 'Maersk Edinburgh',
          },
          {
            id: '5',
            shipmentNumber: 'SHP20260226005',
            orderId: 'PO-2026-003',
            carrier: 'China Post',
            transportMode: 'air',
            origin: '大阪, 日本',
            destination: '广州, 中国',
            status: 'delivered',
            plannedDeparture: '2026-02-22 16:00',
            actualDeparture: '2026-02-22 16:10',
            estimatedArrival: '2026-02-23 08:00',
            actualArrival: '2026-02-23 07:45',
            weight: 320,
            volume: 1.8,
            packages: 12,
            trackingNumber: 'CP888888888CN',
            flightNumber: 'NH961',
          },
        ];

        setShipments(mockShipments);
        setLoading(false);
      }, 800);
    };

    loadShipments();
  }, []);

  // 筛选逻辑
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch =
      shipment.shipmentNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    const matchesTransport =
      transportFilter === 'all' || shipment.transportMode === transportFilter;
    const matchesCarrier =
      carrierFilter === 'all' || shipment.carrier === carrierFilter;

    return matchesSearch && matchesStatus && matchesTransport && matchesCarrier;
  });

  // 状态颜色映?  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      customs: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: '待发?,
      confirmed: '已确?,
      in_transit: '运输?,
      customs: '清关?,
      delivered: '已送达',
      delayed: '延误',
    };
    return textMap[status] || status;
  };

  const getTransportIcon = (mode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      sea: <Anchor className="h-4 w-4" />,
      air: <Plane className="h-4 w-4" />,
      land: <Truck className="h-4 w-4" />,
      rail: <Truck className="h-4 w-4" />,
    };
    return iconMap[mode] || <Package className="h-4 w-4" />;
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

  const handleViewShipment = (shipmentId: string) => {
    // TODO: 实现查看详情功能
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查看发货详情:', shipmentId)};

  const handleCreateShipment = () => {
    // TODO: 实现创建发货单功?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('创建发货?)};

  const handleExport = () => {
    // TODO: 实现导出功能
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('导出发货数据')};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载发货数据?..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">发货管理</h1>
          <p className="mt-2 text-gray-600">
            管理货物发货、运输安排和承运商协?          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button onClick={handleCreateShipment}>
            <Plus className="h-4 w-4 mr-2" />
            创建发货?          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总发货数</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">当前发货批次</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运输?/CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {shipments.filter(s => s.status === 'in_transit').length}
            </div>
            <p className="text-xs text-muted-foreground">正在运输的货?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待发?/CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {shipments.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">等待发货安排</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">清关?/CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {shipments.filter(s => s.status === 'customs').length}
            </div>
            <p className="text-xs text-muted-foreground">海关清关处理</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日发货</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                shipments.filter(
                  s =>
                    s.actualDeparture &&
                    new Date(s.actualDeparture).toDateString() ===
                      new Date().toDateString()
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">今天已发货批?/p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条?          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索发货单号、订单号或追踪号..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="发货状? />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状?/SelectItem>
                <SelectItem value="pending">待发?/SelectItem>
                <SelectItem value="confirmed">已确?/SelectItem>
                <SelectItem value="in_transit">运输?/SelectItem>
                <SelectItem value="customs">清关?/SelectItem>
                <SelectItem value="delivered">已送达</SelectItem>
                <SelectItem value="delayed">延误</SelectItem>
              </SelectContent>
            </Select>

            <Select value={transportFilter} onValueChange={setTransportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="运输方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部方式</SelectItem>
                <SelectItem value="sea">海运</SelectItem>
                <SelectItem value="air">空运</SelectItem>
                <SelectItem value="land">陆运</SelectItem>
                <SelectItem value="rail">铁路运输</SelectItem>
              </SelectContent>
            </Select>

            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="承运? />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部承运?/SelectItem>
                {[...new Set(shipments.map(s => s.carrier))].map(carrier => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 发货列表 */}
      <Card>
        <CardHeader>
          <CardTitle>发货列表</CardTitle>
          <CardDescription>
            共找?{filteredShipments.length} 个符合条件的发货记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>发货信息</TableHead>
                  <TableHead>路线信息</TableHead>
                  <TableHead>运输详情</TableHead>
                  <TableHead>货物信息</TableHead>
                  <TableHead>时间安排</TableHead>
                  <TableHead>状?/TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Ship className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        暂无发货数据
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ||
                        statusFilter !== 'all' ||
                        transportFilter !== 'all' ||
                        carrierFilter !== 'all'
                          ? '没有找到匹配的发货记?
                          : '开始创建第一条发货记录吧'}
                      </p>
                      {!searchTerm &&
                        statusFilter === 'all' &&
                        transportFilter === 'all' &&
                        carrierFilter === 'all' && (
                          <div className="mt-6">
                            <Button onClick={handleCreateShipment}>
                              <Plus className="h-4 w-4 mr-2" />
                              创建发货?                            </Button>
                          </div>
                        )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map(shipment => (
                    <TableRow key={shipment.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">
                            {shipment.shipmentNumber}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            关联订单: {shipment.orderId}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Package className="h-3 w-3" />
                            追踪? {shipment.trackingNumber}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-red-500" />
                            <span>{shipment.origin}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <MapPin className="h-3 w-3 text-green-500" />
                            <span>{shipment.destination}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {shipment.carrier}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            {getTransportIcon(shipment.transportMode)}
                            {getTransportText(shipment.transportMode)}
                          </Badge>
                          {shipment.containerNumber && (
                            <div className="text-xs text-gray-600">
                              集装? {shipment.containerNumber}
                            </div>
                          )}
                          {shipment.vesselName && (
                            <div className="text-xs text-gray-600">
                              船名: {shipment.vesselName}
                            </div>
                          )}
                          {shipment.flightNumber && (
                            <div className="text-xs text-gray-600">
                              航班: {shipment.flightNumber}
                            </div>
                          )}
                          {shipment.driverInfo && (
                            <div className="text-xs text-gray-600">
                              司机: {shipment.driverInfo}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <div>重量: {shipment.weight} kg</div>
                          <div>体积: {shipment.volume} m³</div>
                          <div>件数: {shipment.packages} �?/div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>计划出发: {shipment.plannedDeparture}</span>
                          </div>
                          {shipment.actualDeparture && (
                            <div className="flex items-center gap-1 text-green-600 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>实际出发: {shipment.actualDeparture}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>预计到达: {shipment.estimatedArrival}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusText(shipment.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewShipment(shipment.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

