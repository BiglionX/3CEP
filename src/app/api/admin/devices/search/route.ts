/**
 * 管理后台设备搜索API
 * 提供设备搜索功能接口
 */
import { Database } from '@/lib/database.types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供搜索关键词' },
        { status: 400 }
      );
    }

    const trimmedSearch = searchTerm.trim();

    // 在多个表中搜索设备
    const devices = await searchDevices(supabase, trimmedSearch);

    return NextResponse.json({
      success: true,
      data: {
        searchTerm: trimmedSearch,
        devices: devices,
        totalCount: devices.length,
      },
      message: `找到 ${devices.length} 个匹配的设备`,
    });
  } catch (error) {
    console.error('设备搜索错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '设备搜索失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 搜索设备的主要逻辑
 */
async function searchDevices(supabase: any, searchTerm: string) {
  try {
    // 1. 在设备二维码表中搜索
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
      console.error('二维码搜索错误:', qrcodeError);
    }

    // 2. 在产品表中搜索型号和名称
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
      console.error('产品搜索错误:', productError);
    }

    // 3. 合并和去重结果
    const allResults = new Map();

    // 处理二维码搜索结果
    if (qrcodeResults) {
      qrcodeResults.forEach((item: any) => {
        const key = item.qr_code_id;
        if (!allResults.has(key)) {
          allResults.set(key, {
            qrcodeId: item.qr_code_id,
            productId: item.products?.id,
            productModel: item.products?.model,
            productName: item.products?.name,
            brandName: item.brands?.name || item.products?.brands?.name,
            source: 'qrcode',
          });
        }
      });
    }

    // 处理产品搜索结果
    if (productResults) {
      productResults.forEach((item: any) => {
        // 查找关联的二维码
        const key = `${item.id}-${item.model}`;
        if (!allResults.has(key)) {
          allResults.set(key, {
            qrcodeId: null, // 需要进一步查询具体的二维码
            productId: item.id,
            productModel: item.model,
            productName: item.name,
            brandName: item.brands?.name,
            source: 'product',
          });
        }
      });
    }

    // 4. 补充设备档案信息
    const enrichedDevices = [];
    for (const [_, device] of allResults) {
      const enrichedDevice = await enrichDeviceInfo(supabase, device);
      if (enrichedDevice) {
        enrichedDevices.push(enrichedDevice);
      }
    }

    return enrichedDevices.slice(0, 20); // 限制返回数量
  } catch (error) {
    console.error('搜索设备错误:', error);
    return [];
  }
}

/**
 * 丰富设备信息
 */
async function enrichDeviceInfo(supabase: any, device: any) {
  try {
    // 如果没有二维码ID，尝试查找
    let qrcodeId = device.qrcodeId;
    if (!qrcodeId && device.productId) {
      const { data: qrcodeData } = await supabase
        .from('product_qrcodes')
        .select('qr_code_id')
        .eq('product_id', device.productId)
        .limit(1)
        .single();

      qrcodeId = qrcodeData?.qr_code_id || null;
    }

    if (!qrcodeId) {
      return null; // 没有二维码的设备不显示
    }

    // 获取设备档案信息
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
      id: qrcodeId, // 使用二维码ID作为唯一标识
      qrcodeId: qrcodeId,
      productModel: device.productModel,
      productName: device.productName,
      brandName: device.brandName,
      currentStatus: profileData?.current_status || 'unknown',
      lastEventAt: profileData?.last_event_at,
      lastEventType: profileData?.last_event_type,
      totalRepairCount: profileData?.total_repair_count || 0,
      totalPartReplacementCount: profileData?.total_part_replacement_count || 0,
      totalTransferCount: profileData?.total_transfer_count || 0,
      currentLocation: profileData?.current_location,
      createdAt: profileData?.created_at || new Date().toISOString(),
      source: device.source,
    };
  } catch (error) {
    console.error('丰富设备信息错误:', error);
    // 即使出错也返回基本设备信息
    return {
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
