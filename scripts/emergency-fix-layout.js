/**
 * 紧急修复布局组件的中文乱码
 */

const fs = require('fs');

// 修复 UnifiedFooter.tsx
function fixUnifiedFooter() {
  const filePath = 'src/components/layout/UnifiedFooter.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  const patterns = {
    '工作？': '工作日',
    '科技园？': '科技园',
    '高新技术企？': '高新技术企业',
    '全球化服务网？': '全球化服务网络',
  };
  
  Object.entries(patterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    content = content.replace(regex, correct);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 已修复：UnifiedFooter.tsx');
}

// 修复 UnifiedNavbar.tsx
function fixUnifiedNavbar() {
  const filePath = 'src/components/layout/UnifiedNavbar.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  const patterns = {
    '技术支？': '技术支持',
    '网站地？': '网站地图',
    '用户中？': '用户中心',
    '消息中？': '消息中心',
    '系统设？': '系统设置',
    '退出登？': '退出登录',
    '管理后？': '管理后台',
    '个？': '个人',
    '账？': '账户',
    '订？': '订单',
    '收？': '收藏',
    '足？': '足迹',
    '安？': '安全',
    '隐？': '隐私',
    '版？': '版本',
    '权？': '权限',
    '工？': '工作',
    '任？': '任务',
    '报？': '报告',
    '统？': '统计',
    '分？': '分析',
    '设？': '设置',
  };
  
  Object.entries(patterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    content = content.replace(regex, correct);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 已修复：UnifiedNavbar.tsx');
}

console.log('🔧 开始修复布局组件...\n');
fixUnifiedFooter();
fixUnifiedNavbar();
console.log('\n✅ 布局组件修复完成！');
