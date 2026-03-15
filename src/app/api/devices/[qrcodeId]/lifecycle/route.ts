import { DeviceEventType } from '@/lib/constants/lifecycle';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceProfileService } from '@/services/device-profile.service';
import { NextRequest, NextResponse } from 'next/server';

const lifecycleService = new DeviceLifecycleService();
const profileService = new DeviceProfileService();

// Mock数据用于测试
const MOCK_EVENTS: Record<string, any[]> = {
  test_device_001: [
    {
      id: 'mock-event-1',
      eventType: 'manufactured',
      eventTimestamp: '2026-01-15T09:00:00Z',
      location: '深圳富士康工厂',
      notes: '设备在深圳富士康工厂完成生产测试',
      isVerified: true,
    },
    {
      id: 'mock-event-2',
      eventType: 'activated',
      eventTimestamp: '2026-02-05T10:30:00Z',
      location: '北京市朝阳区',
      notes: '用户在北京家中首次扫码激活设备',
      isVerified: true,
    },
    {
      id: 'mock-event-3',
      eventType: 'repaired',
      eventSubtype: 'screen_replacement',
      eventTimestamp: '2026-02-12T15:45:00Z',
      location: '苹果王府井直营店',
      notes: '屏幕意外摔碎，前往苹果官方售后更换原装屏幕',
      eventData: {
        cost: 2288,
        technician: '李师傅',
      },
      isVerified: false,
    },
    {
      id: 'mock-event-4',
      eventType: 'part_replaced',
      eventSubtype: 'battery',
      eventTimestamp: '2026-02-16T11:20:00Z',
      location: '苹果三里屯直营店',
      notes: '电池健康度下降至78%，更换原装电池',
      eventData: {
        cost: 618,
      },
      isVerified: true,
    },
    {
      id: 'mock-event-5',
      eventType: 'maintained',
      eventTimestamp: '2026-02-19T14:20:00Z',
      location: '苹果中关村直营店',
      notes: '定期保养清洁，检查各项功能正常',
      isVerified: true,
    },
  ],
};

// POST /api/devices/[qrcodeId]/lifecycle - 记录生命周期事件
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrcodeId: string }> }
) {
  try {
    const { qrcodeId } = await params;
    const body = await request.json();

    // 验证必要参数
    if (!body.eventType) {
      return NextResponse.json(
        { error: '缺少必要参数: eventType' },
        { status: 400 }
      );
    }

    // 验证事件类型
    if (!Object.values(DeviceEventType).includes(body.eventType)) {
      return NextResponse.json(
        { error: `无效的事件类型: ${body.eventType}` },
        { status: 400 }
      );
    }

    // 记录事件（这里简化了用户认证，实际项目中需要完整的认证逻辑）
    const event = await lifecycleService.recordEvent({
      qrcodeId,
      eventType: body.eventType,
      eventSubtype: body.eventSubtype,
      location: body.location,
      technician: body.technician,
      cost: body.cost,
      notes: body.notes,
      attachments: body.attachments,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      message: '事件记录成功',
      data: event,
    });
  } catch (error) {
    console.error('记录生命周期事件错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// GET /api/devices/[qrcodeId]/lifecycle - 获取设备生命周期历史
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrcodeId: string }> }
) {
  try {
    const { qrcodeId } = await params;
    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const eventType = searchParams.get('eventType') as DeviceEventType | null;
    const limit = searchParams.get('limit')
       parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
       parseInt(searchParams.get('offset')!)
      : undefined;
    const orderBy = searchParams.get('orderBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 检查是否有mock数据
    let history = MOCK_EVENTS[qrcodeId] || [];

    // 如果没有mock数据，尝试从真实数据库获取
    if (history.length === 0) {
      try {
        history = await lifecycleService.getDeviceLifecycleHistory(qrcodeId, {
          eventType: eventType || undefined,
          limit,
          offset,
          orderBy: orderBy as any,
          sortOrder: sortOrder as any,
        });
      } catch (error) {
        // 如果数据库不可用，返回空数组
        console.warn('数据库不可用，返回空事件列表');
        history = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('获取生命周期历史错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error  error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
