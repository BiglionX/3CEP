'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  authors: {
    name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  article_categories: {
    name: string;
    slug: string;
    description: string | null;
  } | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  summary: string;
  cover_image_url: string | null;
  created_at: string;
  article_categories: {
    name: string;
  } | null;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}`);
      const result = await response.json();

      if (response.ok) {
        setArticle(result.data);
        setRelatedArticles(result.relatedArticles || []);

        // 检查用户是否已点赞
        await checkLikeStatus();
      } else {
        console.error('获取文章详情失败:', result.error);
        // 显示错误信息
        setArticle({
          id: 'error',
          title: '文章未找到',
          summary: '抱歉，您访问的文章不存在或已被删除',
          content: '<p>请返回文章列表查看其他内容</p>',
          cover_image_url: null,
          tags: [],
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          authors: null,
          article_categories: null,
        } as Article);
      }
    } catch (error) {
      console.error('获取文章详情错误:', error);
      // 显示网络错误
      setArticle({
        id: 'network-error',
        title: '网络连接异常',
        summary: '无法连接到服务器，请检查网络连接或稍后重试',
        content: '<p>请检查您的网络连接后重试</p>',
        cover_image_url: null,
        tags: [],
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        authors: null,
        article_categories: null,
      } as Article);
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/like`);
      const result = await response.json();

      if (response.ok) {
        setLiked(result.liked);
      }
    } catch (error) {
      console.error('检查点赞状态失败:', error);
    }
  };

  const handleLike = async () => {
    if (!article || likeLoading) return;

    try {
      setLikeLoading(true);
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: liked ? 'unlike' : 'like',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setLiked(!liked);
        setArticle({
          ...article,
          like_count: result.like_count,
        });

        // 显示操作反馈
        const message = liked ? '已取消点赞' : '点赞成功！';
        // 这里可以添加一个临时的消息提示
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(message)} else {
        console.error('点赞操作失败:', result.error);
        // 可以添加错误提示
        alert('操作失败，请重试');
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      alert('网络错误，请重试');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        // 显示复制成功的提示
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享操作失败:', error);
      // 降级处理：直接复制链接
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      } catch (copyError) {
        console.error('复制链接失败:', copyError);
        alert('分享功能暂不可用');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载文章中...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">文章不存在</h3>
          <p className="mt-1 text-gray-500">
            抱歉，您访问的文章不存在或已被删除
          </p>
          <div className="mt-6">
            <Link
              href="/articles"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回文章列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/articles"
                className="text-xl font-bold text-gray-900"
              >
                FixCycle 知识库
              </Link>
            </div>
            <nav className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/articles"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  文章中心
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 封面图片 */}
          {article.cover_image_url && (
            <div className="relative h-64 md:h-80">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}

          {/* 文章主体 */}
          <div className="p-6 md:p-8">
            {/* 分类标签 */}
            {article.article_categories && (
              <div className="mb-4">
                <Link
                  href={`/articles?category=${article.article_categories.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {article.article_categories.name}
                </Link>
              </div>
            )}

            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* 摘要 */}
            {article.summary && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* 作者和统计信息 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center mb-4 sm:mb-0">
                {/* 作者头像 */}
                {article?.avatar_url ? (
                  <img
                    src={article.authors.avatar_url}
                    alt={article.authors.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {article?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {article?.name || '匿名作者'}
                  </p>
                  {article?.bio && (
                    <p className="text-xs text-gray-500 mt-1">
                      {article.authors.bio}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    发布于{' '}
                    {new Date(article.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* 统计和互动按钮 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {article.view_count.toLocaleString()}
                </div>

                <button
                  onClick={handleLike}
                  className={`flex items-center text-sm ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill={liked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {article.like_count.toLocaleString()}
                </button>

                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {article.comment_count.toLocaleString()}
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center text-sm text-gray-500 hover:text-blue-500"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  分享
                </button>
              </div>
            </div>

            {/* 标签 */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 正文内容 */}
            <div className="prose prose-lg max-w-none">
              {article.content ? (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="text-gray-500 italic">文章内容为空</div>
              )}
            </div>
          </div>
        </article>

        {/* 相关文章推荐 */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map(related => (
                <Link
                  key={related.id}
                  href={`/articles/${related.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow block"
                >
                  <div className="p-6">
                    {related.cover_image_url && (
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
                        className="w-full h-32 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {related.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{related?.name}</span>
                      <span>
                        {new Date(related.created_at).toLocaleDateString(
                          'zh-CN',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 返回按钮 */}
        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            返回文章列表
          </Link>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 FixCycle. 所有权利保留。</p>
        </div>
      </footer>
    </div>
  );
}
