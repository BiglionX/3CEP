#!/usr/bin/env node

/**
 * 登录跳转问题紧急修复脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 登录跳转问题紧急修复\n');

// 1. 修复环境变量配置
console.log('1️⃣ 修复环境变量配置');

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  let envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // 确保使用正确的端口
  envContent = envContent.replace(
    /NEXT_PUBLIC_SITE_URL=http:\/\/localhost:\d+/g,
    'NEXT_PUBLIC_SITE_URL=http://localhost:3001'
  );
  
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ .env.local 已更新为正确端口');
}

// 2. 修复登录页面跳转逻辑
console.log('\n2️⃣ 优化登录页面跳转逻辑');

const loginPagePath = path.join(process.cwd(), 'src', 'app', 'login', 'page.tsx');
if (fs.existsSync(loginPagePath)) {
  let content = fs.readFileSync(loginPagePath, 'utf8');
  
  // 确保跳转逻辑完整且健壮
  const jumpLogic = `
      if (response.ok) {
        // 登录成功，根据用户类型和redirect参数决定跳转位置
        console.log('登录成功，用户信息:', result.user);
        
        if (result.user?.is_admin) {
          // 管理员用户优先使用redirect参数，如果没有则跳转到管理后台
          const targetRedirect = redirect?.startsWith('/admin') ? redirect : '/admin/dashboard';
          console.log('管理员跳转到:', targetRedirect);
          router.push(targetRedirect);
        } else {
          // 普通用户跳转到指定页面或首页
          const targetRedirect = redirect || '/';
          console.log('普通用户跳转到:', targetRedirect);
          router.push(targetRedirect);
        }
      } else {`;

  // 替换现有的跳转逻辑
  content = content.replace(
    /if \(response\.ok\) \{[\s\S]*?\n\s*\} else \{/,
    jumpLogic
  );
  
  fs.writeFileSync(loginPagePath, content);
  console.log('✅ 登录页面跳转逻辑已优化');
}

// 3. 添加调试信息到登录API
console.log('\n3️⃣ 增强登录API调试信息');

const loginApiPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'login', 'route.ts');
if (fs.existsSync(loginApiPath)) {
  let content = fs.readFileSync(loginApiPath, 'utf8');
  
  // 在管理员检查部分添加调试日志
  const debugCode = `
    // 检查是否为管理员用户
    let isAdmin = false
    if (data.user) {
      console.log('用户登录成功:', data.user.email);
      
      // 首先检查用户元数据中的管理员标识
      if (data.user.user_metadata?.isAdmin === true) {
        isAdmin = true;
        console.log('通过用户元数据验证为管理员');
      } else {
        // 备用方案：检查数据库中的管理员记录
        try {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id, role, is_active')
            .eq('user_id', data.user.id)
            .eq('is_active', true)
            .single()

          isAdmin = !!adminData
          if (isAdmin) {
            console.log('通过数据库验证为管理员');
          }
        } catch (dbError) {
          // 数据库表不存在或查询失败时，使用用户元数据作为判断依据
          console.log('数据库管理员检查失败，使用用户元数据判断');
        }
      }
      
      console.log('最终管理员状态:', isAdmin);
    }`;

  content = content.replace(
    /\/\/ 检查是否为管理员用户[\s\S]*?isAdmin = !!adminData/g,
    debugCode
  );
  
  fs.writeFileSync(loginApiPath, content);
  console.log('✅ 登录API已添加调试信息');
}

// 4. 创建测试页面
console.log('\n4️⃣ 创建登录跳转测试页面');

const testPageContent = `
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginJumpTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';
  
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    const results = [];
    
    try {
      // 测试1: 检查当前认证状态
      results.push({
        step: '检查认证状态',
        status: '进行中...',
        details: ''
      });
      
      const authResponse = await fetch('/api/auth/check-session');
      const authData = await authResponse.json();
      
      results[0] = {
        step: '检查认证状态',
        status: authData.authenticated ? '✅ 已登录' : '❌ 未登录',
        details: \`用户: \${authData.user?.email || '无'}, 管理员: \${authData.is_admin || false}\`
      };
      
      // 测试2: 尝试登录
      if (!authData.authenticated) {
        results.push({
          step: '执行登录测试',
          status: '进行中...',
          details: '使用测试账号登录'
        });
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: '1055603323@qq.com',
            password: '12345678'
          })
        });
        
        const loginData = await loginResponse.json();
        
        results[1] = {
          step: '执行登录测试',
          status: loginResponse.ok ? '✅ 登录成功' : '❌ 登录失败',
          details: loginResponse.ok ? 
            \`用户: \${loginData.user?.email}, 管理员: \${loginData.user?.is_admin}\` :
            \`错误: \${loginData.error}\`
        };
        
        // 测试3: 检查跳转行为
        if (loginResponse.ok && loginData.user?.is_admin) {
          results.push({
            step: '验证跳转行为',
            status: '进行中...',
            details: \`期望跳转到: \${redirect}\`
          });
          
          // 模拟跳转
          setTimeout(() => {
            router.push(redirect);
          }, 2000);
        }
      } else {
        // 已登录状态下测试跳转
        results.push({
          step: '测试跳转行为',
          status: '进行中...',
          details: \`将跳转到: \${redirect}\`
        });
        
        setTimeout(() => {
          router.push(redirect);
        }, 2000);
      }
      
    } catch (error) {
      results.push({
        step: '测试执行',
        status: '❌ 发生错误',
        details: error.message
      });
    }
    
    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">登录跳转测试</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">测试参数</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">Redirect参数</h3>
                <p className="text-blue-600">{redirect}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">测试账号</h3>
                <p className="text-green-600">1055603323@qq.com</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <button
              onClick={runTest}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isTesting ? '测试进行中...' : '开始测试'}
            </button>
          </div>
          
          {testResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">测试结果</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{result.step}</h3>
                      <span className={
                        result.status.includes('✅') ? 'text-green-600' :
                        result.status.includes('❌') ? 'text-red-600' : 'text-yellow-600'
                      }>
                        {result.status}
                      </span>
                    </div>
                    {result.details && (
                      <p className="text-gray-600 mt-2">{result.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">手动测试链接</h2>
            <div className="space-y-2">
              <a 
                href="/login?redirect=/admin/dashboard" 
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                管理员登录测试 (/admin/dashboard)
              </a>
              <a 
                href="/login?redirect=/profile" 
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                普通用户登录测试 (/profile)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const testPagePath = path.join(process.cwd(), 'src', 'app', 'login-test', 'page.tsx');
const testPageDir = path.dirname(testPagePath);

if (!fs.existsSync(testPageDir)) {
  fs.mkdirSync(testPageDir, { recursive: true });
}

fs.writeFileSync(testPagePath, testPageContent);
console.log('✅ 登录跳转测试页面已创建');

// 5. 提供最终验证步骤
console.log('\n5️⃣ 最终验证步骤');

console.log('\n📋 立即执行的验证步骤:');
console.log('1. 重启开发服务器:');
console.log('   Ctrl+C 停止当前服务');
console.log('   npm run dev');
console.log('');
console.log('2. 访问测试页面:');
console.log('   http://localhost:3001/login-test');
console.log('');
console.log('3. 执行自动化测试');
console.log('   或手动测试:');
console.log('   http://localhost:3001/login?redirect=/admin/dashboard');
console.log('');
console.log('4. 检查浏览器开发者工具:');
console.log('   - Console标签: 查看登录和跳转日志');
console.log('   - Network标签: 确认API请求成功');
console.log('   - Application标签: 验证Cookie设置');

console.log('\n🔧 如果仍有问题，请检查:');
console.log('- 环境变量是否正确加载');
console.log('- Supabase配置是否有效');
console.log('- 数据库中用户权限设置');
console.log('- 浏览器缓存是否已清除');

console.log('\n✅ 修复完成！请按上述步骤验证效果。');