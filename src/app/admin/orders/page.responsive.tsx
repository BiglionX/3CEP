/**
 * 订单管理响应式页面
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
import { useBatchOperation, useOperation } from '@/hooks/use-operation';
import {
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Package,
  RotateCcw,
  Trash2,
  Truck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  shop_name: string;
  total_amount: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  items_count: number;
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
}

export default function ResponsiveOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  // 加载数据操作
  const loadOrdersOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载订单数据失败',
    showToast: false,
  });

  // 删除操作
  const deleteOrderOp = useOperation({
    successMessage: '订单删除成功',
    errorMessage: '删除失败',
    onSuccess: () => loadOrders(),
  });

  // 取消订单操作
  const cancelOrderOp = useOperation({
    successMessage: '订单已取消',
    errorMessage: '取消失败',
    onSuccess: () => loadOrders(),
  });

  // 批量操作
  const batchDeleteOp = useBatchOperation({
    successMessage: '批量删除完成',
    continueOnError: true,
    onSuccess: () => loadOrders(),
  });

  const loadOrders = async () => {
    await loadOrdersOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/orders');
        const result = await response.json();

        if (result.success) {
          const ordersData = result.data.orders || [];
          setOrders(ordersData);
          setStats({
            total: ordersData.length,
            pending: ordersData.filter((o: any) => o.status === 'pending')
              .length,
            processing: ordersData.filter((o: any) => o.status === 'processing')
              .length,
            shipped: ordersData.filter((o: any) => o.status === 'shipped')
              .length,
            delivered: ordersData.filter((o: any) => o.status === 'delivered')
              .length,
            cancelled: ordersData.filter((o: any) => o.status === 'cancelled')
              .length,
            totalAmount: ordersData.reduce(
              (sum: number, o: any) => sum + o.total_amount,
              0
            ),
          });
        }
      } catch (error) {
        console.error('加载订单数据失败:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 处理删除
  const handleDelete = async (orderId: string) => {
    await deleteOrderOp.execute(async () => {
      await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
    });
  };

  // 处理取消
  const handleCancel = async (orderId: string) => {
    await cancelOrderOp.execute(async () => {
      await fetch(`/api/admin/orders/${orderId}/cancel`, { method: 'POST' });
    });
  };

  // 状态徽章
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      pending: '待付款',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // 金额格式化
  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  // 表格列定义
  const columns: Column<Order>[] = [
    {
      key: 'order_no',
      title: '订单号',
      dataIndex: 'order_no',
      sortable: true,
    },
    {
      key: 'customer_name',
      title: '客户姓名',
      dataIndex: 'customer_name',
      hideOnMobile: true,
    },
    {
      key: 'shop_name',
      title: '店铺名称',
      dataIndex: 'shop_name',
      hideOnMobile: true,
    },
    {
      key: 'status',
      title: '订单状态',
      render: order => <StatusBadge status={order.status} />,
    },
    {
      key: 'total_amount',
      title: '订单金额',
      render: order => (
        <span className="font-semibold text-green-600">
          {formatAmount(order.total_amount)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'items_count',
      title: '商品数量',
      dataIndex: 'items_count',
      hideOnMobile: true,
    },
    {
      key: 'created_at',
      title: '下单时间',
      dataIndex: 'created_at',
      render: order => new Date(order.created_at).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      render: order => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {order.status === 'pending' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleCancel(order.id)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(order.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminMobileLayout title="订单管理">
      <div className="space-y-6">
        {/* 统计卡片 */}
        <StatGridMobile columns={2}>
          <StatCardMobile
            title="总订单数"
            value={stats.total.toLocaleString()}
            icon={<Package />}
            color="blue"
          />
          <StatCardMobile
            title="待付款"
            value={stats.pending}
            icon={<Clock />}
            color="yellow"
          />
          <StatCardMobile
            title="处理中"
            value={stats.processing}
            icon={<Truck />}
            color="purple"
          />
          <StatCardMobile
            title="已完成"
            value={stats.delivered}
            icon={<CheckCircle />}
            color="green"
          />
          <StatCardMobile
            title="总销售额"
            value={formatAmount(stats.totalAmount)}
            icon={<DollarSign />}
            color="orange"
          />
          <StatCardMobile
            title="已取消"
            value={stats.cancelled}
            icon={<XCircle />}
            color="red"
          />
        </StatGridMobile>

        {/* 数据表格 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">订单列表</h3>
            <Button onClick={loadOrders} disabled={loading} size="sm">
              刷新
            </Button>
          </div>

          <DataTableMobile
            data={orders}
            columns={columns}
            rowKey="id"
            showSearch
            searchPlaceholder="搜索订单号、客户姓名..."
            loading={loading}
            emptyText="暂无订单数据"
            pageSize={10}
            onRowClick={order => router.push(`/admin/orders/${order.id}`)}
          />
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <OperationButton
              buttonText="创建订单"
              onClick={async () => router.push('/admin/orders/new')}
              className="w-full min-h-[48px]"
            />
            <OperationButton
              buttonText="导出订单"
              onClick={async () => {
                // TODO: 导出逻辑
              }}
              className="w-full min-h-[48px]"
            />
          </div>
        </div>

        {/* 批量操作 */}
        {batchDeleteOp.isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                批量删除中：{batchDeleteOp.progress.completed}/
                {batchDeleteOp.progress.total}
              </span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </AdminMobileLayout>
  );
}
