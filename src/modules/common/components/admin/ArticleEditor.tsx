'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Send,
  ArrowLeft,
  Image,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ArticleEditorProps {
  articleId?: string;
  initialData?: {
    title: string;
    content: string;
    summary: string;
    coverImageUrl: string;
    tags: string[];
    categoryId?: string;
  };
  onSave?: (data: any) => Promise<boolean>;
  onPublish?: (data: any) => Promise<boolean>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ArticleEditor({
  articleId,
  initialData,
  onSave,
  onPublish,
}: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl || ''
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/articles/categories');
        const result = await response.json();
        if (result.data) {
          setCategories(result.data);
          if (!categoryId && (result.data as any)?.data.length > 0) {
            setCategoryId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    };
    loadCategories();
  }, []);

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 处理按键事件
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 保存草稿
  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入文章标?);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        coverImageUrl: coverImageUrl.trim(),
        tags,
        categoryId,
        status: 'draft',
      };

      if (onSave) {
        const success = await onSave(articleData);
        if (success) {
          alert('草稿保存成功?);
        } else {
          setError('保存失败，请重试');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存过程中发生错?);
    } finally {
      setIsSaving(false);
    }
  };

  // 发布文章
  const handlePublish = async () => {
    if (!title.trim()) {
      setError('请输入文章标?);
      return;
    }

    if (!content.trim()) {
      setError('请输入文章内?);
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        coverImageUrl: coverImageUrl.trim(),
        tags,
        categoryId,
        status: 'published',
      };

      if (onPublish) {
        const success = await onPublish(articleData);
        if (success) {
          alert('文章发布成功?);
          router.push('/admin/articles');
        } else {
          setError('发布失败，请重试');
        }
      }
    } catch (error) {
      console.error('发布失败:', error);
      setError('发布过程中发生错?);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {articleId ? '编辑文章' : '新建文章'}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存?..' : '保存草稿'}
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isPublishing ? '发布?..' : '发布文章'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章标题 *
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="请输入文章标?
            className="text-lg"
          />
        </div>

        {/* 封面图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            封面图片
          </label>
          <div className="flex gap-4">
            <Input
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              placeholder="输入图片URL或上传图?
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Image className="w-4 h-4 mr-2" />
              上传
            </Button>
          </div>
          {coverImageUrl && (
            <div className="mt-2">
              <img
                src={coverImageUrl}
                alt="封面预览"
                className="w-32 h-20 object-cover rounded border"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* 摘要 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章摘要
          </label>
          <Textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="简要描述文章内容（可选）"
            rows={3}
          />
        </div>

        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章分类
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="输入标签后按回车添加"
              className="flex-1"
            />
            <Button onClick={addTag} variant="outline" size="sm">
              <Tag className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 正文编辑?*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            正文内容 *
          </label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="在这里输入文章正文内?.."
            rows={15}
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
