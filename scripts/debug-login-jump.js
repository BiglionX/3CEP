#!/usr/bin/env node

/**
 * 登录跳转实时调试脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 登录跳转实时调试\n');

// 1. 检查服务器运行状态
console.log('1️⃣ 服务器状态检查');

// 检查端口占用情况
console.log('检查端口3001占用情况...');
const { execSync } = require('child_process');
try {
  const portCheck = execSync('netstat -ano | findstr :3001', { encoding: 'utf8' });
  if (portCheck.includes('LISTENING')) {
    console.log('✅ 端口3001正在监听');
    const pid = portCheck.split('LISTENING')[1].trim().split(/\s+/)[0];
    console.log(`   进程ID: ${pid}`);
  } else {
    console.log('❌ 端口3001未被监听');
  }
} catch (error) {
  console.log('⚠️  无法检查端口状态');
}

// 2. 检查关键文件内容
console.log('\n2️⃣ 关键文件内容检查');

const loginPageRoute = path.join(process.cwd(), 'src', 'app', 'login', 'page.tsx');
if (fs.existsSync(loginPageRoute)) {
  const content = fs.readFileSync(loginPageRoute, 'utf8');
  
  console.log('登录页面跳转逻辑检查:');
  
  // 检查关键代码片段
  const checks = [
    {
      name: '跳转逻辑存在',
      pattern: 'router.push(targetRedirect)',
      required: true
    },
    {
      name: '管理员检查',
      pattern: 'result.user?.is_admin',
      required: true
    },
    {
      name: 'redirect参数处理',
      pattern: 'redirect?.startsWith(\'/admin\')',
      required: true
    },
    {
      name: '错误处理',
      pattern: 'setError(result.error',
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
console.log('\n3️⃣ 登录API检查');

const loginApiRoute = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'login', 'route.ts');
if (fs.existsSync(loginApiRoute)) {
  const content = fs.readFileSync(loginApiRoute, 'utf8');
  
  console.log('API响应结构检查:');
  
  const apiChecks = [
    {
      name: '返回用户信息',
      pattern: 'user: {',
      required: true
    },
    {
      name: '管理员标识',
      pattern: 'is_admin:',
      required: true
    },
    {
      name: '成功状态',
      pattern: 'success: true',
      required: true
    },
    {
      name: 'Cookie设置',
      pattern: 'response.cookies.set',
      required: true
    }
  ];
  
  apiChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`  ${status} ${check.name}`);
  });
}

// 4. 环境变量验证
console.log('\n4️⃣ 环境变量验证');

const envFiles = ['.env.local', '.env'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(`\n${envFile} 配置:`);
    
    const importantVars = [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    importantVars.forEach(varName => {
      const match = content.match(new RegExp(`${varName}=(.*)`));
      if (match) {
        console.log(`  ✅ ${varName}: ${match[1]}`);
      } else {
        console.log(`  ❌ ${varName}: 未设置`);
      }
    });
  }
});

// 5. 创建调试测试
console.log('\n5️⃣ 调试测试用例');

const debugTests = [
  {
    name: '直接API调用测试',
    command: `curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"1055603323@qq.com","password":"12345678"}'`,
    expected: '200状态码，包含user和is_admin字段'
  },
  {
    name: '会话检查测试',
    command: 'curl http://localhost:3001/api/auth/check-session',
    expected: '返回当前会话状态'
  },
  {
    name: '浏览器访问测试',
    url: 'http://localhost:3001/login?redirect=/admin/dashboard',
    steps: [
      '打开开发者工具',
      '切换到Network标签',
      '执行登录操作',
      '观察API请求和响应',
      '检查是否发生跳转'
    ]
  }
];

debugTests.forEach((test, index) => {
  console.log(`\n🧪 调试测试 ${index + 1}: ${test.name}`);
  if (test.command) {
    console.log('   命令:');
    console.log(`   ${test.command}`);
  }
  if (test.url) {
    console.log(`   URL: ${test.url}`);
  }
  if (test.steps) {
    console.log('   测试步骤:');
    test.steps.forEach(step => console.log(`     • ${step}`));
  }
  console.log(`   期望结果: ${test.expected}`);
});

// 6. 常见问题诊断
console.log('\n6️⃣ 常见问题诊断清单');

const diagnostics = [
  {
    problem: '登录API返回500错误',
    check: '查看服务器控制台错误信息',
    solution: '检查Supabase配置和数据库连接'
  },
  {
    problem: '登录成功但页面不跳转',
    check: '检查浏览器Console中的JavaScript错误',
    solution: '验证redirect参数传递和路由配置'
  },
  {
    problem: '管理员权限验证失败',
    check: '检查用户元数据和数据库记录',
    solution: '确认用户具有正确的管理员权限'
  },
  {
    problem: 'Cookie未正确设置',
    check: '查看Application标签中的Cookie',
    solution: '检查API中的Cookie设置逻辑'
  }
];

console.log('\n📋 诊断步骤:');
diagnostics.forEach((item, index) => {
  console.log(`\n${index + 1}. 问题: ${item.problem}`);
  console.log(`   检查: ${item.check}`);
  console.log(`   解决方案: ${item.solution}`);
});

// 7. 提供即时修复建议
console.log('\n7️⃣ 即时修复建议');

console.log('\n🔧 立即可执行的操作:');

console.log('\n步骤1: 重启开发服务器');
console.log('Ctrl+C 停止当前服务');
console.log('taskkill /F /PID <进程ID> (如果需要)');
console.log('npm run dev');

console.log('\n步骤2: 清除浏览器缓存');
console.log('- 打开开发者工具 (F12)');
console.log('- 右键刷新按钮，选择"清空缓存并硬性重新加载"');
console.log('- 或使用 Ctrl+Shift+R');

console.log('\n步骤3: 验证基本功能');
console.log('1. 访问: http://localhost:3001/login');
console.log('2. 打开开发者工具');
console.log('3. 执行登录操作');
console.log('4. 观察Console和Network面板');

console.log('\n📊 如果问题持续存在，请提供:');
console.log('- 完整的错误信息');
console.log('- 浏览器Console输出');
console.log('- Network请求详情');
console.log('- 具体的复现步骤');

console.log('\n✅ 调试准备完成！请按步骤执行诊断。');