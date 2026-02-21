import { notFound } from 'next/navigation';
import OverviewPage from '../overview/page';
import { getContentByRole } from './content';
import { HeroSection } from '@/app/landing/components/HeroSection';
import { FeaturesSection } from '@/app/landing/components/FeatureCard';
import { TestimonialsSection } from '@/app/landing/components/Testimonial';
import { LeadForm, FAQSection } from '@/app/landing/components/LeadForm';
import { trackPageView } from '@/lib/marketing/analytics';
import { useEffect } from 'react';
import { SeoHead, SEO_PRESETS } from '@/components/SeoHead';

// 支持的角色页面
const SUPPORTED_ROLES = ['overview', 'ops', 'tech', 'biz', 'partner'];

export default function LandingPage({ params }: { params: { role: string } }) {
  const { role } = params;
  
  // 验证角色是否支持
  if (!SUPPORTED_ROLES.includes(role)) {
    notFound();
  }

  // 页面加载埋点
  useEffect(() => {
    trackPageView(role);
  }, [role]);

  // 根据角色返回对应的页面组件
  switch (role) {
    case 'overview':
      return <OverviewPage />;
    case 'ops':
    case 'tech':
    case 'biz':
    case 'partner':
      const content = getContentByRole(role);
      if (!content) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">页面建设中...</h1>
            <p className="text-xl text-gray-600">敬请期待</p>
          </div>
        </div>;
      }
      
      return (
        <div>
          <SeoHead 
            title={SEO_PRESETS[role as keyof typeof SEO_PRESETS]?.title || `FixCycle ${role}解决方案`}
            description={SEO_PRESETS[role as keyof typeof SEO_PRESETS]?.description || '专业的企业自动化解决方案'}
            keywords={SEO_PRESETS[role as keyof typeof SEO_PRESETS]?.keywords || '企业自动化'}
          />
          <HeroSection 
            title={content.hero.title}
            subtitle={content.hero.subtitle}
            ctaText={content.hero.ctaText}
            backgroundImage={content.hero.backgroundImage}
          />
          <FeaturesSection 
            features={content.features}
          />
          <TestimonialsSection 
            testimonials={content.testimonials}
          />
          <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">开始您的自动化之旅</h2>
                  <p className="text-xl text-gray-600 mb-8">立即注册，获取专属演示和30天免费试用</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-gray-700">30天全功能免费试用</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-gray-700">一对一专家指导</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-gray-700">7×24小时技术支持</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <LeadForm role={role} />
                </div>
              </div>
            </div>
          </section>
          <FAQSection faqs={content.faqs} />
        </div>
      );
    default:
      notFound();
  }
}

// 生成静态参数（用于SSG）
export async function generateStaticParams() {
  return SUPPORTED_ROLES.map((role) => ({
    role,
  }));
}