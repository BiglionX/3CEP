import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { RBACController } from '@/modules/common/permissions/core/rbac-controller';
import {
  PermissionManager,
  UserInfo,
} from '@/modules/common/permissions/core/permission-manager';

// 妯℃嫙鐢ㄦ埛鏁版嵁瀛樺偍
const mockUsers: Record<string, UserInfo> = {
  user_admin: {
    id: 'user_admin',
    email: 'admin@example.com',
    roles: ['admin'],
    isActive: true,
  },
  user_manager: {
    id: 'user_manager',
    email: 'manager@example.com',
    roles: ['manager'],
    isActive: true,
  },
  user_viewer: {
    id: 'user_viewer',
    email: 'viewer@example.com',
    roles: ['viewer'],
    isActive: true,
  },
};

// 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅锛堜粠token瑙ｆ瀽function getCurrentUser(): UserInfo | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token').value;

    if (!token) return null;

    // 绠€鍖栧鐞嗭細瀹為檯搴旇瑙ｆ瀽JWT token
    const userId = 'user_admin'; // 榛樿绠＄悊    return mockUsers[userId] || null;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const rbac = RBACController.getInstance();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        const stats = rbac.getRBACStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });

      case 'roles':
        const userRoles = rbac.getUserRoles(currentUser.id);
        return NextResponse.json({
          success: true,
          data: {
            userId: currentUser.id,
            roles: userRoles,
          },
          timestamp: new Date().toISOString(),
        });

      case 'assignments':
        const assignments = rbac.getRoleAssignmentHistory(currentUser.id);
        return NextResponse.json({
          success: true,
          data: assignments,
          timestamp: new Date().toISOString(),
        });

      case 'grants':
        const grants = rbac.getPermissionGrantHistory(currentUser.id);
        return NextResponse.json({
          success: true,
          data: grants,
          timestamp: new Date().toISOString(),
        });

      case 'hierarchies':
        const hierarchies = rbac.getRoleHierarchies();
        return NextResponse.json({
          success: true,
          data: hierarchies,
          timestamp: new Date().toISOString(),
        });

      case 'requests':
        const pendingRequests = rbac.getPendingAccessRequests();
        return NextResponse.json({
          success: true,
          data: pendingRequests,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '犳晥鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error) {
    console.error('RBAC GET鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        error: '鎿嶄綔澶辫触',
        message: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const rbac = RBACController.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const body = await request.json();
    const { action, ...params } = body;

    // 鏉冮檺妫€- 鍙湁绠＄悊鍛樻墠鑳芥墽琛孯BAC绠＄悊鎿嶄綔
    const permissionResult = permissionManager.hasPermission(
      currentUser,
      'rbac_manage'
    );
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        {
          error: '鏉冮檺涓嶈冻',
          reason: permissionResult.reason || '闇€瑕丷BAC绠＄悊鏉冮檺',
        },
        { status: 403 }
      );
    }

    switch (action) {
      case 'assign-role':
        const { userId: assignUserId, roleId } = params;
        if (!assignUserId || !roleId) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 userId, roleId' },
            { status: 400 }
          );
        }

        const assignSuccess = rbac.assignRole(
          assignUserId,
          roleId,
          currentUser.id
        );
        return NextResponse.json({
          success: assignSuccess,
          message: assignSuccess  '瑙掕壊鍒嗛厤鎴愬姛' : '瑙掕壊鍒嗛厤澶辫触',
          timestamp: new Date().toISOString(),
        });

      case 'remove-role':
        const { userId: removeUserId, roleId: removeRoleId } = params;
        if (!removeUserId || !removeRoleId) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 userId, roleId' },
            { status: 400 }
          );
        }

        const removeSuccess = rbac.removeRole(
          removeUserId,
          removeRoleId,
          currentUser.id
        );
        return NextResponse.json({
          success: removeSuccess,
          message: removeSuccess  '瑙掕壊绉婚櫎鎴愬姛' : '瑙掕壊绉婚櫎澶辫触',
          timestamp: new Date().toISOString(),
        });

      case 'grant-permission':
        const { userId: grantUserId, permission, scope, condition } = params;
        if (!grantUserId || !permission) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 userId, permission' },
            { status: 400 }
          );
        }

        const grantSuccess = rbac.grantPermission(
          grantUserId,
          permission,
          currentUser.id,
          scope,
          condition
        );
        return NextResponse.json({
          success: grantSuccess,
          message: grantSuccess  '鏉冮檺鎺堜簣鎴愬姛' : '鏉冮檺鎺堜簣澶辫触',
          timestamp: new Date().toISOString(),
        });

      case 'revoke-permission':
        const { userId: revokeUserId, permission: revokePermission } = params;
        if (!revokeUserId || !revokePermission) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 userId, permission' },
            { status: 400 }
          );
        }

        const revokeSuccess = rbac.revokePermission(
          revokeUserId,
          revokePermission,
          currentUser.id
        );
        return NextResponse.json({
          success: revokeSuccess,
          message: revokeSuccess  '鏉冮檺鎾ら攢鎴愬姛' : '鏉冮檺鎾ら攢澶辫触',
          timestamp: new Date().toISOString(),
        });

      case 'create-hierarchy':
        const { parentRoleId, childRoleId } = params;
        if (!parentRoleId || !childRoleId) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 parentRoleId, childRoleId' },
            { status: 400 }
          );
        }

        const hierarchySuccess = rbac.createRoleHierarchy(
          parentRoleId,
          childRoleId,
          currentUser.id
        );
        return NextResponse.json({
          success: hierarchySuccess,
          message: hierarchySuccess  '瑙掕壊灞傛鍒涘缓鎴愬姛' : '瑙掕壊灞傛鍒涘缓澶辫触',
          timestamp: new Date().toISOString(),
        });

      case 'submit-request':
        const {
          resourceId,
          action: requestAction,
          context,
          justification,
        } = params;
        if (!resourceId || !requestAction) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 resourceId, action' },
            { status: 400 }
          );
        }

        const accessRequestId = rbac.submitAccessRequest(
          currentUser.id,
          resourceId,
          requestAction,
          context,
          justification
        );
        return NextResponse.json({
          success: true,
          data: { requestId: accessRequestId },
          message: '璁块棶璇眰鎻愪氦鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'review-request':
        const { requestId: reviewRequestId, approved, notes } = params;
        if (!reviewRequestId || approved === undefined) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 requestId, approved' },
            { status: 400 }
          );
        }

        const reviewSuccess = rbac.reviewAccessRequest(
          reviewRequestId,
          currentUser.id,
          approved,
          notes
        );
        return NextResponse.json({
          success: reviewSuccess,
          message: reviewSuccess  '璁块棶璇眰瀹℃壒鎴愬姛' : '璁块棶璇眰瀹℃壒澶辫触',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '犳晥鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error) {
    console.error('RBAC POST鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        error: '鎿嶄綔澶辫触',
        message: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

