'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_name: string;
  supplier_contact: string;
  total_amount: number;
  status:
    | 'pending'
    | 'approved'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
  expected_delivery: string;
  actual_delivery?: string;
  notes?: string;
}

interface PurchaseItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  cooperation_since: string;
  status: 'active' | 'inactive' | 'blacklisted';
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function ProcurementManagementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // 获取采购订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      const response = await fetch(`/api/admin/procurement/orders?${params}`);
      const result = await response.json();

      if (result.data) {
        setOrders(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取采购订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取供应商列?
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/procurement/suppliers');
      const result = await response.json();

      if (result.data) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('获取供应商列表失?', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchSuppliers();
    }
  }, [activeTab, pagination.page, searchTerm, statusFilter]);

  // 处理全?
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map(order => order.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // 新建采购订单
  const handleCreateOrder = () => {
    setEditingOrder({
      id: '',
      order_number: `PO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
      supplier_name: '',
      supplier_contact: '',
      total_amount: 0,
      status: 'pending',
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expected_delivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
    setShowOrderDialog(true);
  };

  // 编辑采购订单
  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setShowOrderDialog(true);
  };

  // 保存采购订单
  const saveOrder = async () => {
    if (!editingOrder) return;

    try {
      const url = editingOrder.id
        ? `/api/admin/procurement/orders/${editingOrder.id}`
        : '/api/admin/procurement/orders';

      const method = editingOrder.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingOrder),
      });

      const result = await response.json();
      if (result.success) {
        alert(editingOrder.id ? '采购订单更新成功' : '采购订单创建成功');
        setShowOrderDialog(false);
        setEditingOrder(null);
        fetchOrders();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存采购订单失败:', error);
      alert('操作失败');
    }
  };

  // 更新订单状?
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const statusText =
      {
        approved: '审批通过',
        processing: '处理?,
        shipped: '已发?,
        completed: '已完?,
        cancelled: '已取?,
      }[newStatus] || newStatus;

    if (!confirm(`确定要将订单状态更新为"${statusText}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/procurement/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('状态更新成?);
        fetchOrders();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('状态更新失?', error);
      alert('操作失败');
    }
  };

  // 获取状态标签样?
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待审?, className: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '已批?, className: 'bg-blue-100 text-blue-800' },
      processing: {
        text: '处理?,
        className: 'bg-indigo-100 text-indigo-800',
      },
      shipped: { text: '已发?, className: 'bg-purple-100 text-purple-800' },
      completed: { text: '已完?, className: 'bg-green-100 text-green-800' },
      cancelled: { text: '已取?, className: 'bg-red-100 text-red-800' },
    };

    const config = statusMap[status] || {
      text: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // 格式化金?
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和标签页 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">采购中心</h1>
        <p className="text-gray-600 mt-1">管理采购订单和供应商信息</p>
      </div>

      {/* 标签页导?*/}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            采购订单
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            供应商管?
          </button>
        </nav>
      </div>

      {/* 采购订单标签?*/}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* 操作?*/}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="搜索订单号或供应?.."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状?/option>
                <option value="pending">待审?/option>
                <option value="approved">已批?/option>
                <option value="processing">处理?/option>
                <option value="shipped">已发?/option>
                <option value="completed">已完?/option>
                <option value="cancelled">已取?/option>
              </select>

              <Button onClick={handleCreateOrder}>新建订单</Button>

              {selectedIds.length > 0 && (
                <Button variant="outline">
                  批量操作 ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* 订单统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>待审?/CardDescription>
                <CardTitle className="text-2xl text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>处理?/CardDescription>
                <CardTitle className="text-2xl text-blue-600">
                  {orders.filter(o => o.status === 'processing').length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>本月采购?/CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {formatCurrency(
                    orders.reduce((sum, order) => sum + order.total_amount, 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>总订单数</CardDescription>
                <CardTitle className="text-2xl text-purple-600">
                  {orders.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 订单列表表格 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">加载?..</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === orders.length &&
                          orders.length > 0
                        }
                        onChange={e => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableHead>
                    <TableHead>订单?/TableHead>
                    <TableHead>供应?/TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状?/TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>预计交付</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="border-b">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={e =>
                            handleSelectOne(order.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {order.order_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.supplier_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.supplier_contact}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            order.expected_delivery
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, 'approved')
                            }
                            disabled={order.status !== 'pending'}
                          >
                            审批
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-700">
                  显示?{(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  )}{' '}
                  条， �?{pagination.total} 条记?
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page <= 1}
                    variant="outline"
                    size="sm"
                  >
                    上一?
                  </Button>
                  <Button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    variant="outline"
                    size="sm"
                  >
                    下一?
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 供应商管理标签页 */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">供应商管?/h2>
            <Button onClick={() => setShowSupplierDialog(true)}>
              添加供应?
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <Card key={supplier.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{supplier.name}</span>
                    <span className="text-sm font-normal text-yellow-500">
                      ★{supplier.rating}
                    </span>
                  </CardTitle>
                  <CardDescription>{supplier.contact_person}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>📞 {supplier.phone}</div>
                    <div>✉️ {supplier.email}</div>
                    <div>🏢 {supplier.address}</div>
                    <div>
                      🤝 合作始于:{' '}
                      {new Date(
                        supplier.cooperation_since
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      编辑
                    </Button>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 编辑采购订单对话?*/}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder?.id ? '编辑采购订单' : '新建采购订单'}
            </DialogTitle>
          </DialogHeader>

          {editingOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    订单?
                  </label>
                  <Input
                    value={editingOrder.order_number}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供应商名?*
                  </label>
                  <Input
                    value={editingOrder.supplier_name}
                    onChange={e =>
                      setEditingOrder({
                        ...editingOrder,
                        supplier_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系?*
                  </label>
                  <Input
                    value={editingOrder.supplier_contact}
                    onChange={e =>
                      setEditingOrder({
                        ...editingOrder,
                        supplier_contact: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    预计交付日期 *
                  </label>
                  <Input
                    type="date"
                    value={
                      new Date(editingOrder.expected_delivery)
                        .toISOString()
                        .split('T')[0]
                    }
                    onChange={e =>
                      setEditingOrder({
                        ...editingOrder,
                        expected_delivery: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备注
                  </label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={e =>
                      setEditingOrder({
                        ...editingOrder,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入备注信?.."
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              取消
            </Button>
            <Button onClick={saveOrder}>
              {editingOrder?.id ? '保存更改' : '创建订单'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

