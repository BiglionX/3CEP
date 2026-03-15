'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  contact_email: string;
}

interface DashboardStats {
  totalProducts: number;
  totalScans: number;
  totalDiagnoses: number;
  tokenBalance: number;
  recentScans: number;
  recentDiagnoses: number;
}

interface Product {
  id: string;
  name: string;
  model: string;
  created_at: string;
  manuals_count: number;
}

export default function BrandDashboard() {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics'>('overview');

  useEffect(() => {
    // 检查认证状
    const token = localStorage.getItem('brandToken');
    const brandInfo = localStorage.getItem('brandInfo');
    
    if (!token || !brandInfo) {
      router.push('/brand/login');
      return;
    }

    try {
      const parsedBrand = JSON.parse(brandInfo);
      setBrand(parsedBrand);
      loadDashboardData(parsedBrand.id);
    } catch (error) {
      router.push('/brand/login');
    }
  }, [router]);

  const loadDashboardData = async (brandId: string) => {
    try {
      // 获取统计数据
      const statsResponse = await fetch(`/api/brands/${brandId}/dashboard/stats`);
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        setStats(statsData.stats);
      }

      // 获取产品列表
      const productsResponse = await fetch(`/api/brands/${brandId}/productslimit=5`);
      const productsData = await productsResponse.json();
      
      if (productsResponse.ok) {
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error('加载仪表板数据失', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('brandToken');
    localStorage.removeItem('brandInfo');
    router.push('/brand/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航*/}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">FixCycle</h1>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  品牌商后
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {brand && (
                <div className="flex items-center space-x-3">
                  {brand.logo_url && (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                退出登
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">仪表/h1>
          <p className="mt-2 text-gray-600">查看您的产品数据和系统统/p>
        </div>

        {/* 标签页导*/}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: '概览', icon: '📊' },
              { id: 'products', name: '产品管理', icon: '📦' },
              { id: 'analytics', name: '数据分析', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                     'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 概览标签页内*/}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">产品总数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">📱</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">总扫描次/p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
                      <p className="text-xs text-green-600">
                        今日: +{stats.recentScans}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🔧</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">诊断次数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalDiagnoses}</p>
                      <p className="text-xs text-purple-600">
                        今日: +{stats.recentDiagnoses}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Token余额</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.tokenBalance}</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        充值Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 最近产*/}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">最近产/h2>
                  <button 
                    onClick={() => router.push('/brand/products')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    查看全部
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {products\.length > 0  \(
                  products.map((product) => (
                    <div key={product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                          {product.model && (
                            <p className="text-sm text-gray-500">{product.model}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {product.manuals_count} 份说明书
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            管理
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无产品</h3>
                    <p className="text-gray-500 mb-4">开始添加您的第一个产/p>
                    <button 
                      onClick={() => router.push('/brand/products/new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      添加产品
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 产品管理标签页内*/}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">产品管理</h2>
              <button 
                onClick={() => router.push('/brand/products/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                添加新产
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500">产品管理功能正在开发中...</p>
            </div>
          </div>
        )}

        {/* 数据分析标签页内*/}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">数据分析</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500">数据分析功能正在开发中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
