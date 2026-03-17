'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Trophy,
  Users,
  Award,
  BarChart3,
  Bot,
  Coins,
  Globe,
  CreditCard,
  ShoppingCart,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  description: string;
  reward_type: 'fcx' | 'physical' | 'both';
  reward_amount: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'active' | 'ended' | 'closed';
  created_at: string;
}

export default function RewardQaManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    reward_type: 'fcx',
    reward_amount: 100,
    start_time: '',
    end_time: '',
    max_participants: 100,
  });

  // 模拟数据
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        title: '产品使用技巧问答',
        description: '关于产品使用最佳实践的有奖问答活动',
        reward_type: 'fcx',
        reward_amount: 100,
        start_time: '2024-01-15T00:00:00Z',
        end_time: '2024-02-15T23:59:59Z',
        max_participants: 100,
        current_participants: 45,
        status: 'active',
        created_at: '2024-01-10T10:30:00Z',
      },
      {
        id: '2',
        title: '新品功能了解问答',
        description: '测试用户对新产品功能的了解程度',
        reward_type: 'both',
        reward_amount: 200,
        start_time: '2024-01-20T00:00:00Z',
        end_time: '2024-02-20T23:59:59Z',
        max_participants: 200,
        current_participants: 120,
        status: 'active',
        created_at: '2024-01-15T14:20:00Z',
      },
    ];

    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      draft: { text: '草稿', color: 'bg-gray-100 text-gray-800' },
      active: { text: '进行中', color: 'bg-green-100 text-green-800' },
      ended: { text: '已结束', color: 'bg-blue-100 text-blue-800' },
      closed: { text: '已关闭', color: 'bg-red-100 text-red-800' },
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

  const getRewardTypeBadge = (type: string) => {
    const typeMap: Record<string, { text: string; icon: any }> = {
      fcx: { text: 'FCX奖励', icon: Trophy },
      physical: { text: '实物奖励', icon: Award },
      both: { text: '混合奖励', icon: Trophy },
    };

    const config = typeMap[type] || typeMap.fcx;
    const Icon = config.icon;

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

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
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
            {/* 页面标题和操作按钮 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  有奖问答管理
                </h1>
                <p className="text-gray-600 mt-1">创建和管理企业有奖问答活动</p>
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    创建问答活动
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>创建新问答活动</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">活动名称</Label>
                      <Input
                        id="title"
                        value={newQuestion.title}
                        onChange={e =>
                          setNewQuestion({
                            ...newQuestion,
                            title: e.target.value,
                          })
                        }
                        placeholder="请输入活动名称"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">活动描述</Label>
                      <Input
                        id="description"
                        value={newQuestion.description}
                        onChange={e =>
                          setNewQuestion({
                            ...newQuestion,
                            description: e.target.value,
                          })
                        }
                        placeholder="请输入活动描述"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="reward_type">奖励类型</Label>
                        <select
                          id="reward_type"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newQuestion.reward_type}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              reward_type: e.target.value,
                            })
                          }
                        >
                          <option value="fcx">FCX奖励</option>
                          <option value="physical">实物奖励</option>
                          <option value="both">混合奖励</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reward_amount">奖励金额</Label>
                        <Input
                          id="reward_amount"
                          type="number"
                          value={newQuestion.reward_amount}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              reward_amount: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start_time">开始时间</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={newQuestion.start_time}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              start_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end_time">结束时间</Label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          value={newQuestion.end_time}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_participants">最大参与人数</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        value={newQuestion.max_participants}
                        onChange={e =>
                          setNewQuestion({
                            ...newQuestion,
                            max_participants: Number(e.target.value),
                          })
                        }
                      />
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
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        const newQ: Question = {
                          id: String(Date.now()),
                          title: newQuestion.title,
                          description: newQuestion.description,
                          reward_type: newQuestion.reward_type as
                            | 'fcx'
                            | 'physical'
                            | 'both',
                          reward_amount: newQuestion.reward_amount,
                          start_time: newQuestion.start_time,
                          end_time: newQuestion.end_time,
                          max_participants: newQuestion.max_participants,
                          current_participants: 0,
                          status: 'draft',
                          created_at: new Date().toISOString(),
                        };
                        setQuestions([...questions, newQ]);
                        setIsModalOpen(false);
                        setNewQuestion({
                          title: '',
                          description: '',
                          reward_type: 'fcx',
                          reward_amount: 100,
                          start_time: '',
                          end_time: '',
                          max_participants: 100,
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
                    总活动数
                  </CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{questions.length}</div>
                  <p className="text-xs text-muted-foreground">所有问答活动</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">进行中</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {questions.filter(q => q.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">活跃活动</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    参与人次
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {questions.reduce(
                      (sum, q) => sum + q.current_participants,
                      0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">总参与人数</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    奖励发放
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {questions.reduce(
                      (sum, q) =>
                        sum + q.reward_amount * q.current_participants,
                      0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">FCX总量</p>
                </CardContent>
              </Card>
            </div>

            {/* 问答活动列表 */}
            <Card>
              <CardHeader>
                <CardTitle>问答活动列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">
                          活动名称
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          奖励类型
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          奖励金额
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          参与情况
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          状态
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          时间
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map(question => (
                        <tr
                          key={question.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {question.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {question.description}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getRewardTypeBadge(question.reward_type)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {question.reward_amount}{' '}
                              {question.reward_type === 'fcx' ? 'FCX' : '积分'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm">
                                {question.current_participants} /{' '}
                                {question.max_participants}
                              </div>
                              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(question.current_participants / question.max_participants) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(question.status)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-500">
                              <div>
                                {new Date(
                                  question.start_time
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                {new Date(
                                  question.end_time
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={`/enterprise/admin/reward-qa/${question.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  题目
                                </Link>
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

                {questions.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      暂无问答活动
                    </h3>
                    <p className="text-gray-500 mb-4">
                      创建第一个有奖问答活动来提升用户参与{' '}
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      创建问答活动
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
