'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface LikeButtonProps {
  initialLikes: number;
  contentId: string;
  onLike?: (count: number) => void;
  onDraftCreate?: (contentId: string) => void;
}

export default function LikeButton({
  initialLikes,
  contentId,
  onLike,
  onDraftCreate,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const newCount = likeCount + 1;
      setLikeCount(newCount);
      setIsLiked(true);

      // 调用父组件回?
      onLike?.(newCount);

      // 检查是否触发草稿创建（�?次点赞）
      if (newCount === 3) {
        await createDraft(contentId);
        onDraftCreate?.(contentId);
        toast.success('内容已添加到草稿箱！');
      } else if (newCount > 3) {
        // 超过3次不重复触发
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('已达到最大点赞次?)}
    } catch (error) {
      console.error('点赞失败:', error);
      setLikeCount(likeCount); // 回滚
      toast.error('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const createDraft = async (contentId: string) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`创建草稿: ${contentId}`)};

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || likeCount >= 3}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-testid="like-button"
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span data-testid="like-count">{likeCount}</span>
      {likeCount >= 3 && (
        <span className="text-xs text-green-600" data-testid="draft-indicator">
          �?已沉淀
        </span>
      )}
    </button>
  );
}
