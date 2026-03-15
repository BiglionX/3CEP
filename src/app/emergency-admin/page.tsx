'use client';

import { useState, useEffect } from 'react';

export default function EmergencyAdmin() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkEmergencyAuth = async () => {
      try {
        // 直接绕过所有权限检        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('紧急模式：跳过所有权限验)// 模拟管理员用        setUserInfo({
          id: 'emergency-admin',
          email: 'admin@emergency.local',
          roles: ['admin'],
          is_admin: true,
        });

        setIsAuthenticated(true);
        setAuthChecked(true);

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('紧急管理模式已激)} catch (error) {
        console.error('紧急认证失', error);
        setAuthChecked(true);
      }
    };

    checkEmergencyAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">认证失败</h1>
          <p className="text-gray-600">紧急模式无法激/p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 简化版顶部*/}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">紧急管理模/h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                管理员 {userInfo.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              管理后台仪表            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  用户管理
                </h3>
                <p className="text-blue-600">管理所有用户账户和权限</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  内容管理
                </h3>
                <p className="text-green-600">审核和管理系统内/p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  系统设置
                </h3>
                <p className="text-purple-600">配置系统参数和选项</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                🚨 紧急通知
              </h3>
              <div className="text-yellow-700 space-y-2">
                <p>此页面绕过了所有权限检/p>
                <p>仅供紧急情况下使用</p>
                <p>请尽快修复正常的权限系统</p>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                返回首页
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

