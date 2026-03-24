'use client';

interface Filters {
  search: string;
  category: string;
  reviewStatus: string;
  shelfStatus: string;
  sortBy: string;
  sortOrder: string;
}

interface SkillFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function SkillFilters({ filters, onChange }: SkillFiltersProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 搜索框 */}
        <div className="lg:col-span-2">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            搜索
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            placeholder="Skill 名称或描述"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* 分类筛选 */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            分类
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={e => handleChange('category', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="code_generation">代码生成</option>
            <option value="data_processing">数据处理</option>
            <option value="automation">自动化</option>
            <option value="integration">集成工具</option>
            <option value="analytics">分析工具</option>
            <option value="testing">测试工具</option>
            <option value="documentation">文档工具</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 审核状态 */}
        <div>
          <label
            htmlFor="reviewStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            审核状态
          </label>
          <select
            id="reviewStatus"
            value={filters.reviewStatus}
            onChange={e => handleChange('reviewStatus', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>

        {/* 上下架状态 */}
        <div>
          <label
            htmlFor="shelfStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            上下架
          </label>
          <select
            id="shelfStatus"
            value={filters.shelfStatus}
            onChange={e => handleChange('shelfStatus', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="on_shelf">上架中</option>
            <option value="off_shelf">已下架</option>
            <option value="suspended">已暂停</option>
          </select>
        </div>

        {/* 排序方式 */}
        <div>
          <label
            htmlFor="sortBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            排序
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={e => handleChange('sortBy', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="created_at">创建时间</option>
            <option value="updated_at">更新时间</option>
            <option value="name">名称</option>
            <option value="price">价格</option>
          </select>
        </div>

        {/* 排序方向 */}
        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            顺序
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder}
            onChange={e => handleChange('sortOrder', e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>
    </div>
  );
}
