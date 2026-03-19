'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// 动态导入富文本编辑器以避免SSR问题
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

interface Manual {
  id: string;
  productId: string;
  title: Record<string, string>;
  content: Record<string, string>;
  languageCodes: string[];
  version: number;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  coverImageUrl: string;
  videoUrl: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  product: {
    name: string;
    model: string;
    brand: {
      name: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  model: string;
  brand: {
    name: string;
  };
}

export default function ManualsManagementPage() {
  const router = useRouter();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingManual, setEditingManual] = useState<Manual | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  
  // 表单状
  const [formData, setFormData] = useState({
    productId: '',
    title: {} as Record<string, string>,
    content: {} as Record<string, string>,
    coverImageUrl: '',
    videoUrl: '',
    languageCodes: ['zh']
  });

  // 获取说明书列
  const fetchManuals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manuals');
      const data = await response.json();
      
      if (data.success) {
        setManuals(data.data || []);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('获取说明书列表失', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取产品列表
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/brands/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('获取产品列表失败:', err);
    }
  };

  // 创建说明
  const createManual = async () => {
    try {
      const response = await fetch('/api/manuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'current_user_id' // 实际应从session获取
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('说明书创建成功！');
        setShowCreateModal(false);
        fetchManuals();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建说明书失', err);
    }
  };

  // 更新说明
  const updateManual = async () => {
    if (!editingManual) return;
    
    try {
      const response = await fetch(`/api/manuals/${editingManual.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('说明书更新成功！');
        setActiveTab('list');
        setEditingManual(null);
        fetchManuals();
        resetForm();
      } else {
        alert(`更新失败: ${result.error}`);
      }
    } catch (err) {
      alert('更新请求失败');
      console.error('更新说明书失', err);
    }
  };

  // 删除说明
  const deleteManual = async (manualId: string) => {
    if (!confirm('确定要删除这个说明书吗？')) return;
    
    try {
      const response = await fetch(`/api/manuals/${manualId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('说明书删除成功！');
        fetchManuals();
      } else {
        alert(`删除失败: ${result.error}`);
      }
    } catch (err) {
      alert('删除请求失败');
      console.error('删除说明书失', err);
    }
  };

  // 提交审核
  const submitForReview = async (manualId: string) => {
    try {
      const response = await fetch(`/api/manuals/${manualId}/review`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('已提交审核！');
        fetchManuals();
      } else {
        alert(`提交失败: ${result.error}`);
      }
    } catch (err) {
      alert('提交请求失败');
      console.error('提交审核失败:', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      productId: '',
      title: {},
      content: {},
      coverImageUrl: '',
      videoUrl: '',
      languageCodes: ['zh']
    });
    setCurrentLanguage('zh');
  };

  // 编辑说明
  const handleEdit = (manual: Manual) => {
    setEditingManual(manual);
    setFormData({
      productId: manual.productId,
      title: { ...manual.title },
      content: { ...manual.content },
      coverImageUrl: manual.coverImageUrl || '',
      videoUrl: manual.videoUrl || '',
      languageCodes: manual.languageCodes
    });
    setActiveTab('edit');
  };

  useEffect(() => {
    fetchManuals();
    fetchProducts();
  }, []);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">说明书管/h1>
              <p className="mt-2 text-gray-600">管理产品的多语言电子说明/p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              创建说明
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 说明书列*/}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {manuals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无说明/h3>
                <p className="text-gray-500 mb-6">开始创建您的第一个产品说明书</p>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  创建说明
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品信息</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">语言</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统计</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {manuals.map((manual) => (
                      <tr key={manual.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {manual.name || '未知产品'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {manual.model || '无型}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {manual.brand.name || '未知品牌'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {manual.title[currentLanguage] || manual.title['zh'] || '无标}
                          </div>
                          <div className="text-xs text-gray-500">
                            v{manual.version}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {manual.languageCodes.map(lang => (
                              <span 
                                key={lang}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {lang.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            manual.status === 'published' ? 'bg-green-100 text-green-800' :
                            manual.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            manual.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {manual.status === 'published' ? '已发 :
                             manual.status === 'pending_review' ? '审核 :
                             manual.status === 'rejected' ? '已拒 : '草稿'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>浏览: {manual.viewCount}</div>
                          <div>下载: {manual.downloadCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(manual)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              编辑
                            </button>
                            {manual.status === 'draft' && (
                              <button 
                                onClick={() => submitForReview(manual.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                提交审核
                              </button>
                            )}
                            <button 
                              onClick={() => deleteManual(manual.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 创建/编辑表单 */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'create' ? '创建说明 : '编辑说明}
              </h2>
              <button 
                onClick={() => {
                  setActiveTab('list');
                  setEditingManual(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* 产品选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择产品 *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择产品</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.model} ({product.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 语言选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支持的语言
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.languageCodes.includes('zh')}
                      onChange={(e) => {
                        const codes = e.target.checked 
                           [...formData.languageCodes, 'zh']
                          : formData.languageCodes.filter(c => c !== 'zh');
                        setFormData({...formData, languageCodes: codes});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">中文</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.languageCodes.includes('en')}
                      onChange={(e) => {
                        const codes = e.target.checked 
                           [...formData.languageCodes, 'en']
                          : formData.languageCodes.filter(c => c !== 'en');
                        setFormData({...formData, languageCodes: codes});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">English</span>
                  </label>
                </div>
              </div>

              {/* 语言切换标签 */}
              {formData.languageCodes.length > 0 && (
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {formData.languageCodes.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setCurrentLanguage(lang)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          currentLanguage === lang
                             'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {lang === 'zh' ? '中文' : 'English'}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* 标题输入 */}
              {formData.languageCodes.includes(currentLanguage) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '中文标题' : 'English Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title[currentLanguage as keyof typeof formData.title] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: {
                        ...formData.title,
                        [currentLanguage]: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={currentLanguage === 'zh' ? '请输入说明书标题' : 'Enter manual title'}
                  />
                </div>
              )}

              {/* 富文本编辑器 */}
              {formData.languageCodes.includes(currentLanguage) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '中文内容' : 'English Content'} *
                  </label>
                  <RichTextEditor
                    value={formData.content[currentLanguage] || ''}
                    onChange={(content: string) => setFormData({
                      ...formData,
                      content: {
                        ...formData.content,
                        [currentLanguage]: content
                      }
                    })}
                    placeholder={currentLanguage === 'zh' ? '请输入说明书内容...' : 'Enter manual content...'}
                  />
                </div>
              )}

              {/* 媒体资源 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    封面图片URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频教程URL
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setEditingManual(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={activeTab === 'create' ? createManual : updateManual}
                disabled={!formData.productId || !formData.title[currentLanguage] || !formData.content[currentLanguage]}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {activeTab === 'create' ? '创建说明 : '更新说明}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
