'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Warehouse,
  Truck,
  Package,
  TrendingUp,
} from 'lucide-react';

interface WarehouseData {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'full';
}

interface ShipmentData {
  id: string;
  orderId: string;
  destination: string;
  status: 'pending' | 'shipping' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  carrier: string;
}

export default function WarehousingManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const warehouses: WarehouseData[] = [
    {
      id: 'WH-001',
      name: '深圳仓',
      location: '广东省深圳市南山区',
      capacity: 10000,
      currentStock: 7500,
      utilization: 75,
      status: 'active',
    },
    {
      id: 'WH-002',
      name: '上海仓',
      location: '上海市浦东新区',
      capacity: 8000,
      currentStock: 6800,
      utilization: 85,
      status: 'active',
    },
    {
      id: 'WH-003',
      name: '美国洛杉矶仓',
      location: 'Los Angeles, CA, USA',
      capacity: 15000,
      currentStock: 14500,
      utilization: 97,
      status: 'full',
    },
  ];

  const shipments: ShipmentData[] = [
    {
      id: 'SH-001',
      orderId: 'ORD-2024-001',
      destination: '北京市朝阳区',
      status: 'shipping',
      estimatedDelivery: '2024-01-25',
      carrier: '顺丰速运',
    },
    {
      id: 'SH-002',
      orderId: 'ORD-2024-002',
      destination: '上海市静安区',
      status: 'pending',
      estimatedDelivery: '2024-01-26',
      carrier: '中通快递',
    },
    {
      id: 'SH-003',
      orderId: 'ORD-2024-003',
      destination: '广州市天河区',
      status: 'delivered',
      estimatedDelivery: '2024-01-24',
      carrier: '圆通速递',
    },
    {
      id: 'SH-004',
      orderId: 'ORD-2024-004',
      destination: '杭州市西湖区',
      status: 'delayed',
      estimatedDelivery: '2024-01-23',
      carrier: '韵达快递',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const activeShipments = shipments.filter(s => s.status === 'shipping').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">仓储管理</h1>
          <p className="text-gray-600 mt-2">管理仓库库存和物流配送</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            数据概览
          </button>
          <button
            onClick={() => setActiveTab('warehouses')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'warehouses'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            仓库列表
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'shipments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            发货管理
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    仓库总数
                  </CardTitle>
                  <Warehouse className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{warehouses.length}</div>
                  <p className="text-xs text-gray-500">个仓库</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    总库存
                  </CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">
                    容量: {totalCapacity.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    在途发货
                  </CardTitle>
                  <Truck className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeShipments}</div>
                  <p className="text-xs text-gray-500">个订单运输中</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    平均利用率
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((totalStock / totalCapacity) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">仓库空间</p>
                </CardContent>
              </Card>
            </div>

            {/* Warehouse Overview */}
            <Card>
              <CardHeader>
                <CardTitle>仓库概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouses.map(warehouse => (
                    <div
                      key={warehouse.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Warehouse className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{warehouse.name}</p>
                          <p className="text-sm text-gray-500">{warehouse.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {warehouse.currentStock} / {warehouse.capacity}
                        </p>
                        <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${warehouse.utilization}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          利用率: {warehouse.utilization}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <Card>
            <CardHeader>
              <CardTitle>仓库列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        仓库名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        位置
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        容量
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        当前库存
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        利用率
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map(warehouse => (
                      <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{warehouse.name}</td>
                        <td className="py-3 px-4">{warehouse.location}</td>
                        <td className="py-3 px-4">
                          {warehouse.capacity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {warehouse.currentStock.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{warehouse.utilization}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              warehouse.status
                            )}`}
                          >
                            {warehouse.status === 'active' && '正常'}
                            {warehouse.status === 'maintenance' && '维护中'}
                            {warehouse.status === 'full' && '已满'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <Card>
            <CardHeader>
              <CardTitle>发货管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        订单号
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        目的地
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        承运商
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        预计送达
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(shipment => (
                      <tr key={shipment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">
                          {shipment.orderId}
                        </td>
                        <td className="py-3 px-4">{shipment.destination}</td>
                        <td className="py-3 px-4">{shipment.carrier}</td>
                        <td className="py-3 px-4">{shipment.estimatedDelivery}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              shipment.status
                            )}`}
                          >
                            {shipment.status === 'pending' && '待发货'}
                            {shipment.status === 'shipping' && '运输中'}
                            {shipment.status === 'delivered' && '已送达'}
                            {shipment.status === 'delayed' && '延误'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
