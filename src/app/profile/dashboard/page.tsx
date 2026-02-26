'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  Camera,
  Award,
  Clock,
  TrendingUp,
  Wrench,
  ShoppingCart,
  Home,
  Users,
  Star,
  Activity,
  Bell,
  Settings,
  ExternalLink,
  ChevronRight,
  Ticket,
  Sliders
} from 'lucide-react'
import { useUnifiedAuth } from '@/hooks/use-unified-auth'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  joinDate: string
  location: string
  role: string
  memberLevel: string
  totalOrders: number
  totalSpent: number
  lastActive: string
  repairCount: number
  partsPurchased: number
  devicesManaged: number
  points: number
  coupons: number
  notifications: number
  achievements: string[]
  preferences: {
    theme: 'light' | 'dark'
    language: 'zh' | 'en'
    notifications: boolean
  }
}

interface QuickAccessModule {
  id: string
  name: string
  icon: React.ComponentType<any>
  path: string
  description: string
  color: string
  permission?: string
}

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { is_admin, roles } = useUnifiedAuth()

  // 快捷访问模块配置
  const quickAccessModules: QuickAccessModule[] = [
    {
      id: 'repair_service',
      name: '维修服务',
      icon: Wrench,
      path: '/repair-shop',
      description: '设备维修订单管理',
      color: 'blue',
      permission: 'repair.access'
    },
    {
      id: 'parts_market',
      name: '配件商城',
      icon: ShoppingCart,
      path: '/parts-market',
      description: '购买维修配件',
      color: 'green',
      permission: 'parts.access'
    },
    {
      id: 'device_management',
      name: '设备管理',
      icon: Home,
      path: '/device',
      description: '我的设备档案',
      color: 'purple',
      permission: 'device.access'
    },
    {
      id: 'crowdfunding',
      name: '众筹平台',
      icon: Users,
      path: '/crowdfunding',
      description: '参与创新项目',
      color: 'orange',
      permission: 'crowdfunding.access'
    },
    {
      id: 'fcx_alliance',
      name: 'FCX联盟',
      icon: Star,
      path: '/fcx',
      description: '联盟权益和奖励',
      color: 'indigo',
      permission: 'fcx.access'
    }
  ]

  // 管理员专属模块
  const adminModules: QuickAccessModule[] = [
    {
      id: 'admin_dashboard',
      name: '系统管理',
      icon: Settings,
      path: '/admin/dashboard',
      description: '系统配置和监控',
      color: 'red',
      permission: 'admin.access'
    },
    {
      id: 'user_management',
      name: '用户管理',
      icon: Users,
      path: '/admin/users',
      description: '用户账户管理',
      color: 'yellow',
      permission: 'users.manage'
    }
  ]

  const personalizationModules = [
    {
      id: 'loyalty_points',
      name: '积分商城',
      icon: Star,
      description: `${user?.points || 0} 积分可用`
    },
    {
      id: 'coupon_wallet',
      name: '优惠券包',
      icon: Ticket,
      description: `${user?.coupons || 0} 张优惠券`
    },
    {
      id: 'achievement_center',
      name: '成就中心',
      icon: Award,
      description: `${user?.achievements?.length || 0} 个成就`
    },
    {
      id: 'preference_settings',
      name: '偏好设置',
      icon: Sliders,
      description: '个性化定制体验'
    }
  ]

  useEffect(() => {
    // 模拟获取用户数据
    setTimeout(() => {
      setUser({
        id: 'user_123',
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '138****8888',
        avatar: '',
        joinDate: '2024-01-15',
        location: '北京市朝阳区',
        role: is_admin ? '管理员' : '普通用户',
        memberLevel: '金牌会员',
        totalOrders: 24,
        totalSpent: 3280,
        lastActive: '2024-01-20 14:30',
        repairCount: 15,
        partsPurchased: 42,
        devicesManaged: 8,
        points: 1250,
        coupons: 3,
        notifications: 5,
        achievements: ['首次维修', '五星好评', '活跃用户'],
        preferences: {
          theme: 'light',
          language: 'zh',
          notifications: true
        }
      })
      setLoading(false)
    }, 500)
  }, [is_admin])

  // 权限检查
  const hasPermission = (permission?: string) => {
    if (!permission) return true
    if (is_admin) return true
    return false
  }

  // 过滤可访问的模块
  const getAccessibleModules = () => {
    let modules = [...quickAccessModules]
    
    if (is_admin) {
      modules = [...modules, ...adminModules]
    }
    
    return modules.filter(module => hasPermission(module.permission))
  }

  const accessibleModules = getAccessibleModules()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* 页面标题和通知区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
          <p className="text-gray-600 mt-1">欢迎回来，{user.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            消息通知
          </Button>
          {is_admin && (
            <Badge variant="destructive">管理员模式</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：用户概览卡片 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 用户信息卡片 */}
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-8 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={is_admin ? "destructive" : "secondary"}>
                  {user.role}
                </Badge>
                <Badge variant="outline">
                  {user.memberLevel}
                </Badge>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  💎 VIP
                </Badge>
              </div>
              
              {/* 等级进度条 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>等级进度</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">再消费 ¥1,200 升级为钻石会员</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-3" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-3" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span className="text-sm">{user.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span className="text-sm">注册于 {user.joinDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Activity className="w-4 h-4 mr-3" />
                  <span className="text-sm">最后活跃 {user.lastActive}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑资料
                </Button>
                <Button className="flex-1" variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  设置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                快捷设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <a href="/profile/settings">
                  账户设置
                  <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-between" asChild>
                <a href="/profile/security">
                  安全设置
                  <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-between" asChild>
                <a href="/help">
                  帮助中心
                  <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：业务数据和快捷访问 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 业务统计数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{user.repairCount}</p>
                    <p className="text-sm text-gray-600">维修订单</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{user.partsPurchased}</p>
                    <p className="text-sm text-gray-600">配件购买</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Home className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{user.devicesManaged}</p>
                    <p className="text-sm text-gray-600">设备管理</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-orange-100 p-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">¥{user.totalSpent}</p>
                    <p className="text-sm text-gray-600">累计消费</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快捷访问模块 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快捷访问</CardTitle>
              <p className="text-gray-600 text-sm">快速进入您常用的业务功能</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accessibleModules.map((module) => {
                  const Icon = module.icon
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                    green: 'bg-green-100 text-green-600 hover:bg-green-200',
                    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
                    indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
                    red: 'bg-red-100 text-red-600 hover:bg-red-200',
                    yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  }
                  
                  return (
                    <a
                      key={module.id}
                      href={module.path}
                      className="block group"
                    >
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${colorClasses[module.color as keyof typeof colorClasses]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {module.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 个性化模块 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                个性化服务
              </CardTitle>
              <p className="text-gray-600 text-sm">专属您的增值服务</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {personalizationModules.map((module) => {
                  const Icon = module.icon
                  const modulePaths: Record<string, string> = {
                    'loyalty_points': '/profile/personalization/loyalty-points',
                    'coupon_wallet': '/profile/personalization/coupon-wallet',
                    'achievement_center': '/profile/personalization/achievement-center',
                    'preference_settings': '/profile/personalization/preference-settings'
                  }
                  
                  const modulePath = modulePaths[module.id] || '#'
                  
                  return (
                    <div 
                      key={module.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => {
                        if (modulePath !== '#') {
                          window.location.href = modulePath
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                          <Icon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {module.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: '完成了iPhone 14维修订单', time: '2小时前', type: 'success' },
                  { action: '在配件商城购买了屏幕总成', time: '5小时前', type: 'info' },
                  { action: '更新了个人资料', time: '1天前', type: 'info' },
                  { action: '绑定了新的手机号码', time: '3天前', type: 'warning' },
                  { action: '注册成为会员', time: '1周前', type: 'primary' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}