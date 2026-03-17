'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Headphones,
  HelpCircle,
  LogOut,
  Menu,
  Package,
  Plus,
  QrCode,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const menuItems = [
    { name: '仪表盘', href: '/enterprise/admin/dashboard', icon: BarChart3 },
    { name: '售后管理', href: '/enterprise/after-sales', icon: Headphones },
    { name: '智能体管理', href: '/enterprise/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/enterprise/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/enterprise/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/enterprise/admin/fxc', icon: CreditCard },
    {
      name: '采购管理',
      href: '/enterprise/admin/procurement',
      icon: ShoppingCart,
    },
    { name: '有奖问答', href: '/enterprise/admin/reward-qa', icon: HelpCircle },
    {
      name: '新品众筹',
      href: '/enterprise/admin/crowdfunding',
      icon: DollarSign,
    },
    { name: '企业资料', href: '/enterprise/admin/documents', icon: FileText },
    { name: '设备管理', href: '/enterprise/admin/devices', icon: Package },
    { name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },
    {
      name: '二维码溯源',
      href: '/enterprise/admin/traceability',
      icon: QrCode,
    },
    { name: '团队管理', href: '/enterprise/admin/team', icon: Users },
    { name: '系统设置', href: '/enterprise/admin/settings', icon: Settings },
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
    setNewTicket({
      customerName: '',
      productModel: '',
      issueType: '',
      description: '',
    });
  };

  const stats = {
    total: supportTickets.length,
    open: supportTickets.filter(t => t.status === 'open').length,
    processing: supportTickets.filter(t => t.status === 'processing').length,
    resolved: supportTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                企业管理中心
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理菜单</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    item.href === '/enterprise/after-sales'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">售后服务管理</h1>
              <p className="mt-1 text-sm text-gray-600">
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
                          setNewTicket({
                            ...newTicket,
                            customerName: e.target.value,
                          })
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
        </main>
      </div>

      {/* 遮罩层（移动端） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
