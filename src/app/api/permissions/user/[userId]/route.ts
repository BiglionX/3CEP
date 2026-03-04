/**
 * 用户权限API端点
 * 提供用户权限查询和验证功能，支持前后端权限同步
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  PermissionManager,
  UserInfo,
} from '@/permissions/core/permission-manager';
import { PermissionConfigManager } from '@/permissions/config/permission-config';

// GET /api/permissions/user/[userId]/permissions - 获取用户权限
export async function GET_USER_PERMISSIONS(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const category = searchParams.get('category') || undefined;

    // 这里应该从认证系统获取当前用户信息
    // const currentUser = await getCurrentUser(request);
    // if (!currentUser) {
    //   return NextResponse.json(
    //     { success: false, error: '未授权访问' },
    //     { status: 401 }
    //   );
    // }

    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    // 模拟用户信息（实际应用中应该从数据库获取）
    const mockUser: UserInfo = {
      id: userId,
      email: `${userId}@example.com`,
      roles: userId === 'admin' ? ['admin'] : ['manager'],
      isActive: true,
      tenantId: 'default-tenant',
    };

    const config = configManager.getConfig();
    const userPermissions = permissionManager.getUserPermissions(
      mockUser,
      config
    );
    const accessibleResources = permissionManager.getUserAccessibleResources(
      mockUser,
      category
    );

    const responseData: any = {
      userId,
      permissions: Array.from(userPermissions),
      accessibleResources,
      userRoles: mockUser.roles,
      tenantId: mockUser.tenantId,
    };

    // 添加详细信息（如果需要）
    if (includeDetails) {
      responseData.permissionDetails = Array.from(userPermissions).map(
        permId => {
          const permDef = config.permissions[permId];
          return permDef
            ? { id: permId, ...permDef }
            : { id: permId, name: permId };
        }
      );

      responseData.roleDetails = mockUser.roles.map(roleId => {
        const roleDef = config.roles[roleId];
        return roleDef
          ? { id: roleId, ...roleDef }
          : { id: roleId, name: roleId };
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取用户权限失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/permissions/user/[userId]/check - 检查用户权限
export async function CHECK_USER_PERMISSIONS(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { permissions, resource, action } = body;

    if (!permissions && (!resource || !action)) {
      return NextResponse.json(
        { success: false, error: '缺少权限检查参数' },
        { status: 400 }
      );
    }

    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    // 模拟用户信息
    const mockUser: UserInfo = {
      id: userId,
      email: `${userId}@example.com`,
      roles: userId === 'admin' ? ['admin'] : ['manager'],
      isActive: true,
      tenantId: 'default-tenant',
    };

    let checkResult;

    if (permissions) {
      // 检查具体权限
      const permsArray = Array.isArray(permissions)
        ? permissions
        : [permissions];
      checkResult = permissionManager.hasPermission(mockUser, permsArray);
    } else {
      // 检查资源访问权限
      checkResult = permissionManager.canAccessResource(
        mockUser,
        resource,
        action
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        hasPermission: checkResult.hasPermission,
        missingPermissions: checkResult.missingPermissions,
        reason: checkResult.reason,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('权限检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '权限检查失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/user/[userId]/accessible-resources - 获取用户可访问资源
export async function GET_ACCESSIBLE_RESOURCES(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    // 模拟用户信息
    const mockUser: UserInfo = {
      id: userId,
      email: `${userId}@example.com`,
      roles: userId === 'admin' ? ['admin'] : ['manager'],
      isActive: true,
      tenantId: 'default-tenant',
    };

    const config = configManager.getConfig();
    const accessibleResources = permissionManager.getUserAccessibleResources(
      mockUser,
      category
    );

    // 获取资源详细信息
    const resourceDetails = accessibleResources.map(resourceName => {
      const resourcePerms = Object.values(config.permissions).filter(
        perm => perm.resource === resourceName
      );

      return {
        name: resourceName,
        permissions: resourcePerms.map(perm => ({
          id: `${perm.resource}_${perm.action}`,
          name: perm.name,
          action: perm.action,
          description: perm.description,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        resources: accessibleResources,
        resourceDetails,
        category: category || 'all',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取可访问资源失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取可访问资源失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/permissions/user/[userId]/bulk-check - 批量权限检查
export async function BULK_PERMISSION_CHECK(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { permissionChecks } = body;

    if (!Array.isArray(permissionChecks) || permissionChecks.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少权限检查列表' },
        { status: 400 }
      );
    }

    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    // 模拟用户信息
    const mockUser: UserInfo = {
      id: userId,
      email: `${userId}@example.com`,
      roles: userId === 'admin' ? ['admin'] : ['manager'],
      isActive: true,
      tenantId: 'default-tenant',
    };

    // 批量执行权限检查
    const results = permissionChecks.map((check, index) => {
      try {
        let result;

        if (check.permission) {
          result = permissionManager.hasPermission(mockUser, check.permission);
        } else if (check.resource && check.action) {
          result = permissionManager.canAccessResource(
            mockUser,
            check.resource,
            check.action
          );
        } else {
          return {
            index,
            error: '无效的检查参数',
          };
        }

        return {
          index,
          permission: check.permission,
          resource: check.resource,
          action: check.action,
          hasPermission: result.hasPermission,
          missingPermissions: result.missingPermissions,
          reason: result.reason,
        };
      } catch (error) {
        return {
          index,
          error: error instanceof Error ? error.message : '检查执行失败',
        };
      }
    });

    const passedChecks = results.filter(r => r.hasPermission === true).length;
    const failedChecks = results.filter(r => r.hasPermission === false).length;
    const errorChecks = results.filter(r => r.error).length;

    return NextResponse.json({
      success: true,
      data: {
        userId,
        totalChecks: results.length,
        passedChecks,
        failedChecks,
        errorChecks,
        results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('批量权限检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '批量权限检查失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 健康检查端点
export async function HEALTH_CHECK(request: NextRequest) {
  try {
    const permissionManager = PermissionManager.getInstance();
    const configManager = PermissionConfigManager.getInstance();

    const config = configManager.getConfig();
    const stats = permissionManager.getPermissionStats();

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        configLoaded: !!config,
        totalPermissions: stats.totalPermissions,
        totalRoles: stats.totalRoles,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('权限系统健康检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '权限系统不健康',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
