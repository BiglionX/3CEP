'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: 'order' | 'contract' | 'payment' | 'document';
  title: string;
  description: string;
  requester: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedAt: string;
  deadline?: string;
  amount?: number;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'importer' | 'exporter'>(
    'importer'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const approvals: ApprovalItem[] = [
    {
      id: 'AP-2026-001',
      type: 'order',
      title: '大额采购订单审批',
      description:
        '向Samsung Electronics采购Galaxy S24 Ultra手机500台，总金?50万元',
      requester: '采购?张经?,
      department: '采购?,
      priority: 'high',
      status: 'pending',
      submittedAt: '2026-02-25T10:30:00',
      deadline: '2026-02-27T17:00:00',
      amount: 3500000,
    },
    {
      id: 'AP-2026-002',
      type: 'contract',
      title: '出口销售合同审?,
      description:
        '与TechGlobal Ltd.签署华为Mate 60 Pro出口合同?000台，总金?50万元',
      requester: '销售部-李总监',
      department: '销售部',
      priority: 'high',
      status: 'in_review',
      submittedAt: '2026-02-24T14:15:00',
      amount: 8500000,
    },
    {
      id: 'AP-2026-003',
      type: 'payment',
      title: '预付款申请审?,
      description: '向Sony Corporation支付PlayStation 5预付?0万元',
      requester: '财务?王会?,
      department: '财务?,
      priority: 'medium',
      status: 'approved',
      submittedAt: '2026-02-23T09:45:00',
      amount: 300000,
    },
    {
      id: 'AP-2026-004',
      type: 'document',
      title: '报关单据审核',
      description: 'iPhone 15 Pro Max出口报关单据审核',
      requester: '物流?陈主?,
      department: '物流?,
      priority: 'medium',
      status: 'pending',
      submittedAt: '2026-02-25T16:20:00',
    },
    {
      id: 'AP-2026-005',
      type: 'order',
      title: '紧急采购审?,
      description: '紧急采购充电器配件10000个，用于售后维修',
      requester: '售后?刘经?,
      department: '售后?,
      priority: 'high',
      status: 'rejected',
      submittedAt: '2026-02-22T11:30:00',
      amount: 150000,
    },
  ];

  const handleRoleChange = (role: 'importer' | 'exporter') => {
    setActiveRole(role);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审?;
      case 'approved':
        return '已批?;
      case 'rejected':
        return '已拒?;
      case 'in_review':
        return '审批?;
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'contract':
        return '📝';
      case 'payment':
        return '💰';
      case 'document':
        return '📄';
      default:
        return '📋';
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch =
      approval.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requester.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || approval.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || approval.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleApprove = (approvalId: string) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('批准申请:', approvalId)// TODO: 实现批准逻辑
  };

  const handleReject = (approvalId: string) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('拒绝申请:', approvalId)// TODO: 实现拒绝逻辑
  };

  const handleViewDetails = (approvalId: string) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查看详情:', approvalId)// TODO: 实现查看详情逻辑
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ForeignTradeSidebar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />

      <div className="flex-1 lg:ml-0">
        {/* 头部导航 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/foreign-trade/company')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">审批管理</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  待处? {approvals.filter(a => a.status === 'pending').length}
                  �?                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 筛选区?*/}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                筛选条?              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="搜索审批编号、标题或申请?.."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部状?/option>
                  <option value="pending">待审?/option>
                  <option value="in_review">审批?/option>
                  <option value="approved">已批?/option>
                  <option value="rejected">已拒?/option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部优先?/option>
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  重置筛?                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 统计概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {approvals.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">待审?/div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {approvals.filter(a => a.status === 'in_review').length}
                </div>
                <div className="text-sm text-gray-600">审批?/div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {approvals.filter(a => a.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">已批?/div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {approvals.filter(a => a.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">已拒?/div>
              </CardContent>
            </Card>
          </div>

          {/* 审批列表 */}
          <Card>
            <CardHeader>
              <CardTitle>审批事项列表</CardTitle>
              <CardDescription>
                共找?{filteredApprovals.length} 个符合条件的审批事项
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      暂无审批事项
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ||
                      statusFilter !== 'all' ||
                      priorityFilter !== 'all'
                        ? '没有找到匹配的审批事?
                        : '当前没有需要处理的审批'}
                    </p>
                  </div>
                ) : (
                  filteredApprovals.map(approval => (
                    <div
                      key={approval.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">
                              {getTypeIcon(approval.type)}
                            </span>
                            <span className="font-bold text-gray-900">
                              {approval.id}
                            </span>
                            <Badge
                              className={getPriorityColor(approval.priority)}
                            >
                              {approval.priority === 'high'
                                ? '高优先级'
                                : approval.priority === 'medium'
                                  ? '中优先级'
                                  : '低优先级'}
                            </Badge>
                            <Badge className={getStatusColor(approval.status)}>
                              {getStatusText(approval.status)}
                            </Badge>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {approval.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {approval.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>申请? {approval.requester}</span>
                            <span>部门: {approval.department}</span>
                            <span>
                              提交时间:{' '}
                              {new Date(approval.submittedAt).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                            {approval.deadline && (
                              <span>
                                截止时间:{' '}
                                {new Date(approval.deadline).toLocaleString(
                                  'zh-CN'
                                )}
                              </span>
                            )}
                            {approval.amount && (
                              <span>
                                金额: ¥{approval.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(approval.id)}
                          >
                            查看详情
                          </Button>
                          {approval.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(approval.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                批准
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleReject(approval.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

