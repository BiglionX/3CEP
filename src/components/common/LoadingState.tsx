/**
 * 加载状态管理组? * 统一的加载、错误和空状态处? */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Search, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onRetry?: () => void;
  onSearch?: () => void;
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
  children: ReactNode;
  className?: string;
}

export function LoadingState({
  loading = false,
  error = null,
  empty = false,
  onRetry,
  onSearch,
  loadingText = '加载?..',
  emptyText = '暂无数据',
  errorText = '加载失败',
  children,
  className = '',
}: LoadingStateProps) {
  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-center mb-2">{errorText}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {error}
        </p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新加载
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-center mb-2">{emptyText}</h3>
        <p className="text-muted-foreground text-center mb-6">
          没有找到相关内容
        </p>
        {onSearch && (
          <Button onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            搜索其他内容
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// 异步数据加载Hook
export function useAsyncData<T>(fetchData: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, deps);

  return {
    data,
    loading,
    error,
    retry,
    setData,
  };
}

// 通知管理Hook
export function useNotification() {
  interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: Notification['type'],
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (title: string, message?: string) =>
    addNotification('success', title, message, 3000);

  const showError = (title: string, message?: string) =>
    addNotification('error', title, message, 5000);

  const showWarning = (title: string, message?: string) =>
    addNotification('warning', title, message, 4000);

  const showInfo = (title: string, message?: string) =>
    addNotification('info', title, message, 3000);

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
