/**
 * 物流追踪核心服务类
 * 集成多家物流商API，提供统一的运单轨迹查询和状态更新
 */

import {
  BatchTrackDTO,
  CarrierDetectionResult,
  LogisticsCarrier,
  LogisticsTrackingConfig,
  ShipmentTracking,
  TrackingCacheItem,
  TrackShipmentDTO,
  UnifiedTrackingResponse,
} from "../models/logistics.model";
import {
  KdniaoClient,
  LogisticsCarrierClient,
  SfExpressClient,
  Track17Client,
} from "./logistics-carrier-clients";

export class LogisticsTrackingService {
  private clients: Map<LogisticsCarrier, LogisticsCarrierClient> = new Map();
  private config: LogisticsTrackingConfig;
  private cache: Map<string, TrackingCacheItem> = new Map();

  constructor(config: LogisticsTrackingConfig) {
    this.config = config;
    this.initializeClients();
  }

  /**
   * 初始化物流商客户端
   */
  private initializeClients(): void {
    this.config.carriers.forEach((carrierConfig) => {
      if (!carrierConfig.isEnabled) return;

      let client: LogisticsCarrierClient;

      switch (carrierConfig.carrier) {
        case LogisticsCarrier.SF_EXPRESS:
          client = new SfExpressClient(carrierConfig);
          break;
        default:
          // 对于其他物流商，使用17track作为聚合服务
          client = new Track17Client(carrierConfig);
          break;
      }

      this.clients.set(carrierConfig.carrier, client);
    });

    // 如果配置了快递鸟，也添加快递鸟客户端作为备选
    const kdniaoConfig = this.config.carriers.find(
      (c) => c.carrier === LogisticsCarrier.OTHER && c.apiKey.includes("kdniao")
    );
    if (kdniaoConfig) {
      const kdniaoClient = new KdniaoClient(kdniaoConfig);
      // 将快递鸟支持的物流商也添加到客户端映射中
      kdniaoClient.getSupportedCarriers().forEach((carrier) => {
        if (!this.clients.has(carrier)) {
          this.clients.set(carrier, kdniaoClient);
        }
      });
    }
  }

