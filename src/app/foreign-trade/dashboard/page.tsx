'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForeignTradeDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 /foreign-trade/company
    router.replace('/foreign-trade/company');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到仪表盘...</p>
      </div>
    </div>
  );
}
