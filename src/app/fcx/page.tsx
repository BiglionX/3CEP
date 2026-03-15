'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Star,
  Award,
  Gift,
  Trophy,
  Medal,
  Crown,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface AllianceMember {
  id: string;
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  joinDate: string;
  benefits: string[];
  achievements: number;
}

export default function FCXAlliancePage() {
  const [member, setMember] = useState<AllianceMember | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setMember({
        id: 'member_001',
        name: '张三',
        level: 'gold',
        points: 12500,
        joinDate: '2023-06-15',
        benefits: [
          '专属技术支持',
          '优先参与新产品测试',
          '月度技术培训',
          '维修工具折扣',
          '联盟活动优先权',
        ],
        achievements: 24,
      });
      setLoading(false);
    }, 500);
  }, []);

  const getLevelConfig = (level: string) => {
    const configs: Record<
      string,
      {
        name: string;
        color: string;
        icon: React.ComponentType;
        minPoints: number;
      }
    > = {
      bronze: {
        name: '青铜会员',
        color: 'text-amber-700 bg-amber-100',
        icon: Medal,
        minPoints: 0,
      },
      silver: {
        name: '白银会员',
        color: 'text-gray-600 bg-gray-200',
        icon: Award,
        minPoints: 1000,
      },
      gold: {
        name: '黄金会员',
        color: 'text-yellow-600 bg-yellow-100',
        icon: Star,
        minPoints: 5000,
      },
      platinum: {
        name: '铂金会员',
        color: 'text-blue-600 bg-blue-100',
        icon: Trophy,
        minPoints: 15000,
      },
      diamond: {
        name: '钻石会员',
        color: 'text-purple-600 bg-purple-100',
        icon: Crown,
        minPoints: 50000,
      },
    };
    return configs[level] || configs.bronze;
  };

  const getNextLevel = (currentLevel: string) => {
    const levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1  levels[currentIndex + 1] : null;
  };

  const getProgressToNextLevel = (points: number, currentLevel: string) => {
    const nextLevel = getNextLevel(currentLevel);
    if (!nextLevel) return 100;

    const currentConfig = getLevelConfig(currentLevel);
    const nextConfig = getLevelConfig(nextLevel);

    const progress =
      ((points - currentConfig.minPoints) /
        (nextConfig.minPoints - currentConfig.minPoints)) *
      100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            加入FCX联盟
          </h3>
          <p className="text-gray-600 mb-6">成为联盟成员，享受专属权益和奖励</p>
          <Button>立即加入</Button>
        </div>
      </div>
    );
  }

  const levelConfig = getLevelConfig(member.level);
  const nextLevel = getNextLevel(member.level);
  const progress = getProgressToNextLevel(member.points, member.level);
  const LevelIcon = levelConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 px:6lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 mr-3 text-blue-600" />
            FCX联盟
          </h1>
          <p className="text-xl text-gray-600">
            连接全球手机维修专家，共享资源，共创未来
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 会员信息卡片 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 当前等级卡片 */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      欢迎回来，{member.name}!
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6">
                        <LevelIcon />
                      </div>
                      <span className="text-xl font-semibold">
                        {levelConfig.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {member.points.toLocaleString()}
                    </div>
                    <div className="text-blue-100">联盟积分</div>
                  </div>
                </div>

                {/* 升级进度条 */}
                {nextLevel && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>距离升级{getLevelConfig(nextLevel).name}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                      <div
                        className="bg-white h-3 rounded-full transition-all duration-500"
                        style={{ width: `, {progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 权益卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-green-600" />
                  会员权益
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-green-50 rounded-lg"
                    >
                      <div className="w-5 h-5 text-green-600 mr-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="ml-2 text-green-800">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 成就展示 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  我的成就
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {member.achievements}
                    </div>
                    <div className="text-gray-600">已完成成就</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  积分商城
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  推荐好友
                </Button>
                <Button variant="outline" className="w-full">
                  <Award className="w-4 h-4 mr-2" />
                  成就中心
                </Button>
              </CardContent>
            </Card>

            {/* 联盟动态 */}
            <Card>
              <CardHeader>
                <CardTitle>联盟动态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: '新成员加入', user: '李四', time: '2小时前' },
                    { action: '技术分享', user: '王五', time: '5小时前' },
                    { action: '积分活动', user: '联盟官方', time: '1天前' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.user}
                        </p>
                        <p className="text-xs text-gray-600">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 统计信息 */}
            <Card>
              <CardHeader>
                <CardTitle>联盟统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">加入时间</span>
                    <span className="font-medium">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">当前排名</span>
                    <span className="font-medium">#1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">本月积分</span>
                    <span className="font-medium text-green-600">+1,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

