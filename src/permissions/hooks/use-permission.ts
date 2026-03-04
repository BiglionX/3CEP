/**
 * React权限管理Hook
 * 提供在React组件中使用权限检查的能力
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PermissionManager,
  UserInfo,
  PermissionCheckResult,
} from '../core/permission-manager';
import { PermissionLoader } from '../core/permission-loader';
import {
  PermissionConfig,
  PermissionConfigManager,
} from '../config/permission-config';

export interface UsePermissionOptions {
  autoLoad?: boolean;
  fallbackStrategy?: 'default' | 'empty' | 'retry';
  retryInterval?: number;
}

export interface PermissionHookResult {
  user: UserInfo | null;
  permissionManager: PermissionManager;
  config: PermissionConfig | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string | string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
  getAccessibleResources: (category?: string) => string[];
  refreshPermissions: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
}

export function usePermission(
  options: UsePermissionOptions = {}
): PermissionHookResult {
  const {
    autoLoad = true,
    fallbackStrategy = 'default',
    retryInterval = 30000,
  } = options;

  const [user, setUserState] = useState<UserInfo | null>(null);
  const [config, setConfig] = useState<PermissionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissionManager = useMemo(() => PermissionManager.getInstance(), []);
  const permissionLoader = useMemo(() => PermissionLoader.getInstance(), []);
  const configManager = useMemo(
    () => PermissionConfigManager.getInstance(),
    []
  );

  const setUser = useCallback((newUser: UserInfo | null) => {
    setUserState(newUser);
  }, []);

  const hasPermission = useCallback(
    (permission: string | string[]): boolean => {
      if (!user || !config) return false;
      const result = permissionManager.hasPermission(user, permission);
      return result.hasPermission;
    },
    [user, config, permissionManager]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user || !config) return false;
      const result = permissionManager.hasAnyPermission(user, permissions);
      return result.hasPermission;
    },
    [user, config, permissionManager]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user || !config) return false;
      const result = permissionManager.hasAllPermissions(user, permissions);
      return result.hasPermission;
    },
    [user, config, permissionManager]
  );

  const canAccessResource = useCallback(
    (resource: string, action: string): boolean => {
      if (!user || !config) return false;
      const result = permissionManager.canAccessResource(
        user,
        resource,
        action
      );
      return result.hasPermission;
    },
    [user, config, permissionManager]
  );

  const getAccessibleResources = useCallback(
    (category?: string): string[] => {
      if (!user || !config) return [];
      return permissionManager.getUserAccessibleResources(user, category);
    },
    [user, config, permissionManager]
  );

  const refreshPermissions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await permissionLoader.refreshConfig();
      if (result.success && result.config) {
        setConfig(result.config);
        setError(null);
      } else {
        setError(result.error || '权限配置加载失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);

      switch (fallbackStrategy) {
        case 'default':
          setConfig(configManager.getConfig());
          break;
        case 'empty':
          setConfig(null);
          break;
        case 'retry':
          break;
      }
    } finally {
      setLoading(false);
    }
  }, [permissionLoader, configManager, fallbackStrategy]);

  useEffect(() => {
    if (!autoLoad) return;

    const loadPermissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await permissionLoader.loadPermissions();
        if (result.success && result.config) {
          setConfig(result.config);
          setError(null);
        } else {
          setError(result.error || '权限配置加载失败');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [autoLoad, permissionLoader]);

  useEffect(() => {
    const unsubscribe = permissionLoader.subscribe(newConfig => {
      setConfig(newConfig);
    });

    return () => {
      unsubscribe();
    };
  }, [permissionLoader]);

  useEffect(() => {
    if (!error || fallbackStrategy !== 'retry') return;

    const retryTimer = setTimeout(() => {
      refreshPermissions();
    }, retryInterval);

    return () => {
      clearTimeout(retryTimer);
    };
  }, [error, fallbackStrategy, retryInterval, refreshPermissions]);

  return {
    user,
    permissionManager,
    config,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    getAccessibleResources,
    refreshPermissions,
    setUser,
  };
}
