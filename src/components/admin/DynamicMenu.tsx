'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronRight,
  Home,
  Users,
  FileText,
  Store,
  DollarSign,
  Settings,
  BarChart3,
  Shield,
  Bell,
  Package
} from 'lucide-react'
import { AuthService, type UserRole } from '@/lib/auth-service'

interface MenuItem {
  id: string
  name: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
  children?: MenuItem[]
  badge?: string
}

interface DynamicMenuProps {
  className?: string
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export function DynamicMenu({ className, collapsed = false, onCollapseChange }: DynamicMenuProps) {
  const [userRole, setUserRole] = useState<UserRole>('viewer')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const pathname = usePathname()

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          const role = await AuthService.getUserRole(currentUser.id)
          setUserRole(role)
        }
      } catch (error) {
        console.error('加载用户角色失败:', error)
      }
    }
    loadUserRole()
  }, [])

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: '仪表板',
      href: '/admin/dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer']
    },
    {
      id: 'user-management',
      name: '用户管理',
      href: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'],
      badge: '3'
    },
    {
      id: 'content',
      name: '内容管理',
      icon: <FileText className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'content_reviewer'],
      children: [
        {
          id: 'content-review',
          name: '内容审核',
          href: '/admin/content/review',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'content_reviewer']
        },
        {
          id: 'content-list',
          name: '内容列表',
          href: '/admin/content/list',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'content_reviewer']
        },
        {
          id: 'content-categories',
          name: '分类管理',
          href: '/admin/content/categories',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin']
        }
      ]
    },
    {
      id: 'shop',
      name: '店铺管理',
      icon: <Store className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'shop_reviewer'],
      children: [
        {
          id: 'shop-pending',
          name: '待审核店铺',
          href: '/admin/shops/pending',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'shop_reviewer']
        },
        {
          id: 'shop-list',
          name: '已审核店铺',
          href: '/admin/shops',
          icon: <Store className="w-4 h-4" />,
          roles: ['admin', 'shop_reviewer']
        }
      ]
    },
    {
      id: 'finance',
      name: '财务管理',
      icon: <DollarSign className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'finance'],
      children: [
        {
          id: 'payments',
          name: '支付记录',
          href: '/admin/finance/payments',
          icon: <DollarSign className="w-4 h-4" />,
          roles: ['admin', 'finance']
        },
        {
          id: 'withdrawals',
          name: '提现申请',
          href: '/admin/finance/withdrawals',
          icon: <Package className="w-4 h-4" />,
          roles: ['admin', 'finance'],
          badge: '5'
        },
        {
          id: 'reports',
          name: '财务报表',
          href: '/admin/finance/reports',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'finance']
        }
      ]
    },
    {
      id: 'notifications',
      name: '通知中心',
      href: '/admin/notifications',
      icon: <Bell className="w-5 h-5" />,
      roles: ['admin'],
      badge: '12'
    },
    {
      id: 'settings',
      name: '系统设置',
      href: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole))

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const isActive = (href: string) => {
    if (!href) return false
    return pathname === href
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems[item.id]
    const hasChildren = item.children && item.children.length > 0
    const isCurrentActive = isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.id} className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between px-3 py-2 h-auto text-left",
              level > 0 && "pl-8",
              isCurrentActive && "bg-accent text-accent-foreground"
            )}
            onClick={() => toggleExpand(item.id)}
          >
            <div className="flex items-center">
              {!collapsed && item.icon}
              {!collapsed && <span className="ml-3">{item.name}</span>}
              {item.badge && (
                <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform",
                  isExpanded && "rotate-180"
                )} 
              />
            )}
          </Button>
          
          {!collapsed && isExpanded && (
            <div className="ml-2 border-l border-border">
              {item.children
                ?.filter(child => child.roles.includes(userRole))
                .map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          "block w-full",
          level > 0 && "ml-2"
        )}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start px-3 py-2 h-auto text-left",
            level > 0 && "pl-8",
            isCurrentActive && "bg-accent text-accent-foreground"
          )}
        >
          {!collapsed && item.icon}
          {!collapsed && <span className="ml-3">{item.name}</span>}
          {item.badge && !collapsed && (
            <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  return (
    <nav className={cn("w-full", className)}>
      <div className="space-y-1">
        {filteredMenuItems.map(item => renderMenuItem(item))}
      </div>
    </nav>
  )
}