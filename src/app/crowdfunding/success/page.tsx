'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pledgeId = searchParams.get('pledgeId');

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/crowdfunding');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 成功图标 */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">预定成功?/h1>

        {/* 描述 */}
        <p className="text-gray-600 mb-8">
          您的预定已成功提交。我们将尽快为您处理订单并安排发货?        </p>

        {/* 订单信息 */}
        {pledgeId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">订单信息</h3>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between py-1">
                <span>订单?</span>
                <span className="font-mono">{pledgeId.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>状?</span>
                <span className="text-green-600">待支?/span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Link
            href="/crowdfunding"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            继续浏览项目
          </Link>

          <Link
            href="/dashboard"
            className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            查看我的订单
          </Link>
        </div>

        {/* 自动跳转提示 */}
        <p className="mt-6 text-sm text-gray-500">
          {countdown > 0 ? `${countdown} 秒后自动返回项目列表` : '正在跳转...'}
        </p>
      </div>
    </div>
  );
}

