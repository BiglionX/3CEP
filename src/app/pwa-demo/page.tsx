/**
 * PWA功能演示页面
 * 展示渐进式Web应用的各项特性和功能
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Wifi,
  WifiOff,
  CheckCircle,
  Bell,
  Cloud,
  Zap,
  Shield,
  Star,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// 模拟通知数据
const mockNotifications = [
  {
    id: 1,
    title: '系统更新',
    message: '新版本已发布，请及时更新',
    time: '2小时前',
    read: false,
  },
{
    id: 2,
    title: '订单提醒',
    message: '您有一个新的采购订单需要处理',
    time: '5小时前',
    read: true,
  },
{
    id: 3,
    title: '库存预警',
    message: '部分商品库存不足，请及时补货',
    time: '1天前',
    read: false,
  },
];

export default function PWADemoPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
  });
  const [simulateOffline, setSimulateOffline] = useState(false);

  // 模拟 PWA 状态
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // 模拟安装函数
  const install = () => {
    console.log('模拟安装 PWA 应用');
    setIsInstalled(true);
    setCanInstall(false);
  };

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 模拟离线模式
  useEffect(() => {
    if (simulateOffline) {
      // 模拟断网效果
      const originalFetch = window.fetch;
      window.fetch = function (...args: any[]) {
        return Promise.reject(new Error('Network error - simulated offline'));
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [simulateOffline]);

  // 添加测试通知
  const addTestNotification = () => {
    if (newNotification.title && newNotification.message) {
      const notification = {
        id: Date.now(),
        title: newNotification.title,
        message: newNotification.message,
        time: '刚刚',
        read: false,
      };

      setNotifications([notification, ...notifications]);
      setNewNotification({ title: '', message: '' });

      // 如果应用已安装，尝试发送推送通知
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then((registration: any) => {
          registration.postMessage({
            type: 'TEST_NOTIFICATION',
            data: notification,
          });
        });
      }
    }
  };

  // 标记通知为已读
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id  { ...notif, read: true } : notif
      )
    );
  };

  // 清除所有通知
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">"
      <div className="max-w-7xl mx-auto">"
        <div className="mb-8">"
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PWA功能演示</h1>"
          <p className="text-gray-600">
            体验渐进式Web应用的强大功能和原生应用般的体验
          </p>
        </div>
"
        <Tabs defaultValue="features" className="space-y-6">"
          <TabsList className="grid w-full grid-cols-4">"
            <TabsTrigger value="features">核心特性</TabsTrigger>"
            <TabsTrigger value="manager">状态管理</TabsTrigger>"
            <TabsTrigger value="notifications">推送通知</TabsTrigger>"
            <TabsTrigger value="offline">离线功能</TabsTrigger>
          </TabsList>

          {/* 核心特性面*/}"
          <TabsContent value="features" className="space-y-6">"
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-blue-100 rounded-lg">"
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>一键安装</CardTitle>
                  </div>
                  <CardDescription>
                    将Web应用安装到设备桌面，享受原生应用体验
                  </CardDescription>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">添加到主屏幕</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">全屏运行模式</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">无地址栏干扰</span>
                    </div>
                  </div>

                  {canInstall && (
                    <Button
                      onClick={install}"
                      className="w-full mt-4""
                      variant="secondary"
                    >"
                      <Download className="h-4 w-4 mr-2" />
                      立即安装
                    </Button>
                  )}
                </CardContent>
              </Card>
"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-green-100 rounded-lg">"
                      <Wifi className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>离线工作</CardTitle>
                  </div>
                  <CardDescription>
                    即使在网络不稳定的情况下也能正常使用核心功能
                  </CardDescription>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">页面缓存</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">数据预加载</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">断网友好提示</span>
                    </div>
                  </div>
