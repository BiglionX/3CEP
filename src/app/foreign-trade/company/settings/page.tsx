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
import { Switch } from '@/components/ui/switch';
import {
  Settings2,
  User,
  Bell,
  Lock,
  Globe,
  Mail,
  Shield,
  Save,
  Building2,
  Smartphone,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('设置已保存');
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-sm text-gray-500">管理您的账户和系统偏好设置</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? '保存中...' : '保存设置'}
        </Button>
      </div>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            账户信息
          </CardTitle>
          <CardDescription>管理您的个人账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">用户名</Label>
              <Input id="username" defaultValue="foreign_trade_user" />
            </div>
            <div>
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">联系电话</Label>
              <Input id="phone" type="tel" defaultValue="+86 138 0000 0000" />
            </div>
            <div>
              <Label htmlFor="company">公司名称</Label>
              <Input id="company" defaultValue="国际贸易有限公司" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 安全设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            安全设置
          </CardTitle>
          <CardDescription>保护您的账户安全</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>两步验证</Label>
              <p className="text-sm text-gray-500">启用后登录需要额外验证</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>登录通知</Label>
              <p className="text-sm text-gray-500">新设备登录时发送通知</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>交易密码</Label>
              <p className="text-sm text-gray-500">设置交易密码保护资金安全</p>
            </div>
            <Button variant="outline" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            通知设置
          </CardTitle>
          <CardDescription>管理您接收的通知类型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>订单通知</Label>
              <p className="text-sm text-gray-500">接收订单状态变更通知</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>物流通知</Label>
              <p className="text-sm text-gray-500">接收物流状态更新通知</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>邮件通知</Label>
              <p className="text-sm text-gray-500">通过邮件接收重要通知</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>短信通知</Label>
              <p className="text-sm text-gray-500">通过短信接收重要通知</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* 语言和区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            语言和区域
          </CardTitle>
          <CardDescription>设置显示语言和地区格式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>界面语言</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <Label>时区</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                <option value="UTC">世界协调时间 (UTC)</option>
              </select>
            </div>
            <div>
              <Label>货币</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="CNY">人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
              </select>
            </div>
            <div>
              <Label>日期格式</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
