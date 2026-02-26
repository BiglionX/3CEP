'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Ticket, 
  Wallet, 
  Clock, 
  Tag, 
  Gift,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
  minimumAmount: number
  expiryDate: string
  status: 'available' | 'used' | 'expired'
  category: string
  usageLimit: number
  usedCount: number
}

export default function CouponWalletPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟获取优惠券数据
    setTimeout(() => {
      setCoupons([
        {
          id: 'coupon_001',
          code: 'NEW2024',
          name: '新年大促券',
          description: '全场通用满100减20',
          discountType: 'fixed',
          discountValue: 20,
          minimumAmount: 100,
          expiryDate: '2024-03-31',
          status: 'available',
          category: '通用券',
          usageLimit: 1,
          usedCount: 0
        },
        {
          id: 'coupon_002',
          code: 'REPAIR15',
          name: '维修专享券',
          description: '维修服务8.5折优惠',
          discountType: 'percentage',
          discountValue: 15,
          minimumAmount: 50,
          expiryDate: '2024-02-29',
          status: 'available',
          category: '维修券',
          usageLimit: 2,
          usedCount: 0
        },
        {
          id: 'coupon_003',
          code: 'PARTS10',
          name: '配件满减券',
          description: '配件满200减30',
          discountType: 'fixed',
          discountValue: 30,
          minimumAmount: 200,
          expiryDate: '2024-01-31',
          status: 'used',
          category: '配件券',
          usageLimit: 1,
          usedCount: 1
        },
        {
          id: 'coupon_004',
          code: 'FREESHIP',
          name: '免运费券',
          description: '全场免运费',
          discountType: 'free_shipping',
          discountValue: 0,
          minimumAmount: 0,
          expiryDate: '2024-04-15',
          status: 'available',
          category: '通用券',
          usageLimit: 3,
          usedCount: 1
        },
        {
          id: 'coupon_005',
          code: 'WELCOME',
          name: '新人专享券',
          description: '首单立减50元',
          discountType: 'fixed',
          discountValue: 50,
          minimumAmount: 0,
          expiryDate: '2023-12-31',
          status: 'expired',
          category: '通用券',
          usageLimit: 1,
          usedCount: 0
        }
      ])
      setLoading(false)
    }, 600)
  }, [])

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || coupon.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || coupon.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusCounts = () => {
    return {
      available: coupons.filter(c => c.status === 'available').length,
      used: coupons.filter(c => c.status === 'used').length,
      expired: coupons.filter(c => c.status === 'expired').length
    }
  }

  const statusCounts = getStatusCounts()
  const categories = ['all', '通用券', '维修券', '配件券']
  const statuses = [
    { value: 'all', label: '全部', count: coupons.length },
    { value: 'available', label: '可用', count: statusCounts.available },
    { value: 'used', label: '已使用', count: statusCounts.used },
    { value: 'expired', label: '已过期', count: statusCounts.expired }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDiscountDisplay = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}%折扣`
      case 'fixed':
        return `满${coupon.minimumAmount}减${coupon.discountValue}`
      case 'free_shipping':
        return '免运费'
      default:
        return ''
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`优惠券码 ${code} 已复制到剪贴板`)
  }

  const handleUseCoupon = (coupon: Coupon) => {
    if (coupon.status === 'available' && coupon.usedCount < coupon.usageLimit) {
      alert(`正在跳转到使用优惠券页面...\n券码: ${coupon.code}`)
    } else {
      alert('此优惠券不可用')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">优惠券包</h1>
        <p className="text-gray-600 mt-1">管理和使用您的优惠券</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
                <p className="text-sm text-gray-600">总计</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.available}</p>
                <p className="text-sm text-gray-600">可用</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.used}</p>
                <p className="text-sm text-gray-600">已使用</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-100 p-2">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{statusCounts.expired}</p>
                <p className="text-sm text-gray-600">已过期</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选区域 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索优惠券名称或编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Filter className="w-4 h-4 text-gray-500 mt-2" />
              {statuses.map(status => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                  className="flex items-center space-x-1"
                >
                  <span>{status.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {status.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '全部分类' : category}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 优惠券列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map(coupon => {
          const isUsable = coupon.status === 'available' && coupon.usedCount < coupon.usageLimit
          const daysUntilExpiry = Math.ceil(
            (new Date(coupon.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )

          return (
            <Card 
              key={coupon.id} 
              className={`
                overflow-hidden relative
                ${coupon.status === 'expired' ? 'opacity-70' : ''}
                ${isUsable ? 'hover:shadow-lg transition-shadow' : ''}
              `}
            >
              {/* 状态标签 */}
              <div className="absolute top-3 right-3 z-10">
                <Badge 
                  variant={
                    coupon.status === 'available' ? 'default' :
                    coupon.status === 'used' ? 'secondary' : 'destructive'
                  }
                  className="capitalize"
                >
                  {coupon.status === 'available' ? '可用' :
                   coupon.status === 'used' ? '已使用' : '已过期'}
                </Badge>
              </div>

              <CardContent className="p-6">
                {/* 优惠券头部 */}
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{coupon.name}</h3>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* 折扣信息 */}
                <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {getDiscountDisplay(coupon)}
                    </div>
                    {coupon.minimumAmount > 0 && (
                      <div className="text-sm text-gray-600">
                        满{coupon.minimumAmount}元可用
                      </div>
                    )}
                  </div>
                </div>

                {/* 使用次数 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">使用次数</span>
                    <span className="font-medium">
                      {coupon.usedCount}/{coupon.usageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* 到期时间提醒 */}
                <div className="mb-4 flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    有效期至: {formatDate(coupon.expiryDate)}
                  </span>
                  {daysUntilExpiry > 0 && daysUntilExpiry <= 7 && coupon.status === 'available' && (
                    <Badge variant="destructive" className="ml-2">
                      即将过期
                    </Badge>
                  )}
                </div>

                {/* 优惠券码 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <code className="text-sm font-mono text-gray-800">{coupon.code}</code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      复制
                    </Button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    variant={isUsable ? "default" : "outline"}
                    onClick={() => handleUseCoupon(coupon)}
                    disabled={!isUsable}
                  >
                    {coupon.status === 'used' ? '已使用' :
                     coupon.status === 'expired' ? '已过期' : '立即使用'}
                  </Button>
                  
                  {isUsable && (
                    <Button size="sm" variant="outline">
                      <Gift className="w-4 h-4 mr-1" />
                      分享
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无符合条件的优惠券</h3>
            <p className="text-gray-600">调整筛选条件或获取更多优惠券</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}