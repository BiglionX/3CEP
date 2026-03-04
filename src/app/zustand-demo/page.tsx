/**
 * Zustand状态管理演示页? * 展示现代化状态管理的各种功能和优? */

'use client';

import { useState, useEffect } from 'react';
import {
  Database,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Plus,
  Minus,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Grid,
  List,
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGlobalStore,
  useUser,
  useCart,
  useNotifications,
  useProducts,
  useUI,
  useAuth,
  useCartActions,
  useNotificationActions,
} from '@/stores/enhanced-zustand';

// 模拟产品数据
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    category: 'electronics',
    image: 'https://placehold.co/200x200',
    inStock: true,
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    price: 8999,
    category: 'electronics',
    image: 'https://placehold.co/200x200',
    inStock: true,
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 1899,
    category: 'electronics',
    image: 'https://placehold.co/200x200',
    inStock: false,
  },
];

export default function ZustandDemoPage() {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // 使用各种状态钩?  const user = useUser();
  const cart = useCart();
  const notifications = useNotifications();
  const products = useProducts();
  const ui = useUI();

  // 使用动作钩子
  const { setUser, clearUser } = useAuth();
  const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } =
    useCartActions();
  const {
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
  } = useNotificationActions();

  // 使用全局store
  const {
    toggleSidebar,
    setTheme,
    setLoading,
    updateProductFilters,
    setSearchQuery,
    setViewMode,
    toggleProductSelection,
  } = useGlobalStore();

  // 模拟登录
  const handleLogin = () => {
    setUser({
      id: 'user123',
      email: 'user@example.com',
      name: '张三',
      avatar: 'https://placehold.co/100x100',
      roles: ['user'],
      permissions: ['read_products', 'manage_cart'],
      isAuthenticated: true,
      lastLogin: new Date(),
    });

    addNotification({
      title: '登录成功',
      message: '欢迎回来，张三！',
      type: 'success',
    });
  };

  // 模拟登出
  const handleLogout = () => {
    clearUser();
    addNotification({
      title: '退出登?,
      message: '您已成功退出登?,
      type: 'info',
    });
  };

  // 添加商品到购物车
  const handleAddToCart = (product: (typeof mockProducts)[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    addNotification({
      title: '添加成功',
      message: `${product.name} 已添加到购物车`,
      type: 'success',
    });
  };

  // 添加自定义商?  const handleAddCustomProduct = () => {
    if (newProductName && newProductPrice) {
      addToCart({
        productId: `custom_${Date.now()}`,
        name: newProductName,
        price: parseFloat(newProductPrice),
        quantity: 1,
      });

      setNewProductName('');
      setNewProductPrice('');

      addNotification({
        title: '自定义商品添加成?,
        message: `${newProductName} 已添加到购物车`,
        type: 'success',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Zustand状态管理演?          </h1>
          <p className="text-gray-600">
            体验现代化的状态管理模式，支持持久化、中间件和DevTools
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="user">用户状?/TabsTrigger>
            <TabsTrigger value="cart">购物?/TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="products">产品管理</TabsTrigger>
          </TabsList>

          {/* 概览面板 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    用户状?                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.isAuthenticated ? '已登? : '未登?}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.name || '访客'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">购物?/CardTitle>
                  <ShoppingCart className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cart.totalItems}</div>
                  <p className="text-xs text-muted-foreground">
                    总价: ¥{cart.totalPrice.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">通知</CardTitle>
                  <Bell className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.unreadCount}
                  </div>
                  <p className="text-xs text-muted-foreground">未读通知</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">UI设置</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {ui.theme}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ui.sidebarCollapsed ? '侧边栏折? : '侧边栏展开'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>快速操?/CardTitle>
                  <CardDescription>常用状态管理操?/CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLogin}
                      disabled={user.isAuthenticated}
                      className="flex-1"
                    >
                      模拟登录
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      disabled={!user.isAuthenticated}
                      className="flex-1"
                    >
                      登出
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleSidebar()}
                      variant="secondary"
                      className="flex-1"
                    >
                      切换侧边?                    </Button>
                    <Button
                      onClick={() => setLoading(!ui.loading)}
                      variant="secondary"
                      className="flex-1"
                    >
                      {ui.loading ? '停止加载' : '开始加?}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>主题设置</CardTitle>
                  <CardDescription>切换应用主题模式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-light">浅色模式</Label>
                    <Button
                      variant={ui.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      浅色
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-dark">深色模式</Label>
                    <Button
                      variant={ui.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      深色
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-system">跟随系统</Label>
                    <Button
                      variant={ui.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      系统
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 用户状态面?*/}
          <TabsContent value="user" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户状态详?/CardTitle>
                <CardDescription>当前用户的认证和权限信息</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 购物车面?*/}
          <TabsContent value="cart" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>购物车商?/CardTitle>
                    <CardDescription>管理购物车中的商?/CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cart.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        购物车为?                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-500">
                                  ¥{item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {cart.items.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">总计:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ¥{cart.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          onClick={clearCart}
                          variant="outline"
                          className="w-full mt-4"
                        >
                          清空购物?                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>添加自定义商?/CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">商品名称</Label>
                        <Input
                          id="product-name"
                          value={newProductName}
                          onChange={e => setNewProductName(e.target.value)}
                          placeholder="输入商品名称"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-price">价格</Label>
                        <Input
                          id="product-price"
                          type="number"
                          value={newProductPrice}
                          onChange={e => setNewProductPrice(e.target.value)}
                          placeholder="输入价格"
                        />
                      </div>
                      <Button
                        onClick={handleAddCustomProduct}
                        disabled={!newProductName || !newProductPrice}
                        className="w-full"
                      >
                        添加到购物车
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>推荐商品</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockProducts.map(product => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          ¥{product.price.toFixed(2)}
                        </p>
                        <Badge
                          variant={product.inStock ? 'default' : 'secondary'}
                          className="mt-2"
                        >
                          {product.inStock ? '有库? : '缺货'}
                        </Badge>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className="w-full mt-3"
                          size="sm"
                        >
                          添加到购物车
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 通知面板 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>通知管理</CardTitle>
                    <CardDescription>查看和管理系统通知</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={markAllNotificationsAsRead}
                      variant="outline"
                      size="sm"
                      disabled={notifications.unreadCount === 0}
                    >
                      全部标记为已?                    </Button>
                    <Button
                      onClick={() =>
                        useGlobalStore.getState().clearAllNotifications()
                      }
                      variant="outline"
                      size="sm"
                    >
                      清空所有通知
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无通知</div>
                ) : (
                  <div className="space-y-3">
                    {notifications.notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read
                            ? 'bg-gray-50'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge
                                  variant="default"
                                  className="h-2 w-2 p-0"
                                ></Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                              >
                                标记为已?                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeNotification(notification.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>添加测试通知</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() =>
                      addNotification({
                        title: '信息通知',
                        message: '这是一条普通的信息通知',
                        type: 'info',
                      })
                    }
                  >
                    添加信息通知
                  </Button>
                  <Button
                    onClick={() =>
                      addNotification({
                        title: '成功通知',
                        message: '操作执行成功?,
                        type: 'success',
                      })
                    }
                    variant="secondary"
                  >
                    添加成功通知
                  </Button>
                  <Button
                    onClick={() =>
                      addNotification({
                        title: '警告通知',
                        message: '请注意潜在的风险',
                        type: 'warning',
                      })
                    }
                    variant="outline"
                  >
                    添加警告通知
                  </Button>
                  <Button
                    onClick={() =>
                      addNotification({
                        title: '错误通知',
                        message: '发生了一个错误，请检?,
                        type: 'error',
                      })
                    }
                    variant="destructive"
                  >
                    添加错误通知
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品管理面板 */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>产品筛选和搜索</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>搜索商品</Label>
                        <Input
                          value={products.searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="输入商品名称..."
                        />
                      </div>

                      <div>
                        <Label>分类筛?/Label>
                        <Select
                          value={products.filters.category || ''}
                          onValueChange={value =>
                            updateProductFilters({
                              category: value || undefined,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">全部分类</SelectItem>
                            <SelectItem value="electronics">
                              电子产品
                            </SelectItem>
                            <SelectItem value="clothing">服装</SelectItem>
                            <SelectItem value="books">图书</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label>显示模式</Label>
                        <Button
                          variant={
                            products.viewMode === 'grid' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid className="h-4 w-4 mr-2" />
                          网格
                        </Button>
                        <Button
                          variant={
                            products.viewMode === 'list' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-4 w-4 mr-2" />
                          列表
                        </Button>
                      </div>

                      <div className="text-sm text-gray-500">
                        已选中 {products.selectedProducts.length} 个商?                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>产品列表</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={
                        products.viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                          : 'space-y-3'
                      }
                    >
                      {mockProducts.map(product => (
                        <div
                          key={product.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            products.selectedProducts.includes(product.id)
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleProductSelection(product.id)}
                        >
                          <div className="flex items-start space-x-3">
                            {products.viewMode === 'list' && (
                              <div className="flex items-center h-5">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    products.selectedProducts.includes(
                                      product.id
                                    )
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {products.selectedProducts.includes(
                                    product.id
                                  ) && (
                                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{product.name}</h3>
                                <Badge
                                  variant={
                                    product.inStock ? 'default' : 'secondary'
                                  }
                                >
                                  {product.inStock ? '有库? : '缺货'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                ¥{product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                分类: {product.category}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>筛选条?/CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>价格范围</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          type="number"
                          placeholder="最低价"
                          value={products.filters.minPrice || ''}
                          onChange={e =>
                            updateProductFilters({
                              minPrice: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="最高价"
                          value={products.filters.maxPrice || ''}
                          onChange={e =>
                            updateProductFilters({
                              maxPrice: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>排序方式</Label>
                      <Select
                        value={products.filters.sortBy || ''}
                        onValueChange={value =>
                          updateProductFilters({
                            sortBy: value as any,
                            sortOrder: products.filters.sortOrder || 'asc',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择排序字段" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">价格</SelectItem>
                          <SelectItem value="name">名称</SelectItem>
                          <SelectItem value="date">日期</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>排序顺序</Label>
                      <Select
                        value={products.filters.sortOrder || 'asc'}
                        onValueChange={value =>
                          updateProductFilters({
                            sortOrder: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择排序顺序" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">升序</SelectItem>
                          <SelectItem value="desc">降序</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>仅显示有库存</Label>
                      <Switch
                        checked={products.filters.inStock || false}
                        onCheckedChange={checked =>
                          updateProductFilters({ inStock: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

