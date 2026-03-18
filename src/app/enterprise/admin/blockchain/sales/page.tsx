'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  BarChart3,
  Blockchain,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  CreditCard,

  Users,
  TrendingUp,
  Plus,
  Filter,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  codeCount: number;
  price: number;
  features: string[];
  status: 'available' | 'unavailable';
  soldCount: number;
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

interface ProductStats {
  totalProducts: number;
  totalSold: number;
  totalRevenue: number;
}

interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  paidCount: number;
  completedCount: number;
  totalRevenue: number;
}

const mockMerchants = [
  { id: 'm001', name: '测试商户A' },
  { id: 'm002', name: '测试商户B' },
  { id: 'm003', name: '测试商户C' },
  { id: 'm004', name: '测试商户D' },
];

export default function BlockchainSalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // 创建订单对话框
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取产品
      const productsRes = await fetch('/api/enterprise/blockchain/products?type=products');
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data);
        setProductStats(productsData.stats);
      }

      // 获取订单
      const ordersRes = await fetch(`/api/enterprise/blockchain/products?type=orders&status=${orderStatusFilter}`);
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.data);
        setOrderStats(ordersData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderStatusFilter]);

  // 创建订单
  const handleCreateOrder = async () => {
    if (!selectedProduct || !selectedMerchant) return;

    setCreatingOrder(true);
    try {
      const merchant = mockMerchants.find(m => m.id === selectedMerchant);
      const response = await fetch('/api/enterprise/blockchain/products?type=orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          merchantId: selectedMerchant,
          merchantName: merchant?.name,
          quantity,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setCreateOrderOpen(false);
        setSelectedProduct(null);
        setSelectedMerchant('');
        setQuantity(1);
        fetchData();
      } else {
        alert(data.error || '创建订单失败');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setCreatingOrder(false);
    }
  };

  // 更新订单状态
  const handleUpdateOrder = async (orderId: string, action: 'pay' | 'complete' | 'cancel') => {
    try {
      const response = await fetch('/api/enterprise/blockchain/products?type=orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await response.json();

      if (data.success) {
        fetchData();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />待支付</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-700"><CreditCard className="h-3 w-3 mr-1" />已支付</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />已完成</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />已取消</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  区块链码销售管理
                </h1>
                <p className="text-gray-500 mt-1">
                  区块链码产品管理、购买订单处理
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      创建订单
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建订单</DialogTitle>
                      <DialogDescription>
                        为商户创建区块链码购买订单
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>选择产品</Label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          onChange={(e) => {
                            const product = products.find(p => p.id === e.target.value);
                            setSelectedProduct(product || null);
                          }}
                        >
                          <option value="">请选择产品</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.codeCount}码 ({product.price} ETH)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>选择商户</Label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={selectedMerchant}
                          onChange={(e) => setSelectedMerchant(e.target.value)}
                        >
                          <option value="">请选择商户</option>
                          {mockMerchants.map((merchant) => (
                            <option key={merchant.id} value={merchant.id}>
                              {merchant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>购买数量</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      {selectedProduct && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">单价:</span>
                            <span>{selectedProduct.price} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500">总价:</span>
                            <span className="font-bold text-purple-600">{selectedProduct.price * quantity} ETH</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateOrderOpen(false)}>
                        取消
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleCreateOrder}
                        disabled={creatingOrder || !selectedProduct || !selectedMerchant}
                      >
                        {creatingOrder ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            创建中...
                          </>
                        ) : (
                          '确认创建'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">产品总数</p>
                      <p className="text-xl font-bold">{productStats?.totalProducts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">已售出</p>
                      <p className="text-xl font-bold">{productStats?.totalSold || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">总收入</p>
                      <p className="text-xl font-bold">{productStats?.totalRevenue?.toFixed(2) || 0} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">待处理</p>
                      <p className="text-xl font-bold">{orderStats?.pendingCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab切换 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="products">产品列表</TabsTrigger>
                <TabsTrigger value="orders">订单管理</TabsTrigger>
              </TabsList>

              {/* 产品列表 */}
              <TabsContent value="products">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                            {product.status === 'available' ? '在售' : '停售'}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">码号数量</span>
                            <span className="font-semibold">{product.codeCount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">价格</span>
                            <span className="text-xl font-bold text-purple-600">{product.price} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">已售</span>
                            <span className="font-semibold">{product.soldCount}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500 mb-2">功能特点</p>
                            <div className="flex flex-wrap gap-1">
                              {product.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {product.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.features.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 订单管理 */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>订单列表</CardTitle>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                          className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="all">全部状态</option>
                          <option value="pending">待支付</option>
                          <option value="paid">已支付</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>订单号</TableHead>
                            <TableHead>产品</TableHead>
                            <TableHead>商户</TableHead>
                            <TableHead>数量</TableHead>
                            <TableHead>总价</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">{order.id}</TableCell>
                              <TableCell>{order.productName}</TableCell>
                              <TableCell>{order.merchantName}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell className="font-semibold">{order.totalPrice} ETH</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {order.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateOrder(order.id, 'pay')}
                                      >
                                        确认支付
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateOrder(order.id, 'cancel')}
                                      >
                                        取消
                                      </Button>
                                    </>
                                  )}
                                  {order.status === 'paid' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateOrder(order.id, 'complete')}
                                    >
                                      完成
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {orders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                暂无订单数据
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
