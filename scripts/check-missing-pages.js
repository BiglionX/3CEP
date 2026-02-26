const fs = require('fs');
const path = require('path');

// 定义应该存在的页面路由
const expectedRoutes = [
  // 用户中心相关
  '/',
  '/profile',
  '/profile/dashboard',
  '/profile/settings',
  '/profile/security',
  
  // 业务功能
  '/repair-shop',
  '/parts-market',
  '/device',
  '/crowdfunding',
  '/fcx',
  
  // 管理系统
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/shops',
  '/admin/content',
  '/admin/finance',
  
  // 系统工具
  '/help',
  '/feedback',
  '/contact',
  '/about',
  
  // 认证相关
  '/login',
  '/register',
  
  // 特殊页面
  '/not-found',
  '/unauthorized'
];

// 检查路由对应的文件是否存在
function checkRouteExists(route) {
  // 处理根路径
  if (route === '/') {
    return fs.existsSync(path.join(process.cwd(), 'src', 'app', 'page.tsx'));
  }
  
  // 处理 404 页面 (Next.js 特殊处理)
  if (route === '/not-found') {
    return fs.existsSync(path.join(process.cwd(), 'src', 'app', 'not-found.tsx'));
  }
  
  // 处理其他路径
  const routePath = path.join(process.cwd(), 'src', 'app', ...route.split('/').filter(p => p));
  
  // 检查目录和页面文件
  if (fs.existsSync(routePath) && fs.statSync(routePath).isDirectory()) {
    return fs.existsSync(path.join(routePath, 'page.tsx'));
  }
  
  return false;
}

// 执行检查
console.log('🔍 检查用户中心及相关页面完整性...\n');

let missingPages = [];
let existingPages = [];

expectedRoutes.forEach(route => {
  const exists = checkRouteExists(route);
  if (exists) {
    existingPages.push(route);
    console.log(`✅ ${route} - 页面存在`);
  } else {
    missingPages.push(route);
    console.log(`❌ ${route} - 页面缺失`);
  }
});

console.log('\n📊 检查结果汇总:');
console.log('========================');
console.log(`总页面数: ${expectedRoutes.length}`);
console.log(`存在页面: ${existingPages.length}`);
console.log(`缺失页面: ${missingPages.length}`);
console.log(`完整率: ${Math.round((existingPages.length / expectedRoutes.length) * 100)}%`);

if (missingPages.length > 0) {
  console.log('\n❌ 缺失的页面列表:');
  missingPages.forEach(page => {
    console.log(`   ${page}`);
  });
  
  console.log('\n💡 建议:');
  console.log('1. 为缺失的页面创建相应的 page.tsx 文件');
  console.log('2. 确保页面具有基本的布局和功能');
  console.log('3. 添加适当的权限控制和错误处理');
} else {
  console.log('\n🎉 所有预期页面均已存在！');
}

// 额外检查：查找项目中现有的页面文件
console.log('\n📂 项目中现有的主要页面:');
const appDir = path.join(process.cwd(), 'src', 'app');
if (fs.existsSync(appDir)) {
  const pages = [];
  
  function walkDir(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = basePath ? `${basePath}/${item}` : item;
      
      if (fs.statSync(fullPath).isDirectory()) {
        const pageFile = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          pages.push(relativePath);
        }
        walkDir(fullPath, relativePath);
      }
    });
  }
  
  walkDir(appDir);
  
  console.log(`共发现 ${pages.length} 个页面:`);
  pages.slice(0, 20).forEach(page => {
    console.log(`   /${page}`);
  });
  
  if (pages.length > 20) {
    console.log(`   ... 还有 ${pages.length - 20} 个页面`);
  }
}