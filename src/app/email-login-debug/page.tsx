'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailLoginJumpDebug() {
  const router = useRouter();
  const [email, setEmail] = useState('1055603323@qq.com');
  const [password, setPassword] = useState('12345678');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: string; message: string; type: 'info' | 'error' | 'success' | 'data' | 'start' | 'end'}>>([]);
  const [currentStatus, setCurrentStatus] = useState('');

  const log = (message: string, type: 'info' | 'error' | 'success' | 'data' | 'start' | 'end' = 'info') => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setDebugLogs(prev => [...prev, logEntry]);
    setCurrentStatus(message);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const testEmailLoginJump = async () => {
    setDebugLogs([]);
    setIsLoggingIn(true);
    log('开始邮箱登录跳转测试...', 'start');

    try {
      log('1. 准备登录数据', 'info');
      log(`邮箱: ${email}`, 'data');
      log(`密码: ${'*'.repeat(password.length)}`, 'data');

      log('2. 发送登录请求', 'info');
      const startTime = Date.now();
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseTime = Date.now() - startTime;
      log(`3. 收到响应 (耗时: ${responseTime}ms)`, 'info');
      log(`响应状态: ${response.status} ${response.statusText}`, 'data');

      if (!response.ok) {
        const errorData = await response.json();
        log(`登录失败: ${errorData.error || '未知错误'}`, 'error');
        setIsLoggingIn(false);
        return;
      }

      const result = await response.json();
      log('4. 解析响应数据', 'info');
      log(`用户ID: ${result.user?.id}`, 'data');
      log(`用户邮箱: ${result.user?.email}`, 'data');
      log(`是否管理员: ${result.user?.is_admin}`, 'data');
      log(`会话令牌长度: ${result.session?.access_token?.length || 0}`, 'data');

      log('5. 准备跳转逻辑', 'info');
      
      // 模拟原始登录页面的跳转逻辑
      const simulateOriginalJump = () => {
        log('6. 执行跳转逻辑 (模拟原始代码)', 'info');
        
        if (result.user?.is_admin) {
          log('检测到管理员用户', 'info');
          const targetRedirect = '/admin/dashboard';
          log(`跳转目标: ${targetRedirect}`, 'data');
          
          // 方法1: Next.js router跳转
          log('尝试Next.js路由跳转...', 'info');
          try {
            router.push(targetRedirect);
            log('Next.js路由跳转指令已发送', 'success');
          } catch (routerError: unknown) {
            log(`Next.js路由跳转失败: ${(routerError as Error).message}`, 'error');
            
            // 方法2: window.location跳转
            log('尝试window.location跳转...', 'info');
            try {
              window.location.href = targetRedirect;
              log('window.location跳转已执行', 'success');
            } catch (locationError: unknown) {
              log(`window.location跳转失败: ${(locationError as Error).message}`, 'error');
              
              // 方法3: 延迟跳转
              log('尝试延迟跳转...', 'info');
              setTimeout(() => {
                try {
                  window.location.href = targetRedirect;
                  log('延迟window.location跳转已执行', 'success');
                } catch (delayError: unknown) {
                  log(`延迟跳转失败: ${(delayError as Error).message}`, 'error');
                }
              }, 1000);
            }
          }
        } else {
          log('检测到普通用户', 'info');
          const targetRedirect = '/';
          log(`跳转目标: ${targetRedirect}`, 'data');
          
          try {
            router.push(targetRedirect);
            log('普通用户跳转已执行', 'success');
          } catch (error: unknown) {
            log(`普通用户跳转失败: ${(error as Error).message}`, 'error');
          }
        }
      };

      // 立即执行跳转
      simulateOriginalJump();

      // 延迟执行跳转（模拟修复后的代码）
      setTimeout(() => {
        log('7. 执行延迟跳转 (模拟修复后代码)', 'info');
        if (result.user?.is_admin) {
          const targetRedirect = '/admin/dashboard';
          log(`延迟跳转目标: ${targetRedirect}`, 'data');
          
          try {
            router.push(targetRedirect);
            log('延迟Next.js路由跳转已执行', 'success');
          } catch (error: unknown) {
            log(`延迟路由跳转失败: ${(error as Error).message}`, 'error');
            window.location.href = targetRedirect;
          }
        }
      }, 200);

    } catch (error: unknown) {
      log(`网络错误: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoggingIn(false);
      log('测试完成', 'end');
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setCurrentStatus('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-red-400">邮箱登录跳转专项调试</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 控制面板 */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">测试控制</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱地址</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    placeholder="password"
                  />
                </div>
                
                <button
                  onClick={testEmailLoginJump}
                  disabled={isLoggingIn}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoggingIn ? '测试进行中...' : '执行邮箱登录跳转测试'}
                </button>
                
                <button
                  onClick={clearLogs}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  清除日志
                </button>
              </div>
            </div>
            
            {/* 状态显示 */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">当前状态</h2>
              <div className="p-4 bg-gray-600 rounded-lg">
                <p className="text-lg font-mono">{currentStatus || '等待测试开始...'}</p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">测试参数</h3>
                <div className="text-sm space-y-1">
                  <p>邮箱: {email}</p>
                  <p>密码: {'*'.repeat(password.length)}</p>
                  <p>测试时间: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 调试日志 */}
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400">调试日志</h2>
              <span className="text-sm text-gray-400">共 {debugLogs.length} 条记录</span>
            </div>
            
            <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500">暂无日志记录...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`mb-2 p-2 rounded ${
                      log.type === 'error' ? 'bg-red-900/30 border border-red-700' :
                      log.type === 'success' ? 'bg-green-900/30 border border-green-700' :
                      log.type === 'data' ? 'bg-blue-900/30 border border-blue-700' :
                      'bg-gray-800'
                    }`}
                  >
                    <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'data' ? 'text-blue-400' :
                      'text-yellow-400'
                    }>
                      [{log.type.toUpperCase()}]
                    </span>{' '}
                    <span className="text-white">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 诊断建议 */}
          <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-6">
            <h3 className="font-semibold text-red-400 mb-3">🚨 诊断建议</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-300 mb-2">如果跳转失败，请检查：</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• 浏览器Console是否有JavaScript错误</li>
                  <li>• Network面板中API请求是否成功</li>
                  <li>• Cookie是否正确设置</li>
                  <li>• 管理员权限是否正确识别</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-300 mb-2">可能的原因：</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• 路由守卫阻止了跳转</li>
                  <li>• 状态更新与跳转存在竞态条件</li>
                  <li>• 浏览器扩展干扰了跳转</li>
                  <li>• 会话管理存在问题</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}