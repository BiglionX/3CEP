'use client';

import { useEffect } from 'react';
import { SeoHead, SEO_PRESETS } from '@/components/SeoHead';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeatureCard';
import { TestimonialsSection } from '../components/Testimonial';
import { LeadForm, FAQSection } from '../components/LeadForm';
import { trackPageView, trackCtaClick } from '@/lib/marketing/analytics';

export default function OverviewPage() {
  useEffect(() => {
    // 页面加载时埋点
    trackPageView('overview');
  }, []);

  const handleCtaClick = (ctaType: string) => {
    trackCtaClick(ctaType, 'overview');
    // 这里可以添加具体的CTA处理逻辑
  };

  const features = [
    {
      title: '智能工作流编排',
      description:
        '基于n8n的可视化工作流设计器，零代码实现复杂的业务自动化流程，支持数百种应用和服务的无缝集成',
      metrics: ['支持500+应用集成', '99.9%系统可用性', '毫秒级响应速度'],
    },
    {
      title: '多角色协同工作',
      description:
        '为运营、技术、业务等不同角色提供专属工作台，实现跨部门高效协作，打破信息孤岛',
      metrics: ['3种角色模式', '实时协作编辑', '权限精细化管理'],
    },
    {
      title: '智能代理服务',
      description:
        '内置AI智能代理，自动处理重复性任务，学习用户习惯，持续优化工作流程效率',
      metrics: ['支持自然语言交互', '自适应学习能力', '7×24小时在线服务'],
    },
    {
      title: '数据驱动洞察',
      description:
        '全面的数据分析和可视化仪表板，实时监控业务指标，为决策提供科学依据',
      metrics: ['实时数据同步', '自定义报表生成', '智能预警机制'],
    },
    {
      title: '企业级安全保障',
      description:
        '端到端加密传输，完善的权限管理体系，符合企业安全合规要求，保护核心业务数据',
      metrics: ['ISO 27001认证', '数据加密存储', '细粒度权限控制'],
    },
    {
      title: '灵活部署方案',
      description:
        '支持云端SaaS和私有化部署，可根据企业需求灵活选择，确保业务连续性和数据主权',
      metrics: ['公有/私有云双部署', '容器化一键部署', '99.95%服务承诺'],
    },
  ];

  const testimonials = [
    {
      quote:
        '引入FixCycle后，我们的客服响应效率提升了60%，客户满意度显著改善，真正实现了智能化运营',
      author: '张明',
      position: '客服总监',
      company: '某知名电商平台',
      rating: 5,
    },
    {
      quote:
        '技术团队以前需要花费大量时间做重复性的API对接工作，现在通过n8n编排，开发效率提高了80%',
      author: '李伟',
      position: '技术VP',
      company: '互联网科技公司',
      rating: 5,
    },
    {
      quote:
        '作为业务负责人，我最看重的是ROI。FixCycle帮我们降低了30%的人力成本，投资回报非常可观',
      author: '王建',
      position: '运营总经理',
      company: '制造业集团',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'FixCycle适合什么规模的企业使用',
      answer:
        'FixCycle适用于各种规模的企业，从小型创业公司到大型集团公司都可以使用。我们提供灵活的定价方案和部署选项，可以根据企业实际需求进行定制',
    },
    {
      question: '部署实施需要多长时间？',
      answer:
        '标准实施周期2-4周。我们提供专业的实施团队，包括需求调研、系统配置、数据迁移、员工培训等全套服务，确保顺利上线',
    },
    {
      question: '数据安全性如何保障？',
      answer:
        '我们采用银行级别的安全标准，包括端到端加密、多重身份验证、定期安全审计等。同时支持私有化部署，确保企业数据完全自主可控',
    },
    {
      question: '是否支持与其他系统集成？',
      answer:
        '支持。FixCycle内置丰富的API接口和连接器，可以与主流ERP、CRM、OA等系统无缝集成，也支持自定义开发集成',
    },
    {
      question: '提供哪些技术支持服务？',
      answer:
        '我们提供7×24小时技术支持热线、在线客服、远程协助等服务。同时配备专业技术顾问团队，为企业提供持续的优化建议',
    },
  ];

  return (
    <div>
      <SeoHead {...SEO_PRESETS.overview} />
      {/* Hero区域 */}
      <HeroSection
        title="一站式 n8n + 智能体企业自动化平台"
        subtitle="提升50%工作效率，降低40%运营成本，让企业数字化转型变得更简单"
        ctaText="免费试用"
        onCtaClick={() => handleCtaClick('hero_cta')}
      />

      {/* 核心功能 */}
      <FeaturesSection
        title="为什么选择FixCycle"
        subtitle="专为企业打造的智能化自动化解决方案"
        features={features}
      />

      {/* 客户见证 */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 转化区域 */}
      <section
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
        id="cta"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              准备开启自动化之旅
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              立即注册，获得专属演示和30天免费试用
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                开始您的免费试用
              </h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">30天全功能免费试用</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">一对一专家演示指导</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">7×24小时技术支持</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">无任何隐藏费用</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleCtaClick('free_trial')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  立即免费试用
                </button>
                <button
                  onClick={() => handleCtaClick('schedule_demo')}
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  预约专家演示
                </button>
              </div>
            </div>

            <div>
              <LeadForm
                role="overview"
                onSubmit={(data: any) => {
                  console.debug('表单提交:', data);
                  // 可以在这里添加额外的处理逻辑
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <FAQSection faqs={faqs} />
    </div>
  );
}
