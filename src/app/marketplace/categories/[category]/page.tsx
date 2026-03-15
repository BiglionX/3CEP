/**
 * 智能体分类页面
 * FixCycle 6.0 智能体市场平台
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Grid,
  List,
  Filter,
  SlidersHorizontal,
  Search,
  Star,
  Download,
  Calendar,
  User,
  Tag,
} from 'lucide-react';

interface CategoryAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  price: number;
  token_cost_per_use: number;
  rating: number;
  download_count: number;
  developer: {
    name: string;
    avatar: string;
  };
  tags: string[];
  featured: boolean;
  created_at: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;

  const [agents, setAgents] = useState<CategoryAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<CategoryAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [ratingFilter, setRatingFilter] = useState(0);

  // 分类映射
  const categoryMap: Record<string, { name: string; description: string }> = {
    sales: {
      name: '销售智能体',
      description: '提升销售效率，自动化客户跟进和成交流程',
    },
    procurement: {
      name: '采购智能体',
      description: '优化采购流程，智能供应商管理和成本控制',
    },
    support: {
      name: '客服支持',
      description: '24/7智能客服，提升客户满意度和服务质量',
    },
    marketing: {
      name: '营销推广',
      description: '精准营销投放，自动化内容创作和渠道管理',
    },
    finance: {
      name: '财务管理',
      description: '智能财务分析，自动化账务处理和风险控制',
    },
    hr: {
      name: '人力资源',
      description: '人才招聘管理，员工绩效评估和培训发展',
    },
  };

  const categoryName = categoryMap[categorySlug].name || '未知分类';
  const categoryDescription = categoryMap[categorySlug].description || '';

  // 模拟数据
  const mockAgents: CategoryAgent[] = [
    {
      id: '1',
      name: `${categoryName}专家助手`,
      description: `专业的${categoryName}智能助手，具备行业专业知识和实践经验`,
      category: categorySlug,
      version: '2.1.0',
      price: 99.99,
      token_cost_per_use: 0.5,
      rating: 4.8,
      download_count: 1250,
      developer: {
        name: '行业专家团队',
        avatar: '',
      },
      tags: [categoryName, '专业版', '企业级'],
      featured: true,
      created_at: '2026-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: `智能${categoryName}机器人`,
      description: `基于AI的${categoryName}自动化解决方案，大幅提升工作效率`,
      category: categorySlug,
      version: '1.5.2',
      price: 149.99,
      token_cost_per_use: 0.8,
      rating: 4.6,
      download_count: 890,
      developer: {
        name: 'AI创新实验室',
        avatar: '',
      },
      tags: [categoryName, '自动化', '高效'],
      featured: false,
      created_at: '2026-01-20T09:15:00Z',
    },
    {
      id: '3',
      name: `${categoryName}大师版`,
      description: `企业级${categoryName}管理平台，集成多项高级功能`,
      category: categorySlug,
      version: '3.0.1',
      price: 299.99,
      token_cost_per_use: 1.2,
      rating: 4.9,
      download_count: 2100,
      developer: {
        name: '企业服务集团',
        avatar: '',
      },
      tags: [categoryName, '企业版', '高级功能'],
      featured: true,
      created_at: '2026-02-01T11:20:00Z',
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
      setIsLoading(false);
    }, 800);
  }, [categorySlug]);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchTerm, sortBy, priceRange, ratingFilter]);

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        agent =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // 价格范围过滤
    filtered = filtered.filter(
      agent => agent.price >= priceRange[0] && agent.price <= priceRange[1]
    );

    // 评分过滤
    if (ratingFilter > 0) {
      filtered = filtered.filter(agent => agent.rating >= ratingFilter);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.download_count - a.download_count;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default: // featured
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
      }
    });

    setFilteredAgents(filtered);
  };

  const formatPrice = (price: number) => {
    return price === 0  '免费' : `¥${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载分类数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      {/* 分类头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              {categoryDescription}
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{agents.length}</div>
                <div className="text-blue-200">智能体</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {agents.reduce((sum, agent) => sum + agent.download_count, 0)}
                </div>
                <div className="text-blue-200">总下载量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {agents.filter(a => a.featured).length}
                </div>
                <div className="text-blue-200">精选推荐</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选和排序栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索智能体..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 价格范围 */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={`${priceRange[0]}-${priceRange[1]}`}
                onChange={e => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  setPriceRange([min, max]);
                }}
              >
                <option value="0-100">¥0 - ¥100</option>
                <option value="100-300">¥100 - ¥300</option>
                <option value="300-500">¥300 - ¥500</option>
                <option value="0-500">全部价格</option>
              </select>
            </div>

            {/* 评分筛选 */}
            <div className="flex items-center space-x-2">
              <Star className="text-gray-500 w-5 h-5" />
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={ratingFilter}
                onChange={e => setRatingFilter(Number(e.target.value))}
              >
                <option value="0">全部评分</option>
                <option value="4.5">4.5星以上</option>
                <option value="4">4星以上</option>
                <option value="3.5">3.5星以上</option>
              </select>
            </div>

            {/* 排序选项 */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="text-gray-500 w-5 h-5" />
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="featured">推荐排序</option>
                <option value="rating">评分最高</option>
                <option value="downloads">下载最多</option>
                <option value="price-low">价格最低</option>
                <option value="price-high">价格最高</option>
                <option value="newest">最新发布</option>
              </select>
            </div>
          </div>

          {/* 视图切换 */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid'  'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list'  'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-6">
          <p className="text-gray-600">
            找到{' '}
            <span className="font-semibold text-gray-900">
              {filteredAgents.length}
            </span>{' '}
            个智能体
          </p>
        </div>

        {/* 智能体列表 */}
        <div
          className={
            viewMode === 'grid'
               'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === 'list'  'p-6' : 'p-6'
              }`}
              onClick={() => router.push(`/marketplace/${agent.id}`)}
            >
              <div
                className={
                  viewMode === 'grid'
                     'h-full flex flex-col'
                    : 'flex items-start space-x-4'
                }
              >
                {/* 头部信息 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {agent.name}
                        </h3>
                        {agent.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            精选
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {agent.description}
                      </p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {agent.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {agent.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{agent.tags.length - 3} 更多
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{agent.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{agent.download_count}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>v{agent.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{agent.developer.name}</span>
                    </div>
                  </div>

                  {/* 价格和操作按钮 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(agent.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {agent.token_cost_per_use} Token/次
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium"
                        onClick={e => {
                          e.stopPropagation();
                          // 实现获取逻辑
                        }}
                      >
                        获取
                      </button>
                      <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/marketplace/${agent.id}`);
                        }}
                      >
                        详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              未找到匹配的智能体
            </h3>
            <p className="text-gray-500">尝试调整筛选条件或浏览其他分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
