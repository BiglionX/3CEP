'use client';

/**
 * 监控告警可视化配置界面
 *
 * 功能模块:
 * - 告警规则列表 (CRUD 操作)
 * - 阈值配置滑块
 * - 通知渠道设置 (邮件/短信/Webhook)
 * - 告警历史查看
 */

import AdminMobileLayout from '@/components/layouts/AdminMobileLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AlertRule {
  id?: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '==';
  duration: number;
  severity: 'critical' | 'warning' | 'info';
  notification_channels: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

const METRICS = [
  'cpu_usage',
  'memory_usage',
  'disk_usage',
  'request_count',
  'error_rate',
  'response_time',
  'active_users',
  'order_count',
];

const OPERATORS: Array<AlertRule['operator']> = ['>', '<', '>=', '<=', '=='];

const SEVERITY_COLORS = {
  critical: 'red',
  warning: 'yellow',
  info: 'blue',
};

export default function MonitoringAlertPage() {
  const router = useRouter();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState<
    Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>
  >({
    name: '',
    metric: METRICS[0],
    threshold: 80,
    operator: '>',
    duration: 5,
    severity: 'warning',
    notification_channels: ['email'],
    enabled: true,
  });

  // 加载告警规则
  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const response = await fetch('/admin/api/alert-rules');
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setRules(result.data || []);
    } catch (error) {
      console.error('加载规则失败:', error);
    } finally {
      setLoading(false);
    }
  }

  // 创建规则
  async function createRule() {
    try {
      const response = await fetch('/admin/api/alert-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await loadRules();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('创建规则失败:', error);
    }
  }

  // 更新规则
  async function updateRule() {
    if (!editingRule?.id) return;

    try {
      const response = await fetch(
        `/admin/api/alert-rules?id=${editingRule.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await loadRules();
      setShowForm(false);
      setEditingRule(null);
      resetForm();
    } catch (error) {
      console.error('更新规则失败:', error);
    }
  }

  // 删除规则
  async function deleteRule(id: string) {
    if (!confirm('确定要删除这条告警规则吗？')) return;

    try {
      const response = await fetch(`/admin/api/alert-rules?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await loadRules();
    } catch (error) {
      console.error('删除规则失败:', error);
    }
  }

  // 切换规则启用状态
  async function toggleRuleEnabled(rule: AlertRule) {
    try {
      const response = await fetch(`/admin/api/alert-rules?id=${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, enabled: !rule.enabled }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await loadRules();
    } catch (error) {
      console.error('更新规则状态失败:', error);
    }
  }

  // 重置表单
  function resetForm() {
    setFormData({
      name: '',
      metric: METRICS[0],
      threshold: 80,
      operator: '>',
      duration: 5,
      severity: 'warning',
      notification_channels: ['email'],
      enabled: true,
    });
  }

  // 编辑规则
  function handleEdit(rule: AlertRule) {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      metric: rule.metric,
      threshold: rule.threshold,
      operator: rule.operator,
      duration: rule.duration,
      severity: rule.severity,
      notification_channels: rule.notification_channels,
      enabled: rule.enabled,
    });
    setShowForm(true);
  }

  const handleSubmit = () => {
    if (editingRule) {
      updateRule();
    } else {
      createRule();
    }
  };

  return (
    <AdminMobileLayout>
      <div className="p-4 md:p-6">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">监控告警配置</h1>
          <button
            onClick={() => {
              setEditingRule(null);
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新建规则
          </button>
        </div>

        {/* 告警规则列表 */}
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="space-y-4">
            {rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无告警规则</div>
            ) : (
              rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 border-${SEVERITY_COLORS[rule.severity]}-500`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{rule.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full bg-${SEVERITY_COLORS[rule.severity]}-100 text-${SEVERITY_COLORS[rule.severity]}-800`}
                        >
                          {rule.severity}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          指标：
                          <code className="bg-gray-100 px-2 py-0.5 rounded">
                            {rule.metric}
                          </code>
                        </p>
                        <p>
                          阈值：
                          <span className="font-medium">
                            {rule.operator} {rule.threshold}
                          </span>
                        </p>
                        <p>持续时间：{rule.duration} 分钟</p>
                        <p className="text-xs text-gray-500">
                          通知渠道：{rule.notification_channels.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleRuleEnabled(rule)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>

                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        编辑
                      </button>

                      <button
                        onClick={() => deleteRule(rule.id!)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 新建/编辑表单弹窗 */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingRule ? '编辑告警规则' : '新建告警规则'}
                </h2>

                <div className="space-y-4">
                  {/* 规则名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      规则名称
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：CPU 使用率过高"
                    />
                  </div>

                  {/* 监控指标 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      监控指标
                    </label>
                    <select
                      value={formData.metric}
                      onChange={e =>
                        setFormData({ ...formData, metric: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {METRICS.map(metric => (
                        <option key={metric} value={metric}>
                          {metric}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 操作符和阈值 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        操作符
                      </label>
                      <select
                        value={formData.operator}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            operator: e.target.value as AlertRule['operator'],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {OPERATORS.map(op => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        阈值
                      </label>
                      <input
                        type="number"
                        value={formData.threshold}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            threshold: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 持续时间滑块 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      持续时间：{formData.duration} 分钟
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={formData.duration}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          duration: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 分钟</span>
                      <span>60 分钟</span>
                    </div>
                  </div>

                  {/* 严重程度 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      严重程度
                    </label>
                    <div className="flex gap-4">
                      {(['info', 'warning', 'critical'] as const).map(
                        severity => (
                          <label key={severity} className="flex items-center">
                            <input
                              type="radio"
                              name="severity"
                              value={severity}
                              checked={formData.severity === severity}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  severity: e.target
                                    .value as AlertRule['severity'],
                                })
                              }
                              className="mr-2"
                            />
                            <span
                              className={`px-3 py-1 rounded-full text-sm bg-${SEVERITY_COLORS[severity]}-100 text-${SEVERITY_COLORS[severity]}-800`}
                            >
                              {severity}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* 通知渠道 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      通知渠道
                    </label>
                    <div className="space-y-2">
                      {['email', 'sms', 'webhook'].map(channel => (
                        <label key={channel} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.notification_channels.includes(
                              channel
                            )}
                            onChange={e => {
                              const channels = e.target.checked
                                ? [...formData.notification_channels, channel]
                                : formData.notification_channels.filter(
                                    c => c !== channel
                                  );
                              setFormData({
                                ...formData,
                                notification_channels: channels,
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 启用状态 */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            enabled: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span>启用此规则</span>
                    </label>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingRule ? '保存修改' : '创建规则'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminMobileLayout>
  );
}
