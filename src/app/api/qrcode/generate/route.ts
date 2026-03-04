import {
  ProductInfo,
  QRCodeConfig,
  qrcodeService,
} from '@/services/qrcode.service';
import { NextRequest, NextResponse } from 'next/server';

// 浜у搧浜岀淮鐮佺敓鎴怉PI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 鏀寔鍗曚釜浜у搧鍜屾壒閲忎骇?    const {
      productId,
      brandId,
      productName,
      productModel,
      productCategory,
      batchNumber,
      manufacturingDate,
      warrantyPeriod,
      specifications,
      products,
      config = {},
    } = body;

    // 濡傛灉鏄壒閲忚?    if (products && Array.isArray(products)) {
      return await handleBatchGeneration(products, config);
    }

    // 鍗曚釜浜у搧鐢熸垚
    // 楠岃瘉蹇呰鍙傛暟
    if (!productId || !brandId || !productName) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟锛歱roductId銆乥randId 锟?productName' },
        { status: 400 }
      );
    }

    // 鏋勯€犱骇鍝佷俊?    const productInfo: ProductInfo = {
      productId,
      brandId,
      productName,
      productModel,
      productCategory,
      batchNumber,
      manufacturingDate,
      warrantyPeriod,
      specifications,
    };

    // 鐢熸垚浜岀淮?    const result = await qrcodeService.generateQRCode(productInfo, config);

    return NextResponse.json({
      success: true,
      qrCodeId: result.qrCodeId,
      productId: result.productId,
      qrContent: result.qrContent,
      qrImageBase64: result.qrImageBase64,
      format: result.format,
      size: result.size,
      message: '浜岀淮鐮佺敓鎴愭垚?,
    });
  } catch (error) {
    console.error('浜岀淮鐮佺敓鎴愰敊?', error);
    return NextResponse.json(
      { error: (error as Error).message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

// 澶勭悊鎵归噺鐢熸垚
async function handleBatchGeneration(products: any[], config: QRCodeConfig) {
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { error: '璇锋彁渚涙湁鏁堢殑浜у搧鍒楄〃' },
      { status: 400 }
    );
  }

  const results = [];

  for (const product of products) {
    try {
      // 楠岃瘉蹇呰鍙傛暟
      if (!product.productId || !product.brandId || !product.productName) {
        results.push({
          productId: product.productId,
          success: false,
          error: '缂哄皯蹇呰鍙傛暟',
        });
        continue;
      }

      // 鏋勯€犱骇鍝佷俊?      const productInfo: ProductInfo = {
        productId: product.productId,
        brandId: product.brandId,
        productName: product.productName,
        productModel: product.productModel,
        productCategory: product.productCategory,
        batchNumber: product.batchNumber,
        manufacturingDate: product.manufacturingDate,
        warrantyPeriod: product.warrantyPeriod,
        specifications: product.specifications,
      };

      // 鐢熸垚浜岀淮?      const result = await qrcodeService.generateQRCode(productInfo, config);

      results.push({
        productId: result.productId,
        qrCodeId: result.qrCodeId,
        success: true,
        qrContent: result.qrContent,
        qrImageBase64: result.qrImageBase64,
        format: result.format,
        size: result.size,
      });
    } catch (err) {
      results.push({
        productId: product.productId,
        success: false,
        error: err instanceof Error ? err.message : '鏈煡閿欒',
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    summary: {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
    message: `鎵归噺澶勭悊瀹屾垚锛屾垚?${
      results.filter(r => r.success).length
    } 涓紝澶辫触 ${results.filter(r => !r.success).length} 涓猔,
  });
}

// 鑾峰彇浜岀淮鐮佷俊?export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get('qrCodeId');
    const productId = searchParams.get('productId');

    if (qrCodeId) {
      // 鏍规嵁浜岀淮鐮両D鑾峰彇淇℃伅
      const qrCode = await qrcodeService.getQRCodeById(qrCodeId);
      return NextResponse.json({
        success: true,
        data: qrCode,
      });
    } else if (productId) {
      // 鑾峰彇浜у搧鎵€鏈変簩缁寸爜
      const qrcodes = await qrcodeService.getProductQRCodes(productId);
      return NextResponse.json({
        success: true,
        data: qrcodes,
      });
    } else {
      return NextResponse.json(
        { error: '璇锋彁?qrCodeId 锟?productId 鍙傛暟' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('鑾峰彇浜岀淮鐮佷俊鎭敊?', error);
    return NextResponse.json(
      { error: (error as Error).message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