  /**
   * 查询单个运单轨迹
   */
  async trackShipment(dto: TrackShipmentDTO): Promise<UnifiedTrackingResponse> {
    const { trackingNumber, carrier, autoDetect = true } = dto;

    // 参数验证
    if (!trackingNumber) {
      return this.createErrorResponse(
        "MISSING_TRACKING_NUMBER",
        "运单号不能为空"
      );
    }

    // 检查缓存
    const cacheKey = `${trackingNumber}_${carrier || "auto"}`;
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          tracking: cached.trackingInfo,
          requestId: "cached_" + Date.now().toString(),
          timestamp: new Date(),
        };
      }
    }

    let detectedCarrier: LogisticsCarrier | null = null;

    // 确定物流商
    if (carrier) {
      detectedCarrier = carrier;
    } else if (autoDetect) {
      const detectionResult = this.detectCarrier(trackingNumber);
      if (detectionResult.isValidFormat) {
        detectedCarrier = detectionResult.carrier;
      }
    }

    // 如果指定了物流商但没有对应的客户端
    if (detectedCarrier && !this.clients.has(detectedCarrier)) {
      // 尝试使用17track作为备选
      const fallbackClient = this.clients.get(LogisticsCarrier.OTHER);
      if (fallbackClient) {
        detectedCarrier = LogisticsCarrier.OTHER;
      } else {
        return this.createErrorResponse(
          "UNSUPPORTED_CARRIER",
          `不支持的物流商: ${detectedCarrier}`
        );
      }
    }

    // 如果没有确定物流商，尝试所有可用的客户端
    if (!detectedCarrier) {
      return await this.tryAllCarriers(trackingNumber);
    }

    // 使用确定的物流商客户端查询
    const client = this.clients.get(detectedCarrier);
    if (!client) {
      return this.createErrorResponse(
        "CLIENT_NOT_FOUND",
        `找不到物流商客户端: ${detectedCarrier}`
      );
    }

    try {
      const result = await client.getTrackingInfo(trackingNumber);

      // 缓存结果
      if (result.success && result.tracking && this.config.cacheEnabled) {
        this.addToCache(cacheKey, result.tracking);
      }

      return result;
    } catch (error) {
      return this.createErrorResponse(
        "TRACKING_FAILED",
        `轨迹查询失败: ${(error as Error).message}`
      );
    }
  }

  /**
   * 批量查询运单轨迹
   */
  async batchTrackShipments(
    dto: BatchTrackDTO
  ): Promise<UnifiedTrackingResponse[]> {
    const { trackingNumbers, carrier } = dto;

    if (!trackingNumbers || trackingNumbers.length === 0) {
      return [
        this.createErrorResponse("EMPTY_TRACKING_LIST", "运单号列表不能为空"),
      ];
    }

    // 限制批量查询数量
    if (trackingNumbers.length > 100) {
      return [
        this.createErrorResponse(
          "TOO_MANY_TRACKING_NUMBERS",
          "单次查询不能超过100个运单号"
        ),
      ];
    }

    const promises = trackingNumbers.map((trackingNumber) =>
      this.trackShipment({ trackingNumber, carrier })
    );

    return Promise.all(promises);
  }

  /**
   * 自动识别物流商
   */
  detectCarrier(trackingNumber: string): CarrierDetectionResult {
    // 顺丰速运：12位纯数字
    if (/^\d{12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.SF_EXPRESS,
        confidence: 0.95,
        isValidFormat: true,
      };
    }

    // 圆通速递：通常以YT开头
    if (/^YT\d{10,12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.YTO,
        confidence: 0.9,
        isValidFormat: true,
      };
    }

    // 中通快递：通常以ZT开头或纯数字
    if (/^(ZT\d{10,12}|\d{12})$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.ZTO,
        confidence: 0.85,
        isValidFormat: true,
      };
    }

    // 申通快递：通常以ST开头
    if (/^ST\d{10,12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.STO,
        confidence: 0.85,
        isValidFormat: true,
      };
    }

    // 韵达快递：通常以YNDD开头
    if (/^YNDD\d{8,12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.YUNDA,
        confidence: 0.9,
        isValidFormat: true,
      };
    }

    // EMS：通常以EA、EB、EC等开头
    if (/^E[A-Z]\d{9}CN$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.EMS,
        confidence: 0.9,
        isValidFormat: true,
      };
    }

    // 京东物流：通常以JD开头
    if (/^JD\d{10,15}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.JD_LOGISTICS,
        confidence: 0.85,
        isValidFormat: true,
      };
    }

    // DHL：通常以数字开头，长度10-12位
    if (/^\d{10,12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.DHL,
        confidence: 0.7,
        isValidFormat: true,
      };
    }

    // FedEx：通常以数字开头，长度12位
    if (/^\d{12}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.FEDEX,
        confidence: 0.65,
        isValidFormat: true,
      };
    }

    // UPS：通常以1Z开头
    if (/^1Z[A-Z0-9]{16}$/.test(trackingNumber)) {
      return {
        carrier: LogisticsCarrier.UPS,
        confidence: 0.9,
        isValidFormat: true,
      };
    }

    // 如果无法识别，返回OTHER
    return {
      carrier: LogisticsCarrier.OTHER,
      confidence: 0.1,
      isValidFormat: trackingNumber.length >= 8 && trackingNumber.length <= 32,
    };
  }

  /**
   * 尝试所有可用的物流商客户端
   */
  private async tryAllCarriers(
    trackingNumber: string
  ): Promise<UnifiedTrackingResponse> {
    const clients = Array.from(this.clients.values());

    for (const client of clients) {
      try {
        // 验证运单号格式
        if (client.validateTrackingNumber(trackingNumber)) {
          const result = await client.getTrackingInfo(trackingNumber);
          if (result.success) {
            return result;
          }
        }
      } catch (error) {
        // 继续尝试下一个客户端
        console.warn(`客户端 ${client.getCarrierName()} 查询失败:`, error);
      }
    }

    return this.createErrorResponse(
      "ALL_CLIENTS_FAILED",
      "所有物流商客户端查询失败"
    );
  }

  /**
   * 获取缓存中的轨迹信息
   */
  private getFromCache(key: string): TrackingCacheItem | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (new Date() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item;
  }

  /**
   * 添加轨迹信息到缓存
   */
  private addToCache(key: string, trackingInfo: ShipmentTracking): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.cacheTTL * 1000);

    const cacheItem: TrackingCacheItem = {
      trackingNumber: trackingInfo.trackingNumber,
      carrier: trackingInfo.carrier,
      trackingInfo,
      cachedAt: now,
      expiresAt,
    };

    this.cache.set(key, cacheItem);

    // 清理过期缓存
    this.cleanupExpiredCache();
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = new Date();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(
    code: string,
    message: string
  ): UnifiedTrackingResponse {
    return {
      success: false,
      error: {
        code,
        message,
      },
      requestId: "error_" + Date.now().toString(),
      timestamp: new Date(),
    };
  }

  /**
   * 获取支持的物流商列表
   */
  getSupportedCarriers(): LogisticsCarrier[] {
    const carriers = new Set<LogisticsCarrier>();

    for (const client of this.clients.values()) {
      client
        .getSupportedCarriers()
        .forEach((carrier: LogisticsCarrier) => carriers.add(carrier));
    }

    return Array.from(carriers);
  }

  /**
   * 获取服务状态信息
   */
  getServiceStatus(): {
    totalCarriers: number;
    enabledCarriers: LogisticsCarrier[];
    cacheSize: number;
    cacheEnabled: boolean;
  } {
    return {
      totalCarriers: this.clients.size,
      enabledCarriers: Array.from(this.clients.keys()),
      cacheSize: this.cache.size,
      cacheEnabled: this.config.cacheEnabled,
    };
  }
}
