'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Zap,
  CreditCard,
  BookOpen,
  Star,
  Download,
  ExternalLink,
  Check,
  Loader2,
  Monitor,
  Cloud,
  Shield,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  version: string;
  pricing: {
    type: string;
    price: number;
    tokenPrice?: number;
  };
  tags: string[];
}

export default function AgentStorePage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);

  // 检查已安装的智能体
  useEffect(() => {
    checkInstalledAgents();
  }, []);

  const checkInstalledAgents = async () => {
    try {
      const response = await fetch('/api/agents/install');
      const result = await response.json();
      if (result.success && result.data) {
        const ids = new Set(result.data.map((item: any) => item.agent_id));
        setInstalledIds(ids);
      }
    } catch (error) {
      console.error('检查已安装智能体失败:', error);
    }
  };

  const handleInstallClick = (agentId: string) => {
    // 先检查登录状态
    checkLoginAndInstall(agentId);
  };

  const checkLoginAndInstall = async (agentId: string) => {
    const authResponse = await fetch('/api/session/me');
    const authResult = await authResponse.json();

    if (!authResult.isAuthenticated) {
      router.push('/login?redirect=/agent-store');
      return;
    }

    // 弹出选择运行方式
    setPendingAgentId(agentId);
    setShowInstallModal(true);
  };

  const confirmInstall = async (runtimeType: 'desktop' | 'cloud') => {
    if (!pendingAgentId) return;

    setShowInstallModal(false);
    setInstallingId(pendingAgentId);

    try {
      const response = await fetch('/api/agents/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: pendingAgentId,
          runtimeType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setInstalledIds(prev => new Set([...prev, pendingAgentId]));

        if (runtimeType === 'desktop') {
          setNotification({
            type: 'success',
            message: `${result.data.agent.name} 安装成功！请下载桌面端使用`,
          });
        } else {
          setNotification({
            type: 'success',
            message: `${result.data.agent.name} 云托管开通成功！`,
          });
        }
      } else if (result.installed) {
        setNotification({ type: 'error', message: '该智能体已安装' });
      } else {
        setNotification({ type: 'error', message: result.error || '安装失败' });
      }
    } catch (error) {
      console.error('安装失败:', error);
      setNotification({ type: 'error', message: '安装失败，请稍后重试' });
    } finally {
      setInstallingId(null);
      setPendingAgentId(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents?status=active&limit=20');
      const result = await response.json();
      if (result.success && result.data) {
        setAgents(result.data);
      }
    } catch (error) {
      console.error('加载智能体失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: '全部', code: 'all', icon: '🔮', count: agents.length },
    {
      name: '诊断类',
      code: 'DIAG',
      icon: '🔍',
      count: agents.filter(a => a.category === 'DIAG').length,
    },
    {
      name: '估价类',
      code: 'ESTM',
      icon: '💰',
      count: agents.filter(a => a.category === 'ESTM').length,
    },
    {
      name: '客服类',
      code: 'SERVICE',
      icon: '🏪',
      count: agents.filter(a => a.category === 'SERVICE').length,
    },
    {
      name: '配件类',
      code: 'PART',
      icon: '🔧',
      count: agents.filter(a => a.category === 'PART').length,
    },
  ];

  const filteredAgents =
    selectedCategory === 'all'
      ? agents
      : agents.filter(a => a.category === selectedCategory);

  const getPriceDisplay = (pricing: Agent['pricing']) => {
    if (pricing.type === 'free') return '免费';
    if (pricing.type === 'subscription') return `¥${pricing.price}/月`;
    if (pricing.type === 'token') return `¥${pricing.tokenPrice}/1K tokens`;
    // 默认每个智能体 ¥19/月
    return '¥19/月';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* 通知提示 */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : null}
          {notification.message}
        </div>
      )}

      {/* 选择运行方式弹窗 */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              选择运行方式
            </h3>
            <p className="text-gray-600 mb-6">请选择智能体的运行方式：</p>

            <div className="space-y-4">
              <button
                onClick={() => confirmInstall('desktop')}
                className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">桌面端</div>
                    <div className="text-sm text-gray-500">
                      免费下载安装，本地运行
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => confirmInstall('cloud')}
                className="w-full p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Cloud className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">云托管</div>
                    <div className="text-sm text-gray-500">
                      ¥300/年，云端运行
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="mt-6 w-full px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              ProCyc 智能体商店
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              发现、安装和使用面向 3C 售后领域的专业 AI 智能体
            </p>

            {/* 运行环境选择说明 */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  桌面端（免费）
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                <Cloud className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-medium">
                  云托管 ¥300/年
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/agents"
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                浏览所有智能体
              </Link>
              <Link
                href="/agents"
                className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                创建自己的智能体
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 运行方式说明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            选择运行方式
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* 桌面端 */}
            <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-lg">桌面端（推荐）</h3>
              </div>
              <p className="text-gray-600 mb-4">
                下载安装桌面客户端，智能体在本地运行
              </p>
              <p className="text-4xl font-bold text-blue-600">免费</p>
              <ul className="text-sm text-gray-500 mt-4 space-y-1">
                <li>• 无需服务器资源</li>
                <li>• 数据本地存储，更安全</li>
                <li>• 完全离线使用</li>
                <li>• 与云端同步备份数据</li>
              </ul>
            </div>
            {/* 云托管 */}
            <div className="border-2 border-purple-500 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-lg">云托管</h3>
              </div>
              <p className="text-gray-600 mb-4">
                智能体在云端运行，随时随地访问
              </p>
              <p className="text-4xl font-bold text-purple-600">
                ¥300
                <span className="text-lg font-normal text-gray-500">/年</span>
              </p>
              <ul className="text-sm text-gray-500 mt-4 space-y-1">
                <li>• 无需安装，随时使用</li>
                <li>• 多设备同步</li>
                <li>• 自动备份数据</li>
                <li>• 专业运维保障</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">
            💡 商业用户请选择桌面端以降低运营成本
          </p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.code
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
            >
              {cat.icon} {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Agent 列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {selectedCategory === 'all'
            ? '全部智能体'
            : categories.find(c => c.code === selectedCategory)?.name}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {agent.status === 'active' ? '已发布' : '草稿'}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {agent.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {agent.description || '暂无描述'}
                </p>

                {/* 价格 */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-purple-600">
                    {getPriceDisplay(agent.pricing)}
                  </span>
                </div>

                {/* 标签 */}
                {agent.tags && agent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {installedIds.has(agent.id) ? (
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 cursor-default"
                      disabled
                    >
                      <Check className="w-4 h-4" />
                      已安装
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstallClick(agent.id)}
                      disabled={installingId === agent.id}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {installingId === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {installingId === agent.id ? '安装中...' : '安装'}
                    </button>
                  )}
                  <Link
                    href={`/agents/${agent.id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无智能体</p>
            <Link
              href="/agents"
              className="text-purple-600 hover:underline mt-2 inline-block"
            >
              创建第一个智能体
            </Link>
          </div>
        )}
      </div>

      {/* 使用方法 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            使用方法
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">浏览商店</h3>
              <p className="text-sm text-gray-600">
                在智能体商店浏览各类 AI 智能体
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">选择订阅</h3>
              <p className="text-sm text-gray-600">选择订阅套餐或按量付费</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">安装使用</h3>
              <p className="text-sm text-gray-600">
                一键安装，开始使用智能体服务
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">监控流量</h3>
              <p className="text-sm text-gray-600">
                在个人中心查看使用量和费用
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-indigo-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              创建你的专属智能体
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              使用可视化编排工具，无需编码即可创建定制化的 AI 智能体
            </p>
            <Link
              href="/agents"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              开始创建
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
