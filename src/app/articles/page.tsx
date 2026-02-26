"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  summary: string;
  cover_image_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // 先使用mock数据测试
      const mockArticles: Article[] = [
        {
          id: "1",
          title: "iPhone 14 Pro 屏幕更换教程",
          summary: "详细讲解如何安全地更换iPhone 14 Pro的屏幕组件",
          cover_image_url: null,
          view_count: 1250,
          like_count: 89,
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          title: "Android手机电池更换指南",
          summary: "从华为到小米，主流安卓机型电池更换步骤详解",
          cover_image_url: null,
          view_count: 890,
          like_count: 67,
          created_at: "2024-01-12T14:20:00Z"
        },
        {
          id: "3",
          title: "维修工具选购攻略",
          summary: "专业维修师傅推荐的必备工具清单和购买建议",
          cover_image_url: null,
          view_count: 2100,
          like_count: 156,
          created_at: "2024-01-10T09:15:00Z"
        }
      ];
      
      setArticles(mockArticles);
      
      // 同时尝试获取真实数据
      /*
      const response = await fetch("/api/articles");
      const result = await response.json();
      if (response.ok) {
        setArticles(result.data || mockArticles);
      }
      */
      
    } catch (error) {
      console.error("获取文章列表错误:", error);
      // 使用mock数据作为后备
      const mockArticles: Article[] = [
        {
          id: "1",
          title: "iPhone 14 Pro 屏幕更换教程",
          summary: "详细讲解如何安全地更换iPhone 14 Pro的屏幕组件",
          cover_image_url: null,
          view_count: 1250,
          like_count: 89,
          created_at: "2024-01-15T10:30:00Z"
        }
      ];
      setArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #3b82f6', 
            borderTopColor: 'transparent',
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>加载文章中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* 头部 */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', textDecoration: 'none' }}>
                FixCycle 知识库
              </Link>
            </div>
            <nav style={{ display: 'none' }}>
              <div style={{ marginLeft: '40px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <Link
                  href="/"
                  style={{ color: '#6b7280', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
                >
                  首页
                </Link>
                <Link
                  href="/articles"
                  style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
                >
                  文章中心
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>技术文章</h1>
          <p style={{ marginTop: '8px', color: '#6b7280' }}>分享维修技术、行业资讯和实用指南</p>
        </div>

        {/* 文章列表 */}
        {articles.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto', width: '48px', height: '48px', color: '#9ca3af' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 style={{ marginTop: '8px', fontSize: '18px', fontWeight: '500', color: '#111827' }}>
              暂无文章
            </h3>
            <p style={{ marginTop: '4px', color: '#6b7280' }}>还没有发布任何文章</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {articles.map((article) => (
              <article
                key={article.id}
                style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
              >
                {/* 封面图片 */}
                {article.cover_image_url ? (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    style={{ width: '100%', height: '192px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '192px', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg
                      style={{ width: '48px', height: '48px', color: '#bfdbfe' }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div style={{ padding: '24px' }}>
                  {/* 标题 */}
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    <Link href={`/articles/${article.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {article.title}
                    </Link>
                  </h2>

                  {/* 摘要 */}
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                    {article.summary}
                  </p>

                  {/* 底部信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* 发布时间 */}
                      <span>
                        {new Date(article.created_at).toLocaleDateString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* 统计信息 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>{article.view_count || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{article.like_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '32px 0', marginTop: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <p>&copy; 2026 FixCycle. 所有权利保留。</p>
        </div>
      </footer>


    </div>
  );
}