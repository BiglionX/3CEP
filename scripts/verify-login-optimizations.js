#!/usr/bin/env node

/**
 * 登录优化功能验证脚本
 * 验证以下优化是否完成：
 * 1. 重定向上下文提示: 用户清楚知道登录后要去哪里
 * 2. 智能目标识别: 自动识别并显示目标页面类型
 * 3. 登录成功倒计时: 3秒可视化倒计时，用户可主动控制
 * 4. 立即跳转按钮: 提供即时跳转的选择权
 * 5. 视觉反馈优化: 改进了成功消息的呈现方式
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证登录优化功能...\n');

// 1. 验证重定向上下文提示
console.log('1️⃣ 验证重定向上下文提示功能');

const unifiedLoginPath = path.join(
  process.cwd(),
  'src',
  'components',
  'auth',
  'UnifiedLogin.tsx'
);
let hasRedirectInfo = false;
let hasTargetDescription = false;

if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  // 检查是否有重定向信息组件
  hasRedirectInfo =
    content.includes('RedirectInfo') && content.includes('redirectUrl');

  // 检查是否有目标页面类型识别
  hasTargetDescription =
    content.includes('getTargetDescription') &&
    (content.includes('管理后台') ||
      content.includes('品牌商平台') ||
      content.includes('维修师平台') ||
      content.includes('贸易平台'));

  console.log(`   重定向信息组件: ${hasRedirectInfo ? '✅' : '❌'}`);
  console.log(`   目标页面识别: ${hasTargetDescription ? '✅' : '❌'}`);
} else {
  console.log('   ❌ 未找到UnifiedLogin组件文件');
}

// 2. 验证智能目标识别
console.log('\n2️⃣ 验证智能目标识别功能');

const targetTypes = ['管理后台', '品牌商平台', '维修师平台', '贸易平台'];
const identifiedTargets = [];

if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  targetTypes.forEach(target => {
    if (content.includes(target)) {
      identifiedTargets.push(target);
    }
  });

  console.log(`   识别的目标页面类型: ${identifiedTargets.length}种`);
  identifiedTargets.forEach(target => {
    console.log(`     • ${target}`);
  });

  const hasSmartDetection = identifiedTargets.length >= 3;
  console.log(
    `   智能识别完整度: ${hasSmartDetection ? '✅' : '⚠️'} (${identifiedTargets.length}/4)`
  );
}

// 3. 验证登录成功倒计时
console.log('\n3️⃣ 验证登录成功倒计时功能');

let hasCountdown = false;
let hasCountdownState = false;
let hasCountdownEffect = false;
let hasCountdownDisplay = false;

if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  hasCountdownState = content.includes(
    'const [countdown, setCountdown] = useState(3)'
  );
  hasCountdownEffect =
    content.includes('useEffect') && content.includes('countdown > 0');
  hasCountdownDisplay = content.includes('${countdown} 秒后跳转');
  hasCountdown = hasCountdownState && hasCountdownEffect && hasCountdownDisplay;

  console.log(`   倒计时状态管理: ${hasCountdownState ? '✅' : '❌'}`);
  console.log(`   倒计时效果钩子: ${hasCountdownEffect ? '✅' : '❌'}`);
  console.log(`   倒计时显示: ${hasCountdownDisplay ? '✅' : '❌'}`);
  console.log(`   完整倒计时功能: ${hasCountdown ? '✅' : '❌'}`);
}

// 4. 验证立即跳转按钮
console.log('\n4️⃣ 验证立即跳转按钮功能');

let hasImmediateJump = false;
let hasJumpButton = false;
let hasJumpHandler = false;

if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  hasJumpButton = content.includes('立即跳转') && content.includes('<button');
  hasJumpHandler =
    content.includes('performRedirect') && content.includes('onClick');
  hasImmediateJump = hasJumpButton && hasJumpHandler;

  console.log(`   立即跳转按钮: ${hasJumpButton ? '✅' : '❌'}`);
  console.log(`   跳转处理函数: ${hasJumpHandler ? '✅' : '❌'}`);
  console.log(`   完整立即跳转: ${hasImmediateJump ? '✅' : '❌'}`);
}

// 5. 验证视觉反馈优化
console.log('\n5️⃣ 验证视觉反馈优化功能');

let hasVisualFeedback = false;
let hasSuccessAnimation = false;
let hasColorFeedback = false;
let hasIconFeedback = false;

if (fs.existsSync(unifiedLoginPath)) {
  const content = fs.readFileSync(unifiedLoginPath, 'utf8');

  hasSuccessAnimation =
    content.includes('AnimatePresence') && content.includes('motion.div');
  hasColorFeedback =
    content.includes('bg-green-50') && content.includes('text-green-');
  hasIconFeedback =
    content.includes('CheckCircle') && content.includes('w-8 h-8');
  hasVisualFeedback =
    hasSuccessAnimation && hasColorFeedback && hasIconFeedback;

  console.log(`   成功动画效果: ${hasSuccessAnimation ? '✅' : '❌'}`);
  console.log(`   颜色反馈机制: ${hasColorFeedback ? '✅' : '❌'}`);
  console.log(`   图标反馈显示: ${hasIconFeedback ? '✅' : '❌'}`);
  console.log(`   完整视觉反馈: ${hasVisualFeedback ? '✅' : '❌'}`);
}

// 6. 验证API层面的支持
console.log('\n6️⃣ 验证API层面支持');

const loginApiPath = path.join(
  process.cwd(),
  'src',
  'app',
  'api',
  'auth',
  'login',
  'route.ts'
);
let hasApiSupport = false;

if (fs.existsSync(loginApiPath)) {
  const content = fs.readFileSync(loginApiPath, 'utf8');

  const hasRedirectHandling =
    content.includes('redirect') || content.includes('targetRedirect');
  const hasAdminCheck =
    content.includes('is_admin') || content.includes('admin');
  const hasSessionManagement =
    content.includes('session') || content.includes('token');

  hasApiSupport = hasRedirectHandling && hasAdminCheck && hasSessionManagement;

  console.log(`   重定向处理支持: ${hasRedirectHandling ? '✅' : '❌'}`);
  console.log(`   管理员权限检查: ${hasAdminCheck ? '✅' : '❌'}`);
  console.log(`   会话管理机制: ${hasSessionManagement ? '✅' : '❌'}`);
  console.log(`   API完整支持: ${hasApiSupport ? '✅' : '❌'}`);
}

// 7. 总体评估
console.log('\n📊 总体评估报告');

const features = {
  重定向上下文提示: hasRedirectInfo && hasTargetDescription,
  智能目标识别: identifiedTargets.length >= 3,
  登录成功倒计时: hasCountdown,
  立即跳转按钮: hasImmediateJump,
  视觉反馈优化: hasVisualFeedback,
  API层面支持: hasApiSupport,
};

const completedFeatures = Object.values(features).filter(Boolean).length;
const totalFeatures = Object.keys(features).length;
const completionRate = Math.round((completedFeatures / totalFeatures) * 100);

console.log(
  `\n✅ 已完成功能: ${completedFeatures}/${totalFeatures} (${completionRate}%)`
);

Object.entries(features).forEach(([feature, completed]) => {
  console.log(`   ${completed ? '✅' : '❌'} ${feature}`);
});

// 8. 提供测试建议
console.log('\n🧪 测试建议');

if (completionRate >= 80) {
  console.log('🟢 系统已基本完善，建议进行以下测试:');
  console.log('   1. 访问登录页面带不同redirect参数测试');
  console.log('   2. 使用管理员账号登录验证跳转');
  console.log('   3. 观察倒计时和立即跳转功能');
  console.log('   4. 检查视觉反馈效果');
} else if (completionRate >= 50) {
  console.log('🟡 系统部分完成，需要完善以下功能:');
  Object.entries(features).forEach(([feature, completed]) => {
    if (!completed) {
      console.log(`   • ${feature}`);
    }
  });
} else {
  console.log('🔴 系统需要大量完善工作');
}

// 9. 提供快速测试命令
console.log('\n🚀 快速测试命令');

console.log('\n本地开发测试:');
console.log('npm run dev');
console.log('访问: http://localhost:3000/login?redirect=/admin/dashboard');

console.log('\n生产环境测试:');
console.log('访问: https://你的域名/login?redirect=/admin/dashboard');

console.log('\n✅ 验证完成！');
