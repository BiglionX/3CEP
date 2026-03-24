/**
 * 绠＄悊鍚庡彴璁惧鎼滅储API
 * 鎻愪緵璁惧鎼滅储鍔熻兘鎺ュ彛
 */
import { Database } from '@/lib/database.types';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涙悳绱㈠叧閿瘝' },
        { status: 400 }
      );
    }

    const trimmedSearch = searchTerm.trim();

    // 鍦ㄥ涓〃涓悳绱㈣    const devices = await searchDevices(supabase, trimmedSearch);

    return NextResponse.json({
      success: true,
      data: {
        searchTerm: trimmedSearch,
        devices: devices,
        totalCount: devices.length,
      },
      message: `鎵惧埌 ${devices.length} 涓尮閰嶇殑璁惧`,
    });
  } catch (error) {
    console.error('璁惧鎼滅储閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '璁惧鎼滅储澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }

    },
    'devices_read'
  );

/**
 * 鎼滅储璁惧鐨勪富瑕侀€昏緫
 */
async function searchDevices(supabase: any, searchTerm: string) {
  try {
    // 1. 鍦ㄨ澶囦簩缁寸爜琛ㄤ腑鎼滅储
    const { data: qrcodeResults, error: qrcodeError } = await supabase
      .from('product_qrcodes')
      .select(
        `
        qr_code_id,
        products(id, name, model, brand_id),
        brands(name)
      `
      )
      .or(
        `qr_code_id.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`
      )
      .limit(20);

    if (qrcodeError) {
      console.error('浜岀淮鐮佹悳绱㈤敊', qrcodeError);
    }

    // 2. 鍦ㄤ骇鍝佽〃涓悳绱㈠瀷鍙峰拰鍚嶇О
    const { data: productResults, error: productError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        model,
        brand_id,
        brands(name)
      `
      )
      .or(`model.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(20);

    if (productError) {
      console.error('浜у搧鎼滅储閿欒:', productError);
    }

    // 3. 鍚堝苟鍜屽幓閲嶇粨    const allResults = new Map();

    // 澶勭悊浜岀淮鐮佹悳绱㈢粨    if (qrcodeResults) {
      qrcodeResults.forEach((item: any) => {
        const key = item.qr_code_id;
        if (!allResults.has(key)) {
          allResults.set(key, {
            qrcodeId: item.qr_code_id,
            productId: item.id,
            productModel: item.model,
            productName: item.name,
            brandName: item.name || item.brands.name,
            source: 'qrcode',
          });
        }
      });
    }

    // 澶勭悊浜у搧鎼滅储缁撴灉
    if (productResults) {
      productResults.forEach((item: any) => {
        // 鏌ユ壘鍏宠仈鐨勪簩缁寸爜
        const key = `${item.id}-${item.model}`;
        if (!allResults.has(key)) {
          allResults.set(key, {
            qrcodeId: null, // 闇€瑕佽繘涓€姝ユ煡璇㈠叿浣撶殑浜岀淮            productId: item.id,
            productModel: item.model,
            productName: item.name,
            brandName: item.name,
            source: 'product',
          });
        }
      });
    }

    // 4. 琛ュ厖璁惧妗ｆ淇℃伅
    const enrichedDevices = [];
    for (const [_, device] of allResults) {
      const enrichedDevice = await enrichDeviceInfo(supabase, device);
      if (enrichedDevice) {
        enrichedDevices.push(enrichedDevice);
      }
    }

    return enrichedDevices.slice(0, 20); // 闄愬埗杩斿洖鏁伴噺
  } catch (error) {
    console.error('鎼滅储璁惧閿欒:', error);
    return [];
  }
}

/**
 * 涓板瘜璁惧淇℃伅
 */
async function enrichDeviceInfo(supabase: any, device: any) {
  try {
    // 濡傛灉娌℃湁浜岀淮鐮両D锛屽皾璇曟煡    let qrcodeId = device.qrcodeId;
    if (!qrcodeId && device.productId) {
      const { data: qrcodeData } = await supabase
        .from('product_qrcodes')
        .select('qr_code_id')
        .eq('product_id', device.productId)
        .limit(1)
        .single();

      qrcodeId = qrcodeData.qr_code_id || null;
    }

    if (!qrcodeId) {
      return null; // 娌℃湁浜岀淮鐮佺殑璁惧涓嶆樉    }

    // 鑾峰彇璁惧妗ｆ淇℃伅
    const { data: profileData } = await supabase
      .from('device_profiles')
      .select(
        `
        current_status,
        total_repair_count,
        total_part_replacement_count,
        total_transfer_count,
        current_location,
        created_at,
        last_event_at,
        last_event_type
      `
      )
      .eq('qrcode_id', qrcodeId)
      .single();

    return {
      id: qrcodeId, // 浣跨敤浜岀淮鐮両D浣滀负鍞竴鏍囪瘑
      qrcodeId: qrcodeId,
      productModel: device.productModel,
      productName: device.productName,
      brandName: device.brandName,
      currentStatus: profileData.current_status || 'unknown',
      lastEventAt: profileData.last_event_at,
      lastEventType: profileData.last_event_type,
      totalRepairCount: profileData.total_repair_count || 0,
      totalPartReplacementCount: profileData.total_part_replacement_count || 0,
      totalTransferCount: profileData.total_transfer_count || 0,
      currentLocation: profileData.current_location,
      createdAt: profileData.created_at || new Date().toISOString(),
      source: device.source,
    };
  } catch (error) {
    console.error('涓板瘜璁惧淇℃伅閿欒:', error);
    // 鍗充娇鍑洪敊涔熻繑鍥炲熀鏈澶囦俊    return {
      id: device.qrcodeId || device.productId,
      qrcodeId: device.qrcodeId,
      productModel: device.productModel,
      productName: device.productName,
      brandName: device.brandName,
      currentStatus: 'unknown',
      totalRepairCount: 0,
      totalPartReplacementCount: 0,
      totalTransferCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
}

