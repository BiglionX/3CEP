'use client';

import { useEffect, useState } from 'react';

interface PendingOrder {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  license_type: string;
  total_amount: number;
  status: string;
  payment_status: string;
  is_delivered: boolean;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function OrderDeliveryPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/orders/deliver');
      const result = await res.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('获取待交付订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    if (!confirm(`确定要手动交付订单 ${orderId} 吗？`)) return;

    setProcessing(orderId);
    try {
      const res = await fetch('/api/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const result = await res.json();

      if (result.success) {
        alert(`订单 ${orderId} 交付成功！`);
        fetchPendingOrders();
      } else {
        alert(`交付失败：${result.error.message}`);
      }
    } catch (error) {
      console.error('交付失败:', error);
      alert('交付失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchDeliver = async () => {
    if (!confirm(`确定要批量交付所有 ${orders.length} 个待交付订单吗？`))
      return;

    setProcessing('batch');
    try {
      const res = await fetch('/api/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchMode: true }),
      });

      const result = await res.json();

      if (result.success) {
        alert(
          `批量处理完成！\n总计：${result.data.total}\n成功：${result.data.success}\n失败：${result.data.failed}`
        );
        fetchPendingOrders();
      } else {
        alert(`批量处理失败：${result.error.message}`);
      }
    } catch (error) {
      console.error('批量处理失败:', error);
      alert('批量处理失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="container mx-auto p-6">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">订单交付管理</h1>
        <p className="text-gray-600">
          查看和处理待交付订单，支持单个和批量交付
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">待交付订单数</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {orders.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">总金额</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(
              orders.reduce((sum, order) => sum + order.total_amount, 0)
            )}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">最早订单时间</h3>
          <p className="text-lg font-semibold mt-2">
            {orders.length > 0
              ? formatDate(orders[orders.length - 1].created_at)
              : '-'}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            共有{' '}
            <span className="font-semibold text-indigo-600">
              {orders.length}
            </span>{' '}
            个订单待交付
          </p>
          <button
            onClick={handleBatchDeliver}
            disabled={orders.length === 0 || processing === 'batch'}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
          >
            {processing === 'batch' ? '处理中...' : '批量交付全部订单'}
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">待交付订单列表</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm font-medium">没有待交付的订单</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    智能体
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    许可证类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    下单时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.profiles?.full_name || order.user_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.profiles?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.agent_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.license_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeliverOrder(order.id)}
                        disabled={processing === order.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        {processing === order.id ? '交付中...' : '手动交付'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          💡 使用说明
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 此页面显示所有已支付但尚未交付的订单</li>
          <li>• 正常情况下，支付成功后会自动触发交付流程</li>
          <li>• 如果自动交付失败，可在此手动触发</li>
          <li>• 支持单个订单交付和批量交付</li>
          <li>• 交付内容包括：开通权限、发送邮件通知、记录日志等</li>
        </ul>
      </div>
    </div>
  );
}
