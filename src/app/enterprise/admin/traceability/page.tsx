'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  QrCode,
  BarChart3,
  Headphones,
  Bot,
  Coins,
  Globe,
  CreditCard,
  ShoppingCart,
  HelpCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Download,
  Plus,
  Upload,
  Search,
  MapPin,
  Calendar,
  Package,
  BarChart,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

interface QRBatch {
  id: string;
  batchId: string;
  internalCode: string;
  productName: string;
  productModel: string;
  category: string;
  quantity: number;
  generatedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  config: {
    format: string;
    size: number;
  };
}

interface ScanStatistics {
  batchId: string;
  totalScans: number;
  uniqueScans: number;
  regions: { region: string; count: number }[];
  dailyStats: { date: string; count: number }[];
}

export default function EnterpriseTraceabilityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('batches');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newBatch, setNewBatch] = useState({
    internalCode: '',
    productName: '',
    productModel: '',
    category: '',
    quantity: 0,
    format: 'png',
    size: 300,
  });

  // 模拟批次数据
  const [batches, setBatches] = useState<QRBatch[]>([
    {
      id: '1',
      batchId: 'batch_20240101001',
      internalCode: 'ABC-001',
      productName: '智能手机 X200',
      productModel: 'X200-Pro',
      category: '手机',
      quantity: 1000,
      generatedCount: 1000,
      status: 'completed',
      createdAt: '2024-01-01',
      completedAt: '2024-01-01',
      config: { format: 'png', size: 300 },
    },
    {
      id: '2',
      batchId: 'batch_20240102001',
      internalCode: 'ABC-002',
      productName: '平板电脑 Pad300',
      productModel: 'Pad300-WiFi',
      category: '平板',
      quantity: 500,
      generatedCount: 500,
      status: 'completed',
      createdAt: '2024-01-02',
      completedAt: '2024-01-02',
      config: { format: 'png', size: 300 },
    },
    {
      id: '3',
      batchId: 'batch_20240103001',
      internalCode: 'ABC-003',
      productName: '智能手表 Watch100',
      productModel: 'Watch100-Sport',
      category: '可穿戴',
      quantity: 2000,
      generatedCount: 0,
      status: 'processing',
      createdAt: '2024-01-03',
      config: { format: 'png', size: 300 },
    },
  ]);

  // 模拟扫描统计数据
  const scanStats: ScanStatistics = {
    batchId: 'batch_20240101001',
    totalScans: 1250,
    uniqueScans: 980,
    regions: [
      { region: '北京', count: 320 },
      { region: '上海', count: 280 },
      { region: '广东', count: 250 },
      { region: '江苏', count: 180 },
      { region: '浙江', count: 120 },
      { region: '其他', count: 100 },
    ],
    dailyStats: [
      { date: '2024-01-01', count: 150 },
      { date: '2024-01-02', count: 180 },
      { date: '2024-01-03', count: 220 },
      { date: '2024-01-04', count: 200 },
      { date: '2024-01-05', count: 250 },
      { date: '2024-01-06', count: 150 },
      { date: '2024-01-07', count: 100 },
    ],
  };

  const menuItems = [
    { name: '仪表盘', href: '/enterprise/admin/dashboard', icon: BarChart3 },
    { name: '售后管理', href: '/enterprise/after-sales', icon: Headphones },
    { name: '智能体管理', href: '/enterprise/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/enterprise/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/enterprise/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/enterprise/admin/fxc', icon: CreditCard },
    {
      name: '采购管理',
      href: '/enterprise/admin/procurement',
      icon: ShoppingCart,
    },
    { name: '有奖问答', href: '/enterprise/admin/reward-qa', icon: HelpCircle },
    {
      name: '新品众筹',
      href: '/enterprise/admin/crowdfunding',
      icon: DollarSign,
    },
    { name: '企业资料', href: '/enterprise/admin/documents', icon: FileText },
    { name: '设备管理', href: '/enterprise/admin/devices', icon: Package },
    { name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },
    {
      name: '二维码溯源',
      href: '/enterprise/admin/traceability',
      icon: QrCode,
    },
    { name: '团队管理', href: '/enterprise/admin/team', icon: Users },
    { name: '系统设置', href: '/enterprise/admin/settings', icon: Settings },
  ];

  const filteredBatches = batches.filter(
    batch =>
      batch.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBatch = async () => {
    if (!newBatch.internalCode || !newBatch.productName || !newBatch.quantity) {
      alert('请填写必填字段');
      return;
    }

    setLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);

    const newBatchItem: QRBatch = {
      id: Date.now().toString(),
      batchId: `batch_${Date.now()}`,
      internalCode: newBatch.internalCode,
      productName: newBatch.productName,
      productModel: newBatch.productModel,
      category: newBatch.category,
      quantity: newBatch.quantity,
      generatedCount: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      config: { format: newBatch.format, size: newBatch.size },
    };

    setBatches([newBatchItem, ...batches]);
    setCreateDialogOpen(false);
    setNewBatch({
      internalCode: '',
      productName: '',
      productModel: '',
      category: '',
      quantity: 0,
      format: 'png',
      size: 300,
    });
  };

  const handleUploadCSV = async () => {
    setLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setUploadDialogOpen(false);
    alert('CSV上传成功！后台正在生成二维码');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">已完成</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">处理中</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">待处理</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    totalBatches: batches.length,
    totalQRs: batches.reduce((sum, b) => sum + b.quantity, 0),
    completedBatches: batches.filter(b => b.status === 'completed').length,
    processingBatches: batches.filter(b => b.status === 'processing').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                企业管理中心
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理菜单</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    item.href === '/enterprise/admin/traceability'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  二维码溯源管理
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  批量生成区块链溯源码，追踪商品流向，分析售后数据
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  CSV批量导入
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建批次
                </Button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总批次数
                  </CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBatches}</div>
                  <p className="text-xs text-gray-500 mt-1">已创建批次</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    二维码总数
                  </CardTitle>
                  <QrCode className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalQRs.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">已生成的二维码</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    已完成批次
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedBatches}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">生成成功</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    处理中批次
                  </CardTitle>
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.processingBatches}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">正在生成</p>
                </CardContent>
              </Card>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索内部编码、产品名称或型号..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 批次列表 */}
            <Card>
              <CardHeader>
                <CardTitle>溯源码批次列表</CardTitle>
                <CardDescription>
                  显示 {filteredBatches.length} 个批次
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBatches.map(batch => (
                    <div
                      key={batch.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {batch.internalCode}
                              </h3>
                              {getStatusBadge(batch.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {batch.productName} · {batch.productModel}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {batch.category} · 批次号: {batch.batchId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {batch.generatedCount} / {batch.quantity}
                          </p>
                          <p className="text-xs text-gray-500">已生成</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {batch.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {scanStats.totalScans} 次扫描
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart className="h-4 w-4 mr-1" />
                            数据分析
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredBatches.length === 0 && (
                  <div className="text-center py-12">
                    <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">没有找到匹配的批次</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* 新建批次对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新建溯源码批次</DialogTitle>
            <DialogDescription>
              创建新的二维码批次，为产品批量生成区块链溯源码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="internal-code">
                企业内部编码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="internal-code"
                placeholder="例如: ABC-001"
                value={newBatch.internalCode}
                onChange={e =>
                  setNewBatch({ ...newBatch, internalCode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-name">
                产品名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="例如: 智能手机 X200"
                value={newBatch.productName}
                onChange={e =>
                  setNewBatch({ ...newBatch, productName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-model">产品型号</Label>
                <Input
                  id="product-model"
                  placeholder="例如: X200-Pro"
                  value={newBatch.productModel}
                  onChange={e =>
                    setNewBatch({ ...newBatch, productModel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">产品类别</Label>
                <Input
                  id="category"
                  placeholder="例如: 手机"
                  value={newBatch.category}
                  onChange={e =>
                    setNewBatch({ ...newBatch, category: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">
                生成数量 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="例如: 1000"
                value={newBatch.quantity}
                onChange={e =>
                  setNewBatch({
                    ...newBatch,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">二维码格式</Label>
                <select
                  id="format"
                  value={newBatch.format}
                  onChange={e =>
                    setNewBatch({ ...newBatch, format: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">尺寸</Label>
                <select
                  id="size"
                  value={newBatch.size}
                  onChange={e =>
                    setNewBatch({ ...newBatch, size: parseInt(e.target.value) })
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={200}>200x200</option>
                  <option value={300}>300x300</option>
                  <option value={400}>400x400</option>
                  <option value={500}>500x500</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleCreateBatch} disabled={loading}>
              {loading ? '创建中...' : '创建批次'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV上传对话框 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>CSV批量导入</DialogTitle>
            <DialogDescription>上传CSV文件批量创建溯源码批次</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                拖拽文件到此处或点击上传
              </p>
              <p className="text-xs text-gray-500">支持 CSV 格式</p>
              <Input type="file" accept=".csv" className="mt-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium mb-2">CSV文件格式要求：</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>企业内部编码</li>
                <li>产品名称</li>
                <li>产品型号</li>
                <li>产品类别</li>
                <li>生成数量</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleUploadCSV} disabled={loading}>
              {loading ? '上传中...' : '上传并创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 遮罩层（移动端） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
