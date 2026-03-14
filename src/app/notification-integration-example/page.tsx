/**
 * 智能通知系统集成示例
 * 展示如何在现有应用中使用智能通知功能
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// 简化的通知类型定义
type NotificationLevel = 'low' | 'medium' | 'high' | 'critical';

interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  timestamp: Date;
}

export default function NotificationIntegrationExample() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 添加通知
  const addNotification = (
    title: string,
    message: string,
    level: NotificationLevel
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      level,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev]);

    // 3秒后自动移除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // 业务操作示例
  const handleSaveData = () => {
    setTimeout(() => {
      addNotification('数据保存成功', '您的数据已成功保存到系统', 'medium');
    }, 1000);
  };

  const handleCriticalError = () => {
    addNotification(
      '系统错误',
      '检测到关键系统错误，请立即联系技术支持',
      'critical'
    );
  };

  const handleWorkflowComplete = () => {
    setTimeout(() => {
      addNotification(
        '工作流完成提醒',
        '您发起的工作流已处理完成，请查看详情',
        'high'
      );
    }, 2000);
  };

  const handleUserMention = () => {
    addNotification('有人提到了您', '张三在项目讨论中提到了您', 'medium');
  };

  // 获取通知图标
  const getNotificationIcon = (level: NotificationLevel) => {
    switch (level) {
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'medium':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // 获取通知颜色
  const getNotificationColor = (level: NotificationLevel) => {
    switch (level) {
      case 'low':
        return 'bg-blue-50 border-blue-200';
      case 'medium':
        return 'bg-green-50 border-green-200';
      case 'high':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            智能通知系统示例
          </h1>
          <p className="text-gray-600">展示如何在现有应用中使用智能通知功能</p>
        </div>

        {/* 通知显示区域 */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border shadow-lg ${getNotificationColor(notification.level)} transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.level)}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>业务操作示例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleSaveData} variant="default">
                保存数据
              </Button>

              <Button onClick={handleCriticalError} variant="destructive">
                触发严重错误
              </Button>

              <Button onClick={handleWorkflowComplete} variant="secondary">
                启动工作流
              </Button>

              <Button onClick={handleUserMention} variant="outline">
                模拟用户提及
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 说明区域 */}
        <Card>
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">通知级别</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <span className="text-blue-600">Low</span> - 一般信息
                </li>
                <li>
                  • <span className="text-green-600">Medium</span> - 重要提醒
                </li>
                <li>
                  • <span className="text-yellow-600">High</span> - 紧急事项
                </li>
                <li>
                  • <span className="text-red-600">Critical</span> - 系统级紧急
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">使用提示</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 点击按钮查看不同类型的通知效果</li>
                <li>• 通知会在3秒后自动消失</li>
                <li>• 不同级别的通知有不同的颜色和图标</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-900">💡 集成说明</h3>
              <p className="text-sm text-blue-800">
                在实际应用中，可以使用 `@/components/smart-notifications`
                提供的完整通知系统，包括通知持久化、桌面通知、声音提醒等功能。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
