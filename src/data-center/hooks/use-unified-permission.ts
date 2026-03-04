/**
 * 统一权限管理Hook
 * 提供React组件中使用的权限检查功?
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { UnifiedPermissionService } from './permission-service';

interface PermissionHookResult {
  // 权限检查状?
  isLoading: boolean;
  error: Error | null;
  
  // 权限检查函?
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // 批量权限检?
  checkPermissions: (permissions: string[]) => Promise<Record<string, boolean>>;
  
  // 资源访问检?
  getAccessibleResources: (category?: string) => Promise<{
    resources: string[];
    permissions: any[];
  }>;
  
  // 数据访问控制
  checkDataAccess: (
    dataSource: string,
    tableName: string,
    accessType?: 'READ' | 'WRITE' | 'EXECUTE'
  ) => Promise<{
    allowed: boolean;
    filters?: Record<string, any>;
    masking?: Record<string, any>;
  }>;
  
  // 权限信息获取
  getPermissionInfo: (permission: string) => Promise<any>;
  getUserPermissions: () => Promise<string[]>;
  
  // 缓存管理
  clearPermissionCache: () => Promise<void>;
}

// 全局权限服务实例
let permissionService: UnifiedPermissionService | null = null;

export function useUnifiedPermission(): PermissionHookResult {
  const { user, isLoading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});

  // 初始化权限服?
  useEffect(() => {
    if (!permissionService) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      if (supabaseUrl && supabaseKey) {
        permissionService = new UnifiedPermissionService(supabaseUrl, supabaseKey, redisUrl);
      }
    }
  }, []);

  // 权限检查主函数
  const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!user?.id || !permissionService) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await permissionService.checkPermission(user.id, permission);
      const allowed = result.allowed;
      
      // 更新本地缓存
      setPermissionCache(prev => ({
        ...prev,
        [permission]: allowed
      }));
      
      return allowed;
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('权限检查失?);
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 批量权限检?
  const checkPermissions = useCallback(async (permissions: string[]): Promise<Record<string, boolean>> => {
    if (!user?.id || !permissionService || permissions.length === 0) {
      return {};
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const results = await permissionService.batchCheckPermissions(user.id, permissions);
      
      // 更新本地缓存
      setPermissionCache(prev => ({
        ...prev,
        ...results
      }));
      
      return results;
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('批量权限检查失?);
      setError(error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 检查是否具有任一权限
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => {
      const cached = permissionCache[permission];
      return cached === true;
    });
  }, [permissionCache]);

  // 检查是否具有所有权?
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => {
      const cached = permissionCache[permission];
      return cached === true;
    });
  }, [permissionCache]);

  // 获取可访问资?
  const getAccessibleResources = useCallback(async (category?: any: string) => {
    if (!user?.id || !permissionService) {
      return { resources: [], permissions: [] };
    }

    try {
      setIsLoading(true);
      const result = await permissionService.getAccessibleResources(user.id, category);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取可访问资源失?);
      setError(error);
      return { resources: [], permissions: [] };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 数据访问控制检?
  const checkDataAccess = useCallback(async (
    dataSource: string,
    tableName: string,
    accessType: 'READ' | 'WRITE' | 'EXECUTE' = 'READ'
  ) => {
    if (!user?.id || !permissionService) {
      return { allowed: false };
    }

    try {
      setIsLoading(true);
      const result = await permissionService.checkDataAccess(
        user.id,
        dataSource,
        tableName,
        accessType
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('数据访问控制检查失?);
      setError(error);
      return { allowed: false };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 获取权限详细信息
  const getPermissionInfo = useCallback(async (permission: string) => {
    if (!permissionService) return null;
    
    try {
      // 这里可以调用具体的权限信息服?
      // 暂时返回空对象，实际实现需要查询权限表
      return { id: permission, name: permission };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取权限信息失败');
      setError(error);
      return null;
    }
  }, []);

  // 获取用户所有权?
  const getUserPermissions = useCallback(async (): Promise<string[]> => {
    if (!user?.id || !permissionService) {
      return [];
    }

    try {
      const result = await permissionService.getAccessibleResources(user.id);
      return result.permissions.map(p => p.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取用户权限失败');
      setError(error);
      return [];
    }
  }, [user?.id]);

  // 清除权限缓存
  const clearPermissionCache = useCallback(async (): Promise<void> => {
    if (!user?.id || !permissionService) return;

    try {
      await permissionService.clearUserPermissionCache(user.id);
      setPermissionCache({});
    } catch (err) {
      const error = err instanceof Error ? err : new Error('清除权限缓存失败');
      setError(error);
    }
  }, [user?.id]);

  // 初始化时预加载常用权?
  useEffect(() => {
    if (user?.id && permissionService) {
      // 预加载数据中心相关权?
      const commonPermissions = [
        'data_center_read',
        'data_center_query',
        'data_center_analyze',
        'reports_read',
        'dashboard_read'
      ];
      
      checkPermissions(commonPermissions).catch(console.error);
    }
  }, [user?.id, checkPermissions]);

  return {
    isLoading: isLoading || userLoading,
    error,
    hasPermission: (permission: string) => permissionCache[permission] === true,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissions,
    getAccessibleResources,
    checkDataAccess,
    getPermissionInfo,
    getUserPermissions,
    clearPermissionCache
  };
}

// 权限保护组件高阶组件
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
): React.FC<P> {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission, isLoading } = useUnifiedPermission();
    const isAllowed = hasPermission(requiredPermission);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAllowed) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
          <div className="text-lg font-medium mb-2">访问被拒?/div>
          <div className="text-sm">您没有权限访问此功能</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// 权限条件渲染组件
export function PermissionGuard({
  permission,
  fallback,
  children
}: {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasPermission, isLoading } = useUnifiedPermission();
  const isAllowed = hasPermission(permission);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!isAllowed) {
    return fallback || null;
  }

  return <>{children}</>;
}