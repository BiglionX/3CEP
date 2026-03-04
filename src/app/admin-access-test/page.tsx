'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminAccessTestPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 添加测试结果
  const addTestResult = (
    testName: string,
    status: 'pass' | 'fail' | 'info',
    details: any
  ) => {
    setTestResults(prev => [
      ...prev,
      {
        testName,
        status,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // 测试 1: 当前用户状态检查
  const testCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      setCurrentUser(user);
      addTestResult('当前用户检查', user ? 'pass' : 'info', {
        hasSession: !!session,
        userId: user?.id || '未登录',
        userEmail: user?.email || '无邮箱',
        userMetadata: user?.user_metadata || {},
      });

      return user;
    } catch (error: any) {
      addTestResult('当前用户检查', 'fail', { error: error.message });
      return null;
    }
  };

  // 测试 2: 管理员权限检查
  const testAdminPermissions = async (user: any) => {
    if (!user) {
      addTestResult('管理员权限检查', 'fail', '用户未登录');
      return false;
    }

    try {
      // 检查用户元数据
      const metadata = user.user_metadata || {};
      const isAdminFromMetadata =
        metadata.isAdmin === true ||
        metadata.is_admin === true ||
        metadata.role === 'admin';

      // 检查本地存储
      let hasLocalStorageAdmin = false;
      if (typeof window !== 'undefined') {
        const tempAdmin = localStorage.getItem('temp-admin-access');
        const isAdminFlag = localStorage.getItem('is-admin');
        const userRole = localStorage.getItem('user-role');
        hasLocalStorageAdmin =
          tempAdmin === 'true' ||
          isAdminFlag === 'true' ||
          userRole === 'admin';
      }

      addTestResult('管理员权限检查', 'info', {
        metadataCheck: {
          isAdmin: metadata.isAdmin,
          is_admin: metadata.is_admin,
          role: metadata.role,
          result: isAdminFromMetadata,
        },
        localStorageCheck: {
          tempAdmin:
            typeof window !== 'undefined'
              ? localStorage.getItem('temp-admin-access')
              : 'N/A',
          isAdminFlag:
            typeof window !== 'undefined'
              ? localStorage.getItem('is-admin')
              : 'N/A',
          userRole:
            typeof window !== 'undefined'
              ? localStorage.getItem('user-role')
              : 'N/A',
          result: hasLocalStorageAdmin,
        },
        overallResult: isAdminFromMetadata || hasLocalStorageAdmin,
      });

      return isAdminFromMetadata || hasLocalStorageAdmin;
    } catch (error: any) {
      addTestResult('管理员权限检查', 'fail', { error: error.message });
      return false;
    }
  };

  // 测试3: 尝试访问管理员页?
  const testAdminPageAccess = async () => {
    try {
      const response = await fetch('/admin/dashboard', {
        method: 'HEAD',
        redirect: 'manual',
      });

      const isRedirected = response.status >= 300 && response.status < 400;
      const canAccess = response.status === 200;

      addTestResult('管理员页面访问测试', canAccess ? 'pass' : 'fail', {
        statusCode: response.status,
        statusText: response.statusText,
        isRedirected,
        canAccess,
      });

      return canAccess;
    } catch (error: any) {
      addTestResult('管理员页面访问测试', 'fail', { error: error.message });
      return false;
    }
  };

  // 测试4: 中间件响应头检?
  const testMiddlewareHeaders = async () => {
    try {
      const response = await fetch('/api/test-middleware', { method: 'GET' });
      const headers: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        if (key.startsWith('x-')) {
          headers[key] = value;
        }
      });

      addTestResult('中间件响应头检查', 'info', {
        headers,
        hasAdminHeaders: !!headers['x-admin-authorized'],
        hasDebugInfo: !!headers['x-debug-info'],
      });

      return headers;
    } catch (error: any) {
      addTestResult('中间件响应头检查', 'fail', { error: error.message });
      return null;
    }
  };

  // 运行所有测?
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // 测试 1: 当前用户
      const user = await testCurrentUser();

      // 测试 2: 管理员权限检查
      await testAdminPermissions(user);

      // 测试 3: 页面访问
      await testAdminPageAccess();

      // 测试 4: 响应头
      await testMiddlewareHeaders();

      addTestResult('综合测试完成', 'info', '所有测试项目已完成');
    } catch (error: any) {
      addTestResult('测试执行错误', 'fail', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 设置临时管理员权?
  const setTempAdminAccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp-admin-access', 'true');
      localStorage.setItem('is-admin', 'true');
      localStorage.setItem('user-role', 'admin');
      addTestResult('设置临时权限', 'pass', '已设置临时管理员权限');
    }
  };

  // 清除临时权限
  const clearTempAdminAccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp-admin-access');
      localStorage.removeItem('is-admin');
      localStorage.removeItem('user-role');
      addTestResult('清除临时权限', 'pass', '已清除临时管理员权限');
    }
  };

  // 跳转到管理员页面
  const goToAdmin = () => {
    router.push('/admin/dashboard');
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          管理员访问权限测试
        </h1>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '重新运行所有测试'}
            </button>

            <button
              onClick={setTempAdminAccess}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              设置临时管理员权限
            </button>

            <button
              onClick={clearTempAdminAccess}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              清除临时权限
            </button>

            <button
              onClick={goToAdmin}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              跳转到管理员页面
            </button>
          </div>
        </div>

        {/* 当前用户信息 */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">用户ID</p>
                <p className="font-mono">{currentUser.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">邮箱</p>
                <p>{currentUser.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">用户元数据</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(currentUser.user_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 测试结果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded border-l-4 ${
                  result.status === 'pass'
                    ? 'border-green-500 bg-green-50'
                    : result.status === 'fail'
                      ? 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{result.testName}</h3>
                    <p className="text-sm mt-1">
                      {typeof result.details === 'string'
                        ? result.details
                        : JSON.stringify(result.details, null, 2)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 调试信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            页面路径:{' '}
            {typeof window !== 'undefined' ? window.location.pathname : ''}
          </p>
          <p>
            主机: {typeof window !== 'undefined' ? window.location.host : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
