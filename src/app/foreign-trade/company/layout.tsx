'use client';

import { useState } from 'react';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';

export default function CompanyLayout({
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
      <ForeignTradeSidebar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />
      <div className="flex-1 lg:ml-0">
        {children}
      </div>
    </div>
  );
}
