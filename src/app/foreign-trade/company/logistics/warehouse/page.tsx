'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Warehouse,
  MapPin,
  AlertCircle,
  TrendingUp,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'full' | 'closed';
  manager: string;
  contact: string;
  lastInventory: string;
  nextMaintenance: string;
  temperatureControlled: boolean;
  securityLevel: 'basic' | 'standard' | 'high';
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  reserved: number;
  available: number;
  unit: string;
  lastUpdated: string;
  minStock: number;
  maxStock: number;
  status: 'normal' | 'low' | 'overstock' | 'outofstock';
}

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'warehouses' | 'inventory'>(
    'warehouses'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  // 模拟数据
  useEffect(() => {
    const loadData = () => {
      setLoading(true);

      setTimeout(() => {
        // 仓库数据
        const mockWarehouses: Warehouse[] = [
          {
            id: '1',
            name: '上海浦东保税仓',
            location: '上海市浦东新区',
            capacity: 50000,
            currentStock: 35000,
            utilization: 70,
            status: 'active',
            manager: '张伟',
            contact: '138****1234',
            lastInventory: '2026-02-25',
            nextMaintenance: '2026-05-15',
            temperatureControlled: true,
            securityLevel: 'high',
          },
          {
            id: '2',
            name: '深圳前海出口仓',
            location: '深圳市南山区',
            capacity: 30000,
            currentStock: 28500,
            utilization: 95,
            status: 'full',
            manager: '李娜',
            contact: '139****5678',
            lastInventory: '2026-02-24',
            nextMaintenance: '2026-04-20',
            temperatureControlled: false,
            securityLevel: 'standard',
          },
          {
            id: '3',
            name: '广州白云进口仓',
            location: '广州市白云区',
            capacity: 40000,
            currentStock: 15000,
            utilization: 37.5,
            status: 'active',
            manager: '王强',
            contact: '136****9012',
            lastInventory: '2026-02-23',
            nextMaintenance: '2026-06-01',
            temperatureControlled: true,
            securityLevel: 'high',
          },
          {
            id: '4',
            name: '天津滨海维修仓',
            location: '天津市滨海新区',
            capacity: 15000,
            currentStock: 0,
            utilization: 0,
            status: 'maintenance',
            manager: '赵敏',
            contact: '137****3456',
            lastInventory: '2026-02-01',
            nextMaintenance: '2026-03-15',
            temperatureControlled: false,
            securityLevel: 'basic',
          },
        ];

        // 库存数据
        const mockInventory: InventoryItem[] = [
          {
            id: '1',
            sku: 'SM-G998B',
            name: 'Galaxy S24 Ultra',
            category: '智能手机',
            warehouse: '上海浦东保税仓',
            quantity: 5000,
            reserved: 1200,
            available: 3800,
            unit: '台',
            lastUpdated: '2026-02-2514:30',
            minStock: 1000,
            maxStock: 8000,
            status: 'normal',
          },
          {
            id: '2',
            sku: 'IP-15PM-BLK',
            name: 'iPhone 15 Pro Max',
            category: '智能手机',
            warehouse: '深圳前海出口仓',
            quantity: 3000,
            reserved: 2800,
            available: 200,
            unit: '台',
            lastUpdated: '2026-02-2416:45',
            minStock: 500,
            maxStock: 5000,
            status: 'low',
          },
          {
            id: '3',
            sku: 'HW-MT60P-BLK',
            name: '华为Mate 60 Pro',
            category: '智能手机',
            warehouse: '广州白云进口仓',
            quantity: 8000,
            reserved: 2000,
            available: 6000,
            unit: '台',
            lastUpdated: '2026-02-2311:20',
            minStock: 2000,
            maxStock: 12000,
            status: 'normal',
          },
          {
            id: '4',
            sku: 'PS5-DISC-BLK',
            name: 'PlayStation 5 光驱版',
            category: '游戏机',
            warehouse: '上海浦东保税仓',
            quantity: 2500,
            reserved: 800,
            available: 1700,
            unit: '台',
            lastUpdated: '2026-02-2509:15',
            minStock: 500,
            maxStock: 4000,
            status: 'normal',
          },
          {
            id: '5',
            sku: 'XM-14UL-BLK',
            name: '小米14 Ultra',
            category: '智能手机',
            warehouse: '深圳前海出口仓',
            quantity: 15000,
            reserved: 14500,
            available: 500,
            unit: '台',
            lastUpdated: '2026-02-2413:30',
            minStock: 1000,
            maxStock: 20000,
            status: 'low',
          },
        ];

        setWarehouses(mockWarehouses);
        setInventory(mockInventory);
        setLoading(false);
      }, 800);
    };

    loadData();
  }, []);

  // 筛选逻辑
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || warehouse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWarehouse =
      warehouseFilter === 'all' || item.warehouse === warehouseFilter;
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  // 状态颜色映射
  const getWarehouseStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      full: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getWarehouseStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      active: '运营中',
      maintenance: '维护中',
      full: '已满仓',
      closed: '已关闭',
    };
    return textMap[status] || status;
  };

  const getInventoryStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      normal: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      overstock: 'bg-blue-100 text-blue-800',
      outofstock: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getInventoryStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      normal: '正常',
      low: '库存偏低',
      overstock: '库存过多',
      outofstock: '缺货',
    };
    return textMap[status] || status;
  };

  const handleViewWarehouse = (warehouseId: string) => {
    // TODO: 实现查看详情功能
    console.debug('查看仓库详情:', warehouseId);
  };

  const handleViewInventory = (itemId: string) => {
    // TODO: 实现查看详情功能
    console.debug('查看库存详情:', itemId);
  };

  const handleCreateWarehouse = () => {
    // TODO: 实现创建仓库功能
    console.debug('创建新仓库');
  };

  const handleAddInventory = () => {
    // TODO: 实现添加库存功能
    console.debug('添加库存');
  };

  const handleExport = () => {
    // TODO: 实现导出功能
    console.debug('导出数据');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载仓储数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col flex:rowsm:items-center justify:between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仓储管理</h1>
          <p className="mt-2 text-gray-600">管理仓库设施和库存商品信息</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button
            onClick={
              activeTab === 'warehouses' ? handleCreateWarehouse : handleAddInventory
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'warehouses' ? '添加仓库' : '添加库存'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总仓库数</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">
              运营中 {warehouses.filter(w => w.status === 'active').length} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总库存量</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory
                .reduce((sum, item) => sum + item.quantity, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              可用量{' '}
              {inventory
                .reduce((sum, item) => sum + item.available, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均利用率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                warehouses.reduce((sum, w) => sum + w.utilization, 0) /
                  warehouses.length
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">仓库空间使用率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存预警</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                inventory.filter(i => ['low', 'outofstock'].includes(i.status))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">需要关注的商品</p>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'warehouses'
                 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 text:gray-700hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('warehouses')}
          >
            仓库管理
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 text:gray-700hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            库存管理
          </button>
        </nav>
      </div>

      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={
                    activeTab === 'warehouses'
                       ? '搜索仓库名称、位置或管理员...'
                       : '搜索商品SKU、名称或分类...'
                  }
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {activeTab === 'warehouses' ? (
                  <>
                    <SelectItem value="active">运营中</SelectItem>
                    <SelectItem value="maintenance">维护中</SelectItem>
                    <SelectItem value="full">已满仓</SelectItem>
                    <SelectItem value="closed">已关闭</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="normal">正常</SelectItem>
                    <SelectItem value="low">库存偏低</SelectItem>
                    <SelectItem value="overstock">库存过多</SelectItem>
                    <SelectItem value="outofstock">缺货</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {activeTab === 'inventory' && (
              <Select
                value={warehouseFilter}
                onValueChange={setWarehouseFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="仓库筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部仓库</SelectItem>
                  {[...new Set(inventory.map(i => i.warehouse))].map(
                    warehouse => (
                      <SelectItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 内容区域 */}
      {activeTab === 'warehouses' ? (
        <Card>
          <CardHeader>
            <CardTitle>仓库列表</CardTitle>
            <CardDescription>
              共找到 {filteredWarehouses.length} 个符合条件的仓库
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无仓库数据
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                       ? '没有找到匹配的仓库' : '开始添加第一个仓库吧'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <div className="mt-6">
                      <Button onClick={handleCreateWarehouse}>
                        <Plus className="h-4 w-4 mr-2" />
                        添加仓库
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                filteredWarehouses.map(warehouse => (
                  <Card
                    key={warehouse.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {warehouse.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {warehouse.location}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={getWarehouseStatusColor(warehouse.status)}
                        >
                          {getWarehouseStatusText(warehouse.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 基本信息 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">管理员</span>
                          <span>{warehouse.manager}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">联系方式:</span>
                          <span>{warehouse.contact}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">温控:</span>
                          <span>
                            {warehouse.temperatureControlled ? '是' : '否'}
                          </span>
                        </div>
                      </div>

                      {/* 容量信息 */}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            容量利用率
                          </span>
                          <span className="text-sm font-medium">
                            {warehouse.utilization}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              warehouse.utilization > 90 ? 'bg-red-500' : warehouse.utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `, {warehouse.utilization}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {warehouse.currentStock.toLocaleString()} /{' '}
                            {warehouse.capacity.toLocaleString()}
                          </span>
                          <span>最大容量</span>
                        </div>
                      </div>

                      {/* 时间信息 */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">上次盘点:</span>
                          <div>{warehouse.lastInventory}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">下次维护:</span>
                          <div>{warehouse.nextMaintenance}</div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewWarehouse(warehouse.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>库存列表</CardTitle>
            <CardDescription>
              共找到 {filteredInventory.length} 个符合条件的商品
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品信息</TableHead>
                    <TableHead>所属仓库</TableHead>
                    <TableHead>库存状态</TableHead>
                    <TableHead>数量详情</TableHead>
                    <TableHead>库存水平</TableHead>
                    <TableHead>最后更新</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Box className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          暂无库存数据
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ||
                          statusFilter !== 'all' ||
                          warehouseFilter !== 'all'
                             ? '没有找到匹配的商品' : '开始添加第一批库存吧'}
                        </p>
                        {!searchTerm &&
                          statusFilter === 'all' &&
                          warehouseFilter === 'all' && (
                            <div className="mt-6">
                              <Button onClick={handleAddInventory}>
                                <Plus className="h-4 w-4 mr-2" />
                                添加库存
                              </Button>
                            </div>
                          )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map(item => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.sku}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.category}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">{item.warehouse}</div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={getInventoryStatusColor(item.status)}
                          >
                            {getInventoryStatusText(item.status)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div>
                              总量: {item.quantity} {item.unit}
                            </div>
                            <div className="text-gray-600">
                              可用: {item.available} {item.unit}
                            </div>
                            <div className="text-gray-600">
                              预留: {item.reserved} {item.unit}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div
                                className={`h-2 rounded-full ${
                                  item.quantity < item.minStock ? 'bg-red-500' : item.quantity > item.maxStock ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, (item.quantity / item.maxStock) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.minStock} - {item.maxStock} {item.unit}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {item.lastUpdated}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInventory(item.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
