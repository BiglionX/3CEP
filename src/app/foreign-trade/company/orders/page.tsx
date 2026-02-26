'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  ChevronDown,
  Calendar,
  MapPin,
  User,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// 简化的操作菜单组件
const ActionMenu = ({ orderId, onView, onEdit, onDelete }: { 
  orderId: string; 
  onView: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
          <div className="py-1">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onView(orderId)
                setIsOpen(false)
              }}
            >
              <Eye className="inline mr-2 h-4 w-4" />
              查看详情
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
            >
              <Edit className="inline mr-2 h-4 w-4" />
              编辑订单
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete()
                setIsOpen(false)
              }}
            >
              <Trash2 className="inline mr-2 h-4 w-4" />
              删除订单
            </button>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Order {
  id: string
  type: 'import' | 'export'
  orderNumber: string
  partner: string
  product: string
  quantity: number
  amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  expectedDelivery: string
  country: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // 模拟数据加载
  useEffect(() => {
    const loadOrders = () => {
      setLoading(true)
      
      // 模拟API调用延迟
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            id: '1',
            type: 'import',
            orderNumber: 'PO-2026-001',
            partner: 'Samsung Electronics (韩国)',
            product: 'Galaxy S24 Ultra 手机',
            quantity: 500,
            amount: 3500000,
            status: 'confirmed',
            priority: 'high',
            createdAt: '2026-02-25',
            expectedDelivery: '2026-03-15',
            country: '韩国'
          },
          {
            id: '2',
            type: 'import',
            orderNumber: 'PO-2026-002',
            partner: 'Apple Inc. (美国)',
            product: 'iPhone 15 Pro Max',
            quantity: 300,
            amount: 2850000,
            status: 'shipped',
            priority: 'medium',
            createdAt: '2026-02-24',
            expectedDelivery: '2026-03-10',
            country: '美国'
          },
          {
            id: '3',
            type: 'export',
            orderNumber: 'SO-2026-001',
            partner: 'TechGlobal Ltd. (美国)',
            product: '华为Mate 60 Pro',
            quantity: 1000,
            amount: 8500000,
            status: 'processing',
            priority: 'high',
            createdAt: '2026-02-23',
            expectedDelivery: '2026-03-25',
            country: '美国'
          },
          {
            id: '4',
            type: 'export',
            orderNumber: 'SO-2026-002',
            partner: 'Digital Solutions GmbH (德国)',
            product: '小米14 Ultra',
            quantity: 800,
            amount: 5760000,
            status: 'pending',
            priority: 'medium',
            createdAt: '2026-02-22',
            expectedDelivery: '2026-03-20',
            country: '德国'
          },
          {
            id: '5',
            type: 'import',
            orderNumber: 'PO-2026-003',
            partner: 'Sony Corporation (日本)',
            product: 'PlayStation 5',
            quantity: 200,
            amount: 1200000,
            status: 'pending',
            priority: 'low',
            createdAt: '2026-02-21',
            expectedDelivery: '2026-03-20',
            country: '日本'
          }
        ]
        
        setOrders(mockOrders)
        setLoading(false)
      }, 800)
    }

    loadOrders()
  }, [])

  // 筛选逻辑
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType = typeFilter === 'all' || order.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已交付',
      cancelled: '已取消'
    }
    return textMap[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colorMap[priority] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityText = (priority: string) => {
    const textMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高'
    }
    return textMap[priority] || priority
  }

  const getTypeIcon = (type: string) => {
    return type === 'import' ? '📥' : '📤'
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/foreign-trade/company/order/${orderId}`)
  }

  const handleCreateOrder = () => {
    router.push('/foreign-trade/company/orders/create')
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出订单数据')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载订单数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
          <p className="mt-2 text-gray-600">
            管理所有进出口订单，跟踪订单状态和交付进度
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button onClick={handleCreateOrder}>
            <Plus className="h-4 w-4 mr-2" />
            创建订单
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              当前活跃订单
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              需要确认的订单
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              处理中的订单
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">交易总额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(orders.reduce((sum, order) => sum + order.amount, 0) / 10000).toFixed(1)}万
            </div>
            <p className="text-xs text-muted-foreground">
              累计交易金额
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索订单号、合作伙伴或产品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="shipped">已发货</SelectItem>
                <SelectItem value="delivered">已交付</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="订单类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="import">进口订单</SelectItem>
                <SelectItem value="export">出口订单</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="high">高优先级</SelectItem>
                <SelectItem value="medium">中优先级</SelectItem>
                <SelectItem value="low">低优先级</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 订单表格 */}
      <Card>
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
          <CardDescription>
            共找到 {filteredOrders.length} 个符合条件的订单
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单信息</TableHead>
                  <TableHead>合作伙伴</TableHead>
                  <TableHead>产品信息</TableHead>
                  <TableHead>数量/金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">暂无订单数据</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                          ? '没有找到匹配的订单'
                          : '开始创建第一个订单吧'}
                      </p>
                      {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && priorityFilter === 'all' && (
                        <div className="mt-6">
                          <Button onClick={handleCreateOrder}>
                            <Plus className="h-4 w-4 mr-2" />
                            创建新订单
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeIcon(order.type)}
                              {order.type === 'import' ? '进口' : '出口'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            预计交付: {order.expectedDelivery}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{order.partner}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            {order.country}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">{order.product}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{order.quantity} 件</div>
                          <div className="text-sm text-gray-500">
                            ¥{(order.amount / 10000).toFixed(1)}万
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(order.priority)}>
                            {getPriorityText(order.priority)}优先级
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {order.createdAt}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <ActionMenu 
                          orderId={order.id}
                          onView={handleViewOrder}
                          onEdit={() => console.log('编辑订单', order.id)}
                          onDelete={() => console.log('删除订单', order.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}