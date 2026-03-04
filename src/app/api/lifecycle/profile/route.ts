import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceProfileService } from '@/services/device-profile.service';
import { NextRequest, NextResponse } from 'next/server';

const profileService = new DeviceProfileService();
const lifecycleService = new DeviceLifecycleService();

// API瀵嗛挜楠岃瘉涓棿?function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.LIFECYCLE_API_KEY;

  // 寮€鍙戠幆澧冧笅濡傛灉娌℃湁閰嶇疆API瀵嗛挜锛屽垯鍏佽璁块棶
  if (!apiKey) {
    console.warn('鈿狅笍  LIFECYCLE_API_KEY 鏈厤缃紝璇峰湪鐢熶骇鐜涓?);
    return true;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === apiKey;
}

// GET /api/lifecycle/profile?qrcodeId=xxx - 鏌ヨ璁惧妗ｆ鍜岀敓鍛藉懆鏈熶簨?export async function GET(request: NextRequest) {
  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇锋彁渚涙湁鏁堢殑API瀵嗛挜',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const qrcodeId = searchParams.get('qrcodeId');

    // 楠岃瘉蹇呰鍙傛暟
    if (!qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 鑾峰彇璁惧妗ｆ
    const profile = await profileService.getDeviceProfile(qrcodeId);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈壘鍒拌澶囨。?,
        },
        { status: 404 }
      );
    }

    // 鑾峰彇鐢熷懡鍛ㄦ湡浜嬩欢鍒楄〃锛堟寜鏃堕棿鍊掑簭?    const events = await lifecycleService.getDeviceLifecycleHistory(qrcodeId, {
      limit: 100, // 鑾峰彇鏈€?00鏉¤?      orderBy: 'timestamp',
      sortOrder: 'desc',
    });

    // 鏋勫缓鍝嶅簲鏁版嵁
    const responseData = {
      success: true,
      data: {
        // 璁惧鎽樿淇℃伅
        profile: {
          id: profile.id,
          qrcodeId: profile.qrcodeId,
          productModel: profile.productModel,
          productCategory: profile.productCategory,
          brandName: profile.brandName,
          serialNumber: profile.serialNumber,
          manufacturingDate: profile.manufacturingDate,
          firstActivatedAt: profile.firstActivatedAt,
          warrantyStartDate: profile.warrantyStartDate,
          warrantyExpiry: profile.warrantyExpiry,
          warrantyPeriod: profile.warrantyPeriod,
          currentStatus: profile.currentStatus,
          lastEventAt: profile.lastEventAt,
          lastEventType: profile.lastEventType,
          totalRepairCount: profile.totalRepairCount,
          totalPartReplacementCount: profile.totalPartReplacementCount,
          totalTransferCount: profile.totalTransferCount,
          currentLocation: profile.currentLocation,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        // 鐢熷懡鍛ㄦ湡浜嬩欢鍒楄〃
        events: events.map(event => ({
          id: event.id,
          eventType: event.eventType,
          eventSubtype: event.eventSubtype,
          eventData: event.eventData,
          eventTimestamp: event.eventTimestamp,
          location: event.location,
          notes: event.notes,
          isVerified: event.isVerified,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
        })),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('鏌ヨ璁惧妗ｆ閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

// POST /api/lifecycle/profile - 鍒涘缓鎴栨洿鏂拌澶囨。?export async function POST(request: NextRequest) {
  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇锋彁渚涙湁鏁堢殑API瀵嗛挜',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 楠岃瘉蹇呰鍙傛暟
    if (!body.qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 妫€鏌ユ。妗堟槸鍚﹀凡瀛樺湪
    const existingProfile = await profileService.getDeviceProfile(
      body.qrcodeId
    );

    if (existingProfile) {
      // 鏇存柊鐜版湁妗ｆ
      const updatedProfile = await profileService.updateDeviceProfile(
        body.qrcodeId,
        {
          productModel: body.productModel,
          productCategory: body.productCategory,
          brandName: body.brandName,
          serialNumber: body.serialNumber,
          manufacturingDate: body.manufacturingDate
            ? new Date(body.manufacturingDate)
            : undefined,
          warrantyPeriod: body.warrantyPeriod,
          currentStatus: body.currentStatus,
          currentLocation: body.currentLocation,
          ownerInfo: body.ownerInfo,
          specifications: body.specifications,
        }
      );

      return NextResponse.json({
        success: true,
        message: '璁惧妗ｆ鏇存柊鎴愬姛',
        data: {
          id: updatedProfile.id,
          qrcodeId: updatedProfile.qrcodeId,
          updatedAt: updatedProfile.updatedAt,
        },
      });
    } else {
      // 鍒涘缓鏂版。?      const newProfile = await profileService.createDeviceProfile({
        qrcodeId: body.qrcodeId,
        productModel: body.productModel,
        productCategory: body.productCategory,
        brandName: body.brandName,
        serialNumber: body.serialNumber,
        manufacturingDate: body.manufacturingDate
          ? new Date(body.manufacturingDate)
          : undefined,
        warrantyPeriod: body.warrantyPeriod,
        currentStatus: body.currentStatus,
        specifications: body.specifications,
      });

      return NextResponse.json({
        success: true,
        message: '璁惧妗ｆ鍒涘缓鎴愬姛',
        data: {
          id: newProfile.id,
          qrcodeId: newProfile.qrcodeId,
          createdAt: newProfile.createdAt,
        },
      });
    }
  } catch (error) {
    console.error('澶勭悊璁惧妗ｆ閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
      },
      { status: 500 }
    );
  }
}

