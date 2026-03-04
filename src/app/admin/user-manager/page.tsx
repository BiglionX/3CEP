'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckSquare,
  Square,
  MoreHorizontal,
} from 'lucide-react';
import { useRbacPermission } from '@/hooks/use-rbac-permission';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  department: string | null;
  position: string | null;
}

export default function UserManager() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>(
    'view'
  );

  // 权限检?
  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('usermgr.view');
  const canManage = hasPermission('usermgr.manage');
  const canDelete = hasPermission('usermgr.delete');

  // 筛选条?
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  // 批量操作相关状?
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('create');
  const [importResult, setImportResult] = useState<any>(null);

  // 获取用户数据
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: User[] = [
        {
          id: 'user_001',
          username: 'admin',
          email: 'admin@example.com',
          phone: '13800138000',
          role: 'admin',
          status: 'active',
          avatar_url: null,
          last_login: '2024-01-20T15:30:00Z',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          department: '技术部',
          position: '系统管理?,
        },
        {
          id: 'user_002',
          username: 'manager_zhang',
          email: 'zhang.manager@example.com',
          phone: '13800138001',
          role: 'manager',
          status: 'active',
          avatar_url: null,
          last_login: '2024-01-20T14:20:00Z',
          created_at: '2024-01-05T09:30:00Z',
          updated_at: '2024-01-18T16:45:00Z',
          department: '运营?,
          position: '运营经理',
        },
      ];

      setUsers(mockData);
      setFilteredUsers(mockData);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 应用筛?
  const applyFilters = () => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user?.includes(searchTerm) ||
          user?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  // 处理筛选变?
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 查看详情
  const handleView = (user: User) => {
    setSelectedUser(user);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  // 新增用户
  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  // 删除用户
  const handleDelete = (user: User) => {
    if (confirm(`确定要删除用?"${user.username}" 吗？此操作不可撤销！`)) {
      // 模拟删除操作
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('删除用户:', user.id)fetchUsers(); // 重新加载数据
    }
  };

  // 导出数据
  const handleExport = async (format: any: 'csv' | 'excel' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        filters: JSON.stringify(filters)
      });

      const response = await fetch(`/api/admin/users/export?${params}`);

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        alert('导出成功');
      } else {
        throw new Error('导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 导入数据
  const handleImport = async () => {
    if (!importFile) {
      alert('请选择要导入的文件');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('importType', importType);

      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        alert(`导入成功?{result.importedCount} 个用户导入成功，${result.failedCount} 个失败`);
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportResult(null);
        fetchUsers(); // 刷新用户列表
      } else {
        alert(`导入失败?{result.error}`);
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请重试');
    }
  };

  // 批量选择
  const toggleSelection = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(user => user.id));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的用户');
      return;
    }

    if (!confirm(`确定要删除选中?${selectedIds.length} 个用户吗？此操作不可撤销！`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          userIds: selectedIds
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedIds([]);
        fetchUsers();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败，请重试');
    }
  };

  // 批量更新状?
  const handleBatchUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      alert('请先选择要更新的用户');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          userIds: selectedIds,
          data: { status }
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedIds([]);
        fetchUsers();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('批量更新状态失?', error);
      alert('批量更新状态失败，请重?);
    }
  };

  // 批量分配角色
  const handleBatchAssignRole = async (role: string) => {
    if (selectedIds.length === 0) {
      alert('请先选择要分配角色的用户');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assign_role',
          userIds: selectedIds,
          data: { role }
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedIds([]);
        fetchUsers();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('批量分配角色失败:', error);
      alert('批量分配角色失败，请重试');
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchUsers();
  };

  // 角色标签渲染
  const renderRoleTag = (role: string) => {
    const roleConfig = {
      admin: {
        variant: 'default' as const,
        text: '管理?,
        color: 'bg-red-100 text-red-800',
      },
      manager: {
        variant: 'secondary' as const,
        text: '经理',
        color: 'bg-blue-100 text-blue-800',
      },
      staff: {
        variant: 'outline' as const,
        text: '员工',
        color: 'bg-green-100 text-green-800',
      },
      viewer: {
        variant: 'destructive' as const,
        text: '查看?,
        color: 'bg-gray-100 text-gray-800',
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      variant: 'secondary',
      text: role,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 状态标签渲?
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      active: {
        variant: 'default' as const,
        text: '活跃',
        color: 'bg-green-100 text-green-800',
      },
      inactive: {
        variant: 'secondary' as const,
        text: '非活?,
        color: 'bg-gray-100 text-gray-800',
      },
      suspended: {
        variant: 'destructive' as const,
        text: '已禁?,
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 获取角色选项
  const getRoleOptions = () => [
    { value: 'admin', label: '管理? },
    { value: 'manager', label: '经理' },
    { value: 'staff', label: '员工' },
    { value: 'viewer', label: '查看? },
  ];

  // 获取状态选项
  const getStatusOptions = () => [
    { value: 'active', label: '活跃' },
    { value: 'inactive', label: '非活? },
    { value: 'suspended', label: '已禁? },
  ];

  // 表格列定?
  const columns = [
    { key: 'username', title: '用户?, width: '120px' },
    { key: 'email', title: '邮箱', width: '200px' },
    { key: 'phone', title: '手机?, width: '120px' },
    { key: 'role', title: '角色', width: '100px' },
    { key: 'department', title: '部门', width: '120px' },
    { key: 'position', title: '职位', width: '120px' },
    { key: 'status', title: '状?, width: '100px' },
    { key: 'last_login', title: '最后登?, width: '160px' },
    { key: 'actions', title: '操作', width: '150px' },
  ];

  // 初始化数?
  useEffect(() => {
    fetchUsers();
  }, []);

  // 筛选变化时重新应用筛?
  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看用户管?/p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按?*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600 mt-1">管理系统用户账户和权限分?/p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新增用户
            </Button>
          )}
          {canManage && (
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              导入数据
            </Button>
          )}
          <div className="relative group">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出数据
              <MoreHorizontal className="w-4 h-4 ml-2" />
            </Button>
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleExport('csv')}
              >
                导出CSV
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleExport('excel')}
              >
                导出Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选面?*/}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选条?/CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索用户?邮箱/手机?
                className="pl-10"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>

            <Select
              value={filters.role}
              onValueChange={value => handleFilterChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部角色</SelectItem>
                {getRoleOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状? />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状?/SelectItem>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={applyFilters}>应用筛?/Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总用户数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              活跃用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              管理?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              今日登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                users.filter(
                  u =>
                    u.last_login &&
                    new Date(u.last_login).toDateString() ===
                      new Date().toDateString()
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            �?{filteredUsers.length} 个用?
            {selectedIds.length > 0 && (
              <span className="ml-2 text-blue-600">
                已选择 {selectedIds.length} �?
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '40px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="p-1"
                    >
                      {selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  {columns.map(column => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载?..
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSelection(user.id)}
                          className="p-1"
                        >
                          {selectedIds.includes(user.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{renderRoleTag(user.role)}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.position || '-'}</TableCell>
                      <TableCell>{renderStatusTag(user.status)}</TableCell>
                      <TableCell>
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString()
                          : '从未登录'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                )}
              </TableBody>
            </Table>
          </div>

          {/* 批量操作工具?*/}
          {selectedIds.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  已选择 {selectedIds.length} 个用?
                </div>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={handleBatchUpdateStatus}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="批量状? />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">设为活跃</SelectItem>
                      <SelectItem value="inactive">设为非活?/SelectItem>
                      <SelectItem value="suspended">设为禁用</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={handleBatchAssignRole}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="批量角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">设为管理?/SelectItem>
                      <SelectItem value="manager">设为经理</SelectItem>
                      <SelectItem value="staff">设为员工</SelectItem>
                      <SelectItem value="viewer">设为查看?/SelectItem>
                    </SelectContent>
                  </Select>

                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBatchDelete}
                      className="h-8 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      批量删除
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    className="h-8 text-xs"
                  >
                    取消选择
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情/编辑对话?*/}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view'
                ? '用户详情'
                : dialogMode === 'edit'
                  ? '编辑用户'
                  : '新增用户'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    用户?
                  </label>
                  <Input
                    value={selectedUser.username}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    邮箱
                  </label>
                  <Input
                    type="email"
                    value={selectedUser.email}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    手机?
                  </label>
                  <Input
                    value={selectedUser.phone || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    角色
                  </label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getRoleOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    部门
                  </label>
                  <Input
                    value={selectedUser.department || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    职位
                  </label>
                  <Input
                    value={selectedUser.position || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    状?
                  </label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    创建时间
                  </label>
                  <Input
                    value={new Date(selectedUser.created_at).toLocaleString()}
                    readOnly
                  />
                </div>
              </div>

              {selectedUser.last_login && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    最后登录时?
                  </label>
                  <Input
                    value={new Date(selectedUser.last_login).toLocaleString()}
                    readOnly
                  />
                </div>
              )}

              {dialogMode !== 'view' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button>{dialogMode === 'edit' ? '保存' : '创建'}</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 导入对话?*/}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入用户数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-2">选择文件</label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                支持 CSV �?Excel 格式文件
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">导入方式</label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">创建新用?/SelectItem>
                  <SelectItem value="update">更新现有用户</SelectItem>
                  <SelectItem value="sync">同步用户数据</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {importResult && (
              <div className="p-3 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2">导入结果?/h4>
                <p>成功导入: {importResult.importedCount} 个用?/p>
                <p>失败: {importResult.failedCount} �?/p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">错误详情:</p>
                    <ul className="text-sm text-red-600 list-disc pl-4">
                      {importResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              <Upload className="w-4 h-4 mr-2" />
              开始导?
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

