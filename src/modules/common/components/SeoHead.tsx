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
  title = 'FixCycle - 企业自动化解决方?,
  description = '一站式n8n + 智能体企业自动化平台，提升工作效率，降低运营成本',
  keywords = '企业自动?n8n,工作?智能?RPA,数字化转?,
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
      <meta property="og:site_name" content="FixCycle" />

      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* 移动端优?*/}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />

      {/* 结构化数?*/}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'FixCycle',
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
    title: 'FixCycle - 一站式企业自动化平?| 提升50%效率',
    description:
      '基于n8n和智能体的企业自动化解决方案，帮助企业实现数字化转型，降?0%运营成本，提升工作效?,
    keywords: '企业自动化平?n8n工作?智能?RPA,数字化转?效率提升',
  },
  ops: {
    title: '运营自动化解决方?| FixCycle',
    description: '智能异常处理、工单自动化、SLA监控，让运营管理更智能高?,
    keywords: '运营自动?异常处理,工单系统,SLA监控,客服自动?,
  },
  tech: {
    title: '技术运维自动化平台 | FixCycle',
    description:
      'n8n可视化编排、执行回放调试、安全回滚机制，让系统运维更简单可?,
    keywords: '技术运?n8n编排,自动化运?回放调试,安全回滚',
  },
  biz: {
    title: '业务负责人决策平?| FixCycle',
    description:
      'ROI精准计算、标准化实施路径、合规安全保障，助力业务数字化转型成?,
    keywords: '业务决策,ROI计算,数字化转?合规安全,实施路径',
  },
  partner: {
    title: '合作伙伴生态平?| FixCycle',
    description: '便捷入驻、数据对接、智能对账，共建共赢的合作生?,
    keywords: '合作伙伴,生态平?服务商入?数据对接,智能对账',
  },
};

export default SeoHead;
