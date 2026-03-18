'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  QrCode,
  Package,
  ShoppingCart,
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Loader2,
} from 'lucide-react';

interface PurchaseStats {
  totalPurchased: number;
  totalGenerated: number;
  totalAvailable: number;
  consumedCodes: number;
  usedCodes: number;
  activeCodes: number;
  totalScans: number;
}

interface Order {
  id: string;
  batch_id: string;
  internal_code: string;
  product_name: string;
  product_model: string;
  quantity: number;
  generated_count: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export default function TraceabilityPurchasePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newOrder, setNewOrder] = useState({
    internalCode: '',
    productName: '',
    productModel: '',
    category: '',
    quantity: 100,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取统计数据
      const statsRes = await fetch('/api/enterprise/traceability/purchase?type=stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 获取订单列表
      const ordersRes = await fetch('/api/enterprise/traceability/purchase?type=orders');
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async () => {
    if (!newOrder.internalCode || !newOrder.productName || newOrder.quantity <= 0) {
      alert('请填写必要信息');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/enterprise/traceability/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      const data = await res.json();
      if (data.success) {
        alert('购买成功！');
        setPurchaseDialogOpen(false);
        setNewOrder({
          internalCode: '',
          productName: '',
          productModel: '',
          category: '',
          quantity: 100,
        });
        fetchData();
      } else {
        alert(data.error || '购买失败');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('购买失败，请重试');
    } finally {
      setSubmitting(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />已完成</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="h-3 w-3 mr-1" />处理中</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />待处理</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />失败</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">溯源码管理</h1>
                <p className="text-sm text-gray-500">查看溯源码消耗和购买记录</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </Button>
              <Button onClick={() => setPurchaseDialogOpen(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                购买溯源码
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">已购买总量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{stats?.totalPurchased || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">已生成数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{stats?.totalGenerated || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">可用数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{stats?.totalAvailable || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">已消耗数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold">{stats?.consumedCodes || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">已被扫描</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="text-2xl font-bold">{stats?.usedCodes || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">总扫描次数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-600" />
                <span className="text-2xl font-bold">{stats?.totalScans || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 订单记录 */}
        <Card>
          <CardHeader>
            <CardTitle>购买记录</CardTitle>
            <CardDescription>溯源码批次购买和生成记录</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无购买记录</p>
                <Button
                  variant="link"
                  onClick={() => setPurchaseDialogOpen(true)}
                  className="mt-2"
                >
                  立即购买溯源码
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>批次ID</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>型号</TableHead>
                    <TableHead>购买数量</TableHead>
                    <TableHead>已生成</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>购买时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.batch_id}</TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>{order.product_model || '-'}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.generated_count || 0}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 购买对话框 */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>购买溯源码</DialogTitle>
            <DialogDescription>
              创建新的溯源码批次购买订单
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="internalCode">企业内部编码 *</Label>
              <Input
                id="internalCode"
                value={newOrder.internalCode}
                onChange={(e) => setNewOrder({ ...newOrder, internalCode: e.target.value })}
                placeholder="如：PROD-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">产品名称 *</Label>
              <Input
                id="productName"
                value={newOrder.productName}
                onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                placeholder="如：智能手表"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productModel">产品型号</Label>
              <Input
                id="productModel"
                value={newOrder.productModel}
                onChange={(e) => setNewOrder({ ...newOrder, productModel: e.target.value })}
                placeholder="如：X100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">产品分类</Label>
              <Input
                id="category"
                value={newOrder.category}
                onChange={(e) => setNewOrder({ ...newOrder, category: e.target.value })}
                placeholder="如：电子产品"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">购买数量 *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handlePurchase} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  提交订单
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