"
                  <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">"
                    <span className="text-sm">当前网络状</span>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                      {isOnline ? '在线' : '离线'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-purple-100 rounded-lg">"
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>推送通知</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">实时消息推送</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">个性化提醒</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">后台同步</span>
                    </div>
                  </div>

                  <Button"
                    className="w-full mt-4""
                    variant="outline"
                    onClick={() => {
                      if (Notification.permission !== 'granted') {
                        Notification.requestPermission();
                      }
                    }}
                  >"
                    <Bell className="h-4 w-4 mr-2" />
                    请求通知权限
                  </Button>
                </CardContent>
              </Card>
"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-yellow-100 rounded-lg">"
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle>快速启动</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">秒开体验</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">流畅动画</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">响应式设计</span>
                    </div>
                  </div>
"
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">"
                    <div className="flex items-center gap-2 text-yellow-800">"
                      <Star className="h-4 w-4" />"
                      <span className="text-sm font-medium">
                        安装后启动速度提升80%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-red-100 rounded-lg">"
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle>安全保障</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">HTTPS加密传输</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">数据本地存储</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">隐私保护</span>
                    </div>
                  </div>
"
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">"
                    <div className="flex items-center gap-2 text-red-800">"
                      <Shield className="h-4 w-4" />"
                      <span className="text-sm font-medium">
                        企业级安全标                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
"
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>"
                  <div className="flex items-center gap-3">"
                    <div className="p-2 bg-indigo-100 rounded-lg">"
                      <Cloud className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle>云端同步</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>"
                  <div className="space-y-3">"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">多设备数据同步</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">自动备份恢复</span>
                    </div>"
                    <div className="flex items-center gap-2">"
                      <CheckCircle className="h-4 w-4 text-green-500" />"
                      <span className="text-sm">增量更新</span>
                    </div>
                  </div>
"
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">"
                    <div className="flex items-center gap-2 text-indigo-800">"
                      <Cloud className="h-4 w-4" />"
                      <span className="text-sm font-medium">实时云端协作</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 安装状态卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>安装状态</CardTitle>
                <CardDescription>当前应用的安装和运行状态</CardDescription>
              </CardHeader>
              <CardContent>"
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">"
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>"
                      <div className="font-medium">安装状态</div>"
                      <div className="text-sm text-gray-600">
                        应用是否已安装
                      </div>
                    </div>
                    <Badge variant={isInstalled ? 'default' : 'secondary'}>
                      {isInstalled ? '已安装' : 'Web版本'}
                    </Badge>
                  </div>
"
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>"
                      <div className="font-medium">可安装</div>"
                      <div className="text-sm text-gray-600">是否支持安装</div>
                    </div>
                    <Badge variant={canInstall ? 'default' : 'secondary'}>
                      {canInstall ? '可安装' : '暂不支持'}
                    </Badge>
                  </div>
"
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>"
                      <div className="font-medium">网络状态</div>"
                      <div className="text-sm text-gray-600">当前连接状态</div>
                    </div>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                      {isOnline ? '在线' : '离线'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 状态管理面板 */}"
          <TabsContent value="manager">
            <Card>
              <CardHeader>
                <CardTitle>PWA 状态管理</CardTitle>
                <CardDescription>当前 PWA 应用的运行状态</CardDescription>
              </CardHeader>
              <CardContent>"
                <div className="space-y-4">"
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>"
                      <div className="font-medium">安装状态</div>"
                      <div className="text-sm text-gray-600">应用是否已安装</div>
                    </div>
                    <Badge variant={isInstalled ? 'default' : 'secondary'}>
                      {isInstalled ? '已安装' : 'Web版本'}
                    </Badge>
                  </div>
"
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>"
                      <div className="font-medium">网络状态</div>"
                      <div className="text-sm text-gray-600">当前连接状态</div>
                    </div>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                      {isOnline ? '在线' : '离线'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 推送通知面板 */}"
          <TabsContent value="notifications" className="space-y-6">"
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">"
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>"
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>通知管理</CardTitle>
                        <CardDescription>查看和管理应用通知</CardDescription>
                      </div>
                      <Button"
                        variant="outline"
                        onClick={clearAllNotifications}
                        disabled={notifications.length === 0}
                      >
                        清除所有
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {notifications.length === 0 ? ("
                      <div className="text-center py-12 text-gray-500">"
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无通知</p>
                      </div>
                    ) : ("
                      <div className="space-y-3">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-colors ${
                              notification.read
                                 'bg-gray-50 border-gray-200'
                                : 'bg-blue-50 border-blue-200'`
                            }`}
                          >"
                            <div className="flex items-start justify-between">"
                              <div className="flex-1">"
                                <div className="flex items-center gap-2 mb-1">"
                                  <h3 className="font-medium">
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <Badge"
                                      variant="default""
                                      className="h-2 w-2 p-0"
                                    ></Badge>
                                  )}
                                </div>"
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>"
                                <p className="text-xs text-gray-400">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <Button"
                                  variant="ghost""
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  标记为已读
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>发送测试通知</CardTitle>
                    <CardDescription>创建自定义通知进行测试</CardDescription>
                  </CardHeader>"
                  <CardContent className="space-y-4">
                    <div>"
                      <Label htmlFor="notification-title">标题</Label>
                      <Input"
                        id="notification-title"
                        value={newNotification.title}
                        onChange={e =>
                          setNewNotification({
                            ...newNotification,
                            title: e.target.value,
                          })
                        }
                        placeholder="输入通知标题"
                      />
                    </div>

                    <div>"
                      <Label htmlFor="notification-message">消息内容</Label>
                      <Textarea"
                        id="notification-message"
                        value={newNotification.message}
                        onChange={e =>
                          setNewNotification({
                            ...newNotification,
                            message: e.target.value,
                          })
                        }
                        placeholder="输入通知内容"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={addTestNotification}
                      disabled={
                        !newNotification.title || !newNotification.message
                      }"
                      className="w-full"
                    >"
                      <Bell className="h-4 w-4 mr-2" />
                      发送通知
                    </Button>
                  </CardContent>
                </Card>
"
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>预设通知模板</CardTitle>
                  </CardHeader>"
                  <CardContent className="space-y-3">
                    <Button"
                      variant="outline""
                      className="w-full"
                      onClick={() =>
                        setNewNotification({
                          title: '系统维护通知',
                          message:
                            '系统将于今晚02:00-04:00进行例行维护，请提前做好数据保存。',
                        })
                      }
                    >
                      系统维护
                    </Button>
                    <Button
                      variant="outline""
                      className="w-full"
                      onClick={() =>
                        setNewNotification({
                          title: '订单状态更新',
                          message:
                            '您的订单 #ORD-2024-001 已完成发货，预计明天送达。',
                        })
                      }
                    >
                      订单更新
                    </Button>
                    <Button
                      variant="outline""
                      className="w-full"
                      onClick={() =>
                        setNewNotification({
                          title: '库存预警',
                          message: '商品 SKU-001 库存低于安全线，请及时补货。',
                        })
                      }
                    >
                      库存预警
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 离线功能面板 */}
          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>离线功能测试</CardTitle>
                <CardDescription>模拟网络断开情况下的应用表现</CardDescription>
              </CardHeader>
              <CardContent>"
                <div className="space-y-6">"
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>"
                      <h3 className="font-medium">模拟离线模式</h3>"
                      <p className="text-sm text-gray-600">
                        启用后将模拟网络断开的情                      </p>
                    </div>
                    <Switch
                      checked={simulateOffline}
                      onCheckedChange={setSimulateOffline}
                    />
                  </div>

                  {simulateOffline && ("
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">"
                      <div className="flex items-center gap-2 text-red-800 mb-2">"
                        <WifiOff className="h-5 w-5" />"
                        <span className="font-medium">离线模式已启用</span>
                      </div>"
                      <p className="text-sm text-red-700">
                        现在所有的网络请求都会失败，您可以测试应用的离线功能表现。
                      </p>
                    </div>
                  )}
