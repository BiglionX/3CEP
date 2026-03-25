'use client';

import { useState } from 'react';

interface BatchReviewToolbarProps {
  selectedIds: string[];
  onActionComplete: () => void;
}

/**
 * 批量审核工具栏组件
 */
export function BatchReviewToolbar({
  selectedIds,
  onActionComplete,
}: BatchReviewToolbarProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  // 处理批量操作
  const handleBatchAction = async (action: string) => {
    if (action === 'reject') {
      // 拒绝操作需要填写理由
      setPendingAction(action);
      setShowRejectDialog(true);
      return;
    }

    if (action === 'shelf_off') {
      // 下架操作可选填写理由
      setPendingAction(action);
      setShowRejectDialog(true);
      return;
    }

    await executeBatchAction(action, '');
  };

  // 执行批量操作
  const executeBatchAction = async (action: string, reason: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/skill-store/batch-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillIds: selectedIds,
          action,
          rejectReason: reason || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // 显示成功提示
      alert(`✅ ${result.message}`);

      // 清空选择并刷新列表
      onActionComplete();
    } catch (error) {
      console.error('批量操作失败:', error);
      alert(
        `❌ 批量操作失败：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setLoading(false);
      setShowRejectDialog(false);
      setPendingAction(null);
      setRejectReason('');
    }
  };

  // 取消拒绝对话框
  const handleCancelReject = () => {
    setShowRejectDialog(false);
    setPendingAction(null);
    setRejectReason('');
  };

  // 确认拒绝/下架
  const handleConfirmReject = () => {
    if (pendingAction) {
      executeBatchAction(pendingAction, rejectReason);
    }
  };

  return (
    <>
      {/* 批量操作工具栏 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-900">
              已选择 <span className="font-bold">{selectedIds.length}</span> 个
              Skills
            </span>

            <div className="h-4 w-px bg-blue-300"></div>

            <button
              onClick={() => handleBatchAction('approve')}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ✅ 通过审核
            </button>

            <button
              onClick={() => handleBatchAction('reject')}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ❌ 拒绝
            </button>

            <button
              onClick={() => handleBatchAction('shelf_on')}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              📦 上架
            </button>

            <button
              onClick={() => handleBatchAction('shelf_off')}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              🗑️ 下架
            </button>
          </div>

          <button
            onClick={onActionComplete}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            取消选择
          </button>
        </div>
      </div>

      {/* 拒绝/下架理由对话框 */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* 标题 */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                {pendingAction === 'reject' ? '填写拒绝理由' : '填写下架理由'}
              </h3>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  理由说明
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder={`请输入${pendingAction === 'reject' ? '拒绝' : '下架'}原因...`}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ 此操作将影响{' '}
                  <span className="font-bold">{selectedIds.length}</span> 个
                  Skills，请谨慎操作
                </p>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCancelReject}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={loading || !rejectReason.trim()}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
