import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceProfileService } from '@/services/device-profile.service';
import { NextRequest, NextResponse } from 'next/server';

const profileService = new DeviceProfileService();
const lifecycleService = new DeviceLifecycleService();

// API密钥验证中间件
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.LIFECYCLE_API_KEY;

  // 开发环境下如果没有配置API密钥，则允许访问
  if (!apiKey) {
    console.warn('⚠️  LIFECYCLE_API_KEY 未配置，请在生产环境中设置');
    return true;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === apiKey;
}

// GET /api/lifecycle/profile?qrcodeId=xxx - 查询设备档案和生命周期事件
export async function GET(request: NextRequest) {
  try {
    // API密钥验证
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问，请提供有效的API密钥',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const qrcodeId = searchParams.get('qrcodeId');

    // 验证必要参数
    if (!qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 获取设备档案
    const profile = await profileService.getDeviceProfile(qrcodeId);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到设备档案',
        },
        { status: 404 }
      );
    }

    // 获取生命周期事件列表（按时间倒序）
    const events = await lifecycleService.getDeviceLifecycleHistory(qrcodeId, {
      limit: 100, // 获取最近100条记录
      orderBy: 'timestamp',
      sortOrder: 'desc',
    });

    // 构建响应数据
    const responseData = {
      success: true,
      data: {
        // 设备摘要信息
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
        // 生命周期事件列表
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
    console.error('查询设备档案错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// POST /api/lifecycle/profile - 创建或更新设备档案
export async function POST(request: NextRequest) {
  try {
    // API密钥验证
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问，请提供有效的API密钥',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必要参数
    if (!body.qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 检查档案是否已存在
    const existingProfile = await profileService.getDeviceProfile(
      body.qrcodeId
    );

    if (existingProfile) {
      // 更新现有档案
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
        message: '设备档案更新成功',
        data: {
          id: updatedProfile.id,
          qrcodeId: updatedProfile.qrcodeId,
          updatedAt: updatedProfile.updatedAt,
        },
      });
    } else {
      // 创建新档案
      const newProfile = await profileService.createDeviceProfile({
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
        message: '设备档案创建成功',
        data: {
          id: newProfile.id,
          qrcodeId: newProfile.qrcodeId,
          createdAt: newProfile.createdAt,
        },
      });
    }
  } catch (error) {
    console.error('处理设备档案错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
