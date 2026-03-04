'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ArticleEditor from '@/components/admin/ArticleEditor';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  cover_image_url: string;
  tags: string[];
  category_id: string | null;
  status: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载文章数据
  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setArticle(data);
    } catch (err) {
      setError('加载文章失败: ' + (err as Error).message);
      console.error('加载文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 保存文章
  const handleSave = async (articleData: any) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          ...articleData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', articleId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('保存失败:', err);
      return false;
    }
  };

  // 发布文章
  const handlePublish = async (articleData: any) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          ...articleData,
          status: 'published',
          publish_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', articleId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('发布失败:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <ArticleEditor
      articleId={articleId}
      initialData={{
        title: article?.title || '',
        content: article?.content || '',
        summary: article?.summary || '',
        coverImageUrl: article?.cover_image_url || '',
        tags: article?.tags || [],
        categoryId: article?.category_id || '',
      }}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
