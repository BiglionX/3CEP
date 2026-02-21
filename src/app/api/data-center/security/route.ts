import { NextRequest, NextResponse } from 'next/server';
import { securityService } from '@/data-center/security/security-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // 验证令牌（除了认证相关操作）
    if (action !== 'authenticate' && action !== 'status') {
      if (!token) {
        return NextResponse.json(
          { error: '缺少访问令牌' },
          { status: 401 }
        );
      }

      const tokenVerification = securityService.verifyToken(token);
      if (!tokenVerification.valid) {
        return NextResponse.json(
          { error: '无效的访问令牌' },
          { status: 401 }
        );
      }
    }

    switch (action) {
      case 'status':
        // 获取安全系统状态
        const securityStats = securityService.getSecurityStats();
        return NextResponse.json({
          status: 'active',
          stats: securityStats,
          timestamp: new Date().toISOString()
        });

      case 'permissions':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: '缺少userId参数' },
            { status: 400 }
          );
        }

        const permissions = securityService.getUserPermissions(userId);
        if (!permissions) {
          return NextResponse.json(
            { error: '用户不存在' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          userId,
          permissions,
          timestamp: new Date().toISOString()
        });

      case 'audit-logs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const userIdFilter = searchParams.get('userId') || undefined;
        const actionFilter = searchParams.get('actionFilter') || undefined;
        const statusFilter = searchParams.get('status') || undefined;

        const auditLogs = securityService.getAuditLogs(limit, {
          userId: userIdFilter,
          action: actionFilter,
          status: statusFilter
        });

        return NextResponse.json({
          logs: auditLogs,
          count: auditLogs.length,
          timestamp: new Date().toISOString()
        });

      case 'access-check':
        const resource = searchParams.get('resource');
        const accessAction = searchParams.get('accessAction') || 'read';
        const userRole = searchParams.get('role') || 'guest';

        if (!resource) {
          return NextResponse.json(
            { error: '缺少resource参数' },
            { status: 400 }
          );
        }

        const accessCheck = securityService.checkAccess('anonymous', resource, accessAction as any, userRole);
        
        return NextResponse.json({
          resource,
          action: accessAction,
          role: userRole,
          allowed: accessCheck.allowed,
          reason: accessCheck.reason,
          timestamp: new Date().toISOString()
        });

      case 'rules':
        // 返回访问控制规则（仅管理员可见）
        const tokenInfo = securityService.verifyToken(token!);
        if (tokenInfo.role !== 'admin') {
          return NextResponse.json(
            { error: '权限不足' },
            { status: 403 }
          );
        }

        return NextResponse.json({
          rules: Array.from(securityService.accessRules.values()),
          count: securityService.accessRules.size,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('安全API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, userId, data, resource, accessAction } = body;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    switch (action) {
      case 'authenticate':
        if (!username || !password) {
          return NextResponse.json(
            { error: '缺少用户名或密码' },
            { status: 400 }
          );
        }

        const authResult = securityService.authenticateUser(username, password, ipAddress);
        
        securityService.logAudit({
          userId: username,
          action: 'authentication',
          resource: 'login',
          ipAddress,
          userAgent: request.headers.get('user-agent') || 'unknown',
          status: authResult.success ? 'success' : 'failed',
          details: authResult.error ? { error: authResult.error } : undefined
        });

        if (authResult.success) {
          return NextResponse.json({
            message: '认证成功',
            userId: authResult.userId,
            token: authResult.token,
            expiresIn: 3600,
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json(
            { error: authResult.error || '认证失败' },
            { status: 401 }
          );
        }

      case 'mask-data':
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
          return NextResponse.json(
            { error: '缺少访问令牌' },
            { status: 401 }
          );
        }

        const tokenVerification = securityService.verifyToken(token);
        if (!tokenVerification.valid) {
          return NextResponse.json(
            { error: '无效的访问令牌' },
            { status: 401 }
          );
        }

        if (!data) {
          return NextResponse.json(
            { error: '缺少数据参数' },
            { status: 400 }
          );
        }

        const maskedData = securityService.maskData(data, tokenVerification.role || 'guest');
        
        return NextResponse.json({
          originalData: data,
          maskedData,
          role: tokenVerification.role,
          timestamp: new Date().toISOString()
        });

      case 'batch-mask':
        const batchToken = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!batchToken) {
          return NextResponse.json(
            { error: '缺少访问令牌' },
            { status: 401 }
          );
        }

        const batchTokenVerification = securityService.verifyToken(batchToken);
        if (!batchTokenVerification.valid) {
          return NextResponse.json(
            { error: '无效的访问令牌' },
            { status: 401 }
          );
        }

        const dataArray = body.dataArray;
        if (!dataArray || !Array.isArray(dataArray)) {
          return NextResponse.json(
            { error: '缺少dataArray参数或参数不是数组' },
            { status: 400 }
          );
        }

        const maskedArray = securityService.maskDataArray(dataArray, batchTokenVerification.role || 'guest');
        
        return NextResponse.json({
          originalCount: dataArray.length,
          maskedCount: maskedArray.length,
          maskedData: maskedArray,
          role: batchTokenVerification.role,
          timestamp: new Date().toISOString()
        });

      case 'access-request':
        const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!accessToken) {
          return NextResponse.json(
            { error: '缺少访问令牌' },
            { status: 401 }
          );
        }

        const accessVerification = securityService.verifyToken(accessToken);
        if (!accessVerification.valid) {
          return NextResponse.json(
            { error: '无效的访问令牌' },
            { status: 401 }
          );
        }

        if (!resource || !accessAction) {
          return NextResponse.json(
            { error: '缺少resource或action参数' },
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
          status: accessResult.allowed ? 'success' : 'failed',
          details: accessResult.reason ? { reason: accessResult.reason } : undefined
        });

        return NextResponse.json({
          resource,
          action: accessAction,
          userId: accessVerification.userId,
          role: accessVerification.role,
          allowed: accessResult.allowed,
          reason: accessResult.reason,
          timestamp: new Date().toISOString()
        });

      case 'log-audit':
        // 手动记录审计日志（通常由系统自动记录）
        const auditToken = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!auditToken) {
          return NextResponse.json(
            { error: '缺少访问令牌' },
            { status: 401 }
          );
        }

        const auditVerification = securityService.verifyToken(auditToken);
        if (!auditVerification.valid || auditVerification.role !== 'admin') {
          return NextResponse.json(
            { error: '权限不足' },
            { status: 403 }
          );
        }

        const { auditEntry } = body;
        if (!auditEntry) {
          return NextResponse.json(
            { error: '缺少审计条目参数' },
            { status: 400 }
          );
        }

        securityService.logAudit({
          userId: auditEntry.userId || auditVerification.userId,
          action: auditEntry.action,
          resource: auditEntry.resource,
          ipAddress: auditEntry.ipAddress || ipAddress,
          userAgent: auditEntry.userAgent || request.headers.get('user-agent') || 'unknown',
          status: auditEntry.status || 'success',
          details: auditEntry.details
        });

        return NextResponse.json({
          message: '审计日志记录成功',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('安全API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}