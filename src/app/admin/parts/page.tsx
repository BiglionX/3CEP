'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Plus, Edit, Trash2, Upload, Download, Image, Package } from 'lucide-react';
import PartForm from './PartForm';
import PartDetail from './PartDetail';

interface Part {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  part_number: string | null;
  unit: string | null;
  description: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  min_stock: number | null;
  max_stock: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  compatible_devices: any[] | null;
  related_faults: any[] | null;
  primary_image_url: string | null;
}

const PartsManagement = () => { // @ts-ignore
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // 获取配件列表
  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        category: categoryFilter,
        brand: brandFilter,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/parts?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setParts(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems);
      }
    } catch (error) {
      console.error('获取配件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除配件
  const handleDelete = async (partId: string) => {
    if (!confirm('确定要删除这个配件吗?)) return;
    
    try {
      const response = await fetch(`/api/admin/parts?id=${partId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        fetchParts(); // 刷新列表
      }
    } catch (error) {
      console.error('删除配件失败:', error);
    }
  };

  // 查看详情
  const handleViewDetail = (part: Part) => {
    setSelectedPart(part);
    setIsDetailOpen(true);
  };

  // 编辑配件
  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setIsFormOpen(true);
  };

  // 新增配件
  const handleAdd = () => {
    setEditingPart(null);
    setIsFormOpen(true);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPart(null);
    fetchParts();
  };

  // 获取筛选选项
  const getCategories = () => {
    const categories = Array.from(new Set(parts.map(p => p.category).filter(Boolean)));
    return categories.sort();
  };

  const getBrands = () => {
    const brands = Array.from(new Set(parts.map(p => p.brand).filter(Boolean)));
    return brands.sort();
  };

  // 页面加载时获取数?
  useEffect(() => {
    fetchParts();
  }, [currentPage, searchTerm, categoryFilter, brandFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">配件管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有配件信?/p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/api/admin/parts/import', '_blank')}>
            <Download className="w-4 h-4 mr-2" />
            下载模板
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                批量导入
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量导入配件</DialogTitle>
              </DialogHeader>
              <ImportForm onSuccess={fetchParts} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增配件
          </Button>
        </div>
      </div>

      {/* 搜索和筛选区?*/}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索配件名称、型?.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部分类</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部品牌</option>
            {getBrands().map(brand => (
              <option key={brand} value={brand || ''}>{brand}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部状?/option>
            <option value="active">正常</option>
            <option value="inactive">停用</option>
            <option value="deleted">已删?/option>
          </select>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载?..</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>配件图片</TableHead>
                  <TableHead>配件名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>品牌/型号</TableHead>
                  <TableHead>型号编码</TableHead>
                  <TableHead>库存</TableHead>
                  <TableHead>状?/TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      {part.primary_image_url ? (
                        <img 
                          src={part.primary_image_url} 
                          alt={part.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.category}</TableCell>
                    <TableCell>
                      <div>
                        <div>{part.brand || '-'}</div>
                        <div className="text-sm text-gray-500">{part.model || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{part.part_number || '-'}</TableCell>
                    <TableCell>
                      <div className={part.stock_quantity !== null && part.min_stock !== null && part.stock_quantity <= part.min_stock 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-900'}>
                        {part.stock_quantity !== null ? part.stock_quantity : 0}
                        {part.unit || '�?}
                        {part.min_stock && part.stock_quantity !== null && part.stock_quantity <= part.min_stock && (
                          <span className="ml-1 text-xs">(库存不足)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        part.status === 'active' ? 'bg-green-100 text-green-800' :
                        part.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {part.status === 'active' ? '正常' : 
                         part.status === 'inactive' ? '停用' : '已删?}
                      </span>
                    </TableCell>
                    <TableCell>
                      {part.created_at ? new Date(part.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(part)}
                        >
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(part)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(part.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示?{(currentPage - 1) * itemsPerPage + 1} �?{Math.min(currentPage * itemsPerPage, totalItems)} 条，
                  �?{totalItems} 条记?
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    上一?
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    �?{currentPage} 页，�?{totalPages} �?
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一?
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 新增/编辑表单对话?*/}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPart ? '编辑配件' : '新增配件'}</DialogTitle>
          </DialogHeader>
          <PartForm 
            part={editingPart} 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 详情对话?*/}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配件详情</DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <PartDetail 
              partId={selectedPart.id} 
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 批量导入表单组件
const ImportForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/parts/import', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setResult(result);
      
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('导入失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择Excel文件
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          支持 .xlsx, .xls, .csv 格式文件
        </p>
      </div>
      
      <Button 
        onClick={handleImport} 
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? '导入?..' : '开始导?}
      </Button>
      
      {result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            导入结果
          </h4>
          <p className="mt-1 text-sm">
            总计: {result?.total || 0} 条，
            成功: {result?.success || 0} 条，
            失败: {result?.failed || 0} �?
          </p>
          {result?.errors && result.data.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">错误信息:</p>
              <ul className="mt-1 text-xs space-y-1">
                {result.data.errors.slice(0, 5).map((error: string, index: number) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
                {result.data.errors.length > 5 && (
                  <li className="text-gray-500">...还有 {result.data.errors.length - 5} 条错?/li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartsManagement;
