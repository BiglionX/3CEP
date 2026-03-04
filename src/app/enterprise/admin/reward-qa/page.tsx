'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Trophy,
  Users,
  Calendar,
  Award,
} from 'lucide-react';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        title: '产品使用技巧问?,
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
        description: '测试用户对新产品功能的了解程?,
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
      active: { text: '进行?, color: 'bg-green-100 text-green-800' },
      ended: { text: '已结?, color: 'bg-blue-100 text-blue-800' },
      closed: { text: '已关?, color: 'bg-red-100 text-red-800' },
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
          <h1 className="text-2xl font-bold text-gray-900">有奖问答管理</h1>
          <p className="text-gray-600 mt-1">创建和管理企业有奖问答活?/p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          创建问答活动
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总活动数</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">所有问答活?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行?/CardTitle>
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
            <CardTitle className="text-sm font-medium">参与人次</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce((sum, q) => sum + q.current_participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">总参与人?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">奖励发放</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce(
                (sum, q) => sum + q.reward_amount * q.current_participants,
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
                  <th className="text-left py-3 px-4 font-medium">活动名称</th>
                  <th className="text-left py-3 px-4 font-medium">奖励类型</th>
                  <th className="text-left py-3 px-4 font-medium">奖励金额</th>
                  <th className="text-left py-3 px-4 font-medium">参与情况</th>
                  <th className="text-left py-3 px-4 font-medium">状?/th>
                  <th className="text-left py-3 px-4 font-medium">时间</th>
                  <th className="text-left py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(question => (
                  <tr key={question.id} className="border-b hover:bg-gray-50">
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
                          {new Date(question.start_time).toLocaleDateString()}
                        </div>
                        <div>
                          �?{new Date(question.end_time).toLocaleDateString()}
                        </div>
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

          {questions.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无问答活动
              </h3>
              <p className="text-gray-500 mb-4">
                创建第一个有奖问答活动来提升用户参与?              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建问答活动
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

