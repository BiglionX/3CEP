'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateSkillPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-store/create')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 收集表单数据
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const data = {
        name: formData.get('name') as string,
        nameEn: formData.get('nameEn') as string,
        category: formData.get('category') as string,
        version: formData.get('version') as string,
        description: formData.get('description') as string,
        apiEndpoint: (formData.get('apiEndpoint') as string) || undefined,
        parameters: (formData.get('parameters') as string) || undefined,
        tokenCost: (formData.get('tokenCost') as string) || undefined,
        tags: (formData.get('tags') as string) || undefined,
      };

      // 调用 API
      const response = await fetch('/api/admin/skill-store/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('Skill 创建成功！等待管理员审核');
        router.push('/admin/skill-store');
      } else {
        alert(`创建失败：${result.error}`);
      }
    } catch (error: any) {
      console.error('创建失败:', error);
      alert(`网络错误：${error.message || '请重试'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">创建新 Skill</h1>
          <p className="mt-1 text-sm text-gray-500">
            填写以下信息以创建新的 Skill
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          返回
        </button>
      </div>

      {/* 创建表单 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        {/* 基本信息 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Skill 名称 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Skill 名称 *
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="请输入 Skill 名称"
              />
            </div>

            {/* 英文名称 */}
            <div>
              <label
                htmlFor="nameEn"
                className="block text-sm font-medium text-gray-700"
              >
                英文名称 *
              </label>
              <input
                type="text"
                id="nameEn"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Please enter English name"
              />
            </div>

            {/* 分类 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                分类 *
              </label>
              <select
                id="category"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">请选择分类</option>
                <option value="tools-productivity">工具 - 效率办公</option>
                <option value="data-analytics">数据 - 分析处理</option>
                <option value="customer-service">客服 - 售后服务</option>
                <option value="marketing">营销 - 推广</option>
                <option value="content-creation">内容 - 创作</option>
                <option value="education">教育 - 培训</option>
                <option value="healthcare">医疗 - 健康</option>
                <option value="finance">金融 - 财经</option>
                <option value="legal">法律 - 合规</option>
                <option value="hr">人力资源 - 招聘</option>
                <option value="it-devops">IT - 运维开发</option>
                <option value="ecommerce">电商 - 零售</option>
                <option value="manufacturing">制造 - 工业</option>
                <option value="logistics">物流 - 供应链</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 版本号 */}
            <div>
              <label
                htmlFor="version"
                className="block text-sm font-medium text-gray-700"
              >
                版本号 *
              </label>
              <input
                type="text"
                id="version"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="例如：1.0.0"
              />
            </div>
          </div>

          {/* 描述 */}
          <div className="mt-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              描述 *
            </label>
            <textarea
              id="description"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="请详细描述 Skill 的功能和用途"
            />
          </div>
        </div>

        {/* 配置信息 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">配置信息</h3>

          <div className="space-y-4">
            {/* API Endpoint */}
            <div>
              <label
                htmlFor="apiEndpoint"
                className="block text-sm font-medium text-gray-700"
              >
                API Endpoint
              </label>
              <input
                type="url"
                id="apiEndpoint"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://api.example.com/skill"
              />
            </div>

            {/* 参数配置 */}
            <div>
              <label
                htmlFor="parameters"
                className="block text-sm font-medium text-gray-700"
              >
                参数配置 (JSON)
              </label>
              <textarea
                id="parameters"
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                placeholder='{"timeout": 30000, "retry": 3}'
              />
            </div>

            {/* Token 消耗 */}
            <div>
              <label
                htmlFor="tokenCost"
                className="block text-sm font-medium text-gray-700"
              >
                Token 消耗
              </label>
              <input
                type="number"
                id="tokenCost"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="每次执行消耗的 Token 数量"
              />
            </div>
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700"
          >
            标签 (用逗号分隔)
          </label>
          <input
            type="text"
            id="tags"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="AI, 自动化，智能助手"
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : '创建 Skill'}
          </button>
        </div>
      </form>

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>带 * 号为必填项</li>
          <li>确保 API Endpoint 可访问</li>
          <li>参数配置需符合 JSON 格式</li>
          <li>创建后需要管理员审核才能上架</li>
        </ul>
      </div>
    </div>
  );
}
