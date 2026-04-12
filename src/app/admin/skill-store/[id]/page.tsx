/**
 * Skill 详情页面
 * /admin/skill-store/[id]
 */

'use client';

import { SkillVersionHistory } from '@/components/skill/SkillVersionHistory';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import type { Skill } from '@/types/skill';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  FileText,
  GitBranch,
  User,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // 认证检查
  useEffect(() => {
    if ((!isLoading && !isAuthenticated) || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/admin/skill-store/${params.id}`)}`;
    }
  }, [isAuthenticated, is_admin, isLoading, params.id]);

  // 加载 Skill 详情和版本历史
  useEffect(() => {
    async function fetchSkill() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/skill-store/list?id=${params.id}`
        );
        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          setSkill(result.data[0]);
        } else {
          setError('Skill 不存在');
        }

        // 加载版本历史
        loadVersions();
      } catch (err: any) {
        console.error('获取 Skill 详情失败:', err);
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    }

    const loadVersions = async () => {
      try {
        const response = await fetch(
          `/api/admin/skill-store/${params.id}/versions`
        );
        const result = await response.json();
        if (result.success) {
          setVersions(result.data);
        }
      } catch (error) {
        console.error('加载版本历史失败:', error);
      }
    };

    if (params.id) {
      fetchSkill();
    }
  }, [params.id]);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载 Skill 详情...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            {error || 'Skill 不存在'}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  // 状态标签配置
  const statusConfig = {
    review_status: {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '待审核' },
      approved: { color: 'bg-green-100 text-green-800', label: '已通过' },
      rejected: { color: 'bg-red-100 text-red-800', label: '已驳回' },
      draft: { color: 'bg-gray-100 text-gray-800', label: '草稿' },
    },
    shelf_status: {
      on_shelf: { color: 'bg-green-100 text-green-800', label: '已上架' },
      off_shelf: { color: 'bg-gray-100 text-gray-800', label: '已下架' },
      suspended: { color: 'bg-red-100 text-red-800', label: '已暂停' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/skill-store"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                返回列表
              </Link>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 状态标签 */}
        <div className="mb-6 flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.review_status[skill.review_status].color}`}
          >
            {statusConfig.review_status[skill.review_status].label}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.shelf_status[skill.shelf_status].color}`}
          >
            {statusConfig.shelf_status[skill.shelf_status].label}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {skill.category}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 描述卡片 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                技能描述
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {skill.description}
              </p>
            </div>

            {/* 技术信息 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                技术信息
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">GitHub 仓库</span>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <span className="mr-1">查看代码</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">文档地址</span>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <span className="mr-1">查看文档</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">演示地址</span>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <span className="mr-1">体验 Demo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 版本历史 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <GitBranch className="w-5 h-5 mr-2" />
                  版本历史
                </h2>
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showVersions ? '收起' : '展开全部'}
                </button>
              </div>

              {showVersions && (
                <SkillVersionHistory
                  versions={versions}
                  onRollback={_versionId => {
                    if (confirm('确定要回滚到这个版本吗？')) {
                      // TODO: 调用回滚 API
                      alert('回滚功能开发中...');
                    }
                  }}
                />
              )}

              {!showVersions && versions.length > 0 && (
                <div className="text-sm text-gray-500">
                  共 {versions.length} 个版本 · 当前版本：v
                  {versions[0]?.new_version}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            {/* 基础信息卡片 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                基础信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    价格
                  </span>
                  <span className="font-semibold text-gray-900">
                    ¥{skill.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    开发者 ID
                  </span>
                  <span className="font-mono text-sm text-gray-700">
                    {skill.developer_id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    创建时间
                  </span>
                  <span className="text-sm text-gray-700">
                    {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    更新时间
                  </span>
                  <span className="text-sm text-gray-700">
                    {new Date(skill.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 运营数据卡片 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                运营数据
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600 mt-1">浏览量</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600 mt-1">下载量</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-600 mt-1">使用次数</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">0.0</div>
                  <div className="text-xs text-gray-600 mt-1">评分</div>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                快速操作
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  通过审核
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  驳回申请
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  切换上下架
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
