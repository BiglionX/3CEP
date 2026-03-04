/**
 * RBAC权限控制? * 实现基于角色的访问控制系统的完整功能
 */

import {
  PermissionManager,
  UserInfo,
  PermissionCheckResult,
} from './permission-manager';
import {
  PermissionConfig,
  PermissionConfigManager,
  RoleDefinition,
  PermissionDefinition,
} from '../config/permission-config';

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface PermissionGrant {
  userId: string;
  permission: string;
  grantedBy: string;
  grantedAt: Date;
  scope?: string; // 权限作用?  condition?: string; // 权限条件表达?  expiresAt?: Date;
}

export interface RoleHierarchy {
  parentRoleId: string;
  childRoleId: string;
  createdAt: Date;
  createdBy: string;
}

export interface AccessRequest {
  requestId: string;
  userId: string;
  resourceId: string;
  action: string;
  context?: Record<string, any>;
  justification?: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export class RBACController {
  private static instance: RBACController;
  private permissionManager: PermissionManager;
  private configManager: PermissionConfigManager;
  private roleAssignments: Map<string, RoleAssignment[]> = new Map();
  private permissionGrants: Map<string, PermissionGrant[]> = new Map();
  private roleHierarchies: RoleHierarchy[] = [];
  private accessRequests: AccessRequest[] = [];

  private constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.configManager = PermissionConfigManager.getInstance();
  }

  static getInstance(): RBACController {
    if (!RBACController.instance) {
      RBACController.instance = new RBACController();
    }
    return RBACController.instance;
  }

