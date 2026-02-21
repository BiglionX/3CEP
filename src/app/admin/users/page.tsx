'use client';

import { AuthService, type UserRole } from '@/lib/auth-service';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  user_id: string | null;
  email: string | null;
  role: UserRole | null;
  sub_roles: string[] | null;
  status: 'active' | 'banned' | 'suspended' | null;
  is_active: boolean | null;
  banned_reason: string | null;
  banned_at: string | null;
  unbanned_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (useCache: boolean = true) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      if (selectedStatus) params.append('status', selectedStatus);

      // 添加缓存控制参数
      if (!useCache) {
        params.append('_t', Date.now().toString());
      }

      const startTime = performance.now();
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();
      const endTime = performance.now();

      if (result.success) {
        setUsers(result.data);
        // 记录查询性能
        if (typeof window !== 'undefined' && window.performance) {
          console.log(
            `[Performance] 用户列表加载耗时: ${(endTime - startTime).toFixed(
              2
            )}ms, 来自缓存: ${result.fromCache || false}`
          );
        }
      } else {
        console.error('加载用户列表失败:', result.error);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        setEditingUser(null);
        loadUsers();
      } else {
        console.error('更新用户失败:', result.error);
      }
    } catch (error) {
      console.error('更新用户失败:', error);
    }
  };

  const handleBatchAction = async (action: string, reason?: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
          reason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSelectedUsers([]);
        loadUsers();
      } else {
        console.error('批量操作失败:', result.error);
      }
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case 'active':
        return { text: '正常', color: 'green' };
      case 'banned':
        return { text: '已封禁', color: 'red' };
      case 'suspended':
        return { text: '已暂停', color: 'yellow' };
      default:
        return { text: '未知', color: 'gray' };
    }
  };

  const getRoleDisplay = (role: UserRole | null) => {
    if (!role) return '未设置';
    return AuthService.getRoleDisplayName(role);
  };

  // 应用本地过滤（如果需要的话）
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      !searchTerm ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            管理所有用户账户、角色分配和封禁操作
          </p>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900"
                placeholder="搜索邮箱或用户ID..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  // 防抖搜索 - 只在用户停止输入时触发
                  clearTimeout((window as any).searchTimeout);
                  (window as any).searchTimeout = setTimeout(() => {
                    loadUsers(false); // 搜索时不使用缓存
                  }, 500);
                }}
              />
            </div>

            {/* 角色筛选 */}
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
                loadUsers(); // 立即搜索
              }}
            >
              <option value="">所有角色</option>
              <option value="admin">超级管理员</option>
              <option value="content_reviewer">内容审核员</option>
              <option value="shop_reviewer">店铺审核员</option>
              <option value="finance">财务人员</option>
              <option value="viewer">查看者</option>
            </select>

            {/* 状态筛选 */}
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-900"
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                loadUsers(); // 立即搜索
              }}
            >
              <option value="">所有状态</option>
              <option value="active">正常</option>
              <option value="banned">已封禁</option>
              <option value="suspended">已暂停</option>
            </select>

            {/* 搜索按钮 */}
            <button
              onClick={loadUsers}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 用户表格 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  子角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 text-sm font-medium">
                            {(user.email || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email || '无邮箱'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.user_id
                            ? `ID: ${user.user_id.substring(0, 8)}...`
                            : '未关联用户'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.sub_roles && user.sub_roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.sub_roles.map((subRole, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {subRole}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'banned'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-2 w-2 rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-400'
                            : user.status === 'banned'
                            ? 'bg-red-400'
                            : 'bg-yellow-400'
                        }`}
                      ></span>
                      {getStatusDisplay(user.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要封禁此用户吗？')) {
                            handleUpdateUser(user.id, {
                              status: 'banned',
                              banned_reason: '管理员手动封禁',
                            });
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.status === 'banned'}
                      >
                        封禁
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.32M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                没有找到用户
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? '请尝试其他搜索关键词'
                  : '还没有创建任何管理员用户'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              已选择 {selectedUsers.length} 个用户
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const reason = prompt('请输入封禁原因:');
                  if (reason !== null) {
                    handleBatchAction('ban', reason);
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                批量封禁
              </button>
              <button
                onClick={() => handleBatchAction('unban')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                批量解封
              </button>
              <button
                onClick={() => handleBatchAction('activate')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                批量激活
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户模态框 */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}
    </div>
  );
}

// 创建用户模态框组件
function CreateUserModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await onSubmit({ email, role });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    添加管理员用户
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        邮箱地址
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="请输入邮箱地址"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        用户角色
                      </label>
                      <select
                        id="role"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
                      >
                        <option value="viewer">查看者</option>
                        <option value="content_reviewer">内容审核员</option>
                        <option value="shop_reviewer">店铺审核员</option>
                        <option value="finance">财务人员</option>
                        <option value="admin">超级管理员</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? '创建中...' : '创建用户'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 编辑用户模态框组件
function EditUserModal({
  user,
  onClose,
  onSubmit,
}: {
  user: User;
  onClose: () => void;
  onSubmit: (userId: string, updates: Partial<User>) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role || 'viewer');
  const [subRoles, setSubRoles] = useState<string>(
    user.sub_roles?.join(',') || ''
  );
  const [status, setStatus] = useState<string>(user.status || 'active');
  const [bannedReason, setBannedReason] = useState<string>(
    user.banned_reason || ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates: any = {
        role,
        sub_roles: subRoles
          ? subRoles
              .split(',')
              .map(s => s.trim())
              .filter(s => s)
          : [],
        status,
      };

      if (status === 'banned' && bannedReason) {
        updates.banned_reason = bannedReason;
      }

      await onSubmit(user.id, updates);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    编辑用户
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {user.email || '无邮箱'} (
                    {user.user_id ? user.user_id.substring(0, 8) : '无ID'})
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="edit-email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        邮箱地址
                      </label>
                      <input
                        type="email"
                        id="edit-email"
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500"
                        value={user.email || '未设置'}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        用户角色
                      </label>
                      <select
                        id="edit-role"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
                      >
                        <option value="viewer">查看者</option>
                        <option value="content_reviewer">内容审核员</option>
                        <option value="shop_reviewer">店铺审核员</option>
                        <option value="finance">财务人员</option>
                        <option value="admin">超级管理员</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="edit-sub-roles"
                        className="block text-sm font-medium text-gray-700"
                      >
                        子角色（逗号分隔）
                      </label>
                      <input
                        type="text"
                        id="edit-sub-roles"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={subRoles}
                        onChange={e => setSubRoles(e.target.value)}
                        placeholder="如: shop_owner,content_creator"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-status"
                        className="block text-sm font-medium text-gray-700"
                      >
                        用户状态
                      </label>
                      <select
                        id="edit-status"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                      >
                        <option value="active">正常</option>
                        <option value="banned">已封禁</option>
                        <option value="suspended">已暂停</option>
                      </select>
                    </div>

                    {status === 'banned' && (
                      <div>
                        <label
                          htmlFor="edit-banned-reason"
                          className="block text-sm font-medium text-gray-700"
                        >
                          封禁原因
                        </label>
                        <textarea
                          id="edit-banned-reason"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={bannedReason}
                          onChange={e => setBannedReason(e.target.value)}
                          placeholder="请输入封禁原因..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存用户信息'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
