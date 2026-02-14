// Vercel Analytics 设置脚本
console.log('📊 Vercel Analytics 设置指南\n');

console.log('1️⃣ 在Vercel仪表板中开启Analytics:');
console.log('   - 登录 vercel.com');
console.log('   - 进入您的项目');
console.log('   - 点击 "Analytics" 标签');
console.log('   - 点击 "Enable Analytics" 按钮\n');

console.log('2️⃣ 安装Vercel Analytics包:');
console.log('   npm install @vercel/analytics\n');

console.log('3️⃣ 在应用根布局中添加Analytics组件:');
console.log(`
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
`);

console.log('\n4️⃣ 性能监控指标:');
console.log('   - 页面加载时间 (FCP, LCP)');
console.log('   - 首次渲染时间');
console.log('   - JavaScript执行时间');
console.log('   - API响应时间');
console.log('   - 用户体验分数\n');

console.log('5️⃣ 本地性能测试命令:');
console.log('   npm run perf-test');
console.log('   npm run lighthouse\n');

console.log('✅ Vercel Analytics设置完成！');