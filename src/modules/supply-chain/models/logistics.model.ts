/**
 * 物流追踪系统数据模型
 * 支持多家物流商API集成和统一轨迹查询
 */

// 物流商枚?export enum LogisticsCarrier {
  SF_EXPRESS = 'sf_express', // 顺丰速运
  YTO = 'yto', // 圆通速?  ZTO = 'zto', // 中通快?  STO = 'sto', // 申通快?  EMS = 'ems', // EMS邮政速?  YUNDA = 'yunda', // 韵达快?  JD_LOGISTICS = 'jd_logistics', // 京东物流
  DHL = 'dhl', // DHL国际快?  FEDEX = 'fedex', // FedEx联邦快?  UPS = 'ups', // UPS联合包裹
  OTHER = 'other', // 其他
}

// 轨迹状态枚?export enum TrackingStatus {
  PENDING = 'pending', // 待揽?  COLLECTED = 'collected', // 已揽?  IN_TRANSIT = 'in_transit', // 运输?  OUT_FOR_DELIVERY = 'out_for_delivery', // 派送中
  DELIVERED = 'delivered', // 已签?  RETURNED = 'returned', // 已退?  EXCEPTION = 'exception', // 异常
  FAILED = 'failed', // 投递失?}

// 轨迹节点接口
export interface TrackingNode {
  timestamp: Date; // 时间?  location: string; // 位置信息
  status: TrackingStatus; // 状?  description: string; // 描述信息
  operator?: string; // 操作?  contact?: string; // 联系方式
}

// 轨迹信息接口
export interface ShipmentTracking {
  trackingNumber: string; // 运单?  carrier: LogisticsCarrier; // 物流?  carrierName: string; // 物流商名?  status: TrackingStatus; // 当前状?  origin: string; // 发货?  destination: string; // 目的?  estimatedDelivery?: Date; // 预计送达时间
  actualDelivery?: Date; // 实际送达时间
  timeline: TrackingNode[]; // 轨迹时间?  lastUpdated: Date; // 最后更新时?  isDelivered: boolean; // 是否已送达
  exceptionInfo?: string; // 异常信息
}

// 统一追踪响应接口
export interface UnifiedTrackingResponse {
  success: boolean; // 是否成功
  tracking?: ShipmentTracking; // 轨迹信息
  error?: {
    code: string; // 错误?    message: string; // 错误信息
    details?: any; // 详细信息
  };
  requestId: string; // 请求ID
  timestamp: Date; // 时间?}

// 物流商配置接?export interface CarrierConfig {
  carrier: LogisticsCarrier; // 物流?  apiKey: string; // API密钥
  apiSecret?: string; // API密钥（部分服务商需要）
  customerId?: string; // 客户ID（部分服务商需要）
  endpoint?: string; // API端点
  isEnabled: boolean; // 是否启用
  timeout: number; // 超时时间（毫秒）
  retryAttempts: number; // 重试次数
}

// 物流商客户端接口
export interface LogisticsCarrierClient {
  /**
   * 获取物流商名?   */
  getCarrierName(): string;

  /**
   * 验证运单号格?   */
  validateTrackingNumber(trackingNumber: string): boolean;

  /**
   * 查询轨迹信息
   */
  getTrackingInfo(trackingNumber: string): Promise<UnifiedTrackingResponse>;

  /**
   * 批量查询轨迹信息
   */
  getBatchTrackingInfo(
    trackingNumbers: string[]
  ): Promise<UnifiedTrackingResponse[]>;

  /**
   * 获取支持的物流商
   */
  getSupportedCarriers(): LogisticsCarrier[];
}

// 查询请求DTO
export interface TrackShipmentDTO {
  trackingNumber: string; // 运单?  carrier?: LogisticsCarrier; // 指定物流商（可选）
  autoDetect?: boolean; // 自动识别物流?}

// 批量查询请求DTO
export interface BatchTrackDTO {
  trackingNumbers: string[]; // 运单号列?  carrier?: LogisticsCarrier; // 指定物流商（可选）
}

// 物流追踪服务配置
export interface LogisticsTrackingConfig {
  defaultTimeout: number; // 默认超时时间
  maxRetryAttempts: number; // 最大重试次?  autoDetectEnabled: boolean; // 是否启用自动识别
  cacheEnabled: boolean; // 是否启用缓存
  cacheTTL: number; // 缓存有效期（秒）
  carriers: CarrierConfig[]; // 物流商配置列?}

// 轨迹缓存?export interface TrackingCacheItem {
  trackingNumber: string;
  carrier: LogisticsCarrier;
  trackingInfo: ShipmentTracking;
  cachedAt: Date;
  expiresAt: Date;
}

// 物流商识别结?export interface CarrierDetectionResult {
  carrier: LogisticsCarrier;
  confidence: number; // 置信?0-1)
  isValidFormat: boolean;
}
