/**
 * 店铺管理响应式页面
 * 使用 AdminMobileLayout + DataTableMobile 重构
 */

'use client';

import { OperationButton } from '@/components/business/OperationFeedback';
import {
  StatCardMobile,
  StatGridMobile,
} from '@/components/cards/StatCardMobile';
import { AdminMobileLayout } from '@/components/layouts/AdminMobileLayout';
import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOperation } from '@/hooks/use-operation';
import {
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  Star,
  Store,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Shop {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  rating: number;
  review_count: number;
  created_at: string;
}

export default function ResponsiveShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
  });

  // 加载数据操作
  const loadShopsOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载店铺数据失败',
    showToast: false,
  });

  // 删除操作
  const deleteShopOp = useOperation({
    successMessage: '店铺删除成功',
    errorMessage: '删除失败',
    onSuccess: () => loadShops(),
  });

  // 审核操作
  const approveShopOp = useOperation({
    successMessage: '店铺审核通过',
    errorMessage: '审核失败',
    onSuccess: () => loadShops(),
  });

  const loadShops = async () => {
    await loadShopsOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/shops');
        const result = await response.json();

        if (result.success) {
          setShops(result.data.shops || []);
          setStats({
            total: result.data.shops?.length || 0,
            active:
              result.data.shops?.filter((s: any) => s.status === 'active')
                .length || 0,
            pending:
              result.data.shops?.filter((s: any) => s.status === 'pending')
                .length || 0,
            rejected:
              result.data.shops?.filter((s: any) => s.status === 'rejected')
                .length || 0,
          });
        }
      } catch (error) {
        console.error('加载店铺数据失败:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    loadShops();
  }, []);

  // 处理删除
  const handleDelete = async (shopId: string) => {
    await deleteShopOp.execute(async () => {
      await fetch(`/api/admin/shops/${shopId}`, { method: 'DELETE' });
    });
  };

  // 处理审核
  const handleApprove = async (shopId: string) => {
    await approveShopOp.execute(async () => {
      await fetch(`/api/admin/shops/${shopId}/approve`, { method: 'POST' });
    });
  };

  // 状态徽章
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      active: '营业中',
      pending: '待审核',
      rejected: '已拒绝',
      suspended: '已暂停',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // 评分组件
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // 表格列定义
  const columns: Column<Shop>[] = [
    {
      key: 'name',
      title: '店铺名称',
      dataIndex: 'name',
      sortable: true,
    },
    {
      key: 'contact_person',
      title: '联系人',
      dataIndex: 'contact_person',
      hideOnMobile: true,
    },
    {
      key: 'phone',
      title: '联系电话',
      dataIndex: 'phone',
      hideOnMobile: true,
    },
    {
      key: 'status',
      title: '状态',
      render: shop => <StatusBadge status={shop.status} />,
    },
    {
      key: 'rating',
      title: '评分',
      render: shop => <RatingStars rating={shop.rating} />,
      sortable: true,
    },
    {
      key: 'review_count',
      title: '评价数',
      dataIndex: 'review_count',
      hideOnMobile: true,
      sortable: true,
    },
    {
      key: 'created_at',
      title: '创建时间',
      dataIndex: 'created_at',
      hideOnMobile: true,
      render: shop => new Date(shop.created_at).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      render: shop => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/shops/${shop.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4" />
          </Button>
          {shop.status === 'pending' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleApprove(shop.id)}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(shop.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminMobileLayout title="店铺管理">
      <div className="space-y-6">
        {/* 统计卡片 */}
        <StatGridMobile columns={2}>
          <StatCardMobile
            title="总店铺数"
            value={stats.total}
            icon={<Store />}
            color="blue"
          />
          <StatCardMobile
            title="营业中"
            value={stats.active}
            icon={<CheckCircle />}
            color="green"
          />
          <StatCardMobile
            title="待审核"
            value={stats.pending}
            icon={<Clock />}
            color="yellow"
          />
          <StatCardMobile
            title="已拒绝"
            value={stats.rejected}
            icon={<XCircle />}
            color="red"
          />
        </StatGridMobile>

        {/* 数据表格 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">店铺列表</h3>
            <Button onClick={loadShops} disabled={loading} size="sm">
              刷新
            </Button>
          </div>

          <DataTableMobile
            data={shops}
            columns={columns}
            rowKey="id"
            showSearch
            searchPlaceholder="搜索店铺名称、联系人..."
            loading={loading}
            emptyText="暂无店铺数据"
            pageSize={10}
            onRowClick={shop => router.push(`/admin/shops/${shop.id}`)}
          />
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <OperationButton
              buttonText="添加店铺"
              onClick={async () => router.push('/admin/shops/new')}
              className="w-full min-h-[48px]"
            />
            <OperationButton
              buttonText="批量审核"
              onClick={async () => {
                /* TODO: 批量审核逻辑 */
              }}
              className="w-full min-h-[48px]"
              requireConfirm
              confirmTitle="批量审核"
              confirmDescription="将审核所有待审核的店铺"
            />
          </div>
        </div>
      </div>
    </AdminMobileLayout>
  );
}
