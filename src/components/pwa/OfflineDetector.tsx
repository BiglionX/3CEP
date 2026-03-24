/**
 * 离线检测组件 - SW-003
 * 实现离线状态检测和用户提示功能
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 初始在线状态
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      console.log('[OfflineDetector] Back online!');
      setIsOnline(true);

      // 如果之前离线过，显示重新连接提示
      if (wasOffline) {
        setShowReconnected(true);
        // 3 秒后自动隐藏
        setTimeout(() => {
          setShowReconnected(false);
        }, 3000);
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      console.log('[OfflineDetector] Went offline');
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // 监听 Service Worker 的更新消息
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          console.log(
            '[OfflineDetector] Update available:',
            event.data.message
          );
        }
      });
    }
  }, []);

  // 离线时显示固定顶部提示
  if (!isOnline) {
    return (
      <Alert
        variant="destructive"
        className="fixed top-0 left-0 right-0 z-50 rounded-none shadow-lg border-0"
      >
        <WifiOff className="h-5 w-5" />
        <AlertTitle>您已离线</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            <p>当前无法连接到服务器，正在使用缓存数据。</p>
            <p className="text-sm text-gray-600">
              已缓存的内容仍可访问，新数据将在网络恢复后自动同步。
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // 重新连接时的成功提示
  if (showReconnected) {
    return (
      <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none shadow-lg border-l-4 border-l-green-500 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">已重新连接</AlertTitle>
        <AlertDescription className="text-green-700">
          网络连接已恢复，数据将自动同步。
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * 离线状态 Hook - 可在其他组件中使用
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    lastOfflineTime,
    lastOnlineTime,
    isOffline: !isOnline,
  };
}

/**
 * 离线操作按钮组件 - 可选功能
 */
export function RetryButton({ onClick }: { onClick?: () => void }) {
  const { isOnline, isOffline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick || (() => window.location.reload())}
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      重试连接
    </Button>
  );
}
