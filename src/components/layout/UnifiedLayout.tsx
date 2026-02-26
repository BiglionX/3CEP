'use client';

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
  navbarPadding = true
}: UnifiedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <UnifiedNavbar />}
      
      <main className={`${navbarPadding ? 'pt-16' : ''} flex-grow`}>
        {children}
      </main>
      
      {showFooter && <UnifiedFooter />}
    </div>
  );
}