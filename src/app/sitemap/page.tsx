'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Users,
  Wrench,
  Smartphone,
  BarChart3,
  Settings,
  HelpCircle,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Map,
  ChevronRight,
  Building,
} from 'lucide-react';
import { SeoHead, SEO_PRESETS } from '@/components/SeoHead';

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  items: {
    name: string;
    href: string;
    description: string;
    badge?: string;
  }[];
}

export default function SitemapPage() {
  const sitemapSections: SitemapSection[] = [
    {
      title: '用户中心',
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          name: '个人仪表?,
          href: '/profile/dashboard',
          description: '查看个人信息和统计数?,
        },
        {
          name: '账户设置',
          href: '/profile/settings',
          description: '管理账户信息和偏好设?,
        },
        {
          name: '安全设置',
          href: '/profile/security',
          description: '修改密码和安全选项',
        },
        {
          name: '设备管理',
          href: '/device',
          description: '管理您的所有电子设?,
        },
      ],
    },
    {
      title: '业务功能',
      icon: <Wrench className="w-5 h-5" />,
      items: [
        {
          name: '维修店铺',
          href: '/repair-shop',
          description: '查找附近的维修服务店?,
        },
        {
          name: '配件商城',
          href: '/parts-market',
          description: '购买手机维修配件和工?,
        },
        {
          name: '众筹平台',
          href: '/crowdfunding',
          description: '支持创新维修技术和项目',
        },
        {
          name: 'FCX联盟',
          href: '/fcx',
          description: '加入维修专家联盟社区',
        },
      ],
    },
    {
      title: '系统工具',
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          name: '帮助中心',
          href: '/help',
          description: '查看使用指南和常见问?,
        },
        {
          name: '意见反馈',
          href: '/feedback',
          description: '提交建议和问题反?,
        },
        {
          name: '联系我们',
          href: '/contact',
          description: '获取客服支持和联系方?,
        },
        {
          name: '关于我们',
          href: '/about',
          description: '了解公司信息和发展历?,
        },
      ],
    },
    {
      title: '核心功能',
      icon: <Home className="w-5 h-5" />,
      items: [
        {
          name: '首页概览',
          href: '/',
          description: '平台主页面，了解核心功能和服?,
        },
        {
          name: '设备扫描',
          href: '/scan/demo',
          description: '设备二维码扫描和信息查询',
          badge: '热门',
        },
        {
          name: '维修申请',
          href: '/repair/request',
          description: '在线提交设备维修申请',
        },
        {
          name: '维修师傅后台',
          href: '/repair-shop/dashboard',
          description: '维修技师工作台和订单管?,
        },
      ],
    },
    {
      title: '企业服务',
      icon: <Building className="w-5 h-5" />,
      items: [
        {
          name: '企业服务中心',
          href: '/enterprise',
          description: '企业客户统一服务入口',
          badge: 'NEW',
        },
        {
          name: '产品服务?,
          href: '/enterprise/after-sales',
          description: '企业售后服务综合管理平台',
          badge: 'NEW',
        },
        {
          name: '企业管理后台',
          href: '/enterprise/admin',
          description: '企业综合管理平台',
          badge: 'NEW',
        },
        {
          name: '有奖问答',
          href: '/enterprise/after-sales#quiz',
          description: '互动问答和用户参与激?,
          badge: 'NEW',
        },
        {
          name: '新品众筹',
          href: '/enterprise/after-sales#crowdfunding',
          description: '新产品众筹和市场验证',
          badge: 'NEW',
        },
        {
          name: '企业资料',
          href: '/enterprise/after-sales#documents',
          description: '企业资质文件和文档管?,
          badge: 'NEW',
        },
      ],
    },
    {
      title: '管理系统',
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          name: '商家管理',
          href: '/admin/shops/pending',
          description: '商家入驻审核和管理平?,
        },
        {
          name: '运营仪表?,
          href: '/dashboard',
          description: '业务数据统计和分析面?,
        },
        {
          name: '用户管理',
          href: '/admin/users',
          description: '用户账户和权限管?,
        },
      ],
    },
    {
      title: '学习资源',
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          name: '文档中心',
          href: '/documents',
          description: '完整的使用手册和技术文?,
        },
        {
          name: '维修教程',
          href: '/tutorials',
          description: '设备维修指导和操作指?,
        },
        {
          name: 'FAQ问答',
          href: '/diagnosis',
          description: '常见问题解答和技术支?,
        },
      ],
    },
    {
      title: '演示与测?,
      icon: <Wrench className="w-5 h-5" />,
      items: [
        {
          name: '产品演示',
          href: '/demo/help-system',
          description: '交互式产品功能演?,
        },
        {
          name: '测试页面',
          href: '/test/test-page',
          description: '系统功能测试和验?,
        },
      ],
    },
  ];

  const quickStats = [
    { label: '总页面数', value: '40+' },
    { label: '功能模块', value: '15' },
    { label: '文档数量', value: '50+' },
    { label: '用户角色', value: '8' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoHead
        title="网站地图 - FixCycle 智能循环经济平台"
        description="完整的网站导航地图，快速找到所需功能和服?
        canonical="/sitemap"
      />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">网站地图</h1>
          </div>
          <p className="text-gray-600 max-w-3xl">
            欢迎访问 FixCycle
            智能循环经济平台的完整网站地图。这里为您展示了所有可用的功能模块和服务页面，
            帮助您快速找到所需的内容和工具?          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-blue-600">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sitemap Sections */}
        <div className="space-y-8">
          {sitemapSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">{section.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, itemIndex) => (
                  <Card
                    key={itemIndex}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <Link
                            href={item.href}
                            className="text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            {item.name}
                            {item.badge && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </CardTitle>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {item.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2"
                        >
                          访问页面
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center py-8 border-t">
          <p className="text-gray-600 mb-4">
            需要帮助？请访问我们的
            <Link href="/help" className="text-blue-600 hover:underline mx-1">
              帮助中心
            </Link>
            �?            <Link
              href="/contact"
              className="text-blue-600 hover:underline mx-1"
            >
              联系我们
            </Link>
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} FixCycle 智能循环经济平台
          </p>
        </div>
      </div>
    </div>
  );
}

