/**
 * 图像处理服务
 * 集成OCR文字识别和商品图片识别功? */

import { RawProcurementRequest } from '../models/procurement.model';

// OCR识别结果接口
interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    boundingBox: number[];
    confidence: number;
  }>;
}

// 商品识别结果接口
interface ProductDetectionResult {
  products: Array<{
    name: string;
    category: string;
    confidence: number;
    boundingBox: number[];
  }>;
  sceneDescription: string;
}

export class ImageProcessorService {
  private ocrApiKey: string;
  private computerVisionApiKey: string;

  constructor() {
    // 从环境变量获取API密钥
    this.ocrApiKey = process.env.OCR_API_KEY || '';
    this.computerVisionApiKey = process.env.COMPUTER_VISION_API_KEY || '';
  }

  /**
   * 处理图片输入，提取文本和商品信息
   */
  async processImageRequest(rawRequest: RawProcurementRequest): Promise<{
    extractedText: string;
    detectedProducts: ProductDetectionResult['products'];
    sceneDescription: string;
    processingSteps: string[];
  }> {
    if (!rawRequest.imageUrl) {
      throw new Error('图片URL不能为空');
    }

    const processingSteps: string[] = ['开始图片处?];
    let extractedText = '';
    let detectedProducts: ProductDetectionResult['products'] = [];
    let sceneDescription = '';

    try {
      // 1. OCR文字识别
      processingSteps.push('执行OCR文字识别');
      const ocrResult = await this.performOcr(rawRequest.imageUrl);
      extractedText = ocrResult.text;
      processingSteps.push(
        `OCR识别完成，提取到${ocrResult.words.length}个文字元素`
      );

      // 2. 商品检测（如果有相应API�?      if (this.computerVisionApiKey) {
        processingSteps.push('执行商品检?);
        const productResult = await this.detectProducts(rawRequest.imageUrl);
        detectedProducts = productResult.products;
        sceneDescription = productResult.sceneDescription;
        processingSteps.push(
          `商品检测完成，识别?{detectedProducts.length}个商品`
        );
      }

      // 3. 内容分析和清?      processingSteps.push('内容分析和清?);
      extractedText = this.cleanExtractedText(extractedText);

      return {
        extractedText,
        detectedProducts,
        sceneDescription,
        processingSteps,
      };
    } catch (error) {
      console.error('图片处理失败:', error);
      processingSteps.push(
        '处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
      throw error;
    }
  }

  /**
   * 执行OCR文字识别
   */
  private async performOcr(imageUrl: string): Promise<OcrResult> {
    // 这里可以集成多种OCR服务，如Google Vision API、百度OCR、腾讯OCR�?    // 目前提供基础实现，可以根据实际情况替?
    if (this.ocrApiKey) {
      // 使用付费OCR服务
      return await this.callExternalOcrService(imageUrl);
    } else {
      // 使用免费替代方案或模拟数?      return await this.simulateOcrResult(imageUrl);
    }
  }

  /**
   * 调用外部OCR服务
   */
  private async callExternalOcrService(imageUrl: string): Promise<OcrResult> {
    // 示例：调用Google Cloud Vision API
    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.ocrApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  source: {
                    imageUri: imageUrl,
                  },
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 50,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OCR服务调用失败: ${response.status}`);
      }

      const data = await response.json();
      const textAnnotations = data.responses[0]?.textAnnotations || [];

      if (textAnnotations.length === 0) {
        return {
          text: '',
          confidence: 0,
          words: [],
        };
      }

      // 提取主要文本和单词信?      const fullText = textAnnotations[0].description || '';
      const words = textAnnotations.slice(1).map((word: any) => ({
        text: word.description,
        boundingBox: word?.vertices?.flatMap((v: any) => [v.x, v.y]) || [],
        confidence: word.confidence || 0.8,
      }));

      return {
        text: fullText,
        confidence: 0.9,
        words,
      };
    } catch (error) {
      console.warn('外部OCR服务调用失败，使用模拟数?', error);
      return await this.simulateOcrResult(imageUrl);
    }
  }

  /**
   * 模拟OCR结果（用于开发和测试?   */
  private async simulateOcrResult(imageUrl: string): Promise<OcrResult> {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 根据图片URL生成模拟文本
    const mockTexts = [
      '采购清单：\n1. 联想ThinkPad笔记本电?x 10台\n2. 戴尔显示?x 5台\n3. 罗技鼠标 x 20个\n预算?0000元\n交付时间：本周内',
      '急需采购：\n服务器设?2台\n配置要求：\n- Intel Xeon处理器\n- 64GB内存\n- 2TB SSD\n预算?5万\n紧急程度：�?,
      '办公用品采购：\nA4打印?10箱\n黑色签字?50支\n订书?20个\n预算?000元\n要求：今日到?,
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    // 模拟单词分割
    const words = randomText
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => ({
        text: word,
        boundingBox: [index * 50, 0, (index + 1) * 50, 20],
        confidence: 0.8 + Math.random() * 0.2,
      }));

    return {
      text: randomText,
      confidence: 0.85,
      words,
    };
  }

  /**
   * 商品检?   */
  private async detectProducts(
    imageUrl: string
  ): Promise<ProductDetectionResult> {
    // 商品检测实现（可根据需要集成Azure Computer Vision、AWS Rekognition等）
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟商品检测结?    const mockProducts = [
      {
        name: '笔记本电?,
        category: '电子产品',
        confidence: 0.92,
        boundingBox: [100, 50, 300, 200],
      },
      {
        name: '显示?,
        category: '电子产品',
        confidence: 0.87,
        boundingBox: [350, 75, 500, 180],
      },
    ];

    return {
      products: mockProducts,
      sceneDescription: '办公室环境，桌面上摆放着电子设备',
    };
  }

  /**
   * 清理提取的文?   */
  private cleanExtractedText(text: string): string {
    // 移除多余的空白字?    let cleaned = text.replace(/\s+/g, ' ').trim();

    // 移除常见的OCR错误
    cleaned = cleaned
      .replace(/[\u2018\u2019]/g, "'") // 替换弯引?      .replace(/[\u201C\u201D]/g, '"') // 替换弯双引号
      .replace(/\u2013|\u2014/g, '-') // 替换破折?      .replace(/[^\x20-\x7E\u4e00-\u9fff]/g, ''); // 移除非ASCII和非中文字符

    return cleaned;
  }

  /**
   * 验证图片URL有效?   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');

      return (
        response.ok && contentType !== null && contentType.startsWith('image/')
      );
    } catch {
      return false;
    }
  }
}
