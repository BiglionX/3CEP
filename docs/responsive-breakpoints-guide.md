# 响应式断点配置使用指南

## 📱 精细化响应式断点设置

本项目已实现完整的响应式断点系统，支持从移动设备到大型桌面显示器的全场景适配。

## 🎯 断点规格

### 标准断点 (基于Tailwind CSS)

```css
xs: 375px     /* 小型手机 (iPhone SE) */
sm: 640px     /* 大型手机 */
md: 768px     /* 平板竖屏 */
lg: 1024px    /* 平板横屏/小型桌面 */
xl: 1280px    /* 桌面 */
2xl: 1536px   /* 大型桌面 */
```

### 特殊设备断点

```css
mobile-s: 320px    /* 最小手机屏幕 */
mobile-m: 375px    /* 标准手机 */
mobile-l: 425px    /* 大屏手机 */
tablet: 768px      /* iPad竖屏 */
laptop: 1024px     /* 笔记本电脑 */
desktop: 1200px    /* 桌面显示器 */
wide: 1440px       /* 宽屏显示器 */
```

## 🛠️ 使用方法

### 1. CSS类名直接使用

```tsx
// 基础响应式类
<div className="xs:p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10">
  {/* 内容会根据不同屏幕尺寸自动调整padding */}
</div>

// 网格布局响应式
<div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
  <div>项目4</div>
</div>

// 隐藏/显示控制
<div className="xs:hidden md:block lg:hidden xl:block">
  {/* 在xs和lg屏幕上隐藏，在md和xl屏幕上显示 */}
</div>
```

### 2. 使用响应式配置工具

```tsx
import {
  ResponsiveClassGenerator,
  RESPONSIVE_CLASSES,
} from '@/lib/responsive-config';

// 生成响应式类名
const responsivePadding = ResponsiveClassGenerator.padding('4');
// 结果: "xs:p-4 sm:p-4 md:p-4 lg:p-4 xl:p-4"

const responsiveGrid = ResponsiveClassGenerator.grid(2, 'MOBILE');
// 结果: "xs:grid-cols-2 sm:grid-cols-2 mobile-s:grid-cols-2 mobile-m:grid-cols-2 mobile-l:grid-cols-2"

// 使用预定义的响应式类
<div className={RESPONSIVE_CLASSES.mobileOptimized}>
  {/* 移动端优化的padding设置 */}
</div>;
```

### 3. React Hook使用

```tsx
import { useResponsive } from '@/lib/responsive-config';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, deviceType, currentBreakpoint } =
    useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}

      <p>当前设备类型: {deviceType}</p>
      <p>当前断点: {currentBreakpoint}</p>
    </div>
  );
}
```

### 4. 响应式容器组件

```tsx
import { ResponsiveContainer } from '@/lib/responsive-config';

function App() {
  return (
    <ResponsiveContainer
      className="w-full"
      mobileClassName="bg-blue-100 p-4"
      tabletClassName="bg-green-100 p-6"
      desktopClassName="bg-purple-100 p-8"
    >
      <h1>响应式内容</h1>
      <p>根据设备类型自动调整样式</p>
    </ResponsiveContainer>
  );
}
```

### 5. 媒体查询工具函数

```tsx
import { MediaQueryHelper } from '@/lib/responsive-config';

// 检查屏幕尺寸
const isSmallScreen = MediaQueryHelper.isBelow('md'); // 屏幕宽度 < 768px
const isLargeScreen = MediaQueryHelper.isAbove('lg'); // 屏幕宽度 >= 1024px
const isTabletSize = MediaQueryHelper.isBetween('md', 'lg'); // 768px <= 宽度 < 1024px

// 获取当前设备信息
const deviceType = MediaQueryHelper.getCurrentDevice(); // 'MOBILE' | 'TABLET' | 'DESKTOP'
const currentBreakpoint = MediaQueryHelper.getCurrentBreakpoint(); // 当前匹配的断点
```

## 📊 设备分类

### 移动端 (MOBILE)

- xs, sm, mobile-s, mobile-m, mobile-l
- 屏幕宽度 < 768px
- 特点: 触控操作为主，单列布局

