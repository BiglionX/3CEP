/**
 * 权限管理面板组件
 * 提供可视化的权限配置和管理界?
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  useEnhancedRbac,
  Permission,
  Role,
  UserPermissionContext,
  ResourceType
} from './EnhancedRbacManager'

interface PermissionManagementPanelProps {
  className?: string
}

export function PermissionManagementPanel({ className = '' }: PermissionManagementPanelProps) {
  const {
    permissions,
    roles,
    currentUser,
    isLoading,
    getResourcePermissions,
    grantDynamicPermission,
    revokeDynamicPermission,
    getDynamicPermissions,
    logPermissionAction
  } = useEnhancedRbac()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedResource, setSelectedResource] = useState<ResourceType>('all' as ResourceType)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [dynamicAssignments, setDynamicAssignments] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // 获取所有资源类?
  const resourceTypes = [...new Set(Object.values(permissions).map(p => p.resource))]

  // 获取所有权限类?
  const categories = [...new Set(Object.values(permissions).map(p => p.category))]

  // 过滤权限
  const filteredPermissions = Object.values(permissions).filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory
    const matchesResource = selectedResource === 'all' || permission.resource === selectedResource
    
    return matchesSearch && matchesCategory && matchesResource
  })

  // 加载动态权限分?
  useEffect(() => {
    const loadDynamicAssignments = async () => {
      if (currentUser?.userId) {
        const assignments = await getDynamicPermissions(currentUser.userId)
        setDynamicAssignments(assignments)
      }
    }
    loadDynamicAssignments()
  }, [currentUser, getDynamicPermissions])

  // 获取用户的有效权?
  const getUserEffectivePermissions = () => {
    if (!currentUser) return []
    
    const effectivePermissions: string[] = []
    
    // 添加角色权限
    currentUser.roles.forEach(roleId => {
      const role = roles[roleId]
      if (role) {
        effectivePermissions.push(...role.permissions)
      }
    })
    
    // 添加直接权限
    effectivePermissions.push(...currentUser.directPermissions)
    
    // 添加动态权?
    const activeDynamic = dynamicAssignments
      .filter(assign => assign.isActive && (!assign.expiresAt || new Date(assign.expiresAt) > new Date()))
      .map(assign => assign.permissionId)
    
    effectivePermissions.push(...activeDynamic)
    
    return [...new Set(effectivePermissions)]
  }

  const userPermissions = getUserEffectivePermissions()

  // 处理权限授予
  const handleGrantPermission = async (permissionId: string) => {
    if (!currentUser?.userId) return
    
    try {
      await grantDynamicPermission({
        userId: currentUser.userId,
        permissionId,
        grantedBy: 'current_user', // 实际应该使用当前登录用户的ID
        conditions: {}
      })
      
      await logPermissionAction({
        userId: currentUser.userId,
        action: 'GRANT',
        permissionId,
        success: true,
        details: `手动授予权限 ${permissionId}`
      })
    } catch (error) {
      console.error('授予权限失败:', error)
    }
  }

  // 处理权限撤销
  const handleRevokePermission = async (assignmentId: string) => {
    try {
      await revokeDynamicPermission(assignmentId)
    } catch (error) {
      console.error('撤销权限失败:', error)
    }
  }

  // 获取权限状?
  const getPermissionStatus = (permissionId: string) => {
    if (userPermissions.includes(permissionId)) {
      const isDynamic = dynamicAssignments.some(
        assign => assign.permissionId === permissionId && assign.isActive
      )
      return isDynamic ? 'dynamic' : 'role'
    }
    return 'none'
  }

  // 获取状态标?
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'role':
        return <Badge variant="default">角色权限</Badge>
      case 'dynamic':
        return <Badge variant="secondary">动态权?/Badge>
      default:
        return <Badge variant="outline">无权?/Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            权限管理中心
          </h2>
          <p className="text-gray-600 mt-1">
            管理用户权限、角色分配和访问控制策略
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出配置
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            导入配置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(permissions).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">角色数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(roles).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">我的权限</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userPermissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">动态权?/CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dynamicAssignments.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过?*/}
      <Card>
        <CardHeader>
          <CardTitle>权限搜索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索权限名称或描?.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类?/SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择资源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有资?/SelectItem>
                {resourceTypes.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 权限表格 */}
      <Card>
        <CardHeader>
          <CardTitle>权限列表</CardTitle>
          <CardDescription>
            共找?{filteredPermissions.length} 个权?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>权限名称</TableHead>
                  <TableHead>资源</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead>敏感?/TableHead>
                  <TableHead>状?/TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => {
                  const status = getPermissionStatus(permission.id)
                  return (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{permission.category}</span>
                      </TableCell>
                      <TableCell>
                        {permission.isSensitive ? (
                          <div className="flex items-center text-red-500">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            敏感
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            普?
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {status === 'none' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGrantPermission(permission.id)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              授予
                            </Button>
                          ) : status === 'dynamic' ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const assignment = dynamicAssignments.find(
                                  a => a.permissionId === permission.id && a.isActive
                                )
                                if (assignment) {
                                  handleRevokePermission(assignment.id)
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              撤销
                            </Button>
                          ) : null}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPermission(permission)
                              setDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 权限详情对话?*/}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>权限详情</DialogTitle>
            <DialogDescription>
              {selectedPermission?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPermission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">权限ID</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                    {selectedPermission.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">资源类型</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    <Badge variant="outline">{selectedPermission.resource}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">操作类型</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    <Badge variant="secondary">{selectedPermission.action}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">权限类别</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded capitalize">
                    {selectedPermission.category}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">敏感?/label>
                <div className="mt-1">
                  {selectedPermission.isSensitive ? (
                    <div className="flex items-center text-red-500">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      敏感权限 - 需要额外审?
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      普通权?
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPermission.dependentPermissions && (
                <div>
                  <label className="text-sm font-medium">依赖权限</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedPermission.dependentPermissions.map(dep => (
                      <Badge key={dep} variant="outline">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}