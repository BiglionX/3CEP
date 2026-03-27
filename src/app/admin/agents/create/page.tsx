/**
 * 创建智能体向导页面
 * /admin/agents/create
 */

'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { ArrowLeft, BookOpen, FileText, Globe, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CreateMethod = 'template' | 'n8n' | 'service' | null;

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [step, setStep] = useState<'method' | 'config' | 'preview'>('method');
  const [selectedMethod, setSelectedMethod] = useState<CreateMethod>(null);
  const [loading, setLoading] = useState(false);

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/agents/create')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 处理选择创建方式
  const handleSelectMethod = (method: CreateMethod) => {
    setSelectedMethod(method);
    setStep('config');
  };

  // 处理提交
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: 实现实际的创建逻辑
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('智能体创建成功！');
      router.push('/admin/agents');
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  // 未授权
  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/agents"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">创建智能体</h1>
                <p className="text-sm text-gray-500 mt-1">
                  选择适合您的方式创建新的智能体服务
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 进度指示器 */}
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step === 'method'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span
                className={
                  step === 'method'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600'
                }
              >
                选择创建方式
              </span>
            </div>
            <div className="flex-1 mx-4">
              <div className="border-t-2 border-gray-200"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step === 'config'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={
                  step === 'config'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600'
                }
              >
                配置信息
              </span>
            </div>
            <div className="flex-1 mx-4">
              <div className="border-t-2 border-gray-200"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <span
                className={
                  step === 'preview'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600'
                }
              >
                预览提交
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 步骤 1: 选择创建方式 */}
      {step === 'method' && (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 方式 1: 从模板创建 */}
            <div
              onClick={() => handleSelectMethod('template')}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  从模板创建
                </h3>
                <p className="text-sm text-gray-600">
                  使用预定义的智能体模板快速创建，标准化配置
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    快速部署
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    标准化配置
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    最佳实践
                  </li>
                </ul>
              </div>
            </div>

            {/* 方式 2: 从 n8n 模板导入 */}
            <div
              onClick={() => handleSelectMethod('n8n')}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  从 n8n 模板导入
                </h3>
                <p className="text-sm text-gray-600">
                  从 n8n 社区导入工作流模板，复用优质资源
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    丰富资源
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    可视化编排
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    易于集成
                  </li>
                </ul>
              </div>
            </div>

            {/* 方式 3: 注册已有服务 */}
            <div
              onClick={() => handleSelectMethod('service')}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  注册已有服务
                </h3>
                <p className="text-sm text-gray-600">
                  将已有的 HTTP 服务注册为智能体，快速接入平台
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    灵活定制
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    完全控制
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    快速接入
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 2: 配置信息（占位） */}
      {step === 'config' && (
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">
              {selectedMethod === 'template' && '基于模板配置智能体'}
              {selectedMethod === 'n8n' && '导入 n8n 工作流'}
              {selectedMethod === 'service' && '注册服务信息'}
            </h2>

            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  智能体名称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：订单管理智能体"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  领域
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">选择领域</option>
                  <option value="order">订单管理</option>
                  <option value="purchase">采购管理</option>
                  <option value="warehouse">仓储管理</option>
                  <option value="finance">财务管理</option>
                  <option value="analysis">数据分析</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="简要描述智能体的功能和用途"
                ></textarea>
              </div>

              {selectedMethod === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      服务端点 URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      健康检查端点
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/health"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep('method')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                返回
              </button>
              <button
                onClick={() => setStep('preview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                下一步：预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 3: 预览提交（占位） */}
      {step === 'preview' && (
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">预览配置</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                配置摘要
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">创建方式</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedMethod === 'template' && '从模板创建'}
                    {selectedMethod === 'n8n' && '从 n8n 模板导入'}
                    {selectedMethod === 'service' && '注册已有服务'}
                  </dd>
                </div>
                {/* TODO: 显示更多配置信息 */}
              </dl>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep('config')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                返回修改
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    提交中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    提交创建
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
