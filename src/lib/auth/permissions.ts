/**
 * 智能体管理模块统一权限验证工具类
 *
 * 提供统一的权限验证、角色检查功能
 * 用于所有智能体相关的 API 端点
 */

import { createClient } from '@supabase/supabase-js';

/**
 * 定义智能体管理相关的操作权限
 */
export enum AgentPermission {
  // 基础权限
  AGENT_VIEW = 'agent:view', // 查看智能体
  AGENT_CREATE = 'agent:create', // 创建智能体
  AGENT_UPDATE = 'agent:update', // 更新智能体
  AGENT_DELETE = 'agent:delete', // 删除智能体

  // 审核权限
  AGENT_APPROVE = 'agent:approve', // 审核通过
  AGENT_REJECT = 'agent:reject', // 审核拒绝
  AGENT_SUSPEND = 'agent:suspend', // 暂停智能体

  // 上下架权限
  AGENT_SHELF = 'agent:shelf', // 上架/下架

  // 管理权限
  AGENT_ADMIN = 'agent:admin', // 管理员权限（所有操作）

  // 执行权限
  AGENT_EXECUTE = 'agent:execute', // 执行智能体
}

/**
 * 定义角色类型
 */
export type AgentRole =
  | 'admin' // 超级管理员
  | 'marketplace_admin' // 市场管理员
  | 'content_reviewer' // 内容审核员
  | 'owner' // 智能体所有者
  | 'user'; // 普通用户

/**
 * 权限映射表：定义每个角色拥有的权限
 */
const PERMISSIONS: Record<AgentRole, AgentPermission[]> = {
  admin: [
    // 管理员拥有所有权限
    AgentPermission.AGENT_VIEW,
    AgentPermission.AGENT_CREATE,
    AgentPermission.AGENT_UPDATE,
    AgentPermission.AGENT_DELETE,
    AgentPermission.AGENT_APPROVE,
    AgentPermission.AGENT_REJECT,
    AgentPermission.AGENT_SUSPEND,
    AgentPermission.AGENT_SHELF,
    AgentPermission.AGENT_ADMIN,
    AgentPermission.AGENT_EXECUTE,
  ],
  marketplace_admin: [
    // 市场管理员：管理上下架、审核
    AgentPermission.AGENT_VIEW,
    AgentPermission.AGENT_CREATE,
    AgentPermission.AGENT_UPDATE,
    AgentPermission.AGENT_APPROVE,
    AgentPermission.AGENT_REJECT,
    AgentPermission.AGENT_SUSPEND,
    AgentPermission.AGENT_SHELF,
    AgentPermission.AGENT_EXECUTE,
  ],
  content_reviewer: [
    // 内容审核员：仅审核权限
    AgentPermission.AGENT_VIEW,
    AgentPermission.AGENT_APPROVE,
    AgentPermission.AGENT_REJECT,
  ],
  owner: [
    // 智能体所有者：管理自己的智能体
    AgentPermission.AGENT_VIEW,
    AgentPermission.AGENT_CREATE,
    AgentPermission.AGENT_UPDATE,
    AgentPermission.AGENT_DELETE,
    AgentPermission.AGENT_EXECUTE,
  ],
  user: [
    // 普通用户：仅查看和执行
    AgentPermission.AGENT_VIEW,
    AgentPermission.AGENT_EXECUTE,
  ],
};

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  email?: string;
  role: AgentRole;
  tenant_id?: string;
}

/**
 * 权限验证结果
 */
export interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
  missingPermissions?: AgentPermission[];
}

/**
 * 权限验证工具类
 */
