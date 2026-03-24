'use client';

import { AdminMobileLayout } from '@/components/layouts/AdminMobileLayout';
import { ExecutiveDashboard } from './ExecutiveDashboard';

export default function ExecutiveDashboardPage() {
  return (
    <AdminMobileLayout
      title="高管仪表板"
      description="企业决策支持中心"
      showBackButton={false}
    >
      <ExecutiveDashboard />
    </AdminMobileLayout>
  );
}
