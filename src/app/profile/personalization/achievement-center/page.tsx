'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Trophy,
  Star,
  Target,
  CheckCircle,
  Lock,
  Calendar,
  User,
  Users,
  Wrench,
  ShoppingCart,
  Zap,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  category: 'basic' | 'intermediate' | 'advanced' | 'special';
  status: 'completed' | 'in_progress' | 'locked';
  progress: number;
  requirement: string;
  completedDate?: string;
  unlockCondition?: string;
}

export default function AchievementCenterPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [totalPoints] = useState(2450);
  const [level] = useState(12);

  useEffect(() => {
    // 模拟获取成就数据
    setTimeout(() => {
      setAchievements([
        // 基础成就
        {
          id: 'ach_001',
          title: '初来乍到',
          description: '完成首次注册',
          icon: <User className="w-6 h-6" />,
          points: 50,
          category: 'basic',
          status: 'completed',
          progress: 100,
          requirement: '注册账号',
          completedDate: '2024-01-01',
        },
        {
          id: 'ach_002',
          title: '完善资料',
          description: '填写完整的个人资料',
          icon: <CheckCircle className="w-6 h-6" />,
          points: 100,
          category: 'basic',
          status: 'completed',
          progress: 100,
          requirement: '完善个人资料',
          completedDate: '2024-01-02',
        },
        {
          id: 'ach_003',
          title: '首次维修',
          description: '完成第一个维修订单',
          icon: <Wrench className="w-6 h-6" />,
          points: 200,
          category: 'basic',
          status: 'completed',
          progress: 100,
          requirement: '完成1个维修订单',
          completedDate: '2024-01-05',
        },
        {
          id: 'ach_004',
          title: '社交达人',
          description: '绑定手机号和邮箱',
          icon: <Users className="w-6 h-6" />,
          points: 150,
          category: 'basic',
          status: 'completed',
          progress: 100,
          requirement: '绑定手机和邮箱',
          completedDate: '2024-01-03',
        },

        // 中级成就
        {
          id: 'ach_005',
          title: '维修专家',
          description: '累计完成10个维修订单',
          icon: <Trophy className="w-6 h-6" />,
          points: 500,
          category: 'intermediate',
          status: 'in_progress',
          progress: 60,
          requirement: '完成10个维修订单',
          unlockCondition: '还需完成4个订单',
        },
        {
          id: 'ach_006',
          title: '购物狂人',
          description: '累计购买50件配件',
          icon: <ShoppingCart className="w-6 h-6" />,
          points: 300,
          category: 'intermediate',
          status: 'in_progress',
          progress: 75,
          requirement: '购买50件配件',
          unlockCondition: '还需购买13件',
        },
        {
          id: 'ach_007',
          title: '连续签到',
          description: '连续签到30天',
          icon: <Calendar className="w-6 h-6" />,
          points: 400,
          category: 'intermediate',
          status: 'in_progress',
          progress: 45,
          requirement: '连续签到30天',
          unlockCondition: '还需签到17天',
        },
        {
          id: 'ach_008',
          title: '分享大使',
          description: '成功邀请5位好友',
          icon: <Users className="w-6 h-6" />,
          points: 250,
          category: 'intermediate',
          status: 'locked',
          progress: 0,
          requirement: '邀请5位好友',
          unlockCondition: '邀请5位好友即可解锁',
        },

        // 高级成就
        {
          id: 'ach_009',
          title: '金牌用户',
          description: '累计消费10000元',
          icon: <Star className="w-6 h-6" />,
          points: 1000,
          category: 'advanced',
          status: 'in_progress',
          progress: 35,
          requirement: '消费10000元',
          unlockCondition: '还需消费6500元',
        },
        {
          id: 'ach_010',
          title: '忠实粉丝',
          description: '成为VIP会员',
          icon: <Award className="w-6 h-6" />,
          points: 800,
          category: 'advanced',
          status: 'locked',
          progress: 0,
          requirement: 'VIP会员',
          unlockCondition: '升级为VIP会员即可解锁',
        },

        // 特殊成就
        {
          id: 'ach_011',
          title: '年度之星',
          description: '年度维修订单冠军',
          icon: <Trophy className="w-6 h-6" />,
          points: 2000,
          category: 'special',
          status: 'locked',
          progress: 0,
          requirement: '年度维修订单数第一',
          unlockCondition: '年底评选',
        },
        {
          id: 'ach_012',
          title: '口碑之星',
          description: '获得100个五星好评',
          icon: <Flame className="w-6 h-6" />,
          points: 1500,
          category: 'special',
          status: 'locked',
          progress: 0,
          requirement: '获得100个五星好评',
          unlockCondition: '当前好评数 23',
        },
      ]);
      setLoading(false);
    }, 700);
  }, []);

  const filteredAchievements =
    selectedCategory === 'all' ? achievements : achievements.filter(a => a.category === selectedCategory);

  const getCategoryCounts = () => {
    return {
      all: achievements.length,
      basic: achievements.filter(a => a.category === 'basic').length,
      intermediate: achievements.filter(a => a.category === 'intermediate')
        .length,
      advanced: achievements.filter(a => a.category === 'advanced').length,
      special: achievements.filter(a => a.category === 'special').length,
    };
  };

  const getCompletedCounts = () => {
    return {
      total: achievements.filter(a => a.status === 'completed').length,
      basic: achievements.filter(
        a => a.category === 'basic' && a.status === 'completed'
      ).length,
      intermediate: achievements.filter(
        a => a.category === 'intermediate' && a.status === 'completed'
      ).length,
      advanced: achievements.filter(
        a => a.category === 'advanced' && a.status === 'completed'
      ).length,
      special: achievements.filter(
        a => a.category === 'special' && a.status === 'completed'
      ).length,
    };
  };

  const categoryCounts = getCategoryCounts();
  const completedCounts = getCompletedCounts();

  const categories = [
    {
      value: 'all',
      label: '全部成就',
      count: categoryCounts.all,
      completed: completedCounts.total,
    },
    {
      value: 'basic',
      label: '基础成就',
      count: categoryCounts.basic,
      completed: completedCounts.basic,
    },
    {
      value: 'intermediate',
      label: '中级成就',
      count: categoryCounts.intermediate,
      completed: completedCounts.intermediate,
    },
    {
      value: 'advanced',
      label: '高级成就',
      count: categoryCounts.advanced,
      completed: completedCounts.advanced,
    },
    {
      value: 'special',
      label: '特殊成就',
      count: categoryCounts.special,
      completed: completedCounts.special,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic':
        return <Target className="w-4 h-4" />;
      case 'intermediate':
        return <TrendingUp className="w-4 h-4" />;
      case 'advanced':
        return <Zap className="w-4 h-4" />;
      case 'special':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和等级信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成就中心</h1>
          <p className="text-gray-600 mt-1">解锁成就，赢取丰厚奖励</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Lv.{level}</div>
            <div className="text-sm text-gray-600">当前等级</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {totalPoints}
            </div>
            <div className="text-sm text-gray-600">成就点数</div>
          </div>
        </div>
      </div>

      {/* 成就统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {completedCounts.total}
                </p>
                <p className="text-sm text-gray-600">已完成</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {categoryCounts.all - completedCounts.total}
                </p>
                <p className="text-sm text-gray-600">进行中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    (completedCounts.total / categoryCounts.all) * 100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-600">完成率</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">等级排名</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分类筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={
                  selectedCategory === category.value ? 'default' : 'outline'
                }
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center space-x-2"
              >
                {getCategoryIcon(category.value)}
                <span>{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.completed}/{category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 成就网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map(achievement => {
          const isCompleted = achievement.status === 'completed';
          const isInProgress = achievement.status === 'in_progress';

          return (
            <Card
              key={achievement.id}
              className={`
                overflow-hidden relative
                ${isCompleted ? 'border-green-200 bg-green-50' : ''}
                ${isInProgress ? 'border-blue-200 bg-blue-50' : ''}
                ${achievement.status === 'locked' ? 'opacity-80' : ''}
              `}
            >
              {/* 状态装饰 */}
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-green-500 fill-current" />
                </div>
              )}

              {achievement.status === 'locked' && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}

              <CardContent className="p-6">
                {/* 成就头部 */}
                <div className="flex items-start space-x-4 mb-4">
                  <div
                    className={`
                    p-3 rounded-full
                    ${
                      isCompleted
                        ? 'bg-green-100'
                        : isInProgress
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                    }
                  `}
                  >
                    <div
                      className={`
                      ${
                        isCompleted
                          ? 'text-green-600'
                          : isInProgress
                            ? 'text-blue-600'
                            : 'text-gray-400'
                      }
                    `}
                    >
                      {achievement.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`
                      text-lg font-bold mb-1
                      ${
                        isCompleted
                          ? 'text-green-800'
                          : isInProgress
                            ? 'text-blue-800'
                            : 'text-gray-800'
                      }
                    `}
                    >
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {/* 奖励点数 */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-600">
                      +{achievement.points}
                    </span>
                    <span className="text-sm text-gray-500">点数</span>
                  </div>
                  <Badge
                    variant={
                      achievement.category === 'special'
                        ? 'default'
                        : achievement.category === 'advanced'
                          ? 'destructive'
                          : achievement.category === 'intermediate'
                            ? 'secondary'
                            : 'outline'
                    }
                    className="capitalize"
                  >
                    {achievement.category === 'basic' && '基础'}
                    {achievement.category === 'intermediate' && '中级'}
                    {achievement.category === 'advanced' && '高级'}
                    {achievement.category === 'special' && '特殊'}
                  </Badge>
                </div>

                {/* 进度条 */}
                {achievement.progress !== undefined &&
                  achievement.progress < 100 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">进度</span>
                        <span className="font-medium">
                          {achievement.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      {achievement.unlockCondition && (
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.unlockCondition}
                        </p>
                      )}
                    </div>
                  )}

                {/* 要求和完成时间 */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Target className="w-4 h-4 mr-2" />
                    <span>要求: {achievement.requirement}</span>
                  </div>

                  {isCompleted && achievement.completedDate && (
                    <div className="flex items-center text-green-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        完成于 {formatDate(achievement.completedDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                {!isCompleted && (
                  <Button
                    className="w-full mt-4"
                    variant={isInProgress ? 'default' : 'outline'}
                    disabled={achievement.status === 'locked'}
                  >
                    {achievement.status === 'locked' ? '未解锁' : '查看详情'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无此类成就
            </h3>
            <p className="text-gray-600">选择其他分类查看成就</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

