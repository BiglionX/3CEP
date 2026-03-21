'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useState } from 'react';

export default function UnifiedAuthTest() {
  const {
    user,
    isAuthenticated,
    is_admin,
    roles,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
  } = useUnifiedAuth();

  const [testEmail, setTestEmail] = useState('1055603323@qq.com');
  const [testPassword, setTestPassword] = useState('12345678');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await login(testEmail, testPassword);
      if (!result.success) {
        setLoginError(result.error || '登录失败');
      }
    } catch (error: any) {
      setLoginError(error.message || '登录出错');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      console.error('登出失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            统一认证系统测试
          </h1>

          {/* 当前状态显示 */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">
              当前认证状态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">认证状态</p>
                <p
                  className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isAuthenticated ? '已认证' : '未认证'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">管理员权限</p>
                <p
                  className={`font-medium ${is_admin ? 'text-green-600' : 'text-red-600'}`}
                >
                  {is_admin ? '是管理员' : '非管理员'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">加载状态</p>
                <p
                  className={`font-medium ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}
                >
                  {isLoading ? '加载中...' : '已就绪'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">用户邮箱:</p>
                <p className="font-medium text-gray-900">
                  {user?.email || '无'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-red-700 text-sm">错误: {error}</p>
              </div>
            )}
          </div>

          {/* 登录测试区域 */}
          {!isAuthenticated ? (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                登录测试
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入邮箱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={e => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入密码"
                  />
                </div>
                {loginError && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded">
                    <p className="text-red-700 text-sm">
                      登录错误: {loginError}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {loginLoading ? '登录中...' : '测试登录'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                已登录
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  退出登录
                </button>
                <button
                  onClick={() => (window.location.href = '/admin/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  访问管理后台
                </button>
              </div>
            </div>
          )}

          {/* 权限测试 */}
          {isAuthenticated && (
            <div className="mb-8 p-4 bg-purple-50 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-800 mb-4">
                权限测试
              </h2>
              <div className="space-y-2">
                <p>用户角色: {roles.join(', ') || '无'}</p>
                <p>
                  dashboard.view 权限:{' '}
                  {hasPermission('dashboard.view') ? '有权限' : '无权限'}
                </p>
                <p>
                  user.manage 权限:{' '}
                  {hasPermission('user.manage') ? '有权限' : '无权限'}
                </p>
                <p>
                  system.admin 权限:{' '}
                  {hasPermission('system.admin') ? '有权限' : '无权限'}
                </p>
              </div>
            </div>
          )}

          {/* 技术信息 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              技术信息
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>认证Hook: useUnifiedAuth</p>
              <p>认证服务: UnifiedAuthService</p>
              <p>状态管理: React useState + useEffect</p>
              <p>认证方式: Supabase Session + localStorage</p>
              <p>权限检查: AuthService.isAdminUser()</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
