'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginJumpDebugger() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<
    Array<{
      step: string;
      status: string;
      details: string;
    }>
  >([]);
  const [isTesting, setIsTesting] = useState(false);

  const runFullTest = async () => {
    setIsTesting(true);
    const results = [];

    try {
      // 测试1: 检查当前认证状态
      results.push({
        step: '1. 检查当前认证状态',
        status: '进行中...',
        details: '',
      });

      const authCheck = await fetch('/api/auth/check-session');
      const authData = await authCheck.json();

      results[0] = {
        step: '1. 检查当前认证状态',
        status: authData.authenticated  '✓ 已登录' : '✗ 未登录',
        details: `用户: ${authData.email || '无'}, 管理员: ${authData.is_admin || false}`,
      };

      // 测试2: 执行登录
      if (!authData.authenticated) {
        results.push({
          step: '2. 执行登录测试',
          status: '进行中...',
          details: '使用测试账号登录',
        });

        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: '1055603323@qq.com',
            password: '12345678',
          }),
        });

        const loginData = await loginResponse.json();

        results[1] = {
          step: '2. 执行登录测试',
          status: loginResponse.ok  '✓ 登录成功' : '✗ 登录失败',
          details: loginResponse.ok
             `用户: ${loginData.email}, 管理员: ${loginData.is_admin}, 跳转目标: /admin/dashboard`
            : `错误: ${loginData.error}`,
        };

        // 测试3: 手动触发跳转
        if (loginResponse.ok && loginData.is_admin) {
          results.push({
            step: '3. 测试页面跳转',
            status: '进行中...',
            details: '将在2秒后尝试跳转到/admin/dashboard',
          });

          // 延迟跳转以便观察
          setTimeout(() => {
            console.debug('执行跳转到/admin/dashboard');
            router.push('/admin/dashboard');
          }, 2000);
        }
      } else {
        // 已登录状态下的测试
        results.push({
          step: '2. 已登录状态测试',
          status: '✓ 已登录',
          details: '用户已处于登录状态',
        });

        results.push({
          step: '3. 测试直接跳转',
          status: '进行中...',
          details: '将跳转到 /admin/dashboard',
        });

        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error  error.message : String(error);
      results.push({
        step: '测试执行',
        status: '✗ 发生错误',
        details: errorMessage,
      });
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            登录跳转调试工具
          </h1>

          <div className="mb-8">
            <button
              onClick={runFullTest}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 mr-4"
            >
              {isTesting  '测试进行中...' : '运行完整测试'}
            </button>

            <button
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              清除结果
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">测试结果</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {result.step}
                      </h3>
                      <span
                        className={
                          result.status.includes('✓')
                             'text-green-600'
                            : result.status.includes('✗')
                               'text-red-600'
                              : 'text-yellow-600'
                        }
                      >
                        {result.status}
                      </span>
                    </div>
                    {result.details && (
                      <p className="text-gray-600 mt-2">{result.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">手动测试链接</h3>
              <div className="space-y-3">
                <a
                  href="/loginredirect=/admin/dashboard"
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
                >
                  管理员登录测试
                </a>
                <a
                  href="/loginredirect=/profile"
                  className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
                >
                  普通用户登录测试
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">调试信息</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>• 检查浏览器Console输出</p>
                <p>• 查看Network标签中的请求</p>
                <p>• 验证Cookie设置情况</p>
                <p>• 确认redirect参数传递</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">故障排除指南</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-700">如果API测试失败:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>检查Supabase配置</li>
                  <li>验证网络连接</li>
                  <li>查看服务器日志</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">如果跳转不工作:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>检查浏览器JavaScript错误</li>
                  <li>验证路由配置</li>
                  <li>清除浏览器缓存</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
