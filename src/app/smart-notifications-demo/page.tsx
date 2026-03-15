/**
 * 智能通知系统演示页面
 * 展示分级通知、定时提醒、智能聚合等功能
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Star,
  Settings,
  Send,
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  NotificationProvider as NotificationProviderComponent,
  useNotifications,
  NotificationLevel,
  requestNotificationPermission,
} from '@/components/smart-notifications/NotificationManager';
import { NotificationList } from '@/components/smart-notifications/NotificationList';
import { NotificationBadge as NotificationBadgeComponent } from '@/components/smart-notifications/NotificationBadge';

// 演示组件包装器
function SmartNotificationDemo() {
  const {
    addNotification,
    scheduleNotification,
    settings,
    updateSettings,
    unreadCount,
  } = useNotifications() as any;

  const [title, setTitle] = useState('系统维护通知');
  const [message, setMessage] = useState(
    '系统将在今晚23:00-24:00进行例行维护，请提前做好数据备份'
  );
  const [level, setLevel] = useState<NotificationLevel>(
    NotificationLevel.MEDIUM
  );
  const [type, setType] = useState('system');
  const [category, setCategory] = useState('系统通知');
  const [delayMinutes, setDelayMinutes] = useState(1);

  // 发送即时通知
  const sendImmediateNotification = () => {
    addNotification({
      title,
      message,
      level,
      type,
      category,
    });
    resetForm();
  };

  // 发送定时通知
  const sendScheduledNotification = () => {
    const delayMs = delayMinutes * 60 * 1000;
    scheduleNotification(
      {
        title: `[定时] ${title}`,
        message: `${message} (将在${delayMinutes}分钟后发送)`,
        level,
        type,
        category,
      },
      delayMs
    );

    alert(`定时通知已设置，将在${delayMinutes}分钟后发送`);
    resetForm();
  };

  // 发送批量测试通知
  const sendTestBatch = () => {
    const testNotifications = [
      {
        title: '紧急系统告警',
        message: '数据库连接出现异常，请立即处理！',
        level: NotificationLevel.CRITICAL,
        type: 'alert',
        category: '系统告警',
      },
      {
        title: '重要更新提醒',
        message: '系统版本v2.1.0已发布，请及时更新',
        level: NotificationLevel.HIGH,
        type: 'system',
        category: '系统更新',
      },
      {
        title: '日常工作提醒',
        message: '请记得提交今日工作报告',
        level: NotificationLevel.MEDIUM,
        type: 'reminder',
        category: '工作提醒',
      },
      {
        title: '系统消息',
        message: '欢迎使用智能通知系统',
        level: NotificationLevel.LOW,
        type: 'system',
        category: '系统消息',
      },
    ];

    testNotifications.forEach((notif, index) => {
      setTimeout(() => {
        addNotification(notif);
      }, index * 500);
    });
  };

  // 重置表单
  const resetForm = () => {
    setTitle('系统维护通知');
    setMessage('系统将在今晚23:00-24:00进行例行维护，请提前做好数据备份');
    setLevel(NotificationLevel.MEDIUM);
    setType('system');
    setCategory('系统通知');
    setDelayMinutes(1);
  };

  // 请求通知权限
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    alert(`通知权限状态: ${permission}`);
  };

  return (
    <div className="space-y-6">
      {/* 顶部通知徽章展示 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold">智能通知系统演示</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">未读通知: {unreadCount}</span>
          <NotificationBadgeComponent />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 通知发送面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              发送通知
            </CardTitle>
            <CardDescription>创建和发送不同类型的通知</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">通知标题</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="请输入通知标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">通知内容</Label>
              <Textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="请输入通知内容"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>通知级别</Label>
                <Select
                  value={level}
                  onValueChange={value => setLevel(value as NotificationLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NotificationLevel.LOW}>
                      低优先级
                    </SelectItem>
                    <SelectItem value={NotificationLevel.MEDIUM}>
                      中优先级
                    </SelectItem>
                    <SelectItem value={NotificationLevel.HIGH}>
                      高优先级
                    </SelectItem>
                    <SelectItem value={NotificationLevel.CRITICAL}>
                      关键
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>通知类型</Label>
                <Select
                  value={type}
                  onValueChange={value => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">
                      系统通知
                    </SelectItem>
                    <SelectItem value="user">
                      用户通知
                    </SelectItem>
                    <SelectItem value="workflow">
                      工作流
                    </SelectItem>
                    <SelectItem value="alert">告警</SelectItem>
                    <SelectItem value="reminder">
                      提醒
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">分类标签</Label>
              <Input
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="例如：系统通知、工作提醒等"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={sendImmediateNotification} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                立即发送
              </Button>
              <Button variant="outline" onClick={resetForm}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 定时通知面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              定时通知
            </CardTitle>
            <CardDescription>设置延迟发送的通知</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delay">延迟时间(分钟)</Label>
              <Input
                id="delay"
                type="number"
                min="1"
                max="1440"
                value={delayMinutes}
                onChange={e => setDelayMinutes(parseInt(e.target.value) || 1)}
              />
            </div>

            <Button
              onClick={sendScheduledNotification}
              className="w-full"
              variant="secondary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              设置定时通知
            </Button>

            <div className="pt-4 border-t">
              <Button
                onClick={sendTestBatch}
                className="w-full"
                variant="outline"
              >
                <Star className="w-4 h-4 mr-2" />
                发送测试批量
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统设置面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>声音提醒</Label>
                  <p className="text-sm text-gray-500">启用声音通知</p>
                </div>
                <Switch
                  checked={settings.enableSound}
                  onCheckedChange={checked =>
                    updateSettings({ enableSound: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>桌面通知</Label>
                  <p className="text-sm text-gray-500">浏览器桌面弹窗</p>
                </div>
                <Switch
                  checked={settings.enableDesktop}
                  onCheckedChange={checked =>
                    updateSettings({ enableDesktop: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>推送通知</Label>
                  <p className="text-sm text-gray-500">移动设备推送</p>
                </div>
                <Switch
                  checked={settings.enablePush}
                  onCheckedChange={checked =>
                    updateSettings({ enablePush: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>智能分组</Label>
                  <p className="text-sm text-gray-500">相似通知自动分组</p>
                </div>
                <Switch
                  checked={settings.groupSimilar}
                  onCheckedChange={checked =>
                    updateSettings({ groupSimilar: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>自动归档天数</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.autoArchiveDays}
                  onChange={e =>
                    updateSettings({
                      autoArchiveDays: parseInt(e.target.value) || 30,
                    })
                  }
                />
                <p className="text-sm text-gray-500">已读通知自动归档的时间</p>
              </div>

              <Button
                onClick={handleRequestPermission}
                variant="outline"
                className="w-full"
              >
                请求桌面通知权限
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知列表展示 */}
      <Card>
        <CardHeader>
          <CardTitle>通知列表</CardTitle>
          <CardDescription>实时显示所有通知，支持过滤和管理</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationList
            showFilters={true}
            showActions={true}
            maxHeight="400px"
          />
        </CardContent>
      </Card>

      {/* 功能说明 */}
      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📊 分级通知</h3>
              <p className="text-sm text-blue-600">
                支持低、中、高、关键四个级别的通知分类
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⏰ 定时提醒
              </h3>
              <p className="text-sm text-yellow-600">
                可设置延迟发送的通知，支持精确时间控制
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🤖 智能聚合</h3>
              <p className="text-sm text-green-600">
                自动分组相似通知，减少信息冗余
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">
                🔔 多渠道通知
              </h3>
              <p className="text-sm text-purple-600">
                支持声音、桌面、邮件、推送等多种通知方式
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">⚡ 实时处理</h3>
              <p className="text-sm text-red-600">即时通知发送和状态更新</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2">
                🛠️ 灵活配置
              </h3>
              <p className="text-sm text-indigo-600">
                丰富的设置选项，满足不同场景需求
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主页面组件
export default function SmartNotificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            智能通知系统
          </h1>
          <p className="text-gray-600">
            基于分级管理、定时提醒和智能聚合的企业级通知解决方案
          </p>
        </div>

        <NotificationProviderComponent>
          <SmartNotificationDemo />
        </NotificationProviderComponent>
      </div>
    </div>
  );
}
