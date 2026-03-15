/**
 * WMS搴撳鍚屾API璺敱
 * 澶勭悊搴撳鍚屾璇眰鍜岀姸鎬佹煡 */

import { InventoryMapper } from '@/lib/warehouse/inventory-mapper';
import { WMSManager } from '@/lib/warehouse/wms-manager';
import { wmsSyncScheduler } from '@/lib/warehouse/wms-sync-scheduler';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const wmsManager = new WMSManager();
const inventoryMapper = new InventoryMapper();

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const action = searchParams.get('action');
'
    if (action === 'status') {
      // 鑾峰彇鍚屾诲姟鐘      const status = wmsSyncScheduler.getStatus();
      return NextResponse.json({
        success: true,
        data: status,
      });
    } else if (action === 'statistics') {
      // 鑾峰彇搴撳缁熻淇℃伅
      const stats = await inventoryMapper.getInventoryStatistics(
        connectionId || undefined
      );
      return NextResponse.json({
        success: true,
        data: stats,
      });
    } else if (action === 'alerts') {
      // 鑾峰彇搴撳棰勮'
      const threshold = parseInt(searchParams.get('threshold') || '10', 10);
      const alerts = await inventoryMapper.getLowInventoryAlerts(threshold);
      return NextResponse.json({
        success: true,
        data: alerts,
      });
    } else if (action === 'accuracy') {
      // 鑾峰彇搴撳鍑嗙‘鎬ф姤      const accuracyReport = await inventoryMapper.getInventoryAccuracyReport(
        connectionId || undefined
      );
      return NextResponse.json({
        success: true,
        data: accuracyReport,
      });
    } else if (connectionId) {
      // 鑾峰彇鐗瑰畾杩炴帴鐨勫簱瀛樻暟      const inventory =
        await inventoryMapper.getConnectionInventory(connectionId);
      return NextResponse.json({
        success: true,
        data: inventory,
      });
    } else {
      // 鑾峰彇鎵€鏈夊簱瀛樻暟鎹紙鍒嗛〉      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('wms_current_inventory')'
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json(
          { error: '鏌ヨ搴撳鏁版嵁澶辫触', details: error.message },
{ status: 500 }
        );
      }

      // 鑾峰彇鎬绘暟
      const { count, error: countError } = await supabase
        .from('wms_current_inventory')'
        .select('*', { count: 'exact', head: true });

      return NextResponse.json({
        success: true,
        data: {
          items: data,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    }
  } catch (error) {
    console.error('鑾峰彇搴撳鏁版嵁澶辫触:', error);
    return NextResponse.json(
      { error: '鑾峰彇搴撳鏁版嵁澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { connectionId, action, syncType = 'incremental' } = body;
'
    if (action === 'sync') {
      // 鎵嬪姩瑙﹀彂鍚屾
      if (!connectionId) {
        return NextResponse.json('
          { error: '鍚屾鎿嶄綔闇€瑕佹寚瀹歝onnectionId' },
{ status: 400 }
        );
      }

      const result = await wmsManager.syncWarehouseInventory(connectionId);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: '搴撳鍚屾鎴愬姛',
            itemCount: (result.data as any).(data as any).length || 0,
          },
        });
      } else {
        return NextResponse.json(
          { error: '搴撳鍚屾澶辫触', details: result.error },
{ status: 400 }
        );
      }
    } else if (action === 'bulk-sync') {
      // 鎵归噺鍚屾鎵€鏈夋椿璺冧粨      const result = await wmsManager.syncAllActiveWarehouses();

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: '鎵归噺鍚屾鎴愬姛',
            connectionCount: Object.keys(result.data || {}).length,
          },
        });
      } else {
        return NextResponse.json(
          { error: '鎵归噺鍚屾澶辫触', details: result.error },
{ status: 400 }
        );
      }
    } else if (action === 'start-scheduler') {
      // 鍚姩瀹氭椂鍚屾诲姟
      await wmsSyncScheduler.start();
      return NextResponse.json({
        success: true,
        data: {
          message: '瀹氭椂鍚屾诲姟宸插惎,
        },
      });
    } else if (action === 'stop-scheduler') {
      // 鍋滄瀹氭椂鍚屾诲姟
      wmsSyncScheduler.stop();
      return NextResponse.json({
        success: true,
        data: {
          message: '瀹氭椂鍚屾诲姟宸插仠,
        },
      });
    } else if (action === 'manual-sync') {
      // 鎵嬪姩瑙﹀彂瀹氭椂诲姟
      const result = await wmsSyncScheduler.triggerManualSync();

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: result.message,
          },
        });
      } else {
        return NextResponse.json({ error: result.message },
{ status: 400 });
      }
    } else {
      return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 },
{ status: 400 });
    }
  } catch (error) {'
    console.error('搴撳鍚屾鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      { error: '鎿嶄綔澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { connectionId, syncFrequency, alertThreshold } = body;

    if (syncFrequency !== undefined) {
      // 鏇存柊鍚屾棰戠巼
      if (connectionId) {
        // 鏇存柊鐗瑰畾杩炴帴鐨勫悓姝ラ        const { error } = await supabase
          .from('wms_connections')
          .update({ sync_frequency: syncFrequency } as any)'
          .eq('id', connectionId);

        if (error) {
          return NextResponse.json(
            { error: '鏇存柊鍚屾棰戠巼澶辫触', details: error.message },
{ status: 500 }
          );
        }
      } else {
        // 鏇存柊鍏ㄥ眬鍚屾閰嶇疆
        wmsSyncScheduler.updateConfig({ intervalMinutes: syncFrequency });
      }

      return NextResponse.json({
        success: true,
        data: {
          message: '鍚屾棰戠巼鏇存柊鎴愬姛',
        },
      });
    }

    if (alertThreshold !== undefined) {
      // 鏇存柊棰勮闃      wmsSyncScheduler.updateConfig({ alertThreshold });

      return NextResponse.json({
        success: true,
        data: {
          message: '棰勮闃堝€兼洿鏂版垚,
        },
      });
    }

    return NextResponse.json({ error: '缂哄皯鏈夋晥鐨勬洿鏂板弬 },
{ status: 400 });
  } catch (error) {'
    console.error('鏇存柊鍚屾閰嶇疆澶辫触:', error);
    return NextResponse.json(
      { error: '鏇存柊閰嶇疆澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

