'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BrandLoginData {
  email: string;
  password: string;
  apiKey?: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  contact_email: string;
  is_active: boolean;
}

export default function BrandLoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'api'>('email');
  const [formData, setFormData] = useState<BrandLoginData>({
    email: '',
    password: '',
    apiKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (loginMethod === 'email') {
        // 邮箱密码登录
        if (!formData.email || !formData.password) {
          throw new Error('请输入邮箱和密码');
        }
        
        response = await fetch('/api/brands/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
      } else {
        // API Key登录
        if (!formData.apiKey) {
          throw new Error('请输入API Key');
        }
        
        response = await fetch('/api/brands/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: formData.apiKey
          })
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      // 保存认证信息
      localStorage.setItem('brandToken', data.token);
      localStorage.setItem('brandInfo', JSON.stringify(data.brand));
      
      // 跳转到品牌商后台首页
      router.push('/brand/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : '登录过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">FixCycle</h1>
          <p className="text-blue-100">品牌商管理后台</p>
        </div>

        {/* 登录表单 */}
        <div className="p-8">
          {/* 登录方式切换 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              邮箱登录
            </button>
            <button
              onClick={() => setLoginMethod('api')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'api'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              API Key登录
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="sk_XXXXXXXXXXXXXXXXXXXXXXXX"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  在品牌商控制台可以找到您的API Key
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 忘记密码链接 */}
          {loginMethod === 'email' && (
            <div className="mt-6 text-center">
              <a href="/brand/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                忘记密码？
              </a>
            </div>
          )}

          {/* 注册链接 */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              还没有账号？{' '}
              <a href="/brand/register" className="text-blue-600 hover:text-blue-800 font-medium">
                立即注册
              </a>
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="bg-gray-50 px-8 py-6 text-center">
          <p className="text-xs text-gray-500">
            © 2026 FixCycle. 为品牌商提供专业的设备服务解决方案
          </p>
        </div>
      </div>
    </div>
  );
}