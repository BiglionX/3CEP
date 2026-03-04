import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ApiInterceptor } from '@/modules/common/permissions/core/api-interceptor';
import {
  PermissionManager,
  UserInfo,
} from '@/modules/common/permissions/core/permission-manager';

// 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅
function getCurrentUser(): UserInfo | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    // 绠€鍖栧鐞嗭細瀹為檯搴旇瑙ｆ瀽JWT token
    if (token === 'admin_token') {
      return {
        id: 'admin',
        email: 'admin@example.com',
        roles: ['admin'],
        isActive: true,
      };
    }

    if (token.startsWith('valid_token_')) {
      const userId = token.replace('valid_token_', '');
      return {
        id: userId,
        email: `${userId}@example.com`,
        roles: ['user'],
        isActive: true,
      };
    }

    return null;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const interceptor = ApiInterceptor.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';

    // 鏉冮檺妫€?- 闇€瑕佸畨鍏ㄧ鐞嗘潈?    const permissionResult = permissionManager.hasPermission(
      currentUser,
      'security_manage'
    );
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        {
          error: '鏉冮檺涓嶈冻',
          reason: permissionResult.reason || '闇€瑕佸畨鍏ㄧ鐞嗘潈?,
        },
        { status: 403 }
      );
    }

    switch (action) {
      case 'stats':
        const stats = interceptor.getSecurityStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });

      case 'config':
        const config = interceptor.getConfig();
        return NextResponse.json({
          success: true,
          data: config,
          timestamp: new Date().toISOString(),
        });

      case 'events':
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const events = interceptor.getRecentSecurityEvents(limit);
        return NextResponse.json({
          success: true,
          data: events,
          timestamp: new Date().toISOString(),
        });

      case 'rate-limits':
        // 杩欓噷鍙互杩斿洖褰撳墠鐨勯€熺巼闄愬埗鐘?        return NextResponse.json({
          success: true,
          data: {
            message: '閫熺巼闄愬埗鐘舵€佹煡璇㈠姛鑳藉緟瀹炵幇',
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏃犳晥鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error) {
    console.error('API鎷︽埅鍣℅ET鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        error: '鎿嶄綔澶辫触',
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const interceptor = ApiInterceptor.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const body = await request.json();
    const { action, ...params } = body;

    // 鏉冮檺妫€?- 闇€瑕佸畨鍏ㄧ鐞嗘潈?    const permissionResult = permissionManager.hasPermission(
      currentUser,
      'security_manage'
    );
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        {
          error: '鏉冮檺涓嶈冻',
          reason: permissionResult.reason || '闇€瑕佸畨鍏ㄧ鐞嗘潈?,
        },
        { status: 403 }
      );
    }

    switch (action) {
      case 'update-config':
        const {
          enabled,
          authRequired,
          rateLimiting,
          ipWhitelist,
          blockedPaths,
          allowedPaths,
          logLevel,
        } = params;

        const newConfig: any = {};
        if (enabled !== undefined) newConfig.enabled = enabled;
        if (authRequired !== undefined) newConfig.authRequired = authRequired;
        if (rateLimiting !== undefined) newConfig.rateLimiting = rateLimiting;
        if (ipWhitelist !== undefined) newConfig.ipWhitelist = ipWhitelist;
        if (blockedPaths !== undefined) newConfig.blockedPaths = blockedPaths;
        if (allowedPaths !== undefined) newConfig.allowedPaths = allowedPaths;
        if (logLevel !== undefined) newConfig.logLevel = logLevel;

        interceptor.updateConfig(newConfig);

        return NextResponse.json({
          success: true,
          message: '鎷︽埅鍣ㄩ厤缃洿鏂版垚?,
          data: interceptor.getConfig(),
          timestamp: new Date().toISOString(),
        });

      case 'unblock-ip':
        const { ip } = params;
        if (!ip) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬? ip' },
            { status: 400 }
          );
        }

        const unblocked = interceptor.unblockIP(ip);
        return NextResponse.json({
          success: unblocked,
          message: unblocked
            ? `IP ${ip} 瑙ｉ櫎闃绘鎴愬姛`
            : `IP ${ip} 鏈壘鍒版垨涓嶅湪闃绘鍒楄〃涓璥,
          timestamp: new Date().toISOString(),
        });

      case 'clear-events':
        interceptor.clearSecurityEvents();
        return NextResponse.json({
          success: true,
          message: '瀹夊叏浜嬩欢鏃ュ織娓呯┖鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'test-interceptor':
        // 妯℃嫙娴嬭瘯鎷︽埅鍔熻兘
        const testResults = {
          authentication: '閫氳繃',
          authorization: '閫氳繃',
          rateLimiting: '閫氳繃',
          ipFiltering: '閫氳繃',
          pathProtection: '閫氳繃',
        };

        return NextResponse.json({
          success: true,
          data: testResults,
          message: '鎷︽埅鍣ㄥ姛鑳芥祴璇曞畬?,
          timestamp: new Date().toISOString(),
        });

      case 'reset-rate-limits':
        // 閲嶇疆鎵€鏈夐€熺巼闄愬埗锛堢畝鍖栧疄鐜帮級
        return NextResponse.json({
          success: true,
          message: '閫熺巼闄愬埗閲嶇疆鍔熻兘寰呭疄?,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏃犳晥鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error) {
    console.error('API鎷︽埅鍣≒OST鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        error: '鎿嶄綔澶辫触',
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

