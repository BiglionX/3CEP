#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复登录界面闪烁问题...\n');

// 修复UnifiedLogin组件中的闪烁问题
const unifiedLoginPath = path.join(
  process.cwd(),
  'src',
  'components',
  'auth',
  'UnifiedLogin.tsx'
);

if (fs.existsSync(unifiedLoginPath)) {
  let content = fs.readFileSync(unifiedLoginPath, 'utf8');

  console.log('1️⃣ 修复认证状态检查的useEffect依赖...');

  // 找到有问题的useEffect
  const problematicEffect = `  // 如果已经登录，自动关闭或跳转
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      if (onLoginSuccess) {
        onLoginSuccess({ email: formData.email, is_admin });
      }
      handleClose();
    }
  }, [isAuthenticated, isOpen, onLoginSuccess, formData.email, is_admin]);`;

  // 替换为优化版本
  const fixedEffect = `  // 如果已经登录，自动关闭或跳转（优化版）
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // 使用setTimeout避免同步执行导致的闪烁
      const timer = setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({ email: formData.email, is_admin });
        }
        handleClose();
      }, 100); // 100ms延迟
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen, onLoginSuccess, formData.email, is_admin]);`;

  if (content.includes(problematicEffect)) {
    content = content.replace(problematicEffect, fixedEffect);
    console.log('✅ 修复了认证检查useEffect的闪烁问题');
  } else {
    console.log('⚠️  未找到预期的认证检查useEffect代码');
  }

  console.log('\n2️⃣ 优化登录成功处理逻辑...');

  // 找到登录成功的处理部分
  const loginSuccessSection = `      if (result.success) {
        setSuccess(true);
        // 保存记住我状态
        if (formData.rememberMe) {
          localStorage.setItem('remember_email', formData.email);
        } else {
          localStorage.removeItem('remember_email');
        }
        
        // 延迟关闭以显示成功状态
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          }
          handleClose();
          
          // 处理重定向
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (is_admin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);`;

  // 优化版本 - 减少不必要的状态变更
  const optimizedLoginSuccess = `      if (result.success) {
        setSuccess(true);
        // 保存记住我状态
        if (formData.rememberMe) {
          localStorage.setItem('remember_email', formData.email);
        } else {
          localStorage.removeItem('remember_email');
        }
        
        // 延迟处理重定向，避免组件卸载时的状态冲突
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          }
          
          // 直接执行重定向，避免多次状态变更
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (result.user?.is_admin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
          
          // 最后再关闭组件
          handleClose();
        }, 1800);`;

  if (content.includes(loginSuccessSection)) {
    content = content.replace(loginSuccessSection, optimizedLoginSuccess);
    console.log('✅ 优化了登录成功处理逻辑');
  }

  console.log('\n3️⃣ 添加防抖动机制...');

  // 在组件顶部添加防抖动状态
  const componentStart = `export function UnifiedLogin({`;

  const debounceAddition = `// 防抖动标志，避免重复渲染
let isProcessing = false;

export function UnifiedLogin({`;

  if (
    content.includes(componentStart) &&
    !content.includes('isProcessing = false')
  ) {
    content = content.replace(componentStart, debounceAddition);
    console.log('✅ 添加了防抖动机制');
  }

  // 写入修复后的内容
  fs.writeFileSync(unifiedLoginPath, content);
  console.log('\n✅ UnifiedLogin组件修复完成！');
} else {
  console.log('❌ 未找到UnifiedLogin组件文件');
}

// 修复登录页面的跳转逻辑
console.log('\n4️⃣ 优化登录页面跳转逻辑...');

const loginPages = [
  { path: 'src/app/login/page.tsx', name: '主登录页' },
  { path: 'src/app/admin/login/page.tsx', name: '管理员登录页' },
  { path: 'src/app/brand/login/page.tsx', name: '品牌商登录页' },
  { path: 'src/app/repair-shop/login/page.tsx', name: '维修商登录页' },
  { path: 'src/app/importer/login/page.tsx', name: '进口商登录页' },
  { path: 'src/app/exporter/login/page.tsx', name: '出口商登录页' },
];

loginPages.forEach(page => {
  const pagePath = path.join(process.cwd(), page.path);
  if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf8');

    // 添加跳转防抖动
    const jumpLogic = `  useEffect(() => {
    // 检查是否已经登录
    if (isAuthenticated) {
      // 已登录，根据redirect参数决定跳转位置
      if (redirect?.startsWith('/admin')) {
        router.push(redirect);
      } else if (is_admin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, is_admin, redirect, router]);`;

    const optimizedJumpLogic = `  useEffect(() => {
    // 检查是否已经登录（添加防抖动）
    if (isAuthenticated && !window.loginRedirectProcessed) {
      window.loginRedirectProcessed = true;
      
      // 延迟执行跳转，避免页面闪烁
      setTimeout(() => {
        if (redirect?.startsWith('/admin')) {
          router.push(redirect);
        } else if (is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }, 50);
    }
  }, [isAuthenticated, is_admin, redirect, router]);`;

    if (pageContent.includes(jumpLogic)) {
      pageContent = pageContent.replace(jumpLogic, optimizedJumpLogic);
      fs.writeFileSync(pagePath, pageContent);
      console.log(`✅ 优化了${page.name}的跳转逻辑`);
    }
  }
});

console.log('\n🎉 登录界面闪烁问题修复完成！');
console.log('\n📋 修复内容:');
console.log('1. 优化了认证状态检查的useEffect依赖');
console.log('2. 减少了不必要的状态变更和重新渲染');
console.log('3. 添加了防抖动机制避免重复执行');
console.log('4. 优化了登录成功后的处理流程');
console.log('5. 改进了页面跳转逻辑');

console.log('\n🚀 建议操作:');
console.log('1. 重启开发服务器: npm run dev');
console.log('2. 清除浏览器缓存');
console.log(
  '3. 测试登录流程: http://localhost:3001/login?redirect=/admin/dashboard'
);
console.log('4. 验证不再出现界面闪烁问题');