  /**
   * 分配角色给用?   */
  assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date
  ): boolean {
    try {
      const config = this.configManager.getConfig();

      // 验证角色是否存在
      if (!config.roles[roleId]) {
        console.error(`角色 ${roleId} 不存在`);
        return false;
      }

      // 检查用户是否已拥有该角?      const existingAssignments = this.roleAssignments.get(userId) || [];
      const existingActiveAssignment = existingAssignments.find(
        assignment => assignment.roleId === roleId && assignment.isActive
      );

      if (existingActiveAssignment) {
        console.warn(`用户 ${userId} 已经拥有角色 ${roleId}`);
        return true; // 已经拥有，视为成?      }

      // 创建新的角色分配
      const assignment: RoleAssignment = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
        isActive: true,
      };

      // 更新角色分配记录
      if (!this.roleAssignments.has(userId)) {
        this.roleAssignments.set(userId, []);
      }
      this.roleAssignments.get(userId)!.push(assignment);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功为用?${userId} 分配角色 ${roleId}`)return true;
    } catch (error) {
      console.error('分配角色失败:', error);
      return false;
    }
  }

  /**
   * 移除用户的角?   */
  removeRole(userId: string, roleId: string, removedBy: string): boolean {
    try {
      const assignments = this.roleAssignments.get(userId);
      if (!assignments) {
        console.warn(`用户 ${userId} 没有任何角色分配`);
        return false;
      }

      const assignmentIndex = assignments.findIndex(
        assignment => assignment.roleId === roleId && assignment.isActive
      );

      if (assignmentIndex === -1) {
        console.warn(`用户 ${userId} 未分配角?${roleId}`);
        return false;
      }

      // 标记为非活跃状?      assignments[assignmentIndex] = {
        ...assignments[assignmentIndex],
        isActive: false,
      };

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功移除用户 ${userId} 的角?${roleId}`)return true;
    } catch (error) {
      console.error('移除角色失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的所有角色（包括继承的角色）
   */
  getUserRoles(userId: string): string[] {
    const roles = new Set<string>();
    const assignments = this.roleAssignments.get(userId) || [];

    // 获取直接分配的角?    assignments
      .filter(assignment => assignment.isActive)
      .forEach(assignment => {
        roles.add(assignment.roleId);
        // 添加继承的角?        this.getInheritedRoles(assignment.roleId, roles);
      });

    return Array.from(roles);
  }

  /**
   * 获取继承的角?   */
  private getInheritedRoles(
    roleId: string,
    roles: Set<string>,
    visited: Set<string> = new Set()
  ): void {
    if (visited.has(roleId)) return;
    visited.add(roleId);

    const config = this.configManager.getConfig();
    const role = config.roles[roleId];

    if (role && role.inherits) {
      role.inherits.forEach(inheritedRoleId => {
        roles.add(inheritedRoleId);
        this.getInheritedRoles(inheritedRoleId, roles, visited);
      });
    }
  }

  /**
   * 授予用户特定权限（超越角色权限）
   */
  grantPermission(
    userId: string,
    permission: string,
    grantedBy: string,
    scope?: string,
    condition?: string,
    expiresAt?: Date
  ): boolean {
    try {
      const config = this.configManager.getConfig();

      // 验证权限是否存在
      if (permission !== '*' && !config.permissions[permission]) {
        console.error(`权限 ${permission} 不存在`);
        return false;
      }

      const grant: PermissionGrant = {
        userId,
        permission,
        grantedBy,
        grantedAt: new Date(),
        scope,
        condition,
        expiresAt,
      };

      if (!this.permissionGrants.has(userId)) {
        this.permissionGrants.set(userId, []);
      }
      this.permissionGrants.get(userId)!.push(grant);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功授予用户 ${userId} 权限 ${permission}`)return true;
    } catch (error) {
      console.error('授予权限失败:', error);
      return false;
    }
  }

  /**
   * 撤销用户的特定权?   */
  revokePermission(
    userId: string,
    permission: string,
    revokedBy: string
  ): boolean {
    try {
      const grants = this.permissionGrants.get(userId);
      if (!grants) return false;

      const grantIndex = grants.findIndex(
        grant => grant.permission === permission && !grant.expiresAt
      );

      if (grantIndex === -1) return false;

      // 移除权限授予
      grants.splice(grantIndex, 1);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功撤销用户 ${userId} 的权?${permission}`)return true;
    } catch (error) {
      console.error('撤销权限失败:', error);
      return false;
    }
  }

  /**
   * 检查用户权限（结合角色权限和直接授予的权限?   */
  checkPermission(
    user: UserInfo,
    permission: string,
    resource?: string
  ): PermissionCheckResult {
    // 首先使用现有的权限管理器检?    let result = this.permissionManager.hasPermission(
      user,
      permission,
      resource
    );

    // 如果基本检查通过，直接返?    if (result.hasPermission) {
      return result;
    }

    // 检查直接授予的权限
    const directGrants = this.permissionGrants.get(user.id) || [];
    const activeGrants = directGrants.filter(
      grant =>
        this.isGrantActive(grant) &&
        (grant.permission === permission || grant.permission === '*')
    );

    if (activeGrants.length > 0) {
      return { hasPermission: true };
    }

    // 检查角色继承的权限
    const userRoles = this.getUserRoles(user.id);
    const config = this.configManager.getConfig();

    for (const roleId of userRoles) {
      const role = config.roles[roleId];
      if (role && this.checkRolePermission(role, permission, config)) {
        return { hasPermission: true };
      }
    }

    return {
      hasPermission: false,
      reason: `用户 ${user.id} 缺少权限 ${permission}`,
    };
  }

  /**
   * 检查角色是否具有特定权?   */
  private checkRolePermission(
    role: RoleDefinition,
    permission: string,
    config: PermissionConfig
  ): boolean {
    // 直接权限检?    if (role.permissions.includes(permission)) {
      return true;
    }

    // 通配符权限检?    if (role.permissions.includes('*')) {
      return true;
    }

    // 继承角色权限检?    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedRole = config.roles[inheritedRoleId];
        if (
          inheritedRole &&
          this.checkRolePermission(inheritedRole, permission, config)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查权限授予是否仍然有?   */
  private isGrantActive(grant: PermissionGrant): boolean {
    if (!grant.expiresAt) return true;
    return grant.expiresAt > new Date();
  }

  /**
   * 创建角色层次结构
   */
  createRoleHierarchy(
    parentRoleId: string,
    childRoleId: string,
    createdBy: string
  ): boolean {
    try {
      const config = this.configManager.getConfig();

      // 验证角色是否存在
      if (!config.roles[parentRoleId] || !config.roles[childRoleId]) {
        console.error('父角色或子角色不存在');
        return false;
      }

      // 检查是否已存在该层次关?      const existing = this.roleHierarchies.find(
        hierarchy =>
          hierarchy.parentRoleId === parentRoleId &&
          hierarchy.childRoleId === childRoleId
      );

      if (existing) {
        console.warn('角色层次关系已存?);
        return true;
      }

      // 创建层次关系
      const hierarchy: RoleHierarchy = {
        parentRoleId,
        childRoleId,
        createdAt: new Date(),
        createdBy,
      };

      this.roleHierarchies.push(hierarchy);

      // 更新角色继承关系
      if (!config.roles[childRoleId].inherits) {
        config.roles[childRoleId].inherits = [];
      }
      if (!config.roles[childRoleId].inherits!.includes(parentRoleId)) {
        config.roles[childRoleId].inherits!.push(parentRoleId);
        this.configManager.updateConfig({ roles: config.roles });
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功创建角色层次: ${parentRoleId} -> ${childRoleId}`)return true;
    } catch (error) {
      console.error('创建角色层次失败:', error);
      return false;
    }
  }

  /**
   * 提交访问请求
   */
  submitAccessRequest(
    userId: string,
    resourceId: string,
    action: string,
    context?: Record<string, any>,
    justification?: string
  ): string {
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const request: AccessRequest = {
        requestId,
        userId,
        resourceId,
        action,
        context,
        justification,
        requestedAt: new Date(),
        status: 'pending',
      };

      this.accessRequests.push(request);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`用户 ${userId} 提交了访问请?${requestId}`)return requestId;
    } catch (error) {
      console.error('提交访问请求失败:', error);
      throw error;
    }
  }

  /**
   * 审批访问请求
   */
  reviewAccessRequest(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string
  ): boolean {
    try {
      const request = this.accessRequests.find(
        req => req.requestId === requestId
      );

      if (!request) {
        console.error(`访问请求 ${requestId} 不存在`);
        return false;
      }

      if (request.status !== 'pending') {
        console.error(`访问请求 ${requestId} 状态不是待审批`);
        return false;
      }

      request.status = approved ? 'approved' : 'rejected';
      request.reviewedBy = reviewerId;
      request.reviewedAt = new Date();
      request.reviewNotes = notes;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `访问请求 ${requestId} 已被 ${reviewerId} ${approved ? '批准' : '拒绝'}`
      )return true;
    } catch (error) {
      console.error('审批访问请求失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的角色分配历?   */
  getRoleAssignmentHistory(userId: string): RoleAssignment[] {
    return this.roleAssignments.get(userId) || [];
  }

  /**
   * 获取权限授予历史
   */
  getPermissionGrantHistory(userId: string): PermissionGrant[] {
    return this.permissionGrants.get(userId) || [];
  }

  /**
   * 获取待处理的访问请求
   */
  getPendingAccessRequests(): AccessRequest[] {
    return this.accessRequests.filter(req => req.status === 'pending');
  }

  /**
   * 获取角色层次结构
   */
  getRoleHierarchies(): RoleHierarchy[] {
    return [...this.roleHierarchies];
  }

  /**
   * 获取系统统计信息
   */
  getRBACStats(): {
    totalRoleAssignments: number;
    totalPermissionGrants: number;
    totalRoleHierarchies: number;
    pendingAccessRequests: number;
    activeUsers: number;
  } {
    let totalRoleAssignments = 0;
    let totalPermissionGrants = 0;
    let activeUsers = 0;

    this.roleAssignments.forEach(assignments => {
      totalRoleAssignments += assignments.length;
      if (assignments.some(a => a.isActive)) activeUsers++;
    });

    this.permissionGrants.forEach(grants => {
      totalPermissionGrants += grants.length;
    });

    const pendingRequests = this.accessRequests.filter(
      req => req.status === 'pending'
    );

    return {
      totalRoleAssignments,
      totalPermissionGrants,
      totalRoleHierarchies: this.roleHierarchies.length,
      pendingAccessRequests: pendingRequests.length,
      activeUsers,
    };
  }
}
