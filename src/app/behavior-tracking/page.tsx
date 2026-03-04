/**
 * 用户行为追踪监控面板
 * 实时显示和分析用户行为数? */

'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Eye,
  MousePointer,
  Scroll,
  BarChart3,
  Filter,
  RefreshCw,
  Clock,
  Users,
  Globe,
  Smartphone,
  Monitor,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useBehaviorTracker } from '@/modules/data-center/analytics/behavior-tracker';

interface BehaviorEvent {
  id: string;
  type: string;
  timestamp: number;
  url: string;
  pageTitle: string;
  userAgent: string;
  screenSize: string;
  viewportSize: string;
  userId?: string;
  sessionId: string;
  element?: string;
  elementId?: string;
  coordinates?: { x: number; y: number };
  scrollDepth?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface BehaviorSummary {
  totalEvents: number;
  uniqueSessions: number;
  uniqueUsers: number;
  eventTypeDistribution: Record<string, number>;
  popularPages: Record<string, number>;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export default function BehaviorTrackingDashboard() {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [summary, setSummary] = useState<BehaviorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: 'all',
    sessionId: '',
    dateRange: '24h',
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // 初始化行为追?  const { trackEvent, trackCustomEvent, setUser, flush } = useBehaviorTracker({
    batchSize: 5,
    batchInterval: 3000,
    captureScroll: true,
    captureClicks: true,
    captureForms: true,
    captureErrors: true,
  });

