import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 上传CSV文件并解析
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: "只支持CSV格式文件" },
        { status: 400 }
      );
    }

    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString('utf-8');

    // 解析CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: "CSV文件为空或格式不正确" },
        { status: 400 }
      );
    }

    // 验证必需字段
    const requiredFields = ['产品型号', '产品类别', '品牌ID', '产品名称', '数量'];
    const firstRecord = records[0];
    const missingFields = requiredFields.filter(field => !(field in firstRecord));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `缺少必需字段: ${missingFields.join(', ')}`,
          required_fields: requiredFields
        },
        { status: 400 }
      );
    }

    // 处理每个记录
    const batchResults = [];
    let parsedCount = 0;

    for (const record of records) {
      try {
        const productModel = record['产品型号']?.trim();
        const productCategory = record['产品类别']?.trim();
        const brandId = record['品牌ID']?.trim();
        const productName = record['产品名称']?.trim();
        const quantity = parseInt(record['数量']?.trim() || '0');
        
        // 可选字段
        const format = record['格式']?.trim() || 'png';
        const size = parseInt(record['尺寸']?.trim() || '300');
        const errorCorrection = record['纠错等级']?.trim() || 'M';

        // 验证必需字段
        if (!productModel || !productCategory || !brandId || !productName || isNaN(quantity) || quantity <= 0) {
          console.warn("跳过无效记录:", record);
          continue;
        }

        // 生成批次ID
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
              format,
              size,
              errorCorrection
            } as any
          })
          .select()
          .single();

        if (batchError) {
          console.error("创建批次失败:", batchError);
          continue;
        }

        // 异步生成二维码
        generateBatchCodes(batchId, {
          productModel,
          productCategory,
          brandId,
          productName,
          quantity,
          config: { format, size, errorCorrection }
        }).catch(err => {
          console.error("异步生成失败:", err);
          supabase
            .from("qr_batches")
            .update({ status: "failed" } as any)
            .eq("batch_id", batchId);
        });

        batchResults.push({
          batch_id: batchId,
          product_model: productModel,
          quantity: quantity,
          status: "created"
        });
        
        parsedCount++;

      } catch (recordError) {
        console.error("处理记录失败:", recordError);
        continue;
      }
    }

    if (parsedCount === 0) {
      return NextResponse.json(
        { success: false, error: "没有有效的记录可供处理" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      parsedCount: parsedCount,
      batchCount: batchResults.length,
      batches: batchResults,
      message: `成功创建 ${batchResults.length} 个批次，正在后台生成二维码`
    });

  } catch (error) {
    console.error("CSV上传处理失败:", error);
    return NextResponse.json(
      { success: false, error: "文件处理失败" },
      { status: 500 }
    );
  }
}

// 异步生成批次二维码（复用之前的函数）
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
    config
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
      
      // 生成二维码Base64
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

// 生成占位二维码
function generatePlaceholderQR(productId: string, content: string): string {
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