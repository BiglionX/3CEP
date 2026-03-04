/**
 * 权限控制演示页面
 * 展示各种权限控制组件的使用方? */

'use client';

import {
  ActionMenu,
  PermissionButton,
  PermissionControl,
  PermissionField,
} from '@/components/admin/PermissionControls';
import { PermissionGuard, RoleGuard } from '@/hooks/use-permission';
import {
  Edit,
  Eye,
  Plus,
  Settings,
  Shield,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PermissionsDemoPage() {
  const [selectedRole, setSelectedRole] = useState('admin');

  // 模拟用户数据
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'content_manager' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer' },
  ];

  // 模拟动作
  const userActions = [
    {
      label: '查看详情',
      onClick: (user: any) => alert(`查看用户: ${user.name}`),
      icon: <Eye className="w-4 h-4" />,
      permission: 'users_read',
    },
    {
      label: '编辑用户',
      onClick: (user: any) => alert(`编辑用户: ${user.name}`),
      icon: <Edit className="w-4 h-4" />,
      permission: 'users_update',
    },
    {
      label: '删除用户',
      onClick: (user: any) => alert(`删除用户: ${user.name}`),
      icon: <Trash2 className="w-4 h-4" />,
      permission: 'users_delete',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          权限控制系统演示
        </h1>
        <p className="text-gray-600">展示基于角色的界面元素动态显示控?/p>
      </div>

      {/* 角色切换?*/}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">角色模拟?/h2>
        <div className="flex flex-wrap gap-2">
          {[
            'admin',
            'manager',
            'content_manager',
            'shop_manager',
            'viewer',
          ].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRole === role
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          当前模拟角色:{' '}
          <span className="font-medium text-gray-900">{selectedRole}</span>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/admin/auth-test"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <User className="w-4 h-4 mr-2" />
            前往完整权限测试页面
          </Link>
        </div>
      </div>

      {/* 权限按钮演示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">权限按钮控制</h2>

          <div className="space-y-3">
            <PermissionButton
              permission="users_create"
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建用户
            </PermissionButton>

            <PermissionButton
              permission="content_create"
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              发布内容
            </PermissionButton>

            <PermissionButton
              permission="settings_update"
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              系统设置
            </PermissionButton>

            <PermissionButton
              permission="users_delete"
              disableInsteadOfHide={true}
              tooltip="需要管理员权限才能删除用户"
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除用户（禁用模式）
            </PermissionButton>
          </div>
        </div>

        {/* 权限容器演示 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">权限容器控制</h2>

          <PermissionControl permission="users_read">
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-2">用户管理面板</h3>
              <p className="text-blue-600 text-sm">
                只有具有用户查看权限的用户才能看到这个面?              </p>
            </div>
          </PermissionControl>

          <PermissionControl permission="content_read" className="mt-4">
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">内容管理面板</h3>
              <p className="text-green-600 text-sm">
                只有具有内容查看权限的用户才能看到这个面?              </p>
            </div>
          </PermissionControl>

          <PermissionControl role={['admin', 'manager']} className="mt-4">
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-2">高级管理面板</h3>
              <p className="text-purple-600 text-sm">仅管理员和经理角色可?/p>
            </div>
          </PermissionControl>
        </div>
      </div>

      {/* 表格权限控制演示 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">用户列表（带权限控制?/h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户?                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <PermissionControl permission="users_read">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </PermissionControl>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <PermissionControl permission="users_read">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ActionMenu actions={userActions} rowData={user} />
                    </td>
                  </PermissionControl>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 表单权限控制演示 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">表单字段权限控制</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PermissionField permission="users_create" label="用户?>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入用户?
            />
          </PermissionField>

          <PermissionField permission="users_create" label="邮箱">
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入邮箱"
            />
          </PermissionField>

          <PermissionField requiredRole={['admin', 'manager']} label="用户角色">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择角色</option>
              <option value="admin">管理?/option>
              <option value="content_manager">内容管理?/option>
              <option value="viewer">查看?/option>
            </select>
          </PermissionField>

          <PermissionField permission="settings_update" label="系统配置">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="输入系统配置"
            />
          </PermissionField>
        </div>

        <div className="mt-6 flex space-x-3">
          <PermissionButton
            permission="users_create"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            保存用户
          </PermissionButton>

          <PermissionButton
            permission="users_update"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            更新信息
          </PermissionButton>
        </div>
      </div>

      {/* 角色守卫演示 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">角色守卫演示</h2>

        <div className="space-y-4">
          <RoleGuard
            roles={['admin']}
            fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">仅管理员可见的内容区?/span>
                </div>
              </div>
            }
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">
                  管理员专?- 系统核心配置
                </span>
              </div>
              <p className="mt-2 text-green-600 text-sm">
                这里包含系统最重要的配置选项，只有管理员才能访问和修改?              </p>
            </div>
          </RoleGuard>

          <PermissionGuard
            permission={['content_create', 'content_update']}
            fallback={
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-700">您没有内容管理权?/span>
              </div>
            }
          >
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-700 font-medium">内容创作工作?/span>
              <p className="mt-1 text-blue-600 text-sm">
                欢迎进入内容创作空间，您可以在这里创建和编辑精彩内容?              </p>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}
