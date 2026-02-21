import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import sharp from "sharp";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// 二维码生成配置接口
export interface QRCodeConfig {
  format?: "png" | "svg";
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  color?: {
    dark?: string; // 前景色
    light?: string; // 背景色
  };
}

// 产品信息接口
export interface ProductInfo {
  productId: string;
  brandId: string;
  productName: string;
  productModel?: string;
  productCategory?: string;
  batchNumber?: string; // 出厂批次
  manufacturingDate?: string;
  warrantyPeriod?: string;
  specifications?: Record<string, any>;
}

// 生成结果接口
export interface QRCodeResult {
  qrCodeId: string;
  productId: string;
  qrContent: string;
  qrImageUrl?: string;
  qrImageBase64?: string;
  format: string;
  size: number;
}

export class QRCodeService {
  private static instance: QRCodeService;

  private constructor() {}

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  /**
   * 为单个产品生成二维码
   */
  async generateQRCode(
    productInfo: ProductInfo,
    config: QRCodeConfig = {}
  ): Promise<QRCodeResult> {
    try {
      // 生成唯一二维码ID
      const qrCodeId = this.generateUniqueQRCodeId(productInfo.productId);

      // 构造二维码内容（产品页面URL）
      const qrContent = this.buildQRContent(productInfo);

      // 合并默认配置
      const mergedConfig = this.mergeConfig(config);

      // 生成二维码图片
      let qrImageData: Buffer | string;

      if (mergedConfig.format === "svg") {
        qrImageData = await this.generateSVGQRCode(qrContent, mergedConfig);
      } else {
        qrImageData = await this.generatePNGQRCode(qrContent, mergedConfig);
      }

      // 转换为Base64
      const base64Data = this.convertToBase64(qrImageData, mergedConfig.format);

      // 保存到数据库
      const dbResult = await this.saveQRCodeToDatabase(
        qrCodeId,
        productInfo.productId,
        qrContent,
        base64Data,
        mergedConfig
      );

      return {
        qrCodeId,
        productId: productInfo.productId,
        qrContent,
        qrImageBase64: base64Data,
        format: mergedConfig.format,
        size: mergedConfig.size,
      };
    } catch (error) {
      console.error("二维码生成失败:", error);
      throw new Error(`二维码生成失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量生成二维码
   */
  async generateBatchQRCode(
    products: ProductInfo[],
    config: QRCodeConfig = {}
  ): Promise<QRCodeResult[]> {
    const results: QRCodeResult[] = [];

    for (const product of products) {
      try {
        const result = await this.generateQRCode(product, config);
        results.push(result);
      } catch (error) {
        console.error(`产品 ${product.productId} 二维码生成失败:`, error);
        // 继续处理下一个产品
      }
    }

    return results;
  }

  /**
   * 获取二维码信息
   */
  async getQRCodeById(qrCodeId: string): Promise<any> {
    const { data, error } = await supabase
      .from("product_qrcodes")
      .select(
        `
        *,
        products (
          id,
          name,
          model,
          category,
          brands (
            id,
            name
          )
        )
      `
      )
      .eq("qr_code_id", qrCodeId)
      .single();

    if (error) {
      throw new Error(`查询二维码失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取产品的所有二维码
   */
  async getProductQRCodes(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("product_qrcodes")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`查询产品二维码失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 更新二维码统计信息
   */
  async updateScanStatistics(qrCodeId: string): Promise<void> {
    try {
      // 获取当前统计信息
      const { data: stats } = await supabase
        .from("qr_scan_statistics")
        .select("*")
        .eq("qr_code_id", qrCodeId)
        .single();

      const today = new Date().toISOString().split("T")[0];
      let dailyStats = stats?.daily_stats || {};

      // 更新今日扫描次数
      dailyStats[today] = (dailyStats[today] || 0) + 1;

      if (stats) {
        // 更新现有记录
        await supabase
          .from("qr_scan_statistics")
          .update({
            scan_count: stats.scan_count + 1,
            last_scan_time: new Date().toISOString(),
            daily_stats: dailyStats,
          })
          .eq("qr_code_id", qrCodeId);
      } else {
        // 创建新记录
        await supabase.from("qr_scan_statistics").insert({
          qr_code_id: qrCodeId,
          product_id: (await this.getQRCodeById(qrCodeId)).product_id,
          scan_count: 1,
          daily_stats: dailyStats,
          last_scan_time: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("更新扫描统计失败:", error);
    }
  }

  /**
   * 生成唯一二维码ID
   */
  private generateUniqueQRCodeId(productId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `qr_${productId}_${timestamp}_${random}`;
  }

  /**
   * 构造二维码内容
   */
  private buildQRContent(productInfo: ProductInfo): string {
    // 生成产品详情页面URL
    const baseUrl = process.env.QR_CODE_BASE_URL || "https://fx.cn";
    return `${baseUrl}/products/${productInfo.productId}`;
  }

  /**
   * 合并配置参数
   */
  private mergeConfig(
    config: QRCodeConfig
  ): Required<QRCodeConfig> & { color: { dark: string; light: string } } {
    const defaults: Required<QRCodeConfig> = {
      format: "png",
      size: 300,
      errorCorrectionLevel: "M",
      margin: 4,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };

    const mergedConfig: Required<QRCodeConfig> & {
      color: { dark: string; light: string };
    } = {
      format: config.format || defaults.format,
      size: config.size || defaults.size,
      errorCorrectionLevel:
        config.errorCorrectionLevel || defaults.errorCorrectionLevel,
      margin: config.margin !== undefined ? config.margin : defaults.margin,
      color: {
        dark: config.color?.dark || defaults.color.dark,
        light: config.color?.light || defaults.color.light,
      },
    };

    return mergedConfig;
  }

  /**
   * 生成SVG格式二维码
   */
  private async generateSVGQRCode(
    content: string,
    config: any
  ): Promise<string> {
    return await QRCode.toString(content, {
      type: "svg",
      errorCorrectionLevel: config.errorCorrectionLevel,
      margin: config.margin,
      color: config.color,
    });
  }

  /**
   * 生成PNG格式二维码
   */
  private async generatePNGQRCode(
    content: string,
    config: any
  ): Promise<Buffer> {
    // 先生成SVG
    const svgString = await QRCode.toString(content, {
      type: "svg",
      errorCorrectionLevel: config.errorCorrectionLevel,
      margin: config.margin,
      color: config.color,
    });

    // 使用sharp将SVG转换为PNG
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(config.size, config.size)
      .png()
      .toBuffer();

    return pngBuffer;
  }

  /**
   * 转换为Base64格式
   */
  private convertToBase64(data: Buffer | string, format: string): string {
    let buffer: Buffer;

    if (typeof data === "string") {
      // SVG字符串
      buffer = Buffer.from(data);
      return `data:image/svg+xml;base64,${buffer.toString("base64")}`;
    } else {
      // PNG Buffer
      buffer = data;
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  }

  /**
   * 保存二维码信息到数据库
   */
  private async saveQRCodeToDatabase(
    qrCodeId: string,
    productId: string,
    qrContent: string,
    base64Data: string,
    config: any
  ): Promise<any> {
    // 开始数据库事务
    const { data, error } = await supabase
      .from("product_qrcodes")
      .insert({
        qr_code_id: qrCodeId,
        product_id: productId,
        qr_content: qrContent,
        qr_image_base64: base64Data,
        format: config.format,
        size: config.size,
        error_correction_level: config.errorCorrectionLevel,
        margin: config.margin,
        fg_color: config.color.dark,
        bg_color: config.color.light,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`保存二维码到数据库失败: ${error.message}`);
    }

    // 同时创建扫描统计记录
    await supabase.from("qr_scan_statistics").insert({
      qr_code_id: data.id,
      product_id: productId,
      scan_count: 0,
      unique_scans: 0,
    });

    return data;
  }
}

// 导出单例实例
export const qrcodeService = QRCodeService.getInstance();
