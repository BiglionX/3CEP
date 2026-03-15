'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  TrendingUp,
  Award,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Wrench,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  lastActive: string;
  memberLevel: string;
  points: number;
  achievements: Achievement[];
  preferences: UserPreferences;
  recentActivity: Activity[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  isUnlocked: boolean;
}

interface UserPreferences {
  favoriteModules: string[];
  notificationSettings: Record<string, boolean>;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface Activity {
  id: string;
  type: 'login' | 'feature_use' | 'completion' | 'milestone';
  title: string;
  timestamp: string;
  pointsEarned: number;
}

interface PersonalizedWelcomeProps {
  userId: string;
  onDismiss?: () => void;
}

export function PersonalizedWelcome({
  userId,
  onDismiss,
}: PersonalizedWelcomeProps) {
  const auth = useAuth();
  const user = auth.user;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);

  // 模拟用户档案数据
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockProfile: UserProfile = {
        id: userId,
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || '用户',
        email: user?.email || '',
        avatar: user?.user_metadata?.avatar_url,
        joinDate: '2024-01-15',
        lastActive: '刚刚',
        memberLevel: '青铜会员',
        points: 1250,
        achievements: [
          {
            id: 'first_login',
            title: '初次见面',
            description: '完成首次登录',
            icon: '👋',
            earnedDate: '2024-01-15',
            isUnlocked: true,
          },
          {
            id: 'quick_learner',
            title: '快速上手',
            description: '完成新手引导',
            icon: '🎓',
            earnedDate: '2024-01-16',
            isUnlocked: true,
          },
          {
            id: 'explorer',
            title: '探索者',
            description: '访问5个不同功能模块',
            icon: '🧭',
            earnedDate: '',
            isUnlocked: false,
          },
          {
            id: 'contributor',
            title: '贡献者',
            description: '创建第一个维修工单',
            icon: '🔧',
            earnedDate: '',
            isUnlocked: false,
          },
        ],
        preferences: {
          favoriteModules: ['dashboard', 'repair'],
          notificationSettings: {
            email: true,
            push: true,
            sms: false,
          },
          theme: 'light',
          language: 'zh-CN',
        },
        recentActivity: [
          {
            id: 'act_1',
            type: 'login',
            title: '今日登录',
            timestamp: '2小时前',
            pointsEarned: 10,
          },
          {
            id: 'act_2',
            type: 'feature_use',
            title: '使用设备管理功能',
            timestamp: '昨天',
            pointsEarned: 25,
          },
          {
            id: 'act_3',
            type: 'completion',
            title: '完成新手引导',
            timestamp: '3天前',
            pointsEarned: 100,
          },
        ],
      };

      setProfile(mockProfile);
      setIsLoading(false);
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId, user]);

  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case '青铜会员':
        return 'from-amber-400 to-amber-600';
      case '白银会员':
        return 'from-gray-300 to-gray-500';
      case '黄金会员':
        return 'from-yellow-300 to-yellow-500';
      case '钻石会员':
        return 'from-blue-300 to-blue-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getPointsToNextLevel = (points: number) => {
    const thresholds = [0, 500, 1500, 3000, 5000]; // 各等级所需积分
    const currentThreshold =
      thresholds.find(t => points < t) || thresholds[thresholds.length - 1];
    const nextThreshold =
      thresholds[thresholds.indexOf(currentThreshold) + 1] || currentThreshold;
    return {
      current: points,
      next: nextThreshold,
      progress:
        ((points - currentThreshold) / (nextThreshold - currentThreshold)) *
        100,
    };
  };

  const quickActions = [
    {
      title: '设备管理',
      description: '查看和管理您的设备资产',
      icon: <Smartphone className="w-6 h-6" />,
      href: '/devices',
      color: 'blue',
    },
    {
      title: '维修工单',
      description: '创建和跟踪维修请求',
      icon: <Wrench className="w-6 h-6" />,
      href: '/tickets',
      color: 'green',
    },
    {
      title: '数据分析',
      description: '查看业务洞察和报表',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/analytics',
      color: 'purple',
    },
    {
      title: '个人中心',
      description: '管理账户和偏好设置',
      icon: <User className="w-6 h-6" />,
      href: '/profile',
      color: 'orange',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在为您准备个性化体验...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const pointsInfo = getPointsToNextLevel(profile.points);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  欢迎回来，{profile.name}!
                </h1>
                <p className="text-gray-600">让我们继续您的数字化旅程</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onDismiss}>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧个人信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 用户卡片 */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-blue-100">{profile.email}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">会员等级</span>
                    <Badge
                      className={`bg-gradient-to-r ${getMemberLevelColor(profile.memberLevel)} text-white`}
                    >
                      {profile.memberLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">积分进度</span>
                      <span className="font-medium">
                        {profile.points} / {pointsInfo.next}
                      </span>
                    </div>
                    <Progress value={pointsInfo.progress} className="h-2" />
                    <p className="text-xs text-gray-500">
                      还需 {pointsInfo.next - profile.points} 积分升级到下一等级
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {profile.achievements.filter(a => a.isUnlocked).length}
                      </div>
                      <div className="text-sm text-gray-600">已获得成就</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {profile.recentActivity.length}
                      </div>
                      <div className="text-sm text-gray-600">近期活动</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  本周概览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">登录天数</span>
                  <span className="font-semibold">5天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">功能使用</span>
                  <span className="font-semibold">12次</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">累计积分</span>
                  <span className="font-semibold text-blue-600">+245</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧主要内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 快捷操作 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                快速开始
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader>
                        <div
                          className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition-colors`}
                        >
                          {action.icon}
                        </div>
                        <CardTitle className="text-lg">
                          {action.title}
                        </CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline" asChild>
                          <Link href={action.href}>
                            立即访问
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 成就系统 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">成就徽章</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAchievements(!showAchievements)}
                >
                  {showAchievements ? '收起' : '查看全部'}
                </Button>
              </div>

              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${showAchievements ? '' : 'max-h-32 overflow-hidden'}`}
              >
                {profile.achievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-lg border-2 text-center ${
                      achievement.isUnlocked
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    {achievement.isUnlocked && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已解锁
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 近期活动 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                近期活动
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {profile.recentActivity.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {activity.type === 'login' && (
                              <User className="w-4 h-4 text-blue-600" />
                            )}
                            {activity.type === 'feature_use' && (
                              <Zap className="w-4 h-4 text-green-600" />
                            )}
                            {activity.type === 'completion' && (
                              <Award className="w-4 h-4 text-yellow-600" />
                            )}
                            {activity.type === 'milestone' && (
                              <Target className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          +{activity.pointsEarned} 积分
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      {/* 底部行动号召 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              准备好深入体验了吗？
            </h3>
            <p className="text-gray-600 mb-6">探索更多功能，解锁更多成就</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                asChild
              >
                <Link href="/dashboard">
                  进入控制台
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tutorials">
                  <Play className="w-5 h-5 mr-2" />
                  查看教程
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
