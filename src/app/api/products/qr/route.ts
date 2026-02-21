import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 产品二维码生成API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 支持单个产品和批量产品
    const { productId, brandId, productName, productModel, products } = body;

    // 如果是批量请求
    if (products && Array.isArray(products)) {
      return await handleBatchGeneration(products);
    }

    // 单个产品生成
    // 验证必要参数
    if (!productId || !brandId) {
      return NextResponse.json(
        { error: '缺少必要参数：productId 和 brandId' },
        { status: 400 }
      );
    }

    // 生成唯一的产品URL
    const productUrl = `https://fx.cn/p/${productId}`;
    
    // 生成二维码占位符（实际项目中应使用qrcode库）
    const qrCodeDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zemVtIj5RUiBjb2RlIGZvciBQcm9kdWN0OiAke3Byb2R1Y3RJZH08L3RleHQ+PC9zdmc+`;

    // 保存产品信息到数据库
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        id: productId,
        brand_id: brandId,
        name: productName || '未命名产品',
        model: productModel || '',
        qr_url: productUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('产品信息保存失败:', insertError);
      return NextResponse.json(
        { error: '产品信息保存失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      productUrl,
      qrCode: qrCodeDataUrl,
      message: '二维码生成成功'
    });

  } catch (error) {
    console.error('二维码生成错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 处理批量生成
async function handleBatchGeneration(products: any[]) {
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { error: '请提供有效的产品列表' },
      { status: 400 }
    );
  }

  const results = [];

  for (const product of products) {
    try {
      const productUrl = `https://fx.cn/p/${product.productId}`;
      
      // 生成二维码占位符
      const qrCodeDataUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zemVtIj5RUiBjb2RlIGZvciBQcm9kdWN0OiAke3Byb2R1Y3RJZH08L3RleHQ+PC9zdmc+`;

      // 保存到数据库
      const { data: savedProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          id: product.productId,
          brand_id: product.brandId,
          name: product.productName || '未命名产品',
          model: product.productModel || '',
          qr_url: productUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        results.push({
          productId: product.productId,
          success: false,
          error: insertError.message
        });
      } else {
        results.push({
          productId: savedProduct.id,
          success: true,
          productUrl,
          qrCode: qrCodeDataUrl
        });
      }
    } catch (err) {
      results.push({
        productId: product.productId,
        success: false,
        error: err instanceof Error ? err.message : '未知错误'
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    message: `处理完成，成功 ${results.filter(r => r.success).length} 个，失败 ${results.filter(r => !r.success).length} 个`
  });
}