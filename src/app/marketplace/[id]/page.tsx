/**
 * 智能体详情页面
 * FixCycle 6.0 智能体市场平台
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Download,
  ShoppingCart,
  Heart,
  Share2,
  Play,
  Code,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface AgentDetail {
  id: string;
  name: string;
  description: string;
  long_description: string;
  category: string;
  version: string;
  price: number;
  token_cost_per_use: number;
  rating: number;
  download_count: number;
  developer: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  featured: boolean;
  screenshots: string[];
  documentation_url: string;
  demo_video_url: string;
  requirements: string[];
  features: string[];
  changelog: {
    version: string;
    date: string;
    changes: string[];
  }[];
  reviews: {
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    rating: number;
    comment: string;
    date: string;
  }[];
  created_at: string;
  updated_at: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // 模拟数据
  const mockAgent: AgentDetail = {
    id: agentId,
    name: '销售助手智能体',
    description: '专业的销售对话助手，能够自动跟进客户、生成报价单和合同',
    long_description: `这是一个功能强大的销售助手智能体，专为企业销售团队设计。它能够：

• 自动跟进潜在客户，发送个性化邮件和消息
• 根据客户需求生成定制化的报价单和合同
• 分析客户行为，提供销售建议和预测
• 集成CRM系统，同步客户数据
• 支持多语言沟通，拓展国际市场

该智能体采用最新的AI技术，经过大量销售场景训练，能够显著提升销售效率和转化率。`,
    category: 'sales',
    version: '2.1.0',
    price: 99.99,
    token_cost_per_use: 0.5,
    rating: 4.8,
    download_count: 1250,
    developer: {
      name: 'AI Solutions Inc.',
      avatar: '',
      verified: true,
    },
    tags: ['销售', 'CRM', '自动化', '客户跟进', '报价生成'],
    featured: true,
    screenshots: [
      '/api/placeholder/800/450',
      '/api/placeholder/800/450',
      '/api/placeholder/800/450',
    ],
    documentation_url: '#',
    demo_video_url: '#',
    requirements: [
      '支持OpenAI API密钥',
      'Node.js 16+ 环境',
      '至少2GB内存',
      '稳定的网络连接',
    ],
    features: [
      '智能客户跟进',
      '自动报价生成',
      '合同模板管理',
      '销售数据分析',
      '多语言支持',
      'CRM系统集成',
    ],
    changelog: [
      {
        version: '2.1.0',
        date: '2026-02-28',
        changes: ['新增多语言支持功能', '优化客户跟进算法', '修复部分已知bug'],
      },
      {
        version: '2.0.0',
        date: '2026-01-15',
        changes: ['重构核心架构', '新增合同生成功能', '提升响应速度30%'],
      },
    ],
    reviews: [
      {
        id: '1',
        user: {
          name: '张经理',
          avatar: '',
        },
        rating: 5,
        comment:
          '非常好用的销售助手！自从用了这个智能体，我们的销售效率提升了40%，强烈推荐！',
        date: '2026-02-25',
      },
      {
        id: '2',
        user: {
          name: '李总监',
          avatar: '',
        },
        rating: 4,
        comment:
          '功能很全面，特别是自动生成报价单的功能非常实用。不过希望能增加更多自定义选项。',
        date: '2026-02-20',
      },
    ],
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-02-28T14:22:00Z',
  };

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setAgent(mockAgent);
      setIsLoading(false);
    }, 800);
  }, [agentId]);

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `¥${price.toFixed(2)}`;
  };

  const addToCart = () => {
    // 实现加入购物车逻辑
    alert(`已将 ${agent.name} 加入购物车`);
  };

  const buyNow = () => {
    // 实现立即购买逻辑
    alert(`开始购买 ${agent.name}`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载智能体详情中...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            智能体未找到
          </h2>
          <p className="text-gray-600 mb-6">
            抱歉，您查找的智能体不存在或已被移除
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            返回上一页
          </button>
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
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区 */}
          <div className="lg:col-span-2">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {agent.name}
                    </h1>
                    {agent.featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Star className="w-4 h-4 mr-1" />
                        精选推荐
                      </span>
                    )}
                    {agent.developer.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        认证开发者
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-lg mb-4">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{agent.rating} 评分</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      <span>{agent.download_count.toLocaleString()} 下载</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>版本 {agent.version}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>by {agent.developer.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end space-y-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(agent.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {agent.token_cost_per_use} Token/次使用
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={toggleFavorite}
                      className={`p-3 rounded-lg border transition-colors ${
                        isFavorite
                           'bg-red-50 border-red-200 text-red-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 详情标签页 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 标签页头部 */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: '概览', icon: FileText },
                    { id: 'features', label: '功能', icon: Zap },
                    { id: 'requirements', label: '要求', icon: CheckCircle },
                    { id: 'changelog', label: '更新日志', icon: Clock },
                    { id: 'reviews', label: '评价', icon: MessageSquare },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                           'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* 标签页内容 */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      详细介绍
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {agent.long_description}
                    </p>

                    {agent.screenshots.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          截图预览
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {agent.screenshots.map((screenshot, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 rounded-lg overflow-hidden"
                            >
                              <img
                                src={screenshot}
                                alt={`截图 ${index + 1}`}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      主要功能
                    </h3>
                    <ul className="space-y-3">
                      {agent.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      系统要求
                    </h3>
                    <ul className="space-y-3">
                      {agent.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'changelog' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      版本更新记录
                    </h3>
                    <div className="space-y-6">
                      {agent.changelog.map((version, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-200 pl-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              版本 {version.version}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {version.date}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {version.changes.map((change, changeIndex) => (
                              <li
                                key={changeIndex}
                                className="text-gray-600 text-sm"
                              >
                                • {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      用户评价
                    </h3>
                    <div className="space-y-6">
                      {agent.reviews.map(review => (
                        <div
                          key={review.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {review.user.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {review.user.name}
                                </div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                           'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 购买操作 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                获取此智能体
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">价格</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(agent.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Token消耗</span>
                  <span>{agent.token_cost_per_use} Token/次</span>
                </div>

                {agent.price > 0 && (
                  <div className="flex items-center space-x-3">
                    <label className="text-gray-600">数量:</label>
                    <select
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      {[1, 2, 3, 5, 10].map(num => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <button
                    onClick={buyNow}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>立即获取</span>
                  </button>

                  <button
                    onClick={addToCart}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>加入购物车</span>
                  </button>

                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <Play className="w-5 h-5" />
                    <span>试用演示</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 开发者信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                开发者信息
              </h3>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {agent.developer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {agent.developer.name}
                  </div>
                  {agent.developer.verified && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Shield className="w-4 h-4 mr-1" />
                      认证开发者
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>入驻时间</span>
                  <span>
                    {new Date(agent.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>发布作品</span>
                  <span>12 个智能体</span>
                </div>
                <div className="flex justify-between">
                  <span>总体评分</span>
                  <span>4.7/5.0</span>
                </div>
              </div>
            </div>

            {/* 快速链接 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                快速链接
              </h3>

              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>查看完整文档</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <Code className="w-5 h-5" />
                  <span>API参考</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>观看演示视频</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
