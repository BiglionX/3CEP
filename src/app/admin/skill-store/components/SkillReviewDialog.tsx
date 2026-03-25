'use client';

import type { Skill } from '@/types/skill';
import { useState } from 'react';

interface SkillReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (action: 'approve' | 'reject', reason: string) => void;
  skill: Skill;
}

export function SkillReviewDialog({
  open,
  onClose,
  onSubmit,
  skill,
}: SkillReviewDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit(action, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">审核 Skill</h3>
        </div>

        {/* 内容 */}
        <div className="px-6 py-4 space-y-4">
          {/* Skill 信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill 名称
            </label>
            <p className="text-sm text-gray-900">{skill.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <p className="text-sm text-gray-900 line-clamp-2">
              {skill.description}
            </p>
          </div>

          {/* 审核操作选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              审核结果
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approve"
                  checked={action === 'approve'}
                  onChange={e =>
                    setAction(e.target.value as 'approve' | 'reject')
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">通过</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="reject"
                  checked={action === 'reject'}
                  onChange={e =>
                    setAction(e.target.value as 'approve' | 'reject')
                  }
                  className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">驳回</span>
              </label>
            </div>
          </div>

          {/* 审核原因 */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {action === 'approve' ? '通过备注' : '驳回原因'}
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={
                action === 'approve'
                  ? '可选：填写通过备注'
                  : '必填：说明驳回原因'
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required={action === 'reject'}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={action === 'reject' && !reason.trim()}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {action === 'approve' ? '确认通过' : '确认驳回'}
          </button>
        </div>
      </div>
    </div>
  );
}
