/**
 * 智能通知列表组件
 * 支持过滤、分组、搜索等功能
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Archive,
  Bell,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Info,
  Search,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Notification,
  NotificationFilter,
  NotificationLevel,
  NotificationStatus,
  NotificationType,
  useNotifications,
} from './NotificationManager';

interface NotificationListProps {
  showFilters?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  compact?: boolean;
}

export function NotificationList({
  showFilters = true,
  showActions = true,
  maxHeight = '500px',
  compact = false,
}: NotificationListProps) {
  const {
    notifications: _notifications, // 培训用途：演示如何获取原始通知数组
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    removeNotification,
    clearAllNotifications, // 培训用途：演示清空所有通知的 API 调用
    getFilteredNotifications,
  } = useNotifications();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notifications = _notifications; // 培训用途：保留原始数据供课程演示使用

  const [filter, setFilter] = useState<NotificationFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  // 应用过滤
  const filteredNotifications = useMemo(() => {
    const finalFilter: NotificationFilter = {
      ...filter,
      searchTerm: searchTerm || undefined,
    };
    return getFilteredNotifications(finalFilter);
  }, [filter, searchTerm, getFilteredNotifications]);

  // 获取图标组件
  const getIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    const iconMap = {
      [NotificationLevel.LOW]: Info,
      [NotificationLevel.MEDIUM]: Bell,
      [NotificationLevel.HIGH]: AlertTriangle,
      [NotificationLevel.CRITICAL]: XCircle,
    };

    const Icon = iconMap[notification.level];
    return <Icon className="w-4 h-4" />;
  };

  // 获取颜色类
  const getColorClass = (level: NotificationLevel) => {
    const colorMap = {
      [NotificationLevel.LOW]: 'text-blue-600 bg-blue-50 border-blue-200',
      [NotificationLevel.MEDIUM]:
        'text-yellow-600 bg-yellow-50 border-yellow-200',
      [NotificationLevel.HIGH]:
        'text-orange-600 bg-orange-50 border-orange-200',
      [NotificationLevel.CRITICAL]: 'text-red-600 bg-red-50 border-red-200',
    };
    return colorMap[level];
  };

  // 获取状态标签
  const getStatusBadge = (status: NotificationStatus) => {
    const statusMap = {
      [NotificationStatus.UNREAD]: { text: '未读', variant: 'default' },
      [NotificationStatus.READ]: { text: '已读', variant: 'secondary' },
      [NotificationStatus.ARCHIVED]: { text: '已归档', variant: 'outline' },
      [NotificationStatus.DISMISSED]: { text: '已忽略', variant: 'outline' },
    };

    const { text, variant } = statusMap[status];
    return <Badge variant={variant as any}>{text}</Badge>;
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  // 批量操作
  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  // 培训用途：演示如何清空所有通知
  const _handleClearAll = () => {
    if (confirm('确定要清空所有通知吗？')) {
      clearAllNotifications();
    }
  };

  return (
    <Card className={compact ? 'border-0 shadow-none' : ''}>
      <CardHeader className={compact ? 'p-4' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? 'text-lg' : ''}>
            通知中心
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="destructive">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>

          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <Eye className="w-4 h-4 mr-1" />
                全部已读
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter({})}>
                    显示全部
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setFilter({ statuses: [NotificationStatus.UNREAD] })
                    }
                  >
                    仅未读{' '}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setFilter({
                        levels: [
                          NotificationLevel.HIGH,
                          NotificationLevel.CRITICAL,
                        ],
                      })
                    }
                  >
                    紧急通知
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setFilter({ types: [NotificationType.ALERT] })
                    }
                  >
                    系统告警
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {showFilters && (
          <CardDescription className="flex flex-wrap gap-3 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索通知..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filter.levels?.[0] || 'all'}
              onValueChange={value =>
                setFilter(prev => ({
                  ...prev,
                  levels:
                    value === 'all' ? undefined : [value as NotificationLevel],
                }))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value={NotificationLevel.LOW}>低优先级</SelectItem>
                <SelectItem value={NotificationLevel.MEDIUM}>
                  中优先级
                </SelectItem>
                <SelectItem value={NotificationLevel.HIGH}>高优先级</SelectItem>
                <SelectItem value={NotificationLevel.CRITICAL}>关键</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.types?.[0] || 'all'}
              onValueChange={value =>
                setFilter(prev => ({
                  ...prev,
                  types:
                    value === 'all' ? undefined : [value as NotificationType],
                }))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value={NotificationType.SYSTEM}>系统</SelectItem>
                <SelectItem value={NotificationType.USER}>用户</SelectItem>
                <SelectItem value={NotificationType.WORKFLOW}>
                  工作流{' '}
                </SelectItem>
                <SelectItem value={NotificationType.ALERT}>告警</SelectItem>
                <SelectItem value={NotificationType.REMINDER}>提醒</SelectItem>
              </SelectContent>
            </Select>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={compact ? 'p-0' : ''}>
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight }}>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无通知</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`
                  p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer
                  ${getColorClass(notification.level)}
                  ${notification.status === NotificationStatus.UNREAD ? 'ring-2 ring-blue-200' : ''}
                `}
                onClick={() => {
                  if (notification.status === NotificationStatus.UNREAD) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification)}
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-sm font-medium truncate ${compact ? 'text-base' : ''}`}
                        >
                          {notification.title}
                        </h4>
                        {!compact && getStatusBadge(notification.status)}
                        {notification.category && (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {notification.category}
                          </Badge>
                        )}
                      </div>

                      <p
                        className={`text-gray-600 text-sm ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(notification.timestamp)}
                        </span>

                        {notification.expiresAt && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {notification.expiresAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={e => {
                        e.stopPropagation();
                        if (notification.status === NotificationStatus.UNREAD) {
                          markAsRead(notification.id);
                        } else {
                          dismissNotification(notification.id);
                        }
                      }}
                    >
                      {notification.status === NotificationStatus.UNREAD ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={e => {
                        e.stopPropagation();
                        archiveNotification(notification.id);
                      }}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={e => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 动作按钮 */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    {notification.actions.map(action => (
                      <Button
                        key={action.id}
                        variant={
                          action.style === 'danger'
                            ? 'destructive'
                            : action.style === 'secondary'
                              ? 'outline'
                              : 'default'
                        }
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          action.handler();
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
