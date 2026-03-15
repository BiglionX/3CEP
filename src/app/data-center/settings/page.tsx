'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Network,
  Bell,
  User,
  Palette,
  Shield,
  Save,
  RotateCcw,
  Mail,
  Server,
  HardDrive,
  Zap,
  Cloud,
  Key,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SystemConfig {
  general: {
    siteName: string;
    timezone: string;
    language: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
  };
  database: {
    maxConnections: number;
    queryTimeout: number;
    cacheEnabled: boolean;
    backupSchedule: string;
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    webhookUrl: string;
    alertThreshold: number;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    ipWhitelist: string[];
  };
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: '数据管理中心',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD',
      theme: 'auto',
    },
    database: {
      maxConnections: 100,
      queryTimeout: 30000,
      cacheEnabled: true,
      backupSchedule: '0 2 * * *',
    },
    notifications: {
      emailEnabled: true,
      slackEnabled: false,
      webhookUrl: '',
      alertThreshold: 5,
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 3600,
      twoFactorEnabled: false,
      ipWhitelist: [],
    },
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    section: keyof SystemConfig,
    field: string,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 模拟保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('配置已保', config)} catch (error) {
      console.error('保存配置失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // 重置为默认配    setConfig({
      general: {
        siteName: '数据管理中心',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        theme: 'auto',
      },
      database: {
        maxConnections: 100,
        queryTimeout: 30000,
        cacheEnabled: true,
        backupSchedule: '0 2 * * *',
      },
      notifications: {
        emailEnabled: true,
        slackEnabled: false,
        webhookUrl: '',
        alertThreshold: 5,
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 3600,
        twoFactorEnabled: false,
        ipWhitelist: [],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-600 mt-1">配置数据管理中心的各项系统参/p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            通用设置
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            数据源          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            安全
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                基础配置
              </CardTitle>
              <CardDescription>系统的基本信息和外观设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">站点名称</Label>
                  <Input
                    id="siteName"
                    value={config.general.siteName}
                    onChange={e =>
                      handleInputChange('general', 'siteName', e.target.value)
                    }
                    placeholder="输入站点名称"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">时区</Label>
                  <Select
                    value={config.general.timezone}
                    onValueChange={value =>
                      handleInputChange('general', 'timezone', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择时区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Shanghai">
                        亚洲/上海 (GMT+8)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        美洲/纽约 (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        欧洲/伦敦 (GMT+0)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">语言</Label>
                  <Select
                    value={config.general.language}
                    onValueChange={value =>
                      handleInputChange('general', 'language', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">中文 (简</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">日期格式</Label>
                  <Select
                    value={config.general.dateFormat}
                    onValueChange={value =>
                      handleInputChange('general', 'dateFormat', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择日期格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>主题模式</Label>
                <div className="flex space-x-4">
                  {(['light', 'dark', 'auto'] as const).map(theme => (
                    <Button
                      key={theme}
                      variant={
                        config.general.theme === theme  'default' : 'outline'
                      }
                      onClick={() =>
                        handleInputChange('general', 'theme', theme)
                      }
                      className="capitalize"
                    >
                      {theme === 'light'
                         '明亮'
                        : theme === 'dark'
                           '暗黑'
                          : '自动'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                数据库配              </CardTitle>
              <CardDescription>数据库连接和性能相关设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxConnections">最大连接数</Label>
                  <Input
                    id="maxConnections"
                    type="number"
                    value={config.database.maxConnections}
                    onChange={e =>
                      handleInputChange(
                        'database',
                        'maxConnections',
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queryTimeout">查询超时 (毫秒)</Label>
                  <Input
                    id="queryTimeout"
                    type="number"
                    value={config.database.queryTimeout}
                    onChange={e =>
                      handleInputChange(
                        'database',
                        'queryTimeout',
                        parseInt(e.target.value)
                      )
                    }
                    min="1000"
                    max="300000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>查询缓存</Label>
                  <p className="text-sm text-gray-500">
                    启用查询结果缓存以提高性能
                  </p>
                </div>
                <Switch
                  checked={config.database.cacheEnabled}
                  onCheckedChange={checked =>
                    handleInputChange('database', 'cacheEnabled', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupSchedule">备份计划 (Cron表达</Label>
                <Input
                  id="backupSchedule"
                  value={config.database.backupSchedule}
                  onChange={e =>
                    handleInputChange(
                      'database',
                      'backupSchedule',
                      e.target.value
                    )
                  }
                  placeholder="0 2 * * *"
                />
                <p className="text-sm text-gray-500">每天凌晨2点执行备/p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                通知配置
              </CardTitle>
              <CardDescription>系统通知和告警设/CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>邮件通知</Label>
                    <p className="text-sm text-gray-500">
                      通过邮件发送系统通知
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={checked =>
                      handleInputChange(
                        'notifications',
                        'emailEnabled',
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Slack通知</Label>
                    <p className="text-sm text-gray-500">
                      通过Slack发送重要告                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.slackEnabled}
                    onCheckedChange={checked =>
                      handleInputChange(
                        'notifications',
                        'slackEnabled',
                        checked
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={config.notifications.webhookUrl}
                  onChange={e =>
                    handleInputChange(
                      'notifications',
                      'webhookUrl',
                      e.target.value
                    )
                  }
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertThreshold">告警阈/Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  value={config.notifications.alertThreshold}
                  onChange={e =>
                    handleInputChange(
                      'notifications',
                      'alertThreshold',
                      parseInt(e.target.value)
                    )
                  }
                  min="1"
                  max="100"
                />
                <p className="text-sm text-gray-500">
                  当未处理告警数量达到此值时发送通知
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                安全配置
              </CardTitle>
              <CardDescription>用户安全和访问控制设/CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">密码最小长/Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={e =>
                      handleInputChange(
                        'security',
                        'passwordMinLength',
                        parseInt(e.target.value)
                      )
                    }
                    min="6"
                    max="32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">会话超时 (</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={e =>
                      handleInputChange(
                        'security',
                        'sessionTimeout',
                        parseInt(e.target.value)
                      )
                    }
                    min="300"
                    max="86400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>双因素认/Label>
                  <p className="text-sm text-gray-500">
                    启用双因素认证增强账户安                  </p>
                </div>
                <Switch
                  checked={config.security.twoFactorEnabled}
                  onCheckedChange={checked =>
                    handleInputChange('security', 'twoFactorEnabled', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>IP白名/Label>
                <Input
                  placeholder="输入允许访问的IP地址，多个IP用逗号分隔"
                  value={config.security.ipWhitelist.join(', ')}
                  onChange={e =>
                    handleInputChange(
                      'security',
                      'ipWhitelist',
                      e.target.value.split(',').map(ip => ip.trim())
                    )
                  }
                />
                <p className="text-sm text-gray-500">留空表示不限制IP访问</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          重置
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving  (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              保存..
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存配置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

