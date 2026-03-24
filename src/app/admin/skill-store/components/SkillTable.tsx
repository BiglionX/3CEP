'use client';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  review_status: 'pending' | 'approved' | 'rejected';
  shelf_status: 'on_shelf' | 'off_shelf' | 'suspended';
  developer_id: string;
  created_at: string;
  updated_at: string;
}

interface SkillTableProps {
  skills: Skill[];
  loading: boolean;
  onApprove: (skill: Skill) => void;
  onToggleStatus: (skillId: string, currentStatus: string) => void;
}

export function SkillTable({
  skills,
  loading,
  onApprove,
  onToggleStatus,
}: SkillTableProps) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-gray-500">暂无 Skill 数据</p>
          </div>
        </div>
      </div>
    );
  }

  // 获取状态文本
  const getReviewStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
            待审核
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
            已通过
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
            已驳回
          </span>
        );
      default:
        return status;
    }
  };

  const getShelfStatusText = (status: string) => {
    switch (status) {
      case 'on_shelf':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
            上架中
          </span>
        );
      case 'off_shelf':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
            已下架
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
            已暂停
          </span>
        );
      default:
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      code_generation: '代码生成',
      data_processing: '数据处理',
      automation: '自动化',
      integration: '集成工具',
      analytics: '分析工具',
      testing: '测试工具',
      documentation: '文档工具',
      other: '其他',
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill 信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                价格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                审核状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                上下架状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skills.map(skill => (
              <tr key={skill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {skill.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {skill.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {getCategoryText(skill.category)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    ¥{skill.price}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getReviewStatusText(skill.review_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getShelfStatusText(skill.shelf_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {skill.review_status === 'pending' && (
                    <button
                      onClick={() => onApprove(skill)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      审核
                    </button>
                  )}
                  {(skill.review_status === 'approved' ||
                    skill.shelf_status !== 'off_shelf') && (
                    <button
                      onClick={() =>
                        onToggleStatus(skill.id, skill.shelf_status)
                      }
                      className="text-green-600 hover:text-green-900"
                    >
                      {skill.shelf_status === 'on_shelf' ? '下架' : '上架'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
