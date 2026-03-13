import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProCyc AI',
  description: '3C 智能化售后服务平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <UnifiedLayout>{children}</UnifiedLayout>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
