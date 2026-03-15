'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Sliders,
  Bell,
  Palette,
  Globe,
  Shield,
  Eye,
  Volume2,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RotateCcw,
  User,
  Heart,
  MapPin,
  Calendar,
} from 'lucide-react';

interface PreferenceCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  settings: PreferenceSetting[];
}

interface PreferenceSetting {
  id: string;
  type: 'toggle' | 'select' | 'slider' | 'input';
  label: string;
  description: string;
  value: any;
  options: { value: string; label: string }[];
  min: number;
  max: number;
  step: number;
}

export default function PreferenceSettingsPage() {
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [originalPreferences, setOriginalPreferences] = useState<
    Record<string, any>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 模拟获取用户偏好设置
    setTimeout(() => {
      const initialPreferences = {
        // 通知设置
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        notification_sound: true,
        notification_vibrate: true,

        // 显示设置
        theme: 'light',
        language: 'zh-CN',
        font_size: 14,
        auto_dark_mode: false,
        reduced_motion: false,

        // 隐私设置
        profile_visibility: 'friends',
        location_sharing: true,
        activity_sharing: true,
        data_collection: true,

        // 个性化设置
        recommended_content: true,
        personalized_ads: false,
        interest_categories: ['technology', 'repair'],
        preferred_stores: [],

        // 高级设置
        auto_save_drafts: true,
        sync_across_devices: true,
        backup_frequency: 'daily',
        data_retention: 365,
      };

      setPreferences(initialPreferences);
      setOriginalPreferences({ ...initialPreferences });
      setLoading(false);
    }, 500);
  }, []);

  const preferenceCategories: PreferenceCategory[] = [
    {
      id: 'notifications',
      title: '通知设置',
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          id: 'notifications_enabled',
          type: 'toggle',
          label: '启用通知',
          description: '接收系统通知和提醒',
        },
{
          id: 'email_notifications',
          type: 'toggle',
          label: '邮件通知',
          description: '通过邮箱接收重要通知',
        },
{
          id: 'sms_notifications',
          type: 'toggle',
          label: '短信通知',
          description: '紧急情况下发送短信提醒',
        },
{
          id: 'push_notifications',
          type: 'toggle',
          label: '推送通知',
          description: '在移动设备上显示推送消息',
        },
{
          id: 'notification_sound',
          type: 'toggle',
          label: '通知声音',
          description: '播放通知提示音',
        },
{
          id: 'notification_vibrate',
          type: 'toggle',
          label: '震动提醒',
          description: '收到通知时设备震动',
        },
      ],
    },
{
      id: 'display',
      title: '显示设置',
      icon: <Monitor className="w-5 h-5" />,
      settings: [
        {
          id: 'theme',
          type: 'select',
          label: '主题模式',
          description: '选择界面主题风格',
          options: [
            { value: 'light', label: '浅色模式' },
{ value: 'dark', label: '深色模式' },
{ value: 'auto', label: '自动切换' },
          ],
        },
{
          id: 'language',
          type: 'select',
          label: '语言',
          description: '选择界面显示语言',
          options: [
            { value: 'zh-CN', label: '简体中文' },
{ value: 'en-US', label: 'English' },
{ value: 'ja-JP', label: '日本語' },
          ],
        },
{
          id: 'font_size',
          type: 'input',
          label: '字体大小',
          description: '调整界面文字大小 (12-20px)',
          value: '14',
        },
{
          id: 'auto_dark_mode',
          type: 'toggle',
          label: '自动深色模式',
          description: '根据时间自动切换深色模式',
        },
{
          id: 'reduced_motion',
          type: 'toggle',
          label: '减少动画',
          description: '为减少晕动症而简化动画效果',
        },
      ],
    },
{
      id: 'privacy',
      title: '隐私设置',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          id: 'profile_visibility',
          type: 'select',
          label: '资料可见性',
          description: '控制谁可以看到您的个人资料',
          options: [
            { value: 'public', label: '公开' },
{ value: 'friends', label: '好友可见' },
{ value: 'private', label: '仅自己可见' },
          ],
        },
{
          id: 'location_sharing',
          type: 'toggle',
          label: '位置共享',
          description: '允许应用访问您的位置信息',
        },
{
          id: 'activity_sharing',
          type: 'toggle',
          label: '活动分享',
          description: '与其他用户分享您的活动',
        },
{
          id: 'data_collection',
          type: 'toggle',
          label: '数据分析',
          description: '允许收集使用数据以改进服务',
        },
      ],
    },
{
      id: 'personalization',
      title: '个性化设置',
      icon: <User className="w-5 h-5" />,
      settings: [
        {
          id: 'recommended_content',
          type: 'toggle',
          label: '推荐内容',
          description: '根据您的兴趣推荐相关内容',
        },
{
          id: 'personalized_ads',
          type: 'toggle',
          label: '个性化广告',
          description: '显示基于兴趣的广告',
        },
{
          id: 'interest_categories',
          type: 'select',
          label: '兴趣类别',
          description: '选择您感兴趣的内容类别',
          options: [
            { value: 'technology', label: '科技数码' },
{ value: 'repair', label: '维修技术' },
{ value: 'life', label: '生活技巧' },
{ value: 'news', label: '行业资讯' },
{ value: 'tutorial', label: '教程指南' },
          ],
        },
      ],
    },
{
      id: 'advanced',
      title: '高级设置',
      icon: <Sliders className="w-5 h-5" />,
      settings: [
        {
          id: 'auto_save_drafts',
          type: 'toggle',
          label: '自动保存草稿',
          description: '自动保存未完成的内容',
        },
{
          id: 'sync_across_devices',
          type: 'toggle',
          label: '跨设备同步',
          description: '在所有设备间同步数据',
        },
{
          id: 'backup_frequency',
          type: 'select',
          label: '备份频率',
          description: '自动备份数据的频率',
          options: [
            { value: 'hourly', label: '每小时' },
{ value: 'daily', label: '每天' },
{ value: 'weekly', label: '每周' },
          ],
        },
{
          id: 'data_retention',
          type: 'input',
          label: '数据保留期',
          description: '数据保存的天数 (30-1095天)',
          value: '365',
        },
      ],
    },
  ];

  const handleToggleChange = (settingId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [settingId]: checked,
    }));
  };

  const handleSelectChange = (settingId: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const handleSliderChange = (settingId: string, value: number[]) => {
    setPreferences(prev => ({
      ...prev,
      [settingId]: value[0],
    }));
  };

  const handleInputChange = (settingId: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    setOriginalPreferences({ ...preferences });
    setSaving(false);
    alert('设置已保存');
  };

  const handleReset = () => {
    setPreferences({ ...originalPreferences });
    alert('已恢复到上次保存的设置');
  };

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(originalPreferences);

  const renderSetting = (setting: PreferenceSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>"
              <Label className="text-base font-medium">{setting.label}</Label>
              {setting.description && ("
                <p className="text-sm text-gray-600 mt-1">
                  {setting.description}
                </p>
              )}
            </div>
            <Switch
              checked={preferences[setting.id]  false}
              onCheckedChange={checked =>
                handleToggleChange(setting.id, checked)
              }
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">"
            <Label className="text-base font-medium">{setting.label}</Label>
            {setting.description && ("
              <p className="text-sm text-gray-600">{setting.description}</p>
            )}
            <Select
              value={preferences[setting.id]  ''}
              onValueChange={value => handleSelectChange(setting.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-2">"
            <Label className="text-base font-medium">{setting.label}</Label>
            {setting.description && ("
              <p className="text-sm text-gray-600">{setting.description}</p>
            )}
            <Input"
              type="text"
              value={preferences[setting.id]  setting.value  ''}
              onChange={e => handleInputChange(setting.id, e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">"
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return ("
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}"
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>"
          <h1 className="text-2xl font-bold text-gray-900">偏好设置</h1>"
          <p className="text-gray-600 mt-1">自定义您的使用体验</p>
        </div>
"
        <div className="flex items-center space-x-3">
          <Button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >"
            <RotateCcw className="w-4 h-4 mr-2" />
            恢复默认
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>"
            <Save className="w-4 h-4 mr-2" />
            {saving  '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 设置分类网格 */}"
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {preferenceCategories.map(category => (
          <Card key={category.id}>
            <CardHeader>"
              <CardTitle className="flex items-center">"
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  {category.icon}
                </div>
                {category.title}
              </CardTitle>
            </CardHeader>"
            <CardContent className="space-y-6">
              {category.settings.map(setting => (
                <div
                  key={setting.id}"
                  className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  {renderSetting(setting)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 底部操作栏 */}
      {hasChanges && ("
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">"
          <div className="max-w-7xl mx-auto flex items-center justify-end space-x-3">"
            <Button variant="outline" onClick={handleReset}>"
              <RotateCcw className="w-4 h-4 mr-2" />
              恢复
            </Button>
            <Button onClick={handleSave} disabled={saving}>"
              <Save className="w-4 h-4 mr-2" />
              {saving  '保存中...' : '保存更改'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'"