'use client';

import React, { useState, useEffect } from 'react';
import { DeviceProfileService } from '@/services/device-profile.service';
import {
  DeviceStatus,
  STATUS_COLORS,
  DEVICE_STATUS_LABELS,
} from '@/lib/constants/lifecycle';

interface DeviceProfileCardProps {
  qrcodeId: string;
  className?: string;
}

export default function DeviceProfileCard({
  qrcodeId,
  className = '',
}: DeviceProfileCardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceProfile();
  }, [qrcodeId]);

  const loadDeviceProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const service = new DeviceProfileService();
      const data = await service.getDeviceProfile(qrcodeId);

      if (data) {
        setProfile(data);
      } else {
        setError('未找到设备档?);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '�?;
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const formatDateTime = (date: Date | undefined): string => {
    if (!date) return '�?;
    return new Date(date).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium">加载失败</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button
            onClick={loadDeviceProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.324-.17.157-.32.327-.45.512-.13.185-.24.384-.33.597-.09.213-.16.436-.21.667-.05.231-.08.467-.08.703V21a1 1 0 102 0v-.793c0-.236.03-.472.08-.703.05-.231.12-.454.21-.667.09-.213.2-.412.33-.597.13-.185.28-.355.45-.512A7.962 7.962 0 0112 15c2.34 0 4.47-.881 6.08-2.324z"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">未找到设备档?/p>
          <p className="text-gray-400 text-sm mt-1">该设备尚未创建档?/p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">设备档案</h2>
            <p className="text-sm text-gray-500 mt-1">二维? {qrcodeId}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[profile.currentStatus as DeviceStatus]}`}
          >
            {DEVICE_STATUS_LABELS[profile.currentStatus as DeviceStatus]}
          </span>
        </div>
      </div>

      {/* 主要信息 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">基本信息</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">产品型号</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.productModel}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">品牌</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.brandName || '未知'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">产品类别</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.productCategory || '未分?}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">序列?/dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.serialNumber || '�?}
                </dd>
              </div>
            </dl>
          </div>

          {/* 状态信?*/}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">状态信?/h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">制造日?/dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(profile.manufacturingDate)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">首次激?/dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDateTime(profile.firstActivatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">最后事?/dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDateTime(profile.lastEventAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">当前位置</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.currentLocation || '未知'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">维护统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {profile.totalRepairCount}
              </div>
              <div className="text-xs text-blue-500">维修次数</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {profile.totalPartReplacementCount}
              </div>
              <div className="text-xs text-green-500">换件次数</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {profile.totalTransferCount}
              </div>
              <div className="text-xs text-purple-500">转移次数</div>
            </div>
          </div>
        </div>

        {/* 保修信息 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">保修信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-gray-600">保修?/dt>
              <dd className="text-sm font-medium text-gray-900">
                {profile.warrantyPeriod
                  ? `${profile.warrantyPeriod}个月`
                  : '无保修信?}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">保修开?/dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(profile.warrantyStartDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">保修结束</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(profile.warrantyExpiry)}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            onClick={loadDeviceProfile}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            刷新
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            查看详细
          </button>
        </div>
      </div>
    </div>
  );
}
