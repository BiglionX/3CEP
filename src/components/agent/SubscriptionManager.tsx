/**
 * 订阅暂停/恢复管理组件
 *
 * 用于用户管理订阅的暂停和恢复操作
 */

'use client';

import { useEffect, useState } from 'react';

interface SubscriptionStatus {
  id: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  expiryDate: string | null;
  isPaused: boolean;
  pausedAt: string | null;
  resumedAt: string | null;
  pauseReason: string | null;
  pauseDurationDays: number;
  maxPauseCount: number;
  currentPauseCount: number;
  remainingPauses: number;
  canPause: boolean;
  canResume: boolean;
}

interface PausePolicy {
  maxPausesPerYear: number;
  pauseDuringPeriod: string;
  resumeBenefit: string;
}

interface SubscriptionManagerProps {
  agentId: string;
  onSubscriptionChange?: () => void;
}

export function SubscriptionManager({
  agentId,
  onSubscriptionChange,
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [policy, setPolicy] = useState<PausePolicy | null>(null);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 加载订阅状态
  useEffect(() => {
    loadSubscriptionStatus();
  }, [agentId]);

  const loadSubscriptionStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/agents/${agentId}/subscription/status`
      );
      const result = await response.json();

      if (result.success) {
        setSubscription(result.data.subscription);
        setPolicy(result.data.pausePolicy);
      } else {
        setError(result.error?.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理暂停
  const handlePause = async () => {
    if (!pauseReason.trim()) {
      setError('请填写暂停原因');
      return;
    }

    setOperating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/agents/${agentId}/subscription/pause`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: pauseReason }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess('订阅已暂停，暂停期间不计费');
        setShowPauseDialog(false);
        setPauseReason('');
        loadSubscriptionStatus();
        onSubscriptionChange?.();
      } else {
        setError(result.error?.message || '暂停失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setOperating(false);
    }
  };

  // 处理恢复
  const handleResume = async () => {
    setOperating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/agents/${agentId}/subscription/resume`,
        {
          method: 'POST',
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `订阅已恢复，有效期已顺延${result.data.subscription.pauseDurationDays}天`
        );
        loadSubscriptionStatus();
        onSubscriptionChange?.();
      } else {
        setError(result.error?.message || '恢复失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setOperating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return <div className="text-center p-8 text-gray-500">未找到订阅信息</div>;
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      {/* 成功提示 */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 订阅状态概览 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">订阅状态</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">智能体名称</p>
            <p className="font-medium">{subscription.agentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">当前状态</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : subscription.isPaused
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {subscription.status === 'active'
                ? '活跃'
                : subscription.isPaused
                  ? '已暂停'
                  : subscription.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">开始日期</p>
            <p className="font-medium">
              {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">到期日期</p>
            <p className="font-medium">
              {subscription.expiryDate
                ? new Date(subscription.expiryDate).toLocaleDateString()
                : '无限制'}
            </p>
          </div>
        </div>
      </div>

      {/* 暂停信息 */}
      {subscription.isPaused && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">暂停详情</h4>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">暂停时间:</span>{' '}
              {subscription.pausedAt &&
                new Date(subscription.pausedAt).toLocaleString()}
            </p>
            <p>
              <span className="text-gray-600">暂停原因:</span>{' '}
              {subscription.pauseReason || '无'}
            </p>
            <p>
              <span className="text-gray-600">已暂停天数:</span>{' '}
              {subscription.pauseDurationDays} 天
            </p>
            {subscription.resumedAt && (
              <p>
                <span className="text-gray-600">恢复时间:</span>{' '}
                {new Date(subscription.resumedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 暂停政策说明 */}
      {policy && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">暂停政策</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• 最多可暂停：{policy.maxPausesPerYear} 次/年</li>
            <li>• {policy.pauseDuringPeriod}</li>
            <li>• {policy.resumeBenefit}</li>
          </ul>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">剩余暂停次数:</span>{' '}
            <span className="font-medium text-blue-600">
              {subscription.remainingPauses} / {subscription.maxPauseCount}
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {subscription.canPause && (
          <button
            type="button"
            onClick={() => setShowPauseDialog(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            暂停订阅
          </button>
        )}

        {subscription.canResume && (
          <button
            type="button"
            onClick={handleResume}
            disabled={operating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {operating ? '处理中...' : '恢复订阅'}
          </button>
        )}

        {!subscription.canPause && !subscription.canResume && (
          <p className="text-sm text-gray-500">
            {subscription.isPaused
              ? '订阅已在暂停中'
              : subscription.remainingPauses === 0
                ? '已达到最大暂停次数'
                : '无法操作'}
          </p>
        )}
      </div>

      {/* 暂停确认对话框 */}
      {showPauseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">确认暂停订阅</h3>
            <p className="text-gray-600 mb-4">
              暂停期间将不会计费，您的订阅有效期将会冻结。恢复后有效期将自动顺延。
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                暂停原因（选填）
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="请简要说明暂停原因..."
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPauseDialog(false);
                  setPauseReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handlePause}
                disabled={operating}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
              >
                {operating ? '处理中...' : '确认暂停'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 使用示例
/*
import { SubscriptionManager } from '@/components/agent/SubscriptionManager';

function AgentSubscriptionPage({ agentId }) {
  return (
    <div>
      <h1>订阅管理</h1>
      <SubscriptionManager
        agentId={agentId}
        onSubscriptionChange={() => {
          console.log('订阅状态已更新');
        }}
      />
    </div>
  );
}
*/
