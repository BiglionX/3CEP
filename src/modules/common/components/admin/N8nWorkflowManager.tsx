/**
 * n8n 工作流权限管理组? * 提供工作流访问控制和权限管理界面
 */

'use client';

import {
  PermissionButton,
  PermissionControl,
} from '@/components/admin/PermissionControls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';
import {
  AlertTriangle,
  Eye,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * n8n 工作流列表组? */
export function N8nWorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = usePermission();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/n8n/workflows');
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('加载工作流列表失?);
      console.error('加载工作流失?', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async workflowId => {
    try {
      const response = await fetch('/api/n8n/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          action: 'execute',
          inputData: {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('工作流执行成?);
      } else {
        alert(`执行失败: ${result.error}`);
      }
    } catch (error) {
      alert('执行工作流时发生错误');
    }
  };

  const handleUpdatePermissions = async workflowId => {
    // 这里应该打开权限编辑模态框
    alert(`编辑工作?${workflowId} 的权限配置`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <Button
          onClick={loadWorkflows}
          className="mt-4 bg-red-500 hover:bg-red-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作?*/}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">n8n 工作流管?/h2>
          <p className="text-gray-600 mt-1">管理和监控自动化工作?/p>
        </div>

        <PermissionControl permission="n8n_workflows_manage">
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            创建工作?          </Button>
        </PermissionControl>
      </div>

      {/* 工作流统计卡?*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">总计工作?/p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">可执?/p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.permissions.canExecute).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">可管?/p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.permissions.canManage).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">受限访问</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => !w.permissions.canRead).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 工作流列?*/}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">工作流列?/h3>
        </div>

        <div className="divide-y divide-gray-200">
          {workflows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无工作?              </h3>
              <p className="text-gray-500">还没有配置任?n8n 工作?/p>
            </div>
          ) : (
            workflows.map(workflow => (
              <div key={workflow.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {workflow.name}
                      </h4>
                      <div className="ml-2 flex space-x-1">
                        {workflow.permissions.canRead && (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            可读?                          </Badge>
                        )}
                        {workflow.permissions.canExecute && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            可执?                          </Badge>
                        )}
                        {workflow.permissions.canManage && (
                          <Badge variant="destructive" className="text-xs">
                            <Settings className="w-3 h-3 mr-1" />
                            可管?                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>ID: {workflow.id}</span>
                      <span className="mx-2">�?/span>
                      <span>状? {workflow.active ? '激? : '停用'}</span>
                      <span className="mx-2">�?/span>
                      <span>
                        创建时间:{' '}
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <PermissionControl permission="n8n_workflows_read">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          alert(`查看工作流详? ${workflow.name}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </PermissionControl>

                    <PermissionControl permission="n8n_workflows_execute">
                      <PermissionButton
                        permission="n8n_workflows_execute"
                        disabled={!workflow.permissions.canExecute}
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        className="flex items-center px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        执行
                      </PermissionButton>
                    </PermissionControl>

                    <PermissionControl permission="n8n_workflows_manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdatePermissions(workflow.id)}
                        disabled={!workflow.permissions.canManage}
                        className={
                          workflow.permissions.canManage
                            ? ''
                            : 'opacity-50 cursor-not-allowed'
                        }
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    </PermissionControl>

                    <PermissionControl permission="n8n_workflows_manage">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`删除工作? ${workflow.name}`)}
                        disabled={!workflow.permissions.canManage}
                        className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </PermissionControl>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 工作流权限配置组? */
export function WorkflowPermissionConfig({ workflowId, onClose }) {
  const [permissions, setPermissions] = useState({
    readRoles: [],
    executeRoles: [],
    manageRoles: [],
  });
  const [saving, setSaving] = useState(false);
  const { hasPermission } = usePermission();

  const availableRoles = [
    'admin',
    'manager',
    'content_manager',
    'shop_manager',
    'finance_manager',
    'procurement_specialist',
    'warehouse_operator',
    'agent_operator',
    'viewer',
  ];

  const handleRoleToggle = (permissionType, role) => {
    setPermissions(prev => {
      const currentRoles = [...prev[permissionType]];
      const index = currentRoles.indexOf(role);

      if (index > -1) {
        currentRoles.splice(index, 1);
      } else {
        currentRoles.push(role);
      }

      return {
        ...prev,
        [permissionType]: currentRoles,
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/n8n/workflows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          permissions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('权限配置保存成功');
        onClose();
      } else {
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      alert('保存权限配置时发生错?);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              <Shield className="w-5 h-5 inline mr-2" />
              工作流权限配?            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* 读取权限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Eye className="w-4 h-4 inline mr-2" />
                读取权限 (可查看工作流)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleToggle('readRoles', role)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      permissions.readRoles.includes(role)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* 执行权限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Play className="w-4 h-4 inline mr-2" />
                执行权限 (可运行工作流)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleToggle('executeRoles', role)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      permissions.executeRoles.includes(role)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* 管理权限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Settings className="w-4 h-4 inline mr-2" />
                管理权限 (可修改配?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleToggle('manageRoles', role)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      permissions.manageRoles.includes(role)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <PermissionButton
            permission="n8n_workflows_manage"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                保存?..
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                保存权限
              </>
            )}
          </PermissionButton>
        </div>
      </div>
    </div>
  );
}
