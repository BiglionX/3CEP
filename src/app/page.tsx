'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  Cpu,
  FileText,
  Globe,
  Headphones,
  MessageSquare,
  Package,
  Shield,
  Smartphone,
  Store,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // 使用统一导航，无需本地状态
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: '智能工作流',
      description: '基于 n8n 的可视化编排，零代码实现复杂业务自动化',
      highlights: ['500+应用集成', '毫秒级响应', '99.9%可用性'],
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: '设备生命周期',
      description: '全链路设备管理，从购买到报废的完整数字档案',
      highlights: ['扫码即查', '维修记录', '价值追溯'],
    },
    {
      icon: <Wrench className="w-8 h-8 text-purple-600" />,
      title: '维修服务',
      description: '智能派单、进度追踪、质量保障的一站式维修平台',
      highlights: ['智能匹配', '实时追踪', '质量评级'],
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: '数据分析',
      description: '实时业务洞察，数据驱动的科学决策',
      highlights: ['实时监控', '多维分析', '预测预警'],
    },
  ];

  const stats = [
    { label: '服务商家', value: '1,200+', suffix: '+' },
    { label: '完成订单', value: '50,000+', suffix: '+' },
    { label: '设备管理', value: '100,000+', suffix: '+' },
    { label: '用户满意度', value: '98.5%', suffix: '' },
  ];

  const quickLinks = [
    {
      name: '维修店铺',
      href: '/repair-shop',
      icon: <Store className="w-6 h-6" />,
      color: 'blue',
    },
    {
      name: '设备诊断',
      href: '/diagnosis',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'green',
    },
    {
      name: '配件商城',
      href: '/parts-store',
      icon: <Package className="w-6 h-6" />,
      color: 'purple',
    },
    {
      name: '技术支持',
      href: '/support',
      icon: <Headphones className="w-6 h-6" />,
      color: 'orange',
    },
  ];

  const contentHub = [
    {
      name: '文档中心',
      href: '/documents',
      icon: <FileText className="w-6 h-6" />,
      description: '完整的使用手册和技术文档',
    },
    {
      name: '维修教程',
      href: '/tutorials',
      icon: <BookOpen className="w-6 h-6" />,
      description: '详细的设备维修指导教程',
    },
    {
      name: '社区支持',
      href: '/community',
      icon: <MessageSquare className="w-6 h-6" />,
      description: '专业的技术支持和用户交流',
    },
  ];

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    智能循环经济
                  </span>
                  <br />
                  一体化平台
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  连接设备、服务、数据的完整生态系统，让每一次维修都创造价值，
                  让每一台设备都能循环利用
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    asChild
                  >
                    <Link href="/landing/overview">
                      立即体验
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-3 text-lg"
                    asChild
                  >
                    <Link href="/demo/help-system">产品演示</Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    {/* Workflow Visualization */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded mt-2 w-3/4"></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded mt-2 w-1/2"></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded mt-2 w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        50%
                      </div>
                      <div className="text-sm text-gray-600">效率提升</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        30%
                      </div>
                      <div className="text-sm text-gray-600">成本降低</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                核心功能模块
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                覆盖设备全生命周期的智能化解决方案
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                快速入口
              </h2>
              <p className="text-xl text-gray-600">一键直达核心功能</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href} className="group">
                  <div
                    className={`p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-${link.color}-500 hover:shadow-lg transition-all duration-300 text-center`}
                  >
                    <div
                      className={`inline-flex p-3 rounded-lg bg-${link.color}-100 text-${link.color}-600 mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {link.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Content Hub Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                学习与支持中心
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                丰富的文档、教程和社区支持，助您快速上手
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                <CardHeader>
                  <Globe className="w-8 h-8 mb-4" />
                  <CardTitle className="text-white">文档中心</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-4">完整的使用手册和技术文档</p>
                  <Button variant="secondary" asChild>
                    <Link href="/documents">浏览文档</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                <CardHeader>
                  <Wrench className="w-8 h-8 mb-4" />
                  <CardTitle className="text-white">维修教程</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-4">详细的设备维修指导教程</p>
                  <Button variant="secondary" asChild>
                    <Link href="/tutorials">查看教程</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
                <CardHeader>
                  <Users className="w-8 h-8 mb-4" />
                  <CardTitle className="text-white">社区支持</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 mb-4">专业的技术支持和用户交流</p>
                  <Button variant="secondary" asChild>
                    <Link href="/diagnosis">获取帮助</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              开始您的智能循环之旅
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              加入数千家企业，共同构建可持续的设备生态
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg"
                asChild
              >
                <Link href="/landing/overview">免费试用</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                asChild
              >
                <Link href="/contact">联系销售</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
