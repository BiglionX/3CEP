/**
 * 前端权限同步Hook
 * 实现前后端权限状态的实时同步和一致性检? */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePermission } from './use-permission';
import {
  PermissionSyncManager,
  SyncStatus,
  PermissionMismatch,
} from '../core/permission-sync';

export interface UsePermissionSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  mismatchStrategy?: 'ignore' | 'warn' | 'refresh' | 'block';
  showStatus?: boolean;
}

export interface PermissionSyncHookResult {
  syncManager: PermissionSyncManager;
  syncStatus: SyncStatus;
  mismatches: PermissionMismatch[];
  isSyncing: boolean;
  forceSync: () => Promise<void>;
  clearMismatches: () => void;
  getSyncReport: () => any;
  syncError: string | null;
}

export function usePermissionSync(
  options: UsePermissionSyncOptions = {}
): PermissionSyncHookResult {
  const {
    autoSync = true,
    syncInterval = 30000,
    mismatchStrategy = 'warn',
    showStatus = false,
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSynced: false,
    lastSyncTime: 0,
    mismatchCount: 0,
  });
  const [mismatches, setMismatches] = useState<PermissionMismatch[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncManagerRef = useRef<PermissionSyncManager>(
    PermissionSyncManager.getInstance()
  );
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, refreshPermissions } = usePermission();

  const forceSync = useCallback(async (): Promise<void> => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncManagerRef.current.forceSync(user || undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '同步失败';
      setSyncError(errorMessage);
      console.error('权限同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, user]);

  const clearMismatches = useCallback((): void => {
    syncManagerRef.current.clearMismatches();
    setMismatches([]);
  }, []);

  const getSyncReport = useCallback((): any => {
    return syncManagerRef.current.getSyncReport();
  }, []);

  const handleMismatch = useCallback(
    (mismatch: PermissionMismatch): void => {
      switch (mismatchStrategy) {
        case 'warn':
          console.warn('权限不匹?detected:', mismatch);
          break;
        case 'refresh':
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('权限不匹配，自动刷新权限配置')refreshPermissions();
          break;
        case 'block':
          console.error('权限不匹配，阻止操作:', mismatch);
          break;
        case 'ignore':
        default:
          break;
      }
    },
    [mismatchStrategy, refreshPermissions]
  );

  useEffect(() => {
    if (!autoSync) return;

    const startSyncTimer = () => {
      syncTimerRef.current = setInterval(() => {
        forceSync();
      }, syncInterval);
    };

    const stopSyncTimer = () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };

    startSyncTimer();

    return () => {
      stopSyncTimer();
    };
  }, [autoSync, syncInterval, forceSync]);

  useEffect(() => {
    const unsubscribe = syncManagerRef.current.subscribe(status => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const latestMismatches = syncManagerRef.current.getMismatches(10);
      setMismatches(latestMismatches);

      if (latestMismatches.length > 0) {
        const newMismatches = latestMismatches.filter(
          m =>
            !mismatches.some(
              existing =>
                existing.permission === m.permission &&
                existing.timestamp === m.timestamp
            )
        );

        newMismatches.forEach(handleMismatch);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [mismatches, handleMismatch]);

  useEffect(() => {
    if (user) {
      forceSync();
    }
  }, [user, forceSync]);

  useEffect(() => {
    if (showStatus && process.env.NODE_ENV === 'development') {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔒 权限同步状?', {
        synced: syncStatus.isSynced,
        lastSync: new Date(syncStatus.lastSyncTime).toLocaleTimeString(),
        mismatches: syncStatus.mismatchCount,
        isSyncing,
      });
    }
  }, [syncStatus, isSyncing, showStatus]);

  return {
    syncManager: syncManagerRef.current,
    syncStatus,
    mismatches,
    isSyncing,
    forceSync,
    clearMismatches,
    getSyncReport,
    syncError,
  };
}
