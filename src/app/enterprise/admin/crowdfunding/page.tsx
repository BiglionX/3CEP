'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  min_contribution: number;
  max_contribution: number;
  start_date: string;
  end_date: string;
  supporters_count: number;
  status: 'draft' | 'active' | 'successful' | 'failed' | 'closed';
  funding_progress: number;
  created_at: string;
}

export default function CrowdfundingManagementPage() {
  const [projects, setProjects] = useState<CrowdfundingProject[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const mockProjects: CrowdfundingProject[] = [
      {
        id: '1',
        title: '智能家居控制系统V2.0',
        description: '新一代智能家居控制解决方案，支持语音控制和自动化场景',
        target_amount: 500000,
        current_amount: 325000,
        min_contribution: 100,
        max_contribution: 50000,
        start_date: '2024-01-10T00:00:00Z',
        end_date: '2024-03-10T23:59:59Z',
        supporters_count: 128,
        status: 'active',
        funding_progress: 65,
        created_at: '2024-01-05T10:30:00Z',
      },
      {
        id: '2',
        title: '便携式健康监测设?,
        description: '可穿戴健康监测手环，实时监测心率、血压等健康指标',
        target_amount: 300000,
        current_amount: 315000,
        min_contribution: 50,
        max_contribution: 25000,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-02-28T23:59:59Z',
        supporters_count: 89,
        status: 'successful',
        funding_progress: 105,
        created_at: '2023-12-20T14:20:00Z',
      },
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      draft: { text: '草稿', color: 'bg-gray-100 text-gray-800' },
      active: { text: '筹集?, color: 'bg-blue-100 text-blue-800' },
      successful: { text: '成功', color: 'bg-green-100 text-green-800' },
      failed: { text: '失败', color: 'bg-red-100 text-red-800' },
      closed: { text: '已关?, color: 'bg-purple-100 text-purple-800' },
    };

    const config = statusMap[status] || statusMap.draft;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题和操作按?*/}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新品众筹管理</h1>
          <p className="text-gray-600 mt-1">管理和监控企业新品众筹项?/p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          发起众筹项目
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">所有众筹项?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">筹集?/CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">活跃项目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">筹集资金</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                projects.reduce((sum, p) => sum + p.current_amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">总筹集金?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支持?/CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + p.supporters_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">总支持人?/p>
          </CardContent>
        </Card>
      </div>

      {/* 众筹项目列表 */}
      <Card>
        <CardHeader>
          <CardTitle>众筹项目列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">项目名称</th>
                  <th className="text-left py-3 px-4 font-medium">目标金额</th>
                  <th className="text-left py-3 px-4 font-medium">当前筹集</th>
                  <th className="text-left py-3 px-4 font-medium">进度</th>
                  <th className="text-left py-3 px-4 font-medium">支持?/th>
                  <th className="text-left py-3 px-4 font-medium">状?/th>
                  <th className="text-left py-3 px-4 font-medium">截止时间</th>
                  <th className="text-left py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {project.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(project.target_amount)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(project.current_amount)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {project.funding_progress}%
                          </span>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.funding_progress >= 100
                                ? 'bg-green-600'
                                : project.funding_progress >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(project.funding_progress, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium">
                          {project.supporters_count}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-500">
                        {new Date(project.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无众筹项目
              </h3>
              <p className="text-gray-500 mb-4">
                发起第一个新品众筹项目来获得资金支持
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                发起众筹项目
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

