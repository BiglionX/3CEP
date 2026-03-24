/**
 * 用户表格组件 - 支持排序、分页、筛选
 */

'use client';

import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Shield, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserTableProps {
  data: User[];
  loading?: boolean;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onRoleChange?: (user: User) => void;
  enableBatchOperations?: boolean;
  pageSize?: number;
}

export function UserTable({
  data,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onRoleChange,
  enableBatchOperations = true,
  pageSize = 10,
}: UserTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 状态徽章
  const getStatusBadge = (status: User['status']) => {
    const badges = {
      pending: <Badge variant="secondary">待审核</Badge>,
      active: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          正常
        </Badge>
      ),
      suspended: (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          已暂停
        </Badge>
      ),
      closed: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          已关闭
        </Badge>
      ),
    };
    return badges[status];
  };

  // 验证状态徽章
  const getVerificationBadge = (status: User['verification_status']) => {
    const badges = {
      pending: <Badge variant="outline">待验证</Badge>,
      under_review: <Badge variant="outline">审核中</Badge>,
      verified: (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          已验证
        </Badge>
      ),
      rejected: (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          已拒绝
        </Badge>
      ),
    };
    return badges[status];
  };

  // 列定义
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: '姓名',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'email',
      label: '邮箱',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'phone',
      label: '手机',
      sortable: true,
      mobile: { show: false },
    },
    {
      key: 'role',
      label: '角色',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'status',
      label: '状态',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (_, item) => getStatusBadge(item.status),
      },
    },
    {
      key: 'verification_status',
      label: '验证',
      sortable: true,
      mobile: {
        show: true,
        priority: 3,
        render: (_, item) => getVerificationBadge(item.verification_status),
      },
    },
    {
      key: 'created_at',
      label: '创建时间',
      sortable: true,
      mobile: { show: false },
    },
  ];

  // 行操作
  const rowActions = [
    {
      icon: Eye,
      label: '查看',
      onClick: onView || (() => {}),
      color: 'text-blue-600',
    },
    {
      icon: Edit,
      label: '编辑',
      onClick: onEdit || (() => {}),
      color: 'text-green-600',
    },
    {
      icon: Shield,
      label: '角色',
      onClick: onRoleChange || (() => {}),
      color: 'text-purple-600',
    },
    {
      icon: Trash2,
      label: '删除',
      onClick: onDelete || (() => {}),
      color: 'text-red-600',
    },
  ];

  // 筛选和搜索
  const filteredData = useMemo(() => {
    return data.filter(user => {
      // 状态筛选
      if (filterStatus !== 'all' && user.status !== filterStatus) return false;

      // 角色筛选
      if (filterRole !== 'all' && user.role !== filterRole) return false;

      // 搜索
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.phone?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [data, filterStatus, filterRole, searchTerm]);

  return (
    <DataTableMobile
      columns={columns}
      data={filteredData}
      loading={loading}
      rowActions={rowActions}
      enableBatchOperations={enableBatchOperations}
      emptyMessage="暂无用户数据"
      pageSize={pageSize}
      filters={{
        status: {
          value: filterStatus,
          onChange: setFilterStatus,
          options: [
            { label: '全部状态', value: 'all' },
            { label: '待审核', value: 'pending' },
            { label: '正常', value: 'active' },
            { label: '已暂停', value: 'suspended' },
            { label: '已关闭', value: 'closed' },
          ],
        },
        role: {
          value: filterRole,
          onChange: setFilterRole,
          options: [
            { label: '全部角色', value: 'all' },
            { label: '普通用户', value: 'user' },
            { label: '管理员', value: 'admin' },
            { label: '超级管理员', value: 'super_admin' },
          ],
        },
        search: {
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: '搜索姓名、邮箱、手机号...',
        },
      }}
    />
  );
}

export default UserTable;
