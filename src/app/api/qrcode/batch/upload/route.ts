import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

// 鍒濆鍖朣upabase瀹㈡埛
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 涓婁紶CSV鏂囦欢骞惰В
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "璇烽€夋嫨瑕佷笂犵殑鏂囦欢" },
        { status: 400 }
      );
    }

    // 妫€鏌ユ枃剁被
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: "鍙敮鎸丆SV鏍煎紡鏂囦欢" },
        { status: 400 }
      );
    }

    // 璇诲彇鏂囦欢鍐呭
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString('utf-8');

    // 瑙ｆ瀽CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: "CSV鏂囦欢涓虹┖鎴栨牸寮忎笉姝ｇ‘" },
        { status: 400 }
      );
    }

    // 楠岃瘉蹇呴渶瀛楁
    const requiredFields = ['浜у搧鍨嬪彿', '浜у搧绫诲埆', '鍝佺墝ID', '浜у搧鍚嶇О', '鏁伴噺'];
    const firstRecord = records[0];
    const missingFields = requiredFields.filter(field => !(field in firstRecord));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `缂哄皯蹇呴渶瀛楁: ${missingFields.join(', ')}`,
          required_fields: requiredFields
        },
        { status: 400 }
      );
    }

    // 澶勭悊姣忎釜璁板綍
    const batchResults = [];
    let parsedCount = 0;

    for (const record of records) {
      try {
        const productModel = record['浜у搧鍨嬪彿'].trim();
        const productCategory = record['浜у搧绫诲埆'].trim();
        const brandId = record['鍝佺墝ID'].trim();
        const productName = record['浜у搧鍚嶇О'].trim();
        const quantity = parseInt(record['鏁伴噺'].trim() || '0');
        
        // 鍙€夊瓧
        const format = record['鏍煎紡'].trim() || 'png';
        const size = parseInt(record['灏哄'].trim() || '300');
        const errorCorrection = record['绾犻敊绛夌骇'].trim() || 'M';

        // 楠岃瘉蹇呴渶瀛楁
        if (!productModel || !productCategory || !brandId || !productName || isNaN(quantity) || quantity <= 0) {
          console.warn("璺宠繃犳晥璁板綍:", record);
          continue;
        }

        // 鐢熸垚鎵规ID
        const batchId = `batch_${uuidv4().replace(/-/g, "")}_${Date.now()}`;

        // 鍒涘缓鎵规璁板綍
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
          }) as any
          .select()
          .single();

        if (batchError) {
          console.error("鍒涘缓鎵规澶辫触:", batchError);
          continue;
        }

        // 寮傛鐢熸垚浜岀淮
        generateBatchCodes(batchId, {
          productModel,
          productCategory,
          brandId,
          productName,
          quantity,
          config: { format, size, errorCorrection }
        }).catch(err => {
          console.error("寮傛鐢熸垚澶辫触:", err);
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
        console.error("澶勭悊璁板綍澶辫触:", recordError);
        continue;
      }
    }

    if (parsedCount === 0) {
      return NextResponse.json(
        { success: false, error: "娌℃湁鏈夋晥鐨勮褰曞彲渚涘 },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      parsedCount: parsedCount,
      batchCount: batchResults.length,
      batches: batchResults,
      message: `鎴愬姛鍒涘缓 ${batchResults.length} 涓壒娆★紝姝ｅ湪鍚庡彴鐢熸垚浜岀淮鐮乣
    });

  } catch (error) {
    console.error("CSV涓婁紶澶勭悊澶辫触:", error);
    return NextResponse.json(
      { success: false, error: "鏂囦欢澶勭悊澶辫触" },
      { status: 500 }
    );
  }
}

// 寮傛鐢熸垚鎵规浜岀淮鐮侊紙澶嶇敤涔嬪墠鐨勫嚱鏁帮級
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
    // 鏇存柊鎵规鐘舵€佷负澶勭悊
    await supabase
      .from("qr_batches")
      .update({ status: "processing" } as any)
      .eq("batch_id", batchId);

    // 鐢熸垚鎸囧畾鏁伴噺鐨勪簩缁寸爜
    const codes = [];
    for (let i = 1; i <= quantity; i++) {
      const serialNumber = i.toString().padStart(6, '0');
      const productId = `${productModel}_${serialNumber}`;
      const qrContent = `https://fx.cn/p/${productId}`;
      
      // 鐢熸垚浜岀淮鐮丅ase64
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

    // 鎵归噺鎻掑叆浜岀淮鐮佽
    const { error: insertError } = await supabase
      .from("qr_codes")
      .insert(codes);

    if (insertError) {
      throw new Error(`鎻掑叆浜岀淮鐮佽褰曞け ${insertError.message}`);
    }

    // 鏇存柊鎵规鐘舵€佷负瀹屾垚
    await supabase
      .from("qr_batches")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString()
      } as any)
      .eq("batch_id", batchId);

    console.log(`鎵规 ${batchId} 鐢熸垚瀹屾垚锛屽叡 ${quantity} 涓簩缁寸爜`);

  } catch (error) {
    console.error(`鎵规 ${batchId} 鐢熸垚澶辫触:`, error);
    // 鏇存柊鎵规鐘舵€佷负澶辫触
    await supabase
      .from("qr_batches")
      .update({ status: "failed" } as any)
      .eq("batch_id", batchId);
    throw error;
  }
}

// 鐢熸垚鍗犱綅浜岀淮
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
