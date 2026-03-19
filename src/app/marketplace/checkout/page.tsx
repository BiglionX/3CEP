/**
 * 结账页面
 * FixCycle 6.0 智能体市场平台
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface CheckoutItem {
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('alipay');

  // 表单数据
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '中国',
  });

  // 模拟购物车数据
  const mockCartItems: CheckoutItem[] = [
    {
      id: 'item-1',
      agent: {
        id: 'agent-1',
        name: '销售助手智能体',
        description: '专业的销售对话助手，能够自动跟进客户、生成报价单和合同',
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
        name: '采购智能助手',
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
    // 模拟从购物车获取数据
    setTimeout(() => {
      setCartItems(mockCartItems);
      setIsLoading(false);
    }, 500);
  }, []);

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotalTokens = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.agent.token_cost_per_use * item.quantity,
      0
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePayment = () => {
    // 模拟支付处理
    alert(`使用${paymentMethod === 'alipay' ? '支付宝' : '微信支付'}完成支付`);
    router.push('/marketplace/orders');
  };

  const isFormValid = () => {
    return formData.fullName && formData.email && formData.phone;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载结账信息中...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            购物车为空
          </h2>
          <p className="text-gray-600 mb-6">请先添加商品到购物车</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
          >
            返回市场
          </button>
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
            onClick={() => router.push('/marketplace/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回购物车
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">结账</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 进度指示器 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= step
                           'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <span>填写信息</span>
                <span>选择支付</span>
                <span>确认订单</span>
              </div>
            </div>

            {/* 步骤1: 填写信息 */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  收货人信息
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      姓名 *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入您的姓名"
                      value={formData.fullName}
                      onChange={e =>
                        handleInputChange('fullName', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      邮箱 *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      手机号码 *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入手机号码"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      国家/地区
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.country}
                      onChange={e =>
                        handleInputChange('country', e.target.value)
                      }
                    >
                      <option value="中国">中国</option>
                      <option value="美国">美国</option>
                      <option value="日本">日本</option>
                      <option value="韩国">韩国</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细地址
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入详细地址"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!isFormValid()}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <span>下一步</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* 步骤2: 选择支付方式 */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  选择支付方式
                </h2>

                <div className="space-y-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'alipay'
                         'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('alipay')}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'alipay'
                             'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'alipay' && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">支付宝</div>
                        <div className="text-sm text-gray-500">
                          推荐使用支付宝支付
                        </div>
                      </div>
                      <div className="text-2xl">📱</div>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'wechat'
                         'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('wechat')}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'wechat'
                             'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'wechat' && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          微信支付
                        </div>
                        <div className="text-sm text-gray-500">
                          使用微信扫码支付
                        </div>
                      </div>
                      <div className="text-2xl">💬</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>下一步</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* 步骤3: 确认订单 */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  确认订单信息
                </h2>

                {/* 订单详情 */}
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.agent.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.agent.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          开发者: {item.agent.developer.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ¥{item.subtotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          数量: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 收货信息 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">收货信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>姓名: {formData.fullName}</div>
                    <div>邮箱: {formData.email}</div>
                    <div>手机: {formData.phone}</div>
                    <div>国家: {formData.country}</div>
                    {formData.address && (
                      <div className="md:col-span-2">
                        地址: {formData.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* 支付方式 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">支付方式</h3>
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {paymentMethod === 'alipay' ? '📱' : '💬'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {paymentMethod === 'alipay' ? '支付宝' : '微信支付'}
                      </div>
                      <div className="text-sm text-gray-600">
                        安全快捷的移动支付
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Lock className="w-5 h-5" />
                    <span>确认支付 ¥{getTotalAmount().toFixed(2)}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 - 订单摘要 */}
          <div className="space-y-6">
            {/* 订单摘要 */}
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
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span>7天无理由退款</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Wallet className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  <span>Token按使用量计费</span>
                </div>
              </div>
            </div>

            {/* 注意事项 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">重要提醒</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>购买后可立即使用智能体</li>
                    <li>Token将在实际使用时扣除</li>
                    <li>支持发票申请和企业采购</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
