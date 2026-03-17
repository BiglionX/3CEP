'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Store, Bell, Shield, Palette, Save } from 'lucide-react';

export default function RepairShopSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('极速手机维修');
  const [shopPhone, setShopPhone] = useState('010-12345678');
  const [shopAddress, setShopAddress] = useState('朝阳区建国路88号');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoAssignOrders, setAutoAssignOrders] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');

  const handleSave = async () => {
    setLoading(true);
    // 模拟保存设置
    setTimeout(() => {
      setLoading(false);
      alert('设置已保存');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-3 h-6 w-6" />
          系统设置
        </h1>
        <p className="text-gray-600 mt-1">管理您的维修店配置和系统选项</p>
      </div>

      {/* 店铺信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            店铺信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">店铺名称</Label>
            <Input
              id="shop-name"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="请输入店铺名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-phone">联系电话</Label>
            <Input
              id="shop-phone"
              value={shopPhone}
              onChange={e => setShopPhone(e.target.value)}
              placeholder="请输入联系电话"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-address">店铺地址</Label>
            <Input
              id="shop-address"
              value={shopAddress}
              onChange={e => setShopAddress(e.target.value)}
              placeholder="请输入店铺地址"
            />
          </div>
        </CardContent>
      </Card>

      {/* 营业时间 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            营业时间
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">开始时间</Label>
              <Input
                id="start-time"
                type="time"
                value={workingHoursStart}
                onChange={e => setWorkingHoursStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">结束时间</Label>
              <Input
                id="end-time"
                type="time"
                value={workingHoursEnd}
                onChange={e => setWorkingHoursEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">启用通知</div>
              <div className="text-sm text-gray-600">接收工单和预约提醒</div>
            </div>
            <Switch
              checked={notificationEnabled}
              onCheckedChange={setNotificationEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">自动分配工单</div>
              <div className="text-sm text-gray-600">
                根据技师技能自动分配工单
              </div>
            </div>
            <Switch
              checked={autoAssignOrders}
              onCheckedChange={setAutoAssignOrders}
            />
          </div>
        </CardContent>
      </Card>

      {/* 安全设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            安全设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">当前密码</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="请输入当前密码"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="请输入新密码"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="请再次输入新密码"
            />
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          保存设置
        </Button>
      </div>
    </div>
  );
}
