/**
 * 移动端布局 Hook
 * 提供屏幕尺寸、方向等信息检测
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UseMobileLayoutReturn {
  /** 是否为移动设备 (宽度 < 768px) */
  isMobile: boolean;
  /** 是否为平板设备 (768px <= 宽度 < 1024px) */
  isTablet: boolean;
  /** 是否为桌面设备 (宽度 >= 1024px) */
  isDesktop: boolean;
  /** 屏幕宽度 */
  screenWidth: number;
  /** 屏幕高度 */
  screenHeight: number;
  /** 是否为横屏模式 */
  isLandscape: boolean;
  /** 是否为竖屏模式 */
  isPortrait: boolean;
  /** 触摸设备支持 */
  isTouchDevice: boolean;
  /** 安全区域 insets */
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface UseMobileLayoutOptions {
  /** 移动设备断点 (默认 768px) */
  mobileBreakpoint?: number;
  /** 平板设备断点 (默认 1024px) */
  tabletBreakpoint?: number;
  /** 检测频率 (毫秒，默认 100ms) */
  throttleMs?: number;
}

/**
 * 移动端布局 Hook
 *
 * 提供屏幕尺寸、方向、设备类型等信息
 *
 * @param options - 配置选项
 * @returns 设备信息和状态
 */
export function useMobileLayout(
  options: UseMobileLayoutOptions = {}
): UseMobileLayoutReturn {
  const {
    mobileBreakpoint = 768,
    tabletBreakpoint = 1024,
    throttleMs = 100,
  } = options;

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [screenHeight, setScreenHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // 检测设备类型
  const isMobile = screenWidth < mobileBreakpoint;
  const isTablet =
    screenWidth >= mobileBreakpoint && screenWidth < tabletBreakpoint;
  const isDesktop = screenWidth >= tabletBreakpoint;

  // 检测屏幕方向
  const isLandscape = screenWidth > screenHeight;
  const isPortrait = screenWidth <= screenHeight;

  // 节流函数
  const throttle = useCallback((func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;

    return () => {
      const currentTime = Date.now();
      const timeSinceLastExec = currentTime - lastExecTime;

      if (timeSinceLastExec >= delay) {
        lastExecTime = currentTime;
        func();
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastExecTime = Date.now();
          func();
        }, delay - timeSinceLastExec);
      }
    };
  }, []);

  // 更新屏幕尺寸
  const updateScreenSize = useCallback(() => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);

    // 检测触摸设备
    setIsTouchDevice(
      'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - IE/Edge 支持
        navigator.msMaxTouchPoints > 0
    );

    // 计算安全区域 (iOS notched devices)
    const rootStyles = getComputedStyle(document.documentElement);
    setSafeAreaInsets({
      top: parseInt(rootStyles.getPropertyValue('--sat')) || 0,
      bottom: parseInt(rootStyles.getPropertyValue('--sab')) || 0,
      left: parseInt(rootStyles.getPropertyValue('--sal')) || 0,
      right: parseInt(rootStyles.getPropertyValue('--sar')) || 0,
    });
  }, []);

  useEffect(() => {
    // 初始检测
    updateScreenSize();

    // 监听窗口大小变化 (带节流)
    const throttledUpdate = throttle(updateScreenSize, throttleMs);
    window.addEventListener('resize', throttledUpdate);
    window.addEventListener('orientationchange', throttledUpdate);

    return () => {
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('orientationchange', throttledUpdate);
    };
  }, [updateScreenSize, throttle]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    isLandscape,
    isPortrait,
    isTouchDevice,
    safeAreaInsets,
  };
}

/**
 * 简化版本：只返回是否移动设备
 */
export function useIsMobile(breakpoint = 768): boolean {
  const { isMobile } = useMobileLayout({ mobileBreakpoint: breakpoint });
  return isMobile;
}

/**
 * 获取当前设备断点
 */
export function useBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const { screenWidth } = useMobileLayout();

  if (screenWidth >= 1536) return '2xl';
  if (screenWidth >= 1280) return 'xl';
  if (screenWidth >= 1024) return 'lg';
  if (screenWidth >= 768) return 'md';
  return 'sm';
}

/**
 * 触控优化 Hook
 * 为移动设备提供合适的点击反馈
 */
export function useTouchOptimization() {
  const { isTouchDevice } = useMobileLayout();

  const getTouchProps = useCallback(() => {
    if (!isTouchDevice) {
      return {};
    }

    return {
      style: {
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        userSelect: 'none' as const,
      },
    };
  }, [isTouchDevice]);

  return {
    isTouchDevice,
    getTouchProps,
  };
}

/**
 * 安全区域 Hook
 * 处理 iOS notched 设备的安全区域
 */
export function useSafeArea() {
  const { safeAreaInsets, isMobile } = useMobileLayout();

  const getSafeAreaStyle = useCallback(
    (position: 'top' | 'bottom' | 'left' | 'right') => {
      if (!isMobile) {
        return { [position]: 0 };
      }

      return {
        paddingTop: position === 'top' ? safeAreaInsets.top : 0,
        paddingBottom: position === 'bottom' ? safeAreaInsets.bottom : 0,
        paddingLeft: position === 'left' ? safeAreaInsets.left : 0,
        paddingRight: position === 'right' ? safeAreaInsets.right : 0,
      };
    },
    [isMobile, safeAreaInsets]
  );

  return {
    safeAreaInsets,
    getSafeAreaStyle,
  };
}

export default useMobileLayout;
