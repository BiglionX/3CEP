"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Bell,
  Shield,
  User,
  Monitor,
  Save,
  RotateCcw,
} from 'lucide-react';

interface PreferenceSetting {
  id: string;
  type: 'toggle' | 'select' | 'input' | 'slider';
  label: string;
  description: string;
  value: boolean | string | number;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface PreferenceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  settings: PreferenceSetting[];
}

export default function PreferenceSettingsPage() {
  const [preferences, setPreferences] = useState<Record<string, boolean | string | number>>({
    // 通知设置
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    order_updates: true,
    marketing_messages: false,
    // 隐私设置
    profile_visible: true,
    activity_visible: false,
    location_tracking: false,
    data_sharing: true,
    // 显示设置
    theme: 'system',
    language: 'zh-CN',
    font_size: 'medium',
    compact_mode: false,
    // 账户设置
    two_factor_auth: true,
    login_alerts: true,
    session_timeout: '30',
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const preferenceCategories: PreferenceCategory[] = [
    {
      id: 'notifications',
      name: '通知设置',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          id: 'email_notifications',
          type: 'toggle',
          label: '邮件通知',
          description: '通过邮件接收重要通知',
          value: preferences.email_notifications,
        },
        {
          id: 'sms_notifications',
          type: 'toggle',
          label: '短信通知',
          description: '通过短信接收重要通知',
          value: preferences.sms_notifications,
        },
        {
          id: 'push_notifications',
          type: 'toggle',
          label: '推送通知',
          description: '接收应用推送通知',
          value: preferences.push_notifications,
        },
        {
          id: 'order_updates',
          type: 'toggle',
          label: '订单更新',
          description: '接收订单状态变更通知',
          value: preferences.order_updates,
        },
        {
          id: 'marketing_messages',
          type: 'toggle',
          label: '营销信息',
          description: '接收促销和营销信息',
          value: preferences.marketing_messages,
        },
      ],
    },
    {
      id: 'privacy',
      name: '隐私设置',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          id: 'profile_visible',
          type: 'toggle',
          label: '公开个人资料',
          description: '允许其他用户查看您的个人资料',
          value: preferences.profile_visible,
        },
        {
          id: 'activity_visible',
          type: 'toggle',
          label: '显示最近活动',
          description: '在个人资料中显示最近活动',
          value: preferences.activity_visible,
        },
        {
          id: 'location_tracking',
          type: 'toggle',
          label: '位置追踪',
          description: '允许应用获取您的位置信息',
          value: preferences.location_tracking,
        },
        {
          id: 'data_sharing',
          type: 'toggle',
          label: '数据共享',
          description: '与合作伙伴共享数据以提供更好的服务',
          value: preferences.data_sharing,
        },
      ],
    },
    {
      id: 'display',
      name: '显示设置',
      icon: <Monitor className="w-5 h-5" />,
      settings: [
        {
          id: 'theme',
          type: 'select',
          label: '主题',
          description: '选择应用的主题模式',
          value: preferences.theme,
          options: [
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
            { value: 'system', label: '跟随系统' },
          ],
        },
        {
          id: 'language',
          type: 'select',
          label: '语言',
          description: '选择显示语言',
          value: preferences.language,
          options: [
            { value: 'zh-CN', label: '简体中文' },
            { value: 'zh-TW', label: '繁體中文' },
            { value: 'en', label: 'English' },
          ],
        },
        {
          id: 'font_size',
          type: 'select',
          label: '字体大小',
          description: '调整应用字体大小',
          value: preferences.font_size,
          options: [
            { value: 'small', label: '小' },
            { value: 'medium', label: '中' },
            { value: 'large', label: '大' },
          ],
        },
        {
          id: 'compact_mode',
          type: 'toggle',
          label: '紧凑模式',
          description: '使用更紧凑的界面布局',
          value: preferences.compact_mode,
        },
      ],
    },
    {
      id: 'account',
      name: '账户安全',
      icon: <User className="w-5 h-5" />,
      settings: [
        {
          id: 'two_factor_auth',
          type: 'toggle',
          label: '两步验证',
          description: '启用两步验证以增强账户安全',
          value: preferences.two_factor_auth,
        },
        {
          id: 'login_alerts',
          type: 'toggle',
          label: '登录提醒',
          description: '新设备登录时接收通知',
          value: preferences.login_alerts,
        },
        {
          id: 'session_timeout',
          type: 'select',
          label: '会话超时',
          description: '自动退出登录的时间',
          value: preferences.session_timeout,
          options: [
            { value: '15', label: '15分钟' },
            { value: '30', label: '30分钟' },
            { value: '60', label: '1小时' },
            { value: '120', label: '2小时' },
          ],
        },
      ],
    },
  ];

  const handleToggleChange = (settingId: string, checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [settingId]: checked }));
    setHasChanges(true);
  };

  const handleSelectChange = (settingId: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [settingId]: value }));
    setHasChanges(true);
  };

  const handleInputChange = (settingId: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [settingId]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPreferences({
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      order_updates: true,
      marketing_messages: false,
      profile_visible: true,
      activity_visible: false,
      location_tracking: false,
      data_sharing: true,
      theme: 'system',
      language: 'zh-CN',
      font_size: 'medium',
      compact_mode: false,
      two_factor_auth: true,
      login_alerts: true,
      session_timeout: '30',
    });
    setHasChanges(false);
  };

  const renderSetting = (setting: PreferenceSetting) => {
    const value = preferences[setting.id];

    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Label className="font-medium">{setting.label}</Label>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
            <Switch
              checked={value as boolean}
              onCheckedChange={(checked) => handleToggleChange(setting.id, checked)}
            />
          </div>
        );
      case 'select':
        return (
          <div>
            <Label className="font-medium">{setting.label}</Label>
            <p className="text-sm text-gray-500 mb-2">{setting.description}</p>
            <select
              value={value as string}
              onChange={(e) => handleSelectChange(setting.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {setting.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case 'input':
        return (
          <div>
            <Label className="font-medium">{setting.label}</Label>
            <p className="text-sm text-gray-500 mb-2">{setting.description}</p>
            <Input
              value={value as string}
              onChange={(e) => handleInputChange(setting.id, e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold">偏好设置</h1>
      </div>

      <div className="space-y-6">
        {preferenceCategories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {category.icon}
                <h2 className="text-xl font-bold">{category.name}</h2>
              </div>
              <div className="space-y-4">
                {category.settings.map((setting) => (
                  <div key={setting.id} className="py-3 border-b last:border-0">
                    {renderSetting(setting)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            恢复默认
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存更改'}
          </Button>
        </div>
      )}
    </div>
  );
}
