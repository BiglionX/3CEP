/**
 * 缁熶竴鏉冮檺绠＄悊API
 * 鎻愪緵鏉冮檺妫€鏌ャ€佽鑹茬鐞嗗拰鏁版嵁璁块棶鎺у埗鐨凴ESTful鎺ュ彛
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPermissionService } from '@/modules/data-center/core/permission-service';
import { getSession } from '@/lib/auth/session';
import { rateLimit } from '@/lib/rate-limit';

// 鏉冮檺鏈嶅姟瀹炰緥
let permissionService: UnifiedPermissionService | null = null;

// 鍒濆鍖栨潈闄愭湇
function initializePermissionService() {
  if (!permissionService) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    if (supabaseUrl && supabaseKey) {
      permissionService = new UnifiedPermissionService(supabaseUrl, supabaseKey, redisUrl);
    }
  }
  return permissionService;
}

// 鑾峰彇瀹㈡埛绔疘P鍦板潃
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

// 鏉冮檺妫€鏌PI
export async function GET(request: NextRequest) {
  try {
    // 熺巼闄愬埗
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit.checkRateLimit(ip, 'permission_check', 100, 60);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: '璇眰杩囦簬棰戠箒',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    // 鑾峰彇鐢ㄦ埛氳瘽
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json(
        { error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const dataSource = searchParams.get('dataSource');
    const tableName = searchParams.get('tableName');
    const accessType = searchParams.get('accessType') as 'READ' | 'WRITE' | 'EXECUTE' || 'READ';

    // 鍒濆鍖栨潈闄愭湇
    const service = initializePermissionService();
    if (!service) {
      return NextResponse.json(
        { error: '鏉冮檺鏈嶅姟鍒濆鍖栧け },
        { status: 500 }
      );
    }

    // 鏁版嵁璁块棶鎺у埗妫€
    if (dataSource && tableName) {
      const dataAccessResult = await service.checkDataAccess(
        session.user.id,
        dataSource,
        tableName,
        accessType
      );

      return NextResponse.json({
        allowed: dataAccessResult.allowed,
        filters: dataAccessResult.filters,
        masking: dataAccessResult.masking,
        checkedAt: new Date().toISOString()
      });
    }

    // 鏅€氭潈闄愭
    if (!permission) {
      return NextResponse.json(
        { error: '缂哄皯鏉冮檺鍙傛暟' },
        { status: 400 }
      );
    }

    const result = await service.checkPermission(session.user.id, permission, {
      context: {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent'),
        resource: searchParams.get('resource') || undefined
      }
    });

    return NextResponse.json({
      permission,
      allowed: result.allowed,
      reason: result.reason,
      checkedAt: result.checkedAt.toISOString()
    });

  } catch (error) {
    console.error('鏉冮檺妫€鏌PI閿欒:', error);
    return NextResponse.json(
      { error: '鍐呴儴鏈嶅姟鍣ㄩ敊 },
      { status: 500 }
    );
  }
}

// 鎵归噺鏉冮檺妫€
export async function POST(request: NextRequest) {
  try {
    // 熺巼闄愬埗
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit.checkRateLimit(ip, 'permission_batch_check', 50, 60);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: '璇眰杩囦簬棰戠箒',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    // 鑾峰彇鐢ㄦ埛氳瘽
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json(
        { error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽璇眰
    const body = await request.json();
    const { permissions, action } = body;

    // 鍒濆鍖栨潈闄愭湇
    const service = initializePermissionService();
    if (!service) {
      return NextResponse.json(
        { error: '鏉冮檺鏈嶅姟鍒濆鍖栧け },
        { status: 500 }
      );
    }

    switch (action) {
      case 'batch_check':
        if (!Array.isArray(permissions) || permissions.length === 0) {
          return NextResponse.json(
            { error: '鏉冮檺鍒楄〃涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const batchResults = await service.batchCheckPermissions(session.user.id, permissions);
        
        return NextResponse.json({
          permissions: batchResults,
          checkedAt: new Date().toISOString()
        });

      case 'get_resources':
        const category = body.category;
        const resources = await service.getAccessibleResources(session.user.id, category);
        
        return NextResponse.json({
          resources: resources.resources,
          permissions: resources.permissions,
          checkedAt: new Date().toISOString()
        });

      case 'clear_cache':
        await service.clearUserPermissionCache(session.user.id);
        
        return NextResponse.json({
          message: '鏉冮檺缂撳宸叉竻,
          clearedAt: new Date().toISOString()
        });

      case 'get_stats':
        // 闇€瑕佺鐞嗗憳鏉冮檺
        const statsPermission = await service.checkPermission(session.user.id, 'permission_stats_read');
        if (!statsPermission.allowed) {
          return NextResponse.json(
            { error: '犳潈闄愯闂粺璁′俊 },
            { status: 403 }
          );
        }

        const stats = await service.getPermissionStats();
        
        return NextResponse.json({
          stats,
          retrievedAt: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '鏈煡鎿嶄綔绫诲瀷' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('鏉冮檺鎵归噺妫€鏌PI閿欒:', error);
    return NextResponse.json(
      { error: '鍐呴儴鏈嶅姟鍣ㄩ敊 },
      { status: 500 }
    );
  }
}

// PUT - 鏇存柊鏉冮檺閰嶇疆锛堥渶瑕佺鐞嗗憳鏉冮檺
export async function PUT(request: NextRequest) {
  try {
    // 鑾峰彇鐢ㄦ埛氳瘽
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json(
        { error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    // 鍒濆鍖栨潈闄愭湇
    const service = initializePermissionService();
    if (!service) {
      return NextResponse.json(
        { error: '鏉冮檺鏈嶅姟鍒濆鍖栧け },
        { status: 500 }
      );
    }

    // 妫€鏌ョ鐞嗗憳鏉冮檺
    const adminPermission = await service.checkPermission(session.user.id, 'permission_manage');
    if (!adminPermission.allowed) {
      return NextResponse.json(
        { error: '犳潈闄愮鐞嗘潈闄愰厤 },
        { status: 403 }
      );
    }

    // 瑙ｆ瀽璇眰
    const body = await request.json();
    const { action, data } = body;

    // 璁板綍鎿嶄綔ュ織
    console.log(`绠＄悊${session.user.id} 鎵ц鏉冮檺绠＄悊鎿嶄綔: ${action}`, data);

    // 杩欓噷搴旇瀹炵幇鍏蜂綋鐨勬潈闄愰厤缃洿鏂伴€昏緫
    // 鐢变簬娑夊強鏁版嵁搴撴搷浣滐紝鏆傛椂杩斿洖鎴愬姛鍝嶅簲
    
    return NextResponse.json({
      message: '鏉冮檺閰嶇疆鏇存柊鎴愬姛',
      action,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('鏉冮檺閰嶇疆鏇存柊API閿欒:', error);
    return NextResponse.json(
      { error: '鍐呴儴鏈嶅姟鍣ㄩ敊 },
      { status: 500 }
    );
  }
}

// DELETE - 鍒犻櫎鏉冮檺缂撳
export async function DELETE(request: NextRequest) {
  try {
    // 鑾峰彇鐢ㄦ埛氳瘽
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json(
        { error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    // 鍒濆鍖栨潈闄愭湇
    const service = initializePermissionService();
    if (!service) {
      return NextResponse.json(
        { error: '鏉冮檺鏈嶅姟鍒濆鍖栧け },
        { status: 500 }
      );
    }

    // 娓呴櫎鐢ㄦ埛鏉冮檺缂撳
    await service.clearUserPermissionCache(session.user.id);
    
    return NextResponse.json({
      message: '鏉冮檺缂撳宸叉竻,
      clearedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('娓呴櫎鏉冮檺缂撳API閿欒:', error);
    return NextResponse.json(
      { error: '鍐呴儴鏈嶅姟鍣ㄩ敊 },
      { status: 500 }
    );
  }
}
