#!/usr/bin/env node

/**
 * 登录跳转问题根源诊断脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 登录跳转问题根源诊断\n');

// 1. 系统状态全面检查
console.log('1️⃣ 系统状态全面检查');

// 检查Node.js和npm版本
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js版本: ${nodeVersion}`);
  console.log(`✅ npm版本: ${npmVersion}`);
} catch (error) {
  console.log('❌ 无法获取Node.js/npm版本信息');
}

// 检查端口占用
console.log('\n端口状态检查:');
try {
  const portCheck = execSync('netstat -ano | findstr :3001', {
    encoding: 'utf8',
  });
  if (portCheck.includes('LISTENING')) {
    const pid = portCheck.split('LISTENING')[1].trim().split(/\s+/)[0];
    console.log(`✅ 端口3001正在监听 (PID: ${pid})`);
  } else {
    console.log('❌ 端口3001未被监听');
  }
} catch (error) {
  console.log('⚠️  无法检查端口状态');
}

// 2. 文件完整性检查
console.log('\n2️⃣ 文件完整性检查');

const criticalPaths = [
  'src/app/login/page.tsx',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/check-session/route.ts',
  'src/components/GoogleLoginButton.tsx',
  'src/lib/auth-service.ts',
];

criticalPaths.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${filePath}`);

  if (exists) {
    try {
      const stats = fs.statSync(fullPath);
      console.log(
        `   大小: ${stats.size} bytes, 修改时间: ${stats.mtime.toLocaleString()}`
      );
    } catch (error) {
      console.log('   ⚠️  无法获取文件信息');
    }
  }
});

// 3. 代码逻辑深度分析
console.log('\n3️⃣ 代码逻辑深度分析');

// 分析登录页面的关键逻辑
const loginPagePath = path.join(
  process.cwd(),
  'src',
  'app',
  'login',
  'page.tsx'
);
if (fs.existsSync(loginPagePath)) {
  const content = fs.readFileSync(loginPagePath, 'utf8');

  console.log('\n登录页面逻辑检查:');

  // 检查关键代码段
  const logicChecks = [
    {
      name: 'useRouter导入',
      pattern: "import { useRouter } from 'next/navigation'",
      required: true,
    },
    {
      name: 'redirect参数获取',
      pattern: "const redirect = searchParams.get('redirect')",
      required: true,
    },
    {
      name: '登录处理函数',
      pattern: 'const handleSubmit = async (e: React.FormEvent) =>',
      required: true,
    },
    {
      name: 'API调用',
      pattern: "await fetch('/api/auth/login'",
      required: true,
    },
    {
      name: '响应处理',
      pattern: 'const result = await response.json()',
      required: true,
    },
    {
      name: '跳转逻辑',
      pattern: 'router.push(targetRedirect)',
      required: true,
    },
  ];

  logicChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : check.required ? '❌' : '⚠️';
    console.log(`  ${status} ${check.name}`);
  });

  // 显示实际的跳转逻辑
  console.log('\n实际跳转逻辑代码:');
  const jumpLogic = content.match(
    /if \(response\.ok\) \{[\s\S]*?router\.push\(targetRedirect\);[\s\S]*?\}/
  );
  if (jumpLogic) {
    console.log(jumpLogic[0]);
  }
}

// 4. API响应结构验证
console.log('\n4️⃣ API响应结构验证');

const apiRoutePath = path.join(
  process.cwd(),
  'src',
  'app',
  'api',
  'auth',
  'login',
  'route.ts'
);
if (fs.existsSync(apiRoutePath)) {
  const content = fs.readFileSync(apiRoutePath, 'utf8');

  console.log('API响应结构:');

  const responseChecks = [
    {
      name: 'NextResponse导入',
      pattern: "import { NextResponse } from 'next/server'",
      required: true,
    },
    {
      name: 'POST方法导出',
      pattern: 'export async function POST(request: Request)',
      required: true,
    },
    {
      name: '用户数据返回',
      pattern: 'user: {',
      required: true,
    },
    {
      name: '管理员标识',
      pattern: 'is_admin:',
      required: true,
    },
    {
      name: '会话数据',
      pattern: 'session:',
      required: true,
    },
    {
      name: '成功状态',
      pattern: 'success: true',
      required: true,
    },
  ];

  responseChecks.forEach(check => {
    const found = content.includes(check.pattern);
    const status = found ? '✅' : check.required ? '❌' : '⚠️';
    console.log(`  ${status} ${check.name}`);
  });
}

// 5. 环境配置验证
console.log('\n5️⃣ 环境配置验证');

const envChecks = ['.env.local', '.env'];

envChecks.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(`\n${envFile} 配置详情:`);

    // 提取关键配置
    const configs = [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NODE_ENV',
    ];

    configs.forEach(config => {
      const match = content.match(new RegExp(`${config}=(.*)`));
      if (match) {
        console.log(`  ✅ ${config}: ${match[1]}`);
      } else {
        console.log(`  ❌ ${config}: 未设置`);
      }
    });
  }
});

// 6. 创建综合测试方案
console.log('\n6️⃣ 综合测试方案');

const comprehensiveTests = [
  {
    name: '服务器启动测试',
    steps: [
      '停止当前服务: Ctrl+C',
      '清理端口占用: taskkill /F /PID <进程ID>',
      '重新启动: npm run dev',
      '确认端口3001监听状态',
    ],
    expected: '服务器正常启动，无编译错误',
  },
  {
    name: 'API功能测试',
    steps: [
      '使用curl或Postman测试登录API',
      '验证返回200状态码',
      '检查响应包含user和is_admin字段',
      '确认会话数据正确',
    ],
    expected: 'API返回完整正确的用户信息',
  },
  {
    name: '前端交互测试',
    steps: [
      '访问登录页面带redirect参数',
      '打开开发者工具',
      '执行登录操作',
      '观察Console日志输出',
      '检查Network请求响应',
      '验证页面是否跳转',
    ],
    expected: '完整的前端交互流程正常工作',
  },
  {
    name: '权限验证测试',
    steps: [
      '登录后访问管理后台',
      '检查用户权限状态',
      '验证管理员功能可用性',
      '测试会话持久性',
    ],
    expected: '权限系统正常工作',
  },
];

comprehensiveTests.forEach((test, index) => {
  console.log(`\n🧪 综合测试 ${index + 1}: ${test.name}`);
  console.log('   测试步骤:');
  test.steps.forEach(step => console.log(`     • ${step}`));
  console.log(`   期望结果: ${test.expected}`);
});

// 7. 故障排除矩阵
console.log('\n7️⃣ 故障排除矩阵');

const troubleshootingMatrix = [
  {
    symptom: 'API返回500错误',
    possible_causes: ['Supabase配置错误', '数据库连接失败', '环境变量缺失'],
    diagnostic_steps: ['检查服务器日志', '验证环境变量', '测试数据库连接'],
    solutions: ['修正Supabase配置', '检查网络连接', '补充必要环境变量'],
  },
  {
    symptom: '登录成功但不跳转',
    possible_causes: ['JavaScript错误', '路由配置问题', '浏览器缓存'],
    diagnostic_steps: ['查看Console错误', '检查路由文件', '清空浏览器缓存'],
    solutions: ['修复JavaScript错误', '修正路由配置', '强制刷新页面'],
  },
  {
    symptom: '管理员权限验证失败',
    possible_causes: ['用户数据不完整', '权限逻辑错误', '数据库记录缺失'],
    diagnostic_steps: ['检查用户元数据', '验证权限判断逻辑', '确认数据库记录'],
    solutions: ['完善用户数据', '修正权限逻辑', '添加数据库记录'],
  },
  {
    symptom: 'Cookie未正确设置',
    possible_causes: ['API Cookie设置错误', '浏览器阻止Cookie', '域名配置问题'],
    diagnostic_steps: ['检查API响应头', '查看浏览器Cookie设置', '验证域名配置'],
    solutions: ['修正Cookie设置', '调整浏览器设置', '修正域名配置'],
  },
];

console.log('\n📋 故障排除指南:');
troubleshootingMatrix.forEach((issue, index) => {
  console.log(`\n${index + 1}. 症状: ${issue.symptom}`);
  console.log(`   可能原因: ${issue.possible_causes.join(', ')}`);
  console.log(`   诊断步骤: ${issue.diagnostic_steps.join(', ')}`);
  console.log(`   解决方案: ${issue.solutions.join(', ')}`);
});

// 8. 提供紧急修复方案
console.log('\n8️⃣ 紧急修复方案');

console.log('\n🔧 立即执行的修复步骤:');

console.log('\n步骤1: 完全重启开发环境');
console.log('1. Ctrl+C 停止当前服务');
console.log(
  "2. taskkill /F /PID $(netstat -ano | findstr :3001 | findstr LISTENING | awk '{print $5}')"
);
console.log('3. 删除 .next 目录: rmdir /s /q .next');
console.log('4. 重新安装依赖: npm install');
console.log('5. 启动服务: npm run dev');

console.log('\n步骤2: 浏览器端清理');
console.log('1. 打开无痕模式浏览器');
console.log('2. 访问: http://localhost:3001/login?redirect=/admin/dashboard');
console.log('3. 执行登录测试');
console.log('4. 观察开发者工具输出');

console.log('\n步骤3: 系统性验证');
console.log('1. 访问调试页面: http://localhost:3001/login-debug');
console.log('2. 运行自动化测试');
console.log('3. 逐项验证每个功能点');

console.log('\n📊 如果问题仍然存在，请提供:');
console.log('- 完整的服务器启动日志');
console.log('- 浏览器Console的所有输出');
console.log('- Network面板的详细请求信息');
console.log('- 具体的错误消息和复现步骤');
console.log('- 使用的浏览器版本和操作系统');

console.log('\n✅ 诊断完成！请按上述步骤执行紧急修复。');
