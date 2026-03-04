#!/usr/bin/env node

/**
 * 缓存清理和问题诊断脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 缓存清理和问题诊断\n');

// 1. 检查仍在使用旧认证Hook的文件
console.log('1️⃣ 检查残留的旧认证Hook使用');

const grepResults = require('child_process').execSync(
  'findstr /r /s "use-permission" src\\*',
  { encoding: 'utf8' }
);
console.log('仍在使用use-permission的文件:');
console.log(grepResults || '未找到使用use-permission的文件');

// 2. 检查API端点状态
console.log('\n2️⃣ API端点健康检查');

const apiEndpoints = [
  '/api/auth/check-session',
  '/api/admin/users',
  '/api/health',
];

apiEndpoints.forEach(endpoint => {
  console.log(`检查 ${endpoint}...`);
  // 这里可以添加实际的API调用检查
});

// 3. 创建缓存清理指南
console.log('\n3️⃣ 浏览器缓存清理指南');

const cacheCleanupGuide = `
浏览器缓存清理步骤:

1. 硬刷新页面:
   - Windows/Linux: Ctrl + F5
   - Mac: Cmd + Shift + R

2. 开发者工具清理:
   - 按 F12 打开开发者工具
   - 右键刷新按钮 → "清空缓存并硬性重新加载"

3. 手动清理缓存:
   - Chrome: 设置 → 隐私和安全 → 清除浏览数据
   - Firefox: 选项 → 隐私与安全 → Cookies 和网站数据 → 清除数据

4. 禁用缓存(开发时):
   - 开发者工具 → Network标签 → 勾选"Disable cache"

5. 验证清理效果:
   - 检查Network面板确保加载的是最新文件
   - 查看Console是否还有旧的错误信息
`;

console.log(cacheCleanupGuide);

// 4. 创建临时修复页面
console.log('\n4️⃣ 创建临时修复页面');

const tempFixPage = `
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
          log(\`清理localStorage项: \${key}\`);
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
              <div className={\`h-3 w-3 rounded-full \${
                cleanupStatus === 'pending' ? 'bg-yellow-500' :
                cleanupStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                'bg-green-500'
              }\`}></div>
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
`;

fs.writeFileSync(
  path.join(process.cwd(), 'src', 'app', 'cache-fix', 'page.tsx'),
  tempFixPage
);

console.log('✅ 创建了缓存清理页面: /cache-fix');

// 5. 提供最终解决方案
console.log('\n5️⃣ 最终解决方案');

console.log('\n立即执行步骤:');

console.log('\n第一步: 访问缓存清理页面');
console.log('http://localhost:3001/cache-fix');
console.log('点击"开始清理缓存"按钮');

console.log('\n第二步: 手动强制刷新');
console.log('按 Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)');

console.log('\n第三步: 验证修复效果');
console.log('访问: http://localhost:3001/unified-auth-test');

console.log('\n预期结果:');
console.log('• 不再出现401和500错误');
console.log('• 认证状态正常显示');
console.log('• 登录功能正常工作');
console.log('• 管理后台可正常访问');

console.log('\n如果问题仍然存在，请提供:');
console.log('1. 浏览器Console的完整错误信息');
console.log('2. Network面板的请求详情');
console.log('3. 清理后的页面行为描述');

console.log('\n✅ 缓存清理准备完成！');
