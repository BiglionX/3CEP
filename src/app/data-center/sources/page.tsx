'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DataSource {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'kafka'
  host: string
  port: number
  database: string
  username: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  lastConnected: string
  recordCount: number
  syncFrequency: string
  createdAt: string
}

export default function DataSourcesPage() {
  const router = useRouter()
  const [sources, setSources] = useState<DataSource[]>([])
  const [filteredSources, setFilteredSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)

  useEffect(() => {
    loadDataSources()
  }, [])

  useEffect(() => {
    filterSources()
  }, [sources, searchTerm, statusFilter])

  const loadDataSources = async () => {
    try {
      setLoading(true)
      // 模拟数据加载
      const mockSources: DataSource[] = [
        {
          id: '1',
          name: '设备管理系统数据源,
          type: 'postgresql',
          host: 'db.devices.local',
          port: 5432,
          database: 'device_management',
          username: 'admin',
          status: 'connected',
          lastConnected: '2026-02-28 14:30:00',
          recordCount: 15420,
          syncFrequency: '实时',
          createdAt: '2026-01-15'
        },
        {
          id: '2',
          name: '供应链数据仓库,
          type: 'mysql',
          host: 'warehouse.supply.local',
          port: 3306,
          database: 'supply_chain',
          username: 'analyst',
          status: 'connected',
          lastConnected: '2026-02-28 14:25:00',
          recordCount: 8734,
          syncFrequency: '5分钟',
          createdAt: '2026-01-20'
        },
        {
          id: '3',
          name: '维修记录系统',
          type: 'mongodb',
          host: 'mongo.repair.local',
          port: 27017,
          database: 'repair_logs',
          username: 'service',
          status: 'error',
          recordCount: 5621,
          syncFrequency: '每小时',
          createdAt: '2026-01-25'
        },
        {
          id: '4',
          name: '实时报价缓存',
          type: 'redis',
          host: 'cache.quote.local',
          port: 6379,
          status: 'connected',
          lastConnected: '2026-02-28 14:35:00',
          recordCount: 2340,
          syncFrequency: '实时',
          createdAt: '2026-02-01'
        }
      ]
      setSources(mockSources)
    } catch (error) {
      console.error('加载数据源失败', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSources = () => {
    let filtered = sources
    
    if (searchTerm) {
      filtered = filtered.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.host.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(source => source.status === statusFilter)
    }
    
    setFilteredSources(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接
      case 'disconnected': return '已断开'
      case 'connecting': return '连接
      case 'error': return '错误'
      default: return '未知'
    }
  }

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      redis: 'Redis',
      elasticsearch: 'Elasticsearch',
      kafka: 'Kafka'
    }
    return typeMap[type] || type.toUpperCase()
  }

  const handleTestConnection = async (sourceId: string) => {
    // 模拟连接测试
    const source = sources.find(s => s.id === sourceId)
    if (source) {
      // 更新状态为连接
      setSources(prev => prev.map(s => 
        s.id === sourceId  {...s, status: 'connecting'} : s
      ))
      
      // 模拟测试延迟
      setTimeout(() => {
        setSources(prev => prev.map(s => 
          s.id === sourceId  {...s, status: 'connected', lastConnected: new Date().toLocaleString('zh-CN')} : s
        ))
      }, 2000)
    }
  }

  const handleDeleteSource = (sourceId: string) => {
    setSources(prev => prev.filter(s => s.id !== sourceId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理表单提交
    setShowAddDialog(false)
    setEditingSource(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据源管理/h1>
          <p className="text-gray-600 mt-1">管理和监控所有数据连接源</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加数据源
        </Button>
      </div>

      {/* 搜索和过*/}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索数据源名称或主机地址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态筛 />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态/SelectItem>
                <SelectItem value="connected">已连接/SelectItem>
                <SelectItem value="disconnected">已断开</SelectItem>
                <SelectItem value="connecting">连接/SelectItem>
                <SelectItem value="error">错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 数据源列表*/}
      <div className="grid gap-6">
        {filteredSources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription>{source.host}:{source.port}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(source.status)}
                  <Badge variant={
                    source.status === 'connected'  'default' : 
                    source.status === 'error'  'destructive' : 'secondary'
                  }>
                    {getStatusText(source.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">类型</p>
                  <p className="font-medium">{getTypeName(source.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">数据源/p>
                  <p className="font-medium">{source.database || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">记录/p>
                  <p className="font-medium">{source.recordCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">同步频率</p>
                  <p className="font-medium">{source.syncFrequency}</p>
                </div>
              </div>
              
              {source.lastConnected && (
                <div className="text-sm text-gray-500 mb-4">
                  最后连接时 {source.lastConnected}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleTestConnection(source.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  测试连接
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeleteSource(source.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSources.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据源/h3>
              <p className="text-gray-500 mb-4">开始添加您的第一个数据源</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                添加数据源
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 添加数据源对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加数据源/DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">数据源名/Label>
              <Input id="name" placeholder="输入数据源名 required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">数据库类/Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择数据库类 />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                  <SelectItem value="kafka">Kafka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">主机地址</Label>
                <Input id="host" placeholder="localhost" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">端口</Label>
                <Input id="port" type="number" placeholder="5432" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="database">数据库名/Label>
              <Input id="database" placeholder="database_name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户/Label>
                <Input id="username" placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="password" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                取消
              </Button>
              <Button type="submit">添加数据源/Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
