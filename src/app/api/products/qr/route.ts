import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 浜у搧浜岀淮鐮佺敓鎴怉PI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 鏀寔鍗曚釜浜у搧鍜屾壒閲忎骇    const { productId, brandId, productName, productModel, products } = body;

    // 濡傛灉鏄壒閲忚    if (products && Array.isArray(products)) {
      return await handleBatchGeneration(products);
    }

    // 鍗曚釜浜у搧鐢熸垚
    // 楠岃瘉蹇呰鍙傛暟
    if (!productId || !brandId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟锛歱roductId brandId' },
        { status: 400 }
      );
    }

    // 鐢熸垚鍞竴鐨勪骇鍝乁RL
    const productUrl = `https://fx.cn/p/${productId}`;

    // 鐢熸垚浜岀淮鐮佸崰浣嶇锛堝疄闄呴」鐩腑搴斾娇鐢╭rcode搴擄級
    const qrCodeDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zemVtIj5RUiBjb2RlIGZvciBQcm9kdWN0OiAke3Byb2R1Y3RJZH08L3RleHQ+PC9zdmc+`;

    // 淇濆浜у搧淇℃伅鍒版暟鎹簱
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        id: productId,
        brand_id: brandId,
        name: productName || '鏈懡鍚嶄骇,
        model: productModel || '',
        qr_url: productUrl,
        created_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('浜у搧淇℃伅淇濆澶辫触:', insertError);
      return NextResponse.json({ error: '浜у搧淇℃伅淇濆澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      productUrl,
      qrCode: qrCodeDataUrl,
      message: '浜岀淮鐮佺敓鎴愭垚,
    }) as any;
  } catch (error) {
    console.error('浜岀淮鐮佺敓鎴愰敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// 澶勭悊鎵归噺鐢熸垚
async function handleBatchGeneration(products: any[]) {
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { error: '璇彁渚涙湁鏁堢殑浜у搧鍒楄〃' },
      { status: 400 }
    );
  }

  const results = [];

  for (const product of products) {
    try {
      const productUrl = `https://fx.cn/p/${product.productId}`;

      // 鐢熸垚浜岀淮鐮佸崰浣嶇
      const qrCodeDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zemVtIj5RUiBjb2RlIGZvciBQcm9kdWN0OiAke3Byb2R1Y3RJZH08L3RleHQ+PC9zdmc+`;

      // 淇濆鍒版暟鎹簱
      const { data: savedProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          id: product.productId,
          brand_id: product.brandId,
          name: product.productName || '鏈懡鍚嶄骇,
          model: product.productModel || '',
          qr_url: productUrl,
          created_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (insertError) {
        results.push({
          productId: product.productId,
          success: false,
          error: insertError.message,
        }) as any;
      } else {
        results.push({
          productId: savedProduct.id,
          success: true,
          productUrl,
          qrCode: qrCodeDataUrl,
        });
      }
    } catch (err) {
      results.push({
        productId: product.productId,
        success: false,
        error: err instanceof Error  err.message : '鏈煡閿欒',
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    message: `澶勭悊瀹屾垚锛屾垚${results.filter(r => r.success).length} 涓紝澶辫触 ${results.filter(r => !r.success).length} 涓猔,
  });
}

