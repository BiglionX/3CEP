import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '维修店铺管理平台 - FixCycle',
  description: '专业的设备维修店铺管理后?,
};

export default function RepairShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

