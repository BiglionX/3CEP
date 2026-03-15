'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  Lightbulb,
  Award,
  Globe,
  Heart,
  TrendingUp,
  Shield,
  Zap,
  Cpu,
  Building,
} from 'lucide-react';

export default function AboutPage() {
  const companyStats = [
    { label: '服务商户', value: '1,200+', icon: Users },
    { label: '完成订单', value: '50,000+', icon: TrendingUp },
    { label: '覆盖城市', value: '86+', icon: Globe },
    { label: '用户满意度', value: '98.5%', icon: Heart },
    { label: '技术专家', value: '23+', icon: Award },
    { label: '合作伙伴', value: '150+', icon: Building },
  ];

  const coreValues = [
    {
      icon: Target,
      title: '专注专业',
      description: '深耕设备维修领域，提供专业技术服务',
    },
    {
      icon: Lightbulb,
      title: '创新驱动',
      description: '运用最新技术，持续优化服务体验',
    },
    {
      icon: Shield,
      title: '品质保证',
      description: '严格质量管控，确保每一次服务都值得信赖',
    },
    {
      icon: Heart,
      title: '客户至上',
      description: '以客户需求为中心，提供贴心周到的服务',
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: '公司成立',
      description: 'FixCycle 正式成立，专注智能设备维修服务',
      achievement: '获得天使轮融资 1000 万',
    },
    {
      year: '2021',
      title: '服务网络扩展',
      description: '建立覆盖全国主要城市的维修服务网络',
      achievement: '服务城市达到 50 个',
    },
    {
      year: '2022',
      title: '技术创新突破',
      description: '推出 AI 智能诊断系统，提升维修效率',
      achievement: '获得国家发明专利 5 项',
    },
    {
      year: '2023',
      title: '平台生态完善',
      description: '构建完整的设备生命周期管理平台',
      achievement: '用户突破 10 万，月订单量 1000 万',
    },
    {
      year: '2024',
      title: '行业领先地位',
      description: '成为国内领先的智能设备维修服务平台',
      achievement: '完成 B 轮融资 1000 万，估值达 5 亿',
    },
    {
      year: '2025',
      title: '国际化布局',
      description: '启动东南亚市场拓展计划',
      achievement: '新加坡分公司成立',
    },
  ];

  const teamMembers = [
    {
      name: '张明',
      position: '创始人兼CEO',
      experience: '15年互联网产品经验',
      avatar: '',
      specialties: ['战略规划', '团队管理'],
    },
    {
      name: '李晓',
      position: '技术总监',
      experience: '12年前端开发经验',
      avatar: '',
      specialties: ['系统架构', '技术创新'],
    },
    {
      name: '王美',
      position: '运营总监',
      experience: '10年运营管理经验',
      avatar: '',
      specialties: ['客户服务', '流程优化'],
    },
    {
      name: '陈志',
      position: '市场总监',
      experience: '8年市场营销经验',
      avatar: '',
      specialties: ['品牌建设', '市场拓展'],
    },
    {
      name: '刘思雨',
      position: '首席设计师',
      experience: '7年UI/UX设计经验',
      avatar: '',
      specialties: ['用户体验', '界面设计'],
    },
    {
      name: '赵子',
      position: '数据分析',
      experience: '5年数据分析经验',
      avatar: '',
      specialties: ['数据挖掘', '商业智能'],
    },
  ];

  const corporateCulture = [
    {
      title: '开放包容',
      description: '鼓励创新思维，尊重多元观点，营造开放的工作氛围',
      icon: '🤝',
    },
    {
      title: '追求卓越',
      description: '对产品质量和服务体验精益求精，不断超越自我',
      icon: '🏆',
    },
    {
      title: '协作共赢',
      description: '强调团队合作，与合作伙伴共同成长，实现多方共赢',
      icon: '👥',
    },
    {
      title: '持续学习',
      description: '倡导终身学习理念，为员工提供丰富的培训和发展机会',
      icon: '📚',
    },
  ];

  const socialResponsibility = [
    {
      initiative: '环保回收计划',
      description: '推广电子设备环保回收，减少电子垃圾污染',
      impact: '已回收设备超 10 万台',
    },
    {
      initiative: '公益维修服务',
      description: '为老年人和困难群体提供免费维修服务',
      impact: '服务超过 5000 人次',
    },
    {
      initiative: '技术教育支持',
      description: '与高校合作开展维修技术培训课程',
      impact: '培养维修技术人员 100 余名',
    },
    {
      initiative: '就业创业扶持',
      description: '为退役军人和失业人员提供技能培训和就业机会',
      impact: '帮助 300 余人成功就业',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          关于我们
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          致力于打造最专业的智能设备维修服务平台，让每一次维修都创造价值
        </p>
      </div>

      {/* 公司使命愿景 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              我们的使命
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              通过技术创新和优质服务，解决用户在设备使用过程中遇到的各种问题，
              延长设备使用寿命，推动循环经济发展
            </p>
            <p>
              我们相信，每一次专业的维修服务不仅是解决问题，
              更是为客户创造价值，为社会节约资源
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lightbulb className="w-6 h-6 mr-3 text-yellow-500" />
              我们的愿景
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              成为全球领先的智能设备全生命周期服务平台，
              构建连接用户、服务商、制造商的完整生态系统
            </p>
            <p>通过数字化转型，重新定义传统维修行业，让专业服务触手可及</p>
          </CardContent>
        </Card>
      </div>

      {/* 核心价值观 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          核心价值观
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 公司统计数据 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          发展成就
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {companyStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 发展历程时间线 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          发展历程
        </h2>
        <div className="relative">
          {/* 时间线 */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* 时间点 */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full z-10"></div>

                {/* 内容卡片 */}
                <div
                  className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-blue-600">
                          {milestone.year}
                        </CardTitle>
                        <Award className="w-5 h-5 text-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 移动端时间点 */}
                <div className="md:hidden flex items-center justify-center my-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 核心团队 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          核心团队
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {member.position}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {member.experience}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 企业文化 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          企业文化
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corporateCulture.map((culture, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{culture.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {culture.title}
                </h3>
                <p className="text-gray-600">{culture.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 社会责任 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          社会责任
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialResponsibility.map((initiative, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {initiative.initiative}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {initiative.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      🎯 {initiative.impact}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 行动号召 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">加入我们的旅程</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          无论您是寻求专业维修服务的用户，还是希望合作的商户，
          我们都期待与您携手共创美好未来
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            联系我们
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            了解更多
          </Button>
        </div>
      </div>
    </div>
  );
}
