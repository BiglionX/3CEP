'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Filter,
  BookOpen,
  Users,
  Wrench,
  CreditCard,
  Settings,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface FAQCategory {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: FAQCategory[] = [
    {
      id: 'all',
      name: '全部',
      count: 32,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'account',
      name: '账户相关',
      count: 8,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'service',
      name: '服务流程',
      count: 12,
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: 'payment',
      name: '支付费用',
      count: 6,
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'technical',
      name: '技术问题',
      count: 6,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const faqData: FAQItem[] = [
    {
      id: 'faq-1',
      question: '如何注册账户？',
      answer:
        '您可以通过手机号码或邮箱地址注册账户。点击首页的"注册"按钮，按照提示填写相关信息并完成验证即可。注册完成后，您可以享受更多个性化服务。',
      category: 'account',
      tags: ['注册', '账户', '新手'],
    },
    {
      id: 'faq-2',
      question: '忘记密码怎么办？',
      answer:
        '在登录页面点击"忘记密码"，输入您的注册邮箱或手机号码，系统会发送重置密码的链接或验证码。按照提示操作即可重新设置密码。',
      category: 'account',
      tags: ['密码', '安全', '找回'],
    },
    {
      id: 'faq-3',
      question: '如何预约上门维修服务？',
      answer:
        '1. 登录账户后进入"设备维修"页面\n2. 选择您的设备类型和故障描述\n3. 填写详细地址和期望服务时间\n4. 确认订单信息并完成支付\n5. 等待工程师联系确认具体时间',
      category: 'service',
      tags: ['预约', '上门', '维修'],
    },
    {
      id: 'faq-4',
      question: '维修服务多长时间能完成？',
      answer:
        '维修时间因故障复杂程度而异：\n• 简单故障（如屏幕贴膜）：30-60分钟\n• 中等故障（如屏幕更换）：1-3小时\n• 复杂故障（如主板维修）：1-3个工作日\n我们会根据实际情况给出准确的时间预估。',
      category: 'service',
      tags: ['时间', '工期', '进度'],
    },
    {
      id: 'faq-5',
      question: '支持哪些支付方式？',
      answer:
        '我们支持多种便捷的支付方式：\n• 微信支付\n• 支付宝\n• 银行卡支付\n• Apple Pay/Google Pay\n所有支付均采用加密传输，确保您的资金安全。',
      category: 'payment',
      tags: ['支付', '费用', '安全'],
    },
    {
      id: 'faq-6',
      question: '维修费用如何计算？',
      answer:
        '维修费用包括：\n• 检测费：免费\n• 配件费：根据实际更换配件定价\n• 人工费：根据维修难度和时长计算\n• 上门费：部分偏远地区可能收取\n您可以在下单前查看详细的费用明细。',
      category: 'payment',
      tags: ['费用', '价格', '明细'],
    },
    {
      id: 'faq-7',
      question: '维修后有保修期吗？',
      answer:
        '是的，我们提供完善的保修服务：\n• 标准保修期：30天\n• 主要配件保修90天\n• 保修期内同一故障免费返修\n• 人为损坏不在保修范围。',
      category: 'service',
      tags: ['保修', '质保', '售后'],
    },
    {
      id: 'faq-8',
      question: '如何查询维修进度？',
      answer:
        '您可以通过以下方式查询进度：\n• 个人中心"我的订单"页面实时查看\n• 微信公众号接收进度推送\n• 客服热线400-888-9999\n• 短信通知重要节点',
      category: 'service',
      tags: ['进度', '查询', '通知'],
    },
    {
      id: 'faq-9',
      question: '网站兼容性要求是什么？',
      answer:
        '为了获得最佳使用体验，建议：\n• 浏览器：Chrome 80+、Firefox 75+、Safari 13+\n• 操作系统：Windows 10+、macOS 10.15+、iOS 13+、Android 8+\n• 网络环境：建议宽带网络，移动网络需稳定',
      category: 'technical',
      tags: ['兼容性', '浏览器', '系统'],
    },
    {
      id: 'faq-10',
      question: '如何联系客服？',
      answer:
        '我们提供多种客服联系方式：\n• 在线客服：网站右下角悬浮按钮\n• 客服热线400-888-9999（工作日9:00-18:00）\n• 企业邮箱：support@fixcycle.com\n• 微信公众号：搜索"FixCycle智能维修"\n• 在线留言：帮助中心页面底部',
      category: 'account',
      tags: ['客服', '联系', '支持'],
    },
  ];

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <HelpCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">常见问题解答</h1>
        <p className="text-xl text-gray-600">
          我们整理了用户最关心的问题，希望能帮到您
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="搜索问题或关键词..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-12 py-4"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="flex items-center text-sm text-gray-600 mr-2">
            <Filter className="w-4 h-4 mr-1" />
            按分类筛选：
          </span>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                   ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.name}</span>
                <span className="ml-1 opacity-75">({category.count})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            找到{' '}
            <span className="font-semibold text-blue-600">
              {filteredFAQs.length}
            </span>{' '}
            个相关问题
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-700"
            >
              清除搜索
            </button>
          )}
        </div>
      </div>

      {/* FAQ列表 */}
      <div className="space-y-4">
        {filteredFAQs.map(faq => (
          <Card
            key={faq.id}
            className="overflow-hidden shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full text-left outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-3">
                        {getCategoryName(faq.category)}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="ml-4 flex-shrink-0 pt-1">
                    {expandedItems.has(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedItems.has(faq.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="prose prose-blue max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            没有找到相关问题
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm  ? '请尝试使用其他关键词搜索' : '当前分类下暂无问题'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              查看所有问题
            </button>
          </div>
        </div>
      )}

      {/* 联系支持 */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            没有找到您需要的答案？
          </h3>
          <p className="text-gray-600 mb-6">我们的专业客服团队随时为您服务。</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              联系在线客服
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg bg-gray-50 transition-colors">
              查看帮助中心
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
