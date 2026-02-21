/**
 * 工单配件更换API
 * 处理工单中的配件更换操作并记录生命周期事件
 */
import { RepairOrderService } from '@/fcx-system/services/repair-order.service';
import { Database } from '@/lib/database.types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    orderId: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const {
      partId,
      partName,
      partType,
      oldPartSerial,
      newPartSerial,
      cost,
      userId,
    } = body;

    // 参数验证
    if (!partId || !partName || !partType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: partId, partName, partType' },
        { status: 400 }
      );
    }

    // 获取工单信息
    const orderService = new RepairOrderService();
    const order = await orderService.getOrder(params.orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      );
    }

    // 记录配件更换事件
    await orderService.recordPartReplacement(
      order,
      {
        partId,
        partName,
        partType,
        oldPartSerial,
        newPartSerial,
        cost,
      },
      userId
    );

    return NextResponse.json({
      success: true,
      message: '配件更换事件记录成功',
      data: {
        orderId: params.orderId,
        partId,
        partName,
        partType,
        recordedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('记录配件更换事件错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '记录配件更换事件失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET /api/fcx/orders/[orderId]/parts - 获取工单配件更换历史
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const qrcodeId = searchParams.get('qrcodeId');

    if (!qrcodeId) {
      return NextResponse.json(
        { success: false, error: '缺少设备二维码ID参数' },
        { status: 400 }
      );
    }

    // 调用生命周期服务获取配件更换历史
    const { DeviceLifecycleService } = await import(
      '@/services/device-lifecycle.service'
    );
    const { DeviceEventType } = await import('@/lib/constants/lifecycle');

    const lifecycleService = new DeviceLifecycleService();
    const partReplacementEvents =
      await lifecycleService.getDeviceLifecycleHistory(qrcodeId, {
        eventType: DeviceEventType.PART_REPLACED,
        limit: 50,
        orderBy: 'timestamp',
        sortOrder: 'desc',
      });

    return NextResponse.json({
      success: true,
      data: partReplacementEvents,
      message: `找到 ${partReplacementEvents.length} 条配件更换记录`,
    });
  } catch (error) {
    console.error('获取配件更换历史错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取配件更换历史失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
