/**
 * 企业服务仪表板页面
 * 企业用户的综合管理界面
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  ShoppingCart,
  BarChart3,
  Users,
  CreditCard,
  Activity,
  Bell,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnterpriseLayout } from '@/components/enterprise/EnterpriseLayout';

// 服务使用统计
interface ServiceStat {
  name: string;
  icon: any;
  usage: number;
  limit: number;
  percentage: number;
  status: 'active' | 'warning' | 'critical';
}

// 最近活动类
interface RecentActivity {
  id: string;
  type: 'order' | 'agent' | 'payment' | 'notification';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

// 通知类型
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export default function EnterpriseDashboardPage() {
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const mockServiceStats: ServiceStat[] = [
      {
        name: '智能体服务',
        icon: Bot,
        usage: 85,
        limit: 100,
        percentage: 85,
        status: 'warning',
      },
      {
        name: '采购服务',
        icon: ShoppingCart,
        usage: 42,
        limit: 200,
        percentage: 21,
        status: 'active',
      },
      {
        name: '用户管理',
        icon: Users,
        usage: 156,
        limit: 500,
        percentage: 31,
        status: 'active',
      },
    ];

    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'order',
        title: '新采购订单',
        description: 'PO-2024-001 已提交审核',
        time: '2分钟前',
        status: 'pending',
      },
      {
        id: '2',
        type: 'agent',
        title: '智能体执行完成',
        description: '客服机器人对话完成，满意度95%',
        time: '15分钟前',
        status: 'success',
      },
      {
        id: '3',
        type: 'payment',
        title: '付款确认',
        description: '采购订单PO-2024-001付款已确认',
        time: '1小时前',
        status: 'success',
      },
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: '系统维护通知',
        message: '系统将于今晚23:00-24:00进行例行维护',
        time: '今天 09:30',
        unread: true,
        type: 'info',
      },
      {
        id: '2',
        title: '额度即将用完',
        message: '智能体服务使用额度剩5%，请及时充值',
        time: '昨天 16:45',
        unread: true,
        type: 'warning',
      },
    ];

    setTimeout(() => {
      setServiceStats(mockServiceStats);
      setRecentActivities(mockActivities);
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  }, []);

  // 状态颜色映射
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <EnterpriseLayout title="企业仪表板">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout title="企业仪表板">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">欢迎回来</h1>
            <p className="opacity-90">
              这里是您的企业服务中心，为您提供全方位的AI智能化服务
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-2" />
              服务配置
            </Button>
          </div>
        </div>
      </div>

      {/* 服务使用统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {serviceStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {stat.usage}/{stat.limit}
                </div>
                <Progress value={stat.percentage} className="mb-2" />
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[stat.status]}>
                    {stat.status === 'active' && '正常'}
                    {stat.status === 'warning' && '预警'}
                    {stat.status === 'critical' && '危险'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    使用{stat.percentage}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近活动 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === 'order' && (
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.type === 'agent' && (
                        <Bot className="h-5 w-5 text-green-500" />
                      )}
                      {activity.type === 'payment' && (
                        <CreditCard className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                        <Badge
                          variant={
                            activity.status === 'success'
                              ? 'default'
                              : 'secondary'
                          }
                          className="ml-2"
                        >
                          {activity.status === 'success' && '成功'}
                          {activity.status === 'pending' && '处理中'}
                          {activity.status === 'failed' && '失败'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  查看更多活动
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 通知和快捷操作 */}
        <div className="space-y-6">
          {/* 通知 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  通知
                </span>
                <Badge variant="secondary">
                  {notifications.filter(n => n.unread).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.unread
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <h4 className="text-sm font-medium mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                      <Badge
                        variant={
                          notification.type === 'info'
                            ? 'secondary'
                            : notification.type === 'warning'
                              ? 'destructive'
                              : 'default'
                        }
                        className="text-xs"
                      >
                        {notification.type === 'info' && '信息'}
                        {notification.type === 'warning' && '警告'}
                        {notification.type === 'success' && '成功'}
                        {notification.type === 'error' && '错误'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Bot className="w-4 h-4 mr-2" />
                创建智能体
              </Button>
              <Button className="w-full" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                新建采购订单
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                管理用户
              </Button>
              <Button className="w-full" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                查看报表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
