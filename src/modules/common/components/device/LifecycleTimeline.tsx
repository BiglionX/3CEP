'use client';

import React, { useState, useEffect } from 'react';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import {
  DeviceEventType,
  EVENT_ICONS,
  DEVICE_EVENT_TYPE_LABELS,
  REPAIR_TYPE_LABELS,
} from '@/lib/constants/lifecycle';

interface LifecycleTimelineProps {
  qrcodeId: string;
  className?: string;
  limit?: number;
}

export default function LifecycleTimeline({
  qrcodeId,
  className = '',
  limit = 10,
}: LifecycleTimelineProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLifecycleEvents();
  }, [qrcodeId, limit]);

  const loadLifecycleEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const service = new DeviceLifecycleService();
      const data = await service.getDeviceLifecycleHistory(qrcodeId, { limit });

      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('加载生命周期事件失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (eventType: DeviceEventType): string => {
    return EVENT_ICONS[eventType] || '📋';
  };

  const getEventDescription = (event: any): string => {
    const baseDescription =
      DEVICE_EVENT_TYPE_LABELS[event.eventType as DeviceEventType] ||
      event.eventType;

    if (event.eventSubtype) {
      if (event.eventType === DeviceEventType.REPAIRED) {
        const repairLabel =
          REPAIR_TYPE_LABELS[
            event.eventSubtype as keyof typeof REPAIR_TYPE_LABELS
          ];
        return `${baseDescription}${repairLabel ? ` (${repairLabel})` : ` (${event.eventSubtype})`}`;
      }
      return `${baseDescription} (${event.eventSubtype})`;
    }

    return baseDescription;
  };

  const getEventColor = (eventType: DeviceEventType): string => {
    switch (eventType) {
      case DeviceEventType.MANUFACTURED:
        return 'bg-blue-500';
      case DeviceEventType.ACTIVATED:
        return 'bg-green-500';
      case DeviceEventType.REPAIRED:
        return 'bg-orange-500';
      case DeviceEventType.PART_REPLACED:
        return 'bg-yellow-500';
      case DeviceEventType.TRANSFERRED:
        return 'bg-purple-500';
      case DeviceEventType.RECYCLED:
        return 'bg-gray-500';
      case DeviceEventType.INSPECTED:
        return 'bg-indigo-500';
      case DeviceEventType.MAINTAINED:
        return 'bg-teal-500';
      case DeviceEventType.UPGRADED:
        return 'bg-pink-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
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
            onClick={loadLifecycleEvents}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            生命周期时间?          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {events.length} 个事?            </span>
            {events.length >= limit && (
              <span className="text-xs text-gray-400">显示最近{limit}�?/span>
            )}
          </div>
        </div>
      </div>

      {/* 时间轴内?*/}
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">暂无生命周期记录</p>
            <p className="text-gray-400 text-sm mt-1">
              该设备还没有任何生命周期事件
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* 时间轴线 */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* 事件列表 */}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex group">
                  {/* 时间?*/}
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${getEventColor(event.eventType)} text-white shadow-sm group-hover:scale-110 transition-transform`}
                    >
                      <span className="text-lg">
                        {getEventIcon(event.eventType as DeviceEventType)}
                      </span>
                    </div>
                    {index !== events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* 事件内容 */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* 事件头部 */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="font-medium text-gray-900">
                          {getEventDescription(event)}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(new Date(event.eventTimestamp))}
                          </span>
                          {event.isVerified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              已验?                            </span>
                          )}
                        </div>
                      </div>

                      {/* 事件详情 */}
                      <div className="space-y-2">
                        {event.notes && (
                          <p className="text-sm text-gray-600">{event.notes}</p>
                        )}

                        {event.location && (
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {event.location}
                          </div>
                        )}

                        {event?.cost && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                            费用: ¥{event.eventData.cost}
                          </div>
                        )}

                        {event?.technician && (
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            技? {event.eventData.technician}
                          </div>
                        )}
                      </div>

                      {/* 元数?*/}
                      {event.metadata &&
                        Object.keys(event.metadata).length > 0 && (
                          <details className="mt-3">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                              查看详细信息
                            </summary>
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                              <pre>
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      {(events.length > 0 || error) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={loadLifecycleEvents}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              刷新时间?            </button>
            {events.length >= limit && (
              <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                查看全部
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
