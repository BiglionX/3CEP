'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginRedirectFixTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const [testResults, setTestResults] = useState<
    Array<{
      feature: string;
      status: 'pending' | 'success' | 'failed';
      details: string;
    }>
  >([]);
  const [debugInfo, setDebugInfo] = useState({
    url: '',
    search: '',
    params: {} as Record<string, string>,
    redirectValue: '',
  });

  // 初始化调试信息
  const initDebugInfo = () => {
    const url = window.location.href;
    const search = window.location.search;
    const params = Object.fromEntries(new URLSearchParams(search));

    setDebugInfo({
      url,
      search,
      params,
      redirectValue: redirect,
    });

    // TODO: 移除调试日志
    console.debug('🔍 调试信息:', {
      url,
      search,
      params,
      redirectValue: redirect,
    });
  };

  // 在组件挂载时初始化调试信息
  useState(() => {
    initDebugInfo();
  });

  const runRedirectTest = () => {
    setTestResults([]);

    // 测试1: URL参数检测
    const urlTest: any = {
      feature: 'URL参数检测',
      status: window.location.search.includes('redirect=')
         'success'
        : 'failed',
      details: window.location.search.includes('redirect=')
         `检测到redirect参数: ${redirect}`
        : 'URL中未找到redirect参数',
    };

    // 测试2: SearchParams Hook检测
    const hookTest: any = {
      feature: 'SearchParams Hook检测',
      status: redirect ? 'success' : 'failed',
      details: redirect
         `Hook获取到参数: ${redirect}`
        : 'Hook未能获取到redirect参数',
    };

    // 测试3: 参数解析准确性
    const parseTest: any = {
      feature: '参数解析准确性',
      status: redirect !== '/admin/dashboard' ? 'success' : 'pending',
      details:
        redirect !== '/admin/dashboard'
           `参数解析正确: ${redirect}`
          : '使用默认值，可能是正常情况',
    };

    // 测试4: 登录页面跳转测试
    const loginTest = {
      feature: '登录页面跳转测试',
      status: 'pending' as const,
      details: '点击下方按钮测试跳转到登录页面',
    };

    setTestResults([urlTest, hookTest, parseTest, loginTest]);
  };

  const testLoginJump = () => {
    const loginUrl = `/loginredirect=${encodeURIComponent(redirect)}`;
    // TODO: 移除调试日志
    console.debug('跳转到登录页面:', loginUrl);
    router.push(loginUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 登录控件重定向上下文提示修复测试</CardTitle>
            <p className="text-gray-600">
              诊断和修复登录测试中"未检测到重定向参数"的问题
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 调试信息展示 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">
                📊 当前页面调试信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-700">完整URL:</p>
                  <p className="text-blue-600 break-all">{debugInfo.url}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">查询参数:</p>
                  <p className="text-blue-600">{debugInfo.search || '(无)'}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">redirect值:</p>
                  <p className="text-blue-600">{debugInfo.redirectValue}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">所有参数:</p>
                  <p className="text-blue-600 text-xs">
                    {Object.keys(debugInfo.params).length > 0
                       JSON.stringify(debugInfo.params, null, 2)
                      : '无参数'}
                  </p>
                </div>
              </div>
            </div>

            {/* 测试控制面板 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">
                🧪 测试控制面板
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={runRedirectTest}>运行重定向检测测试</Button>
                <Button variant="outline" onClick={testLoginJump}>
                  跳转到登录页面测试
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  刷新页面
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">快速测试链接:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/login-redirect-fix-test')}
                >
                  无参数
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    router.push(
                      '/login-redirect-fix-testredirect=/admin/dashboard'
                    )
                  }
                >
                  管理后台
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    router.push('/login-redirect-fix-testredirect=/profile')
                  }
                >
                  用户页面
                </Button>
              </div>
            </div>

            {/* 测试结果 */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">📝 测试结果</h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success'
                         'bg-green-50 border-green-200'
                        : result.status === 'failed'
                           'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {result.feature}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          result.status === 'success'
                             'bg-green-200 text-green-800'
                            : result.status === 'failed'
                               'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {result.status === 'success'
                           '✓ 通过'
                          : result.status === 'failed'
                             '✗ 失败'
                            : '⚠️ 待确认'}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-gray-600">
                      {result.details}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 解决方案和建议 */}
            <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-3">
                💡 问题诊断和解决方案
              </h3>
              <div className="space-y-3 text-sm text-yellow-700">
                <div>
                  <p className="font-medium">常见问题及解决方案:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      <strong>URL中确实没有redirect参数:</strong>{' '}
                      这是正常情况，系统会使用默认值
                    </li>
                    <li>
                      <strong>Hook无法获取参数:</strong>{' '}
                      检查useSearchParams是否正确导入
                    </li>
                    <li>
                      <strong>参数解析错误:</strong> 确认URL编码是否正确
                    </li>
                    <li>
                      <strong>浏览器缓存问题:</strong> 尝试刷新页面或清除缓存
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">预期行为说明:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>当URL包含redirect参数时，应该能正确检测到</li>
                    <li>当URL不包含redirect参数时，使用默认值是正常行为</li>
                    <li>登录成功后应该根据redirect参数进行相应跳转</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-yellow-200">
                  <p className="font-medium">调试建议:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>打开浏览器开发者工具查看Console输出</li>
                    <li>检查Network标签中的请求参数</li>
                    <li>验证不同URL参数下的表现</li>
                    <li>测试登录流程的完整跳转</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
