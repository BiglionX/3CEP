/**
 * RBAC 权限演示页面
 * 展示新的 useRbacPermission Hook 的使用方? */

'use client';

import { useRbacPermission } from '@/hooks/use-rbac-permission';
import { useState } from 'react';

export default function RbacDemoPage() {
  const {
    user,
    roles,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAccessibleResources,
    getPermissionInfo,
    getRoleInfo,
  } = useRbacPermission();

  const [testPermission, setTestPermission] = useState('dashboard_read');

  // 测试权限列表
  const testPermissions = [
    'dashboard_read',
    'users_create',
    'content_approve',
    'n8n_workflows_replay',
    'agents_invoke',
    'tools_execute',
    'audit_read',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载?..</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RBAC 权限演示
          </h1>
          <p className="text-gray-600">基于 config/rbac.json 的权限检查演?/p>
        </div>

        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">基本信息</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">用户ID:</span>{' '}
                  {user?.id || '未登?}
                </div>
                <div>
                  <span className="font-medium">邮箱:</span>{' '}
                  {user?.email || '未登?}
                </div>
                <div>
                  <span className="font-medium">当前角色:</span>{' '}
                  {roles.join(', ') || '无角?}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">可访问资?/h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">仪表板类:</span>{' '}
                  {getAccessibleResources('dashboard').join(', ') || '�?}
                </div>
                <div>
                  <span className="font-medium">用户管理:</span>{' '}
                  {getAccessibleResources('user_management').join(', ') || '�?}
                </div>
                <div>
                  <span className="font-medium">内容管理:</span>{' '}
                  {getAccessibleResources('content_management').join(', ') ||
                    '�?}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 权限测试 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">权限检查测?/h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              测试权限?
            </label>
            <select
              value={testPermission}
              onChange={e => setTestPermission(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {testPermissions.map(perm => (
                <option key={perm} value={perm}>
                  {perm}
                </option>
              ))}
            </select>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="font-medium mb-2">权限详情:</div>
              <div className="text-sm text-gray-600">
                {getPermissionInfo(testPermission) ? (
                  <div>
                    <div>名称: {getPermissionInfo(testPermission).name}</div>
                    <div>
                      描述: {getPermissionInfo(testPermission).description}
                    </div>
                    <div>
                      资源: {getPermissionInfo(testPermission).resource}
                    </div>
                    <div>操作: {getPermissionInfo(testPermission).action}</div>
                    <div>
                      类别: {getPermissionInfo(testPermission).category}
                    </div>
                  </div>
                ) : (
                  '权限信息未找?
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">单一权限检?/h3>
              <div
                className={`text-lg font-semibold ${hasPermission(testPermission) ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasPermission(testPermission) ? '�?有权? : '�?无权?}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">任意权限检?/h3>
              <div
                className={`text-lg font-semibold ${hasAnyPermission(['dashboard_read', testPermission]) ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasAnyPermission(['dashboard_read', testPermission])
                  ? '�?有任一权限'
                  : '�?无任一权限'}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">全部权限检?/h3>
              <div
                className={`text-lg font-semibold ${hasAllPermissions(['dashboard_read', testPermission]) ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasAllPermissions(['dashboard_read', testPermission])
                  ? '�?有全部权?
                  : '�?无全部权?}
              </div>
            </div>
          </div>
        </div>

        {/* 角色信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">角色权限详情</h2>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">
                  角色: {getRoleInfo(role)?.name || role}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  {getRoleInfo(role)?.description || '暂无描述'}
                </div>
                <div className="text-xs">
                  <span className="font-medium">权限列表:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {/* 这里应该显示该角色的具体权限，但由于 hook 设计限制，暂时显示固定权?*/}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      dashboard_read
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API 调用演示 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API 权限验证演示</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">工作流回?(/api/n8n/replay)</h3>
              <div
                className={`text-sm ${hasPermission('n8n_workflows_replay') ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasPermission('n8n_workflows_replay')
                  ? '�?可以调用 - 已通过权限验证'
                  : '�?无法调用 - 权限不足'}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">
                智能体调?(/api/agents/invoke)
              </h3>
              <div
                className={`text-sm ${hasPermission('agents_invoke') ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasPermission('agents_invoke')
                  ? '�?可以调用 - 已通过权限验证'
                  : '�?无法调用 - 权限不足'}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">
                工具执行 (/api/tools/execute)
              </h3>
              <div
                className={`text-sm ${hasPermission('tools_execute') ? 'text-green-600' : 'text-red-600'}`}
              >
                {hasPermission('tools_execute')
                  ? '�?可以执行 - 已通过权限验证'
                  : '�?无法执行 - 权限不足'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

