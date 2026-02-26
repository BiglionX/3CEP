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
  User,
  TrendingUp,
  CreditCard
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

interface Customer {
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
  status: 'active' | 'inactive' | 'prospect'
  annualRevenue: number
  lastOrderDate: string
  paymentTerms: string
  creditLimit: number
  outstandingBalance: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')

  // 模拟数据
  useEffect(() => {
    const loadCustomers = () => {
      setLoading(true)
      
      setTimeout(() => {
        const mockCustomers: Customer[] = [
          {
            id: '1',
            name: 'TechGlobal Ltd.',
            country: '美国',
            contactPerson: 'Michael Chen',
            email: 'm.chen@techglobal.com',
            phone: '+1-212-555-0123',
            website: 'www.techglobal.com',
            products: ['智能手机', '平板电脑', '配件'],
            rating: 4.9,
            cooperationYears: 4,
            status: 'active',
            annualRevenue: 25000000,
            lastOrderDate: '2026-02-22',
            paymentTerms: '30天账期',
            creditLimit: 5000000,
            outstandingBalance: 1200000
          },
          {
            id: '2',
            name: 'Digital Solutions GmbH',
            country: '德国',
            contactPerson: 'Anna Mueller',
            email: 'a.mueller@digitalsolutions.de',
            phone: '+49-30-12345678',
            website: 'www.digitalsolutions.de',
            products: ['笔记本电脑', '服务器', '网络设备'],
            rating: 4.7,
            cooperationYears: 3,
            status: 'active',
            annualRevenue: 18500000,
            lastOrderDate: '2026-02-18',
            paymentTerms: '60天账期',
            creditLimit: 3000000,
            outstandingBalance: 850000
          },
          {
            id: '3',
            name: 'Asia Electronics Co.',
            country: '日本',
            contactPerson: 'Yamamoto Takeshi',
            email: 'yamamoto.t@asiaelectronics.jp',
            phone: '+81-3-9876-5432',
            website: 'www.asiaelectronics.jp',
            products: ['消费电子', '汽车电子', '工业设备'],
            rating: 4.8,
            cooperationYears: 5,
            status: 'active',
            annualRevenue: 32000000,
            lastOrderDate: '2026-02-25',
            paymentTerms: '预付款',
            creditLimit: 8000000,
            outstandingBalance: 0
          },
          {
            id: '4',
            name: 'EuroTech BV',
            country: '荷兰',
            contactPerson: 'Pieter van der Berg',
            email: 'p.vanderberg@eurotech.nl',
            phone: '+31-20-1234567',
            website: 'www.eurotech.nl',
            products: ['智能家居', 'IoT设备', '传感器'],
            rating: 4.5,
            cooperationYears: 2,
            status: 'prospect',
            annualRevenue: 12000000,
            lastOrderDate: '2026-01-30',
            paymentTerms: '待确定',
            creditLimit: 2000000,
            outstandingBalance: 0
          },
          {
            id: '5',
            name: 'Global Connect Inc.',
            country: '英国',
            contactPerson: 'Emma Wilson',
            email: 'e.wilson@globalconnect.co.uk',
            phone: '+44-20-7123-4567',
            website: 'www.globalconnect.co.uk',
            products: ['通信设备', '数据中心', '云计算'],
            rating: 4.6,
            cooperationYears: 6,
            status: 'inactive',
            annualRevenue: 28000000,
            lastOrderDate: '2025-12-15',
            paymentTerms: '90天账期',
            creditLimit: 10000000,
            outstandingBalance: 3500000
          }
        ]
        
        setCustomers(mockCustomers)
        setLoading(false)
      }, 800)
    }

    loadCustomers()
  }, [])

  // 筛选逻辑
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    const matchesCountry = countryFilter === 'all' || customer.country === countryFilter
    
    return matchesSearch && matchesStatus && matchesCountry
  })

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      prospect: 'bg-blue-100 text-blue-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      active: '合作中',
      inactive: '已停止',
      prospect: '潜在客户'
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

  const handleViewCustomer = (customerId: string) => {
    // TODO: 实现查看详情功能
    console.log('查看客户详情:', customerId)
  }

  const handleCreateCustomer = () => {
    // TODO: 实现创建客户功能
    console.log('创建新客户')
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出客户数据')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载客户数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">客户管理</h1>
          <p className="mt-2 text-gray-600">
            管理海外客户信息和业务关系
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button onClick={handleCreateCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            添加客户
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总客户数</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃客户 {customers.filter(c => c.status === 'active').length} 家
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服务国家</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(customers.map(c => c.country))].length}
            </div>
            <p className="text-xs text-muted-foreground">
              个不同国家/地区
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年度收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(customers.reduce((sum, c) => sum + c.annualRevenue, 0) / 100000000).toFixed(1)}亿
            </div>
            <p className="text-xs text-muted-foreground">
              累计年度销售收入
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">应收账款</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ¥{(customers.reduce((sum, c) => sum + c.outstandingBalance, 0) / 10000).toFixed(0)}万
            </div>
            <p className="text-xs text-muted-foreground">
              待收款项总额
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
                  placeholder="搜索客户名称、联系人或国家..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="客户状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">合作中</SelectItem>
                <SelectItem value="prospect">潜在客户</SelectItem>
                <SelectItem value="inactive">已停止</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="国家/地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部国家</SelectItem>
                {[...new Set(customers.map(c => c.country))].map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 客户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
          <CardDescription>
            共找到 {filteredCustomers.length} 个符合条件的客户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无客户数据</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || countryFilter !== 'all'
                    ? '没有找到匹配的客户'
                    : '开始添加第一个客户吧'}
                </p>
                {!searchTerm && statusFilter === 'all' && countryFilter === 'all' && (
                  <div className="mt-6">
                    <Button onClick={handleCreateCustomer}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加客户
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{customer.country}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(customer.status)}>
                        {getStatusText(customer.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 联系信息 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{customer.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{customer.phone}</span>
                      </div>
                    </div>

                    {/* 评分和年限 */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        {getRatingStars(customer.rating)}
                        <span className="text-sm font-medium ml-2">{customer.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.cooperationYears}年合作
                      </div>
                    </div>

                    {/* 产品类别 */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">主营产品:</p>
                      <div className="flex flex-wrap gap-1">
                        {customer.products.slice(0, 3).map((product, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                        {customer.products.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{customer.products.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 财务信息 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">年度收入:</span>
                        <div className="font-medium">¥{(customer.annualRevenue / 10000).toFixed(0)}万</div>
                      </div>
                      <div>
                        <span className="text-gray-500">信用额度:</span>
                        <div className="font-medium">¥{(customer.creditLimit / 10000).toFixed(0)}万</div>
                      </div>
                      <div>
                        <span className="text-gray-500">付款条款:</span>
                        <div className="font-medium text-xs">{customer.paymentTerms}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">待收款:</span>
                        <div className="font-medium text-orange-600">¥{(customer.outstandingBalance / 10000).toFixed(0)}万</div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewCustomer(customer.id)}
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