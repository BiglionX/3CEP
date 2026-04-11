import QRCode from 'qrcode';
import { TraceabilityCode } from '../services/TraceabilityCode';

export interface QRCodeConfig {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  foregroundColor?: string;
  backgroundColor?: string;
}

export class QRCodeGenerator {
  private defaultConfig: QRCodeConfig = {
    size: 300,
    margin: 4,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
  };

  /**
   * 生成二维码图片 URL
   */
  async generateQRCodeUrl(
    traceabilityCode: TraceabilityCode,
    config?: QRCodeConfig
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const content = this.generateQRContent(traceabilityCode);

    try {
      const dataUrl = await QRCode.toDataURL(content, {
        width: finalConfig.size,
        margin: finalConfig.margin,
        errorCorrectionLevel: finalConfig.errorCorrectionLevel,
        color: {
          dark: finalConfig.foregroundColor,
          light: finalConfig.backgroundColor,
        },
      });

      return dataUrl;
    } catch (error) {
      throw new Error(
        `生成二维码失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 生成二维码 Base64
   */
  async generateQRCodeBase64(
    traceabilityCode: TraceabilityCode,
    config?: QRCodeConfig
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const content = this.generateQRContent(traceabilityCode);

    try {
      const dataUrl = await QRCode.toDataURL(content, {
        width: finalConfig.size,
        margin: finalConfig.margin,
        errorCorrectionLevel: finalConfig.errorCorrectionLevel,
        color: {
          dark: finalConfig.foregroundColor,
          light: finalConfig.backgroundColor,
        },
      });

      // 移除 data:image/png;base64, 前缀
      return dataUrl.split(',')[1];
    } catch (error) {
      throw new Error(
        `生成二维码 Base64 失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 批量生成二维码
   */
  async generateBatchQRCodes(
    codes: TraceabilityCode[],
    config?: QRCodeConfig
  ): Promise<Array<{ code: TraceabilityCode; qrCodeBase64: string }>> {
    const results: Array<{ code: TraceabilityCode; qrCodeBase64: string }> = [];

    for (const code of codes) {
      const qrCodeBase64 = await this.generateQRCodeBase64(code, config);
      results.push({ code, qrCodeBase64 });
    }

    return results;
  }

  /**
   * 生成二维码内容
   * 可以是 URL 或纯文本
   */
  private generateQRContent(traceabilityCode: TraceabilityCode): string {
    // 方案1: 生成溯源查询 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/trace/${traceabilityCode.code}`;

    // 方案2: 直接嵌入产品信息（适合离线场景）
    // return JSON.stringify({
    //   code: traceabilityCode.code,
    //   sku: traceabilityCode.sku,
    //   product: traceabilityCode.productName,
    //   verified: true
    // });
  }

  /**
   * 验证二维码内容
   */
  static verifyQRContent(content: string): boolean {
    try {
      // 验证是否为溯源码 URL
      const urlPattern = /\/trace\/TRC-[A-Za-z0-9]+-[A-Z0-9]+$/;
      return urlPattern.test(content);
    } catch {
      return false;
    }
  }
}
