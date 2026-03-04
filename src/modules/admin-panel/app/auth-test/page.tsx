'use client';

import { useState, useEffect } from 'react';
import {
  useUser,
  setMockToken,
  clearMockToken,
} from '@/components/providers/AuthProvider';
import { RoleGuard, PermissionGuard, Guard } from '@/components/RoleGuard';
import { UserRole } from '@/lib/auth-service';

export default function AuthTestPage() {
  const { user, roles, tenantId, isLoading, hasPermission, refreshUser } =
    useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [testPermission, setTestPermission] = useState('dashboard.view');

  // 测试不同的角?  const testRoles: UserRole[] = [
    'admin',
    'content_reviewer',
    'shop_reviewer',
    'finance',
    'viewer',
  ];

  const handleSetMockUser = (role: UserRole) => {
    const userId = `test-${role}-${Date.now()}`;
    setMockToken(userId, role, 'test-tenant-123');
    setSelectedRole(role);
    // 刷新用户信息
    setTimeout(() => refreshUser(), 100);
  };

  const handleClearMockUser = () => {
    clearMockToken();
    setSelectedRole('viewer');
    setTimeout(() => refreshUser(), 100);
  };

  const handleTestPermission = () => {
    const hasPerm = hasPermission(testPermission);
    alert(
      `权限 "${testPermission}" 检查结? ${hasPerm ? '有权? : '无权?}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            前端权限系统测试
          </h1>
          <p className="text-gray-600">
            验证 useAuth Hook、RoleGuard 组件和路由守卫功?          </p>
        </div>

        {/* 用户信息显示 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载?..</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">基本信息</h3>
                <div className="space-y-2 text-sm">
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
                  <div>
                    <span className="font-medium">租户ID:</span>{' '}
                    {tenantId || '无租?}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">权限测试</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={testPermission}
                    onChange={e => setTestPermission(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="输入权限标识"
                  />
                  <button
                    onClick={handleTestPermission}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    测试
                  </button>
                </div>

                <div className="text-sm space-y-1">
                  <div>常用权限测试:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'dashboard.view',
                      'content.read',
                      'content.write',
                      'users.read',
                    ].map(perm => (
                      <button
                        key={perm}
                        onClick={() => setTestPermission(perm)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                      >
                        {perm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 角色切换测试 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">角色切换测试</h2>

          <div className="mb-4">
            <p className="text-gray-600 mb-3">
              点击下方按钮切换测试角色，验证权限变?
            </p>
            <div className="flex flex-wrap gap-3">
              {testRoles.map(role => (
                <button
                  key={role}
                  onClick={() => handleSetMockUser(role)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedRole === role
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
              <button
                onClick={handleClearMockUser}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
              >
                清除模拟用户
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              <strong>说明:</strong>{' '}
              点击角色按钮会设置模拟token，刷新页面后可以看到不同角色的权限效?            </p>
          </div>
        </div>

        {/* RoleGuard 测试区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">RoleGuard 组件测试</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 管理员专?*/}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-red-600">管理员专?/h3>
              <RoleGuard
                roles="admin"
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?仅管理员可见
                  </div>
                }
              >
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  �?欢迎管理员！这里是系统核心配置区域?                </div>
              </RoleGuard>
            </div>

            {/* 内容审核专区 */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-blue-600">内容审核专区</h3>
              <RoleGuard
                roles={['admin', 'content_reviewer']}
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?仅管理员和内容审核员可见
                  </div>
                }
              >
                <div className="text-blue-600 bg-blue-50 p-3 rounded">
                  �?内容审核面板 - 可以审核和管理用户提交的内容?                </div>
              </RoleGuard>
            </div>

            {/* 商店管理专区 */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-purple-600">商店管理专区</h3>
              <RoleGuard
                roles={['admin', 'shop_reviewer']}
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?仅管理员和商店审核员可见
                  </div>
                }
              >
                <div className="text-purple-600 bg-purple-50 p-3 rounded">
                  �?商店管理面板 - 可以审核和管理商家信息?                </div>
              </RoleGuard>
            </div>

            {/* 财务管理专区 */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-orange-600">财务管理专区</h3>
              <RoleGuard
                roles={['admin', 'finance']}
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?仅管理员和财务人员可?                  </div>
                }
              >
                <div className="text-orange-600 bg-orange-50 p-3 rounded">
                  �?财务管理面板 - 可以查看和处理财务相关事务?                </div>
              </RoleGuard>
            </div>
          </div>
        </div>

        {/* PermissionGuard 测试区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            PermissionGuard 组件测试
          </h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">仪表板访问权?/h3>
              <PermissionGuard
                permissions="dashboard.view"
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?无仪表板访问权限
                  </div>
                }
              >
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  �?您有仪表板访问权?                </div>
              </PermissionGuard>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">内容编辑权限</h3>
              <PermissionGuard
                permissions="content.write"
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?无内容编辑权?                  </div>
                }
              >
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  �?您有内容编辑权限
                </div>
              </PermissionGuard>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">用户管理权限</h3>
              <PermissionGuard
                permissions="users.read"
                fallback={
                  <div className="text-red-500 bg-red-50 p-3 rounded">
                    �?无用户管理权?                  </div>
                }
              >
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  �?您有用户管理权限
                </div>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* 控制台验证区?*/}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">控制台验?/h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">验证步骤:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>打开浏览器开发者工?(F12)</li>
                <li>切换?Console 标签?/li>
                <li>在控制台中输入以下命令验?</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">控制台验证命?</h4>
              <div className="space-y-2 text-sm">
                <div className="font-mono bg-white p-2 rounded">
                  // 获取当前用户信息
                  <br />
                  window.useUser = () =&gt; &#123; /* 这里会在组件挂载时注?*/
                  &#125;;
                </div>
                <div className="font-mono bg-white p-2 rounded">
                  // 检查具体权?                  <br />
                  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('当前角色:', {roles})<br />
                  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('租户ID:', {tenantId})<br />
                  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('是否有仪表板权限:',
                  hasPermission('dashboard.view'));
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>预期结果:</strong>{' '}
                在控制台中应该能够看到当前的用户角色、租户ID以及权限检查结?              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
