/**
 * 权限配置管理 API 端点
 * 提供权限配置的查询、更新和验证功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { PermissionConfigManager } from '@/modules/common/permissions/config/permission-config';
import { PermissionLoader } from '@/modules/common/permissions/core/permission-loader';
import { requireAuth } from '@/lib/auth';

// GET /api/permissions/config - 获取权限配置
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('includeStats') === 'true';

    const configManager = PermissionConfigManager.getInstance();
    const permissionLoader = PermissionLoader.getInstance();

    const config = configManager.getConfig();

    // 包含统计信息（可选）
    if (includeStats) {
      const loaderStatus = permissionLoader.getStatus();
      const stats = {
        totalRoles: Object.keys(config.roles).length,
        totalPermissions: Object.keys(config.permissions).length,
        loaderStatus: {
          isLoaded: loaderStatus.isLoaded,
          isLoading: loaderStatus.isLoading,
          cacheSize: loaderStatus.cacheSize,
          lastUpdate: loaderStatus.lastUpdate,
          autoUpdateEnabled: loaderStatus.autoUpdateEnabled,
        },
      };

      return NextResponse.json({
        success: true,
        data: {
          config,
          stats,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取权限配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取权限配置失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/permissions/config - 保存权限配置
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    try {
      const auth = await requireAuth();

      if (!auth.isAdmin) {
        return NextResponse.json(
          { success: false, error: '权限不足，需要管理员权限' },
          { status: 403 }
        );
      }
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config, action } = body;

    const configManager = PermissionConfigManager.getInstance();

    switch (action) {
      case 'update':
        if (!config) {
          return NextResponse.json(
            { success: false, error: '缺少配置内容' },
            { status: 400 }
          );
        }

        // 验证配置
        const validationResult = configManager.validateConfig(config);
        if (!validationResult.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: '配置验证失败',
              details: validationResult.errors,
            },
            { status: 400 }
          );
        }

        configManager.updateConfig(config);
        break;

      case 'reset':
        configManager.resetToDefault();
        break;

      case 'refresh':
        const permissionLoader = PermissionLoader.getInstance();
        await permissionLoader.refreshConfig();
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: '权限配置保存成功',
      data: configManager.getConfig(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('保存权限配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存权限配置失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/roles - 获取所有角色
export async function GET_ROLES(_request: NextRequest) {
  try {
    const configManager = PermissionConfigManager.getInstance();
    const config = configManager.getConfig();

    const roles = Object.entries(config.roles).map(([id, role]) => ({
      id,
      ...role,
    }));

    return NextResponse.json({
      success: true,
      data: roles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取角色列表失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/permissions - 获取所有权限
export async function GET_PERMISSIONS(_request: NextRequest) {
  try {
    const searchParams = _request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const configManager = PermissionConfigManager.getInstance();
    const config = configManager.getConfig();

    let permissions = Object.entries(config.permissions).map(
      ([id, permission]) => ({
        id,
        ...permission,
      })
    );

    // 按类别筛选
    if (category) {
      permissions = permissions.filter(perm => perm.category === category);
    }

    return NextResponse.json({
      success: true,
      data: permissions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取权限列表失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/validate - 验证配置
export async function VALIDATE_CONFIG(_request: NextRequest) {
  try {
    const configManager = PermissionConfigManager.getInstance();
    const config = configManager.getConfig();

    const validationResult = configManager.validateConfig(config);

    return NextResponse.json({
      success: true,
      data: validationResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('配置验证失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '配置验证失败',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 健康检查
export async function HEALTH_CHECK(_request: NextRequest) {
  try {
    const configManager = PermissionConfigManager.getInstance();
    const permissionLoader = PermissionLoader.getInstance();

    const config = configManager.getConfig();
    const loaderStatus = permissionLoader.getStatus();

    const healthData = {
      status: 'healthy',
      configLoaded: !!config,
      loaderStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return NextResponse.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    console.error('权限服务健康检查失败', error);
    return NextResponse.json(
      {
        success: false,
        error: '权限服务不可用',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
