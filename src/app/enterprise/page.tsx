'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  ShoppingCart,
  Headphones,
  Warehouse,
  Building,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Package,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
} from 'lucide-react';

interface EnterpriseService {
  id: string;
  title: string;
  description: string;
  icon: any;
  features: string[];
  path: string;
  badge: string;
}

export default function EnterpriseServicePage() {
  const [activeTab, setActiveTab] = useState('services');

  const enterpriseServices: EnterpriseService[] = [
    {
      id: 'ai-agents',
      title: '智能体定制服务',
      description: '为企业定制专属AI智能体，提升业务效率',
      icon: Bot,
      features: ['需求分析', '智能体开发', '部署上线', '持续优化'],
      path: '/enterprise/agents/customize',
      badge: 'NEW',
    },
    {
      id: 'b2b-procurement',
      title: 'B2B智能采购',
      description: '基于AI的供应商匹配和自动采购决策',
      icon: ShoppingCart,
      features: ['智能需求理解', '供应商匹配', '自动询价', '风险评估'],
      path: '/enterprise/procurement',
    },
    {
      id: 'after-sales',
      title: '产品售后服务',
      description: '扫码绑定、多语言说明书、AI故障诊断',
      icon: Headphones,
      features: ['二维码管理', '智能诊断', '生命周期追踪', '数据分析'],
      path: '/enterprise/after-sales',
    },
    {
      id: 'warehousing',
      title: '海外仓智能管理',
      description: '全球仓储网络和智能物流管理',
      icon: Warehouse,
      features: ['库存同步', '智能分仓', '物流追踪', '效能分析'],
      path: '/enterprise/warehousing',
    },
    {
      id: 'customer-service',
      title: '智能客服系统',
      description: '24/7智能客服机器人，提升客户体验',
      icon: Users,
      features: ['多轮对话', '情感识别', '知识库检索', '工单生成'],
      path: '/enterprise/customer-service',
    },
    {
      id: 'data-analysis',
      title: '商业智能分析',
      description: 'AI驱动的数据分析和商业洞察平台',
      icon: BarChart3,
      features: ['数据可视化', '预测分析', '异常检测', '报表自动生成'],
      path: '/enterprise/data-analysis',
    },
    {
      id: 'workflow-automation',
      title: '流程自动化',
      description: 'RPA流程机器人，自动化重复性工作',
      icon: Zap,
      features: ['流程编排', '任务调度', '异常处理', '监控告警'],
      path: '/enterprise/workflow-automation',
    },
    {
      id: 'supply-chain',
      title: '供应链智能优化',
      description: 'AI驱动的供应链管理和优化系统',
      icon: Package,
      features: ['需求预测', '库存优化', '供应商协作', '风险预警'],
      path: '/enterprise/supply-chain',
    },
  ];

  const stats = [
    { label: '服务企业', value: '500+', icon: Building },
    { label: 'AI智能体', value: '1000+', icon: Bot },
    { label: '年采购额', value: '$50M+', icon: ShoppingCart },
    { label: '客户满意度', value: '98%', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 导航标签 */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                   'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              企业服务
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'solutions'
                   'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              解决方案
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                   'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              关于我们
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'services' && (
          <>
            {/* 页面标题 */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                企业级AI智能服务平台
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                为企业客户提供智能化解决方案，涵盖采购、售后、仓储全链条服务
              </p>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="text-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 核心服务 */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                核心AI服务
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {enterpriseServices.map(service => {
                  const Icon = service.icon;
                  return (
                    <Card
                      key={service.id}
                      className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <span>{service.title}</span>
                                {service.badge && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {service.badge}
                                  </span>
                                )}
                              </CardTitle>
                              <p className="text-gray-600 mt-1">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                            >
                              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                              {feature}
                            </span>
                          ))}
                        </div>
                        <Link href={service.path}>
                          <Button className="w-full">
                            <span>了解更多</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* 优势特色 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                为什么选择我们的AI服务
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    智能化效率提升
                  </h3>
                  <p className="text-gray-600">
                    基于先进AI技术，自动化处理复杂业务流程，提升工作效率40%以上
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    全球化服务支持
                  </h3>
                  <p className="text-gray-600">
                    支持多语言、多地区业务拓展，助力企业走向国际市场
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    数据驱动决策
                  </h3>
                  <p className="text-gray-600">
                    实时数据分析和洞察，帮助企业做出更明智的商业决策
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'solutions' && (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              行业解决方案
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              针对不同行业提供定制化AI解决方案
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: '制造业', desc: '智能制造、供应链优化、质量管理' },
                { title: '贸易行业', desc: '进出口管理、订单跟踪、合作伙伴关系' },
                { title: '服务业', desc: '客户服务、流程自动化、数据分析' },
              ].map((solution, index) => (
                <Card
                  key={index}
                  className="shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{solution.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{solution.desc}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        if (solution.title === '贸易行业') {
                          window.location.href = '/foreign-trade/company';
                        }
                      }}
                    >
                      {solution.title === '贸易行业'
                         '进入管理平台'
                        : '查看详情'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                关于我们
              </h2>
              <p className="text-xl text-gray-600">
                致力于为企业提供最前沿的AI智能化解决方案
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  我们的使命
                </h3>
                <p className="text-gray-600 mb-6">
                  通过人工智能技术创新，帮助企业实现数字化转型，
                  提升运营效率，降低成本，创造更大商业价值。
                </p>
                <p className="text-gray-600 mb-8">
                  我们拥有一支经验丰富的技术团队，在AI算法、
                  大数据处理、云计算等领域具有深厚积累。
                </p>
                <Link href="/enterprise/contact">
                  <Button size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    联系我们
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  联系我们
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-3" />
                    <span>400-888-9999</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <span>enterprise@fixcycle.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                    <span>深圳市南山区科技园</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <span>周一至周日 9:00-18:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
