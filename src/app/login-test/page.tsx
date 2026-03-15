'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginJumpTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    const results: any[] = [];

    try {
      // 测试1: 检查当前认证状态
      results.push({
        step: '检查认证状态',
        status: '进行中...',
        details: '',
      });

      const authResponse = await fetch('/api/auth/check-session');
      const authData = await authResponse.json();

      results[0] = {
        step: '检查认证状态',
        status: authData.authenticated  '✓ 已登录' : '✗ 未登录',
        details: `用户: ${authData.email || '无'}, 管理员: ${authData.is_admin || false}`,
      };

      // 测试2: 尝试登录
      if (!authData.authenticated) {
        results.push({
          step: '执行登录测试',
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
          step: '执行登录测试',
          status: loginResponse.ok  '✓ 登录成功' : '✗ 登录失败',
          details: loginResponse.ok
             `用户: ${loginData.email}, 管理员: ${loginData.is_admin}`
            : `错误: ${loginData.error}`,
        };

        // 测试3: 检查跳转行为
        if (loginResponse.ok && loginData.is_admin) {
          results.push({
            step: '验证跳转行为',
            status: '进行中...',
            details: `期望跳转到: ${redirect}`,
          });

          // 模拟跳转
          setTimeout(() => {
            router.push(redirect);
          }, 2000);
        }
      } else {
        // 已登录状态下测试跳转
        results.push({
          step: '测试跳转行为',
          status: '进行中...',
          details: `将跳转到: ${redirect}`,
        });

        setTimeout(() => {
          router.push(redirect);
        }, 2000);
      }
    } catch (error: any) {
      results.push({
        step: '测试执行',
        status: '✗ 发生错误',
        details: error.message,
      });
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            登录跳转测试
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">测试参数</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">Redirect参数</h3>
                <p className="text-blue-600">{redirect}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">测试账号</h3>
                <p className="text-green-600">1055603323@qq.com</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={runTest}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isTesting  '测试进行中...' : '开始测试'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div>
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">手动测试链接</h2>
            <div className="space-y-2">
              <a
                href="/loginredirect=/admin/dashboard"
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                管理员登录测试 (/admin/dashboard)
              </a>
              <a
                href="/loginredirect=/profile"
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                普通用户登录测试 (/profile)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
