'use client';

import { useState, useEffect, useRef } from 'react';
import { UnifiedNavbar } from './UnifiedNavbar';
import { UnifiedFooter } from './UnifiedFooter';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  navbarPadding?: boolean;
}

export function UnifiedLayout({
  children,
  showNavbar = true,
  showFooter = true,
  navbarPadding = true,
}: UnifiedLayoutProps) {
  const [shouldShowNavbar, setShouldShowNavbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检查子元素是否包含禁用标志
  useEffect(() => {
    const checkDisableFlag = () => {
      if (typeof window === 'undefined') return;

      // 检查整个 DOM 树中的禁用标志
      const hasDisableFlag = document.body.querySelector('[data-disable-unified-layout]');
      const result = showNavbar && !hasDisableFlag;

      setShouldShowNavbar(result);
    };

    // 初始检查
    checkDisableFlag();

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      checkDisableFlag();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-disable-unified-layout']
    });

    return () => {
      observer.disconnect();
    };
  }, [showNavbar, children]);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col">
      {shouldShowNavbar && <UnifiedNavbar />}

      <main className={`${navbarPadding ? 'pt-16' : ''} flex-grow`}>
        {children}
      </main>

      {showFooter && <UnifiedFooter />}
    </div>
  );
}
