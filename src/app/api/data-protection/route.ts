import { DataProtectionController } from '@/modules/common/permissions/core/data-protection-controller';
import {
  PermissionManager,
  UserInfo,
} from '@/modules/common/permissions/core/permission-manager';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 模拟敏感数据示例
const sampleSensitiveData = {
  users: [
    {
      id: 'user_001',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      id_card: '110101199001011234',
      bank_card: '6222021234567890123',
      address: '北京市朝阳区某某路123号',
    },
    {
      id: 'user_002',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13900139000',
      id_card: '110101199002022345',
      bank_card: '6222022345678901234',
      address: '上海市浦东新区某某路456号',
    },
  ],
  transactions: [
    {
      id: 'trans_001',
      amount: 850.0,
      payer_name: '王五',
      payer_account: '6222023456789012345',
      receiver_name: '赵六',
      receiver_account: '6222024567890123456',
    },
  ],
};

// 获取当前用户信息
function getCurrentUser(): UserInfo | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    // 简化处理：实际应该解析JWT token
    const userId = 'user_admin';
    return {
      id: userId,
      email: 'admin@example.com',
      roles: ['admin'],
      isActive: true,
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const protection = DataProtectionController.getInstance();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';
    const dataType = url.searchParams.get('type') || 'users';

    switch (action) {
      case 'stats':
        const stats = protection.getProtectionStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        const rules = protection.getMaskingRules();
        return NextResponse.json({
          success: true,
          data: rules,
          timestamp: new Date().toISOString(),
        });

      case 'audit':
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const auditLogs = protection.getAuditLogs(limit);
        return NextResponse.json({
          success: true,
          data: auditLogs,
          timestamp: new Date().toISOString(),
        });

      case 'mask-sample':
        const protectionInstance = DataProtectionController.getInstance();
        const sampleData =
          sampleSensitiveData[dataType as keyof typeof sampleSensitiveData] ||
          sampleSensitiveData.users;
        const maskedSample = protectionInstance.maskDataSet(sampleData as any);

        return NextResponse.json({
          success: true,
          data: {
            original: sampleData,
            masked: maskedSample,
            dataType,
          },
          timestamp: new Date().toISOString(),
        });

      case 'validate-compliance':
        const original = sampleSensitiveData.users[0];
        const masked = protection.maskData(original);
        const compliance = protection.validateMaskingCompliance(
          original,
          masked,
          ['name', 'email', 'phone', 'id_card', 'bank_card']
        );

        return NextResponse.json({
          success: true,
          data: {
            original,
            masked,
            compliance,
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }
  } catch (error) {
    console.error('数据保护GET操作失败:', error);
    return NextResponse.json(
      {
        error: '操作失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const protection = DataProtectionController.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const body = await request.json();
    const { action, ...params } = body;

    // 权限检查 - 需要数据保护管理权限
    const permissionResult = permissionManager.hasPermission(
      currentUser,
      'data_protection_manage'
    );
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        {
          error: '权限不足',
          reason: permissionResult.reason || '需要数据保护管理权限',
        },
        { status: 403 }
      );
    }

    switch (action) {
      case 'add-rule':
        const {
          field,
          type,
          maskChar,
          preserveLength,
          customPattern,
          customReplacement,
        } = params;
        if (!field || !type) {
          return NextResponse.json(
            { error: '缺少必要的参数 field, type' },
            { status: 400 }
          );
        }

        protection.addMaskingRule({
          field,
          type,
          maskChar,
          preserveLength,
          customPattern: customPattern ? new RegExp(customPattern) : undefined,
          customReplacement,
        });

        return NextResponse.json({
          success: true,
          message: '脱敏规则添加成功',
          timestamp: new Date().toISOString(),
        });

      case 'remove-rule':
        const { field: removeField } = params;
        if (!removeField) {
          return NextResponse.json(
            { error: '缺少必要的参数 field' },
            { status: 400 }
          );
        }

        const removed = protection.removeMaskingRule(removeField);
        return NextResponse.json({
          success: removed,
          message: removed ? '脱敏规则移除成功' : '脱敏规则不存在',
          timestamp: new Date().toISOString(),
        });

      case 'mask-data':
        const { data, fields } = params;
        if (!data) {
          return NextResponse.json(
            { error: '缺少必要的参数 data' },
            { status: 400 }
          );
        }

        const maskedData = protection.maskData(data, fields);
        return NextResponse.json({
          success: true,
          data: maskedData,
          message: '数据脱敏处理成功',
          timestamp: new Date().toISOString(),
        });

      case 'encrypt-data':
        const { plaintext } = params;
        if (!plaintext) {
          return NextResponse.json(
            { error: '缺少必要的参数 plaintext' },
            { status: 400 }
          );
        }

        const encryptedResult = await protection.encryptData(plaintext);
        return NextResponse.json({
          success: true,
          data: encryptedResult,
          message: '数据加密成功',
          timestamp: new Date().toISOString(),
        });

      case 'decrypt-data':
        const { encrypted, authTag, iv } = params;
        if (!encrypted || !authTag || !iv) {
          return NextResponse.json(
            { error: '缺少必要的参数 encrypted, authTag, iv' },
            { status: 400 }
          );
        }

        try {
          const decrypted = await protection.decryptData(
            encrypted,
            authTag,
            iv
          );
          return NextResponse.json({
            success: true,
            data: { decrypted },
            message: '数据解密成功',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: '数据解密失败',
              message:
                error instanceof Error ? error.message : '解密过程中发生错误',
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

      case 'clear-audit':
        protection.clearAuditLogs();
        return NextResponse.json({
          success: true,
          message: '审计日志清空成功',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }
  } catch (error) {
    console.error('数据保护POST操作失败:', error);
    return NextResponse.json(
      {
        error: '操作失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
