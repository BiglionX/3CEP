'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Wrench,
  Search,
  Filter,
  MapPin,
  Phone,
  Star,
  Clock,
  Award,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'

interface RepairShop {
  id: string
  name: string
  rating: number
  reviewCount: number
  address: string
  phone: string
  services: string[]
  priceRange: string
  distance?: string
  image?: string
  isFavorite?: boolean
}

export default function RepairShopPage() {
  const [shops, setShops] = useState<RepairShop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('all')

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setShops([
        {
          id: '1',
          name: '苹果官方授权维修中心',
          rating: 4.9,
          reviewCount: 324,
          address: '北京市朝阳区建国路88号',
          phone: '010-12345678',
          services: ['iPhone维修', 'iPad维修', 'Mac维修'],
          priceRange: '¥¥¥¥',
          distance: '1.2km',
          isFavorite: true
        },
        {
          id: '2',
          name: '快修手机维修店',
          rating: 4.6,
          reviewCount: 156,
          address: '北京市海淀区中关村大街1号',
          phone: '010-87654321',
          services: ['安卓维修', '屏幕更换', '电池更换'],
          priceRange: '¥¥',
          distance: '2.5km',
          isFavorite: false
        },
        {
          id: '3',
          name: '专业技术维修工作室',
          rating: 4.8,
          reviewCount: 89,
          address: '北京市西城区西单北大街56号',
          phone: '010-11223344',
          services: ['高端机维修', '数据恢复', '主板维修'],
          priceRange: '¥¥¥',
          distance: '3.1km',
          isFavorite: false
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesService = selectedService === 'all' || shop.services.includes(selectedService)
    return matchesSearch && matchesService
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-blue-600" />
            维修店铺
          </h1>
          <p className="text-gray-600">附近的专业手机维修服务，品质保障，价格透明</p>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索店铺名称或服务项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              {/* 服务筛选 */}
              <div className="flex gap-2">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部服务</option>
                  <option value="iPhone维修">iPhone维修</option>
                  <option value="安卓维修">安卓维修</option>
                  <option value="屏幕更换">屏幕更换</option>
                  <option value="电池更换">电池更换</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 店铺列表 */}
        <div className="space-y-6">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* 店铺图片 */}
                  <div className="flex-shrink-0">
                    <div className="bg-gray-200 w-32 h-32 rounded-lg flex items-center justify-center">
                      <Wrench className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* 店铺信息 */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                          {shop.isFavorite && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              收藏
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span>{shop.rating}</span>
                            <span className="mx-1">•</span>
                            <span>{shop.reviewCount}条评论</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{shop.distance}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <span className="text-lg font-semibold text-gray-900">{shop.priceRange}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{shop.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{shop.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">提供的服务</h4>
                      <div className="flex flex-wrap gap-2">
                        {shop.services.map((service, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-col space-y-2 md:w-32">
                    <Button className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      致电
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      咨询
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      预约
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关店铺</h3>
            <p className="text-gray-600">请尝试调整搜索条件或筛选选项</p>
          </div>
        )}
      </div>
    </div>
  )
}