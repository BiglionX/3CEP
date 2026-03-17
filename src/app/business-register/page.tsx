'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle,
  ChevronRight,
  Globe,
  Play,
  Shield,
  Store,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  phone: string;
  shopName?: string;
  shopAddress?: string;
  businessType?: 'importer' | 'exporter';
}

type BusinessType = 'enterprise' | 'repair-shop' | 'trade';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessLicense: '',
    contactPerson: '',
    phone: '',
    shopName: '',
    shopAddress: '',
    businessType: 'importer',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // 测试账号配置
  const demoAccounts = {
    enterprise: {
      dashboard: '/enterprise/admin/dashboard',
      title: '企业管理平台',
    },
    'repair-shop': {
      dashboard: '/repair-shop/dashboard',
      title: '维修店管理后台',
    },
    trade: {
      dashboard: '/foreign-trade/company',
      title: '贸易公司管理后台',
    },
  };

  // 模拟登录处理
  const handleDemoLogin = (type: BusinessType) => {
    const demo = demoAccounts[type];
    router.push(demo.dashboard);
  };

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 通用验证
    if (!formData.email) newErrors.email = '请输入邮箱地址';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) newErrors.password = '请输入密码';
    else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少8位';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 根据业务类型进行特定验证
    if (selectedType === 'enterprise') {
      if (!formData.companyName) newErrors.companyName = '请输入公司名称';
      if (!formData.businessLicense)
        newErrors.businessLicense = '请输入营业执照号';
      if (!formData.contactPerson) newErrors.contactPerson = '请输入联系人姓名';
      if (!formData.phone) newErrors.phone = '请输入联系电话';
    } else if (selectedType === 'repair-shop') {
      if (!formData.shopName) newErrors.shopName = '请输入店铺名称';
      if (!formData.shopAddress) newErrors.shopAddress = '请输入店铺地址';
      if (!formData.contactPerson) newErrors.contactPerson = '请输入联系人姓名';
      if (!formData.phone) newErrors.phone = '请输入联系电话';
    } else if (selectedType === 'trade') {
      if (!formData.companyName) newErrors.companyName = '请输入公司名称';
      if (!formData.contactPerson) newErrors.contactPerson = '请输入联系人姓名';
      if (!formData.phone) newErrors.phone = '请输入联系电话';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 根据业务类型跳转到对应的登录页面
      let redirectUrl = '';
      switch (selectedType) {
        case 'enterprise':
          redirectUrl = '/enterprise/admin/auth?registered=true';
          break;
        case 'repair-shop':
          redirectUrl = '/repair-shop/login?registered=true';
          break;
        case 'trade':
          redirectUrl =
            formData.businessType === 'importer'
              ? '/importer/login?registered=true'
              : '/exporter/login?registered=true';
          break;
      }

      router.push(redirectUrl);
    } catch (error) {
      setErrors({ general: '注册失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const businessTypes = [
    {
      type: 'enterprise' as BusinessType,
      title: '企业服务',
      description: 'AI智能体管理、采购服务、企业级数据分析',
      icon: <Building className="w-12 h-12" />,
      color: 'blue',
      features: ['智能体服务', '采购管理', '数据分析', '团队协作'],
    },
    {
      type: 'repair-shop' as BusinessType,
      title: '维修店铺',
      description: '设备维修订单管理、客户预约、库存管理',
      icon: <Store className="w-12 h-12" />,
      color: 'purple',
      features: ['工单管理', '预约系统', '库存管理', '业绩分析'],
    },
    {
      type: 'trade' as BusinessType,
      title: '贸易服务',
      description: '进出口订单管理、物流跟踪、合作伙伴管理',
      icon: <Globe className="w-12 h-12" />,
      color: 'green',
      features: ['订单管理', '物流跟踪', '合作伙伴', '业务分析'],
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: '安全可靠',
      description: '企业级安全保障，数据加密存储',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '快速审核',
      description: '24小时内完成审核，快速开通服务',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '专属客服',
      description: '一对一技术支持，解决使用问题',
    },
  ];

  // 如果已选择业务类型，显示注册表单
  if (selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
        {/* 模拟登录按钮 */}
        <div className="absolute top-6 right-6 z-10">
          <Button
            onClick={() => handleDemoLogin(selectedType)}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-blue-50"
          >
            <Play className="w-4 h-4" />
            模拟登录
          </Button>
        </div>

        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full">
            {/* 返回按钮 */}
            <button
              onClick={() => setSelectedType(null)}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回选择业务类型
            </button>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  {businessTypes.find(t => t.type === selectedType)?.icon}
                  <span className="ml-3">
                    {businessTypes.find(t => t.type === selectedType)?.title}
                    注册
                  </span>
                </CardTitle>
                <CardDescription>
                  填写以下信息完成注册，享受专业的
                  {businessTypes.find(t => t.type === selectedType)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  )}

                  {/* 账户信息 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      账户信息
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱地址 *</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="请输入邮箱地址"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">联系人姓名 *</Label>
                        <Input
                          id="contactPerson"
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          placeholder="请输入联系人姓名"
                          className={
                            errors.contactPerson ? 'border-red-500' : ''
                          }
                        />
                        {errors.contactPerson && (
                          <p className="text-red-500 text-xs">
                            {errors.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">密码 *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="请输入密码（至少8位）"
                            className={errors.password ? 'border-red-500' : ''}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? '隐藏' : '显示'}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-xs">
                            {errors.password}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认密码 *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="请再次输入密码"
                          className={
                            errors.confirmPassword ? 'border-red-500' : ''
                          }
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">联系电话 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="请输入联系电话"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* 企业信息 */}
                  {selectedType === 'enterprise' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        企业信息
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">公司名称 *</Label>
                        <Input
                          id="companyName"
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="请输入公司全称"
                          className={errors.companyName ? 'border-red-500' : ''}
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-xs">
                            {errors.companyName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessLicense">营业执照号 *</Label>
                        <Input
                          id="businessLicense"
                          type="text"
                          name="businessLicense"
                          value={formData.businessLicense}
                          onChange={handleInputChange}
                          placeholder="请输入营业执照号"
                          className={
                            errors.businessLicense ? 'border-red-500' : ''
                          }
                        />
                        {errors.businessLicense && (
                          <p className="text-red-500 text-xs">
                            {errors.businessLicense}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 维修店信息 */}
                  {selectedType === 'repair-shop' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Store className="w-5 h-5 mr-2" />
                        店铺信息
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="shopName">店铺名称 *</Label>
                        <Input
                          id="shopName"
                          type="text"
                          name="shopName"
                          value={formData.shopName}
                          onChange={handleInputChange}
                          placeholder="请输入店铺名称"
                          className={errors.shopName ? 'border-red-500' : ''}
                        />
                        {errors.shopName && (
                          <p className="text-red-500 text-xs">
                            {errors.shopName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shopAddress">店铺地址 *</Label>
                        <Input
                          id="shopAddress"
                          type="text"
                          name="shopAddress"
                          value={formData.shopAddress}
                          onChange={handleInputChange}
                          placeholder="请输入店铺详细地址"
                          className={errors.shopAddress ? 'border-red-500' : ''}
                        />
                        {errors.shopAddress && (
                          <p className="text-red-500 text-xs">
                            {errors.shopAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 贸易公司信息 */}
                  {selectedType === 'trade' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        贸易公司信息
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">公司名称 *</Label>
                        <Input
                          id="companyName"
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="请输入公司全称"
                          className={errors.companyName ? 'border-red-500' : ''}
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-xs">
                            {errors.companyName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessType">贸易类型 *</Label>
                        <select
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="importer">进口商</option>
                          <option value="exporter">出口商</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 协议 */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="agreement"
                      required
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="agreement"
                      className="text-sm text-gray-600"
                    >
                      我已阅读并同意{' '}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        服务条款
                      </Link>{' '}
                      和{' '}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        隐私政策
                      </Link>
                    </label>
                  </div>

                  {/* 提交按钮 */}
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        提交注册...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        提交注册
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 默认显示：选择业务类型
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* 模拟登录按钮 */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={() => {
            const types: BusinessType[] = [
              'enterprise',
              'repair-shop',
              'trade',
            ];
            const randomType = types[Math.floor(Math.random() * types.length)];
            handleDemoLogin(randomType);
          }}
          variant="outline"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-blue-50"
        >
          <Play className="w-4 h-4" />
          模拟登录
        </Button>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              选择您的业务类型
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              请选择最适合您业务的服务类型，我们将为您提供专业的解决方案
            </p>
          </div>

          {/* 业务类型卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {businessTypes.map(item => (
              <Card
                key={item.type}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-500"
                onClick={() => handleTypeSelect(item.type)}
              >
                <CardHeader>
                  <div
                    className={`flex justify-center mb-4 p-4 rounded-full ${
                      item.color === 'blue'
                        ? 'bg-blue-100'
                        : item.color === 'purple'
                          ? 'bg-purple-100'
                          : 'bg-green-100'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl text-center group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-center mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2 mt-6">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        handleTypeSelect(item.type);
                      }}
                    >
                      选择此类型
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      className="w-full"
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleDemoLogin(item.type as BusinessType);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      模拟登录体验
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 功能特点 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 已有账户 */}
          <div className="text-center">
            <p className="text-gray-600">
              已有商业账户？{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
