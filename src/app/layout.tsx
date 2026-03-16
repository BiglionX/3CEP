import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import ConfigWarning from '@/components/ConfigWarning';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProCyc AI - 3C售后智能服务平台 | 一站式解决方案',
  description: 'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
  keywords: '3c售后,全球化售后服务体系,本地化维修,服务网点，售后智能体,售后自动化,售后市场，循环经济，电子回收，环保翻新，维修配件，维修技巧',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: 'ProCyc AI - 3C售后智能服务平台',
    description: 'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
    siteName: 'ProCyc AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProCyc AI - 3C售后智能服务平台',
    description: 'AI技术，专注3C售后市场的智能体自动化服务平台',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#2563eb',
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
        <ConfigWarning />
      </body>
    </html>
  );
}
