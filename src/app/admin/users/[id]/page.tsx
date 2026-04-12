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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  CreditCard,
  Edit2,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Shield,
  Store,
  User,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserDetail {
  id: string;
  user_id: string;
  user_type: string;
  account_type: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: string;
  is_verified: boolean;
  verification_status: string;
  subscription_plan: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  // 扩展信息
  company_name?: string;
  shop_name?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  metadata?: any;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useRbacPermission();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);

  const canView = hasPermission('usermgr.view');
  const canManage = hasPermission('usermgr.manage');

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    // 获取用户详情
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/user-management/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setUser(data.data);
        } else {
          console.error('获取用户详情失败:', data.error);
        }
      } catch (error) {
        console.error('获取用户详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [params.id, canView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">用户不存在</h1>
          <p className="text-gray-600 mb-4">
            该用户可能已被删除或您没有权限查看
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  const getUserTypeIcon = () => {
    switch (user.user_type) {
      case 'individual':
        return <User className="w-6 h-6" />;
      case 'repair_shop':
        return <Store className="w-6 h-6" />;
      case 'enterprise':
      case 'foreign_trade_company':
        return <Building className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getStatusBadge = () => {
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
      <Badge variant={variants[user.status] || 'outline'}>
        {labels[user.status] || user.status}
      </Badge>
    );
  };

  const getVerificationBadge = () => {
    if (user.is_verified) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          已认证
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

  return (
    <div className="space-y-6 p-6">
      {/* 头部导航 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            {getUserTypeIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.company_name || user.shop_name || user.email}
            </h1>
            <p className="text-sm text-gray-600">
              {user.user_type === 'enterprise'
                ? '企业用户'
                : user.user_type === 'repair_shop'
                  ? '维修店'
                  : '个人用户'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {canManage && (
            <>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>用户的基本账户信息</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">用户 ID</div>
            <div className="font-mono text-sm">{user.id}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">邮箱</div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{user.email}</span>
            </div>
          </div>

          {user.phone && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">手机</div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm text-gray-500">用户类型</div>
            <Badge variant="outline">
              {user.user_type === 'enterprise'
                ? '企业用户'
                : user.user_type === 'repair_shop'
                  ? '维修店'
                  : '个人用户'}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">账户类型</div>
            <Badge variant="outline">{user.account_type}</Badge>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">角色</div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">状态</div>
            {getStatusBadge()}
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">认证状态</div>
            {getVerificationBadge()}
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">订阅计划</div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <Badge variant="outline">{user.subscription_plan}</Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-500">注册时间</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(user.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {user.last_login_at && (
            <div className="space-y-1">
              <div className="text-sm text-gray-500">最后登录</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {new Date(user.last_login_at).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab 页签 */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">详细信息</TabsTrigger>
          <TabsTrigger value="metadata">元数据</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>详细信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.company_name && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">公司名称</div>
                    <div className="font-medium">{user.company_name}</div>
                  </div>
                </div>
              )}

              {user.address && (
                <div>
                  <div className="text-sm text-gray-500">地址</div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                </div>
              )}

              {user.metadata && Object.keys(user.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-500 mb-2">行业信息</div>
                    <div className="grid grid-cols-2 gap-4">
                      {user.metadata.industry && (
                        <div>
                          <div className="text-sm text-gray-500">行业</div>
                          <div className="font-medium">
                            {user.metadata.industry}
                          </div>
                        </div>
                      )}
                      {user.metadata.employee_count && (
                        <div>
                          <div className="text-sm text-gray-500">员工人数</div>
                          <div className="font-medium">
                            {user.metadata.employee_count}
                          </div>
                        </div>
                      )}
                      {user.metadata.annual_revenue && (
                        <div>
                          <div className="text-sm text-gray-500">年营业额</div>
                          <div className="font-medium">
                            {user.metadata.annual_revenue}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>元数据</CardTitle>
              <CardDescription>用户的扩展信息和自定义字段</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(user.metadata || {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>用户的操作记录和历史</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">暂无操作日志</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