### 平板端 (TABLET)

- md, tablet
- 768px <= 屏幕宽度 < 1024px
- 特点: 可触控可鼠标，适合双列或多列布局

### 桌面端 (DESKTOP)

- lg, xl, 2xl, laptop, desktop, wide
- 屏幕宽度 >= 1024px
- 特点: 鼠标操作，复杂布局支持

## 🎨 最佳实践

### 1. 移动优先原则

```tsx
// ✅ 推荐：从小屏幕开始设计
<div className="p-2 sm:p-4 md:p-6 lg:p-8">
  {/* 移动端基础样式，逐步增强 */}
</div>

// ❌ 不推荐：从大屏幕开始
<div className="p-8 md:p-6 sm:p-4 xs:p-2">
  {/* 可能导致样式覆盖问题 */}
</div>
```

### 2. 合理使用断点

```tsx
// ✅ 针对性的断点使用
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 在关键断点处改变布局 */}
</div>

// ❌ 过度细分断点
<div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 mobile-m:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* 过于复杂，难以维护 */}
</div>
```

### 3. 组件化响应式设计

```tsx
// ✅ 封装响应式组件
function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full xs:p-2 sm:p-4 md:p-6 bg-white rounded-lg shadow">
      {children}
    </div>
  );
}

// 使用
<ResponsiveCard>
  <h3>标题</h3>
  <p>内容</p>
</ResponsiveCard>;
```

## 🚀 性能优化

### 1. 避免频繁的DOM操作

```tsx
// ✅ 使用CSS类而不是内联样式
<div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
  {/* 通过CSS类切换，避免重排重绘 */}
</div>

// ❌ 避免动态内联样式
<div style={{ padding: isMobile ? '8px' : '16px' }}>
  {/* 可能触发频繁的样式计算 */}
</div>
```

### 2. 合理使用媒体查询

```tsx
// ✅ 在组件级别使用媒体查询
const MobileView = () => <div className="md:hidden">移动端内容</div>;
const DesktopView = () => <div className="hidden md:block">桌面端内容</div>;

// ❌ 避免在每个元素上重复媒体查询
<div className="md:hidden">内容1</div>
<div className="md:hidden">内容2</div>
<div className="md:hidden">内容3</div>
```

## 📱 移动端特殊考虑

### 安全区域适配

```tsx
// 使用安全区域变量
<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  {/* 适配刘海屏和Home Indicator */}
</div>
```

### 触控目标大小

```tsx
// 确保触控目标足够大
<button className="w-11 h-11 flex items-center justify-center">
  {/* 44px是最小触控目标 */}
</button>
```

## 🧪 测试和调试

### 1. 浏览器开发者工具

- Chrome DevTools 设备模拟器
- Firefox 响应式设计模式
- Safari 开发者工具

### 2. 真机测试

- iOS设备 (iPhone/iPad)
- Android设备 (各种屏幕尺寸)
- Windows平板设备

### 3. 自动化测试

```tsx
// 使用Playwright进行响应式测试
test('should display mobile layout on small screens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.mobile-layout')).toBeVisible();
});
```

## 📈 监控和分析

### 1. 用户设备统计

```tsx
// 记录用户设备类型
useEffect(() => {
  const deviceType = MediaQueryHelper.getCurrentDevice();
  analytics.track('device_type', { type: deviceType });
}, []);
```

### 2. 性能监控

```tsx
// 监控不同设备的加载性能
useEffect(() => {
  const startTime = Date.now();

  return () => {
    const loadTime = Date.now() - startTime;
    const deviceType = MediaQueryHelper.getCurrentDevice();
    performanceMetrics.recordLoadTime(deviceType, loadTime);
  };
}, []);
```

## 🔧 配置自定义断点

如果需要添加自定义断点：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        custom: '900px', // 添加自定义断点
        'ultra-wide': '1800px',
      },
    },
  },
};
```

然后在代码中使用：

```tsx
<div className="custom:p-8 ultra-wide:p-12">{/* 自定义断点样式 */}</div>
```

---

**配置版本**: v1.0
**最后更新**: 2026年3月1日
**适用范围**: 维修店用户中心及全站响应式设计
