'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [traceId, setTraceId] = useState<string>('');

  useEffect(() => {
    // 生成追踪ID
    const id = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setTraceId(id);
    
    // 记录错误到控制台（实际项目中应该发送到错误监控服务）
    console.warn(`Unauthorized access attempt - Trace ID: ${id}`);
  }, []);

  const requestedPath = searchParams.get('from') || '/';
  const reason = searchParams.get('reason') || '访问被拒绝';

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/admin/dashboard');
  };

  const handleContactSupport = () => {
    // 实际项目中这里应该打开联系支持的对话框或页面
    alert(`请联系系统管理员，提供追踪ID: ${traceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-500 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-4">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">403</h1>
          <h2 className="text-xl text-red-100">访问被拒绝</h2>
        </div>

        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              抱歉，您没有权限访问此页面。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="text-sm text-gray-500">
                <div className="mb-2">
                  <span className="font-medium">请求路径:</span> {requestedPath}
                </div>
                <div className="mb-2">
                  <span className="font-medium">拒绝原因:</span> {reason}
                </div>
                <div>
                  <span className="font-medium">追踪ID:</span> {traceId}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              返回上一页
            </button>
            
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              返回首页
            </button>
            
            <button
              onClick={handleContactSupport}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              联系支持
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">可能的解决方案:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>确认您已使用正确的账户登录</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>联系系统管理员申请相应权限</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>如有疑问，请提供上方的追踪ID给技术支持</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500">
          © 2026 系统管理平台. 如需帮助，请联系系统管理员。
        </div>
      </div>
    </div>
  );
}