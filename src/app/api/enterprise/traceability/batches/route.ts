import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取企业的所有溯源码批次
 * GET /api/enterprise/traceability/batches?enterprise_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get('enterprise_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID参数' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('enterprise_qr_batches')
      .select(
        `
        *,
        enterprise_qr_codes(count)
      `
      )
      .eq('enterprise_id', enterpriseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data?.map(batch => ({
        ...batch,
        generated_count: batch.enterprise_qr_codes?.[0]?.count || 0,
      })),
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('获取溯源码批次失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 创建新的溯源码批次
 * POST /api/enterprise/traceability/batches
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      enterprise_id,
      internal_code,
      product_name,
      product_model,
      category,
      quantity,
      format = 'png',
      size = 300,
      start_date,
      end_date,
    } = body;

    // 验证必填字段
    if (!enterprise_id || !internal_code || !product_name || !quantity) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 生成批次ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 创建批次记录
    const { data: batch, error: batchError } = await supabase
      .from('enterprise_qr_batches')
      .insert({
        batch_id: batchId,
        enterprise_id,
        internal_code,
        product_name,
        product_model,
        product_category: category,
        quantity,
        status: 'pending',
        config: {
          format,
          size,
          error_correction_level: 'M',
        },
        start_date,
        end_date,
      } as any)
      .select()
      .single();

    if (batchError) {
      throw batchError;
    }

    // 异步生成二维码
    generateQRCodes(batchId, {
      enterprise_id,
      internal_code,
      product_name,
      product_model,
      quantity,
      config: { format, size },
    }).catch(err => {
      console.error('生成二维码失败:', err);
      supabase
        .from('enterprise_qr_batches')
        .update({ status: 'failed' } as any)
        .eq('batch_id', batchId);
    });

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batchId,
        message: '批次创建成功，正在生成二维码',
      },
    });
  } catch (error) {
    console.error('创建溯源码批次失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 异步生成二维码
 */
async function generateQRCodes(batchId: string, params: any) {
  const { enterprise_id, internal_code, product_name, quantity, config } =
    params;

  try {
    // 更新批次状态为处理中
    await supabase
      .from('enterprise_qr_batches')
      .update({ status: 'processing' } as any)
      .eq('batch_id', batchId);

    // 生成二维码数据
    const codes = [];
    for (let i = 1; i <= quantity; i++) {
      const serialNumber = i.toString().padStart(6, '0');
      const productId = `${internal_code}_${serialNumber}`;
      const qrContent = `https://fx.cn/p/${productId}`;

      // 生成二维码图片（这里使用占位符，实际应使用二维码库）
      const qrImageBase64 = generatePlaceholderQR(productId, qrContent);

      codes.push({
        batch_id: batchId,
        enterprise_id,
        product_id: productId,
        internal_code,
        qr_content: qrContent,
        qr_image_base64: qrImageBase64,
        serial_number: serialNumber,
        format: config.format || 'png',
        size: config.size || 300,
        created_at: new Date().toISOString(),
      });
    }

    // 批量插入二维码
    const { error: insertError } = await supabase
      .from('enterprise_qr_codes')
      .insert(codes as any);

    if (insertError) {
      throw insertError;
    }

    // 更新批次状态和生成数量
    await supabase
      .from('enterprise_qr_batches')
      .update({
        status: 'completed',
        generated_count: quantity,
        completed_at: new Date().toISOString(),
      } as any)
      .eq('batch_id', batchId);

    // 为每个二维码创建统计记录
    const { data: qrCodes } = await supabase
      .from('enterprise_qr_codes')
      .select('id, product_id')
      .eq('batch_id', batchId);

    if (qrCodes) {
      const stats = qrCodes.map((qr: any) => ({
        batch_id: batchId,
        qr_code_id: qr.id,
        enterprise_id,
        product_id: qr.product_id,
        scan_count: 0,
        unique_scans: 0,
        daily_stats: {},
        regional_stats: {},
      }));

      await supabase.from('enterprise_qr_scan_statistics').insert(stats as any);
    }

    console.log(`批次 ${batchId} 生成完成，共 ${quantity} 个二维码`);
  } catch (error) {
    console.error(`批次 ${batchId} 生成失败:`, error);
    throw error;
  }
}

/**
 * 生成占位二维码（实际应使用二维码库）
 */
function generatePlaceholderQR(productId: string, content: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#ffffff"/>
      <rect x="20" y="20" width="160" height="160" fill="#000000"/>
      <text x="100" y="100" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="12">
        QR: ${productId}
      </text>
      <text x="100" y="120" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="8">
        ${content.substring(0, 30)}...
      </text>
    </svg>
  `
  ).toString('base64')}`;
}