  // 设置当前用户（演示用?  useEffect(() => {
    setUser(`demo_user_${Math.random().toString(36).substr(2, 9)}`);
  }, [setUser]);

  // 获取行为数据
  const fetchBehaviorData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.eventType !== 'all') {
        params.append('eventType', filters.eventType);
      }
      if (filters.sessionId) {
        params.append('sessionId', filters.sessionId);
      }

      // 根据时间范围设置日期
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      params.append('startDate', startDate.toISOString());
      params.append('limit', '100');

      const response = await fetch(`/api/analytics/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch behavior data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 实时更新
  useEffect(() => {
    fetchBehaviorData();

    if (realTimeEnabled) {
      const interval = setInterval(fetchBehaviorData, 5000);
      return () => clearInterval(interval);
    }
  }, [filters, realTimeEnabled]);

  // 事件类型映射
  const eventTypeIcons: Record<string, JSX.Element> = {
    page_view: <Eye className="w-4 h-4" />,
    click: <MousePointer className="w-4 h-4" />,
    scroll: <Scroll className="w-4 h-4" />,
    form_submit: <Activity className="w-4 h-4" />,
    search: <Activity className="w-4 h-4" />,
    navigation: <Activity className="w-4 h-4" />,
    error: <Activity className="w-4 h-4" />,
    custom: <Activity className="w-4 h-4" />,
  };

  const eventTypeLabels: Record<string, string> = {
    page_view: '页面浏览',
    click: '点击',
    scroll: '滚动',
    form_submit: '表单提交',
    search: '搜索',
    navigation: '导航',
    error: '错误',
    custom: '自定?,
  };

  // 设备类型识别
  const getDeviceType = (userAgent: string) => {
    if (/mobile|android|iphone|ipad|iemobile/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  };

  // 屏幕尺寸解析
  const parseScreenSize = (size: string) => {
    const [width, height] = size.split('x').map(Number);
    if (width < 768) return 'small';
    if (width < 1024) return 'medium';
    return 'large';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                用户行为追踪监控
              </h1>
              <p className="text-gray-600 mt-2">
                实时监控和分析用户在应用中的行为模式
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={realTimeEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${realTimeEnabled ? 'animate-spin' : ''}`}
                />
                {realTimeEnabled ? '实时更新' : '手动刷新'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchBehaviorData}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                刷新
              </Button>
            </div>
          </div>
        </div>

        {/* 统计概览卡片 */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  总事件数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {summary.totalEvents}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  活跃会话
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {summary.uniqueSessions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  独立用户
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {summary.uniqueUsers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  时间范围
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {new Date(summary.dateRange.start).toLocaleDateString()} -{' '}
                  {new Date(summary.dateRange.end).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 过滤器和控制面板 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              数据过滤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  事件类型
                </label>
                <Select
                  value={filters.eventType}
                  onValueChange={value =>
                    setFilters({ ...filters, eventType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  会话ID
                </label>
                <Input
                  placeholder="输入会话ID"
                  value={filters.sessionId}
                  onChange={e =>
                    setFilters({ ...filters, sessionId: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  时间范围
                </label>
                <Select
                  value={filters.dateRange}
                  onValueChange={value =>
                    setFilters({ ...filters, dateRange: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">最?小时</SelectItem>
                    <SelectItem value="24h">最?4小时</SelectItem>
                    <SelectItem value="7d">最?�?/SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchBehaviorData}
                  className="w-full"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  应用过滤
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 事件类型分布 */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  事件类型分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(summary.eventTypeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([eventType, count]) => (
                      <div
                        key={eventType}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {eventTypeIcons[eventType] || (
                            <Activity className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {eventTypeLabels[eventType] || eventType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count / summary.totalEvents) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>热门页面</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(summary.popularPages)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([url, count]) => (
                      <div
                        key={url}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {url}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {new URL(url, 'http://localhost').pathname}
                          </div>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 实时事件列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              实时事件?              {loading && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </CardTitle>
            <CardDescription>最近发生的用户行为事件</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无行为事件数据</p>
                <p className="text-sm mt-1">在页面上进行一些操作来生成事件</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {eventTypeIcons[event.type] || (
                              <Activity className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                              {eventTypeLabels[event.type] || event.type}
                            </span>
                          </div>

                          {getDeviceType(event.userAgent) === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-green-500" />
                          ) : getDeviceType(event.userAgent) === 'tablet' ? (
                            <Monitor className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Monitor className="w-4 h-4 text-gray-500" />
                          )}

                          {parseScreenSize(event.screenSize) === 'small' && (
                            <Badge variant="outline" className="text-xs">
                              小屏
                            </Badge>
                          )}
                          {parseScreenSize(event.screenSize) === 'large' && (
                            <Badge variant="outline" className="text-xs">
                              大屏
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">页面:</span>{' '}
                          {event.pageTitle}
                        </div>
                        <div className="text-xs text-gray-500 mb-2 truncate">
                          {event.url}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            会话: {event.sessionId.substr(0, 8)}...
                          </span>
                          {event.userId && (
                            <span>用户: {event.userId.substr(0, 8)}...</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {event.coordinates && (
                          <div className="text-xs text-gray-500 mt-1">
                            坐标: ({event.coordinates.x}, {event.coordinates.y})
                          </div>
                        )}

                        {event.scrollDepth !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            滚动深度: {event.scrollDepth}%
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <div>{event.screenSize}</div>
                        <div>{event.viewportSize}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 演示操作区域 */}
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-medium mb-4">演示操作区域</h3>
          <p className="text-gray-600 mb-4">
            在下面进行各种操作来测试行为追踪功能?          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                trackCustomEvent('demo_button_click', {
                  button: 'primary_action',
                });
              }}
            >
              点击测试按钮
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                trackCustomEvent('demo_form_interaction', {
                  field: 'test_input',
                  value_length: Math.floor(Math.random() * 100),
                });
              }}
            >
              表单交互测试
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                // 触发一个模拟错?                setTimeout(() => {
                  throw new Error('这是一个测试错?);
                }, 100);
              }}
            >
              错误触发测试
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">当前追踪状?/h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">待发送事?</span>
                <span className="ml-2 font-medium">0</span>
              </div>
              <div>
                <span className="text-gray-600">会话ID:</span>
                <span className="ml-2 font-mono text-xs">...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

