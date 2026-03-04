'use client';

import { useEffect, useState } from 'react';

export default function TutorialsTestPage() {
  const [message, setMessage] = useState('测试页面加载?..');

  useEffect(() => {
    // 测试API连接
    const testAPI = async () => {
      try {
        const response = await fetch('/api/tutorials');
        if (response.ok) {
          const data = await response.json();
          setMessage(`API连接成功！找?${data?.length || 0} 个教程`);
        } else {
          setMessage(`API连接失败: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        setMessage(`API测试错误: ${error.message || error}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">教程管理测试页面</h1>
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
        <p className="text-blue-800">{message}</p>
      </div>
      <div className="mt-6">
        <a
          href="/admin/tutorials"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          前往教程管理页面
        </a>
      </div>
    </div>
  );
}
