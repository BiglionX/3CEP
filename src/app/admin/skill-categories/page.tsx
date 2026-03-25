'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  name_en: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function SkillCategoriesPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-categories')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载分类列表
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/skill-categories/list');
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('加载分类失败:', result.error);
        alert(`加载失败：${result.error}`);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadCategories();
    }
  }, [isAuthenticated, is_admin]);

  // 打开新增模态框
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      name_en: '',
      description: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setShowAddModal(true);
  };

  // 打开编辑模态框
  const handleOpenEdit = (category: Category) => {
    setFormData({
      name: category.name,
      name_en: category.name_en,
      description: category.description || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setEditingCategory(category);
    setShowAddModal(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? '/api/admin/skill-categories/update'
        : '/api/admin/skill-categories/create';

      const payload = {
        ...(editingCategory && { id: editingCategory.id }),
        name: formData.name,
        name_en: formData.name_en,
        description: formData.description,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(editingCategory ? '分类更新成功!' : '分类创建成功!');
        setShowAddModal(false);
        setEditingCategory(null);
        loadCategories();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error: any) {
      console.error('操作失败:', error);
      alert(`操作失败：${error.message || '请重试'}`);
    }
  };

  // 删除分类
  const handleDelete = async (categoryId: string) => {
    if (!confirm('确定要删除这个分类吗？')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/skill-categories/delete?id=${categoryId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('分类删除成功!');
        loadCategories();
      } else {
        alert(`删除失败：${result.error}`);
      }
    } catch (error: any) {
      console.error('删除失败:', error);
      alert(`删除失败：${error.message || '请重试'}`);
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
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理 Skill 分类，当前共 {categories.length} 个分类
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          添加分类
        </button>
      </div>

      {/* 分类列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无分类</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    中文名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    英文名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {category.sort_order}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {category.name_en}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.is_active ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString(
                        'zh-CN'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 新增/编辑模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingCategory ? '编辑分类' : '添加分类'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        中文名称 *
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

                    <div>
                      <label
                        htmlFor="name_en"
                        className="block text-sm font-medium text-gray-700"
                      >
                        英文名称 *
                      </label>
                      <input
                        type="text"
                        id="name_en"
                        required
                        value={formData.name_en}
                        onChange={e =>
                          setFormData({ ...formData, name_en: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="例如：tools-productivity"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        描述
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="sort_order"
                        className="block text-sm font-medium text-gray-700"
                      >
                        排序
                      </label>
                      <input
                        type="number"
                        id="sort_order"
                        value={formData.sort_order}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            sort_order: parseInt(e.target.value, 10),
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is_active"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        启用此分类
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingCategory ? '保存' : '添加'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>分类用于组织和管理 Skills</li>
          <li>英文名称将用作 URL 和 API 标识</li>
          <li>排序数字越小越靠前</li>
          <li>禁用的分类将不再显示在创建页面</li>
        </ul>
      </div>
    </div>
  );
}
