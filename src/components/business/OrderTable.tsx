/**
 * 订单表格组件 - 支持展开详情
 */

'use client';

import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
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
  items?: OrderItem[];
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderTableProps {
  data: Order[];
  loading?: boolean;
  onView?: (order: Order) => void;
  onShip?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onRefund?: (order: Order) => void;
  enableBatchOperations?: boolean;
  pageSize?: number;
}

export function OrderTable({
  data,
  loading = false,
  onView,
  onShip,
  onCancel,
  onRefund,
  enableBatchOperations = true,
  pageSize = 10,
}: OrderTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // 状态徽章
  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          待处理
        </Badge>
      ),
      processing: (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          处理中
        </Badge>
      ),
      shipped: (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          已发货
        </Badge>
      ),
      delivered: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          已送达
        </Badge>
      ),
      cancelled: (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          已取消
        </Badge>
      ),
      refunded: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          已退款
        </Badge>
      ),
    };
    return badges[status];
  };

  // 切换展开状态
  const toggleExpand = (orderId: string) => {
    const newSet = new Set(expandedRowIds);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    setExpandedRowIds(newSet);
  };

  // 列定义
  const columns: Column<Order>[] = [
    {
      key: 'order_no',
      label: '订单号',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'customer_name',
      label: '客户',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'shop_name',
      label: '店铺',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'total_amount',
      label: '金额',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (value: number) => `¥${value.toFixed(2)}`,
      },
    },
    {
      key: 'items_count',
      label: '商品数',
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
      key: 'created_at',
      label: '下单时间',
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
      icon: Truck,
      label: '发货',
      onClick: onShip || (() => {}),
      color: 'text-green-600',
      show: (order: Order) => order.status === 'processing',
    },
    {
      icon: RotateCcw,
      label: '取消',
      onClick: onCancel || (() => {}),
      color: 'text-orange-600',
      show: (order: Order) =>
        order.status === 'pending' || order.status === 'processing',
    },
    {
      icon: XCircle,
      label: '退款',
      onClick: onRefund || (() => {}),
      color: 'text-red-600',
      show: (order: Order) =>
        ['paid', 'shipped', 'delivered'].includes(order.status),
    },
  ];

  // 渲染展开的详情
  const renderExpandedContent = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">暂无商品详情</p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          商品清单 ({order.items.length}件)
        </h4>
        <div className="space-y-2">
          {order.items.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center p-2 bg-white rounded border"
            >
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  单价：¥{item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">¥{item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="font-semibold">订单总额:</span>
          <span className="text-lg font-bold text-green-600">
            ¥{order.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <DataTableMobile
      columns={columns}
      data={data}
      loading={loading}
      rowActions={rowActions}
      enableBatchOperations={enableBatchOperations}
      emptyMessage="暂无订单数据"
      pageSize={pageSize}
      expandable={{
        isExpanded: order => expandedRowIds.has(order.id),
        onToggle: order => toggleExpand(order.id),
        renderContent: renderExpandedContent,
        expandIcon: order =>
          expandedRowIds.has(order.id) ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          ),
      }}
      filters={{
        status: {
          value: 'all',
          onChange: () => {},
          options: [
            { label: '全部状态', value: 'all' },
            { label: '待处理', value: 'pending' },
            { label: '处理中', value: 'processing' },
            { label: '已发货', value: 'shipped' },
            { label: '已送达', value: 'delivered' },
            { label: '已取消', value: 'cancelled' },
            { label: '已退款', value: 'refunded' },
          ],
        },
      }}
    />
  );
}

export default OrderTable;
