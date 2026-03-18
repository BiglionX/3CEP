'use client';

import { useState, useEffect } from 'react';
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
  HelpCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Download,
  Plus,
  Upload,
  Search,
  MapPin,
  Calendar,
  Package,
  BarChart,
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

export default function ForeignTradeTraceabilityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [fcxBalance, setFcxBalance] = useState(10000);
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: 1000,
    pricePerCode: 0.01,
  });

  const [newBatch, setNewBatch] = useState({
    internalCode: '',
    productName: '',
    productModel: '',
    category: '',
    quantity: 0,
    format: 'png',
    size: 300,
  });

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

  const filteredBatches = batches.filter(
    batch =>
      batch.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/enterprise/traceability/purchase?type=stats');
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        const ordersRes = await fetch('/api/enterprise/traceability/purchase?type=orders');
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          const convertedBatches = ordersData.orders.map((order: any) => ({
            id: order.id,
            batchId: order.batch_id,
            internalCode: order.internal_code,
            productName: order.product_name,
            productModel: order.product_model,
            category: order.product_category,
            quantity: order.quantity,
            generatedCount: order.generated_count || 0,
            status: order.status,
            createdAt: order.created_at?.split('T')[0] || '',
            completedAt: order.completed_at,
            config: order.config || { format: 'png', size: 300 },
          }));
          setBatches(convertedBatches);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCreateBatch = async () => {
    if (!newBatch.internalCode || !newBatch.productName || !newBatch.quantity) {
      alert('请填写必填字段');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/traceability/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internalCode: newBatch.internalCode,
          productName: newBatch.productName,
          productModel: newBatch.productModel,
          category: newBatch.category,
          quantity: newBatch.quantity,
        })
      });
      const data = await res.json();

      if (data.success) {
        const newBatchItem: QRBatch = {
          id: data.batch?.id || Date.now().toString(),
          batchId: data.batch?.batch_id || `batch_${Date.now()}`,
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
      }
    } catch (error) {
      console.error('Create batch error:', error);
      alert('创建失败');
    } finally {
      setLoading(false);
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
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/enterprise/traceability/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `溯源码_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('导出失败');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败');
    }
  };

  const handleUploadCSV = async () => {
    setLoading(true);
    setLoading(false);
    setUploadDialogOpen(false);
    alert('CSV上传成功！后台正在生成二维码');
  };

  const handlePurchase = async () => {
    const totalCost = purchaseForm.quantity * purchaseForm.pricePerCode;

    if (totalCost > fcxBalance) {
      alert('FCX余额不足，请充值后再购买');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/traceability/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'purchase',
          quantity: purchaseForm.quantity,
          paymentMethod: 'fcx',
        })
      });
      const data = await res.json();

      if (data.success) {
        setFcxBalance(prev => prev - totalCost);
        setStats((prev: any) => ({
          ...prev,
          totalPurchased: (prev?.totalPurchased || 0) + purchaseForm.quantity,
          totalAvailable: (prev?.totalAvailable || 0) + purchaseForm.quantity,
        }));
        setPurchaseDialogOpen(false);
        alert(`购买成功！已消耗 ${totalCost} FCX`);
      } else {
        alert(data.message || '购买失败');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('购买失败，请重试');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
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
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出数据
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建批次
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50"
                  onClick={() => setPurchaseDialogOpen(true)}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  FCX购买
                </Button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">已购买总量</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPurchased || 0}</div>
                  <p className="text-xs text-gray-500">采购数量</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">已生成数量</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalGenerated || 0}</div>
                  <p className="text-xs text-gray-500">已生成溯源码</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">可用数量</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.totalAvailable || 0}</div>
                  <p className="text-xs text-gray-500">可分配使用</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">已被扫描</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.usedCodes || 0}</div>
                  <p className="text-xs text-gray-500">消费者扫码</p>
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
                          <div className="p-2 bg-green-50 rounded-lg">
                            <QrCode className="w-5 h-5 text-green-600" />
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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

      {/* FCX购买对话框 */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              使用FCX购买溯源码
            </DialogTitle>
            <DialogDescription>
              购买溯源码需要消耗FCX币，每个溯源码价格固定
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-800">当前FCX余额</span>
                <span className="text-xl font-bold text-amber-600">{fcxBalance.toLocaleString()} FCX</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">购买数量</Label>
              <Input
                id="quantity"
                type="number"
                min="100"
                step="100"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">最少购买100个，支持批量购买</p>
            </div>

            <div className="space-y-2">
              <Label>单价</Label>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{purchaseForm.pricePerCode} FCX / 个</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">预计消耗FCX</span>
                <span className="text-lg font-bold text-gray-900">
                  {(purchaseForm.quantity * purchaseForm.pricePerCode).toLocaleString()} FCX
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• 购买后溯源码将存入企业账户</p>
              <p>• 溯源码生成后将从余额中扣除</p>
              <p>• 支持批量购买，价格优惠</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handlePurchase}
              disabled={loading || purchaseForm.quantity * purchaseForm.pricePerCode > fcxBalance}
            >
              {loading ? '购买中...' : '确认购买'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
