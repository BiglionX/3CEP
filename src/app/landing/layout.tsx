import type { Metadata } from 'next';
import { MarketingLayout } from './components/MarketingLayout';

export const metadata: Metadata = {
  title: 'FixCycle - 企业自动化解决方案',
  description: '一站式n8n + 智能体企业自动化平台，提升工作效率，降低运营成本',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}