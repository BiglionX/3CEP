'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Device {
  id: string
  brand: string
  model: string
  category: string
  release_year: number
  created_at: string
  updated_at: string
}

export default function DevicesDictPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  
  // 表单状
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    category: '',
    release_year: new Date().getFullYear()
  })

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      // 模拟数据加载
      const mockDevices: Device[] = [
        {
          id: '1',
          brand: '苹果',
          model: 'iPhone 15 Pro',
          category: '手机',
          release_year: 2023,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          brand: '华为',
          model: 'Mate 60 Pro',
          category: '手机',
          release_year: 2023,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          brand: '小米',
          model: 'Redmi Note 12',
          category: '手机',
          release_year: 2022,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      setDevices(mockDevices)
    } catch (error) {
      console.error('加载设备数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      // 模拟创建设备
      const newDevice: Device = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setDevices([...devices, newDevice])
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('创建设备失败:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editingDevice) return
    
    try {
      // 模拟更新设备
      const updatedDevices = devices.map(device => 
        device.id === editingDevice.id 
           { ...device, ...formData, updated_at: new Date().toISOString() }
          : device
      )
      
      setDevices(updatedDevices)
      resetForm()
      setEditingDevice(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('更新设备失败:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个设备吗？')) return
    
    try {
      // 模拟删除设备
      setDevices(devices.filter(device => device.id !== id))
    } catch (error) {
      console.error('删除设备失败:', error)
    }
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device)
    setFormData({
      brand: device.brand,
      model: device.model,
      category: device.category,
      release_year: device.release_year
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      category: '',
      release_year: new Date().getFullYear()
    })
  }

  const filteredDevices = devices.filter(device =>
    device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToCSV = () => {
    const csvContent = [
      ['品牌', '型号', '类别', '发布年份', '创建时间'],
      ...filteredDevices.map(device => [
        device.brand,
        device.model,
        device.category,
        device.release_year.toString(),
        new Date(device.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `devices_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      // 跳过标题行，处理数据源
      const importedDevices: Device[] = lines.slice(1).map((line, index) => {
        const values = line.split(',')
        return {
          id: `imported_${Date.now()}_${index}`,
          brand: values[0].trim() || '',
          model: values[1].trim() || '',
          category: values[2].trim() || '',
          release_year: parseInt(values[3]) || new Date().getFullYear(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }).filter(device => device.brand && device.model) // 过滤掉空数据
      
      setDevices([...devices, ...importedDevices])
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
          <h1 className="text-2xl font-bold text-gray-900">设备字典管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            管理设备品牌、型号和分类信息
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
            id="csv-import"
          />
          <label htmlFor="csv-import" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
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
                setEditingDevice(null)
              }}>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                添加设备
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDevice  '编辑设备' : '添加设备'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="请输入品牌名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型号</label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="请输入设备型号"
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
                    <option value="手机">手机</option>
                    <option value="平板">平板</option>
                    <option value="笔记本电脑">笔记本电脑</option>
                    <option value="台式机">台式机</option>
                    <option value="智能手表">智能手表</option>
                    <option value="耳机">耳机</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发布年份</label>
                  <Input
                    type="number"
                    value={formData.release_year}
                    onChange={(e) => setFormData({...formData, release_year: parseInt(e.target.value) || new Date().getFullYear()})}
                    placeholder="请输入发布年份"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                  <Button onClick={editingDevice  handleUpdate : handleCreate}>
                    {editingDevice  '更新' : '创建'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 搜索*/}
      <div className="bg-white shadow rounded-lg p-4">
        <Input
          placeholder="搜索品牌、型号或类别..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* 设备列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>品牌</TableHead>
              <TableHead>型号</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>发布年份</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm  '没有找到匹配的设备' : '暂无设备数据'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.brand}</TableCell>
                  <TableCell>{device.model}</TableCell>
                  <TableCell>{device.category}</TableCell>
                  <TableCell>{device.release_year}</TableCell>
                  <TableCell>{new Date(device.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(device)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(device.id)}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            共找到<span className="font-medium text-gray-900">{filteredDevices.length}</span> 个设备
          </p>
          <p className="text-sm text-gray-500">
            总计：{devices.length} 个设备
          </p>
        </div>
      </div>
    </div>
  )
}
