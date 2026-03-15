import { NextRequest, NextResponse } from 'next/server';
import { securityService } from '@/modules/data-center/security/security-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const token = request.headers.get('authorization').replace('Bearer ', '');

    // 楠岃瘉ょ墝锛堥櫎浜嗚璇佺浉鍏虫搷浣滐級
    if (action !== 'authenticate' && action !== 'status') {
      if (!token) {
        return NextResponse.json({ error: '缂哄皯璁块棶ょ墝' }, { status: 401 });
      }

      const tokenVerification = securityService.verifyToken(token);
      if (!tokenVerification.valid) {
        return NextResponse.json({ error: '犳晥鐨勮闂护 }, { status: 401 });
      }
    }

    switch (action) {
      case 'status':
        // 鑾峰彇瀹夊叏绯荤粺鐘        const securityStats = securityService.getSecurityStats();
        return NextResponse.json({
          status: 'active',
          stats: securityStats,
          timestamp: new Date().toISOString(),
        });

      case 'permissions':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: '缂哄皯userId鍙傛暟' },
            { status: 400 }
          );
        }

        const permissions = securityService.getUserPermissions(userId);
        if (!permissions) {
          return NextResponse.json({ error: '鐢ㄦ埛涓嶅 }, { status: 404 });
        }

        return NextResponse.json({
          userId,
          permissions,
          timestamp: new Date().toISOString(),
        });

      case 'audit-logs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const userIdFilter = searchParams.get('userId') || undefined;
        const actionFilter = searchParams.get('actionFilter') || undefined;
        const statusFilter = searchParams.get('status') || undefined;

        const auditLogs = securityService.getAuditLogs(limit, {
          userId: userIdFilter,
          action: actionFilter,
          status: statusFilter,
        });

        return NextResponse.json({
          logs: auditLogs,
          count: auditLogs.length,
          timestamp: new Date().toISOString(),
        });

      case 'access-check':
        const resource = searchParams.get('resource');
        const accessAction = searchParams.get('accessAction') || 'read';
        const userRole = searchParams.get('role') || 'guest';

        if (!resource) {
          return NextResponse.json(
            { error: '缂哄皯resource鍙傛暟' },
            { status: 400 }
          );
        }

        const accessCheck = securityService.checkAccess(
          'anonymous',
          resource,
          accessAction as any,
          userRole
        );

        return NextResponse.json({
          resource,
          action: accessAction,
          role: userRole,
          allowed: accessCheck.allowed,
          reason: accessCheck.reason,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // 杩斿洖璁块棶鎺у埗瑙勫垯锛堜粎绠＄悊鍛樺彲瑙侊級
        const tokenInfo = securityService.verifyToken(token!);
        if (tokenInfo.role !== 'admin') {
          return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
        }

        return NextResponse.json({
          rules: Array.from(securityService.accessRules.values()),
          count: securityService.accessRules.size,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瀹夊叏API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, userId, data, resource, accessAction } =
      body;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    switch (action) {
      case 'authenticate':
        if (!username || !password) {
          return NextResponse.json(
            { error: '缂哄皯鐢ㄦ埛鍚嶆垨瀵嗙爜' },
            { status: 400 }
          );
        }

        const authResult = securityService.authenticateUser(
          username,
          password,
          ipAddress
        );

        securityService.logAudit({
          userId: username,
          action: 'authentication',
          resource: 'login',
          ipAddress,
          userAgent: request.headers.get('user-agent') || 'unknown',
          status: authResult.success  'success' : 'failed',
          details: authResult.error  { error: authResult.error } : undefined,
        });

        if (authResult.success) {
          return NextResponse.json({
            message: '璁よ瘉鎴愬姛',
            userId: authResult.userId,
            token: authResult.token,
            expiresIn: 3600,
            timestamp: new Date().toISOString(),
          });
        } else {
          return NextResponse.json(
            { error: authResult.error || '璁よ瘉澶辫触' },
            { status: 401 }
          );
        }

      case 'mask-data':
        const token = request.headers
          .get('authorization')
          .replace('Bearer ', '');
        if (!token) {
          return NextResponse.json({ error: '缂哄皯璁块棶ょ墝' }, { status: 401 });
        }

        const tokenVerification = securityService.verifyToken(token);
        if (!tokenVerification.valid) {
          return NextResponse.json(
            { error: '犳晥鐨勮闂护 },
            { status: 401 }
          );
        }

        if (!data) {
          return NextResponse.json({ error: '缂哄皯鏁版嵁鍙傛暟' }, { status: 400 });
        }

        const maskedData = securityService.maskData(
          data,
          tokenVerification.role || 'guest'
        );

        return NextResponse.json({
          originalData: data,
          maskedData,
          role: tokenVerification.role,
          timestamp: new Date().toISOString(),
        });

      case 'batch-mask':
        const batchToken = request.headers
          .get('authorization')
          .replace('Bearer ', '');
        if (!batchToken) {
          return NextResponse.json({ error: '缂哄皯璁块棶ょ墝' }, { status: 401 });
        }

        const batchTokenVerification = securityService.verifyToken(batchToken);
        if (!batchTokenVerification.valid) {
          return NextResponse.json(
            { error: '犳晥鐨勮闂护 },
            { status: 401 }
          );
        }

        const dataArray = body.dataArray;
        if (!dataArray || !Array.isArray(dataArray)) {
          return NextResponse.json(
            { error: '缂哄皯dataArray鍙傛暟鎴栧弬鏁颁笉鏄暟 },
            { status: 400 }
          );
        }

        const maskedArray = securityService.maskDataArray(
          dataArray,
          batchTokenVerification.role || 'guest'
        );

        return NextResponse.json({
          originalCount: dataArray.length,
          maskedCount: maskedArray.length,
          maskedData: maskedArray,
          role: batchTokenVerification.role,
          timestamp: new Date().toISOString(),
        });

      case 'access-request':
        const accessToken = request.headers
          .get('authorization')
          .replace('Bearer ', '');
        if (!accessToken) {
          return NextResponse.json({ error: '缂哄皯璁块棶ょ墝' }, { status: 401 });
        }

        const accessVerification = securityService.verifyToken(accessToken);
        if (!accessVerification.valid) {
          return NextResponse.json(
            { error: '犳晥鐨勮闂护 },
            { status: 401 }
          );
        }

        if (!resource || !accessAction) {
          return NextResponse.json(
            { error: '缂哄皯resource鎴朼ction鍙傛暟' },
            { status: 400 }
          );
        }

        const accessResult = securityService.checkAccess(
          accessVerification.userId || 'anonymous',
          resource,
          accessAction,
          accessVerification.role
        );

        securityService.logAudit({
          userId: accessVerification.userId || 'anonymous',
          action: `access_${accessAction}`,
          resource,
          ipAddress,
          userAgent: request.headers.get('user-agent') || 'unknown',
          status: accessResult.allowed  'success' : 'failed',
          details: accessResult.reason
             { reason: accessResult.reason }
            : undefined,
        });

        return NextResponse.json({
          resource,
          action: accessAction,
          userId: accessVerification.userId,
          role: accessVerification.role,
          allowed: accessResult.allowed,
          reason: accessResult.reason,
          timestamp: new Date().toISOString(),
        });

      case 'log-audit':
        // 鎵嬪姩璁板綍瀹¤ュ織锛堥€氬父鐢辩郴缁熻嚜鍔ㄨ褰曪級
        const auditToken = request.headers
          .get('authorization')
          .replace('Bearer ', '');
        if (!auditToken) {
          return NextResponse.json({ error: '缂哄皯璁块棶ょ墝' }, { status: 401 });
        }

        const auditVerification = securityService.verifyToken(auditToken);
        if (!auditVerification.valid || auditVerification.role !== 'admin') {
          return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
        }

        const { auditEntry } = body;
        if (!auditEntry) {
          return NextResponse.json(
            { error: '缂哄皯瀹¤鏉＄洰鍙傛暟' },
            { status: 400 }
          );
        }

        securityService.logAudit({
          userId: auditEntry.userId || auditVerification.userId,
          action: auditEntry.action,
          resource: auditEntry.resource,
          ipAddress: auditEntry.ipAddress || ipAddress,
          userAgent:
            auditEntry.userAgent ||
            request.headers.get('user-agent') ||
            'unknown',
          status: auditEntry.status || 'success',
          details: auditEntry.details,
        });

        return NextResponse.json({
          message: '瀹¤ュ織璁板綍鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瀹夊叏API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

