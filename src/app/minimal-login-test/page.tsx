'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MinimalLoginTest() {
  const router = useRouter();
  const [testResult, setTestResult] = useState('');

  const handleMinimalLogin = async () => {
    try {
      setTestResult('正在测试登录...');

      // 直接调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: '1055603323@qq.com',
          password: '12345678',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ 登录成功! 用户: ${result.email}, 管理员: ${result.is_admin}`
        );

        // 立即测试跳转
        setTimeout(() => {
          setTestResult('🔄 正在执行跳转测试...');
          try {
            router.push('/admin/dashboard');
            setTestResult('✅ 跳转执行完成');
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error  error.message : String(error);
            setTestResult(`❌ 跳转失败: ${errorMessage}`);
          }
        }, 1000);
      } else {
        setTestResult(`❌ 登录失败: ${result.error}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error  error.message : String(error);
      setTestResult(`❌ 网络错误: ${errorMessage}`);
    }
  };

  const handleDirectJump = () => {
    setTestResult('🔄 执行直接跳转测试...');
    try {
      router.push('/admin/dashboard');
      setTestResult('✅ 直接跳转成功');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error  error.message : String(error);
      setTestResult(`❌ 直接跳转失败: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            最小化登录跳转测试
          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                测试控制面板
              </h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleMinimalLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  执行最小化登录测试
                </button>
                <button
                  onClick={handleDirectJump}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  执行直接跳转测试
                </button>
                <button
                  onClick={() => setTestResult('')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  清除结果
                </button>
              </div>
            </div>

            {testResult && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-800 mb-2">测试结果</h3>
                <p className="text-yellow-700 whitespace-pre-wrap">
                  {testResult}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">调试信息</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>当前路径:</strong>{' '}
                  {typeof window !== 'undefined'
                     window.location.pathname
                    : 'N/A'}
                </p>
                <p>
                  <strong>当前主机:</strong>{' '}
                  {typeof window !== 'undefined'  window.location.host : 'N/A'}
                </p>
                <p>
                  <strong>时间:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-3">故障排除</h3>
              <div className="text-sm text-red-700 space-y-2">
                <p>• 如果登录测试失败：检查API连接和认证凭据</p>
                <p>• 如果跳转测试失败：检查路由配置和权限</p>
                <p>• 查看浏览器Console获取详细错误信息</p>
                <p>• 确认管理员用户权限设置正确</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
