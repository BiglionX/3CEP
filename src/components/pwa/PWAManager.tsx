/**
 * PWA管理组件
 * 负责Service Worker注册、更新检查和离线状态管? */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Desktop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// PWA状态类?type PWAStatus =
  | 'unsupported'
  | 'idle'
  | 'installable'
  | 'installed'
  | 'update-available'
  | 'updating';

// 安装提示类型
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAManager() {
  const [status, setStatus] = useState<PWAStatus>('idle');
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // 检查PWA支持
  const checkPWASupport = useCallback(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setStatus('idle');
      return true;
    } else {
      setStatus('unsupported');
      return false;
    }
  }, []);

  // 注册Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!checkPWASupport()) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[PWA] Service Worker registered:', reg)// 监听更新
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setStatus('update-available');
              // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[PWA] Update available')}
          });
        }
      });

      // 检查现有状?      if (reg.waiting) {
        setStatus('update-available');
      } else if (reg.active) {
        setStatus('installed');
      }
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      setStatus('idle');
    }
  }, [checkPWASupport]);

  // 处理安装提示
  const handleInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setInstallPrompt(e as InstallPromptEvent);
    setStatus('installable');
  }, []);

  // 安装PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[PWA] User accepted install')setStatus('installed');
      } else {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[PWA] User dismissed install')}

      setInstallPrompt(null);
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
    }
  }, [installPrompt]);

  // 更新应用
  const updateApp = useCallback(async () => {
    if (!registration?.waiting) return;

    setStatus('updating');
    setUpdateProgress(0);

    try {
      // 通知Service Worker跳过等待
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // 模拟更新进度
      const interval = setInterval(() => {
        setUpdateProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);

      // 等待一段时间后刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      setStatus('installed');
      setUpdateProgress(0);
    }
  }, [registration]);

  // 检查在线状?  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // 初始化PWA
  useEffect(() => {
    // 检查支持情?    if (!checkPWASupport()) return;

    // 注册Service Worker
    registerServiceWorker();

    // 监听安装提示
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // 监听在线状?    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // 初始在线状?    checkOnlineStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [
    checkPWASupport,
    registerServiceWorker,
    handleInstallPrompt,
    checkOnlineStatus,
  ]);

  // 渲染状态图?  const renderStatusIcon = () => {
    switch (status) {
      case 'unsupported':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'installable':
        return <Download className="h-5 w-5 text-blue-500" />;
      case 'installed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'update-available':
        return <RefreshCw className="h-5 w-5 text-yellow-500" />;
      case 'updating':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Smartphone className="h-5 w-5 text-gray-500" />;
    }
  };

  // 渲染状态文?  const renderStatusText = () => {
    switch (status) {
      case 'unsupported':
        return '浏览器不支持PWA功能';
      case 'installable':
        return '可以安装到设?;
      case 'installed':
        return '已安装为应用程序';
      case 'update-available':
        return '有新版本可用';
      case 'updating':
        return '正在更新...';
      default:
        return '准备就绪';
    }
  };

  // 渲染设备类型
  const renderDeviceType = () => {
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    return isMobile ? (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Smartphone className="h-3 w-3" />
        移动设备
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Desktop className="h-3 w-3" />
        桌面设备
      </Badge>
    );
  };

  if (status === 'unsupported') {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {renderStatusIcon()}
            PWA功能不可?          </CardTitle>
          <CardDescription>
            当前浏览器不支持PWA功能，请使用Chrome、Firefox或Safari等现代浏览器?          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderStatusIcon()}
            <CardTitle>PWA状态管?/CardTitle>
          </div>
          {renderDeviceType()}
        </div>
        <CardDescription>管理应用程序的安装、更新和离线功能</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 状态显?*/}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">{renderStatusText()}</div>
            <div className="flex items-center gap-2 mt-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-500">
                {isOnline ? '在线' : '离线'}
              </span>
            </div>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {status === 'installed' ? '已安? : 'Web版本'}
          </Badge>
        </div>

        {/* 安装按钮 */}
        {status === 'installable' && installPrompt && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">安装应用程序</h3>
              <p className="text-sm text-blue-700 mt-1">
                将此应用安装到您的设备上，享受原生应用般的体验?              </p>
            </div>
            <Button onClick={installPWA} className="w-full" size="lg">
              <Download className="h-5 w-5 mr-2" />
              安装到设?            </Button>
          </div>
        )}

        {/* 更新按钮 */}
        {status === 'update-available' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">应用更新可用</h3>
              <p className="text-sm text-yellow-700 mt-1">
                有新版本的应用程序可供更新，点击按钮立即更新?              </p>
            </div>
            <Button
              onClick={updateApp}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              立即更新
            </Button>
          </div>
        )}

        {/* 更新进度 */}
        {status === 'updating' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">正在更新...</h3>
              <p className="text-sm text-blue-700 mt-1">
                应用程序正在更新到最新版本，请稍候?              </p>
            </div>
            <div className="space-y-2">
              <Progress value={updateProgress} className="w-full" />
              <p className="text-sm text-center text-gray-500">
                {updateProgress}% 完成
              </p>
            </div>
          </div>
        )}

        {/* 功能特?*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              离线功能
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>�?离线浏览已访问过的页?/li>
              <li>�?缓存重要数据和资?/li>
              <li>�?断网时仍可查看部分内?/li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-500" />
              原生体验
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>�?添加到主屏幕快捷方式</li>
              <li>�?全屏应用体验</li>
              <li>�?推送通知支持</li>
            </ul>
          </div>
        </div>

        {/* 技术信?*/}
        <div className="pt-4 border-t">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              技术信?            </summary>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div>Service Worker: {registration ? '已注? : '未注?}</div>
              <div>浏览器支? {checkPWASupport() ? '支持' : '不支?}</div>
              <div>网络状? {isOnline ? '在线' : '离线'}</div>
              <div>当前版本: v1.0.0</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook用于在其他组件中使用PWA功能
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 检查是否已安装
    const checkInstallation = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    };

    // 检查安装可能?    const checkInstallability = (e: Event) => {
      setCanInstall(true);
    };

    // 检查在线状?    const checkOnline = () => {
      setIsOnline(navigator.onLine);
    };

    // 事件监听
    window.addEventListener('beforeinstallprompt', checkInstallability);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    // 初始检?    checkInstallation();
    checkOnline();

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallability);
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  return {
    isInstalled,
    canInstall,
    isOnline,
    install: () => {
      // 触发安装提示的逻辑应该在PWAManager组件中处?      window.dispatchEvent(new Event('beforeinstallprompt'));
    },
  };
}
