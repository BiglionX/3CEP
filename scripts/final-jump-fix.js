#!/usr/bin/env node

/**
 * 最终跳转问题修复脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 最终跳转问题修复\n');

// 1. 创建一个简单的跳转测试页面，绕过中间件复杂性
const simpleJumpTest = `
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleJumpTest() {
  const router = useRouter();
  const [status, setStatus] = useState('准备测试...');
  const [results, setResults] = useState([]);

  const log = (message) => {
    const entry = {
      time: new Date().toLocaleTimeString(),
      message
    };
    setResults(prev => [...prev, entry]);
    setStatus(message);
    console.log('[SimpleJump]', message);
  };

  const testSimpleJump = async () => {
    setResults([]);
    log('开始简单跳转测试...');
    
    try {
      // 直接测试跳转到管理后台
      log('1. 测试直接跳转到 /admin');
      router.push('/admin');
      log('✅ 直接跳转指令已发送');
      
      // 等待一会儿再测试具体页面
      setTimeout(() => {
        log('2. 测试跳转到 /admin/dashboard');
        router.push('/admin/dashboard');
        log('✅ 仪表板跳转指令已发送');
      }, 1000);
      
      // 最后备选方案
      setTimeout(() => {
        log('3. 测试window.location跳转');
        window.location.href = '/admin/dashboard';
        log('✅ Window.location跳转已执行');
      }, 2000);
      
    } catch (error) {
      log(\`❌ 跳转测试失败: \${error.message}\`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">简单跳转测试</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">测试控制</h2>
              <button
                onClick={testSimpleJump}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                执行简单跳转测试
              </button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">当前状态</h2>
              <p className="text-lg font-mono bg-white p-3 rounded">{status}</p>
            </div>
            
            {results.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">测试日志</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.map((entry, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <span className="text-gray-500 text-sm">[{entry.time}]</span>{' '}
                      <span className="font-mono">{entry.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">诊断建议</h2>
              <ul className="space-y-2 text-yellow-700">
                <li>• 如果跳转成功，说明问题是中间件配置</li>
                <li>• 如果跳转失败，说明是路由配置问题</li>
                <li>• 检查浏览器Console是否有错误信息</li>
                <li>• 尝试清除浏览器缓存和Cookie</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// 2. 创建绕过中间件的管理后台页面
const bypassMiddlewarePage = `
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BypassMiddlewareTest() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('检查中...');
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 直接检查会话而不依赖中间件
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();
        
        if (data.authenticated && data.is_admin) {
          setAuthStatus('✅ 已认证为管理员');
          setCanAccess(true);
        } else {
          setAuthStatus('❌ 未认证或非管理员');
          setCanAccess(false);
        }
      } catch (error) {
        setAuthStatus(\`❌ 检查失败: \${error.message}\`);
        setCanAccess(false);
      }
    };
    
    checkAccess();
  }, []);

  const handleManualAccess = () => {
    // 直接跳转，忽略中间件
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">绕过中间件访问测试</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">认证状态</h2>
              <p className="text-lg font-mono bg-white p-3 rounded">{authStatus}</p>
            </div>
            
            {canAccess ? (
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-green-800">访问权限</h2>
                <p className="text-green-700 mb-4">您已获得管理员访问权限</p>
                <button
                  onClick={handleManualAccess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  直接访问管理后台 (绕过中间件)
                </button>
              </div>
            ) : (
              <div className="bg-red-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-red-800">访问受限</h2>
                <p className="text-red-700">您没有足够的权限访问管理后台</p>
              </div>
            )}
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">测试说明</h2>
              <ul className="space-y-2 text-yellow-700">
                <li>• 此页面绕过了中间件的权限检查</li>
                <li>• 直接使用API检查用户认证状态</li>
                <li>• 如果能正常访问，说明问题在中间件配置</li>
                <li>• 如果仍然无法访问，说明是路由配置问题</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// 3. 保存测试文件
const testDir = path.join(process.cwd(), 'src', 'app', 'simple-jump-test');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

fs.writeFileSync(
  path.join(testDir, 'page.tsx'),
  simpleJumpTest
);

const bypassDir = path.join(process.cwd(), 'src', 'app', 'bypass-middleware-test');
if (!fs.existsSync(bypassDir)) {
  fs.mkdirSync(bypassDir, { recursive: true });
}

fs.writeFileSync(
  path.join(bypassDir, 'page.tsx'),
  bypassMiddlewarePage
);

console.log('✅ 创建了两个测试页面:');
console.log('   1. /simple-jump-test - 简单跳转测试');
console.log('   2. /bypass-middleware-test - 绕过中间件测试');

console.log('\n📋 测试步骤:');

console.log('\n第一步: 简单跳转测试');
console.log('访问: http://localhost:3001/simple-jump-test');
console.log('点击"执行简单跳转测试"');
console.log('观察是否能跳转到管理后台');

console.log('\n第二步: 绕过中间件测试');
console.log('访问: http://localhost:3001/bypass-middleware-test');
console.log('查看认证状态');
console.log('如果有权限，点击直接访问按钮');

console.log('\n第三步: 标准登录测试');
console.log('访问: http://localhost:3001/login?redirect=/admin/dashboard');
console.log('使用账号: 1055603323@qq.com');
console.log('密码: 12345678');

console.log('\n📊 预期结果分析:');
console.log('• 如果简单跳转测试成功 → 问题不在路由配置');
console.log('• 如果绕过中间件测试成功 → 问题在中间件配置');
console.log('• 如果都失败 → 问题在更底层的配置');

console.log('\n🔧 紧急修复建议:');
console.log('如果确定是中间件问题，可以暂时禁用中间件进行测试:');
console.log('1. 重命名 src/middleware.ts 为 src/middleware.ts.bak');
console.log('2. 重启开发服务器');
console.log('3. 测试登录跳转功能');
console.log('4. 如果正常，说明确实是中间件配置问题');

console.log('\n✅ 测试页面已创建，请按步骤进行验证！');