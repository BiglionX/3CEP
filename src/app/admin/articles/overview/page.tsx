'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit3,
  Eye,
  Trash2,
  Filter,
  Search,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  authors: {
    name: string;
  } | null;
  article_categories: {
    name: string;
  } | null;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  todayViews: number;
}

export default function ArticlesOverviewPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    todayViews: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');

  // 获取文章统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/articles/stats');
      const result = await response.json();

      if (response.ok) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        sortBy,
      });

      const response = await fetch(`/api/admin/articles?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setArticles(result.data || []);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchArticles();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { text: '草稿', color: 'bg-yellow-100 text-yellow-800' },
      published: { text: '已发?, color: 'bg-green-100 text-green-800' },
      archived: { text: '已归?, color: 'bg-gray-100 text-gray-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题和操作按?*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理和维护平台的所有文章内?          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/articles/edit/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    总文章数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.total}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    已发?                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.published}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    草稿
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.draft}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    今日浏览
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.todayViews}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索?*/}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索文章标题..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 状态筛?*/}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有状?/option>
              <option value="published">已发?/option>
              <option value="draft">草稿</option>
              <option value="archived">已归?/option>
            </select>

            {/* 排序方式 */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updated_at">最近更?/option>
              <option value="created_at">创建时间</option>
              <option value="view_count">浏览?/option>
              <option value="like_count">点赞?/option>
            </select>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {articles.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="text-gray-400">
                <Edit3 className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  暂无文章
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  开始创建您的第一篇文章吧
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/articles/edit/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新建文章
                  </Link>
                </div>
              </div>
            </li>
          ) : (
            articles.map(article => (
              <li key={article.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(article.status)}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {article.summary || '暂无摘要'}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>{article?.name || '未知作?}</span>
                        <span className="mx-2">�?/span>
                        <span>{article?.name || '未分?}</span>
                        <span className="mx-2">�?/span>
                        <span>创建?{formatDate(article.created_at)}</span>
                        {article.updated_at !== article.created_at && (
                          <>
                            <span className="mx-2">�?/span>
                            <span>更新?{formatDate(article.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.view_count}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-1">👍</span>
                        {article.like_count}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        💬 {article.comment_count}
                      </div>
                      <div className="flex space-x-1">
                        <Link
                          href={`/articles/${article.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-500"
                          title="预览"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/edit/${article.id}`}
                          className="p-2 text-gray-400 hover:text-gray-500"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