export class PermissionValidator {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
  }

  /**
   * 获取用户信息和角色
   */
  async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      return {
        id: profile.id,
        email: profile.email || undefined,
        role: (profile.role as AgentRole) || 'user',
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 检查用户是否拥有指定权限
   */
  hasPermission(userRole: AgentRole, permission: AgentPermission): boolean {
    // 超级管理员拥有所有权限
    if (userRole === 'admin') {
      return true;
    }

    const rolePermissions = PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * 检查用户是否拥有任意一个指定权限
   */
  hasAnyPermission(
    userRole: AgentRole,
    permissions: AgentPermission[]
  ): boolean {
    if (userRole === 'admin') {
      return true;
    }

    const rolePermissions = PERMISSIONS[userRole] || [];
    return permissions.some(perm => rolePermissions.includes(perm));
  }

  /**
   * 检查用户是否拥有所有指定权限
   */
  hasAllPermissions(
    userRole: AgentRole,
    permissions: AgentPermission[]
  ): boolean {
    if (userRole === 'admin') {
      return true;
    }

    const rolePermissions = PERMISSIONS[userRole] || [];
    return permissions.every(perm => rolePermissions.includes(perm));
  }

  /**
   * 验证用户角色是否为指定角色之一
   */
  hasRole(userRole: AgentRole, allowedRoles: AgentRole[]): boolean {
    return allowedRoles.includes(userRole);
  }

  /**
   * 检查用户是否是智能体的所有者
   */
  async isAgentOwner(agentId: string, userId: string): Promise<boolean> {
    try {
      const { data: agent } = await this.supabase
        .from('agents')
        .select('created_by, developer_id')
        .eq('id', agentId)
        .single();

      if (!agent) {
        return false;
      }

      return agent.created_by === userId || agent.developer_id === userId;
    } catch (error) {
      console.error('检查智能体所有者失败:', error);
      return false;
    }
  }

  /**
   * 完整的权限验证（包含角色和所有权检查）
   */
  async verifyPermission(
    userId: string,
    agentId: string | null,
    requiredPermission: AgentPermission
  ): Promise<PermissionResult> {
    // 获取用户信息
    const userInfo = await this.getUserInfo(userId);

    if (!userInfo) {
      return {
        hasPermission: false,
        reason: '用户信息不存在',
      };
    }

    const { role } = userInfo;

    // 检查基础权限
    if (!this.hasPermission(role, requiredPermission)) {
      return {
        hasPermission: false,
        reason: `角色 ${role} 没有 ${requiredPermission} 权限`,
        missingPermissions: [requiredPermission],
      };
    }

    // 如果是更新/删除操作，需要额外检查是否为所有者
    if (
      (requiredPermission === AgentPermission.AGENT_UPDATE ||
        requiredPermission === AgentPermission.AGENT_DELETE) &&
      role !== 'admin' &&
      role !== 'marketplace_admin'
    ) {
      if (agentId) {
        const isOwner = await this.isAgentOwner(agentId, userId);
        if (!isOwner) {
          return {
            hasPermission: false,
            reason: '只能操作自己的智能体',
          };
        }
      }
    }

    return {
      hasPermission: true,
    };
  }

  /**
   * 获取角色的所有权限
   */
  getRolePermissions(role: AgentRole): AgentPermission[] {
    return PERMISSIONS[role] || [];
  }

  /**
   * 获取所有角色列表
   */
  getAllRoles(): AgentRole[] {
    return Object.keys(PERMISSIONS) as AgentRole[];
  }

  /**
   * 获取权限描述信息
   */
  getPermissionDescription(permission: AgentPermission): string {
    const descriptions: Record<AgentPermission, string> = {
      [AgentPermission.AGENT_VIEW]: '查看智能体详情和列表',
      [AgentPermission.AGENT_CREATE]: '创建新的智能体',
      [AgentPermission.AGENT_UPDATE]: '更新智能体配置和信息',
      [AgentPermission.AGENT_DELETE]: '删除智能体',
      [AgentPermission.AGENT_APPROVE]: '审核智能体（通过）',
      [AgentPermission.AGENT_REJECT]: '审核智能体（拒绝）',
      [AgentPermission.AGENT_SUSPEND]: '暂停智能体',
      [AgentPermission.AGENT_SHELF]: '上下架智能体',
      [AgentPermission.AGENT_ADMIN]: '管理员权限（所有操作）',
      [AgentPermission.AGENT_EXECUTE]: '执行智能体',
    };
    return descriptions[permission] || '未知权限';
  }
}

/**
 * 快捷辅助函数：验证认证并获取用户信息
 */
export async function authenticateAndGetUser(
  sessionCookie: string | undefined,
  supabase: ReturnType<typeof createClient>
): Promise<
  { user: UserInfo; error?: never } | { user?: never; error: string }
> {
  if (!sessionCookie) {
    return { error: '用户未认证' };
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return { error: '用户认证失败' };
    }

    const validator = new PermissionValidator(supabase);
    const userInfo = await validator.getUserInfo(user.id);

    if (!userInfo) {
      return { error: '用户资料不存在' };
    }

    return { user: userInfo };
  } catch (error: any) {
    console.error('认证过程出错:', error);
    return { error: error.message || '认证失败' };
  }
}

/**
 * 快捷辅助函数：检查管理员角色
 */
export function isAdmin(role: AgentRole): boolean {
  return role === 'admin' || role === 'marketplace_admin';
}

/**
 * 快捷辅助函数：检查是否有审核权限
 */
export function hasReviewPermission(role: AgentRole): boolean {
  return ['admin', 'marketplace_admin', 'content_reviewer'].includes(role);
}
