import { DeviceEventType } from '@/lib/constants/lifecycle';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { NextRequest, NextResponse } from 'next/server';

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

// POST /api/lifecycle/events - 记录设备生命周期事件（供内部服务调用）
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

    if (!body.eventType) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: eventType',
        },
        { status: 400 }
      );
    }

    // 验证事件类型
    if (!Object.values(DeviceEventType).includes(body.eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的事件类型: ${body.eventType}`,
        },
        { status: 400 }
      );
    }

    // 验证cost格式
    if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'cost必须是非负数字',
        },
        { status: 400 }
      );
    }

    // 验证attachments格式
    if (body.attachments && !Array.isArray(body.attachments)) {
      return NextResponse.json(
        {
          success: false,
          error: 'attachments必须是数组格式',
        },
        { status: 400 }
      );
    }

    // 记录生命周期事件
    const event = await lifecycleService.recordEvent({
      qrcodeId: body.qrcodeId,
      eventType: body.eventType,
      eventSubtype: body.eventSubtype,
      location: body.location,
      technician: body.technician,
      cost: body.cost,
      notes: body.notes,
      attachments: body.attachments,
      metadata: body.metadata,
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '生命周期事件记录成功',
      data: {
        eventId: event.id,
        deviceQrcodeId: event.deviceQrcodeId,
        eventType: event.eventType,
        eventTimestamp: event.eventTimestamp,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error('记录生命周期事件错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// GET /api/lifecycle/events - 查询生命周期事件列表（带分页和过滤）
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

    // 解析查询参数
    const qrcodeId = searchParams.get('qrcodeId');
    const eventType = searchParams.get('eventType') as DeviceEventType | null;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 50;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;
    const orderBy = searchParams.get('orderBy') || 'event_timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 如果没有指定设备ID，返回错误
    if (!qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 查询生命周期事件
    const events = await lifecycleService.getDeviceLifecycleHistory(qrcodeId, {
      eventType: eventType || undefined,
      limit,
      offset,
      orderBy: orderBy as any,
      sortOrder: sortOrder as any,
    });

    return NextResponse.json({
      success: true,
      data: events.map(event => ({
        id: event.id,
        deviceQrcodeId: event.deviceQrcodeId,
        eventType: event.eventType,
        eventSubtype: event.eventSubtype,
        eventData: event.eventData,
        eventTimestamp: event.eventTimestamp,
        location: event.location,
        notes: event.notes,
        isVerified: event.isVerified,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
      pagination: {
        limit,
        offset,
        totalCount: events.length,
      },
    });
  } catch (error) {
    console.error('查询生命周期事件错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
