import {
  ProductInfo,
  QRCodeConfig,
  qrcodeService,
} from "@/services/qrcode.service";
import { NextRequest, NextResponse } from "next/server";

// 产品二维码生成API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 支持单个产品和批量产品
    const {
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

    // 如果是批量请求
    if (products && Array.isArray(products)) {
      return await handleBatchGeneration(products, config);
    }

    // 单个产品生成
    // 验证必要参数
    if (!productId || !brandId || !productName) {
      return NextResponse.json(
        { error: "缺少必要参数：productId、brandId 和 productName" },
        { status: 400 }
      );
    }

    // 构造产品信息
    const productInfo: ProductInfo = {
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

    // 生成二维码
    const result = await qrcodeService.generateQRCode(productInfo, config);

    return NextResponse.json({
      success: true,
      qrCodeId: result.qrCodeId,
      productId: result.productId,
      qrContent: result.qrContent,
      qrImageBase64: result.qrImageBase64,
      format: result.format,
      size: result.size,
      message: "二维码生成成功",
    });
  } catch (error) {
    console.error("二维码生成错误:", error);
    return NextResponse.json(
      { error: (error as Error).message || "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 处理批量生成
async function handleBatchGeneration(products: any[], config: QRCodeConfig) {
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { error: "请提供有效的产品列表" },
      { status: 400 }
    );
  }

  const results = [];

  for (const product of products) {
    try {
      // 验证必要参数
      if (!product.productId || !product.brandId || !product.productName) {
        results.push({
          productId: product.productId,
          success: false,
          error: "缺少必要参数",
        });
        continue;
      }

      // 构造产品信息
      const productInfo: ProductInfo = {
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

      // 生成二维码
      const result = await qrcodeService.generateQRCode(productInfo, config);

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
        error: err instanceof Error ? err.message : "未知错误",
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    summary: {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    },
    message: `批量处理完成，成功 ${
      results.filter((r) => r.success).length
    } 个，失败 ${results.filter((r) => !r.success).length} 个`,
  });
}

// 获取二维码信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get("qrCodeId");
    const productId = searchParams.get("productId");

    if (qrCodeId) {
      // 根据二维码ID获取信息
      const qrCode = await qrcodeService.getQRCodeById(qrCodeId);
      return NextResponse.json({
        success: true,
        data: qrCode,
      });
    } else if (productId) {
      // 获取产品所有二维码
      const qrcodes = await qrcodeService.getProductQRCodes(productId);
      return NextResponse.json({
        success: true,
        data: qrcodes,
      });
    } else {
      return NextResponse.json(
        { error: "请提供 qrCodeId 或 productId 参数" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("获取二维码信息错误:", error);
    return NextResponse.json(
      { error: (error as Error).message || "服务器内部错误" },
      { status: 500 }
    );
  }
}
