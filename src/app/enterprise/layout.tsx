'use client';

import { EnterpriseSidebar } from '@/components/enterprise/EnterpriseSidebar';

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex" data-disable-unified-layout>
      <EnterpriseSidebar />
      <div className="flex-1 lg:ml-0">
        {children}
      </div>
    </div>
  );
}
