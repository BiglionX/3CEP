'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit3
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface HotLink {
  id: string
  url: string
  title: string
  description: string
  source: string
  category: string
  sub_category: string
  image_url: string
  likes: number
  views: number
  share_count: number
  ai_tags: {
    tags: string[]
    confidence: number
  }
  scraped_at: string
  status: string
  reviewed_at: string | null
  rejection_reason: string | null
  article_id: string | null
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    email: string
  }
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function PendingLinksPage() {
  const [links, setLinks] = useState<HotLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [previewLink, setPreviewLink] = useState<HotLink | null>(null)
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const router = useRouter()

  // 获取待审核链接列?
  const fetchLinks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        status: 'pending_review',
        search: searchTerm,
        category: categoryFilter
      })

      const response = await fetch(`/api/admin/links/pending?${params}`)
      const result = await response.json()

      if (result.data) {
        setLinks(result.data)
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('获取链接列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载和搜索条件变化时获取数据
  useEffect(() => {
    fetchLinks()
  }, [pagination.page, searchTerm, categoryFilter])

  // 处理全?
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(links.map(link => link.id))
    } else {
      setSelectedIds([])
    }
  }

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  // 批量发布
  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) return

    try {
      const response = await fetch('/api/admin/links/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish',
          ids: selectedIds
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`成功发布 ${selectedIds.length} 条链接`)
        setSelectedIds([])
        fetchLinks()
      } else {
        alert(`发布失败: ${result.error}`)
      }
    } catch (error) {
      console.error('批量发布失败:', error)
      alert('发布操作失败')
    }
  }

  // 批量驳回
  const handleBatchReject = () => {
    if (selectedIds.length === 0) return
    setShowRejectDialog(true)
  }

  // 确认驳回
  const confirmReject = async () => {
    try {
      const response = await fetch('/api/admin/links/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          ids: selectedIds,
          rejectionReason
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(`成功驳回 ${selectedIds.length} 条链接`)
        setSelectedIds([])
        setRejectionReason('')
        setShowRejectDialog(false)
        fetchLinks()
      } else {
        alert(`驳回失败: ${result.error}`)
      }
    } catch (error) {
      console.error('批量驳回失败:', error)
      alert('驳回操作失败')
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
      pending_review: { text: '待审?, className: 'bg-yellow-100 text-yellow-800' },
      promoted: { text: '已发?, className: 'bg-green-100 text-green-800' },
      rejected: { text: '已驳?, className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    )
  }

  // 处理编辑草稿
  const handleEditDraft = async (link: HotLink) => {
    try {
      // 创建草稿文章
      const response = await fetch('/api/admin/articles/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId: link.id,
          title: link.title,
          content: link.description,
          summary: link?.substring(0, 200) || '',
          coverImageUrl: link.image_url,
          tags: link?.tags || [],
          category: link.category
        })
      })

      const result = await response.json()
      
      if (result.success && result.articleId) {
        // 跳转到编辑页?
        router.push(`/admin/articles/edit/${result.articleId}`)
      } else {
        alert(`创建草稿失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('创建草稿失败:', error)
      alert('创建草稿失败，请重试')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">热点链接审核</h1>
          <p className="text-gray-600 mt-1">管理待审核的热点链接内容</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleBatchPublish}
            disabled={selectedIds.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            批量发布 ({selectedIds.length})
          </Button>
          
          <Button
            onClick={handleBatchReject}
            disabled={selectedIds.length === 0}
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-2" />
            批量驳回 ({selectedIds.length})
          </Button>
        </div>
      </div>

      {/* 搜索和筛选区?*/}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索标题或描?.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有分?/option>
              <option value="维修教程">维修教程</option>
              <option value="视频教程">视频教程</option>
              <option value="技术分?>技术分?/option>
              <option value="官方指南">官方指南</option>
              <option value="检测指?>检测指?/option>
            </select>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === links.length && links.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>点赞?/TableHead>
                  <TableHead>抓取时间</TableHead>
                  <TableHead>AI打标</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id} className="border-b last:border-b-0">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(link.id)}
                        onChange={(e) => handleSelectOne(link.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-3">
                        {link.image_url && (
                          <img 
                            src={link.image_url} 
                            alt="" 
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 line-clamp-2">
                            {link.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {link.description}
                          </div>
                          <button
                            onClick={() => toggleRowExpansion(link.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                          >
                            {expandedRows.includes(link.id) ? '收起详情' : '查看详情'}
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{link.source}</div>
                        <div className="text-sm text-gray-500">{link.url}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{link.category}</div>
                        {link.sub_category && (
                          <div className="text-sm text-gray-500">{link.sub_category}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{link.likes}</div>
                        <div className="text-xs text-gray-500">👍</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(link.scraped_at)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {link?.tags?.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {link?.confidence && (
                          <div className="text-xs text-gray-500">
                            置信? {(link.ai_tags.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(link.url, '_blank')}
                          title="预览原链?
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewLink(link)}
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditDraft(link)}
                          title="编辑草稿"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {links.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      暂无待审核的链接
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  显示?{(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
                  �?{pagination.total} 条记?
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    下一?
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 驳回确认对话?*/}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认驳回</DialogTitle>
            <DialogDescription>
              请输入驳回原因，这将通知内容提交者?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="请输入驳回原?.."
              className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情预览对话?*/}
      <Dialog open={!!previewLink} onOpenChange={() => setPreviewLink(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          {previewLink && (
            <>
              <DialogHeader>
                <DialogTitle>链接详情预览</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{previewLink.title}</h3>
                    <p className="text-gray-600 mb-4">{previewLink.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">来源:</span> {previewLink.source}</div>
                      <div><span className="font-medium">分类:</span> {previewLink.category}</div>
                      <div><span className="font-medium">子分?</span> {previewLink.sub_category || '�?}</div>
                      <div><span className="font-medium">抓取时间:</span> {formatDate(previewLink.scraped_at)}</div>
                      <div><span className="font-medium">点赞?</span> {previewLink.likes}</div>
                      <div><span className="font-medium">浏览?</span> {previewLink.views}</div>
                    </div>
                  </div>
                  
                  <div>
                    {previewLink.image_url && (
                      <img 
                        src={previewLink.image_url} 
                        alt={previewLink.title}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">AI打标结果</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewLink?.tags?.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {previewLink?.confidence && (
                    <div className="mt-2 text-sm text-gray-600">
                      置信? {(previewLink.ai_tags.confidence * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">原始链接</h4>
                  <a 
                    href={previewLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {previewLink.url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewLink(null)}>
                  关闭
                </Button>
                <Button onClick={() => window.open(previewLink.url, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  打开原链?
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}