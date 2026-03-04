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

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_price: number;
  total_value: number;
  location: string;
  last_updated: string;
  status: 'normal' | 'low_stock' | 'out_of_stock' | 'overstock';
}

interface StockMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  from_location?: string;
  to_location?: string;
  reason: string;
  operator: string;
  created_at: string;
}

interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  capacity: number;
  current_usage: number;
  status: 'active' | 'inactive';
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function InventoryManagementPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'inventory' | 'movements' | 'locations'
  >('inventory');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<
    'in' | 'out' | 'transfer' | 'adjustment'
  >('in');

  // 获取库存列表
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      const response = await fetch(`/api/admin/inventory/items?${params}`);
      const result = await response.json();

      if (result.data) {
        setItems(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取库存列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取库存流水
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory/movements');
      const result = await response.json();

      if (result.data) {
        setMovements(result.data);
      }
    } catch (error) {
      console.error('获取库存流水失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取仓库位置
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory/locations');
      const result = await response.json();

      if (result.data) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error('获取仓库位置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 'inventory':
        fetchInventory();
        break;
      case 'movements':
        fetchMovements();
        break;
      case 'locations':
        fetchLocations();
        break;
    }
  }, [activeTab, pagination.page, searchTerm, categoryFilter, statusFilter]);

  // 处理全?  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id));
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

  // 新建库存项目
  const handleCreateItem = () => {
    setEditingItem({
      id: '',
      sku: `SKU${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
      name: '',
      category: '',
      brand: '',
      current_stock: 0,
      reserved_stock: 0,
      available_stock: 0,
      min_stock_level: 10,
      max_stock_level: 100,
      unit_price: 0,
      total_value: 0,
      location: '',
      last_updated: new Date().toISOString(),
      status: 'normal',
    });
    setShowItemDialog(true);
  };

  // 编辑库存项目
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowItemDialog(true);
  };

  // 保存库存项目
  const saveItem = async () => {
    if (!editingItem) return;

    try {
      const url = editingItem.id
        ? `/api/admin/inventory/items/${editingItem.id}`
        : '/api/admin/inventory/items';

      const method = editingItem.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      const result = await response.json();
      if (result.success) {
        alert(editingItem.id ? '库存项目更新成功' : '库存项目创建成功');
        setShowItemDialog(false);
        setEditingItem(null);
        fetchInventory();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存库存项目失败:', error);
      alert('操作失败');
    }
  };

  // 库存出入库操?  const handleStockMovement = (itemId: string) => {
    setMovementType('in');
    setShowMovementDialog(true);
  };

  // 保存库存流水
  const saveMovement = async () => {
    try {
      const response = await fetch('/api/admin/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: editingItem?.id,
          movement_type: movementType,
          quantity: 10, // 示例数量
          reason: '手动调整',
          operator: '管理?,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('库存操作成功');
        setShowMovementDialog(false);
        fetchInventory();
        fetchMovements();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('库存操作失败:', error);
      alert('操作失败');
    }
  };

  // 获取状态标签样?  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      normal: { text: '正常', className: 'bg-green-100 text-green-800' },
      low_stock: {
        text: '库存不足',
        className: 'bg-yellow-100 text-yellow-800',
      },
      out_of_stock: { text: '缺货', className: 'bg-red-100 text-red-800' },
      overstock: { text: '积压', className: 'bg-blue-100 text-blue-800' },
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

  // 格式化金?  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仓储管理</h1>
        <p className="text-gray-600 mt-1">管理库存、仓库位置和库存流水</p>
      </div>

      {/* 标签页导?*/}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            库存管理
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            库存流水
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            仓库位置
          </button>
        </nav>
      </div>

      {/* 库存管理标签?*/}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* 操作?*/}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="搜索SKU、名称或品牌..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部分类</option>
                <option value="手机配件">手机配件</option>
                <option value="电池">电池</option>
                <option value="数据?>数据?/option>
                <option value="充电设备">充电设备</option>
                <option value="芯片">芯片</option>
                <option value="工具">工具</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状?/option>
                <option value="normal">正常</option>
                <option value="low_stock">库存不足</option>
                <option value="out_of_stock">缺货</option>
                <option value="overstock">积压</option>
              </select>

              <Button onClick={handleCreateItem}>新增商品</Button>

              {selectedIds.length > 0 && (
                <Button variant="outline">
                  批量操作 ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* 库存统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>总商品数</CardDescription>
                <CardTitle className="text-2xl text-blue-600">
                  {items.length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>库存不足</CardDescription>
                <CardTitle className="text-2xl text-yellow-600">
                  {items.filter(i => i.status === 'low_stock').length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>缺货商品</CardDescription>
                <CardTitle className="text-2xl text-red-600">
                  {items.filter(i => i.status === 'out_of_stock').length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>库存总?/CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {formatCurrency(
                    items.reduce((sum, item) => sum + item.total_value, 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 库存列表表格 */}
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
                          selectedIds.length === items.length &&
                          items.length > 0
                        }
                        onChange={e => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>商品名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>当前库存</TableHead>
                    <TableHead>可用库存</TableHead>
                    <TableHead>单价</TableHead>
                    <TableHead>状?/TableHead>
                    <TableHead>位置</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id} className="border-b">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={e =>
                            handleSelectOne(item.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {item.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.brand}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${item.current_stock <= item.min_stock_level ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          {item.current_stock}
                        </div>
                        {item.reserved_stock > 0 && (
                          <div className="text-xs text-gray-500">
                            预留: {item.reserved_stock}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {item.available_stock}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStockMovement(item.id)}
                          >
                            出入?                          </Button>
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
                  条， �?{pagination.total} 条记?                </div>
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
                    上一?                  </Button>
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
                    下一?                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 库存流水标签?*/}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">库存流水记录</h2>
            <Button onClick={() => setShowMovementDialog(true)}>
              新增流水
            </Button>
          </div>

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
                    <TableHead>时间</TableHead>
                    <TableHead>商品SKU</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>操作?/TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map(movement => (
                    <TableRow key={movement.id} className="border-b">
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(movement.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">SKU001</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movement.movement_type === 'in'
                              ? 'bg-green-100 text-green-800'
                              : movement.movement_type === 'out'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {movement.movement_type === 'in'
                            ? '入库'
                            : movement.movement_type === 'out'
                              ? '出库'
                              : '转移'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${
                            movement.movement_type === 'in'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {movement.movement_type === 'in' ? '+' : '-'}
                          {movement.quantity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {movement.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {movement.operator}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* 仓库位置标签?*/}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">仓库位置管理</h2>
            <Button>添加位置</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map(location => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{location.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        location.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {location.status === 'active' ? '启用' : '停用'}
                    </span>
                  </CardTitle>
                  <CardDescription>编码: {location.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>📦 容量: {location.capacity} �?/div>
                    <div>🔄 已使? {location.current_usage} �?/div>
                    <div>
                      📊 使用?{' '}
                      {Math.round(
                        (location.current_usage / location.capacity) * 100
                      )}
                      %
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(location.current_usage / location.capacity) * 100}%`,
                      }}
                    ></div>
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

      {/* 编辑库存项目对话?*/}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? '编辑库存商品' : '新增库存商品'}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU编号 *
                  </label>
                  <Input
                    value={editingItem.sku}
                    onChange={e =>
                      setEditingItem({ ...editingItem, sku: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    商品名称 *
                  </label>
                  <Input
                    value={editingItem.name}
                    onChange={e =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类 *
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择分类</option>
                    <option value="手机配件">手机配件</option>
                    <option value="电池">电池</option>
                    <option value="数据?>数据?/option>
                    <option value="充电设备">充电设备</option>
                    <option value="芯片">芯片</option>
                    <option value="工具">工具</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品牌
                  </label>
                  <Input
                    value={editingItem.brand}
                    onChange={e =>
                      setEditingItem({ ...editingItem, brand: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    当前库存 *
                  </label>
                  <Input
                    type="number"
                    value={editingItem.current_stock}
                    onChange={e => {
                      const stock = parseInt(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        current_stock: stock,
                        available_stock: stock - editingItem.reserved_stock,
                        total_value: stock * editingItem.unit_price,
                      });
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    预留库存
                  </label>
                  <Input
                    type="number"
                    value={editingItem.reserved_stock}
                    onChange={e => {
                      const reserved = parseInt(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        reserved_stock: reserved,
                        available_stock: editingItem.current_stock - reserved,
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最低库存预?                  </label>
                  <Input
                    type="number"
                    value={editingItem.min_stock_level}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        min_stock_level: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最高库存限?                  </label>
                  <Input
                    type="number"
                    value={editingItem.max_stock_level}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        max_stock_level: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    单价 *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingItem.unit_price}
                    onChange={e => {
                      const price = parseFloat(e.target.value) || 0;
                      setEditingItem({
                        ...editingItem,
                        unit_price: price,
                        total_value: editingItem.current_stock * price,
                      });
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    存放位置
                  </label>
                  <Input
                    value={editingItem.location}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              取消
            </Button>
            <Button onClick={saveItem}>
              {editingItem?.id ? '保存更改' : '创建商品'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 库存操作对话?*/}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>库存操作</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                操作类型
              </label>
              <select
                value={movementType}
                onChange={e => setMovementType(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in">入库</option>
                <option value="out">出库</option>
                <option value="transfer">转移</option>
                <option value="adjustment">调整</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量
              </label>
              <Input type="number" defaultValue="10" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                操作原因
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入操作原?.."
                defaultValue="日常补货"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMovementDialog(false)}
            >
              取消
            </Button>
            <Button onClick={saveMovement}>确认操作</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

