'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Home,
  Plus,
  Search,
  Filter,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Battery,
  Camera,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'phone' | 'tablet' | 'laptop' | 'watch';
  serialNumber: string;
  purchaseDate: string;
  warrantyEnd: string;
  status: 'normal' | 'repairing' | 'repaired';
  lastMaintenance: string;
  imageUrl?: string;
}

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setDevices([
        {
          id: '1',
          name: 'iPhone 14 Pro',
          brand: 'Apple',
          model: 'A2890',
          type: 'phone',
          serialNumber: 'F2LJN0L9DTWF',
          purchaseDate: '2023-01-15',
          warrantyEnd: '2025-01-15',
          status: 'normal',
          lastMaintenance: '2023-12-01',
        },
        {
          id: '2',
          name: 'MacBook Pro 14"',
          brand: 'Apple',
          model: 'M2',
          type: 'laptop',
          serialNumber: 'C02XXXXXP04V',
          purchaseDate: '2023-03-20',
          warrantyEnd: '2026-03-20',
          status: 'repairing',
          lastMaintenance: '2023-11-15',
        },
        {
          id: '3',
          name: 'iPad Air',
          brand: 'Apple',
          model: 'A2230',
          type: 'tablet',
          serialNumber: 'DLXNXXXXDJD0',
          purchaseDate: '2022-08-10',
          warrantyEnd: '2024-08-10',
          status: 'repaired',
          lastMaintenance: '2023-10-25',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'watch':
        return <Watch className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'repairing':
        return 'bg-yellow-100 text-yellow-800';
      case 'repaired':
        return 'bg-blue-100 text-blue-800';
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
      case 'repaired':
        return '已维?;
      default:
        return '未知状?;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题和操作按?*/}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">设备管理</h1>
            <p className="text-gray-600">管理和维护您的所有电子设?/p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加设备
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {devices.length}
                  </p>
                  <p className="text-sm text-gray-600">设备总数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {devices.filter(d => d.status === 'normal').length}
                  </p>
                  <p className="text-sm text-gray-600">正常使用</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {devices.filter(d => d.status === 'repairing').length}
                  </p>
                  <p className="text-sm text-gray-600">维修?/p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3">
                  <Battery className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      devices.filter(d => new Date(d.warrantyEnd) > new Date())
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600">保修期内</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 设备列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              我的设备
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map(device => (
                <div
                  key={device.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getDeviceIcon(device.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {device.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}
                          >
                            {getStatusText(device.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">品牌型号:</span>
                            <p>
                              {device.brand} {device.model}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">序列?</span>
                            <p className="font-mono">{device.serialNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">购买日期:</span>
                            <p>
                              {new Date(
                                device.purchaseDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">保修到期:</span>
                            <p>
                              {new Date(
                                device.warrantyEnd
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            上次维护:{' '}
                            {new Date(
                              device.lastMaintenance
                            ).toLocaleDateString()}
                          </span>
                          {new Date(device.warrantyEnd) < new Date() && (
                            <span className="text-red-500">⚠️ 保修已过?/span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                      <Button variant="outline" size="sm">
                        维修记录
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {devices.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  暂无设备
                </h3>
                <p className="text-gray-600 mb-6">添加您的第一台设备开始管?/p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加设备
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

