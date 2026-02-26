'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DeviceProfileCard from '@/components/device/DeviceProfileCard';
import LifecycleTimeline from '@/components/device/LifecycleTimeline';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceProfileService } from '@/services/device-profile.service';
import { 
  DeviceEventType, 
  DeviceStatus,
  STATUS_COLORS,
  DEVICE_STATUS_LABELS
} from '@/lib/constants/lifecycle';

interface DeviceArchiveTabProps {
  qrcodeId: string;
  className?: string;
}

export default function DeviceArchiveTab({ qrcodeId, className = '' }: DeviceArchiveTabProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'history'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    loadData();
  }, [qrcodeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const lifecycleService = new DeviceLifecycleService();
      const profileService = new DeviceProfileService();
      
      // 并行加载档案和事件数据
      const [profileData, eventsData] = await Promise.all([
        profileService.getDeviceProfile(qrcodeId),
        lifecycleService.getDeviceLifecycleHistory(qrcodeId, { limit: 20 })
      ]);
      
      setProfile(profileData);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('加载设备档案数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDevice = async () => {
    try {
      setIsActivating(true);
      const lifecycleService = new DeviceLifecycleService();
      
      // 调用LIFE-204激活设备
      await lifecycleService.recordEvent({
        qrcodeId,
        eventType: DeviceEventType.ACTIVATED,
        eventSubtype: 'user_activation',
        location: '用户扫码激活',
        notes: '用户通过扫码页面激活设备'
      });
      
      // 重新加载数据
      await loadData();
      
      // 显示成功消息
      alert('设备激活成功！');
    } catch (err) {
      console.error('设备激活失败:', err);
      alert('设备激活失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsActivating(false);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '无';
    return new Date(date).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium text-lg">加载失败</p>
          <p className="text-gray-500 mt-2">{error}</p>
          <button 
            onClick={loadData}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重试加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              设备档案
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              生命周期
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              维修历史
            </div>
          </button>
        </nav>
      </div>

      {/* 标签页内容 */}
      <div className="p-6">
        {/* 激活状态和按钮 */}
        {profile && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[profile.currentStatus as DeviceStatus]}`}>
                    {DEVICE_STATUS_LABELS[profile.currentStatus as DeviceStatus]}
                  </span>
                  {profile.currentStatus !== 'activated' && (
                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      未激活
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  {profile.currentStatus === 'activated' 
                    ? `设备已于 ${formatDate(profile.firstActivatedAt)} 激活`
                    : '此设备尚未激活，请点击下方按钮进行激活'}
                </p>
              </div>
              
              {profile.currentStatus !== 'activated' && (
                <button
                  onClick={handleActivateDevice}
                  disabled={isActivating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isActivating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      激活中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      激活设备
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 档案标签页 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <DeviceProfileCard qrcodeId={qrcodeId} />
            
            {/* 快捷操作 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">快捷操作</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  申请维修
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  查看说明书
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  AI故障诊断
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 生命周期标签页 */}
        {activeTab === 'timeline' && (
          <LifecycleTimeline qrcodeId={qrcodeId} limit={50} />
        )}

        {/* 维修历史标签页 */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">维修历史记录</h3>
                <p className="text-sm text-gray-500 mt-1">
                  共 {events.filter(e => e.eventType === 'repaired' || e.eventType === 'part_replaced').length} 条维修记录
                </p>
              </div>
              
              <div className="p-6">
                {events.filter(e => e.eventType === 'repaired' || e.eventType === 'part_replaced').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.324-.17.157-.32.327-.45.512-.13.185-.24.384-.33.597-.09.213-.16.436-.21.667-.05.231-.08.467-.08.703V21a1 1 0 102 0v-.793c0-.236.03-.472.08-.703.05-.231.12-.454.21-.667.09-.213.2-.412.33-.597.13-.185.28-.355.45-.512A7.962 7.962 0 0112 15c2.34 0 4.47-.881 6.08-2.324z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">暂无维修记录</p>
                    <p className="text-gray-400 text-sm mt-1">该设备还未进行过维修</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events
                      .filter(e => e.eventType === 'repaired' || e.eventType === 'part_replaced')
                      .map(event => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <h4 className="font-medium text-gray-900">
                              {event.eventType === 'repaired' ? '设备维修' : '配件更换'}
                              {event.eventSubtype && ` - ${event.eventSubtype}`}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(new Date(event.eventTimestamp))}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">地点:</span>
                              <span className="ml-2 text-gray-900">{event.location || '未知'}</span>
                            </div>
                            
                            {event.eventData?.technician && (
                              <div>
                                <span className="text-gray-500">技师:</span>
                                <span className="ml-2 text-gray-900">{event.eventData.technician}</span>
                              </div>
                            )}
                            
                            {event.eventData?.cost && (
                              <div>
                                <span className="text-gray-500">费用:</span>
                                <span className="ml-2 text-green-600 font-medium">¥{event.eventData.cost}</span>
                              </div>
                            )}
                            
                            {event.eventData?.partsReplaced && event.eventData.partsReplaced.length > 0 && (
                              <div>
                                <span className="text-gray-500">更换配件:</span>
                                <span className="ml-2 text-gray-900">
                                  {event.eventData.partsReplaced.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {event.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-gray-600">{event.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}