'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualList } from '@/components/VirtualList';
import {
  Download,
  Edit2,
  History,
  MapPin,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  from_location: string;
  to_location: string;
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
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/inventory/items?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / pagination.pageSize),
        }));
      }
    } catch (error) {
      console.error('获取库存列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取出入库记录
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory/movements');
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('获取出入库记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取仓库位置
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
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
        fetchItems();
        break;
      case 'movements':
        fetchMovements();
        break;
      case 'locations':
        fetchLocations();
        break;
    }
  }, [activeTab, pagination.page, pagination.pageSize]);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
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
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  // 处理添加库存项
  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemDialog(true);
  };

  // 处理编辑库存项
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowItemDialog(true);
  };

  // 处理保存库存项
  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    try {
      const url = editingItem
        ? `/api/admin/inventory/items/${editingItem.id}`
        : '/api/admin/inventory/items';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        await fetchItems();
        setShowItemDialog(false);
      }
    } catch (error) {
      console.error('保存库存项失败:', error);
    }
  };

  // 处理删除库存项
  const handleDeleteItem = async (id: string) => {
    if (!confirm('确定要删除此库存项吗？')) return;

    try {
      const response = await fetch(`/api/admin/inventory/items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error('删除库存项失败:', error);
    }
  };

  // 处理批量操作
  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 项吗？`)) return;

    try {
      const promises = selectedIds.map(id =>
        fetch(`/api/admin/inventory/items/${id}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      setSelectedIds([]);
      await fetchItems();
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  // 处理创建出入库记录
  const handleCreateMovement = async (movementData: Partial<StockMovement>) => {
    try {
      const response = await fetch('/api/admin/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementData),
      });

      if (response.ok) {
        await fetchMovements();
        setShowMovementDialog(false);
      }
    } catch (error) {
      console.error('创建出入库记录失败:', error);
    }
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const variants = {
      normal: 'default',
      low_stock: 'destructive',
      out_of_stock: 'destructive',
      overstock: 'secondary',
    } as const;

    const labels = {
      normal: '正常',
      low_stock: '低库存',
      out_of_stock: '缺货',
      overstock: '积压',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // 过滤后的数据
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">仓储管理</h1>
          <p className="text-gray-500 mt-1">管理库存、出入库记录和仓库位置</p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="w-4 h-4 mr-2" />
          添加库存项
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总库存项</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-gray-500 mt-1">所有 SKU 数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低库存预警</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter(i => i.status === 'low_stock').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">需要补货的商品</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">仓库位置</CardTitle>
            <MapPin className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-gray-500 mt-1">活跃仓库数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日出入库</CardTitle>
            <History className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                movements.filter(
                  m =>
                    new Date(m.created_at).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">今日操作次数</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区 */}
      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">库存管理</TabsTrigger>
          <TabsTrigger value="movements">出入库记录</TabsTrigger>
          <TabsTrigger value="locations">仓库位置</TabsTrigger>
        </TabsList>

        {/* 库存管理标签 */}
        <TabsContent value="inventory" className="space-y-4">
          {/* 筛选工具栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="搜索 SKU 或名称..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="electronics">电子产品</SelectItem>
                  <SelectItem value="clothing">服装</SelectItem>
                  <SelectItem value="food">食品</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="low_stock">低库存</SelectItem>
                  <SelectItem value="out_of_stock">缺货</SelectItem>
                  <SelectItem value="overstock">积压</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除 ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* 批量操作提示 */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-blue-700">
                已选择 {selectedIds.length} 项
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                取消选择
              </Button>
            </div>
          )}

          {/* 库存表格 */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">加载中...</span>
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
                      <TableHead>名称</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>当前库存</TableHead>
                      <TableHead>可用库存</TableHead>
                      <TableHead>单位价格</TableHead>
                      <TableHead>总价值</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <VirtualList
                      items={filteredItems}
                      itemSize={52} // 每行高度约 52px
                      height={Math.min(600, filteredItems.length * 52 + 40)} // 动态高度，最多显示 600px
                      overscan={5} // 预加载 5 个额外项
                      renderItem={item => (
                        <TableRow key={item.id}>
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
                          <TableCell className="font-medium">
                            {item.sku}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <div>
                              <div>{item.current_stock}</div>
                              <div className="text-xs text-gray-500">
                                预留：{item.reserved_stock}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.available_stock < item.min_stock_level
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {item.available_stock}
                            </Badge>
                          </TableCell>
                          <TableCell>¥{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>¥{item.total_value.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      emptyContent={
                        <div className="text-center py-12 text-gray-500">
                          暂无库存数据
                        </div>
                      }
                    />
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 分页 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {pagination.total} 条记录，{pagination.totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                下一页
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 出入库记录标签 */}
        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowMovementDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建出入库记录
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>商品</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>来源</TableHead>
                      <TableHead>目标</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map(movement => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-mono text-sm">
                          {movement.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.movement_type === 'in'
                                ? 'default'
                                : movement.movement_type === 'out'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {movement.movement_type === 'in'
                              ? '入库'
                              : movement.movement_type === 'out'
                                ? '出库'
                                : movement.movement_type === 'transfer'
                                  ? '调拨'
                                  : '调整'}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.item_id}</TableCell>
                        <TableCell>
                          <span
                            className={
                              movement.quantity > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {movement.quantity > 0 ? '+' : ''}
                            {movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{movement.from_location || '-'}</TableCell>
                        <TableCell>{movement.to_location || '-'}</TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.operator}</TableCell>
                        <TableCell>
                          {new Date(movement.created_at).toLocaleString(
                            'zh-CN'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 仓库位置标签 */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map(location => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{location.name}</span>
                    <Badge
                      variant={
                        location.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {location.status === 'active' ? '使用中' : '停用'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>代码：{location.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">容量</span>
                      <span>{location.capacity.toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">已使用</span>
                      <span>{location.current_usage.toLocaleString()} m²</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-1">使用率</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(location.current_usage / location.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 库存项对话框 */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '编辑库存项' : '添加库存项'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <Input defaultValue={editingItem?.sku} placeholder="输入 SKU" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">名称</label>
                <Input
                  defaultValue={editingItem?.name}
                  placeholder="输入名称"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <Select defaultValue={editingItem?.category || 'electronics'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">电子产品</SelectItem>
                    <SelectItem value="clothing">服装</SelectItem>
                    <SelectItem value="food">食品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">品牌</label>
                <Input
                  defaultValue={editingItem?.brand}
                  placeholder="输入品牌"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  当前库存
                </label>
                <Input
                  type="number"
                  defaultValue={editingItem?.current_stock || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  最小库存
                </label>
                <Input
                  type="number"
                  defaultValue={editingItem?.min_stock_level || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  最大库存
                </label>
                <Input
                  type="number"
                  defaultValue={editingItem?.max_stock_level || 0}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  单位价格
                </label>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={editingItem?.unit_price || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  仓库位置
                </label>
                <Input
                  defaultValue={editingItem?.location}
                  placeholder="输入位置"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                /* 保存逻辑 */ setShowItemDialog(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 出入库记录对话框 */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建出入库记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">类型</label>
              <Select
                value={movementType}
                onValueChange={v => setMovementType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">入库</SelectItem>
                  <SelectItem value="out">出库</SelectItem>
                  <SelectItem value="transfer">调拨</SelectItem>
                  <SelectItem value="adjustment">调整</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">商品 ID</label>
              <Input placeholder="输入商品 ID" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">数量</label>
              <Input type="number" placeholder="正数入库，负数出库" />
            </div>
            {movementType === 'transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    来源位置
                  </label>
                  <Input placeholder="输入来源仓库" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    目标位置
                  </label>
                  <Input placeholder="输入目标仓库" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">原因</label>
              <Input placeholder="说明原因" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMovementDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                /* 创建逻辑 */ setShowMovementDialog(false);
              }}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
