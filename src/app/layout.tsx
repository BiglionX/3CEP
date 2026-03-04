import type { Metadata } from 'next';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { QueryClientProvider, queryClient } from '@/lib/react-query';
import {
  ErrorProvider,
  GlobalErrorBoundary,
} from '@/components/error-handling';
import { FeedbackProvider } from '@/components/feedback-system';
import './globals.css';

export const metadata: Metadata = {
  title: 'FixCycle - 边界测试演示',
  description: '边界情况测试演示应用',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FixCycle',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <ErrorProvider>
            <FeedbackProvider>
              <GlobalErrorBoundary>
                <UnifiedLayout>{children}</UnifiedLayout>
                <AnalyticsWrapper />
              </GlobalErrorBoundary>
            </FeedbackProvider>
          </ErrorProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

