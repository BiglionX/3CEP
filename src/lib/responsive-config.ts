import { useState, useEffect } from 'react';

// 响应式断点配置和工具函数
// 提供完整的移动端适配解决方案

// 断点定义常量
export const BREAKPOINTS = {
  // 标准断点 (Tailwind默认)
  xs: 375,      // 小型手机 (iPhone SE)
  sm: 640,      // 大型手机
  md: 768,      // 平板竖屏
  lg: 1024,     // 平板横屏/小型桌面
  xl: 1280,     // 桌面
  '2xl': 1536,  // 大型桌面

  // 特殊设备断点
  'mobile-s': 320,   // 最小手机屏?
  'mobile-m': 375,   // 标准手机 (iPhone SE)
  'mobile-l': 425,   // 大屏手机
  'tablet': 768,     // iPad竖屏
  'laptop': 1024,    // 笔记本电?
  'desktop': 1200,   // 桌面显示?
  'wide': 1440,      // 宽屏显示?
} as const;

// 断点枚举类型
export type Breakpoint = keyof typeof BREAKPOINTS;

// 设备类型分类
export const DEVICE_TYPES = {
  MOBILE: ['xs', 'sm', 'mobile-s', 'mobile-m', 'mobile-l'],
  TABLET: ['md', 'tablet'],
  DESKTOP: ['lg', 'xl', '2xl', 'laptop', 'desktop', 'wide']
} as const;

export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP';

// 响应式CSS类名生成?
export class ResponsiveClassGenerator {
  // 生成响应式padding�?
  static padding(basePadding: string, deviceType: DeviceType = 'MOBILE'): string {
    const devices = DEVICE_TYPES[deviceType];
    return devices.map(device => `p-${device}:${basePadding}`).join(' ');
  }

  // 生成响应式margin�?
  static margin(baseMargin: string, deviceType: DeviceType = 'MOBILE'): string {
    const devices = DEVICE_TYPES[deviceType];
    return devices.map(device => `m-${device}:${baseMargin}`).join(' ');
  }

  // 生成响应式网格类
  static grid(columns: number, deviceType: DeviceType = 'MOBILE'): string {
    const devices = DEVICE_TYPES[deviceType];
    return devices.map(device => `${device}:grid-cols-${columns}`).join(' ');
  }

  // 生成响应式flex方向?
  static flexDirection(direction: 'row' | 'col', deviceType: DeviceType = 'MOBILE'): string {
    const devices = DEVICE_TYPES[deviceType];
    const flexDir = direction === 'row' ? 'flex-row' : 'flex-col';
    return devices.map(device => `${device}:${flexDir}`).join(' ');
  }

  // 生成响应式隐藏类
  static hiddenOn(deviceTypes: DeviceType[]): string {
    const breakpoints = deviceTypes.flatMap(type => DEVICE_TYPES[type]);
    return breakpoints.map(bp => `${bp}:hidden`).join(' ');
  }

  // 生成响应式显示类
  static showOn(deviceTypes: DeviceType[]): string {
    const breakpoints = deviceTypes.flatMap(type => DEVICE_TYPES[type]);
    return breakpoints.map(bp => `${bp}:block`).join(' ');
  }
}

// 媒体查询工具函数
export class MediaQueryHelper {
  // 检查当前屏幕是否小于指定断?
  static isBelow(breakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS[breakpoint];
  }

  // 检查当前屏幕是否大于等于指定断?
  static isAbove(breakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= BREAKPOINTS[breakpoint];
  }

  // 检查当前屏幕是否在两个断点之间
  static isBetween(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= BREAKPOINTS[minBreakpoint] && width < BREAKPOINTS[maxBreakpoint];
  }

  // 获取当前设备类型
  static getCurrentDevice(): DeviceType {
    if (typeof window === 'undefined') return 'DESKTOP';

    const width = window.innerWidth;

    if (width < BREAKPOINTS.md) return 'MOBILE';
    if (width < BREAKPOINTS.lg) return 'TABLET';
    return 'DESKTOP';
  }

  // 获取当前断点名称
  static getCurrentBreakpoint(): Breakpoint | null {
    if (typeof window === 'undefined') return null;

    const width = window.innerWidth;
    const breakpoints = Object.entries(BREAKPOINTS) as [Breakpoint, number][];

    // 从大到小排序找到匹配的断?
    const sortedBreakpoints = [...breakpoints].sort(([,a], [,b]) => b - a);

    for (const [breakpoint, minWidth] of sortedBreakpoints) {
      if (width >= minWidth) {
        return breakpoint;
      }
    }

    return breakpoints[0][0]; // 返回最小的断点
  }
}

// React Hook用于响应式检?
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < BREAKPOINTS.md;
  const isTablet = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg;
  const isDesktop = windowSize.width >= BREAKPOINTS.lg;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    deviceType: isMobile ? 'MOBILE' : isTablet ? 'TABLET' : 'DESKTOP',
    currentBreakpoint: MediaQueryHelper.getCurrentBreakpoint(),
  };
}

// 响应式组件Props类型
export interface ResponsiveProps {
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  children: React.ReactNode;
}

// 响应式容器组?
export function ResponsiveContainer({
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  children
}: ResponsiveProps) {
  const { deviceType } = useResponsive();

  let responsiveClass = className;

  switch (deviceType) {
    case 'MOBILE':
      responsiveClass += ` ${mobileClassName}`;
      break;
    case 'TABLET':
      responsiveClass += ` ${tabletClassName}`;
      break;
    case 'DESKTOP':
      responsiveClass += ` ${desktopClassName}`;
      break;
  }

  return (
    <div className={responsiveClass.trim()}>
      {children}
    </div>
  );
}

// 导出常用的响应式类名
export const RESPONSIVE_CLASSES = {
  // 移动端优化类
  mobileOptimized: 'xs:p-4 sm:p-6 md:p-8',
  mobileGrid: 'xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  mobileFlex: 'xs:flex-col sm:flex-row',

  // 隐藏显示控制
  hideOnMobile: 'xs:hidden sm:block',
  hideOnTablet: 'md:hidden lg:block',
  hideOnDesktop: 'lg:hidden xl:block',

  showOnMobile: 'xs:block sm:hidden',
  showOnTablet: 'md:block lg:hidden',
  showOnDesktop: 'lg:block xl:hidden',

  // 响应式间?
  responsivePadding: 'xs:p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10',
  responsiveMargin: 'xs:m-2 sm:m-4 md:m-6 lg:m-8 xl:m-10',

  // 响应式字?
  responsiveText: 'xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl',
} as const;

// 初始化响应式检?
export function initResponsiveDetection() {
  if (typeof window === 'undefined') return;

  // 添加设备类型到body class
  const updateBodyClass = () => {
    const deviceType = MediaQueryHelper.getCurrentDevice();
    document.body.className = document.body.className
      .replace(/device-(mobile|tablet|desktop)/g, '')
      .trim();
    document.body.classList.add(`device-${deviceType.toLowerCase()}`);
  };

  updateBodyClass();
  window.addEventListener('resize', updateBodyClass);

  return () => {
    window.removeEventListener('resize', updateBodyClass);
  };
}

// 默认导出
export default {
  BREAKPOINTS,
  DEVICE_TYPES,
  ResponsiveClassGenerator,
  MediaQueryHelper,
  useResponsive,
  ResponsiveContainer,
  RESPONSIVE_CLASSES,
  initResponsiveDetection,
};
