'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MessageSquare,
  Lightbulb,
  FileText,
  Video,
  Phone,
  ChevronRight,
  Star,
  TrendingUp,
  Wrench,
  Shield,
  CreditCard,
  HelpCircle,
  Briefcase,
  Eye,
  Mail,
  ShoppingCart,
  Download,
} from 'lucide-react';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: number;
  popular: boolean;
}

interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  views: number;
  likes: number;
  updatedAt: string;
}

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: '入门指南',
      description: '新手上路，快速了解平台使用方法',
      icon: <Lightbulb className="w-6 h-6" />,
      articles: 12,
      popular: true,
    },
    {
      id: 'device-repair',
      title: '设备维修',
      description: '各类设备维修流程和注意事项',
      icon: <Wrench className="w-6 h-6" />,
      articles: 28,
      popular: true,
    },
    {
      id: 'account-security',
      title: '账户安全',
      description: '账户保护和隐私设置',
      icon: <Shield className="w-6 h-6" />,
      articles: 8,
      popular: false,
    },
    {
      id: 'payment-billing',
      title: '支付账单',
      description: '支付方式和费用说明',
      icon: <CreditCard className="w-6 h-6" />,
      articles: 15,
      popular: false,
    },
    {
      id: 'troubleshooting',
      title: '故障排除',
      description: '常见问题和解决方案',
      icon: <HelpCircle className="w-6 h-6" />,
      articles: 22,
      popular: true,
    },
    {
      id: 'business-partners',
      title: '商户合作',
      description: '商户入驻和服务商指南',
      icon: <Briefcase className="w-6 h-6" />,
      articles: 18,
      popular: false,
    },
    {
      id: 'device-valuation',
      title: '设备估价',
      description: '智能估价系统使用指南',
      icon: <TrendingUp className="w-6 h-6" />,
      articles: 10,
      popular: true,
    },
    {
      id: 'parts-market',
      title: '配件商城',
      description: '配件选购和使用指南',
      icon: <ShoppingCart className="w-6 h-6" />,
      articles: 14,
      popular: false,
    },
  ];

  const popularArticles: HelpArticle[] = [
    {
      id: 'article-1',
      title: '如何预约上门维修服务',
      excerpt:
        '详细介绍了预约上门维修的完整流程，包括选择服务时间、填写设备信息等步骤',
      category: '设备维修',
      views: 1256,
      likes: 89,
      updatedAt: '2024-02-15',
    },
    {
      id: 'article-2',
      title: 'iPhone屏幕更换完整指南',
      excerpt: '从故障诊断到维修完成的全流程说明，包含所需工具和注意事项',
      category: '设备维修',
      views: 987,
      likes: 76,
      updatedAt: '2024-02-10',
    },
    {
      id: 'article-3',
      title: '账户安全设置最佳实践',
      excerpt: '保护账户安全的重要设置和建议，包括双重验证和密码管理',
      category: '账户安全',
      views: 756,
      likes: 64,
      updatedAt: '2024-02-08',
    },
    {
      id: 'article-4',
      title: '维修费用计算标准',
      excerpt: '详细说明各类维修服务的收费标准和影响因素',
      category: '支付账单',
      views: 1123,
      likes: 92,
      updatedAt: '2024-02-12',
    },
    {
      id: 'article-5',
      title: '智能设备估价系统使用指南',
      excerpt: '如何使用我们的AI智能估价系统获得准确的设备回收价格评估',
      category: '设备估价',
      views: 845,
      likes: 71,
      updatedAt: '2024-02-18',
    },
    {
      id: 'article-6',
      title: '配件商城选购攻略',
      excerpt: '教您如何在配件商城中选择合适的原装或兼容配件',
      category: '配件商城',
      views: 634,
      likes: 52,
      updatedAt: '2024-02-14',
    },
  ];

  const faqItems = [
    {
      question: '维修服务多长时间能完成？',
      answer:
        '一般情况下，简单维修1-2小时内完成，复杂维修需2-3个工作日。我们会根据具体情况给出准确的时间预估',
    },
    {
      question: '如何查询维修进度？',
      answer:
        '您可以通过个人中心"我的订单"页面实时查看维修进度，也可以通过微信公众号接收进度通知',
    },
    {
      question: '维修后有保修期吗？',
      answer:
        '是的，所有维修服务都提供30天质量保修期。保修期内如出现同样问题，可免费返修',
    },
    {
      question: '支持哪些支付方式？',
      answer:
        '我们支持微信支付、支付宝、银行卡等多种支付方式，您可以根据需要选择',
    },
    {
      question: '如何使用智能估价系统？',
      answer:
        '在首页或设备管理页面点击"智能估价"，按照提示输入设备信息和状况，系统将给出精准的价格评估',
    },
    {
      question: '配件商城的商品都是正品吗？',
      answer:
        '是的，我们承诺所有配件均为原厂或优质兼容件，并提供质量保证。每件商品都有详细的产品说明和参数',
    },
    {
      question: '如何申请成为服务商？',
      answer:
        '请前往商户合作页面提交申请，我们的商务团队会在3个工作日内与您联系，协助完成入驻流程',
    },
    {
      question: '设备回收有什么要求？',
      answer:
        '接受外观完好、功能正常的二手设备回收。我们会根据设备型号、使用年限和成色给出合理报价',
    },
  ];

  const videoTutorials = [
    {
      id: 'video-1',
      title: '如何预约上门维修服务',
      duration: '3:45',
      thumbnail: '🔧',
      views: '1.2K',
      category: '设备维修',
    },
    {
      id: 'video-2',
      title: '智能估价系统使用教程',
      duration: '2:30',
      thumbnail: '📊',
      views: '890',
      category: '设备估价',
    },
    {
      id: 'video-3',
      title: '配件商城选购指南',
      duration: '4:15',
      thumbnail: '🛒',
      views: '654',
      category: '配件商城',
    },
  ];

  const downloadResources = [
    {
      id: 'guide-1',
      title: '维修服务用户手册',
      type: 'PDF',
      size: '2.4MB',
      downloads: '3.2K',
    },
    {
      id: 'guide-2',
      title: '配件安装说明书',
      type: 'PDF',
      size: '1.8MB',
      downloads: '1.9K',
    },
    {
      id: 'guide-3',
      title: '设备保养指南',
      type: 'PDF',
      size: '3.1MB',
      downloads: '2.7K',
    },
  ];

  const filteredCategories = categories.filter(category => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'popular') return category.popular;
    return category.id === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 页面标题和搜索 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">帮助中心</h1>
        <p className="text-xl text-gray-600 mb-8">
          在这里找到您需要的帮助和答案
        </p>

        {/* 搜索框 */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="搜索帮助文档、教程或常见问题..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-12 py-4 text-lg"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={selectedCategory === 'all'  'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          全部类别
        </Button>
        <Button
          variant={selectedCategory === 'popular'  'default' : 'outline'}
          onClick={() => setSelectedCategory('popular')}
        >
          <Star className="w-4 h-4 mr-2" />
          热门推荐
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id  'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.title}
          </Button>
        ))}
      </div>

      {/* 帮助分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredCategories.map(category => (
          <Card
            key={category.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <div className="text-blue-600">{category.icon}</div>
                </div>
                {category.popular && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.articles} 篇文章
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 热门文章 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
          热门文章
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {popularArticles.map(article => (
            <Card
              key={article.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                    {article.likes}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.category}</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.views}
                    </span>
                    <span>{article.updatedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          常见问题
        </h2>
        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((faq, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 视频教程 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <Video className="w-6 h-6 mr-3 text-blue-600" />
          视频教程
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videoTutorials.map(video => (
            <Card
              key={video.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-4xl group-hover:bg-gray-200 transition-colors">
                  {video.thumbnail}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{video.duration}</span>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{video.views}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {video.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 下载资源 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <FileText className="w-6 h-6 mr-3 text-blue-600" />
          下载资源
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {downloadResources.map(resource => (
            <Card
              key={resource.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {resource.type} • {resource.size}
                      </p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>📥 {resource.downloads} 下载</span>
                  <Button size="sm" variant="outline">
                    下载
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 联系支持 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            没有找到您需要的答案？
          </h2>
          <p className="text-gray-600 mb-6">我们的专业客服团队随时为您服务</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-5 h-5 mr-2" />
              在线客服
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="w-5 h-5 mr-2" />
              电话咨询
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="w-5 h-5 mr-2" />
              邮件支持
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

