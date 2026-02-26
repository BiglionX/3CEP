import type { Metadata } from 'next';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import "./globals.css";

export const metadata: Metadata = {
  title: 'FixCycle - 边界测试演示',
  description: '边界情况测试演示应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <UnifiedLayout>
          {children}
        </UnifiedLayout>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}