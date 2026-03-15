'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/use-permission';

export default function FinalVerificationTest() {
  const router = useRouter();
  const permissionData = usePermission();
  const { isAuthenticated, loading, userInfo } = permissionData;
  const [testResults, setTestResults] = useState<Array<{
    timestamp: string;
    message: string;
    type: string;
  }>>([]);

  const log = (message: string, type: string = 'info') => {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setTestResults(prev => [...prev, result]);
    // TODO: 移除调试日志
    console.debug(`${type.toUpperCase()} ${message}`);
  };

  useEffect(() => {
    log('组件初始化', 'init');
    log(`认证状态: ${isAuthenticated}`, 'auth');
    log(`加载状态: ${loading}`, 'loading');
    log(`用户信息: ${userInfo ? JSON.stringify(userInfo) : "null"}`, 'user');
  }, [isAuthenticated, loading, userInfo]);

  const testAuthentication = async () => {
    log('开始认证测试...', 'start');

    try {
      // 测试API认证状态
      const response = await fetch('/api/auth/check-session');
      const sessionData = await response.json();

      log(`API认证响应: ${response.status}`, 'api');
      log(`会话数据: ${JSON.stringify(sessionData)}`, 'data');

      // 测试hook认证状态
      log(`Hook认证状态: ${isAuthenticated}`, 'hook');
      log(`Hook用户信息: ${userInfo ? JSON.stringify(userInfo) : "null"}`, 'hook-data');

      if (sessionData.authenticated && isAuthenticated) {
        log('双认证同步成功', 'success');

        // 测试跳转
        log('测试跳转到管理后台...', 'jump');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);

      } else {
        log('双认证状态不同步', 'error');
        if (!sessionData.authenticated) {
          log('API显示未认证', 'error');
        }
        if (!isAuthenticated) {
          log('Hook显示未认证', 'error');
        }
      }

    } catch (error: unknown) {
      log(`认证测试失败: ${(error as Error).message}`, 'error');
    }
  };

  const forceReloadAuth = async () => {
    log('强制重新加载认证信息...', 'reload');
    try {
      const response = await fetch('/api/auth/check-session');
      const sessionData = await response.json();

      if (sessionData.authenticated) {
        // 模拟登录成功后的状态更新
        localStorage.setItem('temp-auth-flag', 'true');
        window.location.reload();
      }
    } catch (error: unknown) {
      log(`重新加载失败: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">最终验证测试</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">当前状态</h2>
              <div className="space-y-3">
                <div className={`p-3 rounded ${loading ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <span className="font-medium">加载状态</span> {loading ? '加载中...' : '完成'}
                </div>
                <div className={`p-3 rounded ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="font-medium">认证状态</span> {isAuthenticated ? '已认证' : '未认证'}
                </div>
                <div className="p-3 rounded bg-gray-100">
                  <span className="font-medium">用户邮箱:</span> {userInfo?.email || '未知'}
                </div>
                <div className="p-3 rounded bg-gray-100">
                  <span className="font-medium">用户角色:</span> {userInfo?.roles.join(', ') || '未知'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">测试控制</h2>
              <div className="space-y-3">
                <button
                  onClick={testAuthentication}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  测试认证同步
                </button>
                <button
                  onClick={forceReloadAuth}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  强制重新加载认证
                </button>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  直接跳转到仪表板
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">测试日志</h2>
              <button
                onClick={() => setTestResults([])}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                清除日志
              </button>
            </div>

            <div className="bg-black rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <p className="text-gray-500">等待测试开始...</p>
              ) : (
                testResults.map((result: {timestamp: string; message: string; type: string}, index: number) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded ${
                      result.type === 'error' ? 'bg-red-900/30 border border-red-700' :
                      result.type === 'success' ? 'bg-green-900/30 border border-green-700' :
                      result.type === 'data' ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800'
                    }`}
                  >
                    <span className="text-gray-400">[{result.timestamp}]</span>{' '}
                    <span className={
                      result.type === 'error' ? 'text-red-400' :
                      result.type === 'success' ? 'text-green-400' :
                      result.type === 'data' ? 'text-blue-400' : 'text-yellow-400'
                    }>
                      [{result.type.toUpperCase()}]
                    </span>{' '}
                    <span className="text-white">{result.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-3">🔧 修复说明</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• 已修复usePermission hook 以支持Supabase 认证</p>
              <p>• 现在会优先检查 /api/auth/check-session 接口</p>
              <p>• 备用方案仍然使用 localStorage JWT token</p>
              <p>• 管理员用户会被识别为 ['admin'] 角色</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
