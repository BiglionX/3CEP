'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Wallet,
  Users,
  TrendingUp,
  Plus,
  Filter,
  Search,
  ExternalLink,
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

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  
  // 购买对话框
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

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

      // 获取订单（模拟当前商户）
      const ordersRes = await fetch('/api/enterprise/blockchain/products?type=orders');
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        // 过滤当前商户的订单（模拟）
        const merchantOrders = ordersData.data.filter((o: Order) => o.merchantId === 'm001');
        setOrders(merchantOrders);
        setOrderStats({
          ...ordersData.stats,
          totalOrders: merchantOrders.length,
        });
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

  // 购买
  const handlePurchase = async () => {
    if (!selectedProduct) return;

    setPurchasing(true);
    try {
      const response = await fetch('/api/enterprise/blockchain/products?type=orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          merchantId: 'm001', // 模拟当前商户
          merchantName: '当前商户',
          quantity,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setPurchaseDialogOpen(false);
        setSelectedProduct(null);
        setQuantity(1);
        fetchData();
      } else {
        alert(data.error || '购买失败');
      }
    } catch (error) {
      console.error('Failed to purchase:', error);
    } finally {
      setPurchasing(false);
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
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  购买区块链码
                </h1>
                <p className="text-gray-500 mt-1">
                  选择适合您的区块链码产品
                </p>
              </div>
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
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
                      <p className="text-sm text-gray-500">可购产品</p>
                      <p className="text-xl font-bold">{productStats?.totalProducts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">我的订单</p>
                      <p className="text-xl font-bold">{orderStats?.totalOrders || 0}</p>
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
                      <p className="text-sm text-gray-500">待支付</p>
                      <p className="text-xl font-bold">{orderStats?.pendingCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">总消费</p>
                      <p className="text-xl font-bold">{orderStats?.totalRevenue?.toFixed(2) || 0} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab切换 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="products">产品列表</TabsTrigger>
                <TabsTrigger value="orders">我的订单</TabsTrigger>
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
                          <Dialog 
                            open={purchaseDialogOpen && selectedProduct?.id === product.id}
                            onOpenChange={(open) => {
                              setPurchaseDialogOpen(open);
                              if (open) setSelectedProduct(product);
                              else setSelectedProduct(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                disabled={product.status !== 'available'}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                立即购买
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>确认购买</DialogTitle>
                                <DialogDescription>
                                  购买 {product.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">产品:</span>
                                    <span className="font-medium">{product.name}</span>
                                  </div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">单价:</span>
                                    <span>{product.price} ETH</span>
                                  </div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">码号数量:</span>
                                    <span>{product.codeCount.toLocaleString()}</span>
                                  </div>
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
                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <div className="flex justify-between text-lg font-bold">
                                    <span>总价:</span>
                                    <span className="text-purple-600">{product.price * quantity} ETH</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                                  <Wallet className="h-4 w-4" />
                                  支付将扣除您的钱包余额
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                                  取消
                                </Button>
                                <Button
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={handlePurchase}
                                  disabled={purchasing}
                                >
                                  {purchasing ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      处理中...
                                    </>
                                  ) : (
                                    <>
                                      <Wallet className="h-4 w-4 mr-2" />
                                      确认支付
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 我的订单 */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>我的订单</CardTitle>
                    <CardDescription>
                      您的购买订单记录
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                order.status === 'completed' ? 'bg-green-100' :
                                order.status === 'paid' ? 'bg-blue-100' :
                                order.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                              }`}>
                                {order.status === 'completed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : order.status === 'paid' ? (
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                ) : order.status === 'pending' ? (
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{order.productName}</p>
                                <p className="text-sm text-gray-500">
                                  数量: {order.quantity} | 订单号: {order.id}
                                </p>
                                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-purple-600">{order.totalPrice} ETH</p>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">暂无订单记录</p>
                        <Button 
                          className="mt-4 bg-purple-600 hover:bg-purple-700"
                          onClick={() => setActiveTab('products')}
                        >
                          去看看产品
                        </Button>
                      </div>
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
