/**
 * 鏉冮檺閰嶇疆API绔偣
 * 鎻愪緵鏉冮檺閰嶇疆鐨勮幏鍙栥€佹洿鏂板拰绠＄悊鍔熻兘
 */

import { NextRequest, NextResponse } from 'next/server';
import { PermissionConfigManager } from '@/modules/common/permissions/config/permission-config';
import { PermissionLoader } from '@/modules/common/permissions/core/permission-loader';

// GET /api/permissions/config - 鑾峰彇鏉冮檺閰嶇疆
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('includeStats') === 'true';

    const configManager = PermissionConfigManager.getInstance();
    const permissionLoader = PermissionLoader.getInstance();

    const config = configManager.getConfig();

    // 娣诲姞缁熻淇℃伅锛堝鏋滈渶瑕侊級
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
    console.error('鑾峰彇鏉冮檺閰嶇疆澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鑾峰彇鏉冮檺閰嶇疆澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/permissions/config - 鏇存柊鏉冮檺閰嶇疆
export async function POST(request: NextRequest) {
  try {
    // 楠岃瘉璇眰鏉冮檺锛堣繖閲屽簲璇ユ坊鍔犵鐞嗗憳鏉冮檺妫€鏌ワ級
    // const user = await getCurrentUser(request);
    // if (!user || !user.roles.includes('admin')) {
    //   return NextResponse.json(
    //     { success: false, error: '犳潈闄愭墽琛屾鎿嶄綔' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { config, action } = body;

    const configManager = PermissionConfigManager.getInstance();

    switch (action) {
      case 'update':
        if (!config) {
          return NextResponse.json(
            { success: false, error: '缂哄皯閰嶇疆鏁版嵁' },
            { status: 400 }
          );
        }

        // 楠岃瘉閰嶇疆
        const validationResult = configManager.validateConfig(config);
        if (!validationResult.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: '閰嶇疆楠岃瘉澶辫触',
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
          { success: false, error: '犳晥鐨勬搷浣滅被 },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: '鏉冮檺閰嶇疆鏇存柊鎴愬姛',
      data: configManager.getConfig(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鏇存柊鏉冮檺閰嶇疆澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鏇存柊鏉冮檺閰嶇疆澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/roles - 鑾峰彇瑙掕壊鍒楄〃
export async function GET_ROLES(request: NextRequest) {
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
    console.error('鑾峰彇瑙掕壊鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鑾峰彇瑙掕壊鍒楄〃澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/permissions - 鑾峰彇鏉冮檺鍒楄〃
export async function GET_PERMISSIONS(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const configManager = PermissionConfigManager.getInstance();
    const config = configManager.getConfig();

    let permissions = Object.entries(config.permissions).map(
      ([id, permission]) => ({
        id,
        ...permission,
      })
    );

    // 鎸夊垎绫昏繃    if (category) {
      permissions = permissions.filter(perm => perm.category === category);
    }

    return NextResponse.json({
      success: true,
      data: permissions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇鏉冮檺鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鑾峰彇鏉冮檺鍒楄〃澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/permissions/config/validate - 楠岃瘉閰嶇疆
export async function VALIDATE_CONFIG(request: NextRequest) {
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
    console.error('閰嶇疆楠岃瘉澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '閰嶇疆楠岃瘉澶辫触',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 鍋ュ悍妫€鏌ョexport async function HEALTH_CHECK(request: NextRequest) {
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
    console.error('鏉冮檺绯荤粺鍋ュ悍妫€鏌ュけ', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏉冮檺绯荤粺涓嶅仴,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

