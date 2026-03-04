'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  Users,
  Calendar,
  DollarSign,
  Clock,
  BarChart3,
  X,
} from 'lucide-react';

interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  product_model: string;
  target_amount: number;
  current_amount: number;
  min_contribution: number;
  max_contribution: number | null;
  start_date: string;
  end_date: string;
  delivery_date: string;
  supporters_count: number;
  status: 'draft' | 'active' | 'successful' | 'failed' | 'closed';
  funding_progress: number;
  rewards: Reward[];
  created_at: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  minimum_amount: number;
  quantity_limit: number;
  delivery_estimate: string;
  claimed_count: number;
}

export default function EnterpriseCrowdfundingManagement() {
  const [projects, setProjects] = useState<CrowdfundingProject[]>([
    {
      id: '1',
      title: '智能家居控制系统V2.0',
      description: '新一代智能家居控制解决方案，支持语音控制和自动化场景',
      product_model: 'SmartHome-V2',
      target_amount: 500000,
      current_amount: 325000,
      min_contribution: 100,
      max_contribution: 50000,
      start_date: '2024-01-10T00:00:00Z',
      end_date: '2024-03-10T23:59:59Z',
      delivery_date: '2024-06-30T00:00:00Z',
      supporters_count: 1247,
      status: 'active',
      funding_progress: 65,
      rewards: [
        {
          id: 'r1',
          title: '早鸟优惠',
          description: '限量100份，享受8折优?,
          minimum_amount: 299,
          quantity_limit: 100,
          delivery_estimate: '2024-05-15',
          claimed_count: 85,
        },
        {
          id: 'r2',
          title: '标准?,
          description: '包含基础功能和一年免费服?,
          minimum_amount: 399,
          quantity_limit: 500,
          delivery_estimate: '2024-06-01',
          claimed_count: 420,
        },
      ],
      created_at: '2024-01-05T10:30:00Z',
    },
    {
      id: '2',
      title: '便携式无线充电器Pro',
      description: '超薄设计，支持多种设备快速充?,
      product_model: 'Wireless-Charger-Pro',
      target_amount: 200000,
      current_amount: 180000,
      min_contribution: 50,
      max_contribution: 10000,
      start_date: '2024-01-15T00:00:00Z',
      end_date: '2024-02-28T23:59:59Z',
      delivery_date: '2024-04-30T00:00:00Z',
      supporters_count: 892,
      status: 'active',
      funding_progress: 90,
      rewards: [
        {
          id: 'r3',
          title: '首发特惠',
          description: '�?00名支持者专享价?,
          minimum_amount: 129,
          quantity_limit: 200,
          delivery_estimate: '2024-04-15',
          claimed_count: 195,
        },
      ],
      created_at: '2024-01-10T14:20:00Z',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<CrowdfundingProject | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_model: '',
    target_amount: '',
    min_contribution: '100',
    max_contribution: '',
    start_date: '',
    end_date: '',
    delivery_date: '',
    category: '',
  });

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 'new1',
      title: '',
      description: '',
      minimum_amount: 0,
      quantity_limit: 0,
      delivery_estimate: '',
      claimed_count: 0,
    },
  ]);

  const statusOptions = [
    { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
    { value: 'active', label: '进行?, color: 'bg-green-100 text-green-800' },
    { value: 'successful', label: '成功', color: 'bg-blue-100 text-blue-800' },
    { value: 'failed', label: '失败', color: 'bg-red-100 text-red-800' },
    {
      value: 'closed',
      label: '已关?,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}
      >
        {option.label}
      </span>
    ) : null;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      product_model: '',
      target_amount: '',
      min_contribution: '100',
      max_contribution: '',
      start_date: '',
      end_date: '',
      delivery_date: '',
      category: '',
    });
    setRewards([
      {
        id: 'new1',
        title: '',
        description: '',
        minimum_amount: 0,
        quantity_limit: 0,
        delivery_estimate: '',
        claimed_count: 0,
      },
    ]);
  };

  const createProject = () => {
    // 验证必填字段
    if (!formData.title || !formData.description || !formData.target_amount) {
      alert('请填写所有必填字?);
      return;
    }

    // 创建新项?    const newProject: CrowdfundingProject = {
      id: (projects.length + 1).toString(),
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: 0,
      min_contribution: parseInt(formData.min_contribution),
      max_contribution: formData.max_contribution
        ? parseInt(formData.max_contribution)
        : null,
      supporters_count: 0,
      status: 'draft',
      funding_progress: 0,
      rewards: rewards.filter(r => r.title && r.minimum_amount > 0),
      created_at: new Date().toISOString(),
    };

    setProjects([...projects, newProject]);
    setShowCreateModal(false);
    resetForm();
    alert('众筹项目创建成功?);
  };

  const viewProjectDetails = (project: CrowdfundingProject) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const addReward = () => {
    setRewards([
      ...rewards,
      {
        id: `new${rewards.length + 1}`,
        title: '',
        description: '',
        minimum_amount: 0,
        quantity_limit: 0,
        delivery_estimate: '',
        claimed_count: 0,
      },
    ]);
  };

  const updateReward = (index: number, field: keyof Reward, value: any) => {
    const newRewards = [...rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setRewards(newRewards);
  };

  const removeReward = (index: number) => {
    if (rewards.length > 1) {
      setRewards(rewards.filter((_, i) => i !== index));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作?*/}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">新品众筹管理</h2>
          <p className="text-gray-600 mt-1">发起和管理新产品众筹项目</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          发起众筹
        </Button>
      </div>

      {/* 统计概览 */}
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

      {/* 项目列表 */}
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
                  <th className="text-left py-3 px-4 font-medium">产品型号</th>
                  <th className="text-left py-3 px-4 font-medium">筹资进度</th>
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
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm">
                        {project.product_model}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {project.funding_progress}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(project.current_amount)} /{' '}
                            {formatCurrency(project.target_amount)}
                          </span>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.funding_progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {project.supporters_count}
                        </div>
                        <div className="text-gray-500">人支?/div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>{formatDate(project.end_date)}</div>
                        <div className="text-gray-500">
                          剩余 {calculateDaysLeft(project.end_date)} �?                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewProjectDetails(project)}
                        >
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
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无众筹项目
              </h3>
              <p className="text-gray-500 mb-4">
                发起第一个新品众筹项目来获得资金支持
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                发起众筹项目
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">发起新品众筹</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">项目标题 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="请输入项目标?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="product_model">产品型号 *</Label>
                    <Input
                      id="product_model"
                      value={formData.product_model}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          product_model: e.target.value,
                        })
                      }
                      placeholder="请输入产品型?
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">项目描述 *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="详细描述您的项目..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="target_amount">目标金额 *</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      value={formData.target_amount}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          target_amount: e.target.value,
                        })
                      }
                      placeholder="目标筹资金额"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_contribution">最低支持金?/Label>
                    <Input
                      id="min_contribution"
                      type="number"
                      value={formData.min_contribution}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          min_contribution: e.target.value,
                        })
                      }
                      placeholder="最低支持金?
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_contribution">最高支持金?/Label>
                    <Input
                      id="max_contribution"
                      type="number"
                      value={formData.max_contribution}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          max_contribution: e.target.value,
                        })
                      }
                      placeholder="最高支持金?可?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="start_date">开始时?/Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={e =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">结束时间</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={e =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="delivery_date">预计交付时间</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={formData.delivery_date}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          delivery_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>回报设置</Label>
                  <div className="mt-2 space-y-4">
                    {rewards.map((reward, index) => (
                      <Card key={reward.id}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>回报标题</Label>
                              <Input
                                value={reward.title}
                                onChange={e =>
                                  updateReward(index, 'title', e.target.value)
                                }
                                placeholder="如：早鸟优惠"
                              />
                            </div>
                            <div>
                              <Label>最低支持金?/Label>
                              <Input
                                type="number"
                                value={reward.minimum_amount}
                                onChange={e =>
                                  updateReward(
                                    index,
                                    'minimum_amount',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="金额"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>回报描述</Label>
                              <Textarea
                                value={reward.description}
                                onChange={e =>
                                  updateReward(
                                    index,
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="详细描述此回报内?
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label>数量限制</Label>
                              <Input
                                type="number"
                                value={reward.quantity_limit}
                                onChange={e =>
                                  updateReward(
                                    index,
                                    'quantity_limit',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0表示无限?
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addReward}
                            >
                              添加回报
                            </Button>
                            {rewards.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => removeReward(index)}
                              >
                                删除此回?                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createProject}>发起众筹</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 项目详情模态框 */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">项目详情</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProject(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 项目基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">
                          项目标题
                        </Label>
                        <p className="font-medium">{selectedProject.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          产品型号
                        </Label>
                        <p className="font-mono">
                          {selectedProject.product_model}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          目标金额
                        </Label>
                        <p className="font-medium text-green-600">
                          {formatCurrency(selectedProject.target_amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          当前筹资
                        </Label>
                        <p className="font-medium">
                          {formatCurrency(selectedProject.current_amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          支持者数?                        </Label>
                        <p className="font-medium">
                          {selectedProject.supporters_count} �?                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          项目状?                        </Label>
                        <p>{getStatusBadge(selectedProject.status)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 回报设置 */}
                <Card>
                  <CardHeader>
                    <CardTitle>回报设置</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProject.rewards.map(reward => (
                        <div key={reward.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{reward.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {reward.description}
                              </p>
                              <div className="flex space-x-4 mt-2 text-sm">
                                <span>
                                  最低支?{' '}
                                  {formatCurrency(reward.minimum_amount)}
                                </span>
                                <span>
                                  限额: {reward.quantity_limit || '无限?}
                                </span>
                                <span>已认? {reward.claimed_count}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(reward.minimum_amount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                预计交付: {formatDate(reward.delivery_estimate)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
