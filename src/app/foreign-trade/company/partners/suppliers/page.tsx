'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Building,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Supplier {
  id: string
  name: string
  country: string
  contactPerson: string
  email: string
  phone: string
  website: string
  products: string[]
  rating: number
  cooperationYears: number
  status: 'active' | 'inactive' | 'pending'
  annualVolume: number
  lastOrderDate: string
  contractExpiry: string
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')

  // 模拟数据
  useEffect(() => {
    const loadSuppliers = () => {
      setLoading(true)
      
      setTimeout(() => {
        const mockSuppliers: Supplier[] = [
          {
            id: '1',
            name: 'Samsung Electronics Co., Ltd.',
            country: '韩国',
            contactPerson: 'Kim Min-jun',
            email: 'kim.minjun@samsung.com',
            phone: '+82-2-1234-5678',
            website: 'www.samsung.com',
            products: ['智能手机', '半导体', '显示屏'],
            rating: 4.8,
            cooperationYears: 5,
            status: 'active',
            annualVolume: 15000000,
            lastOrderDate: '2026-02-20',
            contractExpiry: '2027-12-31'
          },
          {
            id: '2',
            name: 'Apple Inc.',
            country: '美国',
            contactPerson: 'Sarah Johnson',
            email: 's.johnson@apple.com',
            phone: '+1-408-123-4567',
            website: 'www.apple.com',
            products: ['iPhone', 'iPad', 'Mac'],
            rating: 4.9,
            cooperationYears: 3,
            status: 'active',
            annualVolume: 8500000,
            lastOrderDate: '2026-02-15',
            contractExpiry: '2026-11-30'
          },
          {
            id: '3',
            name: 'Sony Corporation',
            country: '日本',
            contactPerson: 'Tanaka Hiroshi',
            email: 'tanaka.h@sony.co.jp',
            phone: '+81-3-1234-5678',
            website: 'www.sony.jp',
            products: ['游戏机', '相机', '音频设备'],
            rating: 4.5,
            cooperationYears: 7,
            status: 'active',
            annualVolume: 6200000,
            lastOrderDate: '2026-02-10',
            contractExpiry: '2027-06-30'
          },
          {
            id: '4',
            name: 'LG Electronics Inc.',
            country: '韩国',
            contactPerson: 'Park Seo-yeon',
            email: 'park.seoyeon@lge.com',
            phone: '+82-2-8765-4321',
            website: 'www.lg.com',
            products: ['家电', '显示器', '手机'],
            rating: 4.3,
            cooperationYears: 4,
            status: 'pending',
            annualVolume: 9800000,
            lastOrderDate: '2026-01-28',
            contractExpiry: '2026-08-15'
          },
          {
            id: '5',
            name: 'Panasonic Corporation',
            country: '日本',
            contactPerson: 'Sato Takeshi',
            email: 'sato.takeshi@panasonic.com',
            phone: '+81-6-9876-5432',
            website: 'www.panasonic.com',
            products: ['电池', '家电', '工业设备'],
            rating: 4.6,
            cooperationYears: 6,
            status: 'inactive',
            annualVolume: 4500000,
            lastOrderDate: '2025-11-15',
            contractExpiry: '2026-03-31'
          }
        ]
        
        setSuppliers(mockSuppliers)
        setLoading(false)
      }, 800)
    }

    loadSuppliers()
  }, [])

  // 筛选逻辑
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    const matchesCountry = countryFilter === 'all' || supplier.country === countryFilter
    
    return matchesSearch && matchesStatus && matchesCountry
  })

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      active: '合作中',
      inactive: '已停止',
      pending: '待审核'
    }
    return textMap[status] || status
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const handleViewSupplier = (supplierId: string) => {
    // TODO: 实现查看详情功能
    console.log('查看供应商详情:', supplierId)
  }

  const handleCreateSupplier = () => {
    // TODO: 实现创建供应商功能
    console.log('创建新供应商')
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出供应商数据')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载供应商数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">供应商管理</h1>
          <p className="mt-2 text-gray-600">
            管理国际供应商信息和合作关系
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button onClick={handleCreateSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            添加供应商
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总供应商数</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃供应商 {suppliers.filter(s => s.status === 'active').length} 家
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合作国家</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(suppliers.map(s => s.country))].length}
            </div>
            <p className="text-xs text-muted-foreground">
              个不同国家/地区
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年度交易额</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(suppliers.reduce((sum, s) => sum + s.annualVolume, 0) / 100000000).toFixed(1)}亿
            </div>
            <p className="text-xs text-muted-foreground">
              累计年度交易额
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              基于 {suppliers.length} 家供应商
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索供应商名称、联系人或国家..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="合作状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">合作中</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="inactive">已停止</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="国家/地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部国家</SelectItem>
                {[...new Set(suppliers.map(s => s.country))].map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 供应商列表 */}
      <Card>
        <CardHeader>
          <CardTitle>供应商列表</CardTitle>
          <CardDescription>
            共找到 {filteredSuppliers.length} 个符合条件的供应商
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无供应商数据</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || countryFilter !== 'all'
                    ? '没有找到匹配的供应商'
                    : '开始添加第一个供应商吧'}
                </p>
                {!searchTerm && statusFilter === 'all' && countryFilter === 'all' && (
                  <div className="mt-6">
                    <Button onClick={handleCreateSupplier}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加供应商
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{supplier.country}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(supplier.status)}>
                        {getStatusText(supplier.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 联系信息 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{supplier.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{supplier.phone}</span>
                      </div>
                    </div>

                    {/* 评分和年限 */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        {getRatingStars(supplier.rating)}
                        <span className="text-sm font-medium ml-2">{supplier.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {supplier.cooperationYears}年合作
                      </div>
                    </div>

                    {/* 产品类别 */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">主营产品:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products.slice(0, 3).map((product, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                        {supplier.products.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{supplier.products.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 交易信息 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">年度交易额:</span>
                        <div className="font-medium">¥{(supplier.annualVolume / 10000).toFixed(0)}万</div>
                      </div>
                      <div>
                        <span className="text-gray-500">上次订单:</span>
                        <div className="font-medium">{supplier.lastOrderDate}</div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewSupplier(supplier.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}