/**
 * @file simple-permission-service.ts
 * @description 简化版权限服务
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

export class PermissionService {
  private userPermissions: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultPermissions();
  }

  /**
   * 初始化默认权?   */
  private initializeDefaultPermissions(): void {
    // 管理员权?    this.userPermissions.set('admin', [
      'data_center_read',
      'data_center_write',
      'data_center_execute',
      'data_center_manage',
      'data_center_export',
      'data_center_analyze',
    ]);

    // 数据分析师权?    this.userPermissions.set('analyst', [
      'data_center_read',
      'data_center_execute',
      'data_center_analyze',
      'data_center_export',
    ]);

    // 普通用户权?    this.userPermissions.set('user', ['data_center_read']);
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // 简化实现：根据用户ID返回对应权限?    if (userId === 'admin') {
      return this.userPermissions.get('admin') || [];
    } else if (userId.endsWith('_analyst')) {
      return this.userPermissions.get('analyst') || [];
    } else {
      return this.userPermissions.get('user') || [];
    }
  }

  /**
   * 检查用户是否具有指定权?   */
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permission);
  }

  /**
   * 批量权限检?   */
  async checkPermissions(
    userPermissions: string[],
    requiredPermissions: string[]
  ): Promise<boolean> {
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }

  /**
   * 添加用户权限
   */
  async addUserPermission(userId: string, permission: string): Promise<void> {
    const permissions = await this.getUserPermissions(userId);
    if (!permissions.includes(permission)) {
      permissions.push(permission);
      this.userPermissions.set(userId, permissions);
    }
  }

  /**
   * 移除用户权限
   */
  async removeUserPermission(
    userId: string,
    permission: string
  ): Promise<void> {
    const permissions = await this.getUserPermissions(userId);
    const index = permissions.indexOf(permission);
    if (index > -1) {
      permissions.splice(index, 1);
      this.userPermissions.set(userId, permissions);
    }
  }
}
