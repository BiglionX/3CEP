import { Metadata } from 'next';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  canonical?: string;
  robots?: string;
}

export function generateSeoMetadata(props: SeoProps): Metadata {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://fixcycle.example.com';
  const fullOgUrl = props.ogUrl || siteUrl;
  const fullOgImage = props.ogImage?.startsWith('http')
    ? props.ogImage
    : `${siteUrl}${props.ogImage || '/images/og-default.jpg'}`;

  return {
    title: props.title || 'ProCyc AI - 3C售后智能服务平台',
    description: props.description || 'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
    keywords: props.keywords || '3c售后,全球化售后服务体系,本地化维修,服务网点，售后智能体,售后自动化,售后市场',
    robots: props.robots || 'index, follow',
    alternates: {
      canonical: props.canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: fullOgUrl,
      title: props.ogTitle || props.title || 'ProCyc AI',
      description: props.ogDescription || props.description,
      siteName: 'ProCyc AI',
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: props.title || 'ProCyc AI',
        },
      ],
    },
    twitter: {
      card: props.twitterCard || 'summary_large_image',
      title: props.ogTitle || props.title || 'ProCyc AI',
      description: props.ogDescription || props.description,
      images: [fullOgImage],
    },
    manifest: '/manifest.json',
    themeColor: '#2563eb',
  };
}

export const SEO_PRESETS = {
  overview: {
    title: 'ProCyc AI - 3C售后智能服务平台 | 一站式解决方案',
    description:
      'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
    keywords:
      '3c售后,全球化售后服务体系,本地化维修,服务网点，售后智能体,售后自动化,售后市场，循环经济，电子回收，环保翻新，维修配件，维修技巧，售后服务，售后管理，售后运营',
  },
  ops: {
    title: '售后运营自动化 | ProCyc AI',
    description:
      '智能工单分配、SLA监控预警、客户满意度分析，让3C售后运营管理更智能高效',
    keywords: '售后运营,智能工单,工单分配,SLA监控,客服自动化,客户满意度',
  },
  tech: {
    title: '技术运维自动化平台 | ProCyc AI',
    description: '可视化编排、执行回放调试、安全回滚机制，让系统运维更简单可靠',
    keywords: '技术运维,n8n编排,自动化运维,回放调试,安全回滚',
  },
  biz: {
    title: '业务负责人决策平台 | ProCyc AI',
    description:
      'ROI精准计算、标准化实施路径、合规安全保障，助力业务数字化转型成功',
    keywords: '业务决策,ROI计算,数字化转型,合规安全,实施路径',
  },
  partner: {
    title: '合作伙伴生态平台 | ProCyc AI',
    description: '便捷入驻、数据对接、智能对账，共建共赢的合作生态',
    keywords: '合作伙伴,生态平台,服务商入驻,数据对接,智能对账',
  },
};
