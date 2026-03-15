import { DeviceEventType } from '@/lib/constants/lifecycle';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { NextRequest, NextResponse } from 'next/server';

const lifecycleService = new DeviceLifecycleService();

// API瀵嗛挜楠岃瘉涓棿function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.LIFECYCLE_API_KEY;

  // 寮€鍙戠幆澧冧笅濡傛灉娌℃湁閰嶇疆API瀵嗛挜锛屽垯鍏佽璁块棶
  if (!apiKey) {
    console.warn('鈿狅笍  LIFECYCLE_API_KEY 鏈厤缃紝璇峰湪鐢熶骇鐜涓);
    return true;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === apiKey;
}

// POST /api/lifecycle/events - 璁板綍璁惧鐢熷懡鍛ㄦ湡浜嬩欢锛堜緵鍐呴儴鏈嶅姟璋冪敤export async function POST(request: NextRequest) {
  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇彁渚涙湁鏁堢殑API瀵嗛挜',
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

    if (!body.eventType) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: eventType',
        },
        { status: 400 }
      );
    }

    // 楠岃瘉浜嬩欢绫诲瀷
    if (!Object.values(DeviceEventType).includes(body.eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `犳晥鐨勪簨剁被 ${body.eventType}`,
        },
        { status: 400 }
      );
    }

    // 楠岃瘉cost鏍煎紡
    if (body.cost && (typeof body.cost !== 'number' || body.cost < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'cost蹇呴』鏄潪璐熸暟,
        },
        { status: 400 }
      );
    }

    // 楠岃瘉attachments鏍煎紡
    if (body.attachments && !Array.isArray(body.attachments)) {
      return NextResponse.json(
        {
          success: false,
          error: 'attachments蹇呴』鏄暟缁勬牸,
        },
        { status: 400 }
      );
    }

    // 璁板綍鐢熷懡鍛ㄦ湡浜嬩欢
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

    // 杩斿洖鎴愬姛鍝嶅簲
    return NextResponse.json({
      success: true,
      message: '鐢熷懡鍛ㄦ湡浜嬩欢璁板綍鎴愬姛',
      data: {
        eventId: event.id,
        deviceQrcodeId: event.deviceQrcodeId,
        eventType: event.eventType,
        eventTimestamp: event.eventTimestamp,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error('璁板綍鐢熷懡鍛ㄦ湡浜嬩欢閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
      },
      { status: 500 }
    );
  }
}

// GET /api/lifecycle/events - 鏌ヨ鐢熷懡鍛ㄦ湡浜嬩欢鍒楄〃锛堝甫鍒嗛〉鍜岃繃婊わ級
export async function GET(request: NextRequest) {
  try {
    // API瀵嗛挜楠岃瘉
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: '鏈巿鏉冭闂紝璇彁渚涙湁鏁堢殑API瀵嗛挜',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const qrcodeId = searchParams.get('qrcodeId');
    const eventType = searchParams.get('eventType') as DeviceEventType | null;
    const limit = searchParams.get('limit')
       parseInt(searchParams.get('limit')!)
      : 50;
    const offset = searchParams.get('offset')
       parseInt(searchParams.get('offset')!)
      : 0;
    const orderBy = searchParams.get('orderBy') || 'event_timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 濡傛灉娌℃湁鎸囧畾璁惧ID锛岃繑鍥為敊    if (!qrcodeId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: qrcodeId',
        },
        { status: 400 }
      );
    }

    // 鏌ヨ鐢熷懡鍛ㄦ湡浜嬩欢
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
    console.error('鏌ヨ鐢熷懡鍛ㄦ湡浜嬩欢閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
      },
      { status: 500 }
    );
  }
}

