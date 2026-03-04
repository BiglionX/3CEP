'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Users,
  MessageSquare,
  Bot,
  Headphones,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Smile,
  ThumbsUp,
} from 'lucide-react';

interface ChatSession {
  id: string;
  customerName: string;
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  startTime: string;
  lastMessage: string;
  satisfaction?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: '',
  });

  const chatSessions: ChatSession[] = [
    {
      id: 'CS-001',
      customerName: '张明',
      status: 'active',
      startTime: '2024-01-20 14:30:25',
      lastMessage: '如何重置我的账户密码?,
      satisfaction: 5,
    },
    {
      id: 'CS-002',
      customerName: '李华',
      status: 'waiting',
      startTime: '2024-01-20 14:25:12',
      lastMessage: '订单什么时候能发货?,
    },
    {
      id: 'CS-003',
      customerName: '王小?,
      status: 'resolved',
      startTime: '2024-01-20 13:45:33',
      lastMessage: '谢谢你的帮助?,
      satisfaction: 5,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: 'FAQ-001',
      question: '如何找回忘记的密码？',
      answer:
        '您可以点击登录页面的"忘记密码"链接，输入注册邮箱地址，我们会发送重置密码的链接到您的邮箱?,
      category: '账户管理',
      views: 1247,
    },
    {
      id: 'FAQ-002',
      question: '订单多久能发货？',
      answer:
        '一般情况下，我们会?4小时内处理订单并安排发货。节假日可能会有所延迟，请您谅解?,
      category: '订单相关',
      views: 892,
    },
    {
      id: 'FAQ-003',
      question: '如何申请退货退款？',
      answer:
        '�?我的订单"页面找到相应订单，点?申请退?按钮，填写退货原因并提交申请。我们的客服会在1-2个工作日内处理?,
      category: '售后服务',
      views: 654,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'transferred':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    // 处理FAQ提交逻辑
    alert('FAQ已添加到知识库！');
    setNewFAQ({ question: '', answer: '', category: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Headphones className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            智能客服系统
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            24/7智能客服机器人，提供多轮对话、情感识别和智能问题解决能力
          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'chat', 'knowledge-base', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && '仪表?}
                {tab === 'chat' && '在线聊天'}
                {tab === 'knowledge-base' && '知识库管?}
                {tab === 'analytics' && '数据分析'}
              </button>
            ))}
          </nav>
        </div>

        {/* 仪表板内?*/}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    在线客服
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">当前在线用户</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    AI解决?                  </CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">无需人工介入</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    平均响应时间
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2s</div>
                  <p className="text-xs text-muted-foreground">AI机器人响?/p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    客户满意?                  </CardTitle>
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">五星评分</p>
                </CardContent>
              </Card>
            </div>

            {/* 功能特色 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>多轮对话</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    支持上下文理解的连续对话，提供更自然的交互体?                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      对话历史记忆
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      意图准确识别
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Smile className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>情感识别</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    智能识别客户情绪状态，提供个性化的服务响?                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      情绪状态分?                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      语调变化识别
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <ThumbsUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>智能推荐</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    基于用户行为和偏好，主动推荐相关产品和服?                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      个性化推荐
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      智能问题预判
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 在线聊天 */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>实时聊天会话</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 聊天列表 */}
                  <div className="lg:col-span-1">
                    <div className="space-y-3">
                      {chatSessions.map(session => (
                        <div
                          key={session.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">
                              {session.customerName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}
                            >
                              {session.status === 'active' && '进行?}
                              {session.status === 'waiting' && '等待?}
                              {session.status === 'resolved' && '已解?}
                              {session.status === 'transferred' && '已转?}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 truncate">
                            {session.lastMessage}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{session.startTime}</span>
                            {session.satisfaction && (
                              <div className="flex items-center">
                                <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                                <span>{session.satisfaction}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 聊天窗口 */}
                  <div className="lg:col-span-2">
                    <div className="border rounded-lg h-96 flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>选择一个会话开始聊?/p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 知识库管?*/}
        {activeTab === 'knowledge-base' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>添加新FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitFAQ} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">问题分类</label>
                      <select
                        value={newFAQ.category}
                        onChange={e =>
                          setNewFAQ({ ...newFAQ, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">请选择分类</option>
                        <option value="account">账户管理</option>
                        <option value="order">订单相关</option>
                        <option value="payment">支付问题</option>
                        <option value="service">售后服务</option>
                        <option value="technical">技术问?/option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">问题标题</label>
                      <Input
                        value={newFAQ.question}
                        onChange={e =>
                          setNewFAQ({ ...newFAQ, question: e.target.value })
                        }
                        placeholder="请输入常见问?
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">答案内容</label>
                    <textarea
                      value={newFAQ.answer}
                      onChange={e =>
                        setNewFAQ({ ...newFAQ, answer: e.target.value })
                      }
                      placeholder="请输入详细解?
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <Button type="submit">添加到知识库</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>现有FAQ列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map(faq => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{faq.question}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{faq.answer}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>浏览? {faq.views}</span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm">
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 数据分析 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    服务效率分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>日均处理会话?/span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI解决?/span>
                      <span className="font-semibold text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>人工转接?/span>
                      <span className="font-semibold text-red-600">13%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    客户满意度趋?                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>本月满意?/span>
                      <span className="font-semibold">4.8/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>环比增长</span>
                      <span className="font-semibold text-green-600">+0.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>投诉?/span>
                      <span className="font-semibold text-green-600">1.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 星形图标组件
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

