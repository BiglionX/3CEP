'use client';

import { TEMPLATE_CATEGORIES } from '@/templates/agents/presets';
import { useEffect, useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  configuration: any;
  isPreset: boolean;
  usage_count?: number;
}

export default function AgentTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    icon: '📄',
    configuration: JSON.stringify({}, null, 2),
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/agents/templates');
      const result = await res.json();

      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('获取模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch('/api/agents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          configuration: JSON.parse(newTemplate.configuration),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setShowCreateModal(false);
        fetchTemplates();
        setNewTemplate({
          name: '',
          description: '',
          category: 'custom',
          icon: '📄',
          configuration: JSON.stringify({}, null, 2),
        });
      }
    } catch (error) {
      console.error('创建模板失败:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('确定要删除此模板吗？')) return;

    try {
      const res = await fetch(`/api/agents/templates?id=${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (result.success) {
        fetchTemplates();
      } else {
        alert(result.error?.message || '删除失败');
      }
    } catch (error) {
      console.error('删除模板失败:', error);
    }
  };

  const handleApplyTemplate = (template: Template) => {
    // 这里可以跳转到创建页面并带上模板配置
    // 或者打开模态框确认
    const configStr = JSON.stringify(template.configuration, null, 2);
    prompt('复制以下配置（JSON 格式）:', configStr);
  };

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', name: '全部', icon: '📋' },
    ...TEMPLATE_CATEGORIES,
  ];

  return (
    <div className="container mx-auto p-6">
      {/* 标题 */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">智能体模板库</h1>
          <p className="text-gray-600">
            使用预设模板快速创建智能体，或自定义专属模板
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm"
        >
          + 创建自定义模板
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无模板</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* 卡片头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-4xl mr-3">{template.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                {template.isPreset && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    预设
                  </span>
                )}
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* 使用次数 */}
              {template.usage_count !== undefined && (
                <p className="text-xs text-gray-500 mb-4">
                  使用次数：{template.usage_count}
                </p>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  应用
                </button>
                {!template.isPreset && (
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建模板模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">创建自定义模板</h2>

            <div className="space-y-4">
              {/* 名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={e =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：销售助手"
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={e =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="简要描述模板的用途和特点"
                />
              </div>

              {/* 分类和图标 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={e =>
                      setNewTemplate({
                        ...newTemplate,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TEMPLATE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    图标
                  </label>
                  <input
                    type="text"
                    value={newTemplate.icon}
                    onChange={e =>
                      setNewTemplate({ ...newTemplate, icon: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="📄"
                  />
                </div>
              </div>

              {/* 配置 JSON */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置 (JSON 格式) *
                </label>
                <textarea
                  value={newTemplate.configuration}
                  onChange={e =>
                    setNewTemplate({
                      ...newTemplate,
                      configuration: e.target.value,
                    })
                  }
                  rows={12}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder='{"model": "gpt-4", "temperature": 0.7}'
                />
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.configuration}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
