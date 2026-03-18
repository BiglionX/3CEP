'use client';

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
import {
  Bell,
  Building2,
  Globe,
  Lock,
  Mail,
  Moon,
  Save,
  Settings2,
  Shield,
  Smartphone,
  Sun,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export default function EnterpriseSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  const [companyInfo, setCompanyInfo] = useState({
    name: '示例科技有限公司',
    industry: '互联网/科技',
    scale: '100-500人',
    location: '北京市',
    contact: '张经理',
    email: 'contact@example.com',
    phone: '010-12345678',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    orderUpdates: true,
    weeklyReports: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    ipWhitelist: false,
    sessionTimeout: true,
    auditLogs: true,
  });

  const handleSave = async () => {
    setLoading(true);
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert('设置保存成功！');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
              <p className="mt-1 text-sm text-gray-600">
                管理您的企业账户设置、通知偏好和安全选项
              </p>
            </div>

            <div className="space-y-6">
              {/* 企业基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    企业基本信息
                  </CardTitle>
                  <CardDescription>
                    更新您企业的基本信息和联系方式
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">企业名称</Label>
                      <Input
                        id="company-name"
                        value={companyInfo.name}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">所属行业</Label>
                      <Input
                        id="industry"
                        value={companyInfo.industry}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            industry: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scale">企业规模</Label>
                      <Input
                        id="scale"
                        value={companyInfo.scale}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            scale: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在地区</Label>
                      <Input
                        id="location"
                        value={companyInfo.location}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">联系人</Label>
                      <Input
                        id="contact"
                        value={companyInfo.contact}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            contact: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱地址</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyInfo.email}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">联系电话</Label>
                      <Input
                        id="phone"
                        value={companyInfo.phone}
                        onChange={e =>
                          setCompanyInfo({
                            ...companyInfo,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
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
                  <CardDescription>
                    管理系统通知和提醒的接收方式
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">邮件通知</p>
                        <p className="text-sm text-gray-500">
                          接收重要事件和更新的邮件提醒
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">短信通知</p>
                        <p className="text-sm text-gray-500">
                          紧急事件的短信提醒
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">推送通知</p>
                        <p className="text-sm text-gray-500">
                          浏览器和移动端推送通知
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushNotifications: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">系统警报</p>
                        <p className="text-sm text-gray-500">
                          系统异常和安全警告
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            systemAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">订单更新</p>
                        <p className="text-sm text-gray-500">
                          订单状态变更通知
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderUpdates}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            orderUpdates: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">周报</p>
                        <p className="text-sm text-gray-500">
                          每周业务数据汇总报告
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onCheckedChange={checked =>
                          setNotificationSettings({
                            ...notificationSettings,
                            weeklyReports: checked,
                          })
                        }
                      />
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
                  <CardDescription>保护您的账户和企业数据安全</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">两步验证</p>
                        <p className="text-sm text-gray-500">
                          登录时需要额外的验证步骤
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={checked =>
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">IP白名单</p>
                        <p className="text-sm text-gray-500">
                          只允许特定IP地址访问
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.ipWhitelist}
                        onCheckedChange={checked =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipWhitelist: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">会话超时</p>
                        <p className="text-sm text-gray-500">
                          长时间不操作自动退出登录
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.sessionTimeout}
                        onCheckedChange={checked =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">审计日志</p>
                        <p className="text-sm text-gray-500">
                          记录所有管理操作日志
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.auditLogs}
                        onCheckedChange={checked =>
                          setSecuritySettings({
                            ...securitySettings,
                            auditLogs: checked,
                          })
                        }
                      />
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <Button variant="outline" className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        修改密码
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Smartphone className="h-4 w-4 mr-2" />
                        管理登录设备
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 其他设置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    其他设置
                  </CardTitle>
                  <CardDescription>系统界面和语言设置</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">界面主题</p>
                        <p className="text-sm text-gray-500">
                          切换深色/浅色模式
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-gray-500" />
                        <Switch
                          checked={theme === 'dark'}
                          onCheckedChange={handleThemeToggle}
                        />
                        <Moon className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">系统语言</Label>
                      <select
                        id="language"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁體中文</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">时区设置</Label>
                      <select
                        id="timezone"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Asia/Shanghai">
                          中国标准时间 (UTC+8)
                        </option>
                        <option value="Asia/Hong_Kong">香港时间 (UTC+8)</option>
                        <option value="Asia/Tokyo">日本标准时间 (UTC+9)</option>
                        <option value="America/New_York">
                          美国东部时间 (UTC-5)
                        </option>
                        <option value="America/Los_Angeles">
                          美国太平洋时间 (UTC-8)
                        </option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 保存按钮 */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline">重置</Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
