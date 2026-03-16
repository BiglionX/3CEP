import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DataProtectionController } from '@/modules/common/permissions/core/data-protection-controller';
import {
  PermissionManager,
  UserInfo,
} from '@/modules/common/permissions/core/permission-manager';

// 妯℃嫙鏁忔劅鏁版嵁绀轰緥
const sampleSensitiveData = {
  users: [
    {
      id: 'user_001',
      name: '寮犱笁',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      id_card: '110101199001011234',
      bank_card: '6222021234567890123',
      address: '鍖椾含甯傛湞闃冲尯鏌愭煇琛楅亾123,
    },
    {
      id: 'user_002',
      name: '鏉庡洓',
      email: 'lisi@example.com',
      phone: '13900139000',
      id_card: '110101199002022345',
      bank_card: '6222022345678901234',
      address: '涓婃捣甯傛郸涓滄柊鍖烘煇鏌愯矾456,
    },
  ],
  transactions: [
    {
      id: 'trans_001',
      amount: 850.0,
      payer_name: '鐜嬩簲',
      payer_account: '6222023456789012345',
      receiver_name: '璧靛叚',
      receiver_account: '6222024567890123456',
    },
  ],
};

// 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅
function getCurrentUser(): UserInfo | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token').value;

    if (!token) return null;

    // 绠€鍖栧鐞嗭細瀹為檯搴旇瑙ｆ瀽JWT token
    const userId = 'user_admin';
    return {
      id: userId,
      email: 'admin@example.com',
      roles: ['admin'],
      isActive: true,
    };
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
        return NextResponse.json({ error: '犳晥鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error) {
    console.error('鏁版嵁淇濇姢GET鎿嶄綔澶辫触:', error);
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

    const protection = DataProtectionController.getInstance();
    const permissionManager = PermissionManager.getInstance();
    const body = await request.json();
    const { action, ...params } = body;

    // 鏉冮檺妫€- 闇€瑕佹暟鎹繚鎶ょ鐞嗘潈    const permissionResult = permissionManager.hasPermission(
      currentUser,
      'data_protection_manage'
    );
    if (!permissionResult.hasPermission) {
      return NextResponse.json(
        {
          error: '鏉冮檺涓嶈冻',
          reason: permissionResult.reason || '闇€瑕佹暟鎹繚鎶ょ鐞嗘潈,
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
            { error: '缂哄皯蹇呰鐨勫弬 field, type' },
            { status: 400 }
          );
        }

        protection.addMaskingRule({
          field,
          type,
          maskChar,
          preserveLength,
          customPattern: customPattern  new RegExp(customPattern) : undefined,
          customReplacement,
        });

        return NextResponse.json({
          success: true,
          message: '鑴辨晱瑙勫垯娣诲姞鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'remove-rule':
        const { field: removeField } = params;
        if (!removeField) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 field' },
            { status: 400 }
          );
        }

        const removed = protection.removeMaskingRule(removeField);
        return NextResponse.json({
          success: removed,
          message: removed  '鑴辨晱瑙勫垯绉婚櫎鎴愬姛' : '鑴辨晱瑙勫垯涓嶅,
          timestamp: new Date().toISOString(),
        });

      case 'mask-data':
        const { data, fields } = params;
        if (!data) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 data' },
            { status: 400 }
          );
        }

        const maskedData = protection.maskData(data, fields);
        return NextResponse.json({
          success: true,
          data: maskedData,
          message: '鏁版嵁鑴辨晱澶勭悊鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'encrypt-data':
        const { plaintext } = params;
        if (!plaintext) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 plaintext' },
            { status: 400 }
          );
        }

        const encryptedResult = await protection.encryptData(plaintext);
        return NextResponse.json({
          success: true,
          data: encryptedResult,
          message: '鏁版嵁鍔犲瘑鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      case 'decrypt-data':
        const { encrypted, authTag, iv } = params;
        if (!encrypted || !authTag || !iv) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勫弬 encrypted, authTag, iv' },
            { status: 400 }
          );
        }

        try {
          const decrypted = await protection.decryptData(encrypted, authTag, iv);
          return NextResponse.json({
            success: true,
            data: { decrypted },
            message: '鏁版嵁瑙ｅ瘑鎴愬姛',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: '鏁版嵁瑙ｅ瘑澶辫触',
              message:
                error instanceof Error  error.message : '瑙ｅ瘑杩囩▼涓彂鐢熼敊,
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

      case 'clear-audit':
        protection.clearAuditLogs();
        return NextResponse.json({
          success: true,
          message: '瀹¤ュ織娓呯┖鎴愬姛',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '犳晥鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error) {
    console.error('鏁版嵁淇濇姢POST鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        error: '鎿嶄綔澶辫触',
        message: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

