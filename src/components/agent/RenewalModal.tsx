/**
 * 智能体续费对话框组件示例
 *
 * 此组件展示如何实现续费功能
 * 实际使用时请根据项目 UI 框架调整
 */

'use client';

import { useState } from 'react';

interface RenewalPackage {
  period: 'monthly' | 'quarterly' | 'yearly';
  months: number;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  discount: number;
  description: string;
  recommended: boolean;
}

interface RenewalDialogProps {
  agentId: string;
  agentName: string;
  currentExpiryDate: string | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export function RenewalDialog({
  agentId,
  agentName,
  currentExpiryDate,
  onClose,
  onSuccess,
}: RenewalDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<RenewalPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载续费套餐
  const loadPackages = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/renew`);
      const result = await response.json();

      if (result.success) {
        setPackages(result.data.packages);
      } else {
        setError(result.error?.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  // 处理续费
  const handleRenew = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${agentId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPackage,
          paymentMethod: 'stripe',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 跳转到支付页面或显示支付二维码
        if (result.data.payment?.paymentUrl) {
          window.open(result.data.payment.paymentUrl, '_blank');
        }
        onSuccess(result.data.order.id);
      } else {
        setError(result.error?.message || '续费失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        {/* 标题 */}
        <h2 className="text-2xl font-bold mb-4">订阅续费</h2>
        <p className="text-gray-600 mb-2">智能体：{agentName}</p>
        {currentExpiryDate && (
          <p className="text-gray-600 mb-6">
            当前到期时间：{new Date(currentExpiryDate).toLocaleDateString()}
          </p>
        )}

        {/* 套餐选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {packages.map(pkg => (
            <div
              key={pkg.period}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPackage === pkg.period
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPackage(pkg.period)}
            >
              {pkg.recommended && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  推荐
                </span>
              )}
              <h3 className="text-lg font-semibold mt-2">{pkg.months}个月</h3>
              <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
              <div className="space-y-1">
                <p className="text-gray-500 line-through text-sm">
                  ¥{(pkg.originalPrice / 100).toFixed(2)}
                </p>
                <p className="text-xl font-bold text-red-600">
                  ¥{(pkg.finalPrice / 100).toFixed(2)}
                </p>
                {pkg.savings > 0 && (
                  <p className="text-green-600 text-sm">
                    节省¥{(pkg.savings / 100).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleRenew}
            disabled={loading || packages.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '处理中...' : '立即续费'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 使用示例
/*
import { RenewalDialog } from '@/components/agent/RenewalModal';

function AgentCard({ agent }) {
  const [showRenewal, setShowRenewal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowRenewal(true)}>
        续费
      </button>

      {showRenewal && (
        <RenewalDialog
          agentId={agent.id}
          agentName={agent.name}
          currentExpiryDate={agent.expiry_date}
          onClose={() => setShowRenewal(false)}
          onSuccess={(orderId) => {
            console.log('订单创建成功:', orderId);
            setShowRenewal(false);
          }}
        />
      )}
    </div>
  );
}
*/
