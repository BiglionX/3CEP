'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Warehouse,
  MapPin,
  Truck,
  Package,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
} from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'full';
}

interface Shipment {
  id: string;
  orderId: string;
  destination: string;
  status: 'pending' | 'shipping' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  carrier: string;
}

export default function WarehousingManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const warehouses: Warehouse[] = [
    {
      id: 'WH-001',
      name: '深圳,
      location: '广东省深圳市南山,
      capacity: 10000,
      currentStock: 7500,
      utilization: 75,
      status: 'active',
    },
    {
      id: 'WH-002',
      name: '上海,
      location: '上海市浦东新,
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

  const shipments: Shipment[] = [
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
      destination: '广州市天河区',
      status: 'pending',
      estimatedDelivery: '2024-01-28',
      carrier: '京东物流',
    },
    {
      id: 'SH-003',
      orderId: 'ORD-2024-003',
      destination: 'New York, NY, USA',
      status: 'delivered',
      estimatedDelivery: '2024-01-20',
      carrier: 'FedEx',
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShipmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Warehouse className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            海外仓智能管理系          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            全球仓储网络和智能物流管理，实现库存同步、智能分仓和高效配          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'warehouses', 'shipments', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                     'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && '仪表}
                {tab === 'warehouses' && '仓库管理'}
                {tab === 'shipments' && '货运管理'}
                {tab === 'analytics' && '数据分析'}
              </button>
            ))}
          </nav>
        </div>

        {/* 仪表板内*/}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总仓库数
                  </CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">覆盖5个国/p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总库/CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156,890</div>
                  <p className="text-xs text-muted-foreground">SKU数量</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    在途货                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    预计24小时内到                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    准时交付                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">行业领先水平</p>
                </CardContent>
              </Card>
            </div>

            {/* 仓库分布*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  全球仓库网络
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">亚洲区域</h3>
                    <div className="space-y-2">
                      {warehouses.slice(0, 2).map(warehouse => (
                        <div
                          key={warehouse.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{warehouse.name}</div>
                            <div className="text-sm text-gray-600">
                              {warehouse.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {warehouse.utilization}%
                            </div>
                            <div className="text-xs text-gray-500">利用/div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">北美区域</h3>
                    <div className="space-y-2">
                      {warehouses.slice(2, 3).map(warehouse => (
                        <div
                          key={warehouse.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{warehouse.name}</div>
                            <div className="text-sm text-gray-600">
                              {warehouse.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {warehouse.utilization}%
                            </div>
                            <div className="text-xs text-gray-500">利用/div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">欧洲区域</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">德国汉堡/div>
                          <div className="text-sm text-gray-600">
                            Hamburg, Germany
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">筹备/div>
                          <div className="text-xs text-gray-500">即将开/div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 仓库管理 */}
        {activeTab === 'warehouses' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>仓库列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">仓库编号</th>
                        <th className="text-left py-3 px-4">仓库名称</th>
                        <th className="text-left py-3 px-4">位置</th>
                        <th className="text-left py-3 px-4">容量</th>
                        <th className="text-left py-3 px-4">当前库存</th>
                        <th className="text-left py-3 px-4">利用/th>
                        <th className="text-left py-3 px-4">状/th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouses.map(warehouse => (
                        <tr
                          key={warehouse.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {warehouse.id}
                          </td>
                          <td className="py-3 px-4">{warehouse.name}</td>
                          <td className="py-3 px-4">{warehouse.location}</td>
                          <td className="py-3 px-4">
                            {warehouse.capacity.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {warehouse.currentStock.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    warehouse.utilization > 90
                                       'bg-red-500'
                                      : warehouse.utilization > 75
                                         'bg-yellow-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${warehouse.utilization}%` }}
                                ></div>
                              </div>
                              <span>{warehouse.utilization}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(warehouse.status)}`}
                            >
                              {warehouse.status === 'active' && '运营部}
                              {warehouse.status === 'maintenance' && '维护}
                              {warehouse.status === 'full' && '已满}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 货运管理 */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>货运跟踪</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">货运编号</th>
                        <th className="text-left py-3 px-4">订单/th>
                        <th className="text-left py-3 px-4">目的/th>
                        <th className="text-left py-3 px-4">承运/th>
                        <th className="text-left py-3 px-4">预计送达</th>
                        <th className="text-left py-3 px-4">状/th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map(shipment => (
                        <tr
                          key={shipment.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {shipment.id}
                          </td>
                          <td className="py-3 px-4">{shipment.orderId}</td>
                          <td className="py-3 px-4">{shipment.destination}</td>
                          <td className="py-3 px-4">{shipment.carrier}</td>
                          <td className="py-3 px-4">
                            {shipment.estimatedDelivery}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getShipmentStatusColor(shipment.status)}`}
                            >
                              {shipment.status === 'pending' && '待发}
                              {shipment.status === 'shipping' && '运输}
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
          </div>
        )}

        {/* 数据分析 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    库存周转分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>平均库存周转天数</span>
                      <span className="font-semibold">45/span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>库存周转/span>
                      <span className="font-semibold">8.1/span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>滞销商品占比</span>
                      <span className="font-semibold text-red-600">2.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    成本效益分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>仓储成本节省</span>
                      <span className="font-semibold text-green-600">
                        ¥1,240,000
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>配送效率提/span>
                      <span className="font-semibold text-green-600">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>客户满意/span>
                      <span className="font-semibold">4.8/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

