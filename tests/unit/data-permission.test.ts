/**
 * 数据权限过滤器 - 集成测试
 * 
 * @file tests/integration/data-permission.test.ts
 */

import { describe, expect, it } from 'vitest';
import {
  DataPermissionFilter,
  QueryFilters,
  DataScope,
} from '@/modules/common/permissions/core/data-permission.filter';
import { UserInfo } from '@/modules/common/permissions/core/api-interceptor';

// Mock 用户信息
const mockUsers = {
  admin: {
    id: 'admin-001',
    email: 'admin@example.com',
    roles: ['admin'],
    tenantId: 'tenant-001',
  } as UserInfo,
  
  manager: {
    id: 'manager-001',
    email: 'manager@example.com',
    roles: ['manager'],
    tenantId: 'tenant-001',
    departmentId: 'dept-001',
  } as UserInfo,
  
  viewer: {
    id: 'viewer-001',
    email: 'viewer@example.com',
    roles: ['viewer'],
    tenantId: 'tenant-001',
  } as UserInfo,
  
  userFromOtherTenant: {
    id: 'user-002',
    email: 'user2@example.com',
    roles: ['viewer'],
    tenantId: 'tenant-002',
  } as UserInfo,
};

describe('数据权限过滤器集成测试', () => {
  describe('租户隔离过滤', () => {
    it('普通用户只能查看自己租户的数据', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'users'
      );

      expect(result.tenant_id).toBe('tenant-001');
    });

    it('经理可以查看自己租户的数据', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.manager,
        'users'
      );

      expect(result.tenant_id).toBe('tenant-001');
    });

    it('管理员不受租户隔离限制', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.admin,
        'users'
      );

      // 管理员不自动添加租户过滤
      expect(result.tenant_id).toBeUndefined();
    });
  });

  describe('创建者过滤', () => {
    it('普通用户只能查看自己创建的数据', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'orders'
      );

      expect(result.created_by).toBe('viewer-001');
    });

    it('经理可以查看本部门的数据', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.manager,
        'orders'
      );

      expect(result.department_id).toBe('dept-001');
    });

    it('管理员不受创建者限制', () => {
      const filters: QueryFilters = {};
      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.admin,
        'orders'
      );

      expect(result.created_by).toBeUndefined();
    });
  });

  describe('资源类型识别', () => {
    it('正确识别需要租户隔离的资源', () => {
      expect(DataPermissionFilter.isTenantIsolated('users')).toBe(true);
      expect(DataPermissionFilter.isTenantIsolated('content')).toBe(true);
      expect(DataPermissionFilter.isTenantIsolated('shops')).toBe(true);
      expect(DataPermissionFilter.isTenantIsolated('payments')).toBe(true);
    });

    it('正确识别需要创建者过滤的资源', () => {
      expect(DataPermissionFilter.isCreatorRestricted('orders')).toBe(true);
      expect(DataPermissionFilter.isCreatorRestricted('devices')).toBe(true);
      expect(DataPermissionFilter.isCreatorRestricted('quotations')).toBe(true);
    });

    it('正确识别跨租户白名单资源', () => {
      const whitelist = DataPermissionFilter.getCrossTenantWhitelist();
      expect(whitelist).toContain('admin');
      expect(whitelist).toContain('system');
    });
  });

  describe('跨租户访问验证', () => {
    it('超级管理员允许跨租户访问', () => {
      const result = DataPermissionFilter.validateCrossTenantAccess(
        mockUsers.admin,
        'tenant-002'
      );

      expect(result.allowed).toBe(true);
    });

    it('同一租户内允许访问', () => {
      const result = DataPermissionFilter.validateCrossTenantAccess(
        mockUsers.viewer,
        'tenant-001'
      );

      expect(result.allowed).toBe(true);
    });

    it('不同租户拒绝访问', () => {
      const result = DataPermissionFilter.validateCrossTenantAccess(
        mockUsers.viewer,
        'tenant-002'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('跨租户访问被拒绝');
    });
  });

  describe('SQL 条件构建', () => {
    it('正确构建 SQL WHERE 条件', () => {
      const filters: QueryFilters = {
        tenant_id: 'tenant-001',
        created_by: 'user-001',
        status: 'active',
      };

      const { where, params } = DataPermissionFilter.buildSQLWhere(filters);

      expect(where).toContain('WHERE');
      expect(where).toContain('tenant_id = $1');
      expect(where).toContain('created_by = $2');
      expect(where).toContain('status = $3');
      expect(params).toEqual(['tenant-001', 'user-001', 'active']);
    });

    it('空条件返回空字符串', () => {
      const filters: QueryFilters = {};
      const { where } = DataPermissionFilter.buildSQLWhere(filters);

      expect(where).toBe('');
    });
  });

  describe('复杂场景测试', () => {
    it('同时应用租户隔离和创建者过滤', () => {
      const filters: QueryFilters = {
        status: 'active',
      };

      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'orders'
      );

      // orders 既需要租户隔离又需要创建者过滤
      expect(result.tenant_id).toBe('tenant-001');
      expect(result.created_by).toBe('viewer-001');
      expect(result.status).toBe('active');
    });

    it('只应用租户隔离（不需要创建者过滤）', () => {
      const filters: QueryFilters = {
        search: 'test',
      };

      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'users'
      );

      // users 只需要租户隔离
      expect(result.tenant_id).toBe('tenant-001');
      expect(result.created_by).toBeUndefined();
      expect(result.search).toBe('test');
    });
  });

  describe('边界情况测试', () => {
    it('处理 null 和 undefined 值', () => {
      const filters: QueryFilters = {
        tenant_id: null as any,
        created_by: undefined,
      };

      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'users'
      );

      expect(result.tenant_id).toBe('tenant-001'); // 应该被覆盖
    });

    it('保留原有过滤条件', () => {
      const filters: QueryFilters = {
        status: 'active',
        role: 'user',
      };

      const result = DataPermissionFilter.applyDataScope(
        filters,
        mockUsers.viewer,
        'users'
      );

      expect(result.status).toBe('active');
      expect(result.role).toBe('user');
      expect(result.tenant_id).toBe('tenant-001');
    });
  });
});
