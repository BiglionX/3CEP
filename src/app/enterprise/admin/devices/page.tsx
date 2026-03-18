'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { Label } from '@/components/ui/label';
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Smartphone,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Headphones,
  Bot,
  Coins,
  Globe,
  CreditCard,
  ShoppingCart,
  HelpCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  QrCode,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Device {
  id: string;
  name: string;
  type: 'computer' | 'mobile' | 'tablet' | 'iot';
  status: 'online' | 'offline' | 'maintenance';
  os: string;
  ip: string;
  lastActive: string;
  cpu: number;
  memory: number;
  storage: number;
  location: string;
}

export default function EnterpriseDevicesPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'online' | 'offline' | 'maintenance'
  >('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'computer' as 'computer' | 'mobile' | 'tablet' | 'iot',
    ip: '',
    os: '',
    location: '',
  });

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: '开发服务器-01',
      type: 'computer',
      status: 'online',
      os: 'Ubuntu 22.04',
      ip: '192.168.1.101',
      lastActive: '刚刚',
      cpu: 45,
      memory: 62,
      storage: 78,
      location: '北京机房A',
    },
    {
      id: '2',
      name: '测试服务器-02',
      type: 'computer',
      status: 'online',
      os: 'CentOS 8',
      ip: '192.168.1.102',
      lastActive: '2分钟前',
      cpu: 32,
      memory: 45,
      storage: 55,
      location: '北京机房A',
    },
    {
      id: '3',
      name: '生产服务器-01',
      type: 'computer',
      status: 'online',
      os: 'Ubuntu 22.04',
      ip: '192.168.1.103',
      lastActive: '刚刚',
      cpu: 78,
      memory: 85,
      storage: 92,
      location: '上海机房B',
    },
    {
      id: '4',
      name: '生产服务器-02',
      type: 'computer',
      status: 'maintenance',
      os: 'Ubuntu 22.04',
      ip: '192.168.1.104',
      lastActive: '1小时前',
      cpu: 0,
      memory: 0,
      storage: 0,
      location: '上海机房B',
    },
    {
      id: '5',
      name: '备用服务器-01',
      type: 'computer',
      status: 'offline',
      os: 'Windows Server 2022',
      ip: '192.168.1.105',
      lastActive: '3天前',
      cpu: 0,
      memory: 0,
      storage: 0,
      location: '广州机房C',
    },
    {
      id: '6',
      name: '监控设备-01',
      type: 'iot',
      status: 'online',
      os: 'Linux',
      ip: '192.168.1.106',
      lastActive: '刚刚',
      cpu: 15,
      memory: 20,
      storage: 30,
      location: '北京机房A',
    },
    {
      id: '7',
      name: '工作平板-01',
      type: 'tablet',
      status: 'online',
      os: 'iPadOS 17',
      ip: '192.168.1.107',
      lastActive: '5分钟前',
      cpu: 25,
      memory: 35,
      storage: 45,
      location: '办公室',
    },
    {
      id: '8',
      name: '移动设备-01',
      type: 'mobile',
      status: 'offline',
      os: 'Android 14',
      ip: '192.168.1.108',
      lastActive: '2天前',
      cpu: 0,
      memory: 0,
      storage: 0,
      location: '移动中',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            在线
          </Badge>
        );
      case 'offline':
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            离线
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            维护中
          </Badge>
        );
      default:
        return <Badge>未知</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'computer':
        return <Monitor className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Smartphone className="w-5 h-5" />;
      case 'iot':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'computer':
        return '计算机';
      case 'mobile':
        return '手机';
      case 'tablet':
        return '平板';
      case 'iot':
        return '物联网设备';
      default:
        return type;
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip) {
      alert('请填写设备名称和IP地址');
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      type: newDevice.type,
      status: 'offline',
      os: newDevice.os || 'Unknown',
      ip: newDevice.ip,
      lastActive: '从未',
      cpu: 0,
      memory: 0,
      storage: 0,
      location: newDevice.location || '未知',
    };

    setDevices([...devices, device]);
    setAddDialogOpen(false);
    setNewDevice({
      name: '',
      type: 'computer',
      ip: '',
      os: '',
      location: '',
    });
  };

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">设备管理</h1>
                <p className="mt-1 text-sm text-gray-600">
                  管理企业所有联网设备，监控设备状态和性能
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  {loading ? '刷新中...' : '刷新'}
                </Button>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加设备
                </Button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    设备总数
                  </CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">已注册设备</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    在线设备
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.online}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">运行正常</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    离线设备
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.offline}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">需要关注</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">维护中</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.maintenance}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">计划维护</p>
                </CardContent>
              </Card>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索设备名称、IP地址或位置..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('all')}
                    >
                      全部
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'online' ? 'default' : 'outline'
                      }
                      onClick={() => setStatusFilter('online')}
                    >
                      在线
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'offline' ? 'default' : 'outline'
                      }
                      onClick={() => setStatusFilter('offline')}
                    >
                      离线
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'maintenance' ? 'default' : 'outline'
                      }
                      onClick={() => setStatusFilter('maintenance')}
                    >
                      维护中
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 设备列表 */}
            <Card>
              <CardHeader>
                <CardTitle>设备列表</CardTitle>
                <CardDescription>
                  显示 {filteredDevices.length} 个设备
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDevices.map(device => (
                    <div
                      key={device.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            {getTypeIcon(device.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {device.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {getTypeText(device.type)} · {device.os}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(device.status)}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Wifi className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">IP: {device.ip}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            最后活跃: {device.lastActive}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            位置: {device.location}
                          </span>
                        </div>
                      </div>

                      {device.status === 'online' && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">CPU</span>
                              <span className="text-xs font-semibold">
                                {device.cpu}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${device.cpu > 80 ? 'bg-red-500' : device.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.cpu}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">
                                内存
                              </span>
                              <span className="text-xs font-semibold">
                                {device.memory}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${device.memory > 80 ? 'bg-red-500' : device.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.memory}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">
                                存储
                              </span>
                              <span className="text-xs font-semibold">
                                {device.storage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${device.storage > 80 ? 'bg-red-500' : device.storage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.storage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredDevices.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">没有找到匹配的设备</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* 添加设备对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加新设备</DialogTitle>
            <DialogDescription>
              填写设备信息以添加到设备列表中
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">设备名称 *</Label>
              <Input
                id="device-name"
                placeholder="例如：生产服务器-03"
                value={newDevice.name}
                onChange={e =>
                  setNewDevice({ ...newDevice, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-type">设备类型</Label>
              <select
                id="device-type"
                value={newDevice.type}
                onChange={e =>
                  setNewDevice({ ...newDevice, type: e.target.value as any })
                }
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="computer">计算机</option>
                <option value="mobile">手机</option>
                <option value="tablet">平板</option>
                <option value="iot">物联网设备</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-ip">IP地址 *</Label>
              <Input
                id="device-ip"
                placeholder="例如：192.168.1.109"
                value={newDevice.ip}
                onChange={e =>
                  setNewDevice({ ...newDevice, ip: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-os">操作系统</Label>
              <Input
                id="device-os"
                placeholder="例如：Ubuntu 22.04"
                value={newDevice.os}
                onChange={e =>
                  setNewDevice({ ...newDevice, os: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-location">位置</Label>
              <Input
                id="device-location"
                placeholder="例如：北京机房A"
                value={newDevice.location}
                onChange={e =>
                  setNewDevice({ ...newDevice, location: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddDevice}>添加设备</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
