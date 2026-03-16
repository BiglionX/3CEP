'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Key, Smartphone, Monitor, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlert, setLoginAlert] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新密码与确认密码不匹配' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: '密码长度至少为8个字符' });
      return;
    }

    setSaving(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setMessage({ type: 'success', text: '密码修改成功' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const loginHistory = [
    { id: 1, device: 'Chrome on Windows', location: 'Beijing, CN', time: '2024-01-15 14:30', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Beijing, CN', time: '2024-01-14 09:15', current: false },
    { id: 3, device: 'Chrome on MacOS', location: 'Shanghai, CN', time: '2024-01-10 16:45', current: false },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          账户安全
        </h1>
        <p className="text-gray-500 mt-2">管理您的密码、两步验证和登录设备</p>
      </div>

      <div className="grid gap-6">
        {/* 修改密码 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              修改密码
            </CardTitle>
            <CardDescription>定期更换密码可以保护您的账户安全</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">当前密码</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">新密码</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">确认新密码</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {message.text}
                </div>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '修改密码'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 两步验证 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              两步验证
            </CardTitle>
            <CardDescription>为您的账户添加额外的安全保护层</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">启用两步验证</p>
                <p className="text-sm text-gray-500">即使密码泄露也能防止未授权访问</p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            {twoFactorEnabled && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">两步验证已启用</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  您的账户已受到额外保护
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 登录提醒 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              登录提醒
            </CardTitle>
            <CardDescription>新设备登录时接收通知</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">异常登录提醒</p>
                <p className="text-sm text-gray-500">在陌生设备登录时推送通知</p>
              </div>
              <Switch
                checked={loginAlert}
                onCheckedChange={setLoginAlert}
              />
            </div>
          </CardContent>
        </Card>

        {/* 登录历史 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              登录历史
            </CardTitle>
            <CardDescription>查看您账户的登录记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {login.device}
                        {login.current && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            当前设备
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{login.location} · {login.time}</p>
                    </div>
                  </div>
                  {!login.current && (
                    <Button variant="outline" size="sm">
                      退出登录
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃会话 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              活跃会话
            </CardTitle>
            <CardDescription>管理您已登录的设备</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Windows - Chrome</p>
                    <p className="text-sm text-gray-500">当前会话 · 北京</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                退出所有其他设备
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
