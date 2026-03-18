'use client';

import { useState } from 'react';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';

export default function ForeignTradeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeRole, setActiveRole] = useState<'importer' | 'exporter'>('importer');

  const handleRoleChange = (role: 'importer' | 'exporter') => {
    setActiveRole(role);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <ForeignTradeSidebar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-0">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
