'use client';

import {
  DEVICE_EVENT_TYPE_LABELS,
  DeviceEventType,
  EVENT_ICONS,
  REPAIR_TYPE_LABELS,
} from '@/lib/constants/lifecycle';

interface EventCardProps {
  event: {
    id: string;
    eventType: DeviceEventType;
    eventSubtype?: string;
    eventTimestamp: Date | string;
    location?: string;
    notes?: string;
    eventData?: Record<string, any>;
    isVerified?: boolean;
  };
  className?: string;
  onDetailClick?: (eventId: string) => void;
}

export default function EventCard({
  event,
  className = '',
  onDetailClick,
}: EventCardProps) {
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('zh-CN', {
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

  const getEventDescription = (): string => {
    const baseDescription =
      DEVICE_EVENT_TYPE_LABELS[event.eventType] || event.eventType;

    if (event.eventSubtype) {
      if (event.eventType === DeviceEventType.REPAIRED) {
        const repairLabel =
          REPAIR_TYPE_LABELS[
            event.eventSubtype as keyof typeof REPAIR_TYPE_LABELS
          ];
        return `${baseDescription}${
          repairLabel ? ` (${repairLabel})` : ` (${event.eventSubtype})`
        }`;
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

  const handleClick = () => {
    if (onDetailClick && event.eventType === DeviceEventType.REPAIRED) {
      onDetailClick(event.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${
        event.eventType === DeviceEventType.REPAIRED
          ? 'cursor-pointer hover:border-orange-300'
          : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* 事件图标 */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${getEventColor(
            event.eventType
          )} text-white shadow-sm`}
        >
          <span className="text-lg">{getEventIcon(event.eventType)}</span>
        </div>

        {/* 事件内容 */}
        <div className="flex-1 min-w-0">
          {/* 事件头部 */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-gray-900 text-sm">
              {getEventDescription()}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(event.eventTimestamp)}
              </span>
              {event.isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  已验证
                </span>
              )}
            </div>
          </div>

          {/* 事件详情 */}
          <div className="space-y-1.5">
            {event.notes && (
              <p className="text-sm text-gray-600">{event.notes}</p>
            )}

            {event.location && (
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  className="w-3.5 h-3.5 mr-1 flex-shrink-0"
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
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.eventData?.cost && (
              <div className="flex items-center text-xs text-green-600">
                <svg
                  className="w-3.5 h-3.5 mr-1 flex-shrink-0"
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
                <span>费用: ¥{event.eventData.cost}</span>
              </div>
            )}

            {event.eventData?.technician && (
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  className="w-3.5 h-3.5 mr-1 flex-shrink-0"
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
                <span>技师: {event.eventData.technician}</span>
              </div>
            )}
          </div>

          {/* 维修事件的查看详情提示 */}
          {event.eventType === DeviceEventType.REPAIRED && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center text-xs text-orange-600">
                <svg
                  className="w-3.5 h-3.5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>点击查看工单详情</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
