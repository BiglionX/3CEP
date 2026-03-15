/**
 * WMS杩炴帴绠＄悊API璺敱
 * 澶勭悊WMS杩炴帴鐨勫鍒犳敼鏌ユ搷 */

import { WMSManager } from '@/lib/warehouse/wms-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const wmsManager = new WMSManager();

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (connectionId) {
      // 鑾峰彇鍗曚釜杩炴帴璇︽儏
      const connection = wmsManager.getConnection(connectionId);
      if (!connection) {'
        return NextResponse.json({ error: '杩炴帴涓嶅 },
{ status: 404 });
      }

      // 鑾峰彇杩炴帴鍋ュ悍鐘      const healthResult = wmsManager.getConnectionHealth(connectionId);

      return NextResponse.json({
        success: true,
        data: {
          ...connection,
          health: healthResult.success  healthResult.data : null,
        },
      });
    } else {
      // 鑾峰彇鎵€鏈夎繛鎺ュ垪      const connections = wmsManager.getConnections();

      // 琛ュ厖鏁版嵁搴撲腑鐨勮缁嗕俊      const connectionIds = connections.map(conn => conn.id);
      if (connectionIds.length > 0) {
        const { data: dbConnections, error } = await supabase'
          .from('wms_connections')'
          .select('*')'
          .in('id', connectionIds);

        if (!error && dbConnections) {
          // 鍚堝苟鍐呭鍜屾暟鎹簱淇℃伅
          const enrichedConnections = connections.map(conn => {
            const dbConn = dbConnections.find(db => db.id === conn.id);
            return {
              ...conn,
              ...dbConn,
              created_at: dbConn.created_at,
              updated_at: dbConn.updated_at,
            };
          });

          return NextResponse.json({
            success: true,
            data: enrichedConnections,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: connections,
      });
    }
  } catch (error) {
    console.error('鑾峰彇WMS杩炴帴鍒楄〃澶辫触:', error);
    return NextResponse.json(
      { error: '鑾峰彇杩炴帴鍒楄〃澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      provider,
      warehouseId,
      baseUrl,
      clientId,
      clientSecret,
      isActive = true,
      syncFrequency = 5,
    } = body;

    // 鍙傛暟楠岃瘉
    if (
      !name ||
      !provider ||
      !warehouseId ||
      !baseUrl ||
      !clientId ||
      !clientSecret
    ) {
      return NextResponse.json(
        {
          error:
            '缂哄皯蹇呰鍙傛暟: name, provider, warehouseId, baseUrl, clientId, clientSecret',
        },
{ status: 400 }
      );
    }

    // 楠岃瘉鎻愪緵    const validProviders = ['goodcang', '4px', 'winit', 'custom'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `涓嶆敮鎸佺殑鎻愪緵 ${provider}` },
{ status: 400 }
      );
    }

    // 鍔犲瘑瀵嗛挜锛堢畝鍖栧鐞嗭紝瀹為檯搴旇浣跨敤鏇村己鐨勫姞瀵嗭級
    const encryptedSecret = Buffer.from(clientSecret).toString('base64');

    // 淇濆鍒版暟鎹簱
    const { data: dbConnection, error: dbError } = await supabase
      .from('wms_connections')
      .insert({
        name,
        provider,
        warehouse_id: warehouseId,
        base_url: baseUrl,
        client_id: clientId,
        client_secret_encrypted: encryptedSecret,
        is_active: isActive,
        sync_frequency: syncFrequency,
      } as any)
      .select('id')
      .single();

    if (dbError) {
      return NextResponse.json('
        { error: '淇濆杩炴帴閰嶇疆澶辫触', details: dbError.message },
{ status: 500 }
      );
    }

    // 娣诲姞鍒癢MS绠＄悊    const config = {
      provider: provider as any,
      baseUrl,
      clientId,
      clientSecret,
      warehouseId,
    };

    const connectionInfo = {
      name,
      provider: provider as any,
      warehouseId,
      isActive,
    };

    const result = await wmsManager.addConnection(connectionInfo, config);

    if (!result.success) {
      // 濡傛灉娣诲姞澶辫触锛屽洖婊氭暟鎹簱璁板綍
      await supabase.from('wms_connections').delete().eq('id', dbConnection.id);

      return NextResponse.json(
        { error: '杩炴帴娴嬭瘯澶辫触', details: result.error },
{ status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        connectionId: result.data,
        message: 'WMS杩炴帴鍒涘缓鎴愬姛',
      },
    }) as any;
  } catch (error) {
    console.error('鍒涘缓WMS杩炴帴澶辫触:', error);
    return NextResponse.json(
      { error: '鍒涘缓杩炴帴澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {'
      return NextResponse.json({ error: '缂哄皯杩炴帴ID鍙傛暟' },
{ status: 400 });
    }

    const body = await request.json();
    const {
      name,
      isActive,
      syncFrequency,
      clientSecret, // 鍙€夋洿    } = body;

    // 妫€鏌ヨ繛鎺ユ槸鍚﹀    const existingConnection = wmsManager.getConnection(connectionId);
    if (!existingConnection) {
      return NextResponse.json({ error: '杩炴帴涓嶅 },
{ status: 404 });
    }

    // 鏋勫缓鏇存柊鏁版嵁
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (syncFrequency !== undefined) updateData.sync_frequency = syncFrequency;
    if (clientSecret) {
      updateData.client_secret_encrypted ='
        Buffer.from(clientSecret).toString('base64');
    }

    // 鏇存柊鏁版嵁    const { error: dbError } = await supabase'
      .from('wms_connections')
      .update(updateData)'
      .eq('id', connectionId);

    if (dbError) {
      return NextResponse.json(
        { error: '鏇存柊杩炴帴閰嶇疆澶辫触', details: dbError.message },
{ status: 500 }
      );
    }

    // 鏇存柊鍐呭涓殑杩炴帴鐘    if (isActive !== undefined) {
      wmsManager.toggleConnection(connectionId, isActive);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'WMS杩炴帴鏇存柊鎴愬姛',
      },
    });
  } catch (error) {
    console.error('鏇存柊WMS杩炴帴澶辫触:', error);
    return NextResponse.json(
      { error: '鏇存柊杩炴帴澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {'
      return NextResponse.json({ error: '缂哄皯杩炴帴ID鍙傛暟' },
{ status: 400 });
    }

    // 妫€鏌ヨ繛鎺ユ槸鍚﹀    const existingConnection = wmsManager.getConnection(connectionId);
    if (!existingConnection) {
      return NextResponse.json({ error: '杩炴帴涓嶅 },
{ status: 404 });
    }

    // 庢暟鎹簱鍒犻櫎
    const { error: dbError } = await supabase'
      .from('wms_connections')
      .delete()'
      .eq('id', connectionId);

    if (dbError) {
      return NextResponse.json(
        { error: '鍒犻櫎杩炴帴閰嶇疆澶辫触', details: dbError.message },
{ status: 500 }
      );
    }

    // 庡唴瀛樹腑绉婚櫎
    const result = wmsManager.removeConnection(connectionId);

    if (!result.success) {
      return NextResponse.json(
        { error: '绉婚櫎杩炴帴澶辫触', details: result.error },
{ status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'WMS杩炴帴鍒犻櫎鎴愬姛',
      },
    });
  } catch (error) {
    console.error('鍒犻櫎WMS杩炴帴澶辫触:', error);
    return NextResponse.json(
      { error: '鍒犻櫎杩炴帴澶辫触', details: (error as Error).message },
{ status: 500 }
    );
  }
}

