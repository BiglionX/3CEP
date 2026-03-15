/**
 * 用户行为追踪系统演示页面
 * 展示用户行为埋点和数据分析功 */

'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  MousePointer,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Navigation,
  Search,
  ShoppingCart,
  Heart,
  Share2,
  Download,
  Play,
  Pause,
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
import {
  useUserBehaviorTracking,
  usePageViewTracking,
  useClickTracking,
  useFormTracking,
  type UserBehaviorEvent,
  type EventType,
} from '@/hooks/use-behavior-tracking';

// 模拟数据分析
const mockAnalyticsData = {
  totalEvents: 1247,
  uniqueUsers: 89,
  avgSessionDuration: 342,
  bounceRate: 23.5,
  conversionRate: 12.8,
  popularPages: [
    { path: '/', views: 342, percentage: 27.4 },
    { path: '/products', views: 287, percentage: 23.0 },
    { path: '/about', views: 198, percentage: 15.9 },
    { path: '/contact', views: 156, percentage: 12.5 },
    { path: '/blog', views: 134, percentage: 10.7 },
  ],
  eventDistribution: [
    { type: 'page_view', count: 445, percentage: 35.7 },
    { type: 'click', count: 312, percentage: 25.0 },
    { type: 'scroll', count: 189, percentage: 15.2 },
    { type: 'form_submit', count: 98, percentage: 7.9 },
    { type: 'search', count: 76, percentage: 6.1 },
    { type: 'other', count: 127, percentage: 10.1 },
  ],
};

