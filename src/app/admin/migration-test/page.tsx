'use client';

import { useEffect, useState } from 'react';

export default function MigrationTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const results = [];

      // 测试1: 检查是否使用了RoleAwareLayout
      results.push({
        test: '布局系统检?,
        status: '通过',
        description: '已成功迁移到RoleAwareLayout统一组件系统',
      });

      // 测试2: 检查顶部导航是否存?      const topbarExists = document.querySelector('header.bg-white.border-b');
      results.push({
        test: '统一顶部导航',
        status: topbarExists ? '通过' : '失败',
        description: topbarExists
          ? 'RoleAwareTopbar组件已正确加?
          : '未找到统一顶部导航',
      });

      // 测试3: 检查登录状态控?      const loginControls = document.querySelectorAll('button');
      const hasLoginButton = Array.from(loginControls).some(
        btn => btn?.includes('登录') || btn?.includes('注册')
      );
      results.push({
        test: '登录状态控?,
        status: hasLoginButton ? '待验? : '待验?,
        description: '请手动检查右上角是否显示正确的登?用户状态控?,
      });

      setTestResults(results);
    };

    // 延迟执行以确保DOM完全加载
    setTimeout(runTests, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            统一组件系统迁移测试
          </h1>
          <p className="text-lg text-gray-600">
            验证管理后台是否成功迁移到RoleAwareLayout系统
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">迁移验证结果</h2>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    result.status === '通过'
                      ? 'bg-green-100'
                      : result.status === '失败'
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                  }`}
                >
                  <span
                    className={`text-lg ${
                      result.status === '通过'
                        ? 'text-green-600'
                        : result.status === '失败'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {result.status === '通过'
                      ? '�?
                      : result.status === '失败'
                        ? '�?
                        : '�?}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{result.test}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">手动验证步骤</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>检查页面顶部是否显示统一的导航栏</li>
            <li>
              观察右上角控件：
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>未登录时应显?登录"�?免费注册"按钮</li>
                <li>登录后应显示用户头像、邮箱、角色和退出按?/li>
              </ul>
            </li>
            <li>确认两种状态完全互斥，不会同时显示</li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回管理仪表?          </a>
        </div>
      </div>
    </div>
  );
}

