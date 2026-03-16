"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  User,
  Lock,
  Shield,
  Camera,
  Save,
  X,
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user } = useUnifiedAuth();

  const [profile, setProfile] = useState({
    name: (user as any)?.name || '用户',
    email: (user as any)?.email || 'user@example.com',
    phone: '138****8888',
    location: '广东省深圳市',
    bio: '热爱科技，专注维修服务',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    orderUpdates: true,
    marketing: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlert: true,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSecurityChange = (field: string, value: boolean) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setProfile({
      name: (user as any)?.name || '用户',
      email: (user as any)?.email || 'user@example.com',
      phone: '138****8888',
      location: '广东省深圳市',
      bio: '热爱科技，专注维修服务',
    });
    setHasChanges(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold">个人设置</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="security">账户安全</TabsTrigger>
        </TabsList>

        {/* 个人资料 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像 */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium">头像</h3>
                  <p className="text-sm text-gray-500">点击更换头像</p>
                </div>
              </div>

              {/* 姓名 */}
              <div className="grid gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </div>

              {/* 邮箱 */}
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>

              {/* 手机 */}
              <div className="grid gap-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </div>

              {/* 所在地 */}
              <div className="grid gap-2">
                <Label htmlFor="location">所在地</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                />
              </div>

              {/* 个人简介 */}
              <div className="grid gap-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-gray-500">{profile.bio.length}/200 字符</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知偏好</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-gray-500">通过邮件接收重要通知</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>短信通知</Label>
                  <p className="text-sm text-gray-500">通过短信接收重要通知</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>推送通知</Label>
                  <p className="text-sm text-gray-500">接收应用推送通知</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>订单更新</Label>
                  <p className="text-sm text-gray-500">接收订单状态变更通知</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>营销信息</Label>
                  <p className="text-sm text-gray-500">接收促销和营销信息</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账户安全 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>两步验证</Label>
                  <p className="text-sm text-gray-500">启用两步验证以增强账户安全</p>
                </div>
                <Switch
                  checked={security.twoFactor}
                  onCheckedChange={(checked) => handleSecurityChange('twoFactor', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>登录提醒</Label>
                  <p className="text-sm text-gray-500">新设备登录时接收通知</p>
                </div>
                <Switch
                  checked={security.loginAlert}
                  onCheckedChange={(checked) => handleSecurityChange('loginAlert', checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  修改密码
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  查看登录历史
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
