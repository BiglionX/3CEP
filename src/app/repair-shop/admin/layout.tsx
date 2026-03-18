'use client';

import { useState } from 'react';
import { RepairShopSidebar } from '@/components/repair-shop/RepairShopSidebar';

export default function RepairShopAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <RepairShopSidebar />

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
