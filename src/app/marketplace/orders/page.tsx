/**
 * 订单管理页面
 * FixCycle 6.0 智能体市场平? */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Eye,
  Download,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total_amount: number;
  token_cost: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  payment_method: string;
  payment_status: 'paid' | 'unpaid' | 'refunded';
}

interface OrderItem {
  id: string;
  agent: {
    id: string;
    name: string;
    description: string;
    price: number;
    token_cost_per_use: number;
    developer: {
      name: string;
    };
  };
  quantity: number;
  subtotal: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: 'order-1',
      order_number: 'ORD-20260301-001',
      status: 'completed',
      total_amount: 249.98,
      token_cost: 1.3,
      items: [
        {
          id: 'item-1',
          agent: {
            id: 'agent-1',
            name: '销售助手智能体',
            description: '专业的销售对话助?,
            price: 99.99,
            token_cost_per_use: 0.5,
            developer: {
              name: 'AI Solutions Inc.',
            },
          },
          quantity: 1,
          subtotal: 99.99,
        },
        {
          id: 'item-2',
          agent: {
            id: 'agent-2',
            name: '采购智能?,
            description: '智能采购决策助手',
            price: 149.99,
            token_cost_per_use: 0.8,
            developer: {
              name: 'Procurement Pro',
            },
          },
          quantity: 1,
          subtotal: 149.99,
        },
      ],
      created_at: '2026-03-01T10:30:00Z',
      updated_at: '2026-03-01T11:15:00Z',
      payment_method: '支付?,
      payment_status: 'paid',
    },
    {
      id: 'order-2',
      order_number: 'ORD-20260301-002',
      status: 'processing',
      total_amount: 79.99,
      token_cost: 0.3,
      items: [
        {
          id: 'item-3',
          agent: {
            id: 'agent-3',
            name: '客服支持机器?,
            description: '24/7智能客服支持',
            price: 79.99,
            token_cost_per_use: 0.3,
            developer: {
              name: 'Customer Care AI',
            },
          },
          quantity: 1,
          subtotal: 79.99,
        },
      ],
      created_at: '2026-03-01T14:20:00Z',
      updated_at: '2026-03-01T14:20:00Z',
      payment_method: '微信支付',
      payment_status: 'paid',
    },
    {
      id: 'order-3',
      order_number: 'ORD-20260301-003',
      status: 'pending',
      total_amount: 199.98,
      token_cost: 2.0,
      items: [
        {
          id: 'item-4',
          agent: {
            id: 'agent-4',
            name: '营销推广智能?,
            description: '精准营销投放助手',
            price: 199.99,
            token_cost_per_use: 1.0,
            developer: {
              name: 'Marketing Experts',
            },
          },
          quantity: 1,
          subtotal: 199.99,
        },
      ],
      created_at: '2026-03-01T16:45:00Z',
      updated_at: '2026-03-01T16:45:00Z',
      payment_method: '银行?,
      payment_status: 'unpaid',
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const filterOrders = () => {
    let filtered = [...orders];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some(item =>
            item.agent.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // 状态过?    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { icon: React.ReactNode; color: string; text: string }
    > = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        color: 'bg-yellow-100 text-yellow-800',
        text: '待处?,
      },
      processing: {
        icon: <Package className="w-4 h-4" />,
        color: 'bg-blue-100 text-blue-800',
        text: '处理?,
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'bg-green-100 text-green-800',
        text: '已完?,
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        color: 'bg-red-100 text-red-800',
        text: '已取?,
      },
      refunded: {
        icon: <CreditCard className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-800',
        text: '已退?,
      },
    };
    return configs[status] || configs.pending;
  };

  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载订单数据?..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">我的订单</h1>
        </div>

        {/* 搜索和过?*/}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索订单号或智能体名?.."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">全部状?/option>
                <option value="pending">待处?/option>
                <option value="processing">处理?/option>
                <option value="completed">已完?/option>
                <option value="cancelled">已取?/option>
                <option value="refunded">已退?/option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>导出</span>
              </button>
            </div>
          </div>
        </div>

        {/* 订单统计 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: '总订单数', value: orders.length, color: 'bg-blue-500' },
            {
              label: '待处?,
              value: orders.filter(o => o.status === 'pending').length,
              color: 'bg-yellow-500',
            },
            {
              label: '处理?,
              value: orders.filter(o => o.status === 'processing').length,
              color: 'bg-blue-500',
            },
            {
              label: '已完?,
              value: orders.filter(o => o.status === 'completed').length,
              color: 'bg-green-500',
            },
            {
              label: '总金?,
              value: `¥${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}`,
              color: 'bg-purple-500',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 订单列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              订单列表 ({filteredOrders.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* 订单基本信息 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.order_number}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.text}</span>
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.payment_status === 'paid'
                            ? '已付?
                            : '未付?}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>创建时间: {formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span>支付方式: {order.payment_method}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          <span>{order.items.length} 个商?/span>
                        </div>
                      </div>

                      {/* 订单商品预览 */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {order.items.slice(0, 2).map(item => (
                          <span
                            key={item.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {item.agent.name}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 2} 更多
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 价格和操?*/}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.token_cost} Token
                        </div>
                      </div>

                      <button
                        onClick={() => viewOrderDetail(order)}
                        className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>查看详情</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无订单
              </h3>
              <p className="text-gray-500">您还没有任何订单记录</p>
            </div>
          )}
        </div>

        {/* 订单详情模态框 */}
        {showOrderDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* 头部 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      订单详情 - {selectedOrder.order_number}
                    </h2>
                    <p className="text-gray-600 mt-1">查看订单的详细信?/p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 主要内容 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* 订单状态和基本信息 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        订单信息
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>订单? {selectedOrder.order_number}</div>
                        <div>
                          创建时间: {formatDate(selectedOrder.created_at)}
                        </div>
                        <div>
                          更新时间: {formatDate(selectedOrder.updated_at)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        支付信息
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>支付方式: {selectedOrder.payment_method}</div>
                        <div>
                          支付状?{' '}
                          {selectedOrder.payment_status === 'paid'
                            ? '已付?
                            : '未付?}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 商品列表 */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">商品列表</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.agent.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.agent.description}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            开发? {item.agent.developer.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatPrice(item.subtotal)}
                          </div>
                          <div className="text-sm text-gray-500">
                            数量: {item.quantity}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.agent.token_cost_per_use} Token/�?                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 订单总计 */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        总计
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedOrder.token_cost} Token 消?                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(selectedOrder.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

