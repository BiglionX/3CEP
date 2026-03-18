import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 绑定序列号与溯源码
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { qrCodeId, serialNumber, productId } = body;

    if (!qrCodeId || !serialNumber) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 获取企业信息
    const { data: enterprise } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!enterprise) {
      return NextResponse.json({ error: '企业信息不存在' }, { status: 404 });
    }

    // 检查溯源码是否存在且属于该企业
    const { data: qrCode } = await supabase
      .from('enterprise_qr_codes')
      .select('id, serial_number')
      .eq('id', qrCodeId)
      .eq('enterprise_id', enterprise.id)
      .single();

    if (!qrCode) {
      return NextResponse.json({ error: '溯源码不存在' }, { status: 404 });
    }

    // 检查序列号是否已被使用
    if (qrCode.serial_number) {
      return NextResponse.json({ error: '该溯源码已绑定序列号' }, { status: 400 });
    }

    // 检查序列号是否已被其他溯源码使用
    const { data: existing } = await supabase
      .from('enterprise_qr_codes')
      .select('id')
      .eq('serial_number', serialNumber)
      .eq('enterprise_id', enterprise.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: '该序列号已被其他溯源码使用' }, { status: 400 });
    }

    // 更新溯源码绑定序列号
    const { error: updateError } = await supabase
      .from('enterprise_qr_codes')
      .update({
        serial_number: serialNumber,
        product_id: productId || qrCodeId
      })
      .eq('id', qrCodeId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: '绑定失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '序列号绑定成功'
    });

  } catch (error) {
    console.error('Error binding serial number:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 批量导入序列号与溯源码对应关系
export async function PUT(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { mappings } = body; // [{ qrCodeId, serialNumber, productId }, ...]

    if (!mappings || !Array.isArray(mappings)) {
      return NextResponse.json({ error: '缺少映射数据' }, { status: 400 });
    }

    // 获取企业信息
    const { data: enterprise } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!enterprise) {
      return NextResponse.json({ error: '企业信息不存在' }, { status: 404 });
    }

    // 批量更新
    const results = [];
    for (const mapping of mappings) {
      const { qrCodeId, serialNumber, productId } = mapping;

      if (!qrCodeId || !serialNumber) {
        results.push({ qrCodeId, success: false, error: '缺少参数' });
        continue;
      }

      const { error } = await supabase
        .from('enterprise_qr_codes')
        .update({
          serial_number: serialNumber,
          product_id: productId || qrCodeId
        })
        .eq('id', qrCodeId)
        .eq('enterprise_id', enterprise.id);

      results.push({
        qrCodeId,
        success: !error,
        error: error ? '更新失败' : null
      });
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: mappings.length,
        success: successCount,
        failed: mappings.length - successCount
      }
    });

  } catch (error) {
    console.error('Error batch binding serial numbers:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
