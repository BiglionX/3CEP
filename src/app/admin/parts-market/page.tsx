'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Search,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useRbacPermission } from '@/hooks/use-rbac-permission';

interface Part {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  part_number: string | null;
  price: number;
  stock_quantity: number;
  unit: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  image_url: string | null;
  description: string | null;
  supplier: string;
  created_at: string;
  updated_at: string;
  sales_count: number;
  rating: number;
}

export default function PartsMarketManagement() {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>(
    'view'
  );

  // 权限检  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('parts.view');
  const canManage = hasPermission('parts.manage');
  const canDelete = hasPermission('parts.delete');

  // 筛选条  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  // 获取配件数据
  const fetchParts = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: Part[] = [
        {
          id: 'part_001',
          name: 'iPhone 14 Pro 原装屏幕',
          category: '屏幕总成',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          part_number: 'A2650',
          price: 1200,
          stock_quantity: 15,
          unit: ',
          status: 'active',
          image_url: null,
          description: '原装苹果屏幕，支持原彩显,
          supplier: '苹果官方供应,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-20T14:20:00Z',
          sales_count: 42,
          rating: 4.8,
        },
        {
          id: 'part_002',
          name: '三星Galaxy S23 电池',
          category: '电池',
          brand: 'Samsung',
          model: 'Galaxy S23',
          part_number: 'EB-BG911ABE',
          price: 280,
          stock_quantity: 0,
          unit: ',
          status: 'out_of_stock',
          image_url: null,
          description: '原装电池，容000mAh',
          supplier: '三星电子',
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-18T16:45:00Z',
          sales_count: 28,
          rating: 4.5,
        },
        {
          id: 'part_003',
          name: '华为Mate 50 充电,
          category: '充电配件',
          brand: '华为',
          model: 'Mate 50',
          part_number: 'HW-100500C00',
          price: 89,
          stock_quantity: 32,
          unit: ',
          status: 'active',
          image_url: null,
          description: '66W超级快充充电,
          supplier: '华为技术有限公,
          created_at: '2024-01-12T11:20:00Z',
          updated_at: '2024-01-19T09:30:00Z',
          sales_count: 67,
          rating: 4.7,
        },
      ];

      setParts(mockData);
      setFilteredParts(mockData);
    } catch (error) {
      console.error('获取配件数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 应用筛  const applyFilters = () => {
    let filtered = [...parts];

    if (filters.category) {
      filtered = filtered.filter(part => part.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(part => part.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        part =>
          part.name.toLowerCase().includes(searchTerm) ||
          part.toLowerCase().includes(searchTerm) ||
          part.toLowerCase().includes(searchTerm) ||
          part.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        part => part.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        part => part.price <= parseFloat(filters.maxPrice)
      );
    }

    setFilteredParts(filtered);
  };

  // 处理筛选变  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 查看详情
  const handleView = (part: Part) => {
    setSelectedPart(part);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  // 编辑配件
  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  // 新增配件
  const handleCreate = () => {
    setSelectedPart(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  // 删除配件
  const handleDelete = (part: Part) => {
    if (confirm(`确定要删除配"${part.name}" 吗？`)) {
      // 模拟删除操作
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('删除配件:', part.id)fetchParts(); // 重新加载数据
    }
  };

  // 导出数据
  const handleExport = () => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('导出配件数据')};

  // 刷新数据
  const handleRefresh = () => {
    fetchParts();
  };

  // 状态标签渲  const renderStatusTag = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: '在售' },
      inactive: { variant: 'secondary' as const, text: '停售' },
      out_of_stock: { variant: 'destructive' as const, text: '缺货' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // 获取分类选项
  const getCategoryOptions = () => {
    const categories = Array.from(new Set(parts.map(part => part.category)));
    return categories.map(category => ({ value: category, label: category }));
  };

  // 表格列定  const columns = [
    { key: 'name', title: '配件名称', width: '200px' },
    { key: 'category', title: '分类', width: '120px' },
    { key: 'brand_model', title: '品牌型号', width: '150px' },
    { key: 'price', title: '价格', width: '100px' },
    { key: 'stock', title: '库存', width: '100px' },
    { key: 'sales', title: '销, width: '80px' },
    { key: 'rating', title: '评分', width: '80px' },
    { key: 'status', title: '状, width: '100px' },
    { key: 'actions', title: '操作', width: '150px' },
  ];

  // 初始化数  useEffect(() => {
    fetchParts();
  }, []);

  // 筛选变化时重新应用筛  useEffect(() => {
    applyFilters();
  }, [filters, parts]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看配件市场管/p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">配件市场管理</h1>
          <p className="text-gray-600 mt-1">管理配件商品信息和库存状/p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新增配件
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选面*/}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选条/CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索配件名称/品牌/型号"
                className="pl-10"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={value => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                {getCategoryOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状 />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态/SelectItem>
                <SelectItem value="active">在售</SelectItem>
                <SelectItem value="inactive">停售</SelectItem>
                <SelectItem value="out_of_stock">缺货</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="最低价
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)}
            />

            <Input
              type="number"
              placeholder="最高价
              value={filters.maxPrice}
              onChange={e => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button onClick={applyFilters}>应用筛/Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总配件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {parts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              在售商品
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {parts.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              缺货商品
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {parts.filter(p => p.status === 'out_of_stock').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总销售额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ¥
              {parts
                .reduce((sum, p) => sum + p.price * p.sales_count, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>配件商品列表</CardTitle>
          <CardDescription>{filteredParts.length} 件商/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading  (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中..
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParts.map(part => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>{part.category}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.brand}</div>
                          <div className="text-sm text-gray-500">
                            {part.model}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          {part.price}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            part.stock_quantity > 10
                               'default'
                              : part.stock_quantity > 0
                                 'secondary'
                                : 'destructive'
                          }
                        >
                          {part.stock_quantity} {part.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                          {part.sales_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {part.rating}
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusTag(part.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(part)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(part)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(part)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* 详情/编辑对话*/}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view'
                 '配件详情'
                : dialogMode === 'edit'
                   '编辑配件'
                  : '新增配件'}
            </DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    配件名称
                  </label>
                  <Input
                    value={selectedPart.name}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    分类
                  </label>
                  <Input
                    value={selectedPart.category}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    品牌
                  </label>
                  <Input
                    value={selectedPart.brand || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    型号
                  </label>
                  <Input
                    value={selectedPart.model || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    配件编号
                  </label>
                  <Input
                    value={selectedPart.part_number || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    价格 (
                  </label>
                  <Input
                    type="number"
                    value={selectedPart.price}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    库存数量
                  </label>
                  <Input
                    type="number"
                    value={selectedPart.stock_quantity}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    单位
                  </label>
                  <Input
                    value={selectedPart.unit}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    状                  </label>
                  <Select
                    value={selectedPart.status}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在售</SelectItem>
                      <SelectItem value="inactive">停售</SelectItem>
                      <SelectItem value="out_of_stock">缺货</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    供应                  </label>
                  <Input
                    value={selectedPart.supplier}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={selectedPart.description || ''}
                  readOnly={dialogMode === 'view'}
                />
              </div>

              {dialogMode !== 'view' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button>{dialogMode === 'edit' ? '保存' : '创建'}</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

