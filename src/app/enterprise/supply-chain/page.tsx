'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  status: 'normal' | 'low' | 'critical';
  lastUpdated: string;
}

interface Order {
  id: string;
  supplier: string;
  items: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  orderDate: string;
}

export default function SupplyChainPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const suppliers: Supplier[] = [
    {
      id: 'SUP-001',
      name: '深圳电子科技',
      contact: '张经理',
      phone: '138-0000-0001',
      email: 'zhang@example.com',
      status: 'active',
      rating: 4.8,
    },
    {
      id: 'SUP-002',
      name: '上海贸易公司',
      contact: '李经理',
      phone: '138-0000-0002',
      email: 'li@example.com',
      status: 'active',
      rating: 4.5,
    },
    {
      id: 'SUP-003',
      name: '广州制造厂',
      contact: '王经理',
      phone: '138-0000-0003',
      email: 'wang@example.com',
      status: 'pending',
      rating: 4.2,
    },
  ];

  const inventory: InventoryItem[] = [
    {
      id: 'INV-001',
      name: '电路板A1',
      sku: 'PCB-A1-001',
      quantity: 1500,
      minStock: 500,
      status: 'normal',
      lastUpdated: '2024-01-20 10:30:00',
    },
    {
      id: 'INV-002',
      name: '显示屏B2',
      sku: 'LCD-B2-002',
      quantity: 200,
      minStock: 300,
      status: 'low',
      lastUpdated: '2024-01-20 09:15:00',
    },
    {
      id: 'INV-003',
      name: '电池C3',
      sku: 'BAT-C3-003',
      quantity: 50,
      minStock: 200,
      status: 'critical',
      lastUpdated: '2024-01-20 11:00:00',
    },
    {
      id: 'INV-004',
      name: '外壳D4',
      sku: 'CASE-D4-004',
      quantity: 3000,
      minStock: 800,
      status: 'normal',
      lastUpdated: '2024-01-19 16:45:00',
    },
  ];

  const orders: Order[] = [
    {
      id: 'PO-001',
      supplier: '深圳电子科技',
      items: 5,
      totalAmount: 25000,
      status: 'shipped',
      orderDate: '2024-01-18',
    },
    {
      id: 'PO-002',
      supplier: '上海贸易公司',
      items: 3,
      totalAmount: 12000,
      status: 'processing',
      orderDate: '2024-01-19',
    },
    {
      id: 'PO-003',
      supplier: '广州制造厂',
      items: 8,
      totalAmount: 45000,
      status: 'pending',
      orderDate: '2024-01-20',
    },
    {
      id: 'PO-004',
      supplier: '深圳电子科技',
      items: 2,
      totalAmount: 8000,
      status: 'delivered',
      orderDate: '2024-01-15',
    },
  ];

  const getSupplierStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalInventory = inventory.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const lowStockItems = inventory.filter(
    item => item.status === 'low' || item.status === 'critical'
  ).length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">供应链管理</h1>
          <p className="text-gray-600 mt-2">管理供应商、库存和采购订单</p>
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
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            供应商管理
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            库存管理
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            采购订单
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
                    库存总数
                  </CardTitle>
                  <Warehouse className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalInventory.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">件</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    库存预警
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowStockItems}</div>
                  <p className="text-xs text-gray-500">项需要关注</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    活跃供应商
                  </CardTitle>
                  <Truck className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSuppliers}</div>
                  <p className="text-xs text-gray-500">家</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    待处理订单
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                  <p className="text-xs text-gray-500">个</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: '采购订单已发货', time: '10分钟前', icon: Truck },
                    { action: '库存补充入库', time: '1小时前', icon: Package },
                    {
                      action: '新供应商加入',
                      time: '2小时前',
                      icon: CheckCircle,
                    },
                    {
                      action: '库存预警: 电池C3',
                      time: '3小时前',
                      icon: AlertTriangle,
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <activity.icon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                      </div>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <Card>
            <CardHeader>
              <CardTitle>供应商列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        供应商名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        联系人
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        电话
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        评分
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map(supplier => (
                      <tr
                        key={supplier.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium">
                          {supplier.name}
                        </td>
                        <td className="py-3 px-4">{supplier.contact}</td>
                        <td className="py-3 px-4">{supplier.phone}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSupplierStatusColor(
                              supplier.status
                            )}`}
                          >
                            {supplier.status === 'active' && '活跃'}
                            {supplier.status === 'inactive' && '停用'}
                            {supplier.status === 'pending' && '待审核'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>{supplier.rating}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <Card>
            <CardHeader>
              <CardTitle>库存列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        产品名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        数量
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        最低库存
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        更新时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-sm font-mono">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.minStock}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getInventoryStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status === 'normal' && '正常'}
                            {item.status === 'low' && '偏低'}
                            {item.status === 'critical' && '紧急'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle>采购订单</CardTitle>
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
                        供应商
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        商品数
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        订单金额
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        订单日期
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">
                          {order.id}
                        </td>
                        <td className="py-3 px-4">{order.supplier}</td>
                        <td className="py-3 px-4">{order.items}</td>
                        <td className="py-3 px-4">
                          ¥{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status === 'pending' && '待处理'}
                            {order.status === 'processing' && '处理中'}
                            {order.status === 'shipped' && '已发货'}
                            {order.status === 'delivered' && '已送达'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {order.orderDate}
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
