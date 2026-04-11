/**
 * 智能体市场主页面 - FixCycle 6.0 智能体市场平台 */
'use client';

import {
  Calendar,
  Download,
  Filter,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarketplaceAgent {
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
  updated_at: string;
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<MarketplaceAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // 模拟数据 - 实际开发中从API获取
  const mockAgents: MarketplaceAgent[] = [
    {
      id: '1',
      name: '销售助手智能体',
      description: '专业的销售对话助手，能够自动跟进客户、生成报价单和合同',
      category: 'sales',
      version: '2.1.0',
      price: 99.99,
      token_cost_per_use: 0.5,
      rating: 4.8,
      download_count: 1250,
      developer: {
        name: 'AI Solutions Inc.',
        avatar: '',
      },
      tags: ['销售', 'CRM', '自动化'],
      featured: true,
      created_at: '2026-01-15T10:30:00Z',
      updated_at: '2026-02-28T14:22:00Z',
    },
    {
      id: '2',
      name: '采购智能助手',
      description: '智能采购决策助手，支持供应商比价、风险评估和合同管理',
      category: 'procurement',
      version: '1.5.2',
      price: 149.99,
      token_cost_per_use: 0.8,
      rating: 4.6,
      download_count: 890,
      developer: {
        name: 'Procurement Pro',
        avatar: '',
      },
      tags: ['采购', '供应链', '成本优化'],
      featured: true,
      created_at: '2026-01-20T09:15:00Z',
      updated_at: '2026-02-25T16:45:00Z',
    },
    {
      id: '3',
      name: '客服支持机器人',
      description: '24/7智能客服支持，支持多语言、情绪识别和问题升级',
      category: 'support',
      version: '3.0.1',
      price: 79.99,
      token_cost_per_use: 0.3,
      rating: 4.9,
      download_count: 2100,
      developer: {
        name: 'Customer Care AI',
        avatar: '',
      },
      tags: ['客服', '支持', '多语言'],
      featured: false,
      created_at: '2026-02-01T11:20:00Z',
      updated_at: '2026-02-29T09:30:00Z',
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchTerm, selectedCategory, sortBy]);

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

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
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

  const _getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sales: '销售',
      procurement: '采购',
      support: '客服',
      marketing: '营销',
      finance: '财务',
      hr: '人力资源',
      all: '全部',
    };
    return labels[category] || category;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `¥${price.toFixed(2)}`;
  };

  const _formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载智能体市场中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">智能体市场</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              发现、获取和管理企业级AI智能体，像招聘员工一样轻松使用AI助手
            </p>
            <div className="mt-8 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{agents.length}</div>
                <div className="text-blue-200">可用智能体</div>
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

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和过滤栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索智能体名称、描述或标签..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                <option value="sales">销售</option>
                <option value="procurement">采购</option>
                <option value="support">客服</option>
                <option value="marketing">营销</option>
                <option value="finance">财务</option>
                <option value="hr">人力资源</option>
              </select>
            </div>

            {/* 排序选项 */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="text-gray-500 w-5 h-5" />
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* 视图切换 */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 智能体列表 */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'p-6' : 'p-6'
              }`}
            >
              <div
                className={
                  viewMode === 'grid'
                    ? 'h-full flex flex-col'
                    : 'flex items-start space-x-4'
                }
              >
                {/* 头部信息 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        {agent.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            精选
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {agent.description}
                      </p>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {agent.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
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
                        {agent.token_cost_per_use} Token/次使用
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium">
                        获取
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
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
            <p className="text-gray-500">尝试调整搜索条件或浏览其他分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
