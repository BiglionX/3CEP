'use client';

import { useEffect, useState } from 'react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  resource_type: string;
  enabled: boolean;
  priority: string;
  created_at: string;
}

interface AlertHistory {
  id: string;
  rule_id: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  triggered_at: string;
}

export default function AlertsManagementPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAlertData();
  }, [activeTab]);

  const fetchAlertData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rules') {
        const res = await fetch('/api/admin/alerts/rules');
        const data = await res.json();
        setAlertRules(data.data || []);
      } else {
        const res = await fetch('/api/admin/alerts/history?limit=50');
        const data = await res.json();
        setAlertHistory(data.data || []);
      }
    } catch (error) {
      console.error('获取告警数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleEnabled = async (ruleId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/alerts/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus }),
      });

      if (res.ok) {
        fetchAlertData();
      }
    } catch (error) {
      console.error('更新告警规则失败:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-orange-100 text-orange-800',
      fatal: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">告警管理</h1>
        <p className="text-gray-600">配置告警规则和查看告警历史</p>
      </div>

      {/* 标签页 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            告警规则
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            告警历史
          </button>
        </nav>
      </div>

      {/* 告警规则列表 */}
      {activeTab === 'rules' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">告警规则列表</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              创建新规则
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {alertRules.map(rule => (
                  <li key={rule.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {rule.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {rule.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                              rule.priority
                            )}`}
                          >
                            {rule.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {rule.enabled ? '已启用' : '已禁用'}
                          </span>
                          <button
                            onClick={() =>
                              toggleRuleEnabled(rule.id, rule.enabled)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {rule.enabled ? '禁用' : '启用'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 mr-6">
                            类型：{rule.rule_type}
                          </p>
                          <p className="flex items-center text-sm text-gray-500">
                            资源：{rule.resource_type}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          创建时间：
                          {new Date(rule.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {alertRules.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  暂无告警规则
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 告警历史列表 */}
      {activeTab === 'history' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">告警历史</h2>

          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {alertHistory.map(alert => (
                  <li key={alert.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {alert.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {alert.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              alert.status
                            )}`}
                          >
                            {alert.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          触发时间：
                          {new Date(alert.triggered_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {alertHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  暂无告警记录
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 创建规则模态框（简化版） */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">创建告警规则</h3>
            <p className="text-sm text-gray-500 mb-4">
              此功能需要完整的表单实现，包括规则类型、条件、阈值等配置。
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // TODO: 实现创建逻辑
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
