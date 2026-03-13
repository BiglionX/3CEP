import Head from 'next/head';

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

export function SeoHead({
  title = 'ProCyc AI- 3C售后智能服务平台',
  description = 'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
  keywords = '3c售后,全球化售后服务体系,本地化维修,服务网点，售后智能体,售后自动化,售后市场，循环经济，电子回收，环保翻新，维修配件，维修技巧，售后服务，售后管理，售后运营',
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.jpg',
  ogUrl,
  twitterCard = 'summary_large_image',
  canonical,
  robots = 'index, follow',
}: SeoProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://fixcycle.example.com';
  const fullOgUrl = ogUrl || siteUrl;
  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${siteUrl}${ogImage}`;

  return (
    <Head>
      {/* 基础SEO标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />

      {/* 规范链接 */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph 标签 */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content="zh_CN" />
      <meta property="og:site_name" content="ProCyc AI" />

      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />

      {/* 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ProCyc AI',
      description: description,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        })}
      </script>
    </Head>
  );
}

// 预设的SEO配置
export const SEO_PRESETS = {
  overview: {
    title: 'ProCyc AI - 3C售后智能服务平台 | 一站式解决方案',
    description:
      'AI技术，专注3C售后市场的智能体自动化服务平台，提升工作效率，降低运营成本',
    keywords: '3c售后,全球化售后服务体系,本地化维修,服务网点，售后智能体,售后自动化,售后市场，循环经济，电子回收，环保翻新，维修配件，维修技巧，售后服务，售后管理，售后运营',
  },
  ops: {
    title: '售后运营自动化 | ProCyc AI',
    description: '智能工单分配、SLA监控预警、客户满意度分析，让3C售后运营管理更智能高效',
    keywords: '售后运营,智能工单,工单分配,SLA监控,客服自动化,客户满意度',
  },
  tech: {
    title: '技术运维自动化平台 | FixCycle',
    description:
      'n8n可视化编排、执行回放调试、安全回滚机制，让系统运维更简单可靠',
    keywords: '技术运维,n8n编排,自动化运维,回放调试,安全回滚',
  },
  biz: {
    title: '业务负责人决策平台 | FixCycle',
    description:
      'ROI精准计算、标准化实施路径、合规安全保障，助力业务数字化转型成功',
    keywords: '业务决策,ROI计算,数字化转型,合规安全,实施路径',
  },
  partner: {
    title: '合作伙伴生态平台 | FixCycle',
    description: '便捷入驻、数据对接、智能对账，共建共赢的合作生态',
    keywords: '合作伙伴,生态平台,服务商入驻,数据对接,智能对账',
  },
};

export default SeoHead;
