'use client';

import { useState } from 'react';

export default function UltimateSelfDebug() {
  const [testPhase, setTestPhase] = useState(0);
  const [results, setResults] = useState<
    Array<{ phase: number; message: string; status: string; timestamp: string }>
  >([]);
  const [isTesting, setIsTesting] = useState(false);

  const log = (phase: number, message: string, status: string = 'info') => {
    const result = {
      phase,
      message,
      status,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [...prev, result]);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`[阶段${phase}] [${status}] ${message}`)};

  const runCompleteDiagnostic = async () => {
    setResults([]);
    setIsTesting(true);
    setTestPhase(1);

    try {
      // 阶段1: 基础环境检?      log(1, '开始基础环境检?, 'start');

      // 检查window对象
      if (typeof window === 'undefined') {
        log(1, '�?运行在服务器端，无法进行客户端测?, 'error');
        return;
      }
      log(1, '�?客户端环境正?, 'success');

      // 检查基本API
      log(1, '测试基础API连接...', 'info');
      try {
        const healthResponse = await fetch('/api/health');
        log(1, `健康检查响? ${healthResponse.status}`, 'data');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(1, `健康检查失? ${errorMessage}`, 'warning');
      }

      setTestPhase(2);

      // 阶段2: 登录API测试
      log(2, '开始登录API测试', 'start');

      const loginStartTime = Date.now();
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '1055603323@qq.com',
          password: '12345678',
        }),
      });

      const loginTime = Date.now() - loginStartTime;
      log(2, `登录请求耗时: ${loginTime}ms`, 'data');
      log(2, `登录响应状? ${loginResponse.status}`, 'data');

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        log(2, `登录失败: ${errorData.error}`, 'error');
        return;
      }

      const loginResult = await loginResponse.json();
      log(
        2,
        `登录成功 - 用户ID: ${loginResult?.id?.substring(0, 8)}...`,
        'success'
      );
      log(2, `管理员状? ${loginResult?.is_admin}`, 'data');
      log(2, `会话令牌: ${loginResult?.access_token ? '�? : '�?}`, 'data');

      setTestPhase(3);

      // 阶段3: 跳转机制测试
      log(3, '开始跳转机制测?, 'start');

      // 测试1: 直接路由跳转
      log(3, '测试1: 直接Next.js路由跳转', 'info');
      try {
        const { useRouter } = await import('next/navigation');
        const router = useRouter();
        log(3, '获取router对象成功', 'success');

        setTimeout(() => {
          try {
            router.push('/admin/dashboard');
            log(3, '�?Next.js路由跳转指令已发?, 'success');
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            log(3, `�?Next.js路由跳转失败: ${errorMessage}`, 'error');
          }
        }, 100);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(3, `获取router失败: ${errorMessage}`, 'error');
      }

      // 测试2: Window.location跳转
      setTimeout(() => {
        log(3, '测试2: Window.location跳转', 'info');
        try {
          window.location.href = '/admin/dashboard';
          log(3, '�?Window.location跳转已执?, 'success');
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          log(3, `�?Window.location跳转失败: ${errorMessage}`, 'error');
        }
      }, 500);

      // 测试3: 延迟跳转
      setTimeout(() => {
        log(3, '测试3: 延迟跳转测试', 'info');
        try {
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
            log(3, '�?延迟跳转已执?, 'success');
          }, 1000);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          log(3, `�?延迟跳转失败: ${errorMessage}`, 'error');
        }
      }, 1000);

      setTestPhase(4);

      // 阶段4: 综合模拟测试
      log(4, '开始综合模拟测?, 'start');

      // 模拟完整的登录跳转流?      setTimeout(async () => {
        log(4, '模拟完整登录跳转流程', 'info');

        try {
          // 模拟登录
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: '1055603323@qq.com',
              password: '12345678',
            }),
          });

          if (response.ok) {
            const result = await response.json();
            log(4, '模拟登录成功', 'success');

            // 模拟跳转逻辑
            if (result?.is_admin) {
              log(4, '检测到管理员用户，准备跳转', 'info');

              // 尝试多种跳转方式
              const jumpMethods = [
                () => {
                  try {
                    const { useRouter } = require('next/navigation');
                    const router = useRouter();
                    router.push('/admin/dashboard');
                    return 'Next.js路由';
                  } catch (error) {
                    throw error;
                  }
                },
                () => {
                  window.location.href = '/admin/dashboard';
                  return 'Window.location';
                },
              ];

              for (let i = 0; i < jumpMethods.length; i++) {
                try {
                  const method = jumpMethods[i]();
                  log(4, `�?跳转方式${i + 1}成功: ${method}`, 'success');
                  break;
                } catch (error: unknown) {
                  const errorMessage =
                    error instanceof Error ? error.message : String(error);
                  log(4, `�?跳转方式${i + 1}失败: ${errorMessage}`, 'warning');
                }
              }
            }
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          log(4, `综合测试失败: ${errorMessage}`, 'error');
        }
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log(testPhase, `测试过程出错: ${errorMessage}`, 'error');
    } finally {
      setIsTesting(false);
      setTestPhase(5);
      log(5, '所有测试完?, 'end');
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestPhase(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-red-400">
            终极自我调试工具
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 控制面板 */}
            <div className="lg:col-span-2 bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                测试控制
              </h2>

              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={runCompleteDiagnostic}
                  disabled={isTesting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isTesting
                    ? `测试?.. (阶段${testPhase}/5)`
                    : '运行完整诊断'}
                </button>

                <button
                  onClick={clearResults}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  清除结果
                </button>
              </div>

              <div className="text-sm text-gray-300">
                <p>�?这个工具会完全独立地测试所有可能的跳转方式</p>
                <p>�?包括Next.js路由、Window.location等多种方?/p>
                <p>�?会详细记录每一步的执行结果</p>
              </div>
            </div>

            {/* 当前阶段 */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                测试进度
              </h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(phase => (
                  <div
                    key={phase}
                    className={`p-3 rounded-lg ${
                      testPhase === phase
                        ? 'bg-blue-600'
                        : testPhase > phase
                          ? 'bg-green-600'
                          : 'bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">
                      阶段 {phase}
                      {testPhase === phase && ' (进行?'}
                      {testPhase > phase && ' (已完?'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 测试结果 */}
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400">测试结果</h2>
              <span className="text-sm text-gray-400">
                �?{results.length} 条记?              </span>
            </div>

            <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {results.length === 0 ? (
                <p className="text-gray-500">等待测试开?..</p>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-3 rounded ${
                      result.status === 'error'
                        ? 'bg-red-900/30 border border-red-700'
                        : result.status === 'success'
                          ? 'bg-green-900/30 border border-green-700'
                          : result.status === 'warning'
                            ? 'bg-yellow-900/30 border border-yellow-700'
                            : result.status === 'data'
                              ? 'bg-blue-900/30 border border-blue-700'
                              : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">
                        [阶段{result.phase}]
                      </span>
                      <span className="text-gray-500 text-xs">
                        {result.timestamp}
                      </span>
                    </div>
                    <div
                      className={
                        result.status === 'error'
                          ? 'text-red-400'
                          : result.status === 'success'
                            ? 'text-green-400'
                            : result.status === 'warning'
                              ? 'text-yellow-400'
                              : result.status === 'data'
                                ? 'text-blue-400'
                                : 'text-yellow-400'
                      }
                    >
                      [{result.status.toUpperCase()}] {result.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 紧急诊?*/}
          <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-6">
            <h3 className="font-semibold text-red-400 mb-3">🚨 紧急诊断模?/h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-300 mb-2">
                  如果所有测试都失败?                </h4>
                <ul className="space-y-1 text-red-200">
                  <li>�?检查浏览器扩展是否干扰</li>
                  <li>�?尝试无痕模式浏览?/li>
                  <li>�?检查防火墙/杀毒软件设?/li>
                  <li>�?验证localhost域名解析</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-300 mb-2">
                  技术层面排查：
                </h4>
                <ul className="space-y-1 text-red-200">
                  <li>�?Next.js路由配置问题</li>
                  <li>�?浏览器同源策略限?/li>
                  <li>�?Service Worker干扰</li>
                  <li>�?浏览器缓存问?/li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

