'use client';

import { useState, useEffect } from 'react';

export default function DebugNavigationPage() {
  const [domElements, setDomElements] = useState<any[]>([]);

  useEffect(() => {
    // 检查页面中的导航相关元素
    const checkNavigationElements = () => {
      const headers = document.querySelectorAll('header, nav, .navbar, .navigation');
      const elementsArray = Array.from(headers).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 100) + '...'
      }));
      setDomElements(elementsArray);
    };

    // 延迟执行以确保DOM完全加载
    setTimeout(checkNavigationElements, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            导航调试页面
          </h1>
          <p className="text-lg text-gray-600">
            检测页面中存在的导航元素
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">检测到的导航元素:</h2>
          
          {domElements.length > 0 ? (
            <div className="space-y-4">
              {domElements.map((element, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">标签:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {element.tagName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">类名:</span>
                      <span className="ml-2 text-sm text-gray-600 break-all">
                        {element.className || '无'}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">内容预览:</span>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600 break-all">
                        {element.innerHTML}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在检测导航元素...</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">调试信息</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 检查是否存在重复的导航栏</li>
            <li>• 验证统一导航组件是否正常工作</li>
            <li>• 确认页面布局是否正确</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}