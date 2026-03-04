'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ArrowRight,
  Battery,
  Calendar,
  CheckCircle,
  Clock,
  Factory,
  MapPin,
  QrCode,
  Recycle,
  Search,
  Smartphone,
  User,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';

interface DeviceRecord {
  id: string;
  qrcodeId: string;
  productModel: string;
  brandName: string;
  currentStatus: string;
  lastEventAt?: string;
  lastEventType?: string;
  totalRepairCount: number;
  totalPartReplacementCount: number;
  currentLocation?: string;
  createdAt: string;
}

interface LifecycleEvent {
  id: string;
  eventType: string;
  eventSubtype?: string;
  eventTimestamp: string;
  location?: string;
  notes?: string;
  technician?: string;
  cost?: number;
}

export default function DeviceManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(
    null
  );
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecycleDialog, setShowRecycleDialog] = useState(false);
  const [recycleReason, setRecycleReason] = useState('');
  const [recycling, setRecycling] = useState(false);

  // 搜索设备
  const searchDevices = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/devices/search?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error('搜索设备失败');
      }

      const result = await response.json();
      if (result.success) {
        setDevices(result.data.devices || []);
        if (result.data?.length === 1) {
          // 自动选择第一个设?
          handleDeviceSelect(result.data.devices[0]);
        }
      } else {
        setError(result.error || '搜索失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('搜索设备错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 选择设备
  const handleDeviceSelect = async (device: DeviceRecord) => {
    setSelectedDevice(device);
    await loadLifecycleEvents(device.qrcodeId);
  };

  // 加载生命周期事件
  const loadLifecycleEvents = async (qrcodeId: string) => {
    try {
      const response = await fetch(
        `/api/devices/${qrcodeId}/lifecycle?limit=20&orderBy=timestamp&sortOrder=desc`
      );

      if (!response.ok) {
        throw new Error('获取生命周期事件失败');
      }

      const result = await response.json();
      if (result.success) {
        setLifecycleEvents(result.data || []);
      }
    } catch (err) {
      console.error('加载生命周期事件错误:', err);
    }
  };

  // 标记设备回收
  const handleMarkRecycled = async () => {
    if (!selectedDevice || !recycleReason.trim()) return;

    setRecycling(true);
    try {
      const response = await fetch('/api/admin/devices/recycle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrcodeId: selectedDevice.qrcodeId,
          reason: recycleReason,
          userId: 'admin-user-id', // 实际应用中应该从认证获取
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 更新设备状?
        setDevices(prev =>
          prev.map(device =>
            device.qrcodeId === selectedDevice.qrcodeId
              ? { ...device, currentStatus: 'recycled' }
              : device
          )
        );

        setSelectedDevice(prev =>
          prev ? { ...prev, currentStatus: 'recycled' } : null
        );
        setShowRecycleDialog(false);
        setRecycleReason('');

        // 重新加载生命周期事件
        await loadLifecycleEvents(selectedDevice.qrcodeId);

        alert('设备已成功标记为回收状?);
      } else {
        throw new Error(result.error || '回收操作失败');
      }
    } catch (err) {
      alert('回收操作失败: ' + (err as Error).message);
    } finally {
      setRecycling(false);
    }
  };

  // 获取状态徽章样?
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'manufactured':
        return <Badge variant="secondary">已制?/Badge>;
      case 'activated':
        return <Badge variant="default">已激?/Badge>;
      case 'active':
        return <Badge variant="default">正常使用</Badge>;
      case 'in_repair':
        return <Badge variant="destructive">维修?/Badge>;
      case 'transferred':
        return <Badge variant="outline">已转?/Badge>;
      case 'recycled':
        return <Badge variant="secondary">已回?/Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // 获取事件图标
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'manufactured':
        return <Factory className="w-4 h-4" />;
      case 'activated':
        return <CheckCircle className="w-4 h-4" />;
      case 'repaired':
        return <Wrench className="w-4 h-4" />;
      case 'part_replaced':
        return <Battery className="w-4 h-4" />;
      case 'transferred':
        return <ArrowRight className="w-4 h-4" />;
      case 'recycled':
        return <Recycle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">设备管理</h1>
        <p className="text-gray-600 mt-2">搜索和管理设备生命周?/p>
      </div>

      {/* 搜索区域 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            设备搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="输入设备二维码ID、产品型号或序列号进行搜?
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchDevices()}
                className="w-full"
              />
            </div>
            <Button onClick={searchDevices} disabled={loading}>
              {loading ? '搜索?..' : '搜索'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设备列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>搜索结果 ({devices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleDeviceSelect(device)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <QrCode className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {device.qrcodeId}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {device.brandName} {device.productModel}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(device.currentStatus)}
                          <span className="text-xs text-gray-500">
                            维修: {device.totalRepairCount}�?
                          </span>
                        </div>
                      </div>
                      {device.currentStatus === 'recycled' && (
                        <Recycle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}

                {devices.length === 0 && searchTerm && (
                  <div className="text-center py-8 text-gray-500">
                    <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>未找到匹配的设备</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 设备详情和操?*/}
        <div className="lg:col-span-2">
          {selectedDevice ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>设备详情</span>
                    {selectedDevice.currentStatus !== 'recycled' && (
                      <Button
                        variant="destructive"
                        onClick={() => setShowRecycleDialog(true)}
                      >
                        <Recycle className="w-4 h-4 mr-2" />
                        标记回收
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        基本信息
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-gray-500" />
                          <span>二维码ID: {selectedDevice.qrcodeId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-500" />
                          <span>产品型号: {selectedDevice.productModel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>品牌: {selectedDevice.brandName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedDevice.currentStatus)}
                          <span>当前状? {selectedDevice.currentStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        统计信息
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-gray-500" />
                          <span>
                            维修次数: {selectedDevice.totalRepairCount}�?
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-gray-500" />
                          <span>
                            更换配件: {selectedDevice.totalPartReplacementCount}
                            �?
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>
                            当前位置: {selectedDevice.currentLocation || '未知'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            创建时间:{' '}
                            {new Date(
                              selectedDevice.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 生命周期事件 */}
              <Card>
                <CardHeader>
                  <CardTitle>生命周期事件</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {lifecycleEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className="mt-1">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize">
                              {event.eventType}
                            </span>
                            {event.eventSubtype && (
                              <Badge variant="secondary" className="text-xs">
                                {event.eventSubtype}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(event.eventTimestamp).toLocaleString()}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.technician && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <User className="w-3 h-3" />
                              <span>技? {event.technician}</span>
                            </div>
                          )}

                          {event.cost && (
                            <div className="text-sm text-gray-600 mb-1">
                              费用: ¥{event.cost.toFixed(2)}
                            </div>
                          )}

                          {event.notes && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {lifecycleEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>暂无生命周期事件记录</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    请选择设备
                  </h3>
                  <p className="text-gray-500">
                    在左侧搜索并选择一个设备以查看详细信息
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 回收确认对话?*/}
      {showRecycleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                确认设备回收
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  确定要将设备 <strong>{selectedDevice?.qrcodeId}</strong>{' '}
                  标记为已回收吗？
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    回收原因 *
                  </label>
                  <textarea
                    value={recycleReason}
                    onChange={e => setRecycleReason(e.target.value)}
                    placeholder="请输入回收原?.."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRecycleDialog(false);
                      setRecycleReason('');
                    }}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleMarkRecycled}
                    disabled={!recycleReason.trim() || recycling}
                    className="flex-1"
                  >
                    {recycling ? '处理?..' : '确认回收'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
