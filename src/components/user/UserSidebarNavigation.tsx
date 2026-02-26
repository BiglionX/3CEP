'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
  Wrench,
  ShoppingCart,
  Users,
  BarChart3,
  MessageSquare,
  Search,
  Star,
  Clock,
  Bookmark
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUnifiedAuth } from '@/hooks/use-unified-auth'
import { Badge } from '@/components/ui/badge'

interface ModuleConfig {
  id: string
  name: string
  icon: string
  path: string
  permissions: string[]
  category: 'business' | 'management' | 'personal'
  priority: number
  badge?: string
}

interface UserSidebarNavigationProps {
  className?: string
  onNavigate?: (path: string) => void
}

export default function UserSidebarNavigation({ 
  className = '', 
  onNavigate 
}: UserSidebarNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const pathname = usePathname()
  const { user, isAuthenticated, is_admin, roles } = useUnifiedAuth()

  // 模块注册配置
  const moduleRegistry: ModuleConfig[] = [
    {
      id: 'profile',
      name: '个人资料',
      icon: 'User',
      path: '/profile',
      permissions: [],
      category: 'personal',
      priority: 1
    },
    {
      id: 'settings',
      name: '账户设置',
      icon: 'Settings',
      path: '/profile/settings',
      permissions: [],
      category: 'personal',
      priority: 2
    },
    {
      id: 'security',
      name: '安全设置',
      icon: 'Shield',
      path: '/profile/security',
      permissions: [],
      category: 'personal',
      priority: 3
    },
    {
      id: 'repair_service',
      name: '维修服务',
      icon: 'Wrench',
      path: '/repair-shop',
      permissions: ['repair.access'],
      category: 'business',
      priority: 4,
      badge: 'new'
    },
    {
      id: 'parts_market',
      name: '配件商城',
      icon: 'ShoppingCart',
      path: '/parts-market',
      permissions: ['parts.access'],
      category: 'business',
      priority: 5
    },
    {
      id: 'device_management',
      name: '设备管理',
      icon: 'Home',
      path: '/device',
      permissions: ['device.access'],
      category: 'business',
      priority: 6
    },
    {
      id: 'crowdfunding',
      name: '众筹平台',
      icon: 'Star',
      path: '/crowdfunding',
      permissions: ['crowdfunding.access'],
      category: 'business',
      priority: 7
    },
    {
      id: 'fcx_alliance',
      name: 'FCX联盟',
      icon: 'Users',
      path: '/fcx',
      permissions: ['fcx.access'],
      category: 'business',
      priority: 8
    },
    {
      id: 'system_dashboard',
      name: '系统管理',
      icon: 'BarChart3',
      path: '/admin/dashboard',
      permissions: ['admin.access'],
      category: 'management',
      priority: 9
    },
    {
      id: 'user_management',
      name: '用户管理',
      icon: 'Users',
      path: '/admin/users',
      permissions: ['users.manage'],
      category: 'management',
      priority: 10
    }
  ]

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      User,
      Settings,
      Shield,
      Bell,
      CreditCard,
      Home,
      Wrench,
      ShoppingCart,
      Users,
      BarChart3,
      MessageSquare,
      Star,
      Clock,
      Bookmark
    }
    return icons[iconName] || User
  }

  // 权限检查
  const hasPermission = (permissions: string[]) => {
    if (permissions.length === 0) return true
    // 简化权限检查，实际应该集成RBAC系统
    if (is_admin) return true
    return false
  }

  // 根据用户角色过滤可访问模块
  const getAccessibleModules = () => {
    return moduleRegistry
      .filter(module => hasPermission(module.permissions))
      .sort((a, b) => a.priority - b.priority)
  }

  // 搜索过滤
  const filteredModules = getAccessibleModules().filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 按分类组织模块
  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleConfig[]>)

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      personal: '个人设置',
      business: '业务功能',
      management: '管理系统'
    }
    return names[category] || category
  }

  const isActive = (path: string) => pathname === path

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
    setSidebarOpen(false)
  }

  return (
    <>
      {/* 移动端触发按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* 侧边栏 */}
      <aside className={`${className} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-80 bg-white shadow-xl md:shadow-none transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">用户中心</h2>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* 用户信息卡片 */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email || '访客用户'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {is_admin ? '管理员' : '普通用户'}
                  </span>
                  {is_admin && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      ADMIN
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索功能模块..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm"
              />
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            {Object.entries(groupedModules).map(([category, modules]) => (
              <div key={category} className="mb-8">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {getCategoryName(category)}
                </h3>
                <div className="space-y-1">
                  {modules.map((module) => {
                    const Icon = getIconComponent(module.icon)
                    return (
                      <Link
                        key={module.id}
                        href={module.path}
                        onClick={() => handleNavigation(module.path)}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(module.path)
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="flex-1 truncate">{module.name}</span>
                        {module.badge && (
                          <Badge variant="default" className="ml-2 text-xs px-1.5 py-0.5">
                            {module.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* 底部快捷操作 */}
          <div className="px-4 py-6 border-t border-gray-200">
            <div className="space-y-2">
              <Link 
                href="/help" 
                className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                帮助中心
              </Link>
              <Link 
                href="/feedback" 
                className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                意见反馈
              </Link>
              <button 
                onClick={() => {}} // TODO: 实现退出登录逻辑
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}