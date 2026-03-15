'use client';

import DeviceProfileCard from '@/components/device/DeviceProfileCard';
import LifecycleTimeline from '@/components/device/LifecycleTimeline';
import { notFound } from 'next/navigation';
import { useState } from 'react';

interface ScanPageProps {
  params: {
    qrcodeId: string;
  };
}

export default function DeviceScanPage({ params }: ScanPageProps) {
  const { qrcodeId } = params;
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // 验证二维码ID格式
  if (!qrcodeId || qrcodeId.length < 5) {
    notFound();
  }

  // 激活设备函数
  const activateDevice = async () => {
    try {
      setIsActivating(true);
      setActivationError(null);

      // 调用生命周期API记录激活事件
      const response = await fetch('/api/lifecycle/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_LIFECYCLE_API_KEY || 'dev-key'
          }`,
        },
        body: JSON.stringify({
          qrcodeId,
          eventType: 'activated',
          location: '用户扫码激活',
          notes: '用户通过扫码页面首次激活设备',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setActivationSuccess(true);
        // 显示成功消息
        alert('设备激活成功！');
        // 刷新页面以显示更新后的档案信息
        window.location.reload();
      } else {
        setActivationError(result.error || '激活失败');
      }
    } catch (error) {
      console.error('激活设备错误:', error);
      setActivationError(error instanceof Error  error.message : '网络错误');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">
                设备生命周期档案
              </h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                二维码: {qrcodeId}
              </span>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 设备档案卡片 */}
          <section>
            <DeviceProfileCard
              qrcodeId={qrcodeId}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </section>

          {/* 生命周期时间轴 */}
          <section>
            <LifecycleTimeline
              qrcodeId={qrcodeId}
              className="shadow-lg hover:shadow-xl transition-shadow"
              limit={15}
            />
          </section>

          {/* 激活提示横幅 */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-800">
                  首次使用激活
                </h3>
                <p className="mt-2 text-blue-700">
                  检测到这是您首次使用此设备，请点击下方按钮完成设备激活，
                  激活后将为您建立完整的生命周期档案。
                </p>
                <div className="mt-4">
                  <button
                    onClick={activateDevice}
                    disabled={isActivating || activationSuccess}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      {
                        true: 'bg-green-600 hover:bg-green-700',
                        false: 'bg-blue-600 hover:bg-blue-700',
                      }[activationSuccess  'true' : 'false']
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    {isActivating  (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        激活中...
                      </>
                    ) : activationSuccess  (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 text-white"
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
                        已激活
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        激活设备
                      </>
                    )}
                  </button>
                  {activationError && (
                    <p className="mt-2 text-sm text-red-600">
                      {activationError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 操作面板 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              设备管理
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>记录新事件</span>
              </button>

              <button className="flex items-center justify-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>生成报告</span>
              </button>

              <button className="flex items-center justify-center space-x-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span>分享档案</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2026 FixCycle 设备生命周期管理系统</p>
            <p className="mt-1">扫码即刻了解设备完整生命周期</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
