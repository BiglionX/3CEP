import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProCyc AI',
  description: ' 智能3C售后服务平台',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ProCyc AI',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
