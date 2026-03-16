'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Headphones,
  BarChart3,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  customerName: string;
  productModel: string;
  issueType: string;
  status: 'open' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdate: string;
}

export default function AfterSalesServicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    productModel: '',
    issueType: '',
    description: '',
  });

  const supportTickets: SupportTicket[] = [
    {
      id: 'TK-001',
      customerName: '张三',
      productModel: 'XYZ-2024-Pro',
      issueType: '硬件故障',
      status: 'processing',
      priority: 'high',
      createdAt: '2024-01-20',
      lastUpdate: '2024-01-20 15:30',
    },
    {
      id: 'TK-002',
      customerName: '李四',
      productModel: 'ABC-2023-Standard',
      issueType: '软件问题',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-01-19',
      lastUpdate: '2024-01-19 10:15',
    },
    {
      id: 'TK-003',
      customerName: '王五',
      productModel: 'DEF-2024-Premium',
      issueType: '使用咨询',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-18',
      lastUpdate: '2024-01-18 16:45',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTicket = () => {
    console.info('创建工单:', newTicket);
    setNewTicket({ customerName: '', productModel: '', issueType: '', description: '' });
  };

  const stats = {
    total: supportTickets.length,
    open: supportTickets.filter(t => t.status === 'open').length,
    processing: supportTickets.filter(t => t.status === 'processing').length,
    resolved: supportTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回主页按钮 */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => router.push('/enterprise')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回企业主页
          </button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            售后服务管理系统
          </h1>
          <p className="text-lg text-gray-600">
            管理客户支持工单，提供优质的售后服务
          </p>
        </div>

        {/* 标签页切换 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', name: '数据概览', icon: BarChart3 },
                { id: 'tickets', name: '工单管理', icon: Headphones },
                { id: 'create', name: '创建工单', icon: Plus },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 数据概览 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          总工单数
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.total}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          待处理
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.open}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          处理中
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.processing}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          已解决
                        </dt>
                        <dd className="text-3xl font-semibold text-gray-900">
                          {stats.resolved}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 工单列表 */}
            <Card>
              <CardHeader>
                <CardTitle>最近工单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          工单编号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          客户姓名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          产品型号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          问题类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          优先级
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          创建时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {supportTickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.productModel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.issueType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status === 'open'
                                ? '待处理'
                                : ticket.status === 'processing'
                                ? '处理中'
                                : ticket.status === 'resolved'
                                ? '已解决'
                                : '已关闭'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority === 'urgent'
                                ? '紧急'
                                : ticket.priority === 'high'
                                ? '高'
                                : ticket.priority === 'medium'
                                ? '中'
                                : '低'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ticket.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 工单管理 */}
        {activeTab === 'tickets' && (
          <Card>
            <CardHeader>
              <CardTitle>所有工单</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {ticket.id}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status === 'open'
                              ? '待处理'
                              : ticket.status === 'processing'
                              ? '处理中'
                              : ticket.status === 'resolved'
                              ? '已解决'
                              : '已关闭'}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority === 'urgent'
                              ? '紧急'
                              : ticket.priority === 'high'
                              ? '高'
                              : ticket.priority === 'medium'
                              ? '中'
                              : '低'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          客户: {ticket.customerName} | 产品:{' '}
                          {ticket.productModel}
                        </p>
                        <p className="text-gray-500 mt-1">
                          问题类型: {ticket.issueType}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>创建时间: {ticket.createdAt}</p>
                        <p>更新时间: {ticket.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 创建工单 */}
        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>创建新工单</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客户姓名
                  </label>
                  <Input
                    value={newTicket.customerName}
                    onChange={e =>
                      setNewTicket({ ...newTicket, customerName: e.target.value })
                    }
                    placeholder="请输入客户姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    产品型号
                  </label>
                  <Input
                    value={newTicket.productModel}
                    onChange={e =>
                      setNewTicket({
                        ...newTicket,
                        productModel: e.target.value,
                      })
                    }
                    placeholder="请输入产品型号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    问题类型
                  </label>
                  <Input
                    value={newTicket.issueType}
                    onChange={e =>
                      setNewTicket({
                        ...newTicket,
                        issueType: e.target.value,
                      })
                    }
                    placeholder="请输入问题类型"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    问题描述
                  </label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTicket.description}
                    onChange={e =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    placeholder="请详细描述问题"
                  />
                </div>
                <Button onClick={handleCreateTicket} className="w-full">
                  创建工单
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