"
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button"
                      variant="outline"
                      onClick={() => {
                        fetch('/api/test')
                          .then(() => console.log('API调用成功'))
                          .catch(() => console.log('API调用失败（预期）'));
                      }}
                      disabled={!simulateOffline}
                    >
                      测试API调用
                    </Button>
                    <Button"
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      刷新页面
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
"
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>离线功能特性</CardTitle>
                </CardHeader>
                <CardContent>"
                  <ul className="space-y-3">"
                    <li className="flex items-start gap-3">"
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">页面缓存</div>"
                        <div className="text-sm text-gray-600">
                          已访问的页面可以离线查看
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">数据预加载</div>"
                        <div className="text-sm text-gray-600">
                          重要数据在联网时预先缓存
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">渐进式加载</div>"
                        <div className="text-sm text-gray-600">
                          网络恢复后自动同步数据
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">用户体验优化</div>"
                        <div className="text-sm text-gray-600">
                          离线时显示友好的提示信息
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最佳实践</CardTitle>
                </CardHeader>
                <CardContent>"
                  <ul className="space-y-3">"
                    <li className="flex items-start gap-3">"
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">缓存策略</div>"
                        <div className="text-sm text-gray-600">
                          合理设置缓存时间和更新频率
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">数据同步</div>"
                        <div className="text-sm text-gray-600">
                          实现后台数据同步机制
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">用户提示</div>"
                        <div className="text-sm text-gray-600">
                          清晰地告知用户当前网络状态
                        </div>
                      </div>
                    </li>"
                    <li className="flex items-start gap-3">"
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>"
                        <div className="font-medium">错误处理</div>"
                        <div className="text-sm text-gray-600">
                          优雅地处理网络错误情况
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

'"