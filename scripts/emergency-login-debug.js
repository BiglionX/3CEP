#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 紧急诊断：登录闪退问题\n');

// 1. 检查关键文件状态
console.log('1️⃣ 检查关键组件文件状态...');

const criticalFiles = [
  'src/components/auth/UnifiedLogin.tsx',
  'src/app/login/page.tsx',
  'src/hooks/use-unified-auth.ts',
  'src/app/api/auth/login/route.ts',
];

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} - 最后修改: ${stats.mtime.toLocaleString()}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
  }
});

// 2. 检查UnifiedLogin组件的关键代码
console.log('\n2️⃣ 分析UnifiedLogin组件代码...');

const unifiedLoginPath = path.join(
  process.cwd(),
  'src/components/auth/UnifiedLogin.tsx'
);
if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  // 检查可能导致闪退的问题代码
  const problemPatterns = [
    {
      pattern: /useEffect\(.*isAuthenticated.*isOpen.*\)/s,
      desc: '认证检查useEffect',
    },
    {
      pattern: /router\.push.*redirectUrl/s,
      desc: '路由跳转逻辑',
    },
    {
      pattern: /setSuccess.*true.*setTimeout/s,
      desc: '成功状态设置',
    },
  ];

  problemPatterns.forEach(({ pattern, desc }) => {
    if (pattern.test(content)) {
      console.log(`✅ 找到${desc}相关代码`);
    } else {
      console.log(`⚠️  未找到${desc}代码`);
    }
  });

  // 检查是否有循环依赖
  const effectCount = (content.match(/useEffect/g) || []).length;
  const stateCount = (content.match(/useState/g) || []).length;
  console.log(`📊 useEffect数量: ${effectCount}`);
  console.log(`📊 useState数量: ${stateCount}`);
}

// 3. 创建简化版测试组件
console.log('\n3️⃣ 生成简化版登录组件用于测试...');

const simpleLoginComponent = `
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginTest() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 防止闪退的稳定初始化
  useEffect(() => {
    console.log('组件初始化完成');
    // 确保只执行一次
    if (typeof window !== 'undefined' && !window.initComplete) {
      window.initComplete = true;
      console.log('首次初始化标记设置');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 模拟API调用，避免实际网络请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'test@test.com' && password === '123456') {
        setIsLoggedIn(true);
        // 延迟跳转避免闪退
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
      } else {
        setError('邮箱或密码错误');
      }
    } catch (err) {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>✅ 登录成功</h2>
        <p>正在跳转到管理后台...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>简化版登录测试</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>邮箱:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>测试账号: test@test.com</p>
        <p>测试密码: 123456</p>
      </div>
    </div>
  );
}
`;

const testPagePath = path.join(
  process.cwd(),
  'src/app/simple-login-test/page.tsx'
);
fs.writeFileSync(testPagePath, simpleLoginComponent);
console.log('✅ 创建了简化版登录测试页面: /simple-login-test');

// 4. 生成紧急修复方案
console.log('\n4️⃣ 生成紧急修复方案...');

const emergencyFix = `
// 紧急修复UnifiedLogin组件闪退问题
// 文件路径: src/components/auth/UnifiedLogin.tsx

// 在组件顶部添加全局防抖动标志
if (typeof window !== 'undefined' && !window.unifiedLoginFixed) {
  window.unifiedLoginFixed = true;
  console.log('🚨 应用紧急修复补丁');
}

// 关键修复点:
// 1. 移除可能导致循环渲染的useEffect依赖
// 2. 添加组件挂载状态检查
// 3. 优化异步操作时机
`;

console.log('📋 紧急修复要点:');
console.log('1. 添加全局防抖动标志避免重复初始化');
console.log('2. 优化useEffect依赖数组');
console.log('3. 添加组件生命周期检查');
console.log('4. 延迟执行可能引起问题的操作');

console.log('\n🚀 立即执行建议:');
console.log('1. 访问简化测试页面: http://localhost:3001/simple-login-test');
console.log('2. 如果正常，逐步替换复杂组件');
console.log('3. 检查浏览器控制台错误信息');
console.log('4. 监控内存使用情况');

console.log('\n⚠️  如果问题持续存在，请提供:');
console.log('- 具体的错误信息');
console.log('- 浏览器控制台输出');
console.log('- 问题发生的精确时机');
