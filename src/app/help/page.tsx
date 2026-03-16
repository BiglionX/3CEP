'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MessageSquare,
  FileText,
  Video,
  Phone,
  ChevronRight,
  Star,
  Wrench,
  Shield,
  CreditCard,
  HelpCircle,
  Briefcase,
  Mail,
  ExternalLink,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  popular?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: HelpCategory[] = [
    {
      id: 'account',
      title: '账户管理',
      description: '账户注册、登录、密码找回等问题',
      icon: <Shield className="w-6 h-6" />,
      articleCount: 12,
      popular: true,
    },
    {
      id: 'order',
      title: '订单售后',
      description: '订单查询、物流跟踪、售后服务',
      icon: <ShoppingCart className="w-6 h-6" />,
      articleCount: 18,
      popular: true,
    },
    {
      id: 'repair',
      title: '维修服务',
      description: '预约维修、维修进度查询',
      icon: <Wrench className="w-6 h-6" />,
      articleCount: 15,
    },
    {
      id: 'payment',
      title: '支付问题',
      description: '支付方式、发票开具、退款流程',
      icon: <CreditCard className="w-6 h-6" />,
      articleCount: 10,
    },
    {
      id: 'enterprise',
      title: '企业服务',
      description: '企业采购、账户开通、API对接',
      icon: <Briefcase className="w-6 h-6" />,
      articleCount: 20,
    },
    {
      id: 'technical',
      title: '技术支持',
      description: '技术文档、API使用、故障排查',
      icon: <HelpCircle className="w-6 h-6" />,
      articleCount: 25,
      popular: true,
    },
  ];

  const faqItems: FAQItem[] = [
    {
      question: '如何找回密码？',
      answer: '点击登录页面的"忘记密码"，输入注册邮箱或手机号，系统将发送重置链接。',
    },
    {
      question: '订单多久能发货？',
      answer: '正常情况下，订单确认后24小时内发货，节假日可能会有延迟。',
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持微信支付、支付宝、银行卡、企业转账等多种支付方式。',
    },
    {
      question: '如何申请退款？',
      answer: '在"我的订单"中找到对应订单，点击"申请售后"即可发起退款申请。',
    },
    {
      question: '维修服务如何预约？',
      answer: '点击"预约维修"，填写设备信息和故障描述，选择预约时间和门店即可。',
    },
  ];

  const popularArticles: Article[] = [
    { id: '1', title: '新用户注册指南', category: 'account', views: 1520 },
    { id: '2', title: '订单查询与跟踪', category: 'order', views: 1280 },
    { id: '3', title: '预约维修流程', category: 'repair', views: 980 },
    { id: '4', title: '支付方式说明', category: 'payment', views: 850 },
  ];

  const videoTutorials = [
    { id: '1', title: '如何完成首次下单', duration: '3:25' },
    { id: '2', title: '预约维修服务演示', duration: '4:10' },
    { id: '3', title: '企业账户开通指南', duration: '5:30' },
  ];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-blue-600" />
          帮助中心
        </h1>
        <p className="text-xl text-gray-600">您的问题在这里都能找到答案</p>
      </div>

      {/* 搜索框 */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索帮助文档、教程或常见问题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-4 text-lg"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          全部类别
        </Button>
        <Button
          variant={selectedCategory === 'popular' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('popular')}
        >
          <Star className="w-4 h-4 mr-2" />
          热门推荐
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.title}
          </Button>
        ))}
      </div>

      {/* 帮助分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredCategories.map((category) => (
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
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{category.articleCount} 篇文档</Badge>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 热门文章 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          热门文章
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-gray-500">{article.views} 次浏览</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-green-600" />
          常见问题
        </h2>
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 视频教程 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Video className="w-6 h-6 text-purple-600" />
          视频教程
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videoTutorials.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                <Video className="w-12 h-12 text-white" />
              </div>
              <CardContent className="p-4">
                <p className="font-medium">{video.title}</p>
                <p className="text-sm text-gray-500">{video.duration}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 联系我们 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">没有找到答案？</h2>
            <p className="text-blue-100">联系我们的客服团队，获取专业帮助</p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              在线客服
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 gap-2">
              <Mail className="w-4 h-4" />
              发送邮件
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 gap-2">
              <Phone className="w-4 h-4" />
              电话咨询
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
