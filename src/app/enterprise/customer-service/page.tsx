'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Smile,
  ThumbsUp,
} from 'lucide-react';

interface ChatSession {
  id: string;
  customerName: string;
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  startTime: string;
  lastMessage: string;
  satisfaction: number;
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
      lastMessage: '如何重置我的账户密码',
      satisfaction: 5,
    },
    {
      id: 'CS-002',
      customerName: '李华',
      status: 'waiting',
      startTime: '2024-01-20 14:25:12',
      lastMessage: '订单什么时候能发货',
      satisfaction: 0,
    },
    {
      id: 'CS-003',
      customerName: '王小',
      status: 'resolved',
      startTime: '2024-01-20 13:45:33',
      lastMessage: '谢谢你的帮助',
      satisfaction: 5,
    },
  ];

  const faqs: FAQ[] = [
    {
      id: 'FAQ-001',
      question: '如何找回忘记的密码？',
      answer: '您可以点击登录页面的"忘记密码"链接，输入注册邮箱地址，我们会发送重置密码的链接到您的邮箱',
      category: '账户管理',
      views: 1247,
    },
    {
      id: 'FAQ-002',
      question: '订单多久能发货？',
      answer: '一般情况下，我们会4小时内处理订单并安排发货。节假日可能会有所延迟，请您谅解',
      category: '订单相关',
      views: 892,
    },
    {
      id: 'FAQ-003',
      question: '如何申请退货退款？',
      answer: '在"我的订单"页面找到相应订单，点击"申请退货"按钮，填写退货原因并提交申请。我们的客服会在1-2个工作日内处理',
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

  const activeChats = chatSessions.filter(s => s.status === 'active').length;
  const waitingChats = chatSessions.filter(s => s.status === 'waiting').length;
  const resolvedToday = chatSessions.filter(s => s.status === 'resolved').length;
  const avgSatisfaction = chatSessions.reduce((sum, s) => sum + s.satisfaction, 0) / chatSessions.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">客服管理</h1>
          <p className="text-gray-600 mt-2">管理客户会话和常见问题</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            数据概览
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'chats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            会话管理
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            FAQ管理
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    活跃会话
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeChats}</div>
                  <p className="text-xs text-gray-500">正在进行的会话</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    等待中
                  </CardTitle>
                  <Clock className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{waitingChats}</div>
                  <p className="text-xs text-gray-500">等待客服接入</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    已解决
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resolvedToday}</div>
                  <p className="text-xs text-gray-500">今日已解决问题</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    满意度
                  </CardTitle>
                  <Smile className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}</div>
                  <p className="text-xs text-gray-500">平均评分</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>最近会话</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chatSessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.customerName}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {session.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status === 'active' && '进行中'}
                          {session.status === 'waiting' && '等待中'}
                          {session.status === 'resolved' && '已解决'}
                          {session.status === 'transferred' && '已转接'}
                        </span>
                        {session.satisfaction > 0 && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {session.satisfaction}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <Card>
            <CardHeader>
              <CardTitle>会话管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        客户名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        开始时间
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        最后消息
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        满意度
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatSessions.map(session => (
                      <tr key={session.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{session.customerName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status === 'active' && '进行中'}
                            {session.status === 'waiting' && '等待中'}
                            {session.status === 'resolved' && '已解决'}
                            {session.status === 'transferred' && '已转接'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {session.startTime}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {session.lastMessage}
                        </td>
                        <td className="py-3 px-4">
                          {session.satisfaction > 0 ? (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{session.satisfaction}/5</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">未评价</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>常见问题列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map(faq => (
                    <div
                      key={faq.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {faq.question}
                          </h3>
                          <p className="text-sm text-gray-600 mt-2">
                            {faq.answer}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {faq.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              浏览: {faq.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add FAQ Form */}
            <Card>
              <CardHeader>
                <CardTitle>添加新FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      问题
                    </label>
                    <Input
                      value={newFAQ.question}
                      onChange={e =>
                        setNewFAQ({ ...newFAQ, question: e.target.value })
                      }
                      placeholder="请输入问题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      答案
                    </label>
                    <textarea
                      value={newFAQ.answer}
                      onChange={e =>
                        setNewFAQ({ ...newFAQ, answer: e.target.value })
                      }
                      placeholder="请输入答案"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类
                    </label>
                    <Input
                      value={newFAQ.category}
                      onChange={e =>
                        setNewFAQ({ ...newFAQ, category: e.target.value })
                      }
                      placeholder="请输入分类"
                    />
                  </div>
                  <Button className="w-full">添加FAQ</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
