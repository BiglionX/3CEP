'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Fault {
  id: string
  name: string
  category: string
  difficulty: '简? | '中等' | '困难'
  description: string
  created_at: string
  updated_at: string
}

export default function FaultsDictPage() {
  const [faults, setFaults] = useState<Fault[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFault, setEditingFault] = useState<Fault | null>(null)
  
  // 表单状?
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    difficulty: '中等' as '简? | '中等' | '困难',
    description: ''
  })

  useEffect(() => {
    loadFaults()
  }, [])

  const loadFaults = async () => {
    try {
      setLoading(true)
      // 模拟数据加载
      const mockFaults: Fault[] = [
        {
          id: '1',
          name: '屏幕碎裂',
          category: '硬件故障',
          difficulty: '简?,
          description: '屏幕出现裂纹或显示异?,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: '电池续航?,
          category: '硬件故障',
          difficulty: '中等',
          description: '电池容量下降，使用时间明显缩?,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: '无法开?,
          category: '系统故障',
          difficulty: '困难',
          description: '设备完全无法启动或频繁重?,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: '摄像头故?,
          category: '硬件故障',
          difficulty: '中等',
          description: '摄像头无法正常工作或画质异常',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '5',
          name: 'WiFi连接不稳?,
          category: '网络故障',
          difficulty: '简?,
          description: 'WiFi信号弱或经常断开连接',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      setFaults(mockFaults)
    } catch (error) {
      console.error('加载故障数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      // 模拟创建故障
      const newFault: Fault = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setFaults([...faults, newFault])
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('创建故障失败:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editingFault) return
    
    try {
      // 模拟更新故障
      const updatedFaults = faults.map(fault => 
        fault.id === editingFault.id 
          ? { ...fault, ...formData, updated_at: new Date().toISOString() }
          : fault
      )
      
      setFaults(updatedFaults)
      resetForm()
      setEditingFault(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('更新故障失败:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个故障类型吗?)) return
    
    try {
      // 模拟删除故障
      setFaults(faults.filter(fault => fault.id !== id))
    } catch (error) {
      console.error('删除故障失败:', error)
    }
  }

  const handleEdit = (fault: Fault) => {
    setEditingFault(fault)
    setFormData({
      name: fault.name,
      category: fault.category,
      difficulty: fault.difficulty,
      description: fault.description
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      difficulty: '中等',
      description: ''
    })
  }

  const filteredFaults = faults.filter(fault =>
    fault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fault.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fault.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简?: return 'bg-green-100 text-green-800'
      case '中等': return 'bg-yellow-100 text-yellow-800'
      case '困难': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['故障名称', '类别', '难度', '描述', '创建时间'],
      ...filteredFaults.map(fault => [
        fault.name,
        fault.category,
        fault.difficulty,
        fault.description,
        new Date(fault.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `faults_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      // 跳过标题行，处理数据?
      const importedFaults: Fault[] = lines.slice(1).map((line, index) => {
        const values = line.split(',')
        return {
          id: `imported_${Date.now()}_${index}`,
          name: values[0]?.trim() || '',
          category: values[1]?.trim() || '',
          difficulty: (values[2]?.trim() || '中等') as '简? | '中等' | '困难',
          description: values[3]?.trim() || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }).filter(fault => fault.name && fault.category) // 过滤掉空数据
      
      setFaults([...faults, ...importedFaults])
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">故障字典管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            管理故障类型、类别和维修难度
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
            id="csv-import-faults"
          />
          <label htmlFor="csv-import-faults" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            导入CSV
          </label>
          
          <Button onClick={exportToCSV} variant="outline">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出CSV
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm()
                setEditingFault(null)
              }}>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                添加故障
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFault ? '编辑故障' : '添加故障'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">故障名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入故障名?
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">请选择类别</option>
                    <option value="硬件故障">硬件故障</option>
                    <option value="软件故障">软件故障</option>
                    <option value="系统故障">系统故障</option>
                    <option value="网络故障">网络故障</option>
                    <option value="电池故障">电池故障</option>
                    <option value="屏幕故障">屏幕故障</option>
                    <option value="音频故障">音频故障</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">维修难度</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  >
                    <option value="简?>简?/option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">故障描述</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="请输入故障详细描?
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                  <Button onClick={editingFault ? handleUpdate : handleCreate}>
                    {editingFault ? '更新' : '创建'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 搜索?*/}
      <div className="bg-white shadow rounded-lg p-4">
        <Input
          placeholder="搜索故障名称、类别或描述..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* 故障列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>故障名称</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>难度</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm ? '没有找到匹配的故? : '暂无故障数据'}
                </TableCell>
              </TableRow>
            ) : (
              filteredFaults.map((fault) => (
                <TableRow key={fault.id}>
                  <TableCell className="font-medium">{fault.name}</TableCell>
                  <TableCell>{fault.category}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(fault.difficulty)}`}>
                      {fault.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={fault.description}>
                    {fault.description || '-'}
                  </TableCell>
                  <TableCell>{new Date(fault.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fault)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fault.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 统计信息 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">总计故障</p>
            <p className="text-2xl font-bold text-gray-900">{faults.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">简单难?/p>
            <p className="text-2xl font-bold text-green-600">
              {faults.filter(f => f.difficulty === '简?).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">中等难度</p>
            <p className="text-2xl font-bold text-yellow-600">
              {faults.filter(f => f.difficulty === '中等').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">困难难度</p>
            <p className="text-2xl font-bold text-red-600">
              {faults.filter(f => f.difficulty === '困难').length}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            当前搜索结果: <span className="font-medium text-gray-900">{filteredFaults.length}</span> 个故?
          </p>
        </div>
      </div>
    </div>
  )
}