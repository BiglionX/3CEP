/**
 * 管理后台设备回收API
 * 提供设备回收功能接口
 */
import { DeviceEventType } from '@/lib/constants/lifecycle';
import { Database } from '@/lib/database.types';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface RecycleDeviceRequest {
  qrcodeId: string;
  reason: string;
  userId: string;
  location: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      try {
        const body: RecycleDeviceRequest = await request.json();
        const { qrcodeId, reason, userId, location, notes } = body;

        // 参数验证
        if (!qrcodeId) {
          return NextResponse.json(
            { success: false, error: '缺少设备二维码ID' },
            { status: 400 }
          );
        }

        if (!reason || reason.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: '请提供回收原因' },
            { status: 400 }
          );
        }

        // 验证设备是否存在
        const { data: deviceExists, error: deviceError } = await supabase
          .from('product_qrcodes')
          .select('qr_code_id')
          .eq('qr_code_id', qrcodeId)
          .single();

        if (deviceError || !deviceExists) {
          return NextResponse.json(
            { success: false, error: '设备不存在' },
            { status: 404 }
          );
        }

        // 初始化生命周期服务
        const lifecycleService = new DeviceLifecycleService();

        // 记录回收事件
        const recycleEvent = await lifecycleService.recordEvent({
          qrcodeId,
          eventType: DeviceEventType.RECYCLED,
          eventSubtype: 'manual_recycle',
          location: location || '管理后台',
          technician: '管理员',
          notes: `手动回收: ${reason}${notes ? ` - ${notes}` : ''}`,
          metadata: {
            recycleReason: reason,
            initiatedBy: userId || 'admin',
            source: 'admin_panel',
            recycleMethod: 'manual',
            additionalNotes: notes,
          },
        });

        // 更新设备状态(如果需要的话)
        await updateDeviceStatus(qrcodeId, 'recycled');

        return NextResponse.json({
          success: true,
          message: '设备回收记录成功',
          data: {
            eventId: recycleEvent.id,
            qrcodeId: qrcodeId,
            eventType: DeviceEventType.RECYCLED,
            recordedAt: recycleEvent.eventTimestamp,
            recycleReason: reason,
          },
        });
      } catch (error) {
        console.error('设备回收处理错误:', error);
        return NextResponse.json(
          {
            success: false,
            error: '设备回收处理失败',
            details: (error as Error).message,
          },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}

// GET /api/admin/devices/recycle/history?qrcodeId=xxx - 获取设备回收历史
export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const qrcodeId = searchParams.get('qrcodeId');

        if (!qrcodeId) {
          return NextResponse.json(
            { success: false, error: '缺少设备二维码ID参数' },
            { status: 400 }
          );
        }

        // 调用生命周期服务获取回收历史
        const lifecycleService = new DeviceLifecycleService();
        const recycleEvents = await lifecycleService.getDeviceLifecycleHistory(
          qrcodeId,
          {
            eventType: DeviceEventType.RECYCLED,
            limit: 50,
            orderBy: 'timestamp',
            sortOrder: 'desc',
          }
        );

        return NextResponse.json({
          success: true,
          data: recycleEvents,
          message: `找到 ${recycleEvents.length} 条回收记录`,
        });
      } catch (error) {
        console.error('获取回收历史错误:', error);
        return NextResponse.json(
          {
            success: false,
            error: '获取回收历史失败',
            details: (error as Error).message,
          },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}

/**
 * 更新设备状态
 */
async function updateDeviceStatus(
  _qrcodeId: string,
  _status: string
): Promise<void> {
  try {
    // const supabase = createClient<Database>(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // );
    // 这里可以根据实际需求更新设备状态
    // 例如更新到设备档案表或其他相关表
    // console.log(`设备 ${_qrcodeId} 状态更新为: ${_status}`);
  } catch (error) {
    // console.error('更新设备状态错误', error);
    // 不抛出异常,避免影响主流程
  }
}
