'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Shop {
  id: string
  name: string
  contact_person: string
  phone: string
  address: string
  city: string
  province: string
  business_license: string
  services: string
  logo_url: string
  cover_image_url: string
  status: string
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function ShopsManagementPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  // 获取已审核店铺列?
  const fetchApprovedShops = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      })
      
      const response = await fetch(`/api/admin/shops?${params}`)
      const result = await response.json()
      
      if (result.data) {
        setShops(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('获取已审核店铺失?', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovedShops()
  }, [pagination.page, searchTerm, statusFilter])

  // 处理全?
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(shops.map(shop => shop.id))
    } else {
      setSelectedIds([])
    }
  }

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  // 编辑店铺
  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop)
    setShowEditDialog(true)
  }

  // 保存店铺编辑
  const saveShopEdit = async () => {
    if (!editingShop) return
    
    try {
      const response = await fetch(`/api/admin/shops/${editingShop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingShop)
      })

      const result = await response.json()
      if (result.success) {
        alert('店铺信息更新成功')
        setShowEditDialog(false)
        setEditingShop(null)
        fetchApprovedShops()
      } else {
        alert(`更新失败: ${result.error}`)
      }
    } catch (error) {
      console.error('更新店铺失败:', error)
      alert('更新操作失败')
    }
  }

  // 禁用/启用店铺
  const toggleShopStatus = async (shopId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'disabled' : 'approved'
    const actionText = newStatus === 'disabled' ? '禁用' : '启用'
    
    if (!confirm(`确定?{actionText}这家店铺吗？`)) return
    
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`${actionText}成功`)
        fetchApprovedShops()
      } else {
        alert(`操作失败: ${result.error}`)
      }
    } catch (error) {
      console.error('状态切换失?', error)
      alert('操作失败')
    }
  }

  // 删除店铺
  const deleteShop = async (shopId: string, shopName: string) => {
    if (!confirm(`确定要删除店?"${shopName}" 吗？此操作不可撤销！`)) return
    
    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        alert('店铺删除成功')
        fetchApprovedShops()
      } else {
        alert(`删除失败: ${result.error}`)
      }
    } catch (error) {
      console.error('删除店铺失败:', error)
      alert('删除操作失败')
    }
  }

  // 切换行展开状?
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  // 格式化日?
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  }

  // 获取状态标签样?
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      approved: { text: '已通过', className: 'bg-green-100 text-green-800' },
      rejected: { text: '已驳?, className: 'bg-red-100 text-red-800' },
      disabled: { text: '已禁?, className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    )
  }

  // 渲染星级评分
  const renderRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">�?/span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">�?/span>)
    }
    
    const remaining = 5 - Math.ceil(rating)
    for (let i = 0; i < remaining; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">�?/span>)
    }
    
    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店铺管理</h1>
          <p className="text-gray-600 mt-1">管理已审核通过的维修店?/p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="搜索店铺名称、联系人或地址..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状?/option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳?/option>
            <option value="disabled">已禁?/option>
          </select>
          
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline">
                批量操作 ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 店铺列表表格 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载?..</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === shops.length && shops.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>店铺信息</TableHead>
                <TableHead>联系?/TableHead>
                <TableHead>评分</TableHead>
                <TableHead>状?/TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id} className="border-b">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(shop.id)}
                      onChange={(e) => handleSelectOne(shop.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {shop.logo_url ? (
                        <img 
                          src={shop.logo_url} 
                          alt={shop.name}
                          className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-sm">LOGO</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{shop.name}</div>
                        <div className="text-sm text-gray-500">{shop.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.contact_person}</div>
                      <div className="text-sm text-gray-500">
                        {shop.city}, {shop.province}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {renderRating(shop.rating || 0)}
                      <span className="ml-2 text-xs text-gray-500">
                        ({shop.review_count || 0}条评?
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(shop.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(shop.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRowExpansion(shop.id)}
                      >
                        详情
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditShop(shop)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant={shop.status === 'approved' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleShopStatus(shop.id, shop.status)}
                      >
                        {shop.status === 'approved' ? '禁用' : '启用'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* 展开的详情行 */}
              {shops.map((shop) => (
                expandedRows.includes(shop.id) && (
                  <TableRow key={`${shop.id}-detail`} className="bg-gray-50">
                    <TableCell colSpan={7}>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-gray-500">地址?/span>{shop.address}</div>
                              <div><span className="text-gray-500">营业执照?/span>{shop.business_license || '未提?}</div>
                              <div><span className="text-gray-500">创建时间?/span>{formatDate(shop.created_at)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">服务项目</h4>
                            <div className="flex flex-wrap gap-2">
                              {shop.services ? (
                                JSON.parse(shop.services).map((service: string, index: number) => (
                                  <span 
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {service}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">暂无服务信息</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">操作记录</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-gray-500">最后更新：</span>{formatDate(shop.updated_at)}</div>
                              <div><span className="text-gray-500">当前状态：</span>{getStatusBadge(shop.status)}</div>
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditShop(shop)}
                              >
                                编辑信息
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteShop(shop.id, shop.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                删除店铺
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {shop.cover_image_url && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">店铺照片</h4>
                            <img 
                              src={shop.cover_image_url} 
                              alt="店铺门头?
                              className="w-64 h-32 rounded-md object-cover border"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              显示?{(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
              �?{pagination.total} 条记?
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                上一?
              </Button>
              <Button
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                下一?
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 编辑店铺对话?*/}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑店铺信息</DialogTitle>
          </DialogHeader>
          
          {editingShop && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店铺名称 *
                  </label>
                  <Input
                    value={editingShop.name}
                    onChange={(e) => setEditingShop({...editingShop, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系?*
                  </label>
                  <Input
                    value={editingShop.contact_person}
                    onChange={(e) => setEditingShop({...editingShop, contact_person: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系电话 *
                  </label>
                  <Input
                    value={editingShop.phone}
                    onChange={(e) => setEditingShop({...editingShop, phone: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    城市 *
                  </label>
                  <Input
                    value={editingShop.city}
                    onChange={(e) => setEditingShop({...editingShop, city: e.target.value})}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    详细地址 *
                  </label>
                  <Input
                    value={editingShop.address}
                    onChange={(e) => setEditingShop({...editingShop, address: e.target.value})}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    营业执照号码
                  </label>
                  <Input
                    value={editingShop.business_license || ''}
                    onChange={(e) => setEditingShop({...editingShop, business_license: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  服务项目
                </label>
                <textarea
                  value={editingShop.services || ''}
                  onChange={(e) => setEditingShop({...editingShop, services: e.target.value})}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入服务项目，用逗号分隔..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={saveShopEdit}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}