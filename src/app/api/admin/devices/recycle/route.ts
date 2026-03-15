/**
 * 绠＄悊鍚庡彴璁惧鍥炴敹API
 * 鎻愪緵璁惧鍥炴敹鍔熻兘鎺ュ彛
 */
import { DeviceEventType } from '@/lib/constants/lifecycle';
import { Database } from '@/lib/database.types';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface RecycleDeviceRequest {
  qrcodeId: string;
  reason: string;
  userId: string;
  location: string;
  notes: string;
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body: RecycleDeviceRequest = await request.json();
    const { qrcodeId, reason, userId, location, notes } = body;

    // 鍙傛暟楠岃瘉
    if (!qrcodeId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯璁惧浜岀淮鐮両D' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涘洖鏀跺師 },
        { status: 400 }
      );
    }

    // 楠岃瘉璁惧鏄惁瀛樺湪
    const { data: deviceExists, error: deviceError } = await supabase
      .from('product_qrcodes')
      .select('qr_code_id')
      .eq('qr_code_id', qrcodeId)
      .single();

    if (deviceError || !deviceExists) {
      return NextResponse.json(
        { success: false, error: '璁惧涓嶅 },
        { status: 404 }
      );
    }

    // 鍒濆鍖栫敓鍛藉懆鏈熸湇    const lifecycleService = new DeviceLifecycleService();

    // 璁板綍鍥炴敹浜嬩欢
    const recycleEvent = await lifecycleService.recordEvent({
      qrcodeId,
      eventType: DeviceEventType.RECYCLED,
      eventSubtype: 'manual_recycle',
      location: location || '绠＄悊鍚庡彴',
      technician: '绠＄悊,
      notes: `鎵嬪姩鍥炴敹: ${reason}${notes  ` - ${notes}` : ''}`,
      metadata: {
        recycleReason: reason,
        initiatedBy: userId || 'admin',
        source: 'admin_panel',
        recycleMethod: 'manual',
        additionalNotes: notes,
      },
    });

    // 鏇存柊璁惧鐘舵€侊紙濡傛灉闇€瑕佺殑璇濓級
    await updateDeviceStatus(qrcodeId, 'recycled');

    return NextResponse.json({
      success: true,
      message: '璁惧鍥炴敹璁板綍鎴愬姛',
      data: {
        eventId: recycleEvent.id,
        qrcodeId: qrcodeId,
        eventType: DeviceEventType.RECYCLED,
        recordedAt: recycleEvent.eventTimestamp,
        recycleReason: reason,
      },
    });
  } catch (error) {
    console.error('璁惧鍥炴敹澶勭悊閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '璁惧鍥炴敹澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/devices/recycle/historyqrcodeId=xxx - 鑾峰彇璁惧鍥炴敹鍘嗗彶
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qrcodeId = searchParams.get('qrcodeId');

    if (!qrcodeId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯璁惧浜岀淮鐮両D鍙傛暟' },
        { status: 400 }
      );
    }

    // 璋冪敤鐢熷懡鍛ㄦ湡鏈嶅姟鑾峰彇鍥炴敹鍘嗗彶
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
      message: `鎵惧埌 ${recycleEvents.length} 鏉″洖鏀惰褰昤,
    });
  } catch (error) {
    console.error('鑾峰彇鍥炴敹鍘嗗彶閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍥炴敹鍘嗗彶澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 鏇存柊璁惧鐘 */
async function updateDeviceStatus(
  qrcodeId: string,
  status: string
): Promise<void> {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 杩欓噷鍙互鏍规嵁瀹為檯闇€姹傛洿鏂拌澶囩姸    // 渚嬪鏇存柊鍒拌澶囨。妗堣〃鎴栧叾栫浉鍏宠〃
    console.log(`璁惧 ${qrcodeId} 鐘舵€佹洿鏂颁负: ${status}`);
  } catch (error) {
    console.error('鏇存柊璁惧鐘舵€侀敊', error);
    // 涓嶆姏鍑哄紓甯革紝垮厤褰卞搷涓绘祦  }
}

