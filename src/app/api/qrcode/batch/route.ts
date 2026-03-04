import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

// 鍒濆鍖朣upabase瀹㈡埛?
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鑾峰彇鎵规鍒楄〃
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
      console.error("鑾峰彇鎵规鍒楄〃澶辫触:", error);
      return NextResponse.json(
        { success: false, error: "鑾峰彇鎵规鍒楄〃澶辫触" },
        { status: 500 }
      );
    }

    // 鏍煎紡鍖栬繑鍥炴暟?
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
    console.error("鑾峰彇鎵规鍒楄〃寮傚父:", error);
    return NextResponse.json(
      { success: false, error: "鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

// 鍒涘缓鏂版壒?
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

    // 楠岃瘉蹇呰鍙傛暟
    if (!productModel || !productCategory || !brandId || !productName || !quantity) {
      return NextResponse.json(
        { success: false, error: "缂哄皯蹇呰鍙傛暟" },
        { status: 400 }
      );
    }

    // 鐢熸垚鍞竴鎵规ID
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
          format: config.format || "png",
          size: config.size || 300,
          errorCorrection: config.errorCorrection || "M"
        } as any,
        start_date: startDate,
        end_date: endDate
      }) as any
      .select()
      .single();

    if (batchError) {
      console.error("鍒涘缓鎵规澶辫触:", batchError);
      return NextResponse.json(
        { success: false, error: "鍒涘缓鎵规澶辫触" },
        { status: 500 }
      );
    }

    // 寮傛鐢熸垚浜岀淮鐮侊紙涓嶉樆濉炲搷搴旓級
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
      console.error("寮傛鐢熸垚浜岀淮鐮佸け?", err);
      // 鏇存柊鎵规鐘舵€佷负澶辫触
      supabase
        .from("qr_batches")
        .update({ status: "failed" } as any)
        .eq("batch_id", batchId);
    });

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batchId,
        message: "鎵规鍒涘缓鎴愬姛锛屾鍦ㄥ悗鍙扮敓鎴愪簩缁寸爜"
      }
    });

  } catch (error) {
    console.error("鍒涘缓鎵规寮傚父:", error);
    return NextResponse.json(
      { success: false, error: "鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

// 寮傛鐢熸垚鎵规浜岀淮?
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
    // 鏇存柊鎵规鐘舵€佷负澶勭悊?
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
      
      // 鐢熸垚浜岀淮鐮丅ase64锛堣繖閲屼娇鐢ㄥ崰浣嶇锛屽疄闄呭簲璇ヨ皟鐢ㄤ簩缁寸爜鐢熸垚鏈嶅姟?
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

    // 鎵归噺鎻掑叆浜岀淮鐮佽?
    const { error: insertError } = await supabase
      .from("qr_codes")
      .insert(codes);

    if (insertError) {
      throw new Error(`鎻掑叆浜岀淮鐮佽褰曞け? ${insertError.message}`);
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

// 鐢熸垚鍗犱綅浜岀淮鐮侊紙瀹為檯搴旇浣跨敤浜岀淮鐮佸簱?
function generatePlaceholderQR(productId: string, content: string): string {
  // 杩欓噷搴旇浣跨敤鐪熸鐨勪簩缁寸爜鐢熸垚搴擄紝锟?qrcode 锟?qr-image
  // 鐩墠杩斿洖涓€涓畝鍗曠殑SVG鍗犱綅?
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
