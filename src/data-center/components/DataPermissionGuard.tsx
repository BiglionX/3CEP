/**
 * 数据中心权限控制组件
 * 提供数据访问级别的精细权限控? */

'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedPermission } from '@/data-center/hooks/use-unified-permission';
import { Spin, Alert, Card, Space, Tag } from 'antd';

interface DataPermissionGuardProps {
  dataSource: string;
  tableName: string;
  accessType?: 'READ' | 'WRITE' | 'EXECUTE';
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
  onAccessDenied?: (reason: string) => void;
}

export function DataPermissionGuard({
  dataSource,
  tableName,
  accessType = 'READ',
  fallback,
  loadingFallback,
  children,
  onAccessDenied,
}: DataPermissionGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [accessFilters, setAccessFilters] = useState<
    Record<string, any> | undefined
  >();
  const [columnMasking, setColumnMasking] = useState<
    Record<string, any> | undefined
  >();
  const [error, setError] = useState<string | null>(null);

  const { checkDataAccess } = useUnifiedPermission();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsChecking(true);
        setError(null);

        const result = await checkDataAccess(dataSource, tableName, accessType);

        if (result.allowed) {
          setIsAllowed(true);
          setAccessFilters(result.filters);
          setColumnMasking(result.masking);
        } else {
          setIsAllowed(false);
          const reason = `无权访问数据? ${dataSource}.${tableName}`;
          setError(reason);
          onAccessDenied?.(reason);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '数据访问检查失?;
        setError(errorMessage);
        setIsAllowed(false);
        onAccessDenied?.(errorMessage);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [dataSource, tableName, accessType, checkDataAccess, onAccessDenied]);

  if (isChecking) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" tip="检查数据访问权?.." />
        </div>
      )
    );
  }

  if (error) {
    return (
      <Alert
        message="数据访问权限检查失?
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!isAllowed) {
    return (
      fallback || (
        <Card className="border-red-200">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg font-medium mb-2">
              访问被拒?            </div>
            <div className="text-gray-600">
              您没有权限访?{dataSource}.{tableName} 数据
            </div>
          </div>
        </Card>
      )
    );
  }

  // 通过React Context传递访问控制信?  return (
    <DataContext.Provider
      value={{
        filters: accessFilters,
        masking: columnMasking,
        dataSource,
        tableName,
        accessType,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// 数据访问上下?interface DataContextType {
  filters?: Record<string, any>;
  masking?: Record<string, any>;
  dataSource: string;
  tableName: string;
  accessType: 'READ' | 'WRITE' | 'EXECUTE';
}

const DataContext = React.createContext<DataContextType | null>(null);

export function useDataAccess() {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useDataAccess must be used within DataPermissionGuard');
  }
  return context;
}

// 权限信息显示组件
interface PermissionInfoProps {
  permission: string;
  showDetails?: boolean;
}

export function PermissionInfo({
  permission,
  showDetails = false,
}: PermissionInfoProps) {
  const { hasPermission, getPermissionInfo } = useUnifiedPermission();
  const [permissionInfo, setPermissionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const hasPerm = hasPermission(permission);

  useEffect(() => {
    if (showDetails) {
      const fetchInfo = async () => {
        try {
          setLoading(true);
          const info = await getPermissionInfo(permission);
          setPermissionInfo(info);
        } catch (error) {
          console.error('获取权限信息失败:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchInfo();
    }
  }, [permission, showDetails, getPermissionInfo]);

  if (loading) {
    return <Tag color="processing">加载?..</Tag>;
  }

  return (
    <Space>
      <Tag color={hasPerm ? 'success' : 'error'}>
        {hasPerm ? '�? : '�?} {permission}
      </Tag>
      {showDetails && permissionInfo && (
        <span className="text-sm text-gray-500">
          {permissionInfo.description || permissionInfo.name}
        </span>
      )}
    </Space>
  );
}

// 权限状态面?export function PermissionStatusPanel() {
  const { isLoading, error, getUserPermissions, getAccessibleResources } =
    useUnifiedPermission();

  const [permissions, setPermissions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPermissions = async () => {
    try {
      setLoading(true);
      const [userPerms, accessibleRes] = await Promise.all([
        getUserPermissions(),
        getAccessibleResources(),
      ]);

      setPermissions(userPerms);
      setResources(accessibleRes.resources);
    } catch (error) {
      console.error('刷新权限信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, []);

  if (isLoading || loading) {
    return (
      <Card title="权限状? loading>
        <div>加载?..</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="权限状?>
        <Alert
          message="权限信息加载失败"
          description={error.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title="权限状?
      extra={
        <button
          onClick={refreshPermissions}
          className="text-blue-500 hover:text-blue-700 text-sm"
          disabled={loading}
        >
          刷新
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">
            拥有的权?({permissions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {permissions.slice(0, 10).map(perm => (
              <Tag key={perm} color="blue">
                {perm}
              </Tag>
            ))}
            {permissions.length > 10 && (
              <Tag>+{permissions.length - 10} 更多</Tag>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">可访问资?({resources.length})</h4>
          <div className="flex flex-wrap gap-2">
            {resources.slice(0, 8).map(resource => (
              <Tag key={resource} color="green">
                {resource}
              </Tag>
            ))}
            {resources.length > 8 && <Tag>+{resources.length - 8} 更多</Tag>}
          </div>
        </div>

        {error && (
          <Alert
            message="权限检查遇到问?
            description={error.message}
            type="warning"
            showIcon
          />
        )}
      </div>
    </Card>
  );
}

// 权限调试面板（仅开发环境显示）
export function PermissionDebugPanel() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const {
    isLoading,
    error,
    hasPermission,
    checkPermissions,
    clearPermissionCache,
  } = useUnifiedPermission();

  const [testPermission, setTestPermission] = useState('data_center_read');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const testDataCenterPermissions = [
    'data_center_read',
    'data_center_query',
    'data_center_analyze',
    'data_center_manage',
    'reports_read',
    'dashboard_read',
  ];

  const runTest = async () => {
    const result = hasPermission(testPermission);
    setTestResult(result);
  };

  const runBatchTest = async () => {
    const results = await checkPermissions(testDataCenterPermissions);
    console.table(results);
  };

  return (
    <Card title="权限调试面板" className="border-orange-200">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">单权限测?/h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPermission}
              onChange={e => setTestPermission(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="输入权限标识"
            />
            <button
              onClick={runTest}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              测试
            </button>
          </div>
          {testResult !== null && (
            <div className="mt-2">
              <Tag color={testResult ? 'success' : 'error'}>
                结果: {testResult ? '允许' : '拒绝'}
              </Tag>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">批量测试</h4>
          <button
            onClick={runBatchTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            测试数据中心权限?          </button>
        </div>

        <div>
          <h4 className="font-medium mb-2">缓存管理</h4>
          <button
            onClick={clearPermissionCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={isLoading}
          >
            清除权限缓存
          </button>
        </div>

        {error && (
          <Alert
            message="调试错误"
            description={error.message}
            type="error"
            showIcon
          />
        )}
      </div>
    </Card>
  );
}
