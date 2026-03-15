'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';

interface ProcurementRequest {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  budget: number;
  deadline: string;
  createdAt: string;
  createdBy: string;
}

export default function ProcurementRequestsPage() {
  const [_requests, _setRequests] = useState<ProcurementRequest[]>([
    {
      id: 'req-001',
      title: '服务器硬件采购',
      description: '需要采购50台高性能服务器用于数据中心扩展',
      status: 'approved',
      priority: 'high',
      department: 'IT部门',
      budget: 500000,
      deadline: '2024-03-15',
      createdAt: '2024-02-20',
      createdBy: '张经理',
    },
    {
      id: 'req-002',
      title: '办公设备采购',
      description: '采购打印机、扫描仪等办公设备',
      status: 'submitted',
      priority: 'medium',
      department: '行政部门',
      budget: 50000,
      deadline: '2024-03-20',
      createdAt: '2024-02-22',
      createdBy: '李主任',
    },
    {
      id: 'req-003',
      title: '原材料采购',
      description: '采购生产所需的关键原材料',
      status: 'draft',
      priority: 'urgent',
      department: '生产部门',
      budget: 2000000,
      deadline: '2024-03-01',
      createdAt: '2024-02-25',
      createdBy: '王厂长',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRequests = _requests.filter(request => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const _getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      draft: { variant: 'secondary', text: '草稿' },
      submitted: { variant: 'default', text: '已提交' },
      approved: { variant: 'success', text: '已批准' },
      rejected: { variant: 'destructive', text: '已拒绝' },
      completed: { variant: 'success', text: '已完成' },
    };

    const config = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const _getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { variant: string; text: string }> = {
      low: { variant: 'secondary', text: '低' },
      medium: { variant: 'default', text: '中' },
      high: { variant: 'warning', text: '高' },
      urgent: { variant: 'destructive', text: '紧急' },
    };

    const config = priorityMap[priority] || {
      variant: 'secondary',
      text: priority,
    };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const _formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateRequest = () => {
    // 这里应该打开创建采购需求的模态框
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">采购需求管理</h1>
          <p className="mt-2 text-gray-600">创建、审批和跟踪采购需求</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button onClick={handleCreateRequest}>
            <Plus className="mr-2 h-4 w-4" />
            新建需求
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索需求标题或描述..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有状态</option>
              <option value="draft">草稿</option>
              <option value="submitted">已提交</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
              <option value="completed">已完成</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有优先级</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>采购需求列表</CardTitle>
          <CardDescription>
            共 {filteredRequests.length} 个采购需求
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">需求标题</th>
                  <th className="text-left py-3 px-4">部门</th>
                  <th className="text-left py-3 px-4">预算</th>
                  <th className="text-left py-3 px-4">截止日期</th>
                  <th className="text-left py-3 px-4">优先级</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">创建人</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {request.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{request.department}</Badge>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {_formatCurrency(request.budget)}
                    </td>
                    <td className="py-4 px-4">
                      {new Date(request.deadline).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-4 px-4">
                      {_getPriorityBadge(request.priority)}
                    </td>
                    <td className="py-4 px-4">
                      {_getStatusBadge(request.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{request.createdBy}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          'zh-CN'
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          查看
                        </Button>
                        {request.status === 'draft' && (
                          <Button size="sm">编辑</Button>
                        )}
                        {request.status === 'submitted' && (
                          <Button size="sm" variant="outline">
                            审批
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  未找到匹配的需求
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  尝试调整搜索条件或筛选器
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">创建采购需求</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">需求标题</Label>
                  <Input id="title" placeholder="请输入采购需求标题" />
                </div>

                <div>
                  <Label htmlFor="description">需求描述</Label>
                  <Textarea
                    id="description"
                    placeholder="详细描述采购需求的内容、规格、数量等要求"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">申请部门</Label>
                    <select
                      id="department"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择部门</option>
                      <option value="IT部门">IT部门</option>
                      <option value="行政部门">行政部门</option>
                      <option value="生产部门">生产部门</option>
                      <option value="采购部门">采购部门</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="budget">预算金额</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="请输入预算金额"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">优先级</Label>
                    <select
                      id="priority"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="deadline">截止日期</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button>创建需求</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
