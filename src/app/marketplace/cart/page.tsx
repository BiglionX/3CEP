/**
 * 购物车页? * FixCycle 6.0 智能体市场平? */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Shield,
  Truck,
  Gift,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
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

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');

  // 模拟购物车数?  const mockCartItems: CartItem[] = [
    {
      id: 'item-1',
      agent: {
        id: 'agent-1',
        name: '销售助手智能体',
        description: '专业的销售对话助手，能够自动跟进客户、生成报价单和合?,
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
        description: '智能采购决策助手，支持供应商比价、风险评估和合同管理',
        price: 149.99,
        token_cost_per_use: 0.8,
        developer: {
          name: 'Procurement Pro',
        },
      },
      quantity: 1,
      subtotal: 149.99,
    },
  ];

  useEffect(() => {
    // 模拟从localStorage或API获取购物车数?    setTimeout(() => {
      setCartItems(mockCartItems);
      setIsLoading(false);
    }, 500);
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.agent.price * newQuantity,
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const applyPromoCode = () => {
    // 实现优惠码逻辑
    alert(`应用优惠? ${promoCode}`);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotalTokens = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.agent.token_cost_per_use * item.quantity,
      0
    );
  };

  const proceedToCheckout = () => {
    // 实现结账逻辑
    router.push('/marketplace/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载购物车中...</p>
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
            继续购物
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">购物?/h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              购物车是空的
            </h2>
            <p className="text-gray-600 mb-6">您还没有添加任何智能体到购物?/p>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              浏览市场
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 购物车项目列?*/}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    购物?({cartItems.length} 个项?
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* 产品信息 */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.agent.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.agent.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>开发? {item.agent.developer.name}</span>
                            <span className="mx-2">�?/span>
                            <span>
                              {item.agent.token_cost_per_use} Token/�?                            </span>
                          </div>
                        </div>

                        {/* 价格和数量控?*/}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ¥{item.agent.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              小计: ¥{item.subtotal.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 订单摘要 */}
            <div className="space-y-6">
              {/* 订单摘要卡片 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  订单摘要
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品总计</span>
                    <span className="font-medium">
                      ¥{getTotalAmount().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Token总计</span>
                    <span className="font-medium">
                      {getTotalTokens().toFixed(1)} Tokens
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>总计</span>
                      <span className="text-blue-600">
                        ¥{getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 优惠?*/}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  优惠?                </h3>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="输入优惠?
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    应用
                  </button>
                </div>
              </div>

              {/* 服务保障 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  服务保障
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>安全支付保障</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span>即时交付</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                    <span>多种支付方式</span>
                  </div>
                </div>
              </div>

              {/* 结账按钮 */}
              <button
                onClick={proceedToCheckout}
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-6 h-6" />
                <span>去结?/span>
              </button>

              {/* 注意事项 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">购买须知</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>购买后可随时使用和管?/li>
                      <li>支持7天无理由退?/li>
                      <li>Token按实际使用量扣除</li>
                    </ul>
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

