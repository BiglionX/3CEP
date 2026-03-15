'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    name: string;
    contact_person: string;
  };
  warehouse: {
    name: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'received' | 'cancelled';
  expectedDeliveryDate: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function ProcurementManagement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 获取采购订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supply-chain/purchase-orders');
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('获取采购订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取供应商列表
  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/supply-chain/suppliers');
      const result = await response.json();

      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('获取供应商失败:', error);
    }
  };

  // 获取仓库列表
  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/supply-chain/warehouses');
      const result = await response.json();

      if (result.success) {
        setWarehouses(result.data);
      }
    } catch (error) {
      console.error('获取仓库失败:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchWarehouses();
  }, []);

  // 状态标签映射
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: React.ReactNode;
      }
    > = {
      pending: {
        variant: 'secondary',
        icon: <Plus className="w-3 h-3 mr-1" />,
      },
      confirmed: {
        variant: 'default',
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      shipping: {
        variant: 'outline',
        icon: <Truck className="w-3 h-3 mr-1" />,
      },
      received: {
        variant: 'default',
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      cancelled: {
        variant: 'destructive',
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
    };

    const statusText =
      {
        pending: '待确认',
        confirmed: '已确认',
        shipping: '运输中',
        received: '已收货',
        cancelled: '已取消',
      }[status] || status;

    const statusColor =
      {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        shipping: 'bg-purple-100 text-purple-800',
        received: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      }[status] || 'bg-gray-100 text-gray-800';

    const config = statusMap[status];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
      >
        {config?.icon}
        {statusText}
      </span>
    );
  };

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesSupplier =
      supplierFilter === 'all' || order.supplier.name === suppliers.find(s => s.id === supplierFilter)?.name;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">采购管理</h1>
          <p className="text-gray-600 mt-2">管理采购订单和供应商关系</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建采购订单
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">待处理订单</div>
          <div className="text-2xl font-bold text-orange-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">运输中</div>
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'shipping').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">本月采购额</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(
              orders.reduce((sum, order) => sum + order.totalAmount, 0)
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">总订单数</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">订单筛选</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索订单号或供应商..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 w-[180px]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="shipping">运输中</option>
            <option value="received">已收货</option>
            <option value="cancelled">已取消</option>
          </select>

          <select
            value={supplierFilter}
            onChange={e => setSupplierFilter(e.target.value)}
            className="border rounded-md px-3 py-2 w-[180px]"
          >
            <option value="all">全部供应商</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 订单表格 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">采购订单列表</h2>
          <p className="text-gray-600 mt-1">
            共 {filteredOrders.length} 个订单
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  供应商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  仓库
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预计到货
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order: PurchaseOrder) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order?.supplier?.name || '未知供应商'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order?.warehouse?.name || '未知仓库'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    件
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(order.expectedDeliveryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无符合条件的订单
            </div>
          )}
        </div>
      </div>

      {/* 创建订单模态框 */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOrders();
          }}
          suppliers={suppliers}
          warehouses={warehouses}
        />
      )}
    </div>
  );
}

// 创建订单模态框组件
function CreateOrderModal({
  onClose,
  onSuccess,
  suppliers,
  warehouses,
}: {
  onClose: () => void;
  onSuccess: () => void;
  suppliers: Supplier[];
  warehouses: Warehouse[];
}) {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSupplier || !selectedWarehouse || items.length === 0) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/supply-chain/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            ...item,
            supplierId: selectedSupplier,
          })),
          warehouseId: selectedWarehouse,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">新建采购订单</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">供应商</label>
            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择供应商" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">目标仓库</label>
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">采购商品</label>
            <div className="border rounded-lg p-4 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="商品ID"
                    value={item.productId}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].productId = e.target.value;
                      setItems(newItems);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="数量"
                    value={item.quantity}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].quantity = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="单价"
                    value={item.unitPrice}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].unitPrice =
                        parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                  >
                    删除
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setItems([
                    ...items,
                    { productId: '', quantity: 1, unitPrice: 0 },
                  ])
                }
              >
                添加商品
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '创建中...' : '创建订单'}
          </Button>
        </div>
      </div>
    </div>
  );
}
