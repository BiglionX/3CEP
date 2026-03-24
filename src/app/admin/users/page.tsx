'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VirtualList } from '@/components/VirtualList';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOperation } from '@/hooks/use-operation';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import {
  Building,
  CheckCircle,
  Edit2,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserAccount {
  id: string;
  user_id: string;
  user_type:
    | 'individual'
    | 'repair_shop'
    | 'enterprise'
    | 'foreign_trade_company';
  account_type: string;
  email: string;
  phone?: string | null;
  status: 'pending' | 'active' | 'suspended' | 'closed' | 'rejected';
  is_verified: boolean;
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected';
  subscription_plan: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_users: number;
  by_type: {
    individual: number;
    repair_shop: number;
    enterprise: number;
    foreign_trade: number;
  };
}

export default function MultiTypeUserManagementPage() {
  const { hasPermission } = useRbacPermission();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filters, setFilters] = useState({
    user_type: 'all',
    account_type: 'all',
    status: 'all',
    verification_status: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // 使用统一的加载操作 Hook
  const loadUsersOp = useOperation({
    successMessage: undefined, // 加载数据不显示成功提示
    errorMessage: '加载用户数据失败',
    showToast: false,
  });

  // 使用统一的删除操作 Hook
  const deleteUserOp = useOperation({
    successMessage: '用户删除成功',
    errorMessage: '删除用户失败',
    onSuccess: () => {
      // 删除成功后重新加载数据
      loadUsers();
    },
  });

  // 检查权限
  const canView = hasPermission('usermgr.view');
  const canManage = hasPermission('usermgr.manage');

  // 加载用户数据
  const loadUsers = async () => {
    await loadUsersOp.execute(async () => {
      setLoading(true);
      try {
        // 构建查询参数
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          pageSize: pagination.pageSize.toString(),
        });

        if (filters.user_type !== 'all') {
          params.append('user_type', filters.user_type);
        }
        if (filters.account_type !== 'all') {
          params.append('account_type', filters.account_type);
        }
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }
        if (filters.verification_status !== 'all') {
          params.append('verification_status', filters.verification_status);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }

        // TODO: 替换为实际 API 调用
        // const response = await fetch(`/api/admin/user-management?${params}`);
        // const data = await response.json();

        // 模拟数据
        const mockData: UserAccount[] = [
          {
            id: '1',
            user_id: 'user-1',
            user_type: 'individual',
            account_type: 'individual',
            email: 'user1@example.com',
            phone: '13800138001',
            status: 'active',
            is_verified: true,
            verification_status: 'verified',
            subscription_plan: 'free',
            role: 'viewer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            user_id: 'user-2',
            user_type: 'repair_shop',
            account_type: 'repair_shop',
            email: 'shop1@example.com',
            phone: '13800138002',
            status: 'active',
            is_verified: true,
            verification_status: 'verified',
            subscription_plan: 'professional',
            role: 'shop_manager',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '3',
            user_id: 'user-3',
            user_type: 'enterprise',
            account_type: 'factory',
            email: 'factory1@example.com',
            phone: '13800138003',
            status: 'pending',
            is_verified: false,
            verification_status: 'under_review',
            subscription_plan: 'enterprise',
            role: 'manager',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '4',
            user_id: 'user-4',
            user_type: 'foreign_trade_company',
            account_type: 'foreign_trade',
            email: 'trade1@example.com',
            phone: '13800138004',
            status: 'active',
            is_verified: true,
            verification_status: 'verified',
            subscription_plan: 'enterprise',
            role: 'manager',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        setUsers(mockData);
        setPagination(prev => ({ ...prev, total: mockData.length }));

        // 模拟统计数据
        setStats({
          total_users: 4,
          by_type: {
            individual: 1,
            repair_shop: 1,
            enterprise: 1,
            foreign_trade: 1,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console -- 记录数据加载失败的错误信息
        console.error('加载用户数据失败:', error);
        throw error; // 让 useOperation 捕获错误
      } finally {
        setLoading(false);
      }
    });
  };
  // 加载统计数据
  const loadStats = async () => {
    try {
      // TODO: 替换为实际 API 调用
      // const response = await fetch('/api/admin/user-management/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      // eslint-disable-next-line no-console -- 记录统计数据加载失败的错误信息
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    if (canView) {
      loadUsers();
      loadStats();
    }
  }, []);

  // 应用筛选
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      user_type: 'all',
      account_type: 'all',
      status: 'all',
      verification_status: 'all',
      search: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 获取用户类型图标
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'individual':
        return <User className="w-4 h-4" />;
      case 'repair_shop':
        return <Store className="w-4 h-4" />;
      case 'enterprise':
      case 'foreign_trade_company':
        return <Building className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // 获取用户类型显示文本
  const getUserTypeLabel = (userType: string) => {
    const labels: Record<string, string> = {
      individual: '个人用户',
      repair_shop: '维修店',
      enterprise: '企业用户',
      foreign_trade_company: '外贸公司',
    };
    return labels[userType] || userType;
  };

  // 获取账户类型显示文本
  const getAccountTypeLabel = (accountType: string) => {
    const labels: Record<string, string> = {
      individual: '个人',
      repair_shop: '维修店',
      factory: '工厂',
      supplier: '供应商',
      distributor: '分销商',
      retailer: '零售商',
      enterprise: '企业',
      foreign_trade: '外贸',
    };
    return labels[accountType] || accountType;
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      active: 'default',
      pending: 'secondary',
      suspended: 'destructive',
      closed: 'outline',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      active: '活跃',
      pending: '待审核',
      suspended: '已暂停',
      closed: '已关闭',
      rejected: '已拒绝',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // 获取认证状态标签
  const getVerificationBadge = (
    isVerified: boolean,
    verificationStatus: string
  ) => {
    if (isVerified) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          已认证
        </Badge>
      );
    }

    if (verificationStatus === 'under_review') {
      return (
        <Badge variant="secondary" className="bg-blue-600">
          审核中
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <XCircle className="w-3 h-3 mr-1" />
        未认证
      </Badge>
    );
  };

  // 获取订阅计划标签
  const getSubscriptionBadge = (plan: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'outline' | 'destructive'
    > = {
      free: 'outline',
      basic: 'secondary',
      professional: 'default',
      enterprise: 'destructive',
    };
    const labels: Record<string, string> = {
      free: '免费版',
      basic: '基础版',
      professional: '专业版',
      enterprise: '企业版',
    };
    return (
      <Badge variant={variants[plan] || 'outline'}>
        {labels[plan] || plan}
      </Badge>
    );
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看用户管理</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">多类型用户管理</h1>
          <p className="text-gray-600 mt-1">
            统一管理 C 端用户、维修店、贸易公司和企业用户
          </p>
        </div>
        <Button onClick={() => loadUsers()} disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          刷新数据
        </Button>
      </div>

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
              {stats?.total_users || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              个人用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.by_type.individual || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              维修店
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.by_type.repair_shop || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              企业用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(stats?.by_type.enterprise || 0) +
                (stats?.by_type.foreign_trade || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>根据用户类型、状态等条件进行筛选</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索邮箱或手机"
                className="pl-10"
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                onKeyPress={e => e.key === 'Enter' && applyFilters()}
              />
            </div>

            <Select
              value={filters.user_type}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, user_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="individual">个人用户</SelectItem>
                <SelectItem value="repair_shop">维修店</SelectItem>
                <SelectItem value="enterprise">企业用户</SelectItem>
                <SelectItem value="foreign_trade_company">外贸公司</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.account_type}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, account_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="账户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部账户</SelectItem>
                <SelectItem value="individual">个人</SelectItem>
                <SelectItem value="repair_shop">维修店</SelectItem>
                <SelectItem value="factory">工厂</SelectItem>
                <SelectItem value="supplier">供应商</SelectItem>
                <SelectItem value="enterprise">企业</SelectItem>
                <SelectItem value="foreign_trade">外贸</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="suspended">已暂停</SelectItem>
                <SelectItem value="closed">已关闭</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.verification_status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, verification_status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="认证状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部认证</SelectItem>
                <SelectItem value="verified">已认证</SelectItem>
                <SelectItem value="under_review">审核中</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              重置
            </Button>
            <Button onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              应用筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            共 {pagination.total} 个用户
            {loading && '，加载中...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户类型</TableHead>
                  <TableHead>账户类型</TableHead>
                  <TableHead>邮箱/手机</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>订阅计划</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>认证状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  {canManage && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 9 : 8}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 9 : 8}
                      className="text-center py-8"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  // SCROLL-002: 使用虚拟滚动优化性能
                  <VirtualList
                    items={users}
                    itemSize={60} // 每行高度约 60px
                    height={Math.min(600, users.length * 60)} // 最大 600px 高度
                    renderItem={(user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getUserTypeIcon(user.user_type)}
                            <span>{getUserTypeLabel(user.user_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getAccountTypeLabel(user.account_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.email}</div>
                            {user.phone && (
                              <div className="text-gray-500 text-xs">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user.subscription_plan)}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {getVerificationBadge(
                            user.is_verified,
                            user.verification_status
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteUserOp.execute(async () => {
                                    // eslint-disable-next-line no-console -- 临时日志：删除用户操作（待替换为实际 API 调用）
                                    console.log('删除用户:', user.id);
                                  })
                                }
                                disabled={deleteUserOp.isLoading}
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  />
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              第 {pagination.page} 页，共{' '}
              {Math.ceil(pagination.total / pagination.pageSize)} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