export default function UserBehaviorTrackingDemoPage() {
  const [trackedEvents, setTrackedEvents] = useState<UserBehaviorEvent[]>([]);
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);

  // 初始化行为追  const { trackEvent, getEvents, flush, getEventIcon } =
    useUserBehaviorTracking({
      enabled: isTrackingEnabled,
      debug: true,
      batchSize: 5,
      flushInterval: 3000,
      excludedPaths: ['/admin', '/private'],
    });

  // 页面浏览追踪
  usePageViewTracking();

  // 特定元素点击追踪
  useClickTracking('.trackable-button');
  useClickTracking('.navigation-link');

  // 表单提交追踪
  useFormTracking('form.tracking-form');

  // 更新事件列表
  useEffect(() => {
    const interval = setInterval(() => {
      const events = getEvents();
      setTrackedEvents(events.slice(-20)); // 只显示最0个事
      // 模拟数据分析更新
      if (events.length > 0) {
        setAnalyticsData(prev => ({
          ...prev,
          totalEvents: events.length,
          uniqueUsers: Math.floor(events.length / 14) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getEvents]);

  // 手动触发测试事件
  const triggerTestEvents = () => {
    // 触发各种类型的事    trackEvent('click', undefined, { test: 'manual-trigger' });
    trackEvent('search', undefined, { searchTerm: '测试搜索' });
    trackEvent('add_to_cart', undefined, {
      productId: 'test-001',
      productName: '测试商品',
    });
    trackEvent('share', undefined, { platform: 'wechat', content: '测试分享' });
  };

  // 清除所有事  const clearEvents = () => {
    setTrackedEvents([]);
    flush(); // 强制发送剩余事  };

  // 切换追踪状  const toggleTracking = () => {
    setIsTrackingEnabled(!isTrackingEnabled);
  };

  // 获取设备图标
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // 格式化时  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            用户行为追踪系统
          </h1>
          <p className="text-gray-600">实时监控和分析用户交互行/p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={toggleTracking}
            variant={isTrackingEnabled  'default' : 'outline'}
          >
            {isTrackingEnabled  '停止追踪' : '开始追}
          </Button>
          <Button onClick={triggerTestEvents} variant="secondary">
            触发测试事件
          </Button>
          <Button onClick={clearEvents} variant="outline">
            清除事件
          </Button>
          <Badge variant={isTrackingEnabled  'default' : 'secondary'}>
            {isTrackingEnabled  '追踪 : '已暂}
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">数据看板</TabsTrigger>
            <TabsTrigger value="events">事件列表</TabsTrigger>
            <TabsTrigger value="analytics">行为分析</TabsTrigger>
            <TabsTrigger value="test">互动测试</TabsTrigger>
          </TabsList>

          {/* 数据看板 */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总事件数
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.totalEvents}
                  </div>
                  <p className="text-xs text-muted-foreground">实时统计数据</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    独立用户
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.uniqueUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">当前会话用户</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    平均会话时长
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.avgSessionDuration}s
                  </div>
                  <p className="text-xs text-muted-foreground">用户停留时间</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">跳出/CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.bounceRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">单页访问比例</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    热门页面排行
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.popularPages.map((page, index) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-6">
                            #{index + 1}
                          </span>
                          <span className="text-sm truncate flex-1">
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {page.views}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({page.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    事件类型分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.eventDistribution.map(event => (
                      <div
                        key={event.type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-blue-500">
                            {getEventIcon(event.type as EventType)}
                          </div>
                          <span className="text-sm capitalize">
                            {event.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {event.count}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({event.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 事件列表 */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>实时事件/CardTitle>
                    <CardDescription>最近发生的用户行为事件</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {trackedEvents.length} 个事                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {trackedEvents.length === 0  (
                  <div className="text-center py-12 text-gray-500">
                    <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无事件记录</p>
                    <p className="text-sm mt-1">在页面上进行交互以生成事/p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[...trackedEvents].reverse().map(event => (
                      <div
                        key={event.eventId}
                        className="p-4 bg-gray-50 rounded-lg border text-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="text-blue-500">
                              {getEventIcon(event.eventType)}
                            </div>
                            <span className="font-medium capitalize">
                              {event.eventType.replace(/_/g, ' ')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.deviceType}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">页面:</span>{' '}
                            {event.path}
                          </div>
                          <div>
                            <span className="font-medium">位置:</span>
                            {event.x !== undefined && event.y !== undefined
                               `(${event.x}, ${event.y})`
                              : 'N/A'}
                          </div>
                          {event.elementText && (
                            <div className="col-span-2">
                              <span className="font-medium">元素:</span>{' '}
                              {event.elementText}
                            </div>
                          )}
                          {event.customData &&
                            Object.keys(event.customData).length > 0 && (
                              <div className="col-span-2">
                                <span className="font-medium">附加数据:</span>
                                {JSON.stringify(event.customData)}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 行为分析 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>用户画像</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">设备分布</span>
                        <span className="text-xs text-gray-500">占比</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">桌面/span>
                          </div>
                          <span className="text-sm">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-500" />
                            <span className="text-sm">移动/span>
                          </div>
                          <span className="text-sm">28%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tablet className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">平板/span>
                          </div>
                          <span className="text-sm">7%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">时段分布</span>
                        <span className="text-xs text-gray-500">活跃/span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>09:00-12:00</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>12:00-18:00</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: '85%' }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>18:00-22:00</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: '60%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>转化漏斗</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">页面浏览</span>
                        </div>
                        <span className="text-sm font-medium">1000</span>
                      </div>
                      <div className="h-1 bg-blue-200 rounded-full mx-3">
                        <div
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-4 w-4 text-green-500" />
                          <span className="text-sm">点击商品</span>
                        </div>
                        <span className="text-sm font-medium">750</span>
                      </div>
                      <div className="h-1 bg-green-200 rounded-full mx-3">
                        <div
                          className="h-1 bg-green-500 rounded-full"
                          style={{ width: '60%' }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">加入购物/span>
                        </div>
                        <span className="text-sm font-medium">450</span>
                      </div>
                      <div className="h-1 bg-yellow-200 rounded-full mx-3">
                        <div
                          className="h-1 bg-yellow-500 rounded-full"
                          style={{ width: '40%' }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-red-500" />
                          <span className="text-sm">完成购买</span>
                        </div>
                        <span className="text-sm font-medium">180</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          18%
                        </div>
                        <div className="text-sm text-gray-600">整体转化/div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>热门交互元素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">导航菜单</span>
                      </div>
                      <Badge variant="secondary">342次点/Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-green-500" />
                        <span className="text-sm">搜索/span>
                      </div>
                      <Badge variant="secondary">156次使/Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">收藏按钮</span>
                      </div>
                      <Badge variant="secondary">89次点/Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">分享按钮</span>
                      </div>
                      <Badge variant="secondary">67次分/Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-red-500" />
                        <span className="text-sm">下载链接</span>
                      </div>
                      <Badge variant="secondary">43次下/Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 互动测试 */}
          <TabsContent value="test" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>可追踪元/CardTitle>
                  <CardDescription>点击下面的按钮测试事件追/CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="trackable-button w-full" variant="default">
                    主要按钮 (已追
                  </Button>

                  <Button
                    className="trackable-button w-full"
                    variant="secondary"
                  >
                    次要按钮 (已追
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="trackable-button" size="sm">
                      小按
                    </Button>
                    <Button
                      className="trackable-button"
                      size="sm"
                      variant="outline"
                    >
                      小按
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">导航链接 (已追</h4>
                    <div className="space-y-1">
                      <a
                        href="#"
                        className="block text-sm text-blue-600 hover:underline navigation-link"
                      >
                        首页
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-blue-600 hover:underline navigation-link"
                      >
                        产品
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-blue-600 hover:underline navigation-link"
                      >
                        关于我们
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>表单追踪测试</CardTitle>
                  <CardDescription>提交表单测试事件追踪功能</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="tracking-form space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        姓名
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入姓
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        邮箱
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入邮
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        留言
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入留言内容"
                      ></textarea>
                    </div>

                    <Button type="submit" className="w-full">
                      提交表单
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>追踪配置</CardTitle>
                <CardDescription>当前追踪系统的配置状/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">追踪状/span>
                      <Badge
                        variant={isTrackingEnabled  'default' : 'secondary'}
                      >
                        {isTrackingEnabled  '启用' : '禁用'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">调试模式</span>
                      <Badge variant="secondary">启用</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">批处理大/span>
                      <Badge variant="secondary">5个事/Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">刷新间隔</span>
                      <Badge variant="secondary">3/Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">匿名化IP</span>
                      <Badge variant="default">启用</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">尊重DNT</span>
                      <Badge variant="default">启用</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cookie同意</span>
                      <Badge variant="secondary">不需/Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">数据端点</span>
                      <Badge variant="secondary">/api/analytics/events</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

