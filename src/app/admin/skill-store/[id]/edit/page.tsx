'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import type { Skill } from '@/types/skill';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditSkillPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const params = useParams();
  const skillId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    category: '',
    version: '',
    description: '',
    apiEndpoint: '',
    parameters: '',
    tokenCost: '',
    tags: '',
  });

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/admin/skill-store/${skillId}/edit`)}`;
    }
  }, [isAuthenticated, is_admin, isLoading, skillId]);

  // 加载 Skill 详情
  useEffect(() => {
    const loadSkill = async () => {
      if (!skillId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/skill-store/list?id=${skillId}`
        );
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const skillData = result.data[0];
          setSkill(skillData);

          // 填充表单数据
          setFormData({
            name: skillData.name || '',
            nameEn: skillData.name_en || '',
            category: skillData.category || '',
            version: skillData.version || '',
            description: skillData.description || '',
            apiEndpoint: skillData.api_endpoint || '',
            parameters: skillData.parameters
              ? JSON.stringify(skillData.parameters, null, 2)
              : '',
            tokenCost: skillData.token_cost?.toString() || '',
            tags: skillData.tags?.join(', ') || '',
          });
        } else {
          alert('Skill 不存在');
          router.push('/admin/skill-store');
        }
      } catch (error) {
        console.error('加载 Skill 失败:', error);
        alert('加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && is_admin && skillId) {
      loadSkill();
    }
  }, [skillId, isAuthenticated, is_admin, router]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 解析参数
      let parsedParameters = null;
      if (formData.parameters) {
        try {
          parsedParameters = JSON.parse(formData.parameters);
        } catch (error) {
          alert('参数配置必须是有效的 JSON 格式');
          setIsSubmitting(false);
          return;
        }
      }

      // 解析标签
      const tagArray = formData.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      // 调用更新 API
      const response = await fetch('/api/admin/skill-store/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: skillId,
          name: formData.name,
          nameEn: formData.nameEn,
          category: formData.category,
          version: formData.version,
          description: formData.description,
          apiEndpoint: formData.apiEndpoint,
          parameters: parsedParameters,
          tokenCost: formData.tokenCost ? parseInt(formData.tokenCost, 10) : 0,
          tags: tagArray,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Skill 更新成功!');
        router.push(`/admin/skill-store/${skillId}`);
      } else {
        alert(`更新失败：${result.error}`);
      }
    } catch (error: any) {
      console.error('更新失败:', error);
      alert(`网络错误：${error.message || '请重试'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    router.push(`/admin/skill-store/${skillId}`);
  };

  if (isLoading || loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">编辑 Skill</h1>
          <p className="mt-1 text-sm text-gray-500">
            修改 Skill 信息，当前版本：{skill?.version}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          取消
        </button>
      </div>

      {/* 编辑表单 */}
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
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* 英文名称 (只读) */}
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
                value={formData.nameEn}
                onChange={e =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                readOnly
                title="英文名称不可修改"
              />
              <p className="mt-1 text-xs text-gray-500">
                英文名称创建后不可修改
              </p>
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
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
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
                新版本号 *
              </label>
              <input
                type="text"
                id="version"
                required
                value={formData.version}
                onChange={e =>
                  setFormData({ ...formData, version: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="例如：1.0.1"
              />
              <p className="mt-1 text-xs text-gray-500">
                当前版本：{skill?.version}
              </p>
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
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                value={formData.apiEndpoint}
                onChange={e =>
                  setFormData({ ...formData, apiEndpoint: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                value={formData.parameters}
                onChange={e =>
                  setFormData({ ...formData, parameters: e.target.value })
                }
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
                value={formData.tokenCost}
                onChange={e =>
                  setFormData({ ...formData, tokenCost: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="AI, 自动化，智能助手"
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>

      {/* 使用说明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">
          ⚠️ 注意事项
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>英文名称创建后不可修改</li>
          <li>修改后会生成新的版本记录</li>
          <li>确保 API Endpoint 可访问</li>
          <li>参数配置需符合 JSON 格式</li>
          <li>重大修改建议提前通知用户</li>
        </ul>
      </div>
    </div>
  );
}
