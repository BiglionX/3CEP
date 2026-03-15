'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JumpDebugTool() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState({
    step: '',
    status: '',
    details: '',
    timestamp: '',
  });
  const [testResults, setTestResults] = useState<
    Array<{
      step: string;
      status: string;
      details: string;
      timestamp: string;
    }>
  >([]);

  const logResult = (step: string, status: string, details: string) => {
    const result = {
      step,
      status,
      details,
      timestamp: new Date().toLocaleTimeString(),
    };
    setDebugInfo(result);
    setTestResults(prev => [...prev, result]);
  };

  const testJumpMechanism = async () => {
    logResult('开始测试', '🟡', '初始化跳转测试...');

    // 测试1: 直接跳转
    try {
      logResult('测试1', '🟡', '执行直接跳转到 /admin/dashboard');
      router.push('/admin/dashboard');
      logResult('测试1', '✅', '跳转指令已发送');
    } catch (error: any) {
      logResult('测试1', '❌', `跳转失败: ${error.message}`);
    }

    // 测试2: 延迟跳转
    setTimeout(() => {
      try {
        logResult('测试2', '🟡', '执行延迟跳转到 /admin/dashboard');
        router.push('/admin/dashboard');
        logResult('测试2', '✅', '延迟跳转指令已发送');
      } catch (error: any) {
        logResult('测试2', '❌', `延迟跳转失败: ${error.message}`);
      }
    }, 1000);

    // 测试3: Window.location跳转
    setTimeout(() => {
      try {
        logResult('测试3', '🟡', '执行window.location跳转');
        window.location.href = '/admin/dashboard';
        logResult('测试3', '✅', 'Window跳转已执行');
      } catch (error: any) {
        logResult('测试3', '❌', `Window跳转失败: ${error.message}`);
      }
    }, 2000);
  };

  const testLoginFlow = async () => {
    logResult('登录流程', '🟡', '开始模拟登录流程...');

    try {
      // 模拟登录API调用
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '1055603323@qq.com',
          password: '12345678',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        logResult(
          '登录API',
          '✅',
          `登录成功 - 用户: ${result.email}, 管理员: ${result.is_admin}`
        );

        // 模拟跳转逻辑
        setTimeout(() => {
          if (result.is_admin) {
            const targetRedirect = '/admin/dashboard';
            logResult('跳转逻辑', '🟡', `管理员跳转到: ${targetRedirect}`);
            try {
              router.push(targetRedirect);
              logResult('跳转执行', '✅', '管理员跳转已执行');
            } catch (error: any) {
              logResult('跳转执行', '❌', `管理员跳转失败: ${error.message}`);
            }
          }
        }, 500);
      } else {
        logResult('登录API', '❌', `登录失败: ${result.error}`);
      }
    } catch (error: any) {
      logResult('登录API', '❌', `网络错误: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setDebugInfo({ step: '', status: '', details: '', timestamp: '' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-red-400">
            跳转机制调试工具
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                跳转测试
              </h2>
              <button
                onClick={testJumpMechanism}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-3"
              >
                测试跳转机制
              </button>
              <button
                onClick={testLoginFlow}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                测试登录流程
              </button>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                当前状态
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>步骤:</strong> {debugInfo.step}
                </div>
                <div>
                  <strong>状态:</strong>{' '}
                  <span
                    className={
                      debugInfo.status.includes('✅')
                         'text-green-400'
                        : debugInfo.status.includes('❌')
                           'text-red-400'
                          : 'text-yellow-400'
                    }
                  >
                    {debugInfo.status}
                  </span>
                </div>
                <div>
                  <strong>详情:</strong> {debugInfo.details}
                </div>
                <div>
                  <strong>时间:</strong> {debugInfo.timestamp}
                </div>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-green-400">
                  测试历史
                </h2>
                <button
                  onClick={clearResults}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  清除历史
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.slice(-10).map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 bg-gray-600 rounded text-sm"
                  >
                    <span
                      className={
                        result.status.includes('✅')
                           'text-green-400'
                          : result.status.includes('❌')
                             'text-red-400'
                            : 'text-yellow-400'
                      }
                    >
                      {result.status}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{result.step}:</span>{' '}
                      {result.details}
                    </div>
                    <span className="text-gray-400 text-xs">
                      {result.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <h3 className="font-semibold text-red-400 mb-2">🚨 诊断要点</h3>
            <div className="text-sm text-red-200 space-y-1">
              <p>• 如果所有跳转测试都失败，问题可能在路由配置</p>
              <p>• 如果只有登录后跳转失败，问题可能在登录逻辑</p>
              <p>• 检查浏览器Console是否有JavaScript错误</p>
              <p>• 确认管理员权限判断是否正确</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
