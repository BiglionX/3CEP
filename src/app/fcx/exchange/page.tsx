'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Search,
  ShoppingCart,
  Coins,
  Truck,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Package,
} from 'lucide-react';

interface Part {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  part_number: string | null;
  fcx_price: number;
  stock_quantity: number;
  unit: string;
  image_url: string | null;
}

interface CartItem extends Part {
  quantity: number;
  subtotal: number;
}

interface ExchangeOrder {
  id: string;
  order_number: string;
  total_fcx_cost: number;
  total_items: number;
  status: string;
  warehouse_name: string;
  estimated_delivery_time: number;
  created_at: string;
  items: Array<{
    part_id: string;
    part_name: string;
    quantity: number;
    fcx_unit_price: number;
    subtotal_fcx: number;
    status: string;
  }>;
}

const FcxExchangePage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFcxBalance, setUserFcxBalance] = useState(0);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  // 获取可兑换配件列表
  const fetchAvailableParts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parts/available?includeFcxPrice=true');
      const result = await response.json();

      if (result.success) {
        setParts(result.data);
      }
    } catch (error) {
      console.error('获取配件列表失败:', error);
      alert('获取配件列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取用户FCX余额
  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/fcx/accounts/balance');
      const result = await response.json();

      if (result.success) {
        setUserFcxBalance(result.data?.availableBalance || 0);
      }
    } catch (error) {
      console.error('获取FCX余额失败:', error);
    }
  };

  // 获取兑换历史
  const fetchExchangeHistory = async () => {
    try {
      const response = await fetch('/api/fcx/exchange?limit=10');
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('获取兑换历史失败:', error);
    }
  };

  // 添加到购物车
  const addToCart = (part: Part) => {
    const existingItem = cart.find(item => item.id === part.id);

    if (existingItem) {
      if (existingItem.quantity >= part.stock_quantity) {
        alert('库存不足');
        return;
      }
      setCart(
        cart.map(item =>
          item.id === part.id
             ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * part.fcx_price,
              }
            : item
        )
      );
    } else {
      setCart([...cart, { ...part, quantity: 1, subtotal: part.fcx_price }]);
    }

    alert(`${part.name} 已添加到购物车`);
  };

  // 从购物车移除
  const removeFromCart = (partId: string) => {
    setCart(cart.filter(item => item.id !== partId));
  };

  // 更新购物车数量
  const updateCartQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
      return;
    }

    const part = parts.find(p => p.id === partId);
    if (part && quantity > part.stock_quantity) {
      alert('超过库存数量');
      return;
    }

    setCart(
      cart.map(item =>
        item.id === partId ? { ...item, quantity, subtotal: quantity * item.fcx_price }
          : item
      )
    );
  };

  // 计算购物车总计
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  // 检查是否可以兑换
  const canCheckout = () => {
    return cart.length > 0 && calculateCartTotal() <= userFcxBalance;
  };

  // 执行兑换
  const handleCheckout = async () => {
    if (!canCheckout()) {
      alert('FCX余额不足或购物车为空');
      return;
    }

    try {
      const response = await fetch('/api/fcx/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repairShopId: 'current-repair-shop-id', // 实际应用中从上下文获取
          userId: 'current-user-id', // 实际应用中从认证获取
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            fcxPrice: item.fcx_price,
          })),
          shippingAddress: shippingAddress.nameshippingAddress:undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('兑换成功！');
        setCart([]); // 清空购物车
        setShowCheckoutDialog(false);
        fetchUserBalance(); // 更新余额
        fetchExchangeHistory(); // 刷新订单历史
      } else {
        alert(result.error || '兑换失败');
      }
    } catch (error) {
      console.error('兑换请求失败:', error);
      alert('兑换请求失败');
    }
  };

  // 获取订单状态标识
  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> =
      {
        pending: {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Package className="w-4 h-4 mr-1" />,
        },
        confirmed: {
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        },
        processing: {
          color: 'bg-purple-100 text-purple-800',
          icon: <Truck className="w-4 h-4 mr-1" />,
        },
        shipped: {
          color: 'bg-indigo-100 text-indigo-800',
          icon: <Truck className="w-4 h-4 mr-1" />,
        },
        delivered: {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        },
        cancelled: {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4 mr-1" />,
        },
        failed: {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4 mr-1" />,
        },
      };

    const statusText =
      {
        pending: '待处理',
        confirmed: '已确认',
        processing: '处理中',
        shipped: '已发货',
        delivered: '已送达',
        cancelled: '已取消',
        failed: '失败',
      }[status] || status;

    const config = statusMap[status] || {
      color: 'bg-gray-100 text-gray-800',
      icon: null,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {statusText}
      </span>
    );
  };

  // 筛选配件
  const filteredParts = parts.filter(part => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || part.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // 获取分类选项
  const categories = Array.from(new Set(parts.map(p => p.category))).filter(
    Boolean
  );

  useEffect(() => {
    fetchAvailableParts();
    fetchUserBalance();
    fetchExchangeHistory();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FCX配件兑换中心</h1>
        <p className="text-gray-600 mt-2">使用您的FCX积分兑换优质配件</p>

        {/* 用户信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">我的FCX余额</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userFcxBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">购物车商品</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cart.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">待处理订单</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      orders.filter(
                        o => o.status === 'pending' || o.status === 'processing'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 配件列表区域 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                可兑换配件
              </CardTitle>
              <CardDescription>浏览并选择您需要的配件</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索和筛选 */}
              <div className="flex flex-col flex:row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索配件名称、品牌或型号..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full w:48 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">全部分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* 配件列表 */}
              {loading  (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">加载中...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredParts.map(part => (
                    <Card
                      key={part.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {part.image_url  (
                            <img
                              src={part.image_url}
                              alt={part.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {part.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {part.brand} {part.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              型号: {part.part_number}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-yellow-600">
                                  {part.fcx_price.toLocaleString()} FCX
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  /{part.unit}
                                </span>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  库存: {part.stock_quantity}
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(part)}
                                  disabled={part.stock_quantity <= 0}
                                  className="mt-1"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  兑换
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredParts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无可兑换的配件</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 购物车区域 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                我的购物车
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0  (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">购物车是空的</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.brand} {item.model}
                          </p>
                          <div className="flex items-center mt-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {item.subtotal.toLocaleString()} FCX
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 mt-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">总计:</span>
                      <span className="font-bold text-lg text-yellow-600">
                        {calculateCartTotal().toLocaleString()} FCX
                      </span>
                    </div>

                    {!canCheckout() && cart.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">
                          FCX余额不足，当前余额{' '}
                          {userFcxBalance.toLocaleString()} FCX
                        </p>
                      </div>
                    )}

                    <Dialog
                      open={showCheckoutDialog}
                      onOpenChange={setShowCheckoutDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          disabled={!canCheckout()}
                          onClick={() => setShowCheckoutDialog(true)}
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          立即兑换
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>确认兑换信息</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">兑换详情</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>商品数量:</span>
                                <span>
                                  {cart.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                  )}{' '}
                                  件
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>消耗FCX:</span>
                                <span className="font-bold text-yellow-600">
                                  {calculateCartTotal().toLocaleString()} FCX
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>剩余余额:</span>
                                <span>
                                  {(
                                    userFcxBalance - calculateCartTotal()
                                  ).toLocaleString()}{' '}
                                  FCX
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">收货地址</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="收货人姓名"
                                value={shippingAddress.name}
                                onChange={e =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    name: e.target.value,
                                  })
                                }
                              />
                              <Input
                                placeholder="联系电话"
                                value={shippingAddress.phone}
                                onChange={e =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    phone: e.target.value,
                                  })
                                }
                              />
                              <Input
                                placeholder="详细地址"
                                value={shippingAddress.address}
                                onChange={e =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    address: e.target.value,
                                  })
                                }
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="城市"
                                  value={shippingAddress.city}
                                  onChange={e =>
                                    setShippingAddress({
                                      ...shippingAddress,
                                      city: e.target.value,
                                    })
                                  }
                                />
                                <Input
                                  placeholder="邮编"
                                  value={shippingAddress.postalCode}
                                  onChange={e =>
                                    setShippingAddress({
                                      ...shippingAddress,
                                      postalCode: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            onClick={handleCheckout}
                            disabled={
                              !shippingAddress.name || !shippingAddress.phone
                            }
                          >
                            确认兑换
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 兑换历史 */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              兑换历史
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无兑换记录</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>商品数量</TableHead>
                    <TableHead>消耗FCX</TableHead>
                    <TableHead>仓库</TableHead>
                    <TableHead>预计送达</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>下单时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.total_items} 件</TableCell>
                      <TableCell className="font-medium text-yellow-600">
                        {order.total_fcx_cost.toLocaleString()} FCX
                      </TableCell>
                      <TableCell>{order.warehouse_name}</TableCell>
                      <TableCell>
                        {order.estimated_delivery_time} 小时
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FcxExchangePage;
