'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Clock,
  DollarSign,
  Edit,
  Eye,
  Package,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RepairShopSidebar } from '@/components/repair-shop/RepairShopSidebar';
import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    product_model: '',
    target_amount: 0,
    min_contribution: 0,
    max_contribution: 0,
    start_date: '',
    end_date: '',
    delivery_date: '',
  });

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
        title: '便携式健康监测设备',
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
      active: { text: '筹集', color: 'bg-blue-100 text-blue-800' },
      successful: { text: '成功', color: 'bg-green-100 text-green-800' },
      failed: { text: '失败', color: 'bg-red-100 text-red-800' },
      closed: { text: '已关闭', color: 'bg-purple-100 text-purple-800' },
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <UnifiedNavbar />
      <div className="flex flex-1">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题和操作按钮 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  新品众筹管理
                </h1>
                <p className="text-gray-600 mt-1">管理和监控企业新品众筹项目</p>
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    发起众筹项目
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>发起新众筹项目</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label htmlFor="title">项目名称</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={e =>
                          setNewProject({
                            ...newProject,
                            title: e.target.value,
                          })
                        }
                        placeholder="请输入项目名称"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">项目描述</Label>
                      <Input
                        id="description"
                        value={newProject.description}
                        onChange={e =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        placeholder="请输入项目描述"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="product_model">产品型号</Label>
                      <Input
                        id="product_model"
                        value={newProject.product_model}
                        onChange={e =>
                          setNewProject({
                            ...newProject,
                            product_model: e.target.value,
                          })
                        }
                        placeholder="请输入产品型号"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="target_amount">目标金额</Label>
                        <Input
                          id="target_amount"
                          type="number"
                          value={newProject.target_amount}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              target_amount: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="min_contribution">最低支持</Label>
                        <Input
                          id="min_contribution"
                          type="number"
                          value={newProject.min_contribution}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              min_contribution: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="max_contribution">最高支持</Label>
                        <Input
                          id="max_contribution"
                          type="number"
                          value={newProject.max_contribution}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              max_contribution: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start_date">开始日期</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newProject.start_date}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end_date">结束日期</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newProject.end_date}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="delivery_date">预计交付</Label>
                        <Input
                          id="delivery_date"
                          type="date"
                          value={newProject.delivery_date}
                          onChange={e =>
                            setNewProject({
                              ...newProject,
                              delivery_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      取消
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        const newP: CrowdfundingProject = {
                          id: String(Date.now()),
                          title: newProject.title,
                          description: newProject.description,
                          target_amount: newProject.target_amount,
                          current_amount: 0,
                          min_contribution: newProject.min_contribution,
                          max_contribution: newProject.max_contribution,
                          start_date: newProject.start_date,
                          end_date: newProject.end_date,
                          supporters_count: 0,
                          status: 'draft',
                          funding_progress: 0,
                          created_at: new Date().toISOString(),
                        };
                        setProjects([...projects, newP]);
                        setIsModalOpen(false);
                        setNewProject({
                          title: '',
                          description: '',
                          product_model: '',
                          target_amount: 0,
                          min_contribution: 0,
                          max_contribution: 0,
                          start_date: '',
                          end_date: '',
                          delivery_date: '',
                        });
                      }}
                    >
                      创建
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总项目数
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">所有众筹项目</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">筹集中</CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    筹集资金
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      projects.reduce((sum, p) => sum + p.current_amount, 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">总筹集金额</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">支持者</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + p.supporters_count, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">总支持人数</p>
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
                        <th className="text-left py-3 px-4 font-medium">
                          项目名称
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          目标金额
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          当前筹集
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          进度
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          支持者
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          状态
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          截止时间
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr
                          key={project.id}
                          className="border-b hover:bg-gray-50"
                        >
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
        </main>
      </div>
    </div>
  );
}
