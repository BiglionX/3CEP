'use client';

import { useState } from 'react';

interface BatchActionsProps {
  selectedIds: string[];
  onActionComplete: () => void;
}

export default function BatchActions({
  selectedIds,
  onActionComplete,
}: BatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    setSelectedAction(action);

    // 拒绝操作需要填写理由
    if (action === 'reject') {
      setShowConfirm(true);
    } else {
      setShowConfirm(true);
    }
  };

  const confirmAction = async () => {
    if (!selectedAction) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/agents/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: selectedIds,
          action: selectedAction,
          options: {
            reason: rejectionReason || undefined,
          },
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert(
          `操作成功！\n成功：${result.data.successCount}\n失败：${result.data.failureCount}`
        );
        onActionComplete();
      } else {
        alert(`操作失败：${result.error.message}`);
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setIsProcessing(false);
      setShowConfirm(false);
      setRejectionReason('');
      setSelectedAction('');
    }
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setRejectionReason('');
    setSelectedAction('');
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      approve: '批准选中',
      reject: '拒绝选中',
      delete: '删除选中',
      publish: '发布选中',
      archive: '归档选中',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      approve: 'bg-green-600 hover:bg-green-700',
      reject: 'bg-red-600 hover:bg-red-700',
      delete: 'bg-gray-600 hover:bg-gray-700',
      publish: 'bg-blue-600 hover:bg-blue-700',
      archive: 'bg-yellow-600 hover:bg-yellow-700',
    };
    return colors[action] || 'bg-indigo-600 hover:bg-indigo-700';
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      {/* 批量操作工具栏 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              已选择 {selectedIds.length} 个智能体
            </span>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
              >
                批准
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
              >
                拒绝
              </button>
              <button
                onClick={() => handleAction('publish')}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
              >
                发布
              </button>
              <button
                onClick={() => handleAction('archive')}
                disabled={isProcessing}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
              >
                归档
              </button>
              <button
                onClick={() => handleAction('delete')}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
              >
                删除
              </button>
            </div>
          </div>

          <button
            onClick={onActionComplete}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            取消选择
          </button>
        </div>
      </div>

      {/* 确认对话框 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAction === 'delete' ? '⚠️ 确认删除' : '确认操作'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-700">
                确定要{getActionLabel(selectedAction)}选中的{' '}
                {selectedIds.length} 个智能体吗？
              </p>

              {selectedAction === 'delete' && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ 注意：此操作为软删除，智能体将被标记为已删除
                </p>
              )}

              {selectedAction === 'reject' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    拒绝理由
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="请输入拒绝理由"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelAction}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmAction}
                disabled={
                  isProcessing ||
                  (selectedAction === 'reject' && !rejectionReason)
                }
                className={`px-4 py-2 ${getActionColor(selectedAction)} text-white text-sm font-medium rounded-md disabled:opacity-50`}
              >
                {isProcessing ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
