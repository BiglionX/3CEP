'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Smartphone,
  QrCode,
  Plus,
  Search,
  MoreVertical,
  Battery,
  Calendar,
  MapPin,
  Wrench,
  Eye,
  Trash2,
  Edit3,
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate: string;
  status: 'normal' | 'repairing' | 'broken';
  lastServiceDate: string;
  location: string;
  qrCode: string;
  imageUrl: string;
}

export default function UserDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // 模拟获取设备数据
    setTimeout(() => {
      const mockDevices: Device[] = [
        {
          id: 'dev_001',
          name: '主力手机',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          serialNumber: 'F2LHJ8KLP1A',
          purchaseDate: '2023-09-15',
          warrantyEndDate: '2024-09-15',
          status: 'normal',
          lastServiceDate: '2024-01-10',
          location: '北京',
          qrCode: 'QR001DEV001',
          imageUrl: '',
        },
        {
          id: 'dev_002',
          name: '办公电脑',
          brand: 'Dell',
          model: 'XPS 13',
          serialNumber: 'D3LLX9Z2P8Q',
          purchaseDate: '2023-12-01',
          warrantyEndDate: '2025-12-01',
          status: 'repairing',
          lastServiceDate: '2024-02-15',
          location: '上海',
          qrCode: 'QR002DEV002',
          imageUrl: '',
        },
        {
          id: 'dev_003',
          name: '平板设备',
          brand: 'Samsung',
          model: 'Galaxy Tab S8',
          serialNumber: 'S8GTABR4M7N',
          purchaseDate: '2024-01-20',
          warrantyEndDate: '2025-01-20',
          status: 'normal',
          lastServiceDate: '2024-01-20',
          location: '广州',
          qrCode: 'QR003DEV003',
          imageUrl: '',
        },
      ];
      setDevices(mockDevices);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'repairing':
        return 'bg-yellow-100 text-yellow-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return '正常使用';
      case 'repairing':
        return '维修?;
      case 'broken':
        return '已损?;
      default:
        return '未知状?;
    }
  };

  const filteredDevices = devices.filter(
    device =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScanQRCode = () => {
    // 模拟扫码功能
    alert('请使用摄像头扫描设备二维?);
  };

  const handleAddDevice = () => {
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的设备</h1>
          <p className="text-gray-600 mt-1">管理您的所有设备信?/p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索设备名称、品牌或型号..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleScanQRCode}>
            <QrCode className="w-4 h-4 mr-2" />
            扫码添加
          </Button>
          <Button onClick={handleAddDevice}>
            <Plus className="w-4 h-4 mr-2" />
            手动添加
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {devices.length}
                </p>
                <p className="text-sm text-gray-600">总设备数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <Battery className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.status === 'normal').length}
                </p>
                <p className="text-sm text-gray-600">正常设备</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2">
                <Wrench className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.status === 'repairing').length}
                </p>
                <p className="text-sm text-gray-600">维修?/p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-100 p-2">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {
                    devices.filter(
                      d => new Date(d.warrantyEndDate) > new Date()
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">保修期内</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 设备列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map(device => (
          <Card key={device.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                    {device.imageUrl ? (
                      <img
                        src={device.imageUrl}
                        alt={device.name}
                        className="w-8 h-8 rounded"
                      />
                    ) : (
                      <Smartphone className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {device.brand} {device.model}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* 状态标?*/}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}
                >
                  {getStatusText(device.status)}
                </span>
                <span className="text-xs text-gray-500">
                  SN: {device.serialNumber}
                </span>
              </div>

              {/* 设备信息 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>购买日期: {device.purchaseDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>位置: {device.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Wrench className="w-4 h-4 mr-2" />
                  <span>上次服务: {device.lastServiceDate}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  查看详情
                </Button>
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状?*/}
      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无设备</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '没有找到匹配的设? : '添加您的第一台设备开始管?}
          </p>
          <div className="mt-6">
            <Button onClick={handleAddDevice}>
              <Plus className="w-4 h-4 mr-2" />
              添加设备
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

