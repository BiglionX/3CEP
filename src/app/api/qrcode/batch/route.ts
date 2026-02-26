import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 获取批次列表
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("qr_batches")
      .select(`
        *,
        qr_codes(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取批次列表失败:", error);
      return NextResponse.json(
        { success: false, error: "获取批次列表失败" },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const batches = data?.map(batch => ({
      id: batch.id,
      batch_id: batch.batch_id,
      product_model: batch.product_model,
      product_category: batch.product_category,
      quantity: batch.quantity,
      generated_count: batch.qr_codes?.[0]?.count || 0,
      status: batch.status,
      created_at: batch.created_at,
      completed_at: batch.completed_at,
      config: batch.config
    })) || [];

    return NextResponse.json({
      success: true,
      data: batches
    });

  } catch (error) {
    console.error("获取批次列表异常:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 创建新批次
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productModel,
      productCategory,
      brandId,
      productName,
      quantity,
      config = {},
      startDate,
      endDate
    } = body;

    // 验证必要参数
    if (!productModel || !productCategory || !brandId || !productName || !quantity) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 生成唯一批次ID
    const batchId = `batch_${uuidv4().replace(/-/g, "")}_${Date.now()}`;

    // 创建批次记录
    const { data: batch, error: batchError } = await supabase
      .from("qr_batches")
      .insert({
        batch_id: batchId,
        product_model: productModel,
        product_category: productCategory,
        brand_id: brandId,
        product_name: productName,
        quantity: quantity,
        status: "pending",
        config: {
          format: config.format || "png",
          size: config.size || 300,
          errorCorrection: config.errorCorrection || "M"
        } as any,
        start_date: startDate,
        end_date: endDate
      })
      .select()
      .single();

    if (batchError) {
      console.error("创建批次失败:", batchError);
      return NextResponse.json(
        { success: false, error: "创建批次失败" },
        { status: 500 }
      );
    }

    // 异步生成二维码（不阻塞响应）
    generateBatchCodes(batchId, {
      productModel,
      productCategory,
      brandId,
      productName,
      quantity,
      config,
      startDate,
      endDate
    }).catch(err => {
      console.error("异步生成二维码失败:", err);
      // 更新批次状态为失败
      supabase
        .from("qr_batches")
        .update({ status: "failed" } as any)
        .eq("batch_id", batchId);
    });

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batchId,
        message: "批次创建成功，正在后台生成二维码"
      }
    });

  } catch (error) {
    console.error("创建批次异常:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 异步生成批次二维码
async function generateBatchCodes(
  batchId: string,
  params: any
) {
  const {
    productModel,
    productCategory,
    brandId,
    productName,
    quantity,
    config,
    startDate,
    endDate
  } = params;

  try {
    // 更新批次状态为处理中
    await supabase
      .from("qr_batches")
      .update({ status: "processing" } as any)
      .eq("batch_id", batchId);

    // 生成指定数量的二维码
    const codes = [];
    for (let i = 1; i <= quantity; i++) {
      const serialNumber = i.toString().padStart(6, '0');
      const productId = `${productModel}_${serialNumber}`;
      const qrContent = `https://fx.cn/p/${productId}`;
      
      // 生成二维码Base64（这里使用占位符，实际应该调用二维码生成服务）
      const qrImageBase64 = generatePlaceholderQR(productId, qrContent);

      codes.push({
        batch_id: batchId,
        product_id: productId,
        qr_content: qrContent,
        qr_image_base64: qrImageBase64,
        serial_number: serialNumber,
        format: config.format || "png",
        size: config.size || 300,
        created_at: new Date().toISOString()
      });
    }

    // 批量插入二维码记录
    const { error: insertError } = await supabase
      .from("qr_codes")
      .insert(codes);

    if (insertError) {
      throw new Error(`插入二维码记录失败: ${insertError.message}`);
    }

    // 更新批次状态为完成
    await supabase
      .from("qr_batches")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString()
      } as any)
      .eq("batch_id", batchId);

    console.log(`批次 ${batchId} 生成完成，共 ${quantity} 个二维码`);

  } catch (error) {
    console.error(`批次 ${batchId} 生成失败:`, error);
    // 更新批次状态为失败
    await supabase
      .from("qr_batches")
      .update({ status: "failed" } as any)
      .eq("batch_id", batchId);
    throw error;
  }
}

// 生成占位二维码（实际应该使用二维码库）
function generatePlaceholderQR(productId: string, content: string): string {
  // 这里应该使用真正的二维码生成库，如 qrcode 或 qr-image
  // 目前返回一个简单的SVG占位符
  return `data:image/svg+xml;base64,${Buffer.from(`
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
  `).toString('base64')}`;
}