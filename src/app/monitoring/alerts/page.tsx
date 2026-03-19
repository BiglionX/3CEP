'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Bell,
  Plus,
  Edit,
  Trash2,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertRule } from '@/lib/alert-manager';
import { AlertEvent } from '@/types/monitoring.types';

interface AlertHistoryItem {
  id: string;
  alert_id: string;
  triggered_at: string;
  resolved_at: string;
  value: number;
  status: string;
}

interface AlertRuleFormProps {
  rule: AlertRule;
  onSave: (rule: AlertRule) => void;
  onCancel: () => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({
  rule,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    name: '',
    metric: '',
    condition: 'above',
    threshold: 0,
    severity: 'warning',
    enabled: true,
    frequency_limit: 300,
    duration_threshold: 60,
    notification_channels: ['email'],
    template: {
      subject: '',
      message: '',
    } as { subject: string; message: string },
    ...rule,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...ruleData } = formData as AlertRule;
    const newRule: AlertRule = {
      id: rule.id || `rule_${Date.now()}`,
      created_at: rule.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...ruleData,
    };
    onSave(newRule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">规则名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="metric">监控指标 *</Label>
          <Input
            id="metric"
            value={formData.metric}
            onChange={e => setFormData({ ...formData, metric: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="condition">比较条件</Label>
          <Select
            value={formData.condition}
            onValueChange={(value: any) =>
              setFormData({ ...formData, condition: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">大于</SelectItem>
              <SelectItem value="below">小于</SelectItem>
              <SelectItem value="equal">等于</SelectItem>
              <SelectItem value="change_rate">变化率</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="threshold">阈值*</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={e =>
              setFormData({
                ...formData,
                threshold: parseFloat(e.target.value),
              })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="severity">告警级别</Label>
          <Select
            value={formData.severity}
            onValueChange={(value: any) =>
              setFormData({ ...formData, severity: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">信息</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="error">错误</SelectItem>
              <SelectItem value="critical">严重</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency_limit">频率限制(秒)</Label>
          <Input
            id="frequency_limit"
            type="number"
            value={formData.frequency_limit}
            onChange={e =>
              setFormData({
                ...formData,
                frequency_limit: parseInt(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="duration_threshold">持续时间(秒)</Label>
          <Input
            id="duration_threshold"
            type="number"
            value={formData.duration_threshold}
            onChange={e =>
              setFormData({
                ...formData,
                duration_threshold: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div>
        <Label>通知渠道</Label>
        <div className="flex space-x-4 mt-2">
          {(['email', 'sms', 'webhook', 'slack'] as const).map(channel => (
            <div key={channel} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`channel-${channel}`}
                checked={formData.notification_channels.includes(channel)}
                onChange={e => {
                  const channels = formData.notification_channels || [];
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      notification_channels: [...channels, channel],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      notification_channels: channels.filter(
                        c => c !== channel
                      ),
                    });
                  }
                }}
              />
              <Label htmlFor={`channel-${channel}`} className="capitalize">
                {channel}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="subject_template">告警主题模板</Label>
          <Input
            id="subject_template"
            value={formData.template.subject || ''}
            onChange={e =>
              setFormData({
                ...formData,
                template: {
                  subject: e.target.value,
                  message: formData.template.message || '',
                } as { subject: string; message: string },
              })
            }
            placeholder="例如: 🚨 {{metric}} 告警"
          />
        </div>

        <div>
          <Label htmlFor="message_template">告警消息模板</Label>
          <Textarea
            id="message_template"
            value={formData.template.message || ''}
            onChange={e =>
              setFormData({
                ...formData,
                template: {
                  subject: formData.template.subject || '',
                  message: e.target.value,
                } as { subject: string; message: string },
              })
            }
            placeholder="例如: {{metric}} 当前值{{value}} 超过阈值{{threshold}}"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={checked =>
              setFormData({ ...formData, enabled: checked })
            }
          />
          <Label htmlFor="enabled">启用规则</Label>
        </div>

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit">{rule ? '更新规则' : '创建规则'}</Button>
        </div>
      </div>
    </form>
  );
};

const _AlertList: React.FC<{
  alerts: AlertEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}> = ({ alerts, onAcknowledge, onResolve }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'acknowledged':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无告警</h3>
        <p className="text-gray-600">系统运行正常</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <Card key={alert.id} className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon(alert.status)}
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {alert.message}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">指标:</span>{' '}
                    {alert.metric_name}
                  </div>
                  <div>
                    <span className="font-medium">当前值:</span>{' '}
                    {alert.current_value}
                  </div>
                  <div>
                    <span className="font-medium">阈值:</span> {alert.threshold}
                  </div>
                  <div>
                    <span className="font-medium">状态:</span>
                    <span className="capitalize ml-1">{alert.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {alert.status === 'triggered' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      确认
                    </Button>
                    <Button size="sm" onClick={() => onResolve(alert.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      解决
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function AlertManagementPage() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // 获取活跃告警
      const alertsResponse = await fetch(
        '/api/monitoringaction=alerts&status=active'
      );
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        setAlerts(alertsData.alerts);
      }

      // 获取告警规则
      const rulesResponse = await fetch('/api/monitoringaction=rules');
      const _rulesData = await rulesResponse.json();
      // 模拟规则数据
      setRules([
        {
          id: 'rule1',
          name: '高CPU使用率告警',
          metric: 'cpu_utilization',
          condition: 'above',
          threshold: 85,
          severity: 'warning',
          enabled: true,
          frequency_limit: 300,
          duration_threshold: 180,
          notification_channels: ['email'],
          template: {
            subject: 'CPU使用率过高',
            message: 'CPU使用率{{value}}%超过阈值{{threshold}}%',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // 获取告警历史
      setAlertHistory([
        {
          id: 'history1',
          alert_id: 'alert1',
          triggered_at: new Date(Date.now() - 3600000).toISOString(),
          resolved_at: new Date(Date.now() - 3500000).toISOString(),
          value: 92,
          status: 'resolved',
        },
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const _handleSaveRule = (_rule: AlertRule) => {
    if (editingRule) {
      // 更新规则
      // alertManager.updateAlertRule(rule.id, rule);
    } else {
      // 创建规则
      // alertManager.addAlertRule(rule);
    }
    setShowRuleForm(false);
    setEditingRule(undefined);
    loadData();
  };

  const _handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowRuleForm(true);
  };

  const _handleDeleteRule = (_ruleId: string) => {
    if (confirm('确定要删除这个告警规则吗')) {
      // alertManager.deleteAlertRule(ruleId);
      loadData();
    }
  };

  const handleAcknowledgeAlert = (_alertId: string) => {
    // alertManager.acknowledgeAlert(alertId, 'admin', '已确认处理');
    loadData();
  };

  const handleResolveAlert = (_alertId: string) => {
    // alertManager.resolveAlert(alertId, 'admin', '已解决问题');
    loadData();
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.metric_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部区域 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3 text-red-600" />
              告警管理中心
            </h1>
            <p className="mt-2 text-gray-600">
              统一管理系统的各类告警和通知规则
            </p>
          </div>

          <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingRule(undefined);
                  setShowRuleForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                新建规则
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? '编辑告警规则' : '新建告警规则'}
                </DialogTitle>
              </DialogHeader>
              {showRuleForm && (
                <AlertRuleForm
                  rule={editingRule}
                  onSave={_handleSaveRule}
                  onCancel={() => {
                    setShowRuleForm(false);
                    setEditingRule(undefined);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">活跃告警</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alerts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">告警规则</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {rules.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">已解决</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alertHistory.filter(h => h.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => a.status === 'triggered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索告警..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="告警级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有级别</SelectItem>
                <SelectItem value="critical">严重</SelectItem>
                <SelectItem value="error">错误</SelectItem>
                <SelectItem value="warning">警告</SelectItem>
                <SelectItem value="info">信息</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="告警状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="triggered">已触发</SelectItem>
                <SelectItem value="acknowledged">已确认</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 告警列表 */}
      <_AlertList
        alerts={filteredAlerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />

      {/* 告警规则列表 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              告警规则管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">
                      监控 {rule.metric} {rule.condition} {rule.threshold}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? '启用' : '禁用'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {rule.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        更新于 {new Date(rule.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => _handleEditRule(rule)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => _handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </Button>
                    <Button
                      size="sm"
                      variant={rule.enabled ? 'outline' : 'default'}
                      onClick={() => {
                        // alertManager.updateAlertRule(rule.id, {
                        //   enabled: !rule.enabled,
                        // });
                        loadData();
                      }}
                    >
                      {rule.enabled  (
                        <Pause className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {rule.enabled ? '禁用' : '启用'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
