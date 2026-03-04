/**
 * 输入类型检测器
 * 自动识别输入类型并路由到相应的处理服? */

import { InputType, RawProcurementRequest } from '../models/procurement.model';
import { ImageProcessorService } from './image-processor.service';
import { LinkExtractorService } from './link-extractor.service';

// 输入检测结?interface InputDetectionResult {
  inputType: InputType;
  confidence: number;
  detectedFeatures: string[];
  processingSteps: string[];
}

// 处理结果
interface ProcessingResult {
  extractedContent: string;
  additionalData?: Record<string, any>;
  processingSteps: string[];
}

export class InputDetectorService {
  private imageProcessor: ImageProcessorService;
  private linkExtractor: LinkExtractorService;

  constructor() {
    this.imageProcessor = new ImageProcessorService();
    this.linkExtractor = new LinkExtractorService();
  }

  /**
   * 检测输入类型并处理相应的内?   */
  async detectAndProcess(rawRequest: RawProcurementRequest): Promise<{
    detectedType: InputType;
    confidence: number;
    processingResult: ProcessingResult;
    detectionSteps: string[];
  }> {
    const detectionSteps: string[] = ['开始输入类型检?];

    try {
      // 1. 检测输入类?      detectionSteps.push('执行输入类型检?);
      const detectionResult = await this.detectInputType(rawRequest);
      detectionSteps.push(
        `检测结? ${detectionResult.inputType} (置信? ${detectionResult.confidence})`
      );

      // 2. 根据检测结果处理输?      detectionSteps.push('开始内容处?);
      const processingResult = await this.processByType(
        rawRequest,
        detectionResult.inputType
      );
      detectionSteps.push('内容处理完成');

      return {
        detectedType: detectionResult.inputType,
        confidence: detectionResult.confidence,
        processingResult,
        detectionSteps,
      };
    } catch (error) {
      console.error('输入检测和处理失败:', error);
      detectionSteps.push(
        '处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
      throw error;
    }
  }

  /**
   * 检测输入类?   */
  private async detectInputType(
    rawRequest: RawProcurementRequest
  ): Promise<InputDetectionResult> {
    const input = rawRequest.input.trim().toLowerCase();
    const features: string[] = [];
    let confidence = 0.5; // 基础置信?
    // 1. URL模式检?    if (this.isUrl(input)) {
      features.push('URL格式');

      // 进一步判断URL类型
      if (this.isImageUrl(input)) {
        features.push('图片URL');
        return {
          inputType: InputType.IMAGE,
          confidence: 0.95,
          detectedFeatures: features,
          processingSteps: ['URL检?, '图片URL识别'],
        };
      } else if (this.isWebUrl(input)) {
        features.push('网页URL');
        return {
          inputType: InputType.LINK,
          confidence: 0.9,
          detectedFeatures: features,
          processingSteps: ['URL检?, '网页URL识别'],
        };
      }
    }

    // 2. 文本特征检?    const textFeatures = this.analyzeTextFeatures(input);
    features.push(...textFeatures.features);
    confidence = Math.max(confidence, textFeatures.confidence);

    // 3. 综合判断
    if (textFeatures.isLikelyText) {
      return {
        inputType: InputType.TEXT,
        confidence,
        detectedFeatures: features,
        processingSteps: ['文本特征分析', '文本输入确认'],
      };
    }

    // 默认返回文本类型（最保守的选择?    return {
      inputType: InputType.TEXT,
      confidence: 0.6,
      detectedFeatures: ['默认文本'],
      processingSteps: ['默认文本类型'],
    };
  }

  /**
   * 判断是否为URL
   */
  private isUrl(input: string): boolean {
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return urlPattern.test(input);
  }

  /**
   * 判断是否为图片URL
   */
  private isImageUrl(url: string): boolean {
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.svg',
    ];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  /**
   * 判断是否为网页URL
   */
  private isWebUrl(url: string): boolean {
    // 排除明显的图片URL后，其他URL都认为是网页
    return this.isUrl(url) && !this.isImageUrl(url);
  }

  /**
   * 分析文本特征
   */
  private analyzeTextFeatures(text: string): {
    features: string[];
    confidence: number;
    isLikelyText: boolean;
  } {
    const features: string[] = [];
    let confidence = 0.5;
    const sentences = text
      .split(/[。！�?!?]/)
      .filter(s => s.trim().length > 0);

    // 文本长度分析
    if (text.length > 5) {
      features.push('有意义的文本长度');
      confidence += 0.1;
    }

    // 句子结构分析
    if (sentences.length > 0) {
      features.push('句子结构');
      confidence += 0.1;
    }

    // 采购相关词汇检?    const procurementKeywords = [
      '采购',
      '购买',
      '需?,
      '想要',
      '求购',
      '订购',
      'buy',
      'purchase',
      'need',
      'want',
      'order',
    ];

    const hasProcurementWords = procurementKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasProcurementWords) {
      features.push('采购相关词汇');
      confidence += 0.2;
    }

    // 数字和量词检?    const hasNumbers = /\d/.test(text);
    const hasUnits = /[个台套件箱瓶]/.test(text);

    if (hasNumbers || hasUnits) {
      features.push('数字或量?);
      confidence += 0.1;
    }

    return {
      features,
      confidence: Math.min(0.95, confidence),
      isLikelyText: true, // 目前策略是默认认为是文本
    };
  }

  /**
   * 根据输入类型处理内容
   */
  private async processByType(
    rawRequest: RawProcurementRequest,
    inputType: InputType
  ): Promise<ProcessingResult> {
    switch (inputType) {
      case InputType.IMAGE:
        return await this.processImageInput(rawRequest);

      case InputType.LINK:
        return await this.processLinkInput(rawRequest);

      case InputType.TEXT:
      default:
        return await this.processTextInput(rawRequest);
    }
  }

  /**
   * 处理图片输入
   */
  private async processImageInput(
    rawRequest: RawProcurementRequest
  ): Promise<ProcessingResult> {
    const processingSteps: string[] = ['开始图片处?];

    try {
      const result = await this.imageProcessor.processImageRequest(rawRequest);
      processingSteps.push(...result.processingSteps);

      return {
        extractedContent: result.extractedText,
        additionalData: {
          detectedProducts: result.detectedProducts,
          sceneDescription: result.sceneDescription,
        },
        processingSteps,
      };
    } catch (error) {
      processingSteps.push(
        '图片处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
      // 降级到文本处?      return await this.processTextInput(rawRequest, processingSteps);
    }
  }

  /**
   * 处理链接输入
   */
  private async processLinkInput(
    rawRequest: RawProcurementRequest
  ): Promise<ProcessingResult> {
    const processingSteps: string[] = ['开始链接处?];

    try {
      const result = await this.linkExtractor.processLinkRequest(rawRequest);
      processingSteps.push(...result.processingSteps);

      return {
        extractedContent: result.extractedContent,
        additionalData: {
          productInfos: result.productInfos,
          pageTitle: result.pageTitle,
          keyPhrases: result.keyPhrases,
        },
        processingSteps,
      };
    } catch (error) {
      processingSteps.push(
        '链接处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
      // 降级到文本处?      return await this.processTextInput(rawRequest, processingSteps);
    }
  }

  /**
   * 处理文本输入
   */
  private async processTextInput(
    rawRequest: RawProcurementRequest,
    baseSteps: string[] = []
  ): Promise<ProcessingResult> {
    const processingSteps = [...baseSteps, '开始文本处?];

    // 对于文本输入，直接返回原始内?    processingSteps.push('文本内容准备完成');

    return {
      extractedContent: rawRequest.rawDescription || rawRequest.input,
      processingSteps,
    };
  }

  /**
   * 验证输入的有效?   */
  async validateInput(rawRequest: RawProcurementRequest): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本验证
    if (!rawRequest.input || rawRequest.input.trim().length === 0) {
      errors.push('输入内容不能为空');
    }

    // 根据输入类型进行特定验证
    switch (rawRequest.inputType) {
      case InputType.IMAGE:
        if (rawRequest.imageUrl) {
          const isValidUrl = await this.imageProcessor.validateImageUrl(
            rawRequest.imageUrl
          );
          if (!isValidUrl) {
            warnings.push('图片URL可能无效或无法访?);
          }
        }
        break;

      case InputType.LINK:
        if (rawRequest.sourceUrl) {
          try {
            const url = new URL(rawRequest.sourceUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
              warnings.push('链接协议不是HTTP/HTTPS');
            }
          } catch {
            warnings.push('链接格式可能不正?);
          }
        }
        break;

      case InputType.TEXT:
        if (
          rawRequest.rawDescription &&
          rawRequest.rawDescription.length > 5000
        ) {
          warnings.push('文本内容较长，可能影响处理性能');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
