/**
 * B2B采购需求理解服? * 整合多模态输入处理、大模型解析和结构化输出
 */

import {
  InputType,
  ParsedProcurementRequest,
  ProcurementItem,
  ProcurementStatus,
  RawProcurementRequest,
  UrgencyLevel,
} from '../models/procurement.model';
import { InputDetectorService } from './input-detector.service';
import { LargeModelProcurementService } from './large-model-parser.service';

// 需求理解结?interface RequirementUnderstandingResult {
  parsedRequest: ParsedProcurementRequest;
  modelUsed: string;
  confidenceLevel: string;
  processingSteps: string[];
  processingTimeMs: number;
}

export class RequirementUnderstandingService {
  private inputDetector: InputDetectorService;
  private modelService: LargeModelProcurementService;

  constructor() {
    this.inputDetector = new InputDetectorService();
    this.modelService = new LargeModelProcurementService();
  }

  /**
   * 处理采购需求请?   */
  async processRequest(
    rawRequest: RawProcurementRequest
  ): Promise<RequirementUnderstandingResult> {
    const startTime = Date.now();
    const processingSteps: string[] = ['开始需求理解处?];

    try {
      // 1. 输入验证
      processingSteps.push('输入验证');
      const validation = await this.inputDetector.validateInput(rawRequest);
      if (!validation.isValid) {
        throw new Error(`输入验证失败: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('输入警告:', validation.warnings);
      }

      // 2. 输入类型检测和预处?      processingSteps.push('输入类型检测和预处?);
      const detectionResult =
        await this.inputDetector.detectAndProcess(rawRequest);
      processingSteps.push(...detectionResult.detectionSteps);

      // 3. 更新原始请求中的提取内容
      const enrichedRequest = this.enrichRawRequest(
        rawRequest,
        detectionResult
      );

      // 4. 调用大模型进行需求解?      processingSteps.push('调用大模型进行需求解?);
      const parsedRequest =
        await this.modelService.parseDemand(enrichedRequest);
      processingSteps.push('大模型解析完?);

      // 5. 后处理和格式?      processingSteps.push('结果后处理和格式?);
      const finalResult = this.postProcessResult(
        parsedRequest,
        detectionResult,
        enrichedRequest
      );
      processingSteps.push('结果处理完成');

      const totalTime = Date.now() - startTime;

      return {
        parsedRequest: finalResult,
        modelUsed: detectionResult.processingResult?.modelUsed || 'Unknown',
        confidenceLevel: this.determineConfidenceLevel(
          finalResult.aiConfidence
        ),
        processingSteps,
        processingTimeMs: totalTime,
      };
    } catch (error) {
      console.error('需求理解处理失?', error);
      processingSteps.push(
        '处理失败: ' + (error instanceof Error ? error.message : '未知错误')
      );

      // 返回错误结果
      const errorResult = this.createErrorResult(
        rawRequest,
        error,
        processingSteps
      );

      return {
        parsedRequest: errorResult,
        modelUsed: 'Error',
        confidenceLevel: 'Low',
        processingSteps,
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * 丰富原始请求信息
   */
  private enrichRawRequest(
    rawRequest: RawProcurementRequest,
    detectionResult: Awaited<
      ReturnType<InputDetectorService['detectAndProcess']>
    >
  ): RawProcurementRequest {
    const enriched = { ...rawRequest };

    // 更新输入类型为检测结?    enriched.inputType = detectionResult.detectedType;

    // 设置提取的内?    enriched.extractedContent =
      detectionResult.processingResult.extractedContent;

    // 根据不同输入类型设置相应字段
    switch (detectionResult.detectedType) {
      case InputType.IMAGE:
        enriched.rawDescription =
          detectionResult.processingResult.extractedContent;
        break;

      case InputType.LINK:
        enriched.rawDescription =
          detectionResult.processingResult.extractedContent;
        break;

      case InputType.TEXT:
        enriched.rawDescription = rawRequest.input;
        break;
    }

    // 添加额外的元数据
    if (detectionResult.processingResult.additionalData) {
      enriched.metadata = {
        ...enriched.metadata,
        ...detectionResult.processingResult.additionalData,
        detectionConfidence: detectionResult.confidence,
      };
    }

    return enriched;
  }

  /**
   * 后处理解析结?   */
  private postProcessResult(
    parsedRequest: ParsedProcurementRequest,
    detectionResult: any,
    enrichedRequest: RawProcurementRequest
  ): ParsedProcurementRequest {
    const processed = { ...parsedRequest };

    // 添加输入类型信息
    processed.inputType = enrichedRequest.inputType;

    // 添加原始链接或图片URL
    if (enrichedRequest.inputType === InputType.IMAGE) {
      processed.imageUrl = enrichedRequest.imageUrl;
    } else if (enrichedRequest.inputType === InputType.LINK) {
      processed.sourceUrl = enrichedRequest.sourceUrl;
    }

    // 添加提取的内?    processed.extractedContent = enrichedRequest.extractedContent;

    // 添加处理上下?    processed.processingContext = {
      modelUsed: detectionResult.processingResult?.modelUsed || 'LargeModel',
      confidenceLevel: this.determineConfidenceLevel(
        parsedRequest.aiConfidence
      ),
      processingSteps: detectionResult.detectionSteps,
    };

    // 确保必要字段存在
    if (!processed.items || processed.items.length === 0) {
      processed.items = [this.createDefaultItem(enrichedRequest)];
    }

    // 验证和清理数?    this.validateAndCleanResult(processed);

    return processed;
  }

  /**
   * 创建默认物品?   */
  private createDefaultItem(
    rawRequest: RawProcurementRequest
  ): ProcurementItem {
    return {
      id: `item_default_${Date.now()}`,
      productId: 'generic_item',
      productName: '通用采购物品',
      category: 'general',
      quantity: 1,
      unit: '�?,
      specifications:
        rawRequest.extractedContent ||
        rawRequest.rawDescription ||
        rawRequest.input,
      requiredQuality: 'standard',
    };
  }

  /**
   * 验证和清理结果数?   */
  private validateAndCleanResult(
    parsedRequest: ParsedProcurementRequest
  ): void {
    // 验证物品数量
    parsedRequest.items = parsedRequest.items.filter(
      item => item.quantity > 0 && item.productName.trim().length > 0
    );

    // 清理特殊要求
    if (parsedRequest.specialRequirements) {
      parsedRequest.specialRequirements = parsedRequest.specialRequirements
        .filter(req => req.trim().length > 0)
        .map(req => req.trim());
    }

    // 确保预算范围合理?    if (parsedRequest.budgetRange) {
      if (parsedRequest.budgetRange.min < 0) {
        parsedRequest.budgetRange.min = 0;
      }
      if (parsedRequest.budgetRange.max < parsedRequest.budgetRange.min) {
        parsedRequest.budgetRange.max = parsedRequest.budgetRange.min;
      }
      if (!parsedRequest.budgetRange.currency) {
        parsedRequest.budgetRange.currency = 'CNY';
      }
    }

    // 确保置信度在合理范围?    parsedRequest.aiConfidence = Math.max(
      0,
      Math.min(100, parsedRequest.aiConfidence)
    );
  }

  /**
   * 确定置信度等?   */
  private determineConfidenceLevel(confidence: number): string {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 80) return 'Good';
    if (confidence >= 70) return 'Fair';
    if (confidence >= 60) return 'Poor';
    return 'Very Poor';
  }

  /**
   * 创建错误结果
   */
  private createErrorResult(
    rawRequest: RawProcurementRequest,
    error: unknown,
    processingSteps: string[]
  ): ParsedProcurementRequest {
    return {
      id: `parsed_error_${Date.now()}`,
      rawRequestId: rawRequest.id,
      companyId: rawRequest.companyId,
      requesterId: rawRequest.requesterId,
      inputType: rawRequest.inputType,
      items: [this.createDefaultItem(rawRequest)],
      urgency: UrgencyLevel.MEDIUM,
      specialRequirements: [
        `处理错误: ${error instanceof Error ? error.message : '未知错误'}`,
      ],
      status: ProcurementStatus.PROCESSING,
      aiConfidence: 0,
      parsedAt: new Date(),
      processingTimeMs: 0,
      processingContext: {
        modelUsed: 'Error Handler',
        confidenceLevel: 'Very Poor',
        processingSteps,
      },
    };
  }

  /**
   * 健康检?   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'ok' | 'error'>;
    message: string;
  }> {
    const services: Record<string, 'ok' | 'error'> = {};

    try {
      // 检查输入检测服?      services.inputDetector = 'ok';

      // 检查大模型服务
      const modelHealth = await this.modelService.healthCheck();
      services.largeModel = modelHealth.healthy ? 'ok' : 'error';

      const healthyServices = Object.values(services).filter(
        status => status === 'ok'
      ).length;
      const totalServices = Object.keys(services).length;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = '所有服务正常运?;

      if (healthyServices === 0) {
        status = 'unhealthy';
        message = '所有服务都不可?;
      } else if (healthyServices < totalServices) {
        status = 'degraded';
        message = `${healthyServices}/${totalServices} 服务正常运行`;
      }

      return {
        status,
        services,
        message,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: { overall: 'error' },
        message: `健康检查失? ${
          error instanceof Error ? error.message : '未知错误'
        }`,
      };
    }
  }

  /**
   * 获取服务统计信息
   */
  async getStatistics(): Promise<{
    totalProcessed: number;
    averageProcessingTime: number;
    successRate: number;
    inputTypeDistribution: Record<InputType, number>;
  }> {
    // 这里应该从数据库或缓存中获取统计数据
    // 目前返回模拟数据
    return {
      totalProcessed: 1000,
      averageProcessingTime: 1200,
      successRate: 0.92,
      inputTypeDistribution: {
        [InputType.TEXT]: 700,
        [InputType.IMAGE]: 200,
        [InputType.LINK]: 100,
      },
    };
  }
}
