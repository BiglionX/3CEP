/**
 * 角色管理组件
 * 提供角色创建、编辑、权限分配等功能
 */

'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnhancedRbac, Role, Permission, EnhancedRbacContextType } from './EnhancedRbacManager';

interface RoleManagementPanelProps {
  className?: string;
}

export function RoleManagementPanel({
  className = '',
}: RoleManagementPanelProps) {
  const context = useEnhancedRbac() as unknown as EnhancedRbacContextType;
  const { roles, permissions, addInheritance, /* removeInheritance unused, */ getInheritedPermissions } = context;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<
    Omit<Role, 'id' | 'createdAt' | 'updatedAt'>
  >({
    name: '',
    description: '',
    level: 50,
    isSystem: false,
    permissions: [],
    inherits: [],
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [inheritanceDialogOpen, setInheritanceDialogOpen] = useState(false);
  const [inheritanceSource, setInheritanceSource] = useState('');
  const [inheritanceTarget, setInheritanceTarget] = useState('');

  // 处理角色创建/编辑
  const handleSaveRole = () => {
    // 这里应该调用API保存角色
    setDialogOpen(false);
    resetForm();
  };

  // 处理角色删除
  const handleDeleteRole = (_roleId: string) => {
    if (confirm('确定要删除这个角色吗?')) {
      // 这里应该调用API删除角色
    }
  };

  // 处理权限选择
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // 处理继承关系添加
  const handleAddInheritance = () => {
    if (
      inheritanceSource &&
      inheritanceTarget &&
      inheritanceSource !== inheritanceTarget
    ) {
      addInheritance(inheritanceSource, inheritanceTarget);
      setInheritanceDialogOpen(false);
      setInheritanceSource('');
      setInheritanceTarget('');
    }
  };

  // 重置表单
  const resetForm = () => {
    setNewRole({
      name: '',
      description: '',
      level: 50,
      isSystem: false,
      permissions: [],
      inherits: [],
    });
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  // 编辑角色
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      level: role.level,
      isSystem: role.isSystem,
      permissions: [...role.permissions],
      inherits: [...(role.inherits || [])],
    });
    setSelectedPermissions([...role.permissions]);
    setDialogOpen(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            角色管理
          </h2>
          <p className="text-gray-600 mt-1">管理系统角色、权限分配和继承关系</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setInheritanceDialogOpen(true)}
            variant="outline"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            管理继承
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建角色
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">系统角色</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(roles).filter((r: Role) => r.isSystem).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">自定义角色</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(roles).filter((r: Role) => !r.isSystem).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(permissions).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 角色表格 */}
      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
          <CardDescription>系统中所有的角色配置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>权限等级</TableHead>
                  <TableHead>权限数量</TableHead>
                  <TableHead>继承关系</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(roles).map((role: Role) => {
                  const inheritedPermissions = getInheritedPermissions(role.id);
                  const totalPermissions = [
                    ...role.permissions,
                    ...inheritedPermissions,
                  ];

                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            role.level >= 80
                              ? 'destructive'
                              : role.level >= 50
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {role.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{totalPermissions.length}</span>
                          {inheritedPermissions.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {inheritedPermissions.length} 继承
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {role.inherits && role.inherits.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.inherits.map(inheritId => {
                              const parentRole = roles[inheritId];
                              return (
                                <Badge
                                  key={inheritId}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {parentRole?.name || inheritId}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.isSystem ? 'default' : 'secondary'}
                        >
                          {role.isSystem ? '系统' : '自定义'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!role.isSystem && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 角色编辑对话框 */}
      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? '编辑角色' : '新建角色'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? `修改角色 "${editingRole.name}" 的配置`
                : '创建一个新的系统角色'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="font-medium">基本信息</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">角色名称 *</label>
                  <Input
                  value={newRole.name}
                  onChange={e =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  placeholder="请输入角色名称"
                />
              </div>

              <div>
                <label className="text-sm font-medium">权限等级</label>
                <Select
                  value={newRole.level.toString()}
                  onValueChange={value =>
                    setNewRole({ ...newRole, level: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 - 只读</SelectItem>
                    <SelectItem value="30">30 - 基础用户</SelectItem>
                    <SelectItem value="50">50 - 普通员工</SelectItem>
                    <SelectItem value="70">70 - 管理员</SelectItem>
                    <SelectItem value="80">80 - 高级管理员</SelectItem>
                    <SelectItem value="100">100 - 超级管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

              <div>
                <label className="text-sm font-medium">角色描述</label>
                <Textarea
                  value={newRole.description}
                  onChange={e =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  placeholder="请输入角色描述"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSystem"
                  checked={newRole.isSystem}
                  onChange={e =>
                    setNewRole({ ...newRole, isSystem: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="isSystem" className="text-sm">
                  系统角色（不可删除）
                </label>
              </div>
            </div>

            {/* 权限分配 */}
            <div className="space-y-4">
              <h3 className="font-medium">权限分配</h3>

              <div className="border rounded-lg p-4">
                <div className="mb-3">
                  <label className="text-sm font-medium">
                    已选权限 ({selectedPermissions.length})
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPermissions.map((permId: string) => {
                      const permission = permissions[permId];
                      return (
                        <Badge
                          key={permId}
                          variant="default"
                          className="cursor-pointer"
                          onClick={() => togglePermission(permId)}
                        >
                          {permission?.name || permId}
                          <Trash2 className="w-3 h-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <label className="text-sm font-medium">可选权限</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                    {Object.values(permissions)
                      .filter((perm: Permission) => !selectedPermissions.includes(perm.id))
                      .map((permission: Permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {permission.category}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRole}>
              保存角色
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 继承关系管理对话框 */}
      <Dialog
        open={inheritanceDialogOpen}
        onOpenChange={setInheritanceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>管理角色继承关系</DialogTitle>
            <DialogDescription>
              设置角色之间的继承关系，子角色将继承父角色的权限
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">父角色（被继承）</label>
                <Select
                  value={inheritanceSource}
                  onValueChange={setInheritanceSource}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(roles).map((role: Role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">子角色（继承者）</label>
                <Select
                  value={inheritanceTarget}
                  onValueChange={setInheritanceTarget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择子角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(roles).map((role: Role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">继承说明</h4>
              <p className="text-sm text-blue-600">
                子角色将自动获得父角色的所有权限，但不会影响父角色的权限配置。一个角色可以同时继承多个父角色的权限。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInheritanceDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleAddInheritance}
              disabled={
                !inheritanceSource ||
                !inheritanceTarget ||
                inheritanceSource === inheritanceTarget
              }
            >
              <UserCheck className="w-4 h-4 mr-2" />
              添加继承关系
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
