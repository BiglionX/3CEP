'use client';

import { useState } from 'react';

interface TestResult {
  step: number;
  status: string;
  message: string;
  timestamp: string;
}

export default function UltimateLoginTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const addResult = (step: number, status: string, message: string) => {
    setTestResults(prev => [
      ...prev,
      { step, status, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const runStep = async (stepNumber: number) => {
    setCurrentStep(stepNumber);

    switch (stepNumber) {
      case 1:
        // 测试1: 基础网络连接
        addResult(1, '🟡', '测试网络连接...');
        try {
          const response = await fetch('/api/health');
          if (response.ok) {
            addResult(1, '🟢', '网络连接正常');
          } else {
            addResult(1, '🔴', `网络连接异常: ${response.status}`);
          }
        } catch (error: any) {
          addResult(1, '🔴', `网络连接失败: ${error.message}`);
        }
        break;

      case 2:
        // 测试2: 登录API功能
        addResult(2, '🟡', '测试登录API...');
        try {
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
            addResult(
              2,
              '🟢',
              `登录API成功 - 用户: ${result.email}, 管理员: ${result.is_admin}`
            );
          } else {
            addResult(2, '🔴', `登录API失败: ${result.error}`);
          }
        } catch (error: any) {
          addResult(2, '🔴', `登录API错误: ${error.message}`);
        }
        break;

      case 3:
        // 测试3: 会话状态检查
        addResult(3, '🟡', '测试会话状态...');
        try {
          const response = await fetch('/api/auth/check-session');
          const result = await response.json();

          if (response.ok) {
            addResult(
              3,
              '🟢',
              `会话检查成功 - 已登录: ${result.authenticated}, 管理员: ${result.is_admin}`
            );
          } else {
            addResult(3, '🔴', `会话检查失败: ${response.status}`);
          }
        } catch (error: any) {
          addResult(3, '🔴', `会话检查错误: ${error.message}`);
        }
        break;

      case 4:
        // 测试4: 直接页面跳转
        addResult(4, '🟡', '测试页面跳转...');
        try {
          // 使用原生JavaScript进行跳转测试
          window.location.href = '/admin/dashboard';
          addResult(4, '🟢', '跳转指令已发送');
        } catch (error: any) {
          addResult(4, '🔴', `跳转失败: ${error.message}`);
        }
        break;

      default:
        break;
    }
  };

  const runAllTests = async () => {
    setTestResults([]);

    for (let i = 1; i <= 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await runStep(i);
    }

    setCurrentStep(0);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-red-400">
            终极登录跳转诊断
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                自动化测试
              </h2>
              <button
                onClick={runAllTests}
                disabled={currentStep > 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {currentStep > 0
                  ? `执行中... (${currentStep}/4)`
                  : '运行所有测试'}
              </button>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                手动测试
              </h2>
              <div className="space-y-3">
                <a
                  href="/login?redirect=/admin/dashboard"
                  className="block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                >
                  标准登录测试
                </a>
                <a
                  href="/minimal-login-test"
                  className="block bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                >
                  最小化测试
                </a>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-green-400">
                  测试结果
                </h2>
                <button
                  onClick={clearResults}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  清除结果
                </button>
              </div>

              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-gray-600 rounded-lg"
                  >
                    <span className="text-2xl">{result.status}</span>
                    <div className="flex-1">
                      <div className="font-medium">
                        步骤 {result.step}: {result.message}
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
            <h3 className="font-semibold text-red-400 mb-3">🚨 紧急故障排查</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-300 mb-2">如果测试失败:</h4>
                <ul className="space-y-1 text-red-200">
                  <li>✓ 检查服务器控制台错误</li>
                  <li>✓ 验证环境变量配置</li>
                  <li>✓ 确认Supabase连接</li>
                  <li>✓ 检查网络连接状态</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-300 mb-2">浏览器调试:</h4>
                <ul className="space-y-1 text-red-200">
                  <li>✓ 打开F12开发者工具</li>
                  <li>✓ 查看Console所有错误</li>
                  <li>✓ 检查Network请求详情</li>
                  <li>✓ 验证JavaScript执行</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>请运行测试并提供完整的错误信息用于进一步诊断</p>
            <p className="mt-2">当前时间: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
