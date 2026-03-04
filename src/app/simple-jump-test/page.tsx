'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleJumpTest() {
  const router = useRouter();
  const [status, setStatus] = useState('准备测试...');
  const [results, setResults] = useState([]);

  const log = message => {
    const entry = {
      time: new Date().toLocaleTimeString(),
      message,
    };
    setResults(prev => [...prev, entry]);
    setStatus(message);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[SimpleJump]', message)};

  const testSimpleJump = async () => {
    setResults([]);
    log('开始简单跳转测?..');

    try {
      // 直接测试跳转到管理后?      log('1. 测试直接跳转?/admin');
      router.push('/admin');
      log('�?直接跳转指令已发?);

      // 等待一会儿再测试具体页?      setTimeout(() => {
        log('2. 测试跳转?/admin/dashboard');
        router.push('/admin/dashboard');
        log('�?仪表板跳转指令已发?);
      }, 1000);

      // 最后备选方?      setTimeout(() => {
        log('3. 测试window.location跳转');
        window.location.href = '/admin/dashboard';
        log('�?Window.location跳转已执?);
      }, 2000);
    } catch (error) {
      log(`�?跳转测试失败: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            简单跳转测?          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                测试控制
              </h2>
              <button
                onClick={testSimpleJump}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                执行简单跳转测?              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                当前状?              </h2>
              <p className="text-lg font-mono bg-white p-3 rounded">{status}</p>
            </div>

            {results.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  测试日志
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.map((entry, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <span className="text-gray-500 text-sm">
                        [{entry.time}]
                      </span>{' '}
                      <span className="font-mono">{entry.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                诊断建议
              </h2>
              <ul className="space-y-2 text-yellow-700">
                <li>�?如果跳转成功，说明问题是中间件配?/li>
                <li>�?如果跳转失败，说明是路由配置问题</li>
                <li>�?检查浏览器Console是否有错误信?/li>
                <li>�?尝试清除浏览器缓存和Cookie</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

