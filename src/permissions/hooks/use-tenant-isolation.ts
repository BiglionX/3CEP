/**
 * 租户隔离Hook
 * 提供租户相关功能的React集成
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TenantIsolationManager,
  TenantInfo,
  TenantAuditReport,
  DataAccessLog,
} from '../core/tenant-isolation';

export interface UseTenantIsolationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  tenantId?: string;
}

export interface TenantIsolationHookResult {
  // 租户管理
  currentTenant: TenantInfo | undefined;
  tenantList: TenantInfo[];
  tenantStats: any;

  // 审计功能
  auditReport: TenantAuditReport | null;
  accessLogs: DataAccessLog[];
  complianceScore: number;

  // 操作函数
  refreshTenantData: () => void;
  getAuditReport: (days?: number) => Promise<void>;
  exportAuditData: (
    startDate?: number,
    endDate?: number
  ) => Promise<DataAccessLog[]>;
  validateResourceAccess: (resource: string) => boolean;

  // 状?
  isLoading: boolean;
  error: string | null;
}

export function useTenantIsolation(
  options: UseTenantIsolationOptions = {}
): TenantIsolationHookResult {
  const { autoRefresh = true, refreshInterval = 30000, tenantId } = options;

  // 状态管?
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | undefined>();
  const [tenantList, setTenantList] = useState<TenantInfo[]>([]);
  const [tenantStats, setTenantStats] = useState<any>({});
  const [auditReport, setAuditReport] = useState<TenantAuditReport | null>(
    null
  );
  const [accessLogs, setAccessLogs] = useState<DataAccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取管理器实?
  const isolationManager = useMemo(
    () => TenantIsolationManager.getInstance(),
    []
  );

  // 刷新租户数据
  const refreshTenantData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      // 获取当前租户信息
      if (tenantId) {
        const tenant = isolationManager.getTenant(tenantId);
        setCurrentTenant(tenant);
      }

      // 获取租户列表和统?
      const tenants = Array.from(isolationManager['tenants'].values());
      setTenantList(tenants);
      setTenantStats(isolationManager.getTenantStatistics());

      // 获取最近的访问日志
      const recentLogs = isolationManager['accessLogs'].slice(0, 50);
      setAccessLogs(recentLogs);

      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '刷新租户数据失败';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [isolationManager, tenantId]);

  // 获取审计报告
  const getAuditReport = useCallback(
    async (days: number = 30) => {
      if (!tenantId) {
        setError('未指定租户ID');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const report = isolationManager.getTenantAuditReport(tenantId, days);
        setAuditReport(report);
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取审计报告失败';
        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [isolationManager, tenantId]
  );

  // 导出审计数据
  const exportAuditData = useCallback(
    async (startDate?: number, endDate?: number): Promise<DataAccessLog[]> => {
      try {
        return isolationManager.exportAuditData(tenantId, startDate, endDate);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '导出审计数据失败';
        setError(errorMessage);
        return [];
      }
    },
    [isolationManager, tenantId]
  );

  // 验证资源访问权限
  const validateResourceAccess = useCallback(
    (resource: string): boolean => {
      if (!tenantId) return false;
      return isolationManager.validateResourceOwnership(tenantId, resource);
    },
    [isolationManager, tenantId]
  );

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTenantData();

    const interval = setInterval(refreshTenantData, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, refreshTenantData]);

  // 计算合规分数
  const complianceScore = useMemo(() => {
    if (!auditReport) return 100;
    return auditReport.complianceScore;
  }, [auditReport]);

  // 初始化数?
  useEffect(() => {
    refreshTenantData();
  }, [refreshTenantData]);

  return {
    // 数据
    currentTenant,
    tenantList,
    tenantStats,
    auditReport,
    accessLogs,
    complianceScore,

    // 操作函数
    refreshTenantData,
    getAuditReport,
    exportAuditData,
    validateResourceAccess,

    // 状?
    isLoading,
    error,
  };
}
