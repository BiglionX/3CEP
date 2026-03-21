'use client';

import { Briefcase, Building, Store, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// 用户类型定义
type UserType =
  | 'individual'
  | 'repair_shop'
  | 'enterprise'
  | 'foreign_trade_company';

interface UserInfo {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName?: string;
  shopName?: string;
}

export default function EnhancedRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [selectedUserType, setSelectedUserType] =
    useState<UserType>('individual');
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    shopName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 用户类型选项
  const userTypes = [
    {
      id: 'individual' as UserType,
      name: '个人用户',
      description: 'C 端消费者，享受平台基础服务',
      icon: User,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'repair_shop' as UserType,
      name: '维修店',
      description: '提供产品维修服务',
      icon: Store,
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'enterprise' as UserType,
      name: '企业用户',
      description: '工厂、供应商等企业类型',
      icon: Building,
      color: 'from-purple-500 to-violet-600',
    },
    {
      id: 'foreign_trade_company' as UserType,
      name: '外贸公司',
      description: '从事进出口贸易的公司',
      icon: Briefcase,
      color: 'from-orange-500 to-red-600',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('请输入姓名');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱');
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('请输入手机号');
      return false;
    }

    if (!formData.password) {
      setError('请输入密码');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少 6 位');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    // 根据用户类型验证特定字段
    if (selectedUserType === 'enterprise' && !formData.companyName?.trim()) {
      setError('请输入公司名称');
      return false;
    }
    if (selectedUserType === 'repair_shop' && !formData.shopName?.trim()) {
      setError('请输入店铺名称');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_type: selectedUserType,
          account_type:
            selectedUserType === 'enterprise'
              ? 'factory'
              : selectedUserType === 'repair_shop'
                ? 'repair_shop'
                : selectedUserType === 'foreign_trade_company'
                  ? 'foreign_trade'
                  : 'individual',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
        }, 3000);
      } else {
        setError(result.error || '注册失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">注册成功</h1>
          <p className="text-gray-600 mb-6">
            我们已向您的邮箱发送了确认邮件，请查收并激活账户
          </p>
          <p className="text-sm text-gray-500">即将跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            加入 FixCycle 平台
          </h1>
          <p className="text-lg text-gray-600">
            选择适合您的账户类型，开启数字化转型之旅
          </p>
        </div>

        {/* 用户类型选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {userTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedUserType(type.id)}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedUserType === type.id
                    ? `border-${type.color.split('-')[1]}-600 bg-${type.color.split('-')[1]}-50 shadow-lg scale-105`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 mx-auto`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {type.description}
                </p>
                {selectedUserType === type.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 注册表单 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userTypes.find(t => t.id === selectedUserType)?.name}注册
              </h2>
              <p className="text-gray-600">请填写以下信息完成账户创建</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系人姓名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入姓名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>

              {/* 公司/店铺名称（根据用户类型显示） */}
              {selectedUserType === 'enterprise' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司名称 *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入公司全称"
                    required
                  />
                </div>
              )}

              {selectedUserType === 'repair_shop' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺名称 *
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入店铺名称"
                    required
                  />
                </div>
              )}

              {/* 邮箱和密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="至少 6 位字符"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    建议包含字母和数字
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
              </div>

              {/* 服务条款 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  我同意服务条款和隐私政策 *
                </label>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    注册中...
                  </div>
                ) : (
                  '创建账户'
                )}
              </button>
            </form>

            {/* 登录链接 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                已有账户？{' '}
                <button
                  onClick={() =>
                    router.push(
                      `/login?redirect=${encodeURIComponent(redirect)}`
                    )
                  }
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>

          {/* 底部提示 */}
          <p className="mt-6 text-center text-xs text-gray-500">
            注册即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
