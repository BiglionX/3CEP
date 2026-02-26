
'use client';

import { useState, useEffect } from 'react';

export default function CacheFix() {
  const [cleanupStatus, setCleanupStatus] = useState('pending');
  const [messages, setMessages] = useState([]);

  const log = (message) => {
    setMessages(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message
    }]);
    console.log('[缓存修复]', message);
  };

  const performCleanup = () => {
    setCleanupStatus('running');
    setMessages([]);
    
    log('开始执行缓存清理...');
    
    // 1. 清理localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('token') || key.includes('auth') || key.includes('user')) {
          localStorage.removeItem(key);
          log(`清理localStorage项: ${key}`);
        }
      });
    } catch (error) {
      log('清理localStorage时出错: ' + error.message);
    }
    
    // 2. 清理sessionStorage
    try {
      sessionStorage.clear();
      log('清理sessionStorage完成');
    } catch (error) {
      log('清理sessionStorage时出错: ' + error.message);
    }
    
    // 3. 强制刷新
    log('准备强制刷新页面...');
    
    setTimeout(() => {
      log('执行页面刷新...');
      window.location.reload(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">缓存清理工具</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">问题说明</h2>
            <p className="text-blue-700">
              检测到页面仍在使用旧的认证系统，这通常是由于浏览器缓存了旧的JavaScript文件导致的。
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">清理状态</h2>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${
                cleanupStatus === 'pending' ? 'bg-yellow-500' :
                cleanupStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                'bg-green-500'
              }`}></div>
              <span className="text-gray-700">
                {cleanupStatus === 'pending' && '待执行'}
                {cleanupStatus === 'running' && '清理中...'}
                {cleanupStatus === 'complete' && '清理完成'}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">操作日志</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">等待开始清理...</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{msg.time}]</span> {msg.message}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={performCleanup}
              disabled={cleanupStatus !== 'pending'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {cleanupStatus === 'pending' ? '开始清理缓存' : 
               cleanupStatus === 'running' ? '清理中...' : '清理完成'}
            </button>
            
            <button
              onClick={() => window.location.href = '/unified-auth-test'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              测试统一认证
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">手动清理步骤:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
              <li>按 F12 打开开发者工具</li>
              <li>右键刷新按钮，选择"清空缓存并硬性重新加载"</li>
              <li>或者按 Ctrl+F5 强制刷新</li>
              <li>访问统一认证测试页面验证效果</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
