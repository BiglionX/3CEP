#!/usr/bin/env node

/**
 * 最终彻底诊断脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 最终彻底诊断\n');

// 1. 检查所有相关文件状态
console.log('1️⃣ 文件状态检查');

const criticalFiles = [
  'src/hooks/use-permission.tsx',
  'src/components/admin/RoleAwareLayout.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/api/auth/check-session/route.ts'
];

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  
  if (exists) {
    try {
      const stats = fs.statSync(fullPath);
      console.log(`   修改时间: ${stats.mtime.toLocaleString()}`);
    } catch (error) {
      console.log('   无法获取文件信息');
    }
  }
});

// 2. 检查认证相关代码
console.log('\n2️⃣ 认证逻辑检查');

const permissionHookPath = path.join(process.cwd(), 'src', 'hooks', 'use-permission.tsx');
if (fs.existsSync(permissionHookPath)) {
  const content = fs.readFileSync(permissionHookPath, 'utf8');
  
  console.log('usePermission hook 检查:');
  
  const checks = [
    {
      name: 'Supabase认证检查',
      pattern: 'fetch(\'/api/auth/check-session\'',
      required: true
    },
    {
      name: '管理员角色识别',
      pattern: 'sessionData.is_admin ? [\'admin\']',
      required: true
    },
    {
      name: 'localStorage备用方案',
      pattern: 'localStorage.getItem(\'jwt_token\'',
      required: true
    }
  ];
  
  checks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`  ${status} ${check.name}`);
  });
}

// 3. 检查API路由
console.log('\n3️⃣ API路由检查');

const checkSessionPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'check-session', 'route.ts');
if (fs.existsSync(checkSessionPath)) {
  const content = fs.readFileSync(checkSessionPath, 'utf8');
  
  console.log('check-session API检查:');
  
  const apiChecks = [
    {
      name: '导出GET函数',
      pattern: 'export async function GET',
      required: true
    },
    {
      name: '返回认证状态',
      pattern: 'authenticated:',
      required: true
    },
    {
      name: '返回管理员标识',
      pattern: 'is_admin:',
      required: true
    }
  ];
  
  apiChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`  ${status} ${check.name}`);
  });
}

// 4. 创建终极测试页面
console.log('\n4️⃣ 创建终极测试页面');

const ultimateTestPage = `
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UltimateTest() {
  const router = useRouter();
  const [testPhase, setTestPhase] = useState(0);
  const [results, setResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const log = (phase, message, status = 'info') => {
    const result = {
      phase,
      message,
      status,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
    console.log(\`[阶段\${phase}] [\${status}] \${message}\`);
  };

  const runUltimateTest = async () => {
    setResults([]);
    setIsTesting(true);
    setTestPhase(1);

    try {
      // 阶段1: 基础连通性测试
      log(1, '开始基础连通性测试', 'start');
      
      const healthResponse = await fetch('/api/health');
      log(1, \`健康检查: \${healthResponse.status}\`, 'data');

      setTestPhase(2);

      // 阶段2: 认证状态测试
      log(2, '开始认证状态测试', 'start');
      
      const authResponse = await fetch('/api/auth/check-session');
      const authData = await authResponse.json();
      
      log(2, \`认证API状态: \${authResponse.status}\`, 'data');
      log(2, \`是否已认证: \${authData.authenticated}\`, 'data');
      log(2, \`是否管理员: \${authData.is_admin}\`, 'data');
      log(2, \`用户邮箱: \${authData.user?.email || '无'}\`, 'data');

      setTestPhase(3);

      // 阶段3: 直接跳转测试
      log(3, '开始直接跳转测试', 'start');
      
      // 测试多种跳转方式
      const jumpMethods = [
        () => {
          log(3, '方法1: Next.js router.push', 'info');
          router.push('/admin');
        },
        () => {
          log(3, '方法2: window.location.href', 'info');
          window.location.href = '/admin';
        },
        () => {
          log(3, '方法3: 延迟跳转', 'info');
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1000);
        }
      ];
      
      jumpMethods.forEach((method, index) => {
        setTimeout(() => {
          try {
            method();
            log(3, \`跳转方法\${index + 1}已执行\`, 'success');
          } catch (error) {
            log(3, \`跳转方法\${index + 1}失败: \${error.message}\`, 'error');
          }
        }, index * 2000);
      });

      setTestPhase(4);

      // 阶段4: 综合登录测试
      log(4, '开始综合登录测试', 'start');
      
      if (!authData.authenticated) {
        log(4, '执行登录流程', 'info');
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: '1055603323@qq.com',
            password: '12345678'
          })
        });
        
        const loginResult = await loginResponse.json();
        log(4, \`登录状态: \${loginResponse.status}\`, 'data');
        log(4, \`登录成功: \${loginResponse.ok}\`, 'data');
        log(4, \`用户ID: \${loginResult.user?.id?.substring(0,8) || '无'}\`, 'data');
        
        if (loginResponse.ok) {
          setTimeout(() => {
            log(4, '登录成功后跳转测试', 'info');
            router.push('/admin/dashboard');
          }, 1000);
        }
      } else {
        log(4, '已处于登录状态，直接跳转测试', 'info');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      }

    } catch (error) {
      log(testPhase, \`测试过程出错: \${error.message}\`, 'error');
    } finally {
      setIsTesting(false);
      setTestPhase(5);
      log(5, '所有测试完成', 'end');
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestPhase(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-red-400">终极诊断测试</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">测试控制</h2>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <button
                  onClick={runUltimateTest}
                  disabled={isTesting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isTesting ? \`测试中... (阶段\${testPhase}/5)\` : '运行终极诊断'}
                </button>
                
                <button
                  onClick={clearResults}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  清除结果
                </button>
                
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  直接访问仪表板
                </button>
              </div>
              
              <div className="text-sm text-gray-300">
                <p>• 这个测试会全面验证认证、跳转等所有环节</p>
                <p>• 包含登录、认证检查、多种跳转方式测试</p>
                <p>• 会详细记录每个步骤的执行结果</p>
              </div>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">测试进度</h2>
              <div className="space-y-3">
                {[1,2,3,4,5].map(phase => (
                  <div 
                    key={phase}
                    className={\`p-3 rounded-lg \${
                      testPhase === phase ? 'bg-blue-600' :
                      testPhase > phase ? 'bg-green-600' :
                      'bg-gray-600'
                    }\`}
                  >
                    <div className="font-medium">
                      阶段 {phase}
                      {testPhase === phase && ' (进行中)'}
                      {testPhase > phase && ' (已完成)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400">测试结果</h2>
              <span className="text-sm text-gray-400">共 {results.length} 条记录</span>
            </div>
            
            <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {results.length === 0 ? (
                <p className="text-gray-500">等待测试开始...</p>
              ) : (
                results.map((result, index) => (
                  <div 
                    key={index} 
                    className={\`mb-2 p-3 rounded \${
                      result.status === 'error' ? 'bg-red-900/30 border border-red-700' :
                      result.status === 'success' ? 'bg-green-900/30 border border-green-700' :
                      result.status === 'data' ? 'bg-blue-900/30 border border-blue-700' :
                      'bg-gray-800'
                    }\`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">[阶段{result.phase}]</span>
                      <span className="text-gray-500 text-xs">{result.timestamp}</span>
                    </div>
                    <div className={
                      result.status === 'error' ? 'text-red-400' :
                      result.status === 'success' ? 'text-green-400' :
                      result.status === 'data' ? 'text-blue-400' :
                      'text-yellow-400'
                    }>
                      [{result.status.toUpperCase()}] {result.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-6">
            <h3 className="font-semibold text-red-400 mb-3">🚨 紧急解决方案</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-red-300 mb-2">如果测试失败：</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• 检查服务器控制台错误信息</li>
                  <li>• 验证所有API端点是否正常工作</li>
                  <li>• 确认环境变量配置正确</li>
                  <li>• 检查网络连接状态</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-300 mb-2">最后手段：</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• 临时禁用所有权限检查</li>
                  <li>• 直接访问管理后台页面</li>
                  <li>• 检查浏览器开发者工具</li>
                  <li>• 提供完整的错误日志</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// 保存终极测试页面
const testDir = path.join(process.cwd(), 'src', 'app', 'ultimate-diagnosis');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

fs.writeFileSync(
  path.join(testDir, 'page.tsx'),
  ultimateTestPage
);

console.log('✅ 创建了终极诊断测试页面: /ultimate-diagnosis');

// 5. 提供最终验证步骤
console.log('\n5️⃣ 最终验证步骤');

console.log('\n第一步: 运行终极诊断');
console.log('访问: http://localhost:3001/ultimate-diagnosis');
console.log('点击"运行终极诊断"按钮');
console.log('观察各阶段测试结果');

console.log('\n第二步: 直接登录测试');
console.log('访问: http://localhost:3001/login?redirect=/admin/dashboard');
console.log('使用账号: 1055603323@qq.com');
console.log('密码: 12345678');

console.log('\n第三步: 手动验证');
console.log('1. 检查浏览器Console错误');
console.log('2. 查看Network面板请求状态');
console.log('3. 验证Cookie设置情况');
console.log('4. 确认认证状态同步');

console.log('\n📊 如果所有测试都失败，请提供:');
console.log('- 完整的服务器控制台输出');
console.log('- 浏览器开发者工具的所有错误信息');
console.log('- 终极诊断页面的详细测试结果');
console.log('- 网络请求的详细响应信息');

console.log('\n✅ 诊断准备完成！请按步骤执行验证。');