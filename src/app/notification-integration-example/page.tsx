/**
 * 智能通知系统集成示例
 * 展示如何在现有应用中使用智能通知功能
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  NotificationProvider,
  useNotifications,
  NotificationLevel,
  NotificationType,
} from '@/components/smart-notifications';

// 示例业务组件
function BusinessComponent() {
  const { addNotification, scheduleNotification } = useNotifications();

  // 业务操作示例
  const handleSaveData = () => {
    // 模拟保存操作
    setTimeout(() => {
      addNotification({
        title: '数据保存成功',
        message: '您的数据已成功保存到系统?,
        level: NotificationLevel.MEDIUM,
        type: NotificationType.SYSTEM,
        category: '数据操作',
      });
    }, 1000);
  };

  const handleCriticalError = () => {
    addNotification({
      title: '系统错误',
      message: '检测到关键系统错误，请立即联系技术支?,
      level: NotificationLevel.CRITICAL,
      type: NotificationType.ALERT,
      category: '系统告警',
    });
  };

  const handleWorkflowComplete = () => {
    scheduleNotification(
      {
        title: '工作流完成提?,
        message: '您发起的工作流已处理完成，请查看详情',
        level: NotificationLevel.HIGH,
        type: NotificationType.WORKFLOW,
        category: '工作?,
      },
      30000
    ); // 30秒后提醒
  };

  const handleUserMention = () => {
    addNotification({
      title: '有人提到了您',
      message: '张三在项目讨论中提到了您',
      level: NotificationLevel.MEDIUM,
      type: NotificationType.USER,
      category: '社交互动',
    });
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">业务操作示例</h2>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleSaveData} variant="default">
          保存数据
        </Button>

        <Button onClick={handleCriticalError} variant="destructive">
          触发严重错误
        </Button>

        <Button onClick={handleWorkflowComplete} variant="secondary">
          启动工作?        </Button>

        <Button onClick={handleUserMention} variant="outline">
          模拟用户提及
        </Button>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>💡 点击按钮查看不同类型的通知效果</p>
        <p>🔔 注意观察右上角的通知徽章变化</p>
      </div>
    </div>
  );
}

// 主应用组?export default function NotificationIntegrationExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationProvider>
        <BusinessComponent />
      </NotificationProvider>
    </div>
  );
}

